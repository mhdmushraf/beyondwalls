import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Megaphone,
  MonitorPlay,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Clock,
  Calendar,
  User,
  Loader2,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import LiveScreenPreview from "@/components/previews/LiveScreenPreview";
import { NotificationService } from "@/components/notifications/NotificationService";

export default function AdminBookings() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

  // All hooks MUST be called before any conditional returns
  const { data: bookings = [], isLoading: bookingsLoading, error: bookingsError } = useQuery({
    queryKey: ["all-bookings"],
    queryFn: () => base44.entities.AdSlotBooking.list("-created_date", 100),
    enabled: authChecked && !!user
  });

  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ["all-campaigns-admin"],
    queryFn: () => base44.entities.Campaign.list("-created_date", 100),
    enabled: authChecked && !!user
  });

  const { data: screens = [] } = useQuery({
    queryKey: ["all-screens"],
    queryFn: () => base44.entities.Screen.list(),
    enabled: authChecked && !!user
  });

  const { data: venues = [] } = useQuery({
    queryKey: ["all-venues"],
    queryFn: () => base44.entities.Venue.list(),
    enabled: authChecked && !!user
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl("AdminBookings"));
        return;
      }
      const userData = await base44.auth.me();
      const isAdmin = userData?.user_role === "admin" || userData?.role === "admin";
      if (!isAdmin) {
        window.location.href = createPageUrl("Dashboard");
        return;
      }
      setUser(userData);
      setAuthChecked(true);
    } catch (e) {
      base44.auth.redirectToLogin(createPageUrl("AdminBookings"));
    }
  };

  const isLoading = bookingsLoading || campaignsLoading;

  if (!authChecked) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (bookingsError) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <XCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <p className="text-slate-700 font-medium">Failed to load bookings</p>
          <p className="text-slate-500 text-sm">{bookingsError.message}</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["all-bookings"] })} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Combine bookings and campaigns for unified view
  const allItems = [
    ...bookings.map(b => ({ ...b, source: "booking" })),
    ...campaigns.map(c => ({
      id: c.id,
      campaign_name: c.name,
      advertiser_id: c.advertiser_id,
      status: c.status === "pending_approval" ? "pending" : c.status,
      start_date: c.start_date,
      end_date: c.end_date,
      creative_url: c.creative_url,
      creative_type: c.creative_type,
      total_cost: c.total_cost || c.budget,
      screen_ids: c.screen_ids || [],
      created_date: c.created_date,
      source: "campaign"
    }))
  ];

  const pendingBookings = allItems.filter(b => b.status === "pending" || b.status === "pending_approval");
  const activeBookings = allItems.filter(b => b.status === "active");
  const completedBookings = allItems.filter(b => b.status === "completed" || b.status === "cancelled");

  const filteredBookings = (list) => list.filter(b => 
    b.campaign_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.advertiser_id?.toLowerCase().includes(search.toLowerCase())
  );

  const getScreenInfo = (screenId) => {
    const screen = screens.find(s => s.id === screenId);
    const venue = screen ? venues.find(v => v.id === screen.venue_id) : null;
    return { screen, venue };
  };

  const handleApprove = async (booking) => {
    setProcessing(true);
    try {
      const totalCost = booking.total_cost || 0;
      const venueShare = totalCost * 0.7;
      const platformShare = totalCost * 0.3;

      // Handle campaign vs booking differently
      if (booking.source === "campaign") {
        const campaignCost = booking.total_cost || 0;
        const campaignVenueShare = campaignCost * 0.7;
        const campaignPlatformShare = campaignCost * 0.3;

        await base44.entities.Campaign.update(booking.id, {
          status: "active",
          approved_at: new Date().toISOString(),
          approved_by: user.email,
          venue_share: campaignVenueShare,
          platform_share: campaignPlatformShare
        });

        // Distribute earnings to venue owners for each screen
        const screenIds = booking.screen_ids || [];
        if (screenIds.length > 0) {
          const perScreenShare = campaignVenueShare / screenIds.length;
          
          for (const screenId of screenIds) {
            const screen = screens.find(s => s.id === screenId);
            if (screen?.owner_id) {
              try {
                // Fetch fresh owner data to get accurate balance
                const ownerData = await base44.entities.User.filter({ email: screen.owner_id });
                if (ownerData.length > 0) {
                  const owner = ownerData[0];
                  const currentBalance = owner.wallet_balance || 0;
                  const newBalance = currentBalance + perScreenShare;
                  
                  await base44.entities.User.update(owner.id, {
                    wallet_balance: newBalance,
                    total_earnings: (owner.total_earnings || 0) + perScreenShare
                  });

                  await base44.entities.Transaction.create({
                    user_id: owner.email,
                    type: "earning",
                    amount: perScreenShare,
                    balance_after: newBalance,
                    reference_id: booking.id,
                    description: `AI Campaign earning (70%): ${booking.campaign_name}`,
                    status: "completed"
                  });

                  // Send earning notification
                  const venue = venues.find(v => v.id === screen.venue_id);
                  try {
                    await base44.integrations.Core.SendEmail({
                      to: owner.email,
                      subject: `💰 New Earning: AED ${perScreenShare.toLocaleString()} | BeyondWalls`,
                      body: `Great news! A new AI campaign has been approved on your screen!\n\nScreen: ${screen.name}\nVenue: ${venue?.name || 'N/A'}\nCampaign: ${booking.campaign_name}\n\n💵 Your Share (70%): AED ${perScreenShare.toLocaleString()}\n\nThe earnings have been credited to your wallet.`
                    });
                  } catch (emailErr) {
                    console.log("Venue owner email failed");
                  }
                }
              } catch (ownerErr) {
                console.log("Failed to credit venue owner:", ownerErr);
              }
            }
          }
        }

        // Credit BeyondWalls Platform Wallet
        try {
          const platformWallets = await base44.entities.PlatformWallet.list();
          let platformBalance = 0;
          
          if (platformWallets.length === 0) {
            await base44.entities.PlatformWallet.create({
              name: "BeyondWalls Platform",
              balance: campaignPlatformShare,
              total_revenue: campaignPlatformShare,
              total_tax_collected: 0
            });
            platformBalance = campaignPlatformShare;
          } else {
            const platformWallet = platformWallets[0];
            platformBalance = (platformWallet.balance || 0) + campaignPlatformShare;
            await base44.entities.PlatformWallet.update(platformWallet.id, {
              balance: platformBalance,
              total_revenue: (platformWallet.total_revenue || 0) + campaignPlatformShare
            });
          }

          await base44.entities.Transaction.create({
            user_id: "platform@beyondwalls.ae",
            type: "earning",
            amount: campaignPlatformShare,
            balance_after: platformBalance,
            reference_id: booking.id,
            description: `Platform commission (30%): ${booking.campaign_name}`,
            status: "completed"
          });
        } catch (platformErr) {
          console.log("Platform wallet update failed:", platformErr);
        }
        
        // Send approval email to advertiser
        try {
          await base44.integrations.Core.SendEmail({
            to: booking.advertiser_id,
            subject: `✅ Campaign Approved: ${booking.campaign_name} | BeyondWalls`,
            body: `Your AI campaign "${booking.campaign_name}" has been approved and is now LIVE!\n\nDuration: ${booking.start_date} - ${booking.end_date}\nInvestment: AED ${campaignCost.toLocaleString()}\nScreens: ${screenIds.length}\n\nTrack your campaign performance in your dashboard.`
          });
        } catch (emailErr) {
          console.log("Email failed but campaign approved");
        }
        
        toast.success("Campaign approved! Earnings distributed to venue owners.");
        queryClient.invalidateQueries({ queryKey: ["all-campaigns-admin"] });
        setSelectedBooking(null);
        setProcessing(false);
        return;
      }

      await base44.entities.AdSlotBooking.update(booking.id, {
        status: "active",
        approved_at: new Date().toISOString(),
        approved_by: user.email,
        venue_share: venueShare,
        platform_share: platformShare
      });

      // Credit screen owner NOW (after approval) - 70% share
      const screen = screens.find(s => s.id === booking.screen_id);
      if (screen?.owner_id) {
        // Fetch fresh owner data for accurate balance
        const ownerData = await base44.entities.User.filter({ email: screen.owner_id });
        if (ownerData.length > 0) {
          const owner = ownerData[0];
          const currentBalance = owner.wallet_balance || 0;
          const newBalance = currentBalance + venueShare;
          
          await base44.entities.User.update(owner.id, {
            wallet_balance: newBalance,
            total_earnings: (owner.total_earnings || 0) + venueShare
          });

          await base44.entities.Transaction.create({
            user_id: owner.email,
            type: "earning",
            amount: venueShare,
            balance_after: newBalance,
            reference_id: booking.id,
            description: `Ad slot earning (70%): ${booking.campaign_name}`,
            status: "completed"
          });

          // Send earning notification to venue owner
          const venue = venues.find(v => v.id === screen.venue_id);
          await base44.integrations.Core.SendEmail({
            to: owner.email,
            subject: `💰 New Earning: AED ${venueShare.toLocaleString()} | BeyondWalls`,
            body: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        BEYONDWALLS
   Venue Partner Earnings
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dear ${owner.full_name || "Valued Partner"},

Great news! A new ad campaign has been approved on your screen! 🎉

💰 EARNINGS CREDITED
━━━━━━━━━━━━━━━━━━━━━━━━━
Screen: ${screen.name}
Venue: ${venue?.name || 'N/A'}
Campaign: ${booking.campaign_name}
Duration: ${booking.start_date} - ${booking.end_date}

Campaign Value: AED ${totalCost.toLocaleString()}
💵 Your Share (70%): AED ${venueShare.toLocaleString()}

The earnings have been credited to your wallet.
Download your earnings statement from My Bookings.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BeyondWalls - Advertise Beyond Boundaries
            `.trim()
          });
        }
      }

      // Credit BeyondWalls Platform Wallet - 30% share
      const platformWallets = await base44.entities.PlatformWallet.list();
      let platformBalance = 0;
      
      if (platformWallets.length === 0) {
        // Create platform wallet if doesn't exist
        await base44.entities.PlatformWallet.create({
          name: "BeyondWalls Platform",
          balance: platformShare,
          total_revenue: platformShare,
          total_tax_collected: 0
        });
        platformBalance = platformShare;
      } else {
        const platformWallet = platformWallets[0];
        platformBalance = (platformWallet.balance || 0) + platformShare;
        await base44.entities.PlatformWallet.update(platformWallet.id, {
          balance: platformBalance,
          total_revenue: (platformWallet.total_revenue || 0) + platformShare
        });
      }

      // Create platform transaction record
      await base44.entities.Transaction.create({
        user_id: "platform@beyondwalls.ae",
        type: "earning",
        amount: platformShare,
        balance_after: platformBalance,
        reference_id: booking.id,
        description: `Platform commission (30%): ${booking.campaign_name}`,
        status: "completed"
      });

      // Send approval notification to advertiser (in-app + email)
      const advertiserData = await base44.entities.User.filter({ email: booking.advertiser_id });
      if (advertiserData.length > 0) {
        await NotificationService.campaignApproved(booking, advertiserData[0], screen, venue);
      }

      // Send new booking notification to venue owner
      if (screen?.owner_id) {
        const ownerData = await base44.entities.User.filter({ email: screen.owner_id });
        if (ownerData.length > 0 && advertiserData.length > 0) {
          await NotificationService.newBookingForVenueOwner(booking, ownerData[0], screen, advertiserData[0]);
        }
      }

      // Update notification
      const notifications = await base44.entities.AdminNotification.filter({
        reference_id: booking.id,
        reference_type: "AdSlotBooking"
      });
      if (notifications.length > 0) {
        await base44.entities.AdminNotification.update(notifications[0].id, {
          status: "actioned",
          actioned_by: user.email,
          actioned_at: new Date().toISOString()
        });
      }

      toast.success("Booking approved successfully");
      queryClient.invalidateQueries({ queryKey: ["all-bookings"] });
      setSelectedBooking(null);
    } catch (error) {
      toast.error("Failed to approve booking");
    }
    setProcessing(false);
  };

  const handleReject = async (booking) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setProcessing(true);
    try {
      // Handle campaign vs booking differently
      if (booking.source === "campaign") {
        await base44.entities.Campaign.update(booking.id, {
          status: "rejected",
          rejection_reason: rejectionReason
        });
        
        try {
          await base44.integrations.Core.SendEmail({
            to: booking.advertiser_id,
            subject: `❌ Campaign Not Approved: ${booking.campaign_name}`,
            body: `Unfortunately, your AI campaign "${booking.campaign_name}" was not approved.\n\nReason: ${rejectionReason}\n\nPlease contact us if you have any questions.`
          });
        } catch (emailErr) {
          console.log("Email failed");
        }
        
        toast.success("Campaign rejected");
        queryClient.invalidateQueries({ queryKey: ["all-campaigns-admin"] });
        setSelectedBooking(null);
        setRejectionReason("");
        setProcessing(false);
        return;
      }

      await base44.entities.AdSlotBooking.update(booking.id, {
        status: "cancelled",
        rejection_reason: rejectionReason
      });

      // Refund the advertiser
      const users = await base44.entities.User.filter({ email: booking.advertiser_id });
      if (users.length > 0) {
        const advertiser = users[0];
        await base44.entities.User.update(advertiser.id, {
          wallet_balance: (advertiser.wallet_balance || 0) + booking.total_cost
        });

        // Create refund transaction
        await base44.entities.Transaction.create({
          user_id: booking.advertiser_id,
          type: "refund",
          amount: booking.total_cost,
          balance_after: (advertiser.wallet_balance || 0) + booking.total_cost,
          reference_id: booking.id,
          description: `Refund for rejected campaign: ${booking.campaign_name}`,
          status: "completed"
        });
      }

      // Send rejection notification to advertiser (in-app + email)
      const advertiserData = await base44.entities.User.filter({ email: booking.advertiser_id });
      if (advertiserData.length > 0) {
        await NotificationService.campaignRejected(booking, advertiserData[0], rejectionReason);
      }

      toast.success("Booking rejected and refund processed");
      queryClient.invalidateQueries({ queryKey: ["all-bookings"] });
      setSelectedBooking(null);
      setRejectionReason("");
    } catch (error) {
      toast.error("Failed to reject booking");
    }
    setProcessing(false);
  };

  const getScreenSlots = (screenId) => {
    const screen = screens.find(s => s.id === screenId);
    const slots = [];
    if (screen?.owner_slot_1_url) slots.push({ url: screen.owner_slot_1_url, type: screen.owner_slot_1_type || "image", name: "Owner Ad 1" });
    if (screen?.owner_slot_2_url) slots.push({ url: screen.owner_slot_2_url, type: screen.owner_slot_2_type || "image", name: "Owner Ad 2" });
    if (screen?.owner_slot_3_url) slots.push({ url: screen.owner_slot_3_url, type: screen.owner_slot_3_type || "image", name: "Owner Ad 3" });
    const screenBookings = bookings.filter(b => b.screen_id === screenId && b.status === "active");
    screenBookings.forEach(b => {
      if (b.creative_url) slots.push({ url: b.creative_url, type: b.creative_type || "image", name: b.campaign_name || "Ad" });
    });
    return slots;
  };

  const BookingCard = ({ booking, showActions = false }) => {
    const { screen, venue } = booking.source === "campaign" 
      ? { screen: null, venue: null }
      : getScreenInfo(booking.screen_id);
    const screenSlots = booking.status === "active" && booking.screen_id ? getScreenSlots(booking.screen_id) : [];
    
    // For campaigns, get screen info from screen_ids array
    const campaignScreens = booking.source === "campaign" && booking.screen_ids?.length > 0
      ? booking.screen_ids.map(sid => {
          const s = screens.find(sc => sc.id === sid);
          const v = s ? venues.find(ve => ve.id === s.venue_id) : null;
          return s ? { screen: s, venue: v } : null;
        }).filter(Boolean)
      : [];
    
    return (
      <Card className="group hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-xl border-white/20 transform hover:-translate-y-1">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {booking.status === "active" && screenSlots.length > 0 ? (
              <div className="w-32 flex-shrink-0">
                <LiveScreenPreview slots={screenSlots} size="small" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                {booking.creative_url ? (
                  booking.creative_type === "video" ? (
                    <video src={booking.creative_url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={booking.creative_url} className="w-full h-full object-cover" alt="" />
                  )
                ) : (
                  <Megaphone className="w-8 h-8 text-slate-400" />
                )}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{booking.campaign_name || "Ad Campaign"}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                    <User className="w-3 h-3" />
                    {booking.advertiser_id}
                  </p>
                </div>
                <Badge variant={
                  booking.status === "active" ? "default" :
                  booking.status === "pending" ? "secondary" : "outline"
                } className={
                  booking.status === "pending" ? "bg-amber-100 text-amber-700" : ""
                }>
                  {booking.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <MonitorPlay className="w-3 h-3" />
                  {booking.source === "campaign" 
                    ? (campaignScreens.length > 0 
                        ? `${campaignScreens.length} screen${campaignScreens.length > 1 ? 's' : ''}`
                        : "No screens assigned")
                    : (screen?.name || "Unknown Screen")
                  }
                </span>
                {booking.slot_number && <span>Slot #{booking.slot_number}</span>}
                {booking.source === "campaign" && (
                  <Badge variant="outline" className="text-violet-600 border-violet-300">AI Campaign</Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {booking.start_date} - {booking.end_date}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                <p className="font-semibold text-violet-600">AED {booking.total_cost?.toLocaleString()}</p>
                {showActions && (
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50/20 to-rose-50/30">
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Header with Glassmorphism */}
        <div className="mb-8 bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-2xl shadow-pink-500/10">
          <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 bg-clip-text text-transparent">Ad Bookings 📢</h1>
          <p className="text-slate-600 mt-2 text-lg font-medium">Review and approve campaign bookings</p>
        </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search campaigns or advertisers..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

        <Tabs defaultValue="pending">
          <TabsList className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl p-1">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Pending ({pendingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="active">Active ({activeBookings.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {filteredBookings(pendingBookings).length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">All caught up!</p>
                <p className="text-slate-500 text-sm">No pending bookings to review</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredBookings(pendingBookings).map((booking) => (
                <BookingCard key={booking.id} booking={booking} showActions />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <div className="grid gap-4">
            {filteredBookings(activeBookings).map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid gap-4">
            {filteredBookings(completedBookings).map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Booking</DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6">
              {/* Creative Preview */}
              <div className="bg-slate-100 rounded-xl p-4">
                <p className="text-sm font-medium text-slate-700 mb-2">Creative Preview</p>
                <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                  {selectedBooking.creative_type === "video" ? (
                    <video 
                      src={selectedBooking.creative_url} 
                      className="max-w-full max-h-full" 
                      controls 
                    />
                  ) : (
                    <img 
                      src={selectedBooking.creative_url} 
                      className="max-w-full max-h-full object-contain" 
                      alt="Creative" 
                    />
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Campaign Name</p>
                  <p className="font-medium">{selectedBooking.campaign_name}</p>
                </div>
                <div>
                  <p className="text-slate-500">Advertiser</p>
                  <p className="font-medium">{selectedBooking.advertiser_id}</p>
                </div>
                <div>
                  <p className="text-slate-500">Screen</p>
                  <p className="font-medium">{getScreenInfo(selectedBooking.screen_id).screen?.name}</p>
                </div>
                <div>
                  <p className="text-slate-500">Slot</p>
                  <p className="font-medium">#{selectedBooking.slot_number}</p>
                </div>
                <div>
                  <p className="text-slate-500">Duration</p>
                  <p className="font-medium">{selectedBooking.start_date} - {selectedBooking.end_date}</p>
                </div>
                <div>
                  <p className="text-slate-500">Total Cost</p>
                  <p className="font-medium text-violet-600">AED {selectedBooking.total_cost?.toLocaleString()}</p>
                </div>
              </div>

              {/* Rejection Reason */}
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Rejection Reason (if rejecting)</p>
                <Textarea
                  placeholder="Explain why this booking is being rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setSelectedBooking(null)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleReject(selectedBooking)}
              disabled={processing}
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
              Reject
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => handleApprove(selectedBooking)}
              disabled={processing}
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}