import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Scheduled every 15 minutes.
// Reads ScreenTelemetry to detect stale heartbeats (10-min threshold).
// Flips is_online on ScreenTelemetry (mirrors to Screen for transition week).
// Fetches admins and venues with filtered queries, not full lists.
// Sends admin notifications ONLY on state change.

const OFFLINE_THRESHOLD_MS = 10 * 60 * 1000;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const now = Date.now();

    // --- Fetch admin emails with filtered queries (not full user list) ---
    const [adminRoleUsers, adminUserRoleUsers] = await Promise.all([
      base44.asServiceRole.entities.User.filter({ role: 'admin' }, null, 50, 0),
      base44.asServiceRole.entities.User.filter({ user_role: 'admin' }, null, 50, 0),
    ]);
    const adminEmails = [...new Set(
      [...adminRoleUsers, ...adminUserRoleUsers].map(u => u.email).filter(Boolean)
    )];

    // --- Fetch all telemetry records ---
    const telemetryRecords = await base44.asServiceRole.entities.ScreenTelemetry.list(
      '-last_heartbeat',
      200
    );

    // --- First pass: detect state changes ---
    const changes = [];
    const screenIdsToFetch = new Set();

    for (const telem of telemetryRecords) {
      const lastHeartbeatMs = telem.last_heartbeat
        ? new Date(telem.last_heartbeat).getTime()
        : 0;
      const isStale = (now - lastHeartbeatMs) > OFFLINE_THRESHOLD_MS;
      const wasOnline = telem.is_online === true;

      if (wasOnline && isStale) {
        changes.push({ telemetry: telem, newOnline: false });
        screenIdsToFetch.add(telem.screen_id);
      } else if (!wasOnline && !isStale && lastHeartbeatMs > 0) {
        changes.push({ telemetry: telem, newOnline: true });
        screenIdsToFetch.add(telem.screen_id);
      }
    }

    // --- Fetch only screens that changed state (not full list) ---
    const screenMap = {};
    for (const screenId of screenIdsToFetch) {
      try {
        const screen = await base44.asServiceRole.entities.Screen.get(screenId);
        if (screen) screenMap[screenId] = screen;
      } catch { /* non-fatal */ }
    }

    // --- Fetch only venues for changed screens (not full list) ---
    const venueIds = new Set(
      Object.values(screenMap).map(s => s.venue_id).filter(Boolean)
    );
    const venueMap = {};
    for (const venueId of venueIds) {
      try {
        const venue = await base44.asServiceRole.entities.Venue.get(venueId);
        if (venue) venueMap[venueId] = venue;
      } catch { /* non-fatal */ }
    }

    // --- Apply changes + send notifications ---
    let offlineChanges = 0;
    let recoveryChanges = 0;

    for (const change of changes) {
      const { telemetry, newOnline } = change;
      const screen = screenMap[telemetry.screen_id];
      if (!screen) continue;

      // Update ScreenTelemetry
      await base44.asServiceRole.entities.ScreenTelemetry.update(telemetry.id, {
        is_online: newOnline,
      });

      // Mirror to Screen for transition week
      await base44.asServiceRole.entities.Screen.update(screen.id, {
        is_online: newOnline,
      });

      const venueName = venueMap[screen.venue_id]?.name || 'Unknown venue';
      const notificationType = newOnline ? 'screen_recovered' : 'screen_offline';
      const notificationTitle = newOnline
        ? `Screen recovered: ${screen.name}`
        : `Screen offline: ${screen.name}`;
      const notificationMessage = newOnline
        ? `Screen ${screen.name} at ${venueName} is back online. Last heartbeat: ${telemetry.last_heartbeat}`
        : `Screen ${screen.name} at ${venueName} went offline. Last heartbeat: ${telemetry.last_heartbeat}`;

      for (const email of adminEmails) {
        await base44.asServiceRole.entities.Notification.create({
          recipient_email: email,
          type: notificationType,
          title: notificationTitle,
          message: notificationMessage,
          is_read: false,
          reference_id: screen.id,
        });
      }

      if (newOnline) recoveryChanges++;
      else offlineChanges++;
    }

    return Response.json({
      ok: true,
      checked: telemetryRecords.length,
      offlineChanges,
      recoveryChanges,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});