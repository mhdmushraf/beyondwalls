import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { org_id, amount } = body;

    if (!org_id) {
      return Response.json({ error: 'Missing required field: org_id' }, { status: 400 });
    }
    if (amount === undefined || amount === null || typeof amount !== 'number' || amount <= 0) {
      return Response.json({ error: 'Missing or invalid field: amount must be a positive number' }, { status: 400 });
    }

    // --- Verify membership (mirror computeEligiblePayout) ---
    const memberships = await base44.asServiceRole.entities.Membership.filter({
      org_id,
      user_id: user.id,
    });
    if (memberships.length === 0) {
      return Response.json({ error: 'Forbidden: not a member of this organization' }, { status: 403 });
    }

    // --- Sum venue_earnings from paid bookings (active + completed) ---
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

    // --- Subtract in-flight PayoutRequests (pending or approved) ---
    let totalInFlight = 0;
    skip = 0;
    let hasMoreInFlight = true;
    while (hasMoreInFlight) {
      const batch = await base44.asServiceRole.entities.PayoutRequest.filter(
        { org_id, status: { $in: ['pending', 'approved'] } },
        null,
        pageSize,
        skip
      );
      for (const p of batch) {
        totalInFlight += p.amount || 0;
      }
      hasMoreInFlight = batch.length === pageSize;
      skip += batch.length;
    }

    const eligible = +(totalEarnings - totalPaidOut - totalInFlight).toFixed(2);

    if (amount > eligible) {
      return Response.json(
        { error: `Requested amount (${amount}) exceeds eligible balance (${eligible})` },
        { status: 400 }
      );
    }

    // --- Fetch banking details ---
    const fullUser = await base44.asServiceRole.entities.User.get(user.id);
    if (!fullUser.iban || fullUser.iban.trim() === '') {
      return Response.json(
        { error: 'No bank details on file. Please add your IBAN in Settings before requesting a payout.' },
        { status: 400 }
      );
    }

    const payoutRequest = await base44.asServiceRole.entities.PayoutRequest.create({
      org_id,
      venue_owner_email: user.email,
      amount,
      eligible_snapshot: eligible,
      status: 'pending',
      bank_name: fullUser.bank_name || '',
      account_holder_name: fullUser.account_holder_name || '',
      iban: fullUser.iban,
      swift_code: fullUser.swift_code || '',
      description: `Payout request — ${new Date().toISOString().slice(0, 10)}`,
    });

    return Response.json(payoutRequest);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});