import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { getSessionUser, logActivity } from "../../shared/portalAuth.ts";
import { list, markInvoicePaid, r2 } from "../../shared/marketplace.ts";
import { notifyUsers } from "../../shared/notify.ts";

/**
 * Marketplace actions.
 *  - approve_creative / reject_creative { booking_id, reason? }   venue team or admin
 *  - cancel_campaign { campaign_id }                              advertiser team (unpaid only) or admin
 *  - mark_paid { invoice_id, payment_ref? }                       admin
 *  - pause / resume { booking_id }                                admin
 */
const fail = (error: string, status = 400) => Response.json({ error }, { status });

async function recomputeInvoice(svc: any, invoiceId: string) {
  const inv = await svc.Invoice.get(invoiceId).catch(() => null);
  if (!inv || inv.status !== "issued") return inv;
  const live = list(await svc.AdBooking.filter({ invoice_id: invoiceId }, { limit: 200 })).filter((b: any) => b.status !== "cancelled");
  if (!live.length) { await svc.Invoice.update(inv.id, { status: "void" }); return { ...inv, status: "void" }; }
  const lines = live.map((b: any) => ({
    description: `Screen ad · ${b.venue_name} · ${b.screen_name} · ${b.weeks} wk (${b.start_date} → ${b.end_date})`,
    description_ar: `إعلان على شاشة · ${b.venue_name} · ${b.weeks} أسبوع`,
    qty: b.weeks, unit_price: b.price_per_week, amount: b.total_amount,
  }));
  const subtotal = r2(lines.reduce((a: number, l: any) => a + l.amount, 0));
  const vat = r2((subtotal * Number(inv.vat_pct || 0)) / 100);
  await svc.Invoice.update(inv.id, { lines, subtotal, vat, total: r2(subtotal + vat) });
  if (inv.campaign_id) await svc.Campaign.update(inv.campaign_id, { subtotal, vat, total_budget: r2(subtotal + vat) });
  return inv;
}

export default async function (req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await getSessionUser(base44);
    if (!user) return fail("Your session has ended. Sign in again.", 401);
    const isAdmin = user.role === "admin";
    const body = await req.json().catch(() => ({}));
    const svc = base44.asServiceRole.entities;
    const action = String(body.action || "");
    const now = new Date().toISOString();

    if (action === "approve_creative" || action === "reject_creative") {
      const b = await svc.AdBooking.get(String(body.booking_id || "")).catch(() => null);
      if (!b) return fail("Booking not found.", 404);
      if (!isAdmin && !(b.venue_member_user_ids || []).includes(user.id)) return fail("Only the venue's team can review this ad.", 403);
      if (b.status === "cancelled" || b.status === "completed") return fail("This booking is already closed.");
      if (action === "approve_creative") {
        await svc.AdBooking.update(b.id, { creative_status: "approved", creative_reviewed_at: now, creative_reviewed_by: user.email, creative_rejection_reason: "" });
      } else {
        const reason = String(body.reason || "").trim();
        if (reason.length < 5) return fail("Tell the advertiser why (at least a few words) so they can fix it.");
        const paid = b.status !== "pending_payment";
        await svc.AdBooking.update(b.id, {
          creative_status: "rejected", creative_reviewed_at: now, creative_reviewed_by: user.email, creative_rejection_reason: reason.slice(0, 300),
          status: paid ? "paused" : "cancelled",
        });
        if (!paid && b.invoice_id) await recomputeInvoice(svc, b.invoice_id);
        if (paid && b.campaign_id) {
          const c = await svc.Campaign.get(b.campaign_id).catch(() => null);
          if (c) await svc.Campaign.update(c.id, { admin_notes: `${c.admin_notes || ""}\nRefund or rebook due: AED ${b.total_amount} (${b.venue_name} rejected the ad: ${reason.slice(0, 120)})`.trim() });
        }
      }
      await logActivity(base44, { orgId: b.org_id, memberIds: b.venue_member_user_ids, userEmail: user.email, action, targetType: "AdBooking", targetId: b.id, details: body.reason || "" });
      await notifyUsers(svc, b.advertiser_member_user_ids || [], action === "approve_creative"
        ? { type: "ad_approved", title: `${b.venue_name} approved your ad`, message: `"${b.campaign_name}" ${b.status === "active" ? "is now playing" : "will play once paid, from " + b.start_date}.`, link: "/app/campaigns", reference_id: b.campaign_id, org_id: b.advertiser_org_id }
        : { type: "ad_rejected", title: `${b.venue_name} rejected your ad`, message: `Reason: ${String(body.reason || "").slice(0, 160)}. ${b.status === "pending_payment" ? "It's been removed from your invoice." : "We'll refund or move this booking."}`, link: "/app/campaigns", reference_id: b.campaign_id, org_id: b.advertiser_org_id });
      return Response.json({ ok: true, booking: await svc.AdBooking.get(b.id) });
    }

    if (action === "cancel_campaign") {
      const c = await svc.Campaign.get(String(body.campaign_id || "")).catch(() => null);
      if (!c) return fail("Campaign not found.", 404);
      if (!isAdmin && !(c.advertiser_member_user_ids || []).includes(user.id)) return fail("Only your business's team can cancel this campaign.", 403);
      if (c.payment_status === "paid" && !isAdmin) return fail("This campaign is paid and running. Contact support to stop it or get a refund.");
      const bookings = list(await svc.AdBooking.filter({ campaign_id: c.id }, { limit: 200 }));
      for (const b of bookings) if (b.status !== "completed") await svc.AdBooking.update(b.id, { status: "cancelled" });
      if (c.invoice_id) {
        const inv = await svc.Invoice.get(c.invoice_id).catch(() => null);
        if (inv && inv.status === "issued") await svc.Invoice.update(inv.id, { status: "void" });
      }
      await svc.Campaign.update(c.id, { status: "cancelled" });
      return Response.json({ ok: true });
    }

    if (action === "mark_paid") {
      if (!isAdmin) return fail("Only Beyond Walls admins can confirm payments.", 403);
      const inv = await svc.Invoice.get(String(body.invoice_id || "")).catch(() => null);
      if (!inv) return fail("Invoice not found.", 404);
      if (inv.status === "paid") return fail("This invoice is already paid.");
      if (inv.status === "void") return fail("This invoice was cancelled.");
      await markInvoicePaid(svc, inv, String(body.payment_ref || "bank transfer"), "bank_transfer");
      return Response.json({ ok: true });
    }

    if (action === "pause" || action === "resume") {
      if (!isAdmin) return fail("Only Beyond Walls admins can pause bookings.", 403);
      const b = await svc.AdBooking.get(String(body.booking_id || "")).catch(() => null);
      if (!b) return fail("Booking not found.", 404);
      await svc.AdBooking.update(b.id, { status: action === "pause" ? "paused" : "active" });
      return Response.json({ ok: true });
    }

    return fail("Unknown action.");
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}
