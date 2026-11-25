import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { getSessionUser } from "../../shared/portalAuth.ts";
import { paymobConfig } from "../../shared/marketplace.ts";

/**
 * Starts a Paymob (UAE) card payment for one issued invoice.
 * Body: { invoice_id, origin }  → { checkout_url }
 * Needs secrets: PAYMOB_SECRET_KEY, PAYMOB_PUBLIC_KEY, PAYMOB_INTEGRATION_IDS (comma list), PAYMOB_HMAC_SECRET.
 * Optional: PAYMOB_BASE_URL (default https://uae.paymob.com).
 */
const APP_ID = "69b31183956b052c51ee3a67";
const fail = (error: string, status = 400) => Response.json({ error }, { status });

export default async function (req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await getSessionUser(base44);
    if (!user) return fail("Your session has ended. Sign in again.", 401);
    const cfg = paymobConfig();
    if (!cfg.secretKey || !cfg.publicKey || !cfg.integrationIds.length) {
      return fail("Card payments aren't switched on yet. Pay by bank transfer for now, or WhatsApp us.", 503);
    }
    const body = await req.json().catch(() => ({}));
    const svc = base44.asServiceRole.entities;
    const inv = await svc.Invoice.get(String(body.invoice_id || "")).catch(() => null);
    if (!inv) return fail("Invoice not found.", 404);
    if (!(inv.org_member_user_ids || []).includes(user.id) && user.role !== "admin") return fail("This invoice belongs to another business.", 403);
    if (inv.status === "paid") return fail("This invoice is already paid.", 409);
    if (inv.status !== "issued") return fail("This invoice was cancelled — book again to get a new one.", 409);
    const cents = Math.round(Number(inv.total || 0) * 100);
    if (cents <= 0) return fail("Nothing to pay on this invoice.");

    const origin = /^https:\/\/[a-z0-9.-]+$/i.test(String(body.origin || "")) ? body.origin : new URL(req.url).origin;
    const names = String(user.full_name || "Beyond Walls customer").trim().split(/\s+/);
    // Items must add up exactly to the amount, so one line for the whole invoice.
    const payload = {
      amount: cents,
      currency: inv.currency || "AED",
      payment_methods: cfg.integrationIds,
      items: [{ name: `Invoice ${inv.number}`.slice(0, 50), amount: cents, description: (inv.kind === "marketplace" ? "Beyond Walls screen advertising" : "Beyond Walls").slice(0, 255), quantity: 1 }],
      billing_data: {
        first_name: names[0] || "Customer", last_name: names.slice(1).join(" ") || "-",
        email: user.email || "na@beyondwalls.ae", phone_number: user.phone || "+971000000000",
        apartment: "NA", street: "NA", building: "NA", floor: "NA", city: "Dubai", state: "Dubai", country: "AE", postal_code: "00000",
      },
      special_reference: `${inv.number}_${Date.now()}`,
      notification_url: `${origin}/api/apps/${APP_ID}/functions/paymobWebhook`,
      redirection_url: `${origin}/app/pay/return?invoice=${inv.id}`,
      extras: { invoice_id: inv.id, invoice_number: inv.number },
    };

    const res = await fetch(`${cfg.base}/v1/intention/`, {
      method: "POST",
      headers: { Authorization: `Token ${cfg.secretKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.client_secret) {
      console.error("paymob intention failed", res.status, JSON.stringify(data).slice(0, 500));
      return fail("The card payment page couldn't open. Try again in a minute, or pay by bank transfer.", 502);
    }
    await svc.Invoice.update(inv.id, { payment_ref: `paymob:${data.id || payload.special_reference}` });
    return Response.json({ checkout_url: `${cfg.base}/unifiedcheckout/?publicKey=${encodeURIComponent(cfg.publicKey)}&clientSecret=${encodeURIComponent(data.client_secret)}` });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}
