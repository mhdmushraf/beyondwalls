import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { notifyUsers } from "../../shared/notify.ts";

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
      // App Store / Play review demo screens have no physical player; keep them online.
      if (String(screen.paired_device_id || "").startsWith("demo-")) return false;
      if (!screen.last_heartbeat) return true;
      const last = new Date(screen.last_heartbeat).getTime();
      return !Number.isFinite(last) || now - last > STALE_MS;
    });

    if (stale.length) {
      await base44.asServiceRole.entities.Screen.bulkUpdate(
        stale.map((screen) => ({ id: screen.id, is_online: false, status: "offline" })),
      );
      // Tell each venue team which of their screens dropped off (one note per business).
      const byOrg = new Map();
      stale.forEach((s) => { if (!byOrg.has(s.org_id)) byOrg.set(s.org_id, []); byOrg.get(s.org_id).push(s); });
      for (const [orgId, list] of byOrg) {
        const names = list.map((s) => s.name).slice(0, 3).join(", ");
        await notifyUsers(base44.asServiceRole.entities, list[0].org_member_user_ids || [], {
          type: "screen_offline", org_id: orgId,
          title: list.length === 1 ? `${list[0].name} is offline` : `${list.length} screens are offline`,
          message: `${names}${list.length > 3 ? "…" : ""} stopped checking in. Check the TV is on and connected to Wi-Fi.`,
          link: list.length === 1 ? `/app/screens/${list[0].id}` : "/app/screens",
        });
      }
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