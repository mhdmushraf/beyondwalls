import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { firstOf, uniquePairingCode } from "../../shared/portalAuth.ts";

/**
 * Public: a player identifies itself, gets a pairing code and polls here
 * until a venue claims it.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const deviceId = String(body.device_id || "").trim();
    if (!deviceId) return Response.json({ error: "device_id is required" }, { status: 400 });

    const now = new Date().toISOString();
    const userAgent = String(req.headers.get("user-agent") || "").slice(0, 300);

    const found = firstOf(
      await base44.asServiceRole.entities.PlayerDevice.filter({ device_id: deviceId }, { limit: 1 }),
    );

    if (found) {
      // A device that was replaced can start a fresh pairing when the user asks.
      if (body.reset === true && found.status === "replaced") {
        const freshCode = await uniquePairingCode(base44);
        const freshToken = crypto.randomUUID();
        await base44.asServiceRole.entities.PlayerDevice.update(found.id, {
          status: "unclaimed",
          pairing_code: freshCode,
          device_token: freshToken,
          screen_id: "",
          org_id: "",
          venue_id: "",
          last_seen: now,
          user_agent: userAgent,
        });
        return Response.json({
          status: "unclaimed",
          code: freshCode,
          screen_id: null,
          device_token: null,
        });
      }

      let status = found.status || "unclaimed";

      // The screen may have been paired to a different device since.
      if (status === "claimed" && found.screen_id) {
        const screen = await base44.asServiceRole.entities.Screen.get(found.screen_id).catch((e) =>
          e.status === 404 ? null : Promise.reject(e),
        );
        if (!screen || screen.paired_device_id !== deviceId) {
          status = "replaced";
          await base44.asServiceRole.entities.PlayerDevice.update(found.id, { status: "replaced" });
        }
      }

      await base44.asServiceRole.entities.PlayerDevice.update(found.id, {
        last_seen: now,
        user_agent: userAgent,
      });

      return Response.json({
        status,
        code: found.pairing_code,
        screen_id: status === "claimed" ? found.screen_id : null,
        device_token: status === "claimed" ? found.device_token : null,
      });
    }

    const code = await uniquePairingCode(base44);
    const deviceToken = crypto.randomUUID();

    await base44.asServiceRole.entities.PlayerDevice.create({
      device_id: deviceId,
      device_token: deviceToken,
      pairing_code: code,
      status: "unclaimed",
      last_seen: now,
      user_agent: userAgent,
    });

    return Response.json({ status: "unclaimed", code, screen_id: null, device_token: null });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}