import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Scheduled daily.
// Deletes ScreenActivityLog records older than 90 days and read Notifications
// older than 60 days, in batches of 200.

const ACTIVITY_LOG_MAX_AGE_DAYS = 90;
const NOTIFICATION_MAX_AGE_DAYS = 60;
const BATCH_SIZE = 200;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = Date.now();
    const activityCutoff = new Date(now - ACTIVITY_LOG_MAX_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const notifCutoff = new Date(now - NOTIFICATION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString();

    let activityDeleted = 0;
    let notificationsDeleted = 0;
    let hasMore = true;

    // --- Prune ScreenActivityLog (by timestamp field) ---
    hasMore = true;
    while (hasMore) {
      const batch = await base44.asServiceRole.entities.ScreenActivityLog.filter(
        { timestamp: { $lt: activityCutoff } },
        '-timestamp',
        BATCH_SIZE,
        0
      );
      if (batch.length === 0) { hasMore = false; break; }
      const ids = batch.map(r => r.id);
      await base44.asServiceRole.entities.ScreenActivityLog.deleteMany({ id: { $in: ids } });
      activityDeleted += batch.length;
      hasMore = batch.length === BATCH_SIZE;
    }

    // --- Prune read Notifications (by created_date) ---
    hasMore = true;
    while (hasMore) {
      const batch = await base44.asServiceRole.entities.Notification.filter(
        { is_read: true, created_date: { $lt: notifCutoff } },
        '-created_date',
        BATCH_SIZE,
        0
      );
      if (batch.length === 0) { hasMore = false; break; }
      const ids = batch.map(r => r.id);
      await base44.asServiceRole.entities.Notification.deleteMany({ id: { $in: ids } });
      notificationsDeleted += batch.length;
      hasMore = batch.length === BATCH_SIZE;
    }

    return Response.json({
      ok: true,
      activity_logs_deleted: activityDeleted,
      notifications_deleted: notificationsDeleted,
      prunedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});