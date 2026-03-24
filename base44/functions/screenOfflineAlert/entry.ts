import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { event, data, old_data } = body;

    // Only act on update events where player_active or is_online changed to false
    if (event?.type !== "update") return Response.json({ ok: true });

    const wasOnline = old_data?.is_online || old_data?.player_active;
    const isNowOffline = !data?.is_online && !data?.player_active;

    if (!wasOnline || !isNowOffline) return Response.json({ ok: true });

    const screenId = event.entity_id;
    const ownerEmail = data?.owner_email;
    const screenName = data?.name || "Your screen";

    if (!ownerEmail) return Response.json({ ok: true });

    // Create in-app notification
    await base44.asServiceRole.entities.Notification.create({
      recipient_email: ownerEmail,
      type: "screen_offline",
      title: `${screenName} went offline`,
      message: `Your screen "${screenName}" has gone offline. Check the device and internet connection.`,
      is_read: false,
      reference_id: screenId,
    });

    // Send email alert
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: ownerEmail,
      subject: `⚠️ Screen Alert: ${screenName} is offline`,
      body: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px;">
          <h2 style="color: #7c3aed;">Screen Offline Alert</h2>
          <p>Your screen <strong>${screenName}</strong> has gone offline.</p>
          <p>This could be due to a network issue or the device being turned off.</p>
          <p>Log in to your BeyondWalls dashboard to check the screen status and send remote commands.</p>
          <a href="${Deno.env.get('APP_URL') || 'https://app.beyondwalls.ae'}/ScreensOverview" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#7c3aed;color:white;border-radius:8px;text-decoration:none;">View Dashboard</a>
          <p style="margin-top:24px;color:#9ca3af;font-size:13px;">BeyondWalls · Digital Advertising Platform</p>
        </div>
      `,
    });

    return Response.json({ ok: true, alerted: ownerEmail });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});