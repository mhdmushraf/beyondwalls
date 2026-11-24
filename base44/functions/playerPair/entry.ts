import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { firstOf, logActivity } from "../../shared/portalAuth.ts";

/**
 * Public: a player types the code a venue generated. Pairing is exclusive —
 * the previous device is told the screen moved.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const deviceId = String(body.device_id || "").trim();
    const code = String(body.code || "").trim().toUpperCase();
    if (!deviceId) return Response.json({ error: "device_id is required" }, { status: 400 });
    if (code.length !== 6) return Response.json({ error: "Enter the 6 character code" }, { status: 400 });

    const screen = firstOf(
      await base44.asServiceRole.entities.Screen.filter({ pairing_code: code }, { limit: 1 }),
    );
    if (!screen) return Response.json({ error: "code_not_found" }, { status: 404 });

    // Release the previous device.
    if (screen.paired_device_id && screen.paired_device_id !== deviceId) {
      const previous = await base44.asServiceRole.entities.PlayerDevice.filter(
        { screen_id: screen.id },
        { limit: 20 },
      );
      const list = Array.isArray(previous) ? previous : previous.items || [];
      for (const record of list) {
        if (record.device_id !== deviceId) {
          await base44.asServiceRole.entities.PlayerDevice.update(record.id, { status: "replaced" });
        }
      }
    }

    const deviceToken = crypto.randomUUID();
    const now = new Date().toISOString();

    const updated = await base44.asServiceRole.entities.Screen.update(screen.id, {
      paired_device_id: deviceId,
      paired_at: now,
      is_online: false,
    });

    const existing = firstOf(
      await base44.asServiceRole.entities.PlayerDevice.filter({ device_id: deviceId }, { limit: 1 }),
    );
    const devicePayload = {
      device_id: deviceId,
      device_token: deviceToken,
      pairing_code: code,
      status: "claimed",
      screen_id: screen.id,
      org_id: screen.org_id || "",
      venue_id: screen.venue_id || "",
      last_seen: now,
    };
    if (existing) {
      await base44.asServiceRole.entities.PlayerDevice.update(existing.id, devicePayload);
    } else {
      await base44.asServiceRole.entities.PlayerDevice.create(devicePayload);
    }

    await logActivity(base44, {
      orgId: screen.org_id,
      memberIds: screen.org_member_user_ids || [],
      userEmail: "",
      action: "screen_paired",
      targetType: "screen",
      targetId: screen.id,
      details: `${screen.name} paired with a new device`,
    });

    return Response.json({
      device_token: deviceToken,
      screen: {
        id: updated.id,
        name: updated.name,
        orientation: updated.orientation,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}