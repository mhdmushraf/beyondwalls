import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import {
  CheckCircle2,
  Loader2,
  MonitorPlay,
  MapPin,
  Calendar,
  AlertCircle,
  ArrowLeft,
  Mail,
  ShoppingCart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function CartCheckout({
  cartItems,
  user,
  venues,
  screens,
  onBack,
  onSuccess
}) {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalCost = cartItems.reduce((sum, item) => sum + (item.totalCost || 0), 0);

  const getScreenInfo = (screenId) => screens.find(s => s.id === screenId);
  const getVenueInfo = (venueId) => venues.find(v => v.id === venueId);

  const processBookings = async () => {
    setProcessing(true);
    const successfulBookings = [];
    const failedBookings = [];

    for (let i = 0; i < cartItems.length; i++) {
      setCurrentIndex(i);
      const item = cartItems[i];
      const screen = getScreenInfo(item.screenId);
      const venue = screen ? getVenueInfo(screen.venue_id) : null;

      try {
        // Verify availability one more time
        const latestBookings = await base44.entities.AdSlotBooking.filter({
          screen_id: item.screenId,
          status: "active"
        });
        
        const isSlotTaken = latestBookings.some(b => b.slot_number === item.slotNumber);
        if (isSlotTaken) {
          failedBookings.push({ item, reason: "Slot was just booked" });
          continue;
        }

        // Create booking
        const booking = await base44.entities.AdSlotBooking.create({
          screen_id: item.screenId,
          advertiser_id: user.email,
          slot_number: item.slotNumber,
          creative_url: item.creativeUrl,
          creative_type: item.creativeType,
          duration_seconds: 15,
          start_date: item.startDate,
          end_date: item.endDate,
          weeks_booked: item.weeks,
          total_cost: item.totalCost,
          status: "pending",
          campaign_name: item.campaignName
        });

        // Create admin notification
        await base44.entities.AdminNotification.create({
          type: "campaign_approval",
          title: "New Campaign Pending Approval",
          message: `${user.full_name || user.email} submitted campaign "${item.campaignName}" for ${screen?.name}`,
          reference_id: booking.id,
          reference_type: "AdSlotBooking",
          status: "unread"
        });

        successfulBookings.push({ item, booking });
      } catch (error) {
        failedBookings.push({ item, reason: error.message || "Booking failed" });
      }
    }

    // Process wallet and transactions if any successful
    if (successfulBookings.length > 0) {
      const successfulTotal = successfulBookings.reduce((sum, b) => sum + (b.item.totalCost || 0), 0);
      
      // Update wallet
      await base44.auth.updateMe({
        wallet_balance: (user.wallet_balance || 0) - successfulTotal,
        total_spent: (user.total_spent || 0) + successfulTotal
      });

      // Create transaction (negative amount for deduction)
      await base44.entities.Transaction.create({
        user_id: user.email,
        type: "ad_spend",
        amount: -successfulTotal,
        balance_after: (user.wallet_balance || 0) - successfulTotal,
        reference_id: "cart-checkout",
        description: `Bulk booking: ${successfulBookings.length} ad slots`,
        status: "completed"
      });

      // Send confirmation email
      try {
        const bookingSummary = successfulBookings.map(b => {
          const screen = getScreenInfo(b.item.screenId);
          const venue = screen ? getVenueInfo(screen.venue_id) : null;
          return `• ${b.item.campaignName} on ${screen?.name} (${venue?.name}) - AED ${b.item.totalCost}`;
        }).join("\n");

        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: `🎯 ${successfulBookings.length} Bookings Confirmed | BeyondWalls`,
          body: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        BEYONDWALLS
   Digital Out-of-Home Advertising
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dear ${user.full_name || "Valued Advertiser"},

Your bulk booking has been successfully submitted!

📋 BOOKING SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━
${bookingSummary}

💰 TOTAL: AED ${successfulTotal.toLocaleString()}

⏳ STATUS: PENDING APPROVAL
━━━━━━━━━━━━━━━━━━━━━━━━━
Our team will review your campaigns within 24-48 hours.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Need help? Contact us at info@beyondwalls.ae
Phone: +971 55 614 0067

BeyondWalls - Advertise Beyond Boundaries
www.beyondwalls.ae
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          `.trim()
        });
      } catch (e) {
        console.log("Email failed but bookings succeeded");
      }
    }

    setProcessing(false);

    if (failedBookings.length === 0) {
      toast.success(`All ${successfulBookings.length} bookings submitted successfully!`);
      onSuccess();
      navigate(createPageUrl("MyBookings"));
    } else if (successfulBookings.length > 0) {
      toast.warning(`${successfulBookings.length} bookings succeeded, ${failedBookings.length} failed`);
      onSuccess();
      navigate(createPageUrl("MyBookings"));
    } else {
      toast.error("All bookings failed. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Checkout Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cartItems.map((item, index) => {
            const screen = getScreenInfo(item.screenId);
            const venue = screen ? getVenueInfo(screen.venue_id) : null;
            
            return (
              <div key={item.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <MonitorPlay className="w-5 h-5 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.campaignName}</p>
                  <p className="text-sm text-slate-500 truncate">
                    {screen?.name} • {venue?.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <Badge variant="outline" className="text-xs">Slot {item.slotNumber}</Badge>
                    <span>{format(new Date(item.startDate), "MMM d")} - {format(new Date(item.endDate), "MMM d")}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-violet-600">AED {item.totalCost?.toLocaleString()}</p>
                  {processing && currentIndex === index && (
                    <Loader2 className="w-4 h-4 animate-spin text-violet-600 ml-auto mt-1" />
                  )}
                  {processing && currentIndex > index && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 ml-auto mt-1" />
                  )}
                </div>
              </div>
            );
          })}

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Total ({cartItems.length} bookings)</span>
              <span className="text-xl font-bold text-violet-600">AED {totalCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Wallet Balance After</span>
              <span className="text-emerald-600 font-medium">
                AED {((user?.wallet_balance || 0) - totalCost).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="p-3 bg-violet-50 border border-violet-200 rounded-lg flex items-center gap-2">
            <Mail className="w-4 h-4 text-violet-600" />
            <p className="text-sm text-violet-700">Confirmation email will be sent to {user?.email}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={processing}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          className="bg-gradient-to-r from-violet-600 to-indigo-600"
          onClick={processBookings}
          disabled={processing}
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing {currentIndex + 1}/{cartItems.length}...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Confirm All Bookings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}