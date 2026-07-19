import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body = {};
    try {
      body = await req.json();
    } catch (_) {
      // empty body is fine
    }

    const account_type = body.account_type;
    const org_name_input = body.org_name;

    const VALID_TYPES = ['advertiser', 'venue', 'enterprise', 'agency'];
    if (!VALID_TYPES.includes(account_type)) {
      return Response.json(
        { error: 'Invalid account_type. Must be one of: advertiser, venue, enterprise, agency.' },
        { status: 400 }
      );
    }

    // Idempotency: if user already has a Membership, return the existing org + membership
    const existingMemberships = await base44.asServiceRole.entities.Membership.filter({
      user_id: user.id,
    });

    if (existingMemberships.length > 0) {
      const membership = existingMemberships[0];
      const org = await base44.asServiceRole.entities.Organization.get(membership.org_id);
      return Response.json({ org, membership, already_existed: true });
    }

    // Determine commercial_plan + commission_rate from account_type
    let commercial_plan, commission_rate;
    if (account_type === 'venue') {
      commercial_plan = 'revenue_share';
      commission_rate = 30;
    } else if (account_type === 'advertiser') {
      commercial_plan = 'revenue_share';
      commission_rate = 30;
    } else if (account_type === 'enterprise') {
      commercial_plan = 'saas';
      commission_rate = 0;
    } else if (account_type === 'agency') {
      commercial_plan = 'saas';
      commission_rate = 0;
    }

    const org_name = org_name_input || `${user.full_name || user.email} workspace`;

    // Create the Organization (service role bypasses RLS)
    const org = await base44.asServiceRole.entities.Organization.create({
      name: org_name,
      type: account_type,
      commercial_plan,
      commission_rate,
      billing_email: user.email,
      screen_count: 0,
      member_user_ids: [user.id],
    });

    // Create the Membership (service role)
    const membership = await base44.asServiceRole.entities.Membership.create({
      user_id: user.id,
      org_id: org.id,
      role: 'owner',
      user_email: user.email,
      user_name: user.full_name || '',
    });

    // Set account_type and current_org_id on the User profile (service role — User.update is admin-only)
    try {
      await base44.asServiceRole.entities.User.update(user.id, {
        account_type,
        current_org_id: org.id,
      });
    } catch (profileErr) {
      console.warn('Could not update user profile fields:', profileErr.message);
    }

    return Response.json({ org, membership, already_existed: false });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});