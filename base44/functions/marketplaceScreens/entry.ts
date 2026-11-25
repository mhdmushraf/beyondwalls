import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { resolveMediaUrl } from "../../shared/portalAuth.ts";
import { addDays, dubaiToday, holdsSlot, isBookable, list, loadSettings, overlaps, screenPrice, slotsFor } from "../../shared/marketplace.ts";

/**
 * Marketplace listing: bookable venue screens with price and free ad slots for a date range.
 * Body: { start_date?: 'YYYY-MM-DD', weeks?: number }
 * Only public, non-sensitive fields are returned.
 */
export default async function (req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const svc = base44.asServiceRole.entities;
    const settings = await loadSettings(svc);

    const today = dubaiToday();
    const start = /^\d{4}-\d{2}-\d{2}$/.test(body.start_date || "") && body.start_date >= today ? body.start_date : today;
    const weeks = Math.min(Math.max(Number(body.weeks) || 1, 1), 12);
    const end = addDays(start, weeks * 7 - 1);

    const [screens, venues, bookings] = await Promise.all([
      svc.Screen.filter({ marketplace_enabled: true }, { limit: 2000 }).then(list),
      svc.Venue.filter({ approval_status: "approved" }, { limit: 2000 }).then(list),
      svc.AdBooking.list({ sort: "-created_date", limit: 5000 }).then(list),
    ]);
    const venueById = new Map(venues.map((v: any) => [v.id, v]));

    const out: any[] = [];
    for (const s of screens) {
      const v = venueById.get(s.venue_id);
      if (!isBookable(s, v)) continue;
      const taken = bookings.filter((b: any) => b.screen_id === s.id && holdsSlot(b) && overlaps(b.start_date, b.end_date, start, end)).length;
      const slots = slotsFor(s);
      const photo = v.image_url || (v.photo_urls || [])[0] || s.screen_image_url || "";
      out.push({
        id: s.id,
        name: s.name,
        position_label: s.position_label || "",
        orientation: s.orientation || "landscape",
        is_online: !!s.is_online,
        price_per_week: screenPrice(s, settings),
        slot_seconds: Number(s.slot_duration) || 15,
        slots,
        slots_free: Math.max(slots - taken, 0),
        photo_url: photo ? await resolveMediaUrl(base44, photo).catch(() => "") : "",
        venue: {
          id: v.id, name: v.name, latitude: Number(v.latitude) || null, longitude: Number(v.longitude) || null, venue_type: v.venue_type || "", emirate: v.emirate || v.city || "", area: v.city || "",
          weekly_footfall: Number(v.weekly_footfall) || (Number(v.daily_footfall) || Number(v.daily_customers) || 0) * 7,
          audience_age_group: v.audience_age_group || "", avg_dwell_time_minutes: v.avg_dwell_time_minutes || v.avg_stay_minutes || null,
        },
      });
    }
    out.sort((a, b) => b.venue.weekly_footfall - a.venue.weekly_footfall);
    return Response.json({ start_date: start, end_date: end, weeks, vat_pct: settings.vatPct, screens: out });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}
