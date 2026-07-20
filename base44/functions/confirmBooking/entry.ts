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

      // Self-heal: if the ledger was written but the status update never landed,
      // push it to active now. No new rows — the ledger already exists.
      if (booking && booking.status === 'pending_payment') {
        await base44.asServiceRole.entities.AdBooking.update(booking_id, { status: 'active' });
      }

      return Response.json({
        booking_id: booking_id,
        transaction_id: txn.id,
        status: booking?.status === 'pending_payment' ? 'active' : (booking?.status || 'active'),
        already_confirmed: true,
      });
    }

    // --- Resolve the booking ---
    const booking = await base44.asServiceRole.entities.AdBooking.get(booking_id);
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    // --- Status guard: only bookings awaiting payment can be confirmed ---
    if (booking.status !== 'pending_payment') {
      return Response.json(
        { error: `Booking is not awaiting payment (status: ${booking.status})` },
        { status: 409 }
      );
    }

    // --- Admin gate: PAYMENTS_PROVIDER is 'manual'. An admin confirms bookings
    // by hand after verifying payment out of band. When a real gateway is
    // enabled this must be invoked by a signature-verified webhook with
    // provider_reference taken from the verified payload — never from a client.
    // Do not relax this gate. ---
    const isAdmin = user.role === 'admin' || user.user_role === 'admin';
    if (!isAdmin) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // --- Ledger-before-status: create the three Transaction rows FIRST ---
    const advertiserEmail = booking.advertiser_email || user.email;
    const venueOwnerEmail = booking.venue_owner_email || advertiserEmail;
    const orgId = booking.org_id || undefined;
    const baseAmount = booking.venue_earnings || booking.base_amount || 0;
    const platformFee = booking.platform_fee || 0;
    const totalAmount = booking.total_amount || 0;

    const ledgerTxns = await base44.asServiceRole.entities.Transaction.bulkCreate([
      {
        user_email: advertiserEmail,
        org_id: undefined,
        type: 'booking_payment',
        amount: totalAmount,
        description: `Booking payment for ${booking.slots_booked || 1} slot(s) on screen ${booking.screen_id}`,
        status: 'completed',
        reference_id: provider_reference,
      },
      {
        user_email: venueOwnerEmail,
        org_id: orgId,
        type: 'earnings',
        amount: baseAmount,
        description: `Venue earnings for booking ${booking_id}`,
        status: 'completed',
        reference_id: provider_reference,
      },
      {
        user_email: venueOwnerEmail,
        org_id: orgId,
        type: 'platform_fee',
        amount: platformFee,
        description: `Platform service fee for booking ${booking_id}`,
        status: 'completed',
        reference_id: provider_reference,
      },
    ]);

    // --- Now mark the booking active ---
    await base44.asServiceRole.entities.AdBooking.update(booking_id, {
      status: 'active',
    });

    // --- Increment the screen's total_revenue (best-effort) ---
    if (booking.screen_id) {
      try {
        const screen = await base44.asServiceRole.entities.Screen.get(booking.screen_id);
        if (screen) {
          const currentRevenue = typeof screen.total_revenue === 'number' ? screen.total_revenue : 0;
          await base44.asServiceRole.entities.Screen.update(screen.id, {
            total_revenue: +(currentRevenue + totalAmount).toFixed(2),
          });
        }
      } catch (_) { /* non-fatal: revenue increment is best-effort */ }
    }

    return Response.json({
      booking_id: booking_id,
      transaction_ids: ledgerTxns.map((t) => t.id),
      status: 'active',
      already_confirmed: false,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});