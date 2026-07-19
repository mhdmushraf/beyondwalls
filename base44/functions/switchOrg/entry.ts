import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const org_id = body?.org_id;
    if (!org_id) {
      return Response.json({ error: 'org_id is required' }, { status: 400 });
    }

    // Verify the user is a member of the target org
    const memberships = await base44.entities.Membership.filter(
      { user_id: user.id, org_id },
      null,
      1,
      0
    );
    if (!memberships || memberships.length === 0) {
      return Response.json(
        { error: 'You are not a member of this organization' },
        { status: 403 }
      );
    }

    // Update current_org_id using service role — User.update is admin-RLS-gated,
    // so auth.updateMe cannot persist this field.
    await base44.asServiceRole.entities.User.update(user.id, {
      current_org_id: org_id,
    });

    return Response.json({ current_org_id: org_id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});