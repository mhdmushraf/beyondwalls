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
