import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { booking_id, decision, rejection_reason } = body;

    // --- Validate inputs ---
    if (!booking_id || (decision !== 'approved' && decision !== 'rejected')) {
      return Response.json(
        { error: 'Missing or invalid booking_id or decision' },
        { status: 400 }
      );
    }
    if (decision === 'rejected' && (!rejection_reason || !rejection_reason.trim())) {
      return Response.json(
        { error: 'rejection_reason is required when rejecting' },
        { status: 400 }
      );
    }

    // --- Fetch the booking (service role) ---
    const booking = await base44.asServiceRole.entities.AdBooking.get(booking_id);
    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    // --- Authorize: caller must be a member of the org that owns the screen ---
    const memberships = await base44.asServiceRole.entities.Membership.filter({
      org_id: booking.org_id,
      user_id: user.id,
    });
    const isAdmin = user.user_role === 'admin' || user.role === 'admin';
    if (memberships.length === 0 && !isAdmin) {
      return Response.json(
        { error: 'Forbidden: not a member of this organization' },
        { status: 403 }
      );
    }

    // --- Status guard: only pending_review may be reviewed ---
    if (booking.creative_status !== 'pending_review') {
      return Response.json(
        { error: `Creative already reviewed (status: ${booking.creative_status})` },
        { status: 409 }
      );
    }

    // --- Update the booking creative status ---
    const reviewedAt = new Date().toISOString();
    await base44.asServiceRole.entities.AdBooking.update(booking_id, {
      creative_status: decision,
      creative_reviewed_at: reviewedAt,
      creative_reviewed_by: user.email,
      creative_rejection_reason: decision === 'rejected' ? rejection_reason.trim() : '',
    });

    return Response.json({
      booking_id,
      creative_status: decision,
      reviewed_at: reviewedAt,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});