import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { resolvePlayerScreen } from "../../shared/portalAuth.ts";

/** Public: the player polls for a pending command every 15s. */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const token = String(body.device_token || "").trim();
    if (!token) return Response.json({ error: "device_token is required" }, { status: 400 });

    const resolved = await resolvePlayerScreen(base44, token);
    if (!resolved) return Response.json({ error: "screen_moved" }, { status: 409 });

    return Response.json({
      screen_id: resolved.screen.id,
      command: resolved.screen.player_command || null,
      server_time: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}