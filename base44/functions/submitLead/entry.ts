import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { adminIds, notifyUsers } from "../../shared/notify.ts";

/**
 * Public: website forms (book a demo, B.One order, investor deck, launch updates).
 * Creates a Lead for the admin pipeline and alerts the Beyond Walls team.
 * Body: { kind: 'demo'|'bone'|'investor'|'newsletter', name, company, phone, email, type, screens, preferred_time, message, website (honeypot) }
 */
const bad = (error: string, field?: string) => Response.json({ error, field }, { status: 400 });
const clip = (v: unknown, n = 200) => String(v ?? "").trim().slice(0, n);

export default async function (req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    if (clip(body.website)) return Response.json({ ok: true }); // bot

    const kind = ["demo", "bone", "investor", "newsletter"].includes(body.kind) ? body.kind : "demo";
    const email = clip(body.email, 120).toLowerCase();
    const phone = clip(body.phone, 30);
    const name = clip(body.name, 80);
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return bad("Enter a valid email.", "email");
    if (kind === "newsletter") {
      if (!email) return bad("Enter your email.", "email");
    } else {
      if (!name) return bad("Tell us your name.", "name");
      if (!phone && !email) return bad("Add a mobile number so we can reach you.", "phone");
      if (phone && !/^\+?[\d\s-]{7,20}$/.test(phone)) return bad("Check the mobile number.", "phone");
    }

    const type = ["venue", "advertiser", "agency", "investor"].includes(body.type) ? body.type : (kind === "investor" ? "investor" : kind === "bone" ? "venue" : "other");
    const label = { demo: "Demo request", bone: "B.One order", investor: "Investor deck request", newsletter: "Launch updates subscriber" }[kind];
    const notes = [label, clip(body.preferred_time) && `Preferred time: ${clip(body.preferred_time)}`, clip(body.message, 1000)].filter(Boolean).join("\n");

    const svc = base44.asServiceRole.entities;
    const lead = await svc.Lead.create({
      name: name || email, company: clip(body.company, 120), phone, email, type, source: "website", stage: "new",
      screens_estimate: clip(body.screens, 20), next_step: kind === "newsletter" ? "" : "Reply within 1 working day", notes, emirate: "Dubai",
    });

    if (kind !== "newsletter") {
      await notifyUsers(svc, await adminIds(svc), {
        type: "lead", title: `New ${label.toLowerCase()}`, message: `${name}${clip(body.company) ? ` · ${clip(body.company)}` : ""} · ${phone || email}`,
        link: "/admin/leads", reference_id: lead.id,
      });
    }
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: "Couldn't send that right now. Try WhatsApp instead." }, { status: 500 });
  }
}
