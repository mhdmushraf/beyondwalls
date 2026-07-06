import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Called by the ScreenPlayer every 5 seconds.
// Validates the device token, upserts telemetry to ScreenTelemetry,
// and updates Screen ONLY on status/approval change (e.g. first heartbeat
// auto-activates a pending screen).
// Writes a throttled "heartbeat" activity log (once per 30 min).

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { screen_id, auth_token, stats } = body;

    if (!screen_id || !auth_token) {
      return Response.json({ error: 'Missing screen_id or auth_token' }, { status: 400 });
    }

    // Validate the device token against the stored screen
    const screen = await base44.asServiceRole.entities.Screen.get(screen_id);
    if (!screen) {
      return Response.json({ error: 'Screen not found' }, { status: 404 });
    }

    const tokenValid =
      (screen.device_token && screen.device_token === auth_token) ||
      (screen.setup_code && screen.setup_code === auth_token.toUpperCase());

    if (!tokenValid) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date().toISOString();

    // --- Upsert ScreenTelemetry by screen_id ---
    const existing = await base44.asServiceRole.entities.ScreenTelemetry.filter(
      { screen_id },
      null,
      1,
      0
    );

    const telemetryData = {
      screen_id,
      org_id: screen.org_id || null,
      org_member_user_ids: screen.org_member_user_ids || [],
      is_online: true,
      last_heartbeat: now,
      player_version: stats?.player_version || null,
      current_session_id: stats?.current_session_id || null,
      session_started_at: stats?.session_started_at || null,
      uptime_seconds: stats?.uptime_seconds ?? 0,
      current_ad_index: stats?.current_ad_index ?? 0,
      current_playlist_length: stats?.current_playlist_length ?? 0,
      current_content_name: stats?.current_content_name || null,
      player_active: stats?.player_active ?? true,
      ads_played_count: stats?.ads_played_count ?? 0,
      total_playtime: stats?.total_playtime ?? 0,
    };

    if (existing.length > 0) {
      await base44.asServiceRole.entities.ScreenTelemetry.update(existing[0].id, telemetryData);
    } else {
      await base44.asServiceRole.entities.ScreenTelemetry.create(telemetryData);
    }

    // --- Update Screen ONLY on status change ---
    // Auto-activate on first heartbeat: pending/inactive → active
    if (screen.status === 'pending' || screen.status === 'inactive') {
      await base44.asServiceRole.entities.Screen.update(screen_id, {
        status: 'active',
        is_online: true,
        last_heartbeat: now,
        player_active: stats?.player_active ?? true,
      });
    }

    // --- Throttled heartbeat log — once per 30 minutes ---
    const recentLogs = await base44.asServiceRole.entities.ScreenActivityLog.filter(
      { screen_id, event_type: 'heartbeat' },
      '-timestamp',
      1
    );
    const lastLog = recentLogs[0];
    const thirtyMinAgo = Date.now() - 30 * 60 * 1000;
    if (!lastLog || new Date(lastLog.timestamp).getTime() < thirtyMinAgo) {
      await base44.asServiceRole.entities.ScreenActivityLog.create({
        screen_id,
        event_type: 'heartbeat',
        timestamp: now,
        session_id: stats?.current_session_id || null,
        player_version: stats?.player_version || null,
      });
    }

    return Response.json({ ok: true, heartbeat: now });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});