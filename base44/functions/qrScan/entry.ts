import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";

/**
 * Public: called by the /q/:id page when someone scans a screen QR.
 * Counts the scan and returns where to send the visitor.
 */
export default async function (req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const id = String(body.id || "").trim();
    const screenId = String(body.s || "").trim().slice(0, 40);
    if (!id) return Response.json({ error: "id is required" }, { status: 400 });

    const svc = base44.asServiceRole.entities;
    const qr = await svc.QRCode.get(id).catch(() => null);
    if (!qr || qr.is_active === false || !qr.target_url) {
      return Response.json({ error: "not_found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    await Promise.all([
      svc.QRCode.update(qr.id, { scans: (qr.scans || 0) + 1, last_scan_at: now }),
      svc.QRScan.create({
        qr_id: qr.id,
        org_id: qr.org_id,
        org_member_user_ids: qr.org_member_user_ids || [],
        screen_id: screenId,
        scanned_at: now,
        user_agent: String(req.headers.get("user-agent") || "").slice(0, 200),
      }),
    ]).catch(() => null);

    let url = String(qr.target_url).trim();
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    return Response.json({ url });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}
