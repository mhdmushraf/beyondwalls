import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// Runs every 5 minutes via scheduled automation.
// Checks active ContentSchedule records and updates the corresponding owner_slot_X_url on Screen.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const now = new Date();
    const currentDay = now.getUTCDay(); // 0=Sun,6=Sat
    const currentTime = `${String(now.getUTCHours()).padStart(2,'0')}:${String(now.getUTCMinutes()).padStart(2,'0')}`;

    const schedules = await base44.asServiceRole.entities.ContentSchedule.filter({ is_active: true });

    const updates = {};

    for (const schedule of schedules) {
      // Check day of week
      if (schedule.days_of_week && schedule.days_of_week.length > 0) {
        if (!schedule.days_of_week.includes(currentDay)) continue;
      }

      // Check time range
      if (currentTime < schedule.start_time || currentTime > schedule.end_time) continue;

      // This schedule is active now — queue update for this screen+slot
      if (!updates[schedule.screen_id]) updates[schedule.screen_id] = {};
      updates[schedule.screen_id][schedule.slot_index] = {
        url: schedule.media_url,
        type: schedule.media_type || "image",
      };
    }

    let updatedCount = 0;
    for (const [screenId, slots] of Object.entries(updates)) {
      const patch = {};
      for (const [slotIndex, media] of Object.entries(slots)) {
        patch[`owner_slot_${slotIndex}_url`] = media.url;
        patch[`owner_slot_${slotIndex}_type`] = media.type;
      }
      await base44.asServiceRole.entities.Screen.update(screenId, patch);
      updatedCount++;
    }

    return Response.json({ ok: true, updatedScreens: updatedCount, time: currentTime });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});