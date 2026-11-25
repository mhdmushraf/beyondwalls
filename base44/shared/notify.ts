/**
 * One place to tell people something happened: an in-app Notification per user,
 * plus an Expo push to each phone they signed in on (mobile app).
 * Never throws — a failed notification must not break the action that caused it.
 */
function list(page: any) {
  return Array.isArray(page) ? page : page?.items || [];
}

type Note = { type: string; title: string; message: string; link?: string; reference_id?: string; org_id?: string };

async function usersFor(svc: any, userIds: string[]) {
  const out: any[] = [];
  for (const id of [...new Set(userIds.filter(Boolean))].slice(0, 50)) {
    const u = await svc.User.get(id).catch(() => null);
    if (u) out.push(u);
  }
  return out;
}

async function push(svc: any, userIds: string[], note: Note) {
  const tokens: string[] = [];
  for (const id of userIds) {
    const rows = list(await svc.PushToken.filter({ user_id: id, active: true }, { limit: 10 }).catch(() => []));
    rows.forEach((r: any) => r.token && tokens.push(r.token));
  }
  if (!tokens.length) return;
  const messages = tokens.map((to) => ({ to, title: note.title, body: note.message, sound: "default", data: { link: note.link || "", type: note.type } }));
  for (let i = 0; i < messages.length; i += 90) {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(messages.slice(i, i + 90)),
    }).catch(() => null);
  }
}

export async function notifyUsers(svc: any, userIds: string[], note: Note) {
  try {
    const users = await usersFor(svc, userIds || []);
    for (const u of users) {
      await svc.Notification.create({
        recipient_user_id: u.id, recipient_email: u.email || "", org_id: note.org_id || "",
        type: note.type, title: note.title.slice(0, 120), message: note.message.slice(0, 500),
        link: note.link || "", reference_id: note.reference_id || "", is_read: false, pushed: true,
      }).catch(() => null);
    }
    await push(svc, users.map((u) => u.id), note).catch(() => null);
  } catch (e) {
    // swallow
  }
}

/** Every admin of the platform (for HQ alerts). */
export async function adminIds(svc: any) {
  const rows = list(await svc.User.filter({ role: "admin" }, { limit: 20 }).catch(() => []));
  return rows.map((u: any) => u.id);
}
