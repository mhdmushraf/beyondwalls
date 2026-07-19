import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ALLOWED_FIELDS = [
  "full_name",
  "phone",
  "company_name",
  "onboarding_completed"
];

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

    // Build payload from the whitelist only — never spread the request body.
    const payload = {};
    for (const field of ALLOWED_FIELDS) {
      if (body[field] !== undefined) {
        payload[field] = body[field];
      }
    }

    if (Object.keys(payload).length === 0) {
      return Response.json(
        { error: 'No valid fields to update. Allowed fields: ' + ALLOWED_FIELDS.join(', ') },
        { status: 400 }
      );
    }

    // Always write to the authenticated user's own id — never accept a target id from the body.
    await base44.asServiceRole.entities.User.update(user.id, payload);

    return Response.json({ updated_fields: Object.keys(payload) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});