import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { list, markInvoicePaid, paymobConfig, paymobHmacOk } from "../../shared/marketplace.ts";

/**
 * Paymob callbacks.
 *  - POST from Paymob (Transaction Processed): JSON { type: "TRANSACTION", obj }, ?hmac=… in the URL.
 *  - POST from our own return page: { mode: "return", params: {…query string from Paymob redirect…} }.
 * Both are verified with PAYMOB_HMAC_SECRET before anything is marked paid,
 * and the paid amount must match the invoice total.
 */
async function findInvoice(svc: any, merchantRef: string, invoiceId?: string) {
  if (invoiceId) {
    const inv = await svc.Invoice.get(invoiceId).catch(() => null);
    if (inv) return inv;
  }
  const number = String(merchantRef || "").split("_")[0];
  if (!number) return null;
  return list(await svc.Invoice.filter({ number }, { limit: 1 }))[0] || null;
}

export default async function (req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole.entities;
    const cfg = paymobConfig();
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));

    // Our return page passing on Paymob's redirect parameters.
    if (body.mode === "return") {
      const p = body.params || {};
      const ok = await paymobHmacOk(cfg.hmacSecret, p, p.hmac, true);
      if (!ok) return Response.json({ status: "unverified" });
      const success = String(p.success) === "true" && String(p.pending) !== "true";
      const inv = await findInvoice(svc, p.merchant_order_id, body.invoice_id);
      if (!inv) return Response.json({ status: "unknown_invoice" });
      if (!success) return Response.json({ status: inv.status === "paid" ? "paid" : "failed", message: p["data.message"] || "" });
      if (Math.round(Number(inv.total) * 100) !== Number(p.amount_cents)) return Response.json({ status: "amount_mismatch" });
      await markInvoicePaid(svc, inv, `paymob:${p.id}`, "card");
      return Response.json({ status: "paid", invoice_number: inv.number });
    }

    // Paymob server-to-server callback.
    const obj = body.obj || {};
    const ok = await paymobHmacOk(cfg.hmacSecret, obj, url.searchParams.get("hmac") || "", false);
    if (!ok) return Response.json({ error: "bad hmac" }, { status: 401 });
    if (body.type && body.type !== "TRANSACTION") return Response.json({ ignored: true });
    const success = obj.success === true && obj.pending === false && !obj.is_voided && !obj.is_refunded;
    if (!success) return Response.json({ received: true, paid: false });
    const ref = obj.order?.merchant_order_id || obj.payment_key_claims?.extra?.invoice_number || "";
    const inv = await findInvoice(svc, ref, obj.payment_key_claims?.extra?.invoice_id);
    if (!inv) return Response.json({ received: true, error: "unknown invoice" });
    if (Math.round(Number(inv.total) * 100) !== Number(obj.amount_cents)) {
      console.error("paymob amount mismatch", inv.number, inv.total, obj.amount_cents);
      return Response.json({ received: true, error: "amount mismatch" });
    }
    await markInvoicePaid(svc, inv, `paymob:${obj.id}`, "card");
    return Response.json({ received: true, paid: true });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}
