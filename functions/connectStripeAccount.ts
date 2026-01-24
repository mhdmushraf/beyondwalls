import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create or retrieve Stripe Connect account
    let accountId = user.stripe_account_id;

    if (!accountId) {
      // Create new Stripe Connect account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'AE',
        email: user.email,
        capabilities: {
          transfers: { requested: true }
        },
        business_type: user.is_venue_owner ? 'company' : 'individual',
        metadata: {
          user_id: user.email,
          base44_app_id: Deno.env.get("BASE44_APP_ID")
        }
      });

      accountId = account.id;

      // Save account ID to user
      await base44.auth.updateMe({
        stripe_account_id: accountId
      });
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${req.headers.get('origin')}/wallet?setup=refresh`,
      return_url: `${req.headers.get('origin')}/wallet?setup=complete`,
      type: 'account_onboarding'
    });

    return Response.json({
      url: accountLink.url,
      account_id: accountId
    });

  } catch (error) {
    console.error("Stripe Connect error:", error);
    return Response.json({ 
      error: error.message || 'Failed to connect Stripe account' 
    }, { status: 500 });
  }
});