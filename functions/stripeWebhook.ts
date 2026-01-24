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

      // Send confirmation email via Gmail
      try {
        const accessToken = await base44.asServiceRole.connectors.getAccessToken("gmail");
        
        const emailContent = `Subject: Payment Confirmation - Wallet Top-Up Successful
To: ${metadata.user_id}
Content-Type: text/html; charset=utf-8

<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
    .amount { font-size: 32px; font-weight: bold; color: #10b981; margin: 20px 0; }
    .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .label { color: #6b7280; }
    .value { font-weight: 600; }
    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Payment Successful!</h1>
      <p>Your wallet has been topped up</p>
    </div>
    <div class="content">
      <div class="amount">+AED ${topUpAmount.toLocaleString()}</div>
      
      <div class="details">
        <div class="row">
          <span class="label">Transaction ID</span>
          <span class="value">${session.id}</span>
        </div>
        <div class="row">
          <span class="label">Payment Method</span>
          <span class="value">${session.payment_method_types?.[0] || 'Card'}</span>
        </div>
        <div class="row">
          <span class="label">Previous Balance</span>
          <span class="value">AED ${currentBalance.toLocaleString()}</span>
        </div>
        <div class="row">
          <span class="label">Amount Added</span>
          <span class="value">AED ${topUpAmount.toLocaleString()}</span>
        </div>
        <div class="row" style="border: none;">
          <span class="label">New Balance</span>
          <span class="value" style="color: #10b981; font-size: 18px;">AED ${newBalance.toLocaleString()}</span>
        </div>
      </div>
      
      <p style="text-align: center; margin-top: 30px;">
        <a href="https://beyondwalls.base44.com/Wallet" style="background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">View Wallet</a>
      </p>
      
      <div class="footer">
        <p>Thank you for using BeyondWalls!</p>
        <p>If you have any questions, please contact us at support@beyondwalls.ae</p>
      </div>
    </div>
  </div>
</body>
</html>`;

        const encodedEmail = btoa(emailContent).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        
        const gmailResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw: encodedEmail })
        });

        if (gmailResponse.ok) {
          console.log('✅ Confirmation email sent to:', metadata.user_id);
        } else {
          const errorData = await gmailResponse.text();
          console.error('❌ Failed to send email:', errorData);
        }
      } catch (emailError) {
        console.error('❌ Email sending error:', emailError.message);
        // Don't fail the webhook if email fails
      }
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