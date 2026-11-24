import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { getSessionUser, getVenueForUser, logActivity, uniquePairingCode } from "../../shared/portalAuth.ts";

/**
 * Venue side: create a screen and hand back a code to type on the TV.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await getSessionUser(base44);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const venueId = String(body.venue_id || "").trim();
    if (!venueId) return Response.json({ error: "venue_id is required" }, { status: 400 });

    const { venue, status } = await getVenueForUser(base44, venueId, user);
    if (status === 404) return Response.json({ error: "Venue not found" }, { status: 404 });
    if (status === 403) return Response.json({ error: "Forbidden" }, { status: 403 });
    if (venue.approval_status !== "approved") {
      return Response.json({ error: "This venue is still pending approval" }, { status: 400 });
    }

    const code = await uniquePairingCode(base44);
    const orientation = body.orientation === "portrait" ? "portrait" : "landscape";

    const screen = await base44.asServiceRole.entities.Screen.create({
      org_id: venue.org_id,
      org_member_user_ids: venue.org_member_user_ids || [],
      venue_id: venue.id,
      name: String(body.name || "").trim() || `${venue.name} screen`,
      mode: body.mode || "signage_ads",
      position_label: body.position_label || "",
      orientation,
      player_type: body.player_type || "browser",
      width_px: orientation === "portrait" ? 1080 : 1920,
      height_px: orientation === "portrait" ? 1920 : 1080,
      pairing_code: code,
      is_online: false,
      status: "active",
      approval_status: "approved",
      marketplace_enabled: false,
    });

    await logActivity(base44, {
      orgId: venue.org_id,
      memberIds: venue.org_member_user_ids || [],
      userEmail: user.email,
      action: "screen_created",
      targetType: "screen",
      targetId: screen.id,
      details: `${screen.name} created in ${venue.name}`,
    });

    return Response.json({ screen, code });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}