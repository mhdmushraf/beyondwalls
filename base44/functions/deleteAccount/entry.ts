import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all user-related data
    // This is a simple implementation - you may want to add more cascade deletes

    // Delete campaigns
    const campaigns = await base44.asServiceRole.entities.Campaign.filter({ advertiser_id: user.email });
    for (const campaign of campaigns) {
      await base44.asServiceRole.entities.Campaign.delete(campaign.id);
    }

    // Delete bookings
    const bookings = await base44.asServiceRole.entities.AdSlotBooking.filter({ advertiser_id: user.email });
    for (const booking of bookings) {
      await base44.asServiceRole.entities.AdSlotBooking.delete(booking.id);
    }

    // Delete favorites
    const favorites = await base44.asServiceRole.entities.FavoriteScreen.filter({ user_id: user.email });
    for (const fav of favorites) {
      await base44.asServiceRole.entities.FavoriteScreen.delete(fav.id);
    }

    // Delete budget alerts
    const alerts = await base44.asServiceRole.entities.BudgetAlert.filter({ advertiser_id: user.email });
    for (const alert of alerts) {
      await base44.asServiceRole.entities.BudgetAlert.delete(alert.id);
    }

    // Delete auto-booking rules
    const rules = await base44.asServiceRole.entities.AutoBookingRule.filter({ advertiser_id: user.email });
    for (const rule of rules) {
      await base44.asServiceRole.entities.AutoBookingRule.delete(rule.id);
    }

    // Delete transactions
    const transactions = await base44.asServiceRole.entities.Transaction.filter({ user_id: user.email });
    for (const tx of transactions) {
      await base44.asServiceRole.entities.Transaction.delete(tx.id);
    }

    // Delete wallet requests
    const walletReqs = await base44.asServiceRole.entities.WalletRequest.filter({ user_id: user.email });
    for (const req of walletReqs) {
      await base44.asServiceRole.entities.WalletRequest.delete(req.id);
    }

    // Delete creatives
    const creatives = await base44.asServiceRole.entities.Creative.filter({ advertiser_id: user.email });
    for (const creative of creatives) {
      await base44.asServiceRole.entities.Creative.delete(creative.id);
    }

    return Response.json({ 
      success: true,
      message: 'Account and all associated data deleted successfully' 
    });
  } catch (error) {
    return Response.json({ 
      error: error.message || 'Failed to delete account' 
    }, { status: 500 });
  }
});