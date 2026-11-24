import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { resolvePlayerScreen } from "../../shared/portalAuth.ts";

/** Public: player uploads a downscaled snapshot every 5 minutes. */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const token = String(body.device_token || "").trim();
    const image = String(body.image || "");
    if (!token) return Response.json({ error: "device_token is required" }, { status: 400 });

    const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(image);
    if (!match) return Response.json({ error: "image must be a jpeg, png or webp data URL" }, { status: 400 });
    if (image.length > 1500000) return Response.json({ error: "snapshot too large" }, { status: 413 });

    const resolved = await resolvePlayerScreen(base44, token);
    if (!resolved) return Response.json({ error: "screen_moved" }, { status: 409 });
    const { screen } = resolved;

    const binary = atob(match[2]);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);

    const file = new File([bytes], `screen-${screen.id}.jpg`, { type: `image/${match[1]}` });
    const uploaded = await base44.asServiceRole.integrations.Core.UploadPrivateFile({ file });

    await base44.asServiceRole.entities.Screen.update(screen.id, {
      last_snapshot_url: uploaded.file_uri,
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}