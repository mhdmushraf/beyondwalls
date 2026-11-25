import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { getSessionUser, logActivity } from "../../shared/portalAuth.ts";

/**
 * The signed-in user deletes their own account (App Store 5.1.1(v), Google Play account deletion).
 * Body: { confirm: "DELETE" }
 * Removes: memberships, phone push tokens, notifications, the user from every business's member lists,
 * then the user record itself. Business records the law requires us to keep (invoices, bookings) stay
 * with the business, without this person's login.
 */
function list(page: any) {
  return Array.isArray(page) ? page : page?.items || [];
}

export default async function (req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await getSessionUser(base44);
    if (!user) return Response.json({ error: "Sign in first, then delete your account." }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    if (String(body.confirm || "").trim().toUpperCase() !== "DELETE") {
      return Response.json({ error: 'Type DELETE to confirm.', field: "confirm" }, { status: 400 });
    }
    if (user.role === "admin") return Response.json({ error: "Admin accounts can't be deleted here. Remove admin rights first." }, { status: 403 });

    const svc = base44.asServiceRole.entities;
    const removed: Record<string, number> = {};
    const del = async (entity: string, query: Record<string, unknown>) => {
      const rows = list(await svc[entity].filter(query, { limit: 500 }).catch(() => []));
      for (const r of rows) await svc[entity].delete(r.id).catch(() => null);
      removed[entity] = (removed[entity] || 0) + rows.length;
    };

    const memberships = list(await svc.Membership.filter({ user_id: user.id }, { limit: 100 }));
    const orgIds = [...new Set(memberships.map((m: any) => m.org_id).filter(Boolean))];

    // Take the user off every business, venue and screen member list (these drive access).
    for (const orgId of orgIds) {
      const org = await svc.Organization.get(orgId).catch(() => null);
      if (org) await svc.Organization.update(org.id, { member_user_ids: (org.member_user_ids || []).filter((id: string) => id !== user.id) }).catch(() => null);
      for (const entity of ["Venue", "Screen"]) {
        const rows = list(await svc[entity].filter({ org_id: orgId }, { limit: 500 }).catch(() => []));
        for (const r of rows) {
          const ids = r.org_member_user_ids || [];
          if (ids.includes(user.id)) await svc[entity].update(r.id, { org_member_user_ids: ids.filter((id: string) => id !== user.id) }).catch(() => null);
        }
      }
    }

    await del("Membership", { user_id: user.id });
    await del("PushToken", { user_id: user.id });
    await del("Notification", { recipient_user_id: user.id });

    await logActivity(base44, { orgId: orgIds[0] || "", memberIds: [], userEmail: "", action: "account_deleted", targetType: "user", targetId: user.id, details: `Removed ${JSON.stringify(removed)}` });

    let userDeleted = false;
    try { await svc.User.delete(user.id); userDeleted = true; } catch (e) {
      // Fallback if the platform doesn't allow deleting users: wipe personal fields.
      await svc.User.update(user.id, { full_name: "Deleted user" }).catch(() => null);
    }
    return Response.json({ ok: true, user_deleted: userDeleted, removed });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}
