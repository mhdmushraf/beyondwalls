import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { getSessionUser } from "../../shared/portalAuth.ts";
import { dubaiToday, list, r2 } from "../../shared/marketplace.ts";
import { adminIds, notifyUsers } from "../../shared/notify.ts";

/**
 * Venue earnings + payouts.
 *  summary  { org_id }                                   venue team → balances, history, last bank details
 *  request  { org_id, bank_name, account_holder_name, iban, swift_code? }   venue team
 *  mark_paid { payout_id, reference }                    admin
 *  reject   { payout_id, reason }                        admin
 * Earnings become available once a paid booking's dates have finished.
 */
const MIN_PAYOUT = 100;
const fail = (error: string, status = 400, field?: string) => Response.json({ error, field }, { status });

export default async function (req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await getSessionUser(base44);
    if (!user) return fail("Your session has ended. Sign in again.", 401);
    const isAdmin = user.role === "admin";
    const body = await req.json().catch(() => ({}));
    const svc = base44.asServiceRole.entities;
    const action = String(body.action || "summary");

    if (action === "mark_paid" || action === "reject") {
      if (!isAdmin) return fail("Only Beyond Walls admins can do this.", 403);
      const p = await svc.PayoutRequest.get(String(body.payout_id || "")).catch(() => null);
      if (!p) return fail("Payout not found.", 404);
      if (p.status === "paid") return fail("Already paid.");
      const now = new Date().toISOString();
      if (action === "mark_paid") {
        const ref = String(body.reference || "").trim();
        if (!ref) return fail("Add the bank transfer reference.", 400, "reference");
        await svc.PayoutRequest.update(p.id, { status: "paid", reference_id: ref.slice(0, 80), processed_date: now });
        await notifyUsers(svc, p.org_member_user_ids || [], { type: "payout_processed", title: `Payout sent · AED ${p.amount}`, message: `We've sent AED ${p.amount} to your account ending ${String(p.iban || "").slice(-4)}. Reference ${ref}. It usually lands within 1–2 working days.`, link: "/app/ad-requests", org_id: p.org_id });
      } else {
        const reason = String(body.reason || "").trim();
        if (reason.length < 5) return fail("Say why, so the venue can fix it.", 400, "reason");
        await svc.PayoutRequest.update(p.id, { status: "rejected", admin_notes: reason.slice(0, 300), processed_date: now });
        for (const id of p.booking_ids || []) await svc.AdBooking.update(id, { payout_id: "" }).catch(() => null);
        await notifyUsers(svc, p.org_member_user_ids || [], { type: "payout_processed", title: "Payout needs attention", message: `We couldn't send your payout: ${reason.slice(0, 160)}. Your earnings are still available — request again with the right details.`, link: "/app/ad-requests", org_id: p.org_id });
      }
      return Response.json({ ok: true });
    }

    const org = await svc.Organization.get(String(body.org_id || "")).catch(() => null);
    if (!org) return fail("Business not found.", 404);
    const members: string[] = org.member_user_ids || [];
    if (!members.includes(user.id) && !isAdmin) return fail("You're not a member of this business.", 403);

    // Close finished bookings so their money becomes available.
    const today = dubaiToday();
    const bookings = list(await svc.AdBooking.filter({ org_id: org.id }, { limit: 2000 }));
    for (const b of bookings) {
      if (b.status === "active" && b.end_date && b.end_date < today) { await svc.AdBooking.update(b.id, { status: "completed" }); b.status = "completed"; }
    }
    const available = bookings.filter((b: any) => b.status === "completed" && !b.payout_id && b.deal_type !== "direct");
    const running = bookings.filter((b: any) => (b.status === "active" || b.status === "paused") && b.deal_type !== "direct");
    const waiting = bookings.filter((b: any) => b.status === "pending_payment" && b.creative_status !== "rejected");
    const sum = (arr: any[]) => r2(arr.reduce((a, b) => a + (Number(b.venue_earnings) || 0), 0));
    const payouts = list(await svc.PayoutRequest.filter({ org_id: org.id }, { sort: "-created_date", limit: 50 }));

    if (action === "summary") {
      const last = payouts.find((p: any) => p.iban) || {};
      return Response.json({
        available: sum(available), available_count: available.length,
        running: sum(running), waiting: sum(waiting),
        paid_out: r2(payouts.filter((p: any) => p.status === "paid").reduce((a: number, p: any) => a + (Number(p.amount) || 0), 0)),
        in_progress: r2(payouts.filter((p: any) => p.status === "pending" || p.status === "approved").reduce((a: number, p: any) => a + (Number(p.amount) || 0), 0)),
        min_payout: MIN_PAYOUT,
        payouts: payouts.map((p: any) => ({ id: p.id, amount: p.amount, status: p.status, created_date: p.created_date, processed_date: p.processed_date, reference_id: p.reference_id, admin_notes: p.admin_notes, iban_last4: String(p.iban || "").slice(-4) })),
        last_bank: { bank_name: last.bank_name || "", account_holder_name: last.account_holder_name || org.name || "", iban: last.iban || "", swift_code: last.swift_code || "" },
      });
    }

    if (action === "request") {
      const amount = sum(available);
      if (amount < MIN_PAYOUT) return fail(`You can request a payout from AED ${MIN_PAYOUT}. Available now: AED ${amount}.`);
      if (payouts.some((p: any) => p.status === "pending" || p.status === "approved")) return fail("You already have a payout on its way. You can request again once it's paid.");
      const holder = String(body.account_holder_name || "").trim();
      const bank = String(body.bank_name || "").trim();
      const iban = String(body.iban || "").replace(/\s+/g, "").toUpperCase();
      if (!holder) return fail("Account holder name is required.", 400, "account_holder_name");
      if (!bank) return fail("Bank name is required.", 400, "bank_name");
      if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return fail("That IBAN doesn't look right. UAE IBANs start with AE and have 23 characters.", 400, "iban");
      if (iban.startsWith("AE") && iban.length !== 23) return fail(`UAE IBANs have 23 characters — you typed ${iban.length}.`, 400, "iban");
      const p = await svc.PayoutRequest.create({
        org_id: org.id, org_name: org.name, org_member_user_ids: members, kind: "venue",
        venue_owner_email: user.email, requested_by_email: user.email,
        amount, eligible_snapshot: amount, booking_ids: available.map((b: any) => b.id),
        bank_name: bank.slice(0, 80), account_holder_name: holder.slice(0, 80), iban, swift_code: String(body.swift_code || "").trim().toUpperCase().slice(0, 11),
        status: "pending",
      });
      for (const b of available) await svc.AdBooking.update(b.id, { payout_id: p.id });
      await notifyUsers(svc, await adminIds(svc), { type: "payout_requested", title: `Payout request · ${org.name}`, message: `AED ${amount} from ${available.length} finished bookings.`, link: "/admin/marketplace", reference_id: p.id });
      return Response.json({ ok: true, payout: { id: p.id, amount } });
    }

    return fail("Unknown action.");
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}
