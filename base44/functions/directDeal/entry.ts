import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { getSessionUser, logActivity } from "../../shared/portalAuth.ts";
import { addDays, dubaiToday, holdsSlot, list, loadSettings, nextInvoiceNumber, overlaps, r2, slotsFor } from "../../shared/marketplace.ts";

/**
 * A venue sells an ad on its own screen to its own advertiser and collects the money itself.
 * Beyond Walls delivers and reports it, and invoices the venue the direct-deal fee (default 10%).
 * Body: { screen_id, advertiser_name, campaign_name, start_date, weeks, amount, creative_url, creative_type }
 */
const bad = (error: string, field?: string, status = 400) => Response.json({ error, field }, { status });

export default async function (req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await getSessionUser(base44);
    if (!user) return bad("Your session has ended. Sign in again.", undefined, 401);
    const body = await req.json().catch(() => ({}));
    const svc = base44.asServiceRole.entities;

    const screen = await svc.Screen.get(String(body.screen_id || "")).catch(() => null);
    if (!screen) return bad("Pick one of your screens.", "screen_id", 404);
    if (!(screen.org_member_user_ids || []).includes(user.id) && user.role !== "admin") return bad("That screen belongs to another business.", "screen_id", 403);
    if ((screen.mode || "signage_ads") === "signage_only") return bad("This screen is set to Signage only, so it shows no ads. Change its mode first.", "screen_id");
    const venue = await svc.Venue.get(screen.venue_id).catch(() => null);
    const org = await svc.Organization.get(screen.org_id).catch(() => null);
    if (!venue || !org) return bad("This screen isn't linked to a venue yet.", "screen_id");

    const advertiser = String(body.advertiser_name || "").trim();
    const name = String(body.campaign_name || "").trim() || `${advertiser} ad`;
    if (!advertiser) return bad("Who is the advertiser?", "advertiser_name");
    const today = dubaiToday();
    const start = String(body.start_date || "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) return bad("Pick a start date.", "start_date");
    if (start < today) return bad("The start date can't be in the past.", "start_date");
    const weeks = Number(body.weeks);
    if (!Number.isInteger(weeks) || weeks < 1 || weeks > 52) return bad("Between 1 and 52 weeks.", "weeks");
    const amount = r2(Number(body.amount));
    if (!(amount > 0)) return bad("Enter what the advertiser is paying you, in AED.", "amount");
    if (amount > 1000000) return bad("That amount looks too high — check it.", "amount");
    const creativeUrl = String(body.creative_url || "").trim();
    if (!creativeUrl) return bad("Upload the ad (image or video).", "creative_url");
    const end = addDays(start, weeks * 7 - 1);

    const taken = list(await svc.AdBooking.filter({ screen_id: screen.id }, { limit: 500 })).filter((b: any) => holdsSlot(b) && overlaps(b.start_date, b.end_date, start, end)).length;
    if (taken >= slotsFor(screen)) return bad("All ad slots on this screen are taken for these dates. Add slots in the screen's Marketplace settings, or pick other dates.", "start_date", 409);

    const settingsRow = list(await svc.PlatformSettings.filter({ key: "main" }, { limit: 1 }))[0] || {};
    const settings = await loadSettings(svc);
    const feePct = Number(settingsRow.direct_deal_fee_pct ?? 10);
    const fee = r2((amount * feePct) / 100);
    const members = org.member_user_ids || screen.org_member_user_ids || [];
    const creativeType = body.creative_type === "video" ? "video" : "image";

    const campaign = await svc.Campaign.create({
      name, goal: "other", org_id: org.id, org_name: advertiser, advertiser_email: user.email, advertiser_member_user_ids: members,
      deal_type: "direct", status: "active", payment_status: "paid", approval_status: "approved",
      start_date: start, end_date: end, weeks, subtotal: amount, vat: 0, total_budget: amount,
      selected_screens: [screen.id], creative_urls: [creativeUrl], creative_type: creativeType,
      admin_notes: `Direct deal by ${org.name}; venue collected AED ${amount}; fee ${feePct}% = AED ${fee}`,
    });

    const vat = r2((fee * settings.vatPct) / 100);
    const { number, period } = await nextInvoiceNumber(svc, settings.prefix);
    const issued = new Date();
    const invoice = await svc.Invoice.create({
      org_id: org.id, org_member_user_ids: members, org_name: org.name, number, period, kind: "other", campaign_id: campaign.id,
      lines: [{ description: `Direct deal fee ${feePct}% · ${advertiser} on ${screen.name} · ${weeks} wk (AED ${amount})`, description_ar: `رسوم صفقة مباشرة ${feePct}%`, qty: 1, unit_price: fee, amount: fee }],
      subtotal: fee, vat_pct: settings.vatPct, vat, total: r2(fee + vat), currency: "AED", status: "issued",
      issued_at: issued.toISOString(), due_at: new Date(issued.getTime() + 14 * 86400000).toISOString(),
    });

    const booking = await svc.AdBooking.create({
      campaign_id: campaign.id, campaign_name: name, deal_type: "direct", invoice_id: invoice.id,
      screen_id: screen.id, screen_name: screen.name, venue_id: venue.id, venue_name: venue.name,
      org_id: org.id, venue_member_user_ids: members, venue_owner_email: venue.owner_email || "",
      advertiser_email: user.email, advertiser_org_id: org.id, advertiser_org_name: advertiser, advertiser_member_user_ids: members,
      creative_url: creativeUrl, creative_type: creativeType, start_date: start, end_date: end, weeks,
      price_per_week: r2(amount / weeks), total_amount: amount, commission_rate_snapshot: feePct, platform_fee: fee, venue_earnings: r2(amount - fee),
      status: "active", creative_status: "approved", creative_reviewed_at: issued.toISOString(), creative_reviewed_by: user.email,
    });

    await logActivity(base44, { orgId: org.id, memberIds: members, userEmail: user.email, action: "direct_deal", targetType: "AdBooking", targetId: booking.id, details: `${advertiser} · AED ${amount} · fee ${fee}` });
    return Response.json({ booking, invoice, fee_pct: feePct, fee });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}
