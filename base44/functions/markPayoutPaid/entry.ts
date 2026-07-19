import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = user.user_role === 'admin' || user.role === 'admin';
    if (!isAdmin) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { payout_request_id } = body;
    if (!payout_request_id) {
      return Response.json({ error: 'Missing required field: payout_request_id' }, { status: 400 });
    }

    let pr;
    try {
      pr = await base44.asServiceRole.entities.PayoutRequest.get(payout_request_id);
    } catch (_) {
      return Response.json({ error: 'Payout request not found' }, { status: 404 });
    }

    if (!['pending', 'approved'].includes(pr.status)) {
      return Response.json(
        { error: `Payout request is not payable (status: ${pr.status})` },
        { status: 409 }
      );
    }

    const reference = `payout_${pr.id}`;

    // --- Idempotency: if already paid, return early ---
    if (pr.reference_id) {
      const existing = await base44.asServiceRole.entities.Transaction.filter({
        reference_id: pr.reference_id,
        type: 'payout',
      });
      if (existing.length > 0) {
        return Response.json({
          payout_request_id: pr.id,
          transaction_id: existing[0].id,
          amount: pr.amount,
          already_paid: true,
        });
      }
    }

    // --- Create the ledger row FIRST, before touching the request status ---
    const txn = await base44.asServiceRole.entities.Transaction.create({
      type: 'payout',
      user_email: pr.venue_owner_email,
      org_id: pr.org_id,
      amount: pr.amount,
      status: 'completed',
      reference_id: reference,
      description: `Payout to ${pr.venue_owner_email} — request ${pr.id}`,
    });

    // --- Then update the PayoutRequest ---
    await base44.asServiceRole.entities.PayoutRequest.update(pr.id, {
      status: 'paid',
      reference_id: reference,
      processed_date: new Date().toISOString(),
    });

    return Response.json({
      payout_request_id: pr.id,
      transaction_id: txn.id,
      amount: pr.amount,
      already_paid: false,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});