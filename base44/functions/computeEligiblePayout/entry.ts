import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { org_id } = body;

    if (!org_id) {
      return Response.json({ error: 'Missing required field: org_id' }, { status: 400 });
    }

    // --- Verify the user is a member of this org ---
    const memberships = await base44.asServiceRole.entities.Membership.filter({
      user_id: user.id,
      org_id,
    });
    if (memberships.length === 0 && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: not a member of this organization' }, { status: 403 });
    }

    // --- Sum venue_earnings from all paid bookings (active + completed) ---
    // Paginate to handle large datasets.
    let totalEarnings = 0;
    let skip = 0;
    const pageSize = 200;
    let hasMoreBookings = true;
    while (hasMoreBookings) {
      const batch = await base44.asServiceRole.entities.AdBooking.filter(
        { org_id, status: { $in: ['active', 'completed'] } },
        null,
        pageSize,
        skip
      );
      for (const b of batch) {
        totalEarnings += b.venue_earnings || 0;
      }
      hasMoreBookings = batch.length === pageSize;
      skip += batch.length;
    }

    // --- Sum prior payout Transactions for this org ---
    let totalPaidOut = 0;
    skip = 0;
    let hasMoreTxns = true;
    while (hasMoreTxns) {
      const batch = await base44.asServiceRole.entities.Transaction.filter(
        { org_id, type: 'payout', status: 'completed' },
        null,
        pageSize,
        skip
      );
      for (const t of batch) {
        totalPaidOut += t.amount || 0;
      }
      hasMoreTxns = batch.length === pageSize;
      skip += batch.length;
    }

    const eligible = +(totalEarnings - totalPaidOut).toFixed(2);

    return Response.json({
      org_id,
      total_earnings: +totalEarnings.toFixed(2),
      total_paid_out: +totalPaidOut.toFixed(2),
      eligible_payout: eligible,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});