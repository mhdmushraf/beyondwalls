import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// Called by the ScreenPlayer every 5 seconds.
// Validates the device token, updates last_heartbeat + is_online,
// and writes a throttled "heartbeat" activity log (once per 30 min).

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

    // Update heartbeat + stats
    await base44.asServiceRole.entities.Screen.update(screen_id, {
      last_heartbeat: now,
      is_online: true,
      status: stats?.status || 'active',
      player_active: stats?.player_active ?? true,
      current_ad_index: stats?.current_ad_index ?? 0,
      current_playlist_length: stats?.current_playlist_length ?? 0,
      total_playtime: stats?.total_playtime ?? 0,
      ads_played_count: stats?.ads_played_count ?? 0,
      current_session_id: stats?.current_session_id || null,
      session_started_at: stats?.session_started_at || null,
      uptime_seconds: stats?.uptime_seconds ?? 0,
      current_content_name: stats?.current_content_name || null,
      player_version: stats?.player_version || null,
    });

    // Throttled heartbeat log — once per 30 minutes
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