import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";

const STALE_MS = 3 * 60 * 1000;

/**
 * Scheduled every 5 minutes: a screen with no heartbeat for 3 minutes is offline.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const page = await base44.asServiceRole.entities.Screen.filter({ is_online: true }, { limit: 200 });
    const screens = Array.isArray(page) ? page : page.items || [];
    const now = Date.now();

    const stale = screens.filter((screen) => {
      if (!screen.last_heartbeat) return true;
      const last = new Date(screen.last_heartbeat).getTime();
      return !Number.isFinite(last) || now - last > STALE_MS;
    });

    if (stale.length) {
      await base44.asServiceRole.entities.Screen.bulkUpdate(
        stale.map((screen) => ({ id: screen.id, is_online: false, status: "offline" })),
      );
      await base44.asServiceRole.entities.ActivityLog.create({
        org_id: "",
        user_email: "",
        action: "screens_marked_offline",
        target_type: "system",
        details: `${stale.length} screen(s) had no heartbeat for 3 minutes`,
        timestamp: new Date().toISOString(),
      });
    }

    return Response.json({ ok: true, checked: screens.length, marked_offline: stale.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}