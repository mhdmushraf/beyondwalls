import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { generateSetupCode, generateScreenPin, generateDeviceToken } from '../../shared/screenCodes.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { org_id, site_id, screens } = body;

    if (!org_id || !site_id) {
      return Response.json({ error: 'Missing required fields: org_id, site_id' }, { status: 400 });
    }
    if (!Array.isArray(screens) || screens.length === 0) {
      return Response.json({ error: 'Missing or invalid screens array' }, { status: 400 });
    }
    if (screens.length > 100) {
      return Response.json({ error: 'Too many screens (max 100 per call)' }, { status: 400 });
    }

    // --- Verify user is a member of this org ---
    const memberships = await base44.asServiceRole.entities.Membership.filter({ user_id: user.id, org_id });
    if (memberships.length === 0 && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: not a member of this organization' }, { status: 403 });
    }

    // --- Load the org for member_user_ids denormalization ---
    const org = await base44.asServiceRole.entities.Organization.get(org_id);
    if (!org) {
      return Response.json({ error: 'Organization not found' }, { status: 404 });
    }

    const memberUserIds = org.member_user_ids || [];

    // --- Create screens ---
    const created = [];
    const failed = [];

    for (const screen of screens) {
      if (!screen.name) {
        failed.push({ name: screen.name || '(unnamed)', error: 'Missing name' });
        continue;
      }
      try {
        const setup_code = generateSetupCode();
        const screen_pin = generateScreenPin();
        const device_token = generateDeviceToken();

        const record = await base44.asServiceRole.entities.Screen.create({
          name: screen.name,
          org_id,
          site_id,
          venue_id: null,
          org_member_user_ids: memberUserIds,
          setup_code,
          screen_pin,
          device_token,
          price_per_week: Number(screen.price_per_week) || 0,
          public_ad_slots: Number(screen.public_ad_slots) || 7,
          internal_slots: Number(screen.internal_slots) || 3,
          slot_duration: Number(screen.slot_duration) || 30,
          location_description: screen.location_description || null,
          status: 'pending',
          approval_status: 'pending',
        });

        created.push({
          id: record.id,
          name: record.name,
          setup_code: record.setup_code,
          screen_pin: record.screen_pin,
        });
      } catch (e) {
        failed.push({ name: screen.name, error: e.message });
      }
    }

    // --- Update Site.screen_count ---
    if (created.length > 0) {
      try {
        const site = await base44.asServiceRole.entities.Site.get(site_id);
        if (site) {
          await base44.asServiceRole.entities.Site.update(site_id, {
            screen_count: (site.screen_count || 0) + created.length,
          });
        }
      } catch (_) { /* best effort */ }

      // --- Update Organization.screen_count ---
      try {
        await base44.asServiceRole.entities.Organization.update(org_id, {
          screen_count: (org.screen_count || 0) + created.length,
        });
      } catch (_) { /* best effort */ }
    }

    return Response.json({ created, failed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});