import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { firstOf, getSessionUser, getVenueForUser, logActivity } from "../../shared/portalAuth.ts";

/**
 * Venue side: claim the code a TV is showing and create its screen.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await getSessionUser(base44);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const code = String(body.code || "").trim().toUpperCase();
    const venueId = String(body.venue_id || "").trim();
    if (code.length !== 6) return Response.json({ error: "Enter the 6 character code" }, { status: 400 });
    if (!venueId) return Response.json({ error: "venue_id is required" }, { status: 400 });

    const { venue, status } = await getVenueForUser(base44, venueId, user);
    if (status === 404) return Response.json({ error: "Venue not found" }, { status: 404 });
    if (status === 403) return Response.json({ error: "Forbidden" }, { status: 403 });
    if (venue.approval_status !== "approved") {
      return Response.json({ error: "This venue is still pending approval" }, { status: 400 });
    }

    const device = firstOf(
      await base44.asServiceRole.entities.PlayerDevice.filter({ pairing_code: code }, { limit: 1 }),
    );
    if (!device || device.status !== "unclaimed") {
      return Response.json({ error: "That code is not waiting to be paired" }, { status: 404 });
    }

    const now = new Date().toISOString();
    const screen = await base44.asServiceRole.entities.Screen.create({
      org_id: venue.org_id,
      org_member_user_ids: venue.org_member_user_ids || [],
      venue_id: venue.id,
      name: String(body.name || "").trim() || `${venue.name} screen`,
      mode: body.mode || "signage_ads",
      position_label: body.position_label || "",
      orientation: body.orientation || "landscape",
      player_type: body.player_type || "browser",
      width_px: body.orientation === "portrait" ? 1080 : 1920,
      height_px: body.orientation === "portrait" ? 1920 : 1080,
      pairing_code: code,
      paired_device_id: device.device_id,
      paired_at: now,
      is_online: false,
      status: "active",
      approval_status: "approved",
      marketplace_enabled: false,
    });

    await base44.asServiceRole.entities.PlayerDevice.update(device.id, {
      status: "claimed",
      screen_id: screen.id,
      org_id: venue.org_id,
      venue_id: venue.id,
    });

    await logActivity(base44, {
      orgId: venue.org_id,
      memberIds: venue.org_member_user_ids || [],
      userEmail: user.email,
      action: "screen_paired",
      targetType: "screen",
      targetId: screen.id,
      details: `${screen.name} paired to a device via code ${code}`,
    });

    return Response.json({ screen });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}