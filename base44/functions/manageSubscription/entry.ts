import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// =============================================================================
// PAYMENTS CONFIG — mirrors createBookingCheckout. Single source of truth for
// the payment gateway. Change PAYMENTS_PROVIDER here and in createBookingCheckout
// to switch providers app-wide.
//   "manual" — no real gateway; returns a mock success URL (default, dev/staging)
//   "tap"    — Tap Payments (AED-friendly, popular in UAE/GCC)
//   "stripe" — Stripe Checkout
// =============================================================================
const PAYMENTS_PROVIDER = 'manual';

interface CreateCheckoutInput {
  referenceId: string;
  amount: number;
  currency: string;
  description: string;
  successUrl: string;
  cancelUrl: string;
}

interface CheckoutResult {
  checkoutUrl: string;
  provider: string;
  referenceId: string;
}

async function createCheckout(input: CreateCheckoutInput): Promise<CheckoutResult> {
  switch (PAYMENTS_PROVIDER) {
    case 'manual':
      return createManualCheckout(input);
    case 'tap':
      return createTapCheckout(input);
    case 'stripe':
      return createStripeCheckout(input);
    default:
      throw new Error(`Unknown PAYMENTS_PROVIDER: "${PAYMENTS_PROVIDER}"`);
  }
}

async function createManualCheckout(input: CreateCheckoutInput): Promise<CheckoutResult> {
  const url = `/settings?checkout=manual_success&reference=${encodeURIComponent(input.referenceId)}`;
  return { checkoutUrl: url, provider: 'manual', referenceId: input.referenceId };
}

async function createTapCheckout(_input: CreateCheckoutInput): Promise<CheckoutResult> {
  throw new Error(
    'Tap provider not configured. Set PAYMENTS_PROVIDER="tap", add TAP_SECRET_KEY secret, ' +
    'then implement the fetch call in createTapCheckout().'
  );
}

async function createStripeCheckout(_input: CreateCheckoutInput): Promise<CheckoutResult> {
  throw new Error(
    'Stripe provider not configured. Set PAYMENTS_PROVIDER="stripe", add STRIPE_SECRET_KEY secret, ' +
    'then implement the fetch call in createStripeCheckout().'
  );
}

// =============================================================================
// MAIN HANDLER
// =============================================================================
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, org_id } = body;

    if (!action || !org_id) {
      return Response.json({ error: 'Missing required fields: action, org_id' }, { status: 400 });
    }

    // --- Verify user is a member of this org ---
    const memberships = await base44.asServiceRole.entities.Membership.filter({ user_id: user.id, org_id });
    if (memberships.length === 0 && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: not a member of this organization' }, { status: 403 });
    }

    // --- Load the org ---
    const org = await base44.asServiceRole.entities.Organization.get(org_id);
    if (!org) {
      return Response.json({ error: 'Organization not found' }, { status: 404 });
    }

    // --- Helper: get or create subscription for org ---
    async function getOrCreateSubscription() {
      const subs = await base44.asServiceRole.entities.Subscription.filter({ org_id }, null, 1, 0);
      if (subs.length > 0) return subs[0];
      return await base44.asServiceRole.entities.Subscription.create({
        org_id,
        plan: org.commercial_plan || 'revenue_share',
        screen_quantity: 0,
        status: 'active',
      });
    }

    // =================================================================
    // ACTION: add_screen
    //   Creates a Screen. For saas orgs, increments screen_quantity.
    //   For revenue_share orgs, no charge.
    // =================================================================
    if (action === 'add_screen') {
      const { screen_name, venue_id } = body;
      if (!screen_name || !venue_id) {
        return Response.json({ error: 'Missing required fields: screen_name, venue_id' }, { status: 400 });
      }

      const screen = await base44.asServiceRole.entities.Screen.create({
        name: screen_name,
        venue_id,
        org_id,
        org_member_user_ids: org.member_user_ids || [],
        status: 'pending',
        approval_status: 'pending',
      });

      let subscriptionUpdated = false;
      if (org.commercial_plan === 'saas') {
        const subscription = await getOrCreateSubscription();
        await base44.asServiceRole.entities.Subscription.update(subscription.id, {
          screen_quantity: (subscription.screen_quantity || 0) + 1,
          plan: 'saas',
        });
        subscriptionUpdated = true;
      }

      await base44.asServiceRole.entities.Organization.update(org_id, {
        screen_count: (org.screen_count || 0) + 1,
      });

      return Response.json({
        screen_id: screen.id,
        subscription_updated: subscriptionUpdated,
      });
    }

    // =================================================================
    // ACTION: update_plan
    //   Upgrades or downgrades the org's commercial plan.
    //   For saas, creates a checkout for screen_quantity × price_per_screen.
    // =================================================================
    if (action === 'update_plan') {
      const { new_plan } = body;
      if (!new_plan || !['revenue_share', 'saas'].includes(new_plan)) {
        return Response.json({ error: 'Invalid new_plan. Must be "revenue_share" or "saas".' }, { status: 400 });
      }

      const commissionRate = new_plan === 'saas' ? 0 : 30;
      await base44.asServiceRole.entities.Organization.update(org_id, {
        commercial_plan: new_plan,
        commission_rate: commissionRate,
      });

      const subscription = await getOrCreateSubscription();
      await base44.asServiceRole.entities.Subscription.update(subscription.id, {
        plan: new_plan,
      });

      let checkoutUrl = null;
      if (new_plan === 'saas' && (subscription.screen_quantity || 0) > 0) {
        const contracts = await base44.asServiceRole.entities.Contract.filter({ org_id }, null, 1, 0);
        const pricePerScreen = contracts[0]?.price_per_screen || 0;
        const amount = +(pricePerScreen * (subscription.screen_quantity || 0)).toFixed(2);

        if (amount > 0) {
          const appUrl = Deno.env.get('APP_URL') || '';
          const successUrl = appUrl
            ? `${appUrl}/settings?checkout=success&subscription=${subscription.id}`
            : `/settings?checkout=success&subscription=${subscription.id}`;
          const cancelUrl = appUrl
            ? `${appUrl}/settings?checkout=cancelled&subscription=${subscription.id}`
            : `/settings?checkout=cancelled&subscription=${subscription.id}`;

          const checkout = await createCheckout({
            referenceId: subscription.id,
            amount,
            currency: 'AED',
            description: `SaaS subscription: ${subscription.screen_quantity} screen(s) × AED ${pricePerScreen}/month`,
            successUrl,
            cancelUrl,
          });

          await base44.asServiceRole.entities.Subscription.update(subscription.id, {
            provider_ref: checkout.referenceId,
          });

          checkoutUrl = checkout.checkoutUrl;
        }
      }

      return Response.json({
        org_id,
        new_plan,
        subscription_id: subscription.id,
        checkout_url: checkoutUrl,
      });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});