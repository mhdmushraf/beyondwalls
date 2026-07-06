import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const FOUNDER_EMAIL = 'musharaf@beyondwalls.ae';
const ORG_NAME = 'Beyond Walls (founder)';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });
    }

    // 1. Find the founder user by email
    const founderUsers = await base44.asServiceRole.entities.User.filter({
      email: FOUNDER_EMAIL,
    });
    if (!founderUsers || founderUsers.length === 0) {
      return Response.json({ error: `Founder user not found: ${FOUNDER_EMAIL}` }, { status: 404 });
    }
    const founder = founderUsers[0];

    // 2. Idempotent: check if org already exists for founder via Membership
    let org;
    let orgAlreadyExisted = false;

    const existingMemberships = await base44.asServiceRole.entities.Membership.filter({
      user_id: founder.id,
    });

    if (existingMemberships.length > 0) {
      // Find or create the founder org specifically
      const founderOrgMemberships = existingMemberships.filter((m) => {
        // We'll check the org name after fetching
        return true;
      });

      // Look through memberships to find an org named "Beyond Walls (founder)"
      for (const m of founderOrgMemberships) {
        try {
          const candidateOrg = await base44.asServiceRole.entities.Organization.get(m.org_id);
          if (candidateOrg && candidateOrg.name === ORG_NAME) {
            org = candidateOrg;
            orgAlreadyExisted = true;
            break;
          }
        } catch (_) {
          // org may have been deleted, continue
        }
      }
    }

    if (!org) {
      org = await base44.asServiceRole.entities.Organization.create({
        name: ORG_NAME,
        type: 'enterprise',
        commercial_plan: 'saas',
        commission_rate: 0,
        billing_email: founder.email,
        screen_count: 0,
        member_user_ids: [founder.id],
      });

      await base44.asServiceRole.entities.Membership.create({
        user_id: founder.id,
        org_id: org.id,
        role: 'owner',
        user_email: founder.email,
        user_name: founder.full_name || '',
      });
    }

    // 3. Find all screens owned by the founder
    const screens = await base44.asServiceRole.entities.Screen.filter({
      owner_email: FOUNDER_EMAIL,
    });

    let screensUpdated = 0;
    let screensAlreadyMigrated = 0;
    let approvalGrandfathered = 0;

    for (const screen of screens) {
      const updates = {};
      const needsUpdate = [];

      // Set org_id if missing or different
      if (screen.org_id !== org.id) {
        updates.org_id = org.id;
        needsUpdate.push('org_id');
      }

      // Set monetization_mode if missing
      if (!screen.monetization_mode) {
        updates.monetization_mode = 'marketplace';
        needsUpdate.push('monetization_mode');
      }

      // Grandfather: set approval_status="approved" if not already
      if (screen.approval_status !== 'approved') {
        updates.approval_status = 'approved';
        needsUpdate.push('approval_status');
        approvalGrandfathered++;
      }

      if (needsUpdate.length > 0) {
        await base44.asServiceRole.entities.Screen.update(screen.id, updates);
        screensUpdated++;
      } else {
        screensAlreadyMigrated++;
      }
    }

    // 4. Set screen_count on the org to the number of founder screens
    const totalFounderScreens = screens.length;
    if (org.screen_count !== totalFounderScreens) {
      await base44.asServiceRole.entities.Organization.update(org.id, {
        screen_count: totalFounderScreens,
      });
      org.screen_count = totalFounderScreens;
    }

    return Response.json({
      success: true,
      org: {
        id: org.id,
        name: org.name,
        type: org.type,
        commercial_plan: org.commercial_plan,
        commission_rate: org.commission_rate,
        screen_count: totalFounderScreens,
      },
      founder: {
        id: founder.id,
        email: founder.email,
        full_name: founder.full_name,
      },
      screens_total: totalFounderScreens,
      screens_updated: screensUpdated,
      screens_already_migrated: screensAlreadyMigrated,
      approval_grandfathered: approvalGrandfathered,
      org_already_existed: orgAlreadyExisted,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});