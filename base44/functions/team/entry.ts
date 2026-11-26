import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { getSessionUser } from "../../shared/portalAuth.ts";
import { notifyUsers } from "../../shared/notify.ts";

/**
 * Team members of a business (Membership rows are private to each user, so the list goes through here).
 *  list   { org_id }                              any member → members, pending approvals count
 *  invite { org_id, email, role, name?, venue_ids? }   owner/venue_manager → invited row + email
 *  update { membership_id, role?, venue_ids? }    owner
 *  remove { membership_id }                       owner (never the last owner)
 *  claim  {}                                      signed-in user → joins every business that invited their email
 */
const ROLES = ["owner", "venue_manager", "designer", "viewer"];
const SCOPED = ["Venue", "Screen", "Playlist", "MediaAsset", "MenuBoard", "UrgentMessage", "TeamMessage", "Site", "Invoice"];
const list = (p: any) => (Array.isArray(p) ? p : p?.items || []);
const bad = (error: string, status = 400) => Response.json({ error }, { status });

async function setMembers(svc: any, orgId: string, ids: string[]) {
  await svc.Organization.update(orgId, { member_user_ids: ids });
  for (const name of SCOPED) {
    const rows = list(await svc[name].filter({ org_id: orgId }, { limit: 500 }).catch(() => []));
    for (const r of rows) await svc[name].update(r.id, { org_member_user_ids: ids }).catch(() => null);
  }
  const ads = list(await svc.AdBooking.filter({ org_id: orgId }, { limit: 500 }).catch(() => []));
  for (const b of ads) await svc.AdBooking.update(b.id, { venue_member_user_ids: ids }).catch(() => null);
}

export default async function (req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await getSessionUser(base44);
    if (!user) return bad("Your session has ended. Sign in again.", 401);
    const svc = base44.asServiceRole.entities;
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "list");

    if (action === "claim") {
      const email = String(user.email || "").toLowerCase();
      const invited = list(await svc.Membership.filter({ user_email: email }, { limit: 20 })).filter((m: any) => !m.user_id);
      const joined: string[] = [];
      for (const m of invited) {
        const org = await svc.Organization.get(m.org_id).catch(() => null);
        if (!org) continue;
        await svc.Membership.update(m.id, { user_id: user.id, user_name: user.full_name || m.user_name || "" });
        const ids = [...new Set([...(org.member_user_ids || []), user.id])];
        await setMembers(svc, org.id, ids);
        joined.push(org.name);
        await notifyUsers(svc, (org.member_user_ids || []).filter((x: string) => x !== user.id), { type: "team", title: `${user.full_name || email} joined ${org.name}`, message: "They accepted your invite.", org_id: org.id, link: "/app/settings" });
      }
      return Response.json({ joined });
    }

    const orgId = String(body.org_id || "");
    let org = orgId ? await svc.Organization.get(orgId).catch(() => null) : null;
    if (!org && body.membership_id) {
      const m = await svc.Membership.get(String(body.membership_id)).catch(() => null);
      org = m ? await svc.Organization.get(m.org_id).catch(() => null) : null;
    }
    if (!org) return bad("We couldn't find that business.", 404);
    const members = list(await svc.Membership.filter({ org_id: org.id }, { limit: 200 }));
    const me = members.find((m: any) => m.user_id === user.id);
    const isAdmin = user.role === "admin";
    if (!me && !isAdmin && !(org.member_user_ids || []).includes(user.id)) return bad("You're not part of this business.", 403);
    const myRole = me?.role || (isAdmin ? "owner" : "owner");

    if (action === "list") {
      return Response.json({
        my_role: myRole,
        members: members.map((m: any) => ({ id: m.id, name: m.user_name || m.user_email, email: m.user_email, role: m.role, venue_ids: m.venue_ids || [], invited: !m.user_id, created_date: m.created_date })),
      });
    }

    if (!["owner", "venue_manager"].includes(myRole) && !isAdmin) return bad("Only the owner or a manager can change the team.", 403);

    if (action === "invite") {
      const email = String(body.email || "").trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return bad("That email looks incomplete.");
      const role = ROLES.includes(body.role) ? body.role : "viewer";
      if (role === "owner" && myRole !== "owner") return bad("Only an owner can add another owner.", 403);
      if (members.some((m: any) => String(m.user_email).toLowerCase() === email)) return bad("That person is already on the team.");
      const m = await svc.Membership.create({ org_id: org.id, user_email: email, user_name: String(body.name || "").trim(), role, venue_ids: Array.isArray(body.venue_ids) ? body.venue_ids : [], user_id: "", current_org: false });
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: `${user.full_name || "Your team"} added you to ${org.name} on Beyond Walls`,
        body: `Hi${body.name ? ` ${body.name}` : ""},\n\n${user.full_name || user.email} added you to ${org.name} on Beyond Walls as ${role.replace("_", " ")}.\n\nDownload the Beyond Walls app or open https://beyondwalls.linkzoneglobal.com and sign up with this email (${email}). You'll see ${org.name} straight away.\n\n— Beyond Walls`,
      }).catch(() => null);
      return Response.json({ member: { id: m.id, name: m.user_name || email, email, role, invited: true } });
    }

    const target = members.find((m: any) => m.id === String(body.membership_id || ""));
    if (!target) return bad("That team member isn't in this business.", 404);

    if (action === "update") {
      const patch: any = {};
      if (body.role) { if (!ROLES.includes(body.role)) return bad("Unknown role."); patch.role = body.role; }
      if (Array.isArray(body.venue_ids)) patch.venue_ids = body.venue_ids;
      if (target.role === "owner" && patch.role && patch.role !== "owner" && members.filter((m: any) => m.role === "owner").length < 2) return bad("A business needs at least one owner.");
      await svc.Membership.update(target.id, patch);
      return Response.json({ ok: true });
    }

    if (action === "remove") {
      if (myRole !== "owner" && !isAdmin) return bad("Only an owner can remove people.", 403);
      if (target.role === "owner" && members.filter((m: any) => m.role === "owner").length < 2) return bad("You can't remove the only owner.");
      await svc.Membership.delete(target.id);
      if (target.user_id) await setMembers(svc, org.id, (org.member_user_ids || []).filter((x: string) => x !== target.user_id));
      return Response.json({ ok: true });
    }

    return bad("Unknown action.");
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}
