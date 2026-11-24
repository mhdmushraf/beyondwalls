import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { resolveMediaUrl, resolvePlayerScreen } from "../../shared/portalAuth.ts";

/**
 * Public: the server builds the ready-to-play list for a paired device.
 * Slot URLs are signed here because the player has no app session.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const token = String(body.device_token || "").trim();
    if (!token) return Response.json({ error: "device_token is required" }, { status: 400 });

    const resolved = await resolvePlayerScreen(base44, token);
    if (!resolved) return Response.json({ error: "screen_moved" }, { status: 409 });
    const { screen } = resolved;

    const slots = [];
    for (let i = 1; i <= 6; i += 1) {
      const url = screen[`owner_slot_${i}_url`];
      if (!url) continue;
      slots.push({ index: i, url, type: screen[`owner_slot_${i}_type`] || "image" });
    }

    const items = (
      await Promise.all(
        slots.map(async (slot) => ({
          id: `slot-${slot.index}`,
          url: await resolveMediaUrl(base44, slot.url),
          type: slot.type,
          duration: screen.slot_duration || 30,
        })),
      )
    ).filter((item) => item.url);

    return Response.json({
      screen: {
        id: screen.id,
        name: screen.name,
        orientation: screen.orientation || "landscape",
        width_px: screen.width_px || 1920,
        height_px: screen.height_px || 1080,
        display_mode: screen.display_mode || "fit",
        mode: screen.mode || "signage_ads",
        slot_duration: screen.slot_duration || 30,
      },
      items,
      house: {
        title: "Advertise here",
        subtitle: "beyondwalls.linkzoneglobal.com",
      },
      server_time: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}