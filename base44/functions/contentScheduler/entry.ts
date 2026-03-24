import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// Runs every 5 minutes via scheduled automation.
// Checks active ContentSchedule records and updates the corresponding owner_slot_X_url on Screen.
// Uses each schedule's timezone (default: Asia/Dubai) to compare against local time.

function toLocalTime(date, timezone) {
  // Returns { day: 0-6, time: "HH:MM" } in the given IANA timezone
  const options = { timeZone: timezone, hour12: false, hour: '2-digit', minute: '2-digit', weekday: 'short' };
  const parts = new Intl.DateTimeFormat('en-US', { ...options }).formatToParts(date);
  const get = (type) => parts.find(p => p.type === type)?.value;

  const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const day = weekdayMap[get('weekday')];
  let hour = get('hour');
  const minute = get('minute');
  // Intl may return '24' for midnight in some envs
  if (hour === '24') hour = '00';
  const time = `${hour.padStart(2,'0')}:${minute.padStart(2,'0')}`;
  return { day, time };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const now = new Date();

    const schedules = await base44.asServiceRole.entities.ContentSchedule.filter({ is_active: true });

    const updates = {};

    for (const schedule of schedules) {
      const tz = schedule.timezone || 'Asia/Dubai';
      const { day: currentDay, time: currentTime } = toLocalTime(now, tz);

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
        type: schedule.media_type || 'image',
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

    return Response.json({ ok: true, updatedScreens: updatedCount, checkedAt: now.toISOString() });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});