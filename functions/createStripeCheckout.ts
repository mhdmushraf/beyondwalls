import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: '2024-12-18.acacia',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, priceId } = await req.json();

    if (!amount || !priceId) {
      return Response.json({ error: 'Amount and priceId are required' }, { status: 400 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/Wallet?success=true`,
      cancel_url: `${req.headers.get('origin')}/Wallet?canceled=true`,
      customer_email: user.email,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        user_id: user.email,
        amount: amount.toString(),
        type: 'wallet_topup'
      }
    });

    console.log('✅ Checkout session created:', session.id);

    return Response.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error('❌ Stripe checkout error:', error);
    return Response.json({ 
      error: 'Failed to create checkout session',
      details: error.message 
    }, { status: 500 });
  }
});