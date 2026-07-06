import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Entity automation on Screen updates.
// Previously checked is_online / player_active / owner_email on the Screen
// entity. Those fields have been migrated to ScreenTelemetry and removed
// from Screen. This function is kept as a no-op stub — the automation
// should be archived. Offline alerts are now handled by checkScreenHealth
// which reads ScreenTelemetry directly.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    return Response.json({ ok: true, skipped: 'Screen no longer carries telemetry fields' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});