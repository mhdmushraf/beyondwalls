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
    const { payout_request_id, admin_notes } = body;
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
        { error: `Payout request is not rejectable (status: ${pr.status})` },
        { status: 409 }
      );
    }

    await base44.asServiceRole.entities.PayoutRequest.update(pr.id, {
      status: 'rejected',
      admin_notes: admin_notes || '',
      processed_date: new Date().toISOString(),
    });

    return Response.json({ payout_request_id: pr.id, status: 'rejected' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});