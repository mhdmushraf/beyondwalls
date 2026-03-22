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

    const { amount } = await req.json();

    // Validate amount
    if (!amount || amount < 100) {
      return Response.json({ error: 'Minimum withdrawal is AED 100' }, { status: 400 });
    }

    // Check if user has Stripe account connected
    if (!user.stripe_account_id) {
      return Response.json({ 
        error: 'Please connect your Stripe account first in Payout Settings',
        requiresSetup: true 
      }, { status: 400 });
    }

    // Verify user has sufficient eligible balance
    const calculatedEligible = user.eligible_balance || 0;
    if (amount > calculatedEligible) {
      return Response.json({ 
        error: `Insufficient eligible balance. You have AED ${calculatedEligible} available for withdrawal.` 
      }, { status: 400 });
    }

    // Create Stripe transfer to connected account
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to fils (cents)
      currency: 'aed',
      destination: user.stripe_account_id,
      description: `Payout to ${user.full_name}`,
      metadata: {
        user_id: user.email,
        user_name: user.full_name,
        base44_app_id: Deno.env.get("BASE44_APP_ID")
      }
    });

    // Create transaction record
    const newBalance = (user.wallet_balance || 0) - amount;
    const newEligibleBalance = (user.eligible_balance || 0) - amount;

    await base44.entities.Transaction.create({
      user_id: user.email,
      type: "withdrawal",
      amount: -amount,
      balance_after: newBalance,
      description: `Stripe payout - ${transfer.id}`,
      status: "completed",
      reference_id: transfer.id,
      payment_method: "bank_transfer"
    });

    // Update user balances
    await base44.auth.updateMe({
      wallet_balance: newBalance,
      eligible_balance: newEligibleBalance
    });

    // Send confirmation email
    try {
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: "Withdrawal Processed Successfully",
        body: `
          <h2>Withdrawal Confirmed</h2>
          <p>Hi ${user.full_name},</p>
          <p>Your withdrawal request of <strong>AED ${amount.toLocaleString()}</strong> has been processed successfully.</p>
          <p><strong>Transfer ID:</strong> ${transfer.id}</p>
          <p><strong>New Balance:</strong> AED ${newBalance.toLocaleString()}</p>
          <p><strong>New Eligible Balance:</strong> AED ${newEligibleBalance.toLocaleString()}</p>
          <p>The funds will arrive in your bank account within 2-3 business days.</p>
          <br/>
          <p>Best regards,<br/>BeyondWalls Team</p>
        `
      });
    } catch (emailError) {
      console.error("Email notification failed:", emailError);
    }

    return Response.json({
      success: true,
      transfer_id: transfer.id,
      amount,
      new_balance: newBalance,
      new_eligible_balance: newEligibleBalance
    });

  } catch (error) {
    console.error("Payout error:", error);
    return Response.json({ 
      error: error.message || 'Failed to process payout' 
    }, { status: 500 });
  }
});