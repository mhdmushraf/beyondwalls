import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// Scheduled every 15 minutes.
// Compares each screen's last_heartbeat to now (10-min threshold).
// Flips is_online and sends admin notifications ONLY on state change.

const OFFLINE_THRESHOLD_MS = 10 * 60 * 1000;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const now = Date.now();

    const screens = await base44.asServiceRole.entities.Screen.list();

    // Get admin users for notifications
    const allUsers = await base44.asServiceRole.entities.User.list();
    const adminEmails = allUsers
      .filter(u => u.role === 'admin' || u.user_role === 'admin')
      .map(u => u.email);

    // Get all venues for name lookup
    const venues = await base44.asServiceRole.entities.Venue.list();
    const venueMap = {};
    venues.forEach(v => { venueMap[v.id] = v; });

    let offlineChanges = 0;
    let recoveryChanges = 0;

    for (const screen of screens) {
      const lastHeartbeatMs = screen.last_heartbeat ? new Date(screen.last_heartbeat).getTime() : 0;
      const isStale = (now - lastHeartbeatMs) > OFFLINE_THRESHOLD_MS;
      const wasOnline = screen.is_online === true;

      // State change: online → offline
      if (wasOnline && isStale) {
        await base44.asServiceRole.entities.Screen.update(screen.id, { is_online: false });
        const venueName = venueMap[screen.venue_id]?.name || 'Unknown venue';
        for (const email of adminEmails) {
          await base44.asServiceRole.entities.Notification.create({
            recipient_email: email,
            type: 'screen_offline',
            title: `Screen offline: ${screen.name}`,
            message: `Screen ${screen.name} at ${venueName} went offline. Last heartbeat: ${screen.last_heartbeat}`,
            is_read: false,
            reference_id: screen.id,
          });
        }
        offlineChanges++;
      }

      // State change: offline → online
      if (!wasOnline && !isStale && lastHeartbeatMs > 0) {
        await base44.asServiceRole.entities.Screen.update(screen.id, { is_online: true });
        const venueName = venueMap[screen.venue_id]?.name || 'Unknown venue';
        for (const email of adminEmails) {
          await base44.asServiceRole.entities.Notification.create({
            recipient_email: email,
            type: 'screen_recovered',
            title: `Screen recovered: ${screen.name}`,
            message: `Screen ${screen.name} at ${venueName} is back online. Last heartbeat: ${screen.last_heartbeat}`,
            is_read: false,
            reference_id: screen.id,
          });
        }
        recoveryChanges++;
      }
    }

    return Response.json({
      ok: true,
      checked: screens.length,
      offlineChanges,
      recoveryChanges,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});