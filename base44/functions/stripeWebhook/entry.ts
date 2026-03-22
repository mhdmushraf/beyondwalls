import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: '2024-12-18.acacia',
});

Deno.serve(async (req) => {
  // Initialize Base44 client
  const base44 = createClientFromRequest(req);
  
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!signature) {
    console.error('❌ Missing stripe-signature header');
    return Response.json({ error: 'Missing signature' }, { status: 400 });
  }

  try {
    const body = await req.text();
    
    // Verify webhook signature
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret
    );

    console.log('✅ Webhook verified:', event.type);

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const metadata = session.metadata;

      console.log('💰 Payment completed:', {
        user: metadata.user_id,
        amount: metadata.amount,
        type: metadata.type
      });

      // Get user first to calculate balance_after
      const users = await base44.asServiceRole.entities.User.list();
      const user = users.find(u => u.email === metadata.user_id);
      
      if (!user) {
        console.error('❌ User not found:', metadata.user_id);
        return Response.json({ error: 'User not found' }, { status: 400 });
      }

      const currentBalance = user.wallet_balance || 0;
      const topUpAmount = parseFloat(metadata.amount);
      const newBalance = currentBalance + topUpAmount;

      console.log('💵 Balance calculation:', { 
        currentBalance, 
        topUpAmount, 
        newBalance 
      });

      // Create transaction record with correct balance_after
      const transaction = await base44.asServiceRole.entities.Transaction.create({
        user_id: metadata.user_id,
        type: 'top_up',
        amount: topUpAmount,
        balance_after: newBalance,
        reference_id: session.id,
        description: `Wallet top-up via Stripe (${session.payment_method_types?.[0] || 'card'})`,
        status: 'completed',
        payment_method: session.payment_method_types?.[0] || 'card'
      });

      console.log('✅ Transaction created:', transaction.id, 'balance_after:', newBalance);

      // Update user wallet balance
      await base44.asServiceRole.entities.User.update(user.id, {
        wallet_balance: newBalance
      });

      console.log('✅ User wallet updated:', { 
        userId: user.id,
        email: metadata.user_id, 
        previousBalance: currentBalance,
        topUpAmount: topUpAmount,
        newBalance: newBalance 
      });
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return Response.json({ 
      error: 'Webhook handler failed',
      details: error.message 
    }, { status: 400 });
  }
});