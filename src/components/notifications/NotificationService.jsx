import { base44 } from "@/api/base44Client";
import { EmailTemplates } from "./EmailTemplates";


// Notification Service - handles creating notifications and sending emails
export const NotificationService = {
  // Check user preferences before sending
  async shouldNotify(userId, notificationType) {
    try {
      const prefs = await base44.entities.NotificationPreference.filter({ user_id: userId });
      if (!prefs || prefs.length === 0) return { email: true, inApp: true }; // Default: all enabled
      
      const pref = prefs[0];
      return {
        email: pref.email_notifications && pref[notificationType] !== false,
        inApp: pref.in_app_notifications && pref[notificationType] !== false
      };
    } catch (e) {
      return { email: true, inApp: true }; // Default on error
    }
  },

  // Campaign approved notification
  async campaignApproved(booking, user, screen, venue) {
    const notify = await this.shouldNotify(user.email, "campaign_approved");
    if (!notify.inApp && !notify.email) return;
    if (notify.inApp) {
      await base44.entities.UserNotification.create({
        user_id: user.email,
        type: "campaign_approved",
        title: "Campaign Approved! 🎉",
        message: `Your campaign "${booking.campaign_name}" on ${screen?.name} has been approved and is now live.`,
        reference_id: booking.id,
        reference_type: "AdSlotBooking",
        action_url: `/MyBookings`,
        is_read: false,
        email_sent: notify.email
      });
    }

    // Send email notification
    if (notify.email) {
      try {
        await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `✅ Campaign Approved: ${booking.campaign_name} | BeyondWalls`,
        body: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        BEYONDWALLS
   Your Campaign is Now Live!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dear ${user.full_name || "Valued Advertiser"},

Great news! Your campaign has been approved and is now live.

📋 CAMPAIGN DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Campaign: ${booking.campaign_name}
📺 Screen: ${screen?.name || "N/A"}
📍 Venue: ${venue?.name || "N/A"} - ${venue?.city || "N/A"}
📅 Duration: ${booking.start_date} to ${booking.end_date}

Your ad is now being displayed to audiences. Track your campaign performance in your dashboard.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Need help? Contact us at info@beyondwalls.ae
Phone: +971 55 614 0067

BeyondWalls - Advertise Beyond Boundaries
www.beyondwalls.ae
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `.trim()
        });
      } catch (e) {
        console.error("Failed to send campaign approved email", e);
      }
    }
  },

  // Campaign rejected notification
  async campaignRejected(booking, user, reason) {
    const notify = await this.shouldNotify(user.email, "campaign_rejected");
    if (!notify.inApp && !notify.email) return;
    
    if (notify.inApp) {
      await base44.entities.UserNotification.create({
        user_id: user.email,
        type: "campaign_rejected",
        title: "Campaign Not Approved",
        message: `Your campaign "${booking.campaign_name}" was not approved. Reason: ${reason || "Does not meet guidelines"}`,
        reference_id: booking.id,
        reference_type: "AdSlotBooking",
        action_url: `/MyBookings`,
        is_read: false,
        email_sent: notify.email
      });
    }

    if (notify.email) {
      try {
        await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `Campaign Review: ${booking.campaign_name} | BeyondWalls`,
        body: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        BEYONDWALLS
   Campaign Review Update
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dear ${user.full_name || "Valued Advertiser"},

Your campaign "${booking.campaign_name}" was reviewed but could not be approved at this time.

📋 REASON
━━━━━━━━━━━━━━━━━━━━━━━━━
${reason || "The campaign does not meet our content guidelines."}

💡 NEXT STEPS
• Review our advertising guidelines
• Update your creative content
• Resubmit your campaign

Your booking amount has been refunded to your wallet.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Questions? Contact us at info@beyondwalls.ae
Phone: +971 55 614 0067

BeyondWalls - Advertise Beyond Boundaries
www.beyondwalls.ae
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `.trim()
        });
      } catch (e) {
        console.error("Failed to send campaign rejected email", e);
      }
    }
  },

  // New booking notification for venue owners
  async newBookingForVenueOwner(booking, venueOwner, screen, advertiser) {
    const notify = await this.shouldNotify(venueOwner.email, "new_booking");
    if (!notify.inApp && !notify.email) return;
    
    if (notify.inApp) {
      await base44.entities.UserNotification.create({
        user_id: venueOwner.email,
        type: "new_booking",
        title: "New Ad Booking! 💰",
        message: `${advertiser?.full_name || "An advertiser"} booked a slot on your screen "${screen?.name}" for AED ${booking.total_cost}`,
        reference_id: booking.id,
        reference_type: "AdSlotBooking",
        action_url: `/MyScreens`,
        is_read: false,
        email_sent: notify.email
      });
    }

    if (notify.email) {
      try {
        await base44.integrations.Core.SendEmail({
        to: venueOwner.email,
        subject: `💰 New Ad Booking on ${screen?.name} | BeyondWalls`,
        body: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        BEYONDWALLS
   New Booking Alert!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dear ${venueOwner.full_name || "Venue Partner"},

Great news! You have a new ad booking on your screen.

📋 BOOKING DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━
📺 Screen: ${screen?.name}
🎯 Campaign: ${booking.campaign_name}
👤 Advertiser: ${advertiser?.full_name || "Advertiser"}
📅 Duration: ${booking.start_date} to ${booking.end_date}
💰 Revenue: AED ${booking.venue_share || Math.round(booking.total_cost * 0.7)} (Your 70% share)

This revenue will be added to your wallet once the campaign completes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Questions? Contact us at info@beyondwalls.ae
Phone: +971 55 614 0067

BeyondWalls - Advertise Beyond Boundaries
www.beyondwalls.ae
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `.trim()
        });
      } catch (e) {
        console.error("Failed to send new booking email to venue owner", e);
      }
    }
  },

  // Low wallet balance warning
  async lowBalanceWarning(user, currentBalance, threshold = 100) {
    const notify = await this.shouldNotify(user.email, "low_balance");
    if (!notify.inApp && !notify.email) return;
    // Check if we already sent a low balance notification in the last 24 hours
    const recentNotifications = await base44.entities.UserNotification.filter({
      user_id: user.email,
      type: "low_balance"
    });
    
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentLowBalance = recentNotifications.find(n => 
      new Date(n.created_date) > oneDayAgo
    );
    
    if (recentLowBalance) return null; // Don't spam with low balance notifications

    if (notify.inApp) {
      await base44.entities.UserNotification.create({
        user_id: user.email,
        type: "low_balance",
        title: "Low Wallet Balance ⚠️",
        message: `Your wallet balance is AED ${currentBalance}. Top up now to keep your campaigns running.`,
        action_url: `/Wallet`,
        is_read: false,
        email_sent: notify.email
      });
    }

    if (notify.email) {
      try {
        await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `⚠️ Low Wallet Balance Alert | BeyondWalls`,
        body: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        BEYONDWALLS
   Low Balance Alert
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dear ${user.full_name || "Valued User"},

Your BeyondWalls wallet balance is running low.

💰 CURRENT BALANCE: AED ${currentBalance}

To ensure your advertising campaigns continue running smoothly, we recommend topping up your wallet soon.

👉 Top up now: Visit your Wallet page in the dashboard

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Questions? Contact us at info@beyondwalls.ae
Phone: +971 55 614 0067

BeyondWalls - Advertise Beyond Boundaries
www.beyondwalls.ae
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `.trim()
        });
      } catch (e) {
        console.error("Failed to send low balance email", e);
      }
    }
  },

  // Payout/withdrawal completed
  async payoutCompleted(user, amount, transactionId) {
    const notify = await this.shouldNotify(user.email, "withdrawal_processed");
    if (!notify.inApp && !notify.email) return;
    
    if (notify.inApp) {
      await base44.entities.UserNotification.create({
        user_id: user.email,
        type: "payout_completed",
        title: "Payout Processed! 💸",
        message: `Your withdrawal of AED ${amount} has been processed and transferred to your bank account.`,
        reference_id: transactionId,
        reference_type: "Transaction",
        action_url: `/Wallet`,
        is_read: false,
        email_sent: notify.email
      });
    }

    if (notify.email) {
      try {
        await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `✅ Withdrawal Processed: AED ${amount} | BeyondWalls`,
        body: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        BEYONDWALLS
   Withdrawal Confirmation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dear ${user.full_name || "Valued Partner"},

Your withdrawal request has been processed successfully!

💰 WITHDRAWAL DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━
Amount: AED ${amount}
Status: Completed
Date: ${new Date().toLocaleDateString()}

The funds have been transferred to your registered bank account. Please allow 1-3 business days for the amount to reflect in your account.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Questions? Contact us at info@beyondwalls.ae
Phone: +971 55 614 0067

BeyondWalls - Advertise Beyond Boundaries
www.beyondwalls.ae
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `.trim()
        });
      } catch (e) {
        console.error("Failed to send payout completed email", e);
      }
    }
  },

  // Top-up approved
  async topUpApproved(user, amount) {
    const notification = await base44.entities.UserNotification.create({
      user_id: user.email,
      type: "payout_completed",
      title: "Wallet Top-up Approved! ✅",
      message: `Your top-up of AED ${amount} has been approved and added to your wallet.`,
      action_url: `/Wallet`,
      is_read: false,
      email_sent: true
    });

    try {
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `✅ Top-up Approved: AED ${amount} | BeyondWalls`,
        body: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        BEYONDWALLS
   Top-up Confirmation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dear ${user.full_name || "Valued Advertiser"},

Your wallet top-up has been approved!

💰 TOP-UP DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━
Amount: AED ${amount}
Status: Completed
Date: ${new Date().toLocaleDateString()}

Your wallet has been credited. You can now book ad slots and launch campaigns!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Questions? Contact us at info@beyondwalls.ae
Phone: +971 55 614 0067

BeyondWalls - Advertise Beyond Boundaries
www.beyondwalls.ae
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `.trim()
      });
    } catch (e) {
      console.error("Failed to send top-up approved email", e);
    }

    return notification;
  },

  // User registration notification - send to admins and welcome email to user
  async newUserRegistration(user) {
    // Send notification to admin at hello@beyondwalls.ae
    try {
      const adminEmail = EmailTemplates.adminNewUser(
        user.full_name || "N/A",
        user.email,
        user.phone,
        user.account_type || "individual",
        user.user_role || "advertiser",
        user.company_name
      );
      
      await base44.integrations.Core.SendEmail({
        to: "hello@beyondwalls.ae",
        subject: `🆕 New User Registration: ${user.full_name} | BeyondWalls`,
        body: adminEmail
      });
    } catch (e) {
      console.error("Failed to send new user registration email to admin", e);
    }

    // Note: Email verification is handled by Base44's authentication system
    // Send welcome email to user after they verify their email
    try {
      const welcomeEmail = EmailTemplates.welcome(
        user.full_name || "Valued User",
        user.user_role || "advertiser"
      );
      
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `🎉 Welcome to BeyondWalls!`,
        body: welcomeEmail
      });
    } catch (e) {
      console.error("Failed to send welcome email to user", e);
    }
  },

  // Venue/Screen approval notification
  async venueApproved(venue, venueOwner) {
    const notification = await base44.entities.UserNotification.create({
      user_id: venueOwner.email,
      type: "venue_approved",
      title: "Venue Approved! 🎉",
      message: `Your venue "${venue.name}" has been approved. You can now add screens and start earning.`,
      reference_id: venue.id,
      reference_type: "Venue",
      action_url: `/MyVenues`,
      is_read: false,
      email_sent: true
    });

    try {
      await base44.integrations.Core.SendEmail({
        to: venueOwner.email,
        subject: `✅ Venue Approved: ${venue.name} | BeyondWalls`,
        body: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        BEYONDWALLS
   Your Venue is Approved!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dear ${venueOwner.full_name || "Venue Partner"},

Great news! Your venue has been approved and is now active in the BeyondWalls network.

📋 VENUE DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Venue: ${venue.name}
🏢 Type: ${venue.type}
📍 Location: ${venue.city}${venue.area ? `, ${venue.area}` : ''}

💡 NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━
1. Add screens to your venue
2. Configure screen settings
3. Start earning 70% revenue share from advertisers

Log in to your dashboard to get started!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Questions? Contact us at info@beyondwalls.ae
Phone: +971 55 614 0067

BeyondWalls - Advertise Beyond Boundaries
www.beyondwalls.ae
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `.trim()
      });
    } catch (e) {
      console.error("Failed to send venue approved email", e);
    }

    return notification;
  },

  async screenApproved(screen, screenOwner, venue) {
    const notification = await base44.entities.UserNotification.create({
      user_id: screenOwner.email,
      type: "screen_approved",
      title: "Screen Approved! 📺",
      message: `Your screen "${screen.name}" has been approved and is now live in the network.`,
      reference_id: screen.id,
      reference_type: "Screen",
      action_url: `/MyScreens`,
      is_read: false,
      email_sent: true
    });

    try {
      await base44.integrations.Core.SendEmail({
        to: screenOwner.email,
        subject: `📺 Screen Approved: ${screen.name} | BeyondWalls`,
        body: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        BEYONDWALLS
   Your Screen is Live!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dear ${screenOwner.full_name || "Venue Partner"},

Congratulations! Your screen has been approved and is now available for advertisers.

📋 SCREEN DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━
📺 Screen: ${screen.name}
📍 Venue: ${venue?.name || "N/A"}
📐 Size: ${screen.size}
📱 Orientation: ${screen.orientation}
💰 Slot Price: AED ${screen.slot_price}/week

Your screen is now discoverable by advertisers and you'll start earning revenue from bookings.

💰 EARNINGS
━━━━━━━━━━━━━━━━━━━━━━━━━
• You earn 70% of every booking
• Weekly automatic payouts
• Track earnings in your dashboard

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Questions? Contact us at info@beyondwalls.ae
Phone: +971 55 614 0067

BeyondWalls - Advertise Beyond Boundaries
www.beyondwalls.ae
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `.trim()
      });
    } catch (e) {
      console.error("Failed to send screen approved email", e);
    }

    return notification;
  },

  // Booking confirmation for advertiser
  async bookingCreated(booking, advertiser, screen, venue) {
    const notification = await base44.entities.UserNotification.create({
      user_id: advertiser.email,
      type: "booking_created",
      title: "Booking Confirmed! 🎯",
      message: `Your ad booking on ${screen?.name} is confirmed and pending admin approval.`,
      reference_id: booking.id,
      reference_type: "AdSlotBooking",
      action_url: `/MyBookings`,
      is_read: false,
      email_sent: true
    });

    try {
      await base44.integrations.Core.SendEmail({
        to: advertiser.email,
        subject: `✅ Booking Confirmed: ${booking.campaign_name} | BeyondWalls`,
        body: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        BEYONDWALLS
   Booking Confirmation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dear ${advertiser.full_name || "Valued Advertiser"},

Your ad booking has been confirmed and is now pending admin approval!

📋 BOOKING DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Campaign: ${booking.campaign_name}
📺 Screen: ${screen?.name || "N/A"}
📍 Venue: ${venue?.name || "N/A"} - ${venue?.city || "N/A"}
📅 Start Date: ${booking.start_date}
📅 End Date: ${booking.end_date}
💰 Total Cost: AED ${booking.total_cost}

Your creative will be reviewed by our team and approved shortly. You'll receive a confirmation email once your campaign goes live.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Questions? Contact us at info@beyondwalls.ae
Phone: +971 55 614 0067

BeyondWalls - Advertise Beyond Boundaries
www.beyondwalls.ae
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `.trim()
      });
    } catch (e) {
      console.error("Failed to send booking created email", e);
    }

    return notification;
  }
};

export default NotificationService;