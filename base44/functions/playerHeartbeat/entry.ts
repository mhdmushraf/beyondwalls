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

    return Response.json({ ok: true, server_time: new Date().toISOString() });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}