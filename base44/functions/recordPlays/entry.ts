import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Called by the ScreenPlayer every 60 seconds with accumulated play counts.
// Authenticates by device_token (same trust model as screenHeartbeat).
// Increments AdBooking, Screen, and Campaign counters using $inc.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { screen_id, device_token, events } = body;

    if (!screen_id || !device_token) {
      return Response.json({ error: 'Missing screen_id or device_token' }, { status: 400 });
    }
    if (!Array.isArray(events) || events.length === 0) {
      return Response.json({ error: 'Missing or invalid events array' }, { status: 400 });
    }
    if (events.length > 100) {
      return Response.json({ error: 'Too many events (max 100 per call)' }, { status: 400 });
    }

    // --- Authenticate by device_token (mirror screenHeartbeat) ---
    const screen = await base44.asServiceRole.entities.Screen.get(screen_id);
    if (!screen) {
      return Response.json({ error: 'Screen not found' }, { status: 404 });
    }

    const tokenValid =
      (screen.device_token && screen.device_token === device_token) ||
      (screen.setup_code && screen.setup_code === device_token.toUpperCase());

    if (!tokenValid) {
      return Response.json({ error: 'Forbidden: device_token mismatch' }, { status: 403 });
    }

    // --- Batch-fetch all referenced bookings ---
    const bookingIds = [...new Set(events.map((e) => e.booking_id).filter(Boolean))];
    if (bookingIds.length === 0) {
      return Response.json({ accepted: 0, skipped: events.length });
    }

    const bookings = await base44.asServiceRole.entities.AdBooking.filter({
      id: { $in: bookingIds },
    });

    const bookingsById = {};
    bookings.forEach((b) => { bookingsById[b.id] = b; });

    // --- Process events ---
    let accepted = 0;
    let skipped = 0;
    const bookingIncrements = {};
    const campaignIncrements = {};
    let screenImpressions = 0;

    for (const event of events) {
      const booking = bookingsById[event.booking_id];
      if (!booking) { skipped++; continue; }
      // Verify the booking belongs to this screen and is active with approved creative
      if (booking.screen_id !== screen_id) { skipped++; continue; }
      if (booking.status !== 'active') { skipped++; continue; }
      if (booking.creative_status !== 'approved') { skipped++; continue; }

      // Cap at 1000 plays per event to bound a misbehaving player
      const plays = Math.min(Math.max(0, Number(event.plays) || 0), 1000);
      if (plays <= 0) { skipped++; continue; }

      if (!bookingIncrements[event.booking_id]) {
        bookingIncrements[event.booking_id] = { plays: 0, impressions: 0, campaign_id: booking.campaign_id };
      }
      bookingIncrements[event.booking_id].plays += plays;
      bookingIncrements[event.booking_id].impressions += plays; // 1 play = 1 impression

      screenImpressions += plays;

      if (booking.campaign_id) {
        if (!campaignIncrements[booking.campaign_id]) {
          campaignIncrements[booking.campaign_id] = { plays: 0, impressions: 0 };
        }
        campaignIncrements[booking.campaign_id].plays += plays;
        campaignIncrements[booking.campaign_id].impressions += plays;
      }

      accepted++;
    }

    // --- Apply increments atomically using $inc (service role) ---
    for (const [bookingId, inc] of Object.entries(bookingIncrements)) {
      try {
        await base44.asServiceRole.entities.AdBooking.updateMany(
          { id: bookingId },
          { $inc: { plays: inc.plays, impressions: inc.impressions } }
        );
      } catch (_) { /* best effort */ }
    }

    if (screenImpressions > 0) {
      try {
        await base44.asServiceRole.entities.Screen.updateMany(
          { id: screen_id },
          { $inc: { total_impressions: screenImpressions } }
        );
      } catch (_) { /* best effort */ }
    }

    for (const [campaignId, inc] of Object.entries(campaignIncrements)) {
      try {
        await base44.asServiceRole.entities.Campaign.updateMany(
          { id: campaignId },
          { $inc: { total_plays: inc.plays, total_impressions: inc.impressions } }
        );
      } catch (_) { /* best effort */ }
    }

    return Response.json({ accepted, skipped });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});