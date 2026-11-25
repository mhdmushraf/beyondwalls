import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { getSessionUser, logActivity } from "../../shared/portalAuth.ts";
import { notifyUsers } from "../../shared/notify.ts";
import {
  addDays, dubaiToday, holdsSlot, isBookable, list, loadSettings, nextInvoiceNumber, overlaps, r2, screenPrice, slotsFor,
} from "../../shared/marketplace.ts";

/**
 * Advertiser books ad slots on venue screens.
 * Body: { org_id, name, goal?, description?, start_date, weeks, screen_ids[], creative_url, creative_type }
 * Creates: Campaign (unpaid) + one AdBooking per screen + one marketplace Invoice (bank transfer).
 * Prices, venue share and VAT are computed here from PlatformSettings and the screens.
 */
const bad = (error: string, field?: string, status = 400) => Response.json({ error, field }, { status });

export default async function (req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await getSessionUser(base44);
    if (!user) return bad("Your session has ended. Sign in again.", undefined, 401);
    const body = await req.json().catch(() => ({}));
    const svc = base44.asServiceRole.entities;
    const settings = await loadSettings(svc);

    const org = await svc.Organization.get(String(body.org_id || "")).catch(() => null);
    if (!org) return bad("Pick the business you are booking for.", "org_id", 404);
    const members: string[] = org.member_user_ids || [];
    if (!members.includes(user.id) && user.role !== "admin") return bad("You're not a member of this business.", "org_id", 403);
    if (org.status === "suspended" || org.status === "rejected") return bad("This business can't book ads right now. Contact support.", "org_id", 403);

    const name = String(body.name || "").trim();
    if (!name) return bad("Give your campaign a name.", "name");
    if (name.length > 60) return bad("Campaign name is too long (60 characters max).", "name");

    const today = dubaiToday();
    const start = String(body.start_date || "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) return bad("Pick a start date.", "start_date");
    if (start < today) return bad("The start date can't be in the past.", "start_date");
    const weeks = Number(body.weeks);
    if (!Number.isInteger(weeks) || weeks < 1 || weeks > 12) return bad("Book between 1 and 12 weeks.", "weeks");
    const end = addDays(start, weeks * 7 - 1);

    const creativeUrl = String(body.creative_url || "").trim();
    const creativeType = body.creative_type === "video" ? "video" : "image";
    if (!creativeUrl) return bad("Upload your ad (image or video).", "creative_url");

    let client: any = null;
    if (body.client_id) {
      client = await svc.Client.get(String(body.client_id)).catch(() => null);
      if (!client || client.agency_org_id !== org.id) return bad("That client isn't one of your agency's clients.", "client_id", 403);
      if (client.status === "archived") return bad("That client is archived. Restore it first.", "client_id");
    }

    const ids: string[] = [...new Set((Array.isArray(body.screen_ids) ? body.screen_ids : []).map(String))];
    if (!ids.length) return bad("Pick at least one screen.", "screen_ids");
    if (ids.length > 50) return bad("Book up to 50 screens at a time.", "screen_ids");

    const screens = await Promise.all(ids.map((id) => svc.Screen.get(id).catch(() => null)));
    const venueIds = [...new Set(screens.filter(Boolean).map((s: any) => s.venue_id))];
    const venues = await Promise.all(venueIds.map((id) => svc.Venue.get(id).catch(() => null)));
    const venueById = new Map(venues.filter(Boolean).map((v: any) => [v.id, v]));
    const venueOrgIds = [...new Set(venues.filter(Boolean).map((v: any) => v.org_id))];
    const venueOrgs = await Promise.all(venueOrgIds.map((id) => svc.Organization.get(id).catch(() => null)));
    const venueOrgById = new Map(venueOrgs.filter(Boolean).map((o: any) => [o.id, o]));

    const allBookings = list(await svc.AdBooking.list({ sort: "-created_date", limit: 5000 }));
    const problems: string[] = [];
    screens.forEach((s: any, i: number) => {
      const v = s && venueById.get(s.venue_id);
      if (!s || !isBookable(s, v)) { problems.push(`${s?.name || ids[i]} is no longer available`); return; }
      const taken = allBookings.filter((b: any) => b.screen_id === s.id && holdsSlot(b) && overlaps(b.start_date, b.end_date, start, end)).length;
      if (taken >= slotsFor(s)) problems.push(`${s.name} at ${v.name} is full for these dates`);
    });
    if (problems.length) return Response.json({ error: `${problems.join('; ')}. Remove ${problems.length === 1 ? 'it' : 'them'} or pick other dates.`, field: "screen_ids", unavailable: problems }, { status: 409 });

    // Platform share per venue business: its own commission_rate (Connect partners 15, partner venues 40/50), else the default.
    const pctFor = (orgId: string) => {
      const o: any = venueOrgById.get(orgId);
      const n = Number(o?.commission_rate);
      return Number.isFinite(n) && n >= 0 && n <= 100 && o?.commission_rate !== undefined && o?.commission_rate !== null ? n : 100 - settings.venueSharePct;
    };
    const lines: any[] = [];
    const forClient = client ? ` · for ${client.name}` : "";
    const rows = screens.map((s: any) => {
      const v = venueById.get(s.venue_id);
      const platformPct = pctFor(v.org_id);
      const price = screenPrice(s, settings);
      const total = r2(price * weeks);
      const fee = r2((total * platformPct) / 100);
      lines.push({
        description: `Screen ad · ${v.name} · ${s.name} · ${weeks} wk (${start} → ${end})${forClient}`,
        description_ar: `إعلان على شاشة · ${v.name} · ${weeks} أسبوع`,
        qty: weeks, unit_price: price, amount: total,
      });
      return { s, v, price, total, fee, platformPct };
    });
    const subtotal = r2(rows.reduce((a, r) => a + r.total, 0));
    const vat = r2((subtotal * settings.vatPct) / 100);
    const grand = r2(subtotal + vat);

    const campaign = await svc.Campaign.create({
      name, goal: body.goal || "brand_awareness", client_id: client?.id || "", client_name: client?.name || "", deal_type: "marketplace", description: String(body.description || "").slice(0, 1000),
      org_id: org.id, org_name: org.name, advertiser_email: user.email, advertiser_member_user_ids: members,
      status: "pending_approval", payment_status: "unpaid", approval_status: "pending",
      start_date: start, end_date: end, weeks, subtotal, vat, total_budget: grand,
      selected_screens: ids, creative_urls: [creativeUrl], creative_type: creativeType,
    });

    const { number, period } = await nextInvoiceNumber(svc, settings.prefix);
    const issued = new Date();
    const invoice = await svc.Invoice.create({
      org_id: org.id, org_member_user_ids: members, org_name: org.name, org_trn: org.trn || "",
      number, period, kind: "marketplace", campaign_id: campaign.id, payment_method: "bank_transfer",
      lines, subtotal, vat_pct: settings.vatPct, vat, total: grand, currency: "AED",
      status: "issued", issued_at: issued.toISOString(), due_at: new Date(Math.min(issued.getTime() + 3 * 86400000, new Date(`${start}T00:00:00+04:00`).getTime())).toISOString(),
    });

    const bookings = [];
    for (const r of rows) {
      const venueOrg: any = venueOrgById.get(r.v.org_id) || {};
      const auto = venueOrg.auto_approve_creative === true;
      bookings.push(await svc.AdBooking.create({
        campaign_id: campaign.id, campaign_name: name, invoice_id: invoice.id, deal_type: "marketplace", client_id: client?.id || "", client_name: client?.name || "",
        screen_id: r.s.id, screen_name: r.s.name, venue_id: r.v.id, venue_name: r.v.name,
        org_id: r.v.org_id, venue_member_user_ids: r.v.org_member_user_ids || [], venue_owner_email: r.v.owner_email || "",
        advertiser_email: user.email, advertiser_org_id: org.id, advertiser_org_name: client ? `${client.name} (via ${org.name})` : org.name, advertiser_member_user_ids: members,
        creative_url: creativeUrl, creative_type: creativeType,
        start_date: start, end_date: end, weeks, slots_booked: 1, price_per_week: r.price, total_amount: r.total,
        commission_rate_snapshot: r.platformPct, platform_fee: r.fee, venue_earnings: r2(r.total - r.fee),
        status: "pending_payment", creative_status: auto ? "approved" : "pending_review",
        ...(auto ? { creative_reviewed_at: issued.toISOString(), creative_reviewed_by: "auto" } : {}),
      }));
    }
    await svc.Campaign.update(campaign.id, { invoice_id: invoice.id });
    const byVenueOrg = new Map<string, any[]>();
    bookings.forEach((b: any) => { if (!byVenueOrg.has(b.org_id)) byVenueOrg.set(b.org_id, []); byVenueOrg.get(b.org_id)!.push(b); });
    for (const [vOrg, list2] of byVenueOrg) {
      const review = list2.filter((b: any) => b.creative_status === "pending_review").length;
      await notifyUsers(svc, list2[0].venue_member_user_ids || [], {
        type: review ? "ad_review" : "new_booking", org_id: vOrg,
        title: review ? `New ad to review · ${org.name}` : `New booking · ${org.name}`,
        message: `${org.name} booked ${list2.length} of your screens for ${weeks} wk from ${start}.${review ? " Approve or reject the ad." : ""} It starts once they pay.`,
        link: "/app/ad-requests", reference_id: campaign.id,
      });
    }

    await logActivity(base44, {
      orgId: org.id, memberIds: members, userEmail: user.email, action: "campaign_booked",
      targetType: "Campaign", targetId: campaign.id, details: `${ids.length} screens · ${weeks} wk · AED ${grand}`,
    });

    return Response.json({ campaign: { ...campaign, invoice_id: invoice.id }, invoice, bookings });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}
