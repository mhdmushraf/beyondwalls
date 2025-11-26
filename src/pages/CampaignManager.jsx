import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, differenceInDays } from "date-fns";
import {
  ArrowLeft,
  MonitorPlay,
  Calendar,
  MapPin,
  BarChart3,
  Settings,
  FlaskConical,
  Target,
  TrendingUp,
  Eye,
  DollarSign,
  LayoutDashboard,
  PieChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ABTestManager from "@/components/campaigns/ABTestManager";
import PerformanceForecast from "@/components/campaigns/PerformanceForecast";
import BudgetGoals from "@/components/campaigns/BudgetGoals";
import CampaignControls from "@/components/campaigns/CampaignControls";
import AllCampaignsReport from "@/components/campaigns/AllCampaignsReport";
import CampaignAnalytics from "@/components/campaigns/CampaignAnalytics";

export default function CampaignManager() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get("id");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {
      base44.auth.redirectToLogin();
    }
  };

  const { data: booking } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: async () => {
      const bookings = await base44.entities.AdSlotBooking.filter({ id: bookingId });
      return bookings[0];
    },
    enabled: !!bookingId
  });

  const { data: screen } = useQuery({
    queryKey: ["screen", booking?.screen_id],
    queryFn: async () => {
      const screens = await base44.entities.Screen.filter({ id: booking?.screen_id });
      return screens[0];
    },
    enabled: !!booking?.screen_id
  });

  const { data: venue } = useQuery({
    queryKey: ["venue", screen?.venue_id],
    queryFn: async () => {
      const venues = await base44.entities.Venue.filter({ id: screen?.venue_id });
      return venues[0];
    },
    enabled: !!screen?.venue_id
  });

  const { data: historicalBookings = [] } = useQuery({
    queryKey: ["historical-bookings"],
    queryFn: () => base44.entities.AdSlotBooking.filter({ status: "completed" })
  });

  const { data: allMyBookings = [], refetch: refetchBookings } = useQuery({
    queryKey: ["all-my-bookings", user?.email],
    queryFn: () => base44.entities.AdSlotBooking.filter({ advertiser_id: user?.email }),
    enabled: !!user?.email
  });

  const { data: allScreens = [] } = useQuery({
    queryKey: ["all-screens"],
    queryFn: () => base44.entities.Screen.list()
  });

  const { data: allVenues = [] } = useQuery({
    queryKey: ["all-venues"],
    queryFn: () => base44.entities.Venue.list()
  });

  // If no booking ID, show all campaigns report
  if (!bookingId) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Campaign Dashboard</h1>
            <p className="text-slate-500">Overview of all your campaigns</p>
          </div>
        </div>
        <AllCampaignsReport 
          bookings={allMyBookings} 
          screens={allScreens} 
          venues={allVenues} 
        />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  const daysRemaining = differenceInDays(parseISO(booking.end_date), new Date());
  const isActive = booking.status === "active";
  const isPaused = booking.status === "paused";

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Campaign Manager</h1>
          <p className="text-slate-500">{booking.campaign_name}</p>
        </div>
        <Button variant="outline" onClick={() => navigate(createPageUrl("CampaignManager"))}>
          <LayoutDashboard className="w-4 h-4 mr-2" />
          All Campaigns
        </Button>
        <Button variant="outline" onClick={() => navigate(createPageUrl(`CampaignReport?id=${bookingId}`))}>
          <BarChart3 className="w-4 h-4 mr-2" />
          View Report
        </Button>
      </div>

      {/* Campaign Overview Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex items-center gap-4">
              {booking.creative_url && (
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100">
                  {booking.creative_type === "video" ? (
                    <video src={booking.creative_url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={booking.creative_url} className="w-full h-full object-cover" alt="" />
                  )}
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-slate-900">{booking.campaign_name}</h2>
                <div className="flex items-center gap-2 text-slate-500 mt-1">
                  <MonitorPlay className="w-4 h-4" />
                  <span>{screen?.name}</span>
                  <span>•</span>
                  <MapPin className="w-4 h-4" />
                  <span>{venue?.city}</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant={isActive ? "default" : isPaused ? "secondary" : "outline"}>
                    {booking.status}
                  </Badge>
                  <span className="text-sm text-slate-500">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {format(parseISO(booking.start_date), "MMM d")} - {format(parseISO(booking.end_date), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </div>
            <div className="ml-auto grid grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-violet-600">AED {booking.total_cost}</p>
                <p className="text-xs text-slate-500">Total Budget</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900">{booking.weeks_booked}</p>
                <p className="text-xs text-slate-500">Weeks</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{daysRemaining > 0 ? daysRemaining : 0}</p>
                <p className="text-xs text-slate-500">Days Left</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Controls */}
      <div className="mb-6">
        <CampaignControls 
          booking={booking} 
          screen={screen} 
          venue={venue}
          onUpdate={refetchBookings}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="bg-white border">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="creatives" className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4" />
            A/B Testing
          </TabsTrigger>
          <TabsTrigger value="forecast" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Forecast
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Budget Goals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <CampaignAnalytics 
            booking={booking}
            screen={screen}
            venue={venue}
          />
        </TabsContent>

        <TabsContent value="creatives">
          <ABTestManager 
            bookingId={bookingId} 
            advertiserId={user?.email} 
          />
        </TabsContent>

        <TabsContent value="forecast">
          <PerformanceForecast 
            booking={booking}
            screen={screen}
            venue={venue}
            historicalBookings={historicalBookings}
          />
        </TabsContent>

        <TabsContent value="budget">
          <BudgetGoals
            bookingId={bookingId}
            advertiserId={user?.email}
            totalBudget={booking.total_cost}
            currentSpend={booking.total_cost * 0.3} // Mock current spend
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}