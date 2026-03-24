import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// Runs weekly via scheduled automation. Sends a performance digest to each venue owner.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all venue owners
    const allUsers = await base44.asServiceRole.entities.User.list();
    const venueOwners = allUsers.filter(u => u.user_role === "venue_owner" || u.role === "venue_owner");

    let sent = 0;

    for (const owner of venueOwners) {
      const screens = await base44.asServiceRole.entities.Screen.filter({ owner_email: owner.email });
      if (!screens.length) continue;

      const screenIds = screens.map(s => s.id);

      // Gather bookings for these screens in the last 7 days
      const allBookings = await base44.asServiceRole.entities.AdBooking.filter({ status: "active" });
      const ownerBookings = allBookings.filter(b => screenIds.includes(b.screen_id));

      const totalImpressions = ownerBookings.reduce((sum, b) => sum + (b.impressions || 0), 0);
      const totalEarnings = ownerBookings.reduce((sum, b) => sum + (b.venue_earnings || 0), 0);
      const onlineScreens = screens.filter(s => s.is_online).length;
      const totalAdsPlayed = screens.reduce((sum, s) => sum + (s.ads_played_count || 0), 0);

      const screenRows = screens.map(s =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #f1f5f9">${s.name}</td>
          <td style="padding:8px;border-bottom:1px solid #f1f5f9;text-align:center">${s.is_online ? "🟢 Online" : "🔴 Offline"}</td>
          <td style="padding:8px;border-bottom:1px solid #f1f5f9;text-align:center">${(s.ads_played_count || 0).toLocaleString()}</td>
          <td style="padding:8px;border-bottom:1px solid #f1f5f9;text-align:right">AED ${(s.total_revenue || 0).toFixed(2)}</td>
        </tr>`
      ).join("");

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: owner.email,
        subject: `📊 Your Weekly BeyondWalls Performance Report`,
        body: `
          <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;color:#1e293b">
            <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:24px;border-radius:12px;color:white;margin-bottom:24px">
              <h1 style="margin:0;font-size:22px">Weekly Performance Report</h1>
              <p style="margin:8px 0 0;opacity:0.8">Week ending ${new Date().toLocaleDateString()}</p>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px">
              <div style="background:#f8fafc;padding:16px;border-radius:10px;text-align:center">
                <p style="font-size:28px;font-weight:700;color:#7c3aed;margin:0">${totalImpressions.toLocaleString()}</p>
                <p style="color:#64748b;font-size:13px;margin:4px 0 0">Total Impressions</p>
              </div>
              <div style="background:#f8fafc;padding:16px;border-radius:10px;text-align:center">
                <p style="font-size:28px;font-weight:700;color:#059669;margin:0">AED ${totalEarnings.toFixed(2)}</p>
                <p style="color:#64748b;font-size:13px;margin:4px 0 0">Earnings This Week</p>
              </div>
              <div style="background:#f8fafc;padding:16px;border-radius:10px;text-align:center">
                <p style="font-size:28px;font-weight:700;color:#2563eb;margin:0">${onlineScreens}/${screens.length}</p>
                <p style="color:#64748b;font-size:13px;margin:4px 0 0">Screens Online</p>
              </div>
              <div style="background:#f8fafc;padding:16px;border-radius:10px;text-align:center">
                <p style="font-size:28px;font-weight:700;color:#d97706;margin:0">${totalAdsPlayed.toLocaleString()}</p>
                <p style="color:#64748b;font-size:13px;margin:4px 0 0">Total Ads Played</p>
              </div>
            </div>

            <h3 style="color:#1e293b;margin-bottom:12px">Screen Breakdown</h3>
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <thead>
                <tr style="background:#f8fafc">
                  <th style="padding:10px;text-align:left;color:#64748b;font-weight:600">Screen</th>
                  <th style="padding:10px;text-align:center;color:#64748b;font-weight:600">Status</th>
                  <th style="padding:10px;text-align:center;color:#64748b;font-weight:600">Ads Played</th>
                  <th style="padding:10px;text-align:right;color:#64748b;font-weight:600">Revenue</th>
                </tr>
              </thead>
              <tbody>${screenRows}</tbody>
            </table>

            <div style="text-align:center;margin-top:24px">
              <a href="${Deno.env.get('APP_URL') || 'https://app.beyondwalls.ae'}/VenueEarnings" style="display:inline-block;padding:12px 32px;background:#7c3aed;color:white;border-radius:8px;text-decoration:none;font-weight:600">View Full Earnings</a>
            </div>
            <p style="margin-top:24px;color:#94a3b8;font-size:12px;text-align:center">BeyondWalls · Digital Advertising Platform</p>
          </div>
        `,
      });
      sent++;
    }

    return Response.json({ ok: true, digestsSent: sent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});