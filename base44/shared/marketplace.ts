import { notifyUsers } from "./notify.ts";

/**
 * Shared marketplace rules: which screens can be booked, prices, availability.
 * Prices are always computed on the server — never trust a price from the browser.
 */

export function list(page: any) {
  return Array.isArray(page) ? page : page?.items || [];
}
export const r2 = (n: number) => Math.round(n * 100) / 100;

export const DEFAULT_PRICE_PER_WEEK = 150;
export const DEFAULT_AD_SLOTS = 6;

export async function loadSettings(svc: any) {
  const s = list(await svc.PlatformSettings.filter({ key: "main" }, { limit: 1 }))[0] || {};
  return {
    venueSharePct: Number(s.venue_share_pct ?? 70),
    vatPct: Number(s.vat_pct ?? 0),
    prefix: s.invoice_prefix || "BW",
    defaultPrice: Number(s.default_price_per_week ?? DEFAULT_PRICE_PER_WEEK),
    company: { name: s.company_name || "Linkzone Global FZ-LLC" },
  };
}

export function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function dubaiToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai" }).format(new Date());
}

export function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart <= bEnd && bStart <= aEnd;
}

/** A screen is bookable when the venue opted in, it is paired, shows ads, and the venue is approved. */
export function isBookable(screen: any, venue: any) {
  if (!screen || !venue) return false;
  if (screen.marketplace_enabled !== true) return false;
  if (!screen.paired_device_id) return false;
  if ((screen.mode || "signage_ads") === "signage_only") return false;
  if (screen.status === "inactive") return false;
  if (venue.approval_status !== "approved") return false;
  return true;
}

export function screenPrice(screen: any, settings: any) {
  const p = Number(screen.price_per_week);
  return p > 0 ? p : settings.defaultPrice;
}

export function slotsFor(screen: any) {
  const n = Number(screen.public_ad_slots);
  return n > 0 ? n : DEFAULT_AD_SLOTS;
}

/** Bookings that hold a slot: paid/active ones, and unpaid ones less than 3 days old. */
export function holdsSlot(b: any) {
  if (b.status === "active" || b.status === "paused") return true;
  if (b.status === "pending_payment") {
    const age = Date.now() - new Date(b.created_date || 0).getTime();
    return age < 3 * 86400000;
  }
  return false;
}

export async function nextInvoiceNumber(svc: any, prefix: string) {
  const now = new Date();
  const ym = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const all = list(await svc.Invoice.list({ limit: 5000 }));
  const seq = all.filter((i: any) => String(i.number || "").startsWith(`${prefix}-${ym}`)).length + 1;
  return { number: `${prefix}-${ym}-${String(seq).padStart(4, "0")}`, period: `${ym.slice(0, 4)}-${ym.slice(4)}` };
}

/** Marks an invoice paid and switches its campaign + bookings live. Safe to call twice. */
export async function markInvoicePaid(svc: any, invoice: any, ref: string, method = "bank_transfer") {
  if (!invoice || invoice.status === "paid") return { already: true };
  await svc.Invoice.update(invoice.id, { status: "paid", paid_at: new Date().toISOString(), payment_ref: String(ref || "").slice(0, 80), payment_method: method });
  if (invoice.campaign_id) {
    const bookings = list(await svc.AdBooking.filter({ campaign_id: invoice.campaign_id }, { limit: 200 }));
    for (const b of bookings) if (b.status === "pending_payment") await svc.AdBooking.update(b.id, { status: "active" });
    await svc.Campaign.update(invoice.campaign_id, { payment_status: "paid", status: "active" });
    const venueMembers = [...new Set(bookings.flatMap((b: any) => b.venue_member_user_ids || []))];
    const pendingReview = bookings.some((b: any) => b.creative_status === "pending_review");
    await notifyUsers(svc, venueMembers as string[], {
      type: "new_booking", title: "New paid ad booking",
      message: `${bookings[0]?.advertiser_org_name || "An advertiser"} paid for ads on your screens.${pendingReview ? " Review the ad so it can start." : ""}`,
      link: "/app/ad-requests", reference_id: invoice.campaign_id,
    });
  }
  await notifyUsers(svc, invoice.org_member_user_ids || [], {
    type: "payment_received", title: `Payment received · ${invoice.number}`,
    message: `Thanks — AED ${invoice.total} is paid. Your ads go live on their start date once venues approve them.`,
    link: "/app/campaigns", reference_id: invoice.id, org_id: invoice.org_id,
  });
  return { already: false };
}

/* ---------------------------------- Paymob ---------------------------------- */

export function paymobConfig() {
  const env = (k: string) => (Deno.env.get(k) || "").trim();
  return {
    base: env("PAYMOB_BASE_URL") || "https://uae.paymob.com",
    secretKey: env("PAYMOB_SECRET_KEY"),
    publicKey: env("PAYMOB_PUBLIC_KEY"),
    hmacSecret: env("PAYMOB_HMAC_SECRET"),
    integrationIds: env("PAYMOB_INTEGRATION_IDS").split(",").map((x) => x.trim()).filter(Boolean).map((x) => (/^\d+$/.test(x) ? Number(x) : x)),
  };
}

const HMAC_FIELDS = [
  "amount_cents", "created_at", "currency", "error_occured", "has_parent_transaction", "id", "integration_id",
  "is_3d_secure", "is_auth", "is_capture", "is_refunded", "is_standalone_payment", "is_voided", "order.id",
  "owner", "pending", "source_data.pan", "source_data.sub_type", "source_data.type", "success",
];

async function hmacHex(secret: string, text: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-512" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(text));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** obj = nested POST callback object, or flat GET params (order.id → order, source_data.pan → source_data.pan). */
export async function paymobHmacOk(secret: string, obj: any, received: string, flat = false) {
  if (!secret || !received) return false;
  const get = (path: string) => {
    if (flat) {
      if (path === "order.id") return obj.order ?? obj.order_id;
      return obj[path];
    }
    return path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
  };
  const text = HMAC_FIELDS.map((f) => { const v = get(f); return v === null || v === undefined ? "" : String(v); }).join("");
  const mine = await hmacHex(secret, text);
  return mine.toLowerCase() === String(received).toLowerCase();
}
