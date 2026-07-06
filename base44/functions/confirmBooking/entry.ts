import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { booking_id, provider_reference } = body;

    if (!booking_id || !provider_reference) {
      return Response.json(
        { error: 'Missing required fields: booking_id, provider_reference' },
        { status: 400 }
      );
    }

    // --- Idempotency: if a Transaction already exists for this provider_reference, return early ---
    const existingTxns = await base44.asServiceRole.entities.Transaction.filter({
      reference_id: provider_reference,
      type: 'booking_payment',
    });
    if (existingTxns.length > 0) {
      const txn = existingTxns[0];
      const booking = await base44.asServiceRole.entities.AdBooking.get(booking_id);
      return Response.json({
        booking_id: booking_id,
        transaction_id: txn.id,
        status: booking?.status || 'active',
        already_confirmed: true,
      });
    }

    // --- Resolve the booking ---
    const booking = await base44.asServiceRole.entities.AdBooking.get(booking_id);
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    // --- Mark the booking active ---
    await base44.asServiceRole.entities.AdBooking.update(booking_id, {
      status: 'active',
    });

    // --- Increment the screen's total_revenue ---
    if (booking.screen_id) {
      try {
        const screen = await base44.asServiceRole.entities.Screen.get(booking.screen_id);
        if (screen) {
          const currentRevenue = typeof screen.total_revenue === 'number' ? screen.total_revenue : 0;
          await base44.asServiceRole.entities.Screen.update(screen.id, {
            total_revenue: +(currentRevenue + (booking.total_amount || 0)).toFixed(2),
          });
        }
      } catch (_) { /* non-fatal: revenue increment is best-effort */ }
    }

    // --- Create the ledger Transaction ---
    const txn = await base44.asServiceRole.entities.Transaction.create({
      user_email: booking.advertiser_email || user.email,
      org_id: booking.org_id || undefined,
      type: 'booking_payment',
      amount: booking.total_amount || 0,
      description: `Booking payment for ${booking.slots_booked || 1} slot(s) on screen ${booking.screen_id}`,
      status: 'completed',
      reference_id: provider_reference,
    });

    return Response.json({
      booking_id: booking_id,
      transaction_id: txn.id,
      status: 'active',
      already_confirmed: false,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});