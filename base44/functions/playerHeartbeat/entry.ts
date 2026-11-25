import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { resolvePlayerScreen } from "../../shared/portalAuth.ts";

/** Public: player heartbeat every 60s. */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const token = String(body.device_token || "").trim();
    if (!token) return Response.json({ error: "device_token is required" }, { status: 400 });

    const resolved = await resolvePlayerScreen(base44, token);
    if (!resolved) return Response.json({ error: "screen_moved" }, { status: 409 });
    const { screen } = resolved;

    await base44.asServiceRole.entities.Screen.update(screen.id, {
      is_online: true,
      status: "active",
      last_heartbeat: new Date().toISOString(),
      current_item: String(body.current_item || "").slice(0, 200),
      uptime_seconds: Number(body.uptime_seconds || 0),
      player_version: String(body.player_version || "").slice(0, 40),
    });

    // Marketplace ad plays counted on the device since the last heartbeat.
    const plays = body.ad_plays && typeof body.ad_plays === "object" ? body.ad_plays : {};
    const svc = base44.asServiceRole.entities;
    const campaignAdds = {};
    for (const [bookingId, raw] of Object.entries(plays).slice(0, 50)) {
      const n = Math.min(Math.max(Math.floor(Number(raw) || 0), 0), 2000);
      if (!n) continue;
      const b = await svc.AdBooking.get(bookingId).catch(() => null);
      if (!b || b.screen_id !== screen.id) continue; // only this screen's own bookings count
      await svc.AdBooking.update(b.id, { plays: (Number(b.plays) || 0) + n, impressions: (Number(b.impressions) || 0) + n, last_played_at: new Date().toISOString() });
      if (b.campaign_id) campaignAdds[b.campaign_id] = (campaignAdds[b.campaign_id] || 0) + n;
    }
    for (const [cid, n] of Object.entries(campaignAdds)) {
      const c = await svc.Campaign.get(cid).catch(() => null);
      if (c) await svc.Campaign.update(c.id, { total_plays: (Number(c.total_plays) || 0) + n, total_impressions: (Number(c.total_impressions) || 0) + n });
    }

    return Response.json({ ok: true, server_time: new Date().toISOString() });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}