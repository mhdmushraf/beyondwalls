import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Wallet,
  Plus,
  TrendingUp,
  Eye,
  MousePointer,
  Target,
  DollarSign,
  Sparkles,
  Calendar,
  MonitorPlay,
  ArrowRight,
  Clock,
  Settings,
  PieChart,
  Megaphone,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import CampaignAnalytics from "@/components/campaigns/CampaignAnalytics";
import SpendHistory from "@/components/campaigns/SpendHistory";
import BudgetManager from "@/components/campaigns/BudgetManager";
import CampaignTemplates from "@/components/campaigns/CampaignTemplates";

export default function AdvertiserHub() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const { data: bookings = [], refetch: refetchBookings } = useQuery({
    queryKey: ["advertiser-bookings", user?.email],
    queryFn: () => base44.entities.AdSlotBooking.filter({ advertiser_id: user?.email }, "-created_date"),
    enabled: !!user?.email
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ["advertiser-campaigns", user?.email],
    queryFn: () => base44.entities.Campaign.filter({ advertiser_id: user?.email }, "-created_date"),
    enabled: !!user?.email
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["advertiser-transactions", user?.email],
    queryFn: () => base44.entities.Transaction.filter({ user_id: user?.email }, "-created_date"),
    enabled: !!user?.email
  });

  const { data: screens = [] } = useQuery({
    queryKey: ["all-screens"],
    queryFn: () => base44.entities.Screen.list()
  });

  const { data: venues = [] } = useQuery({
    queryKey: ["all-venues"],
    queryFn: () => base44.entities.Venue.list()
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl("AdvertiserHub"));
        return;
      }
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {
      base44.auth.redirectToLogin(createPageUrl("AdvertiserHub"));
    }
  };

  // Calculate overall metrics
  const activeBookings = bookings.filter(b => b.status === "active");
  const pendingBookings = bookings.filter(b => b.status === "pending");
  
  const totalSpent = transactions
    .filter(t => t.type === "ad_spend" && t.status === "completed")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  // Simulated aggregate metrics
  const totalImpressions = activeBookings.reduce((sum, b) => {
    const screen = screens.find(s => s.id === b.screen_id);
    const days = Math.ceil((new Date(b.end_date) - new Date(b.start_date)) / (1000 * 60 * 60 * 24));
    return sum + (screen?.avg_daily_views || 500) * days;
  }, 0);

  const avgCTR = 2.8; // Simulated
  const totalClicks = Math.round(totalImpressions * (avgCTR / 100));
  const totalConversions = Math.round(totalClicks * 0.15);

  const handleTemplateSelect = (template) => {
    // Store template in sessionStorage and navigate to AI Campaign Creator
    sessionStorage.setItem("campaignTemplate", JSON.stringify(template));
    navigate(createPageUrl("AICampaignCreator"));
  };

  if (!user) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading advertiser hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Advertiser Hub</h1>
          <p className="text-slate-500">Manage campaigns, budgets, and track performance</p>
        </div>
        <div className="flex gap-3">
          <Link to={createPageUrl("BookSlot")}>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Book Ad Slot
            </Button>
          </Link>
          <Link to={createPageUrl("AICampaignCreator")}>
            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Megaphone className="w-4 h-4" />
              <span className="text-sm">Active</span>
            </div>
            <p className="text-2xl font-bold text-violet-600">{activeBookings.length}</p>
            <p className="text-xs text-slate-400">{pendingBookings.length} pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Eye className="w-4 h-4" />
              <span className="text-sm">Impressions</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalImpressions.toLocaleString()}</p>
            <p className="text-xs text-emerald-600">+12% this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <MousePointer className="w-4 h-4" />
              <span className="text-sm">Clicks</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalClicks.toLocaleString()}</p>
            <p className="text-xs text-slate-400">{avgCTR}% CTR</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-sm">Conversions</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{totalConversions.toLocaleString()}</p>
            <p className="text-xs text-slate-400">15% conv. rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">Total Spent</span>
            </div>
            <p className="text-2xl font-bold text-rose-600">AED {totalSpent.toLocaleString()}</p>
            <p className="text-xs text-slate-400">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="bg-white border">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Budget
          </TabsTrigger>
          <TabsTrigger value="spend" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Spend History
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          {activeBookings.length > 0 ? (
            <div className="space-y-6">
              {/* Campaign Selector */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Select Campaign</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {activeBookings.map((booking) => {
                      const screen = screens.find(s => s.id === booking.screen_id);
                      const venue = venues.find(v => v.id === screen?.venue_id);
                      const isSelected = selectedBooking?.id === booking.id;
                      
                      return (
                        <div
                          key={booking.id}
                          onClick={() => setSelectedBooking(booking)}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected 
                              ? "border-violet-600 bg-violet-50" 
                              : "border-slate-200 hover:border-violet-300"
                          }`}
                        >
                          <p className="font-medium text-sm truncate">
                            {booking.campaign_name || "Campaign"}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{screen?.name}</p>
                          <Badge variant="secondary" className="text-xs mt-2">
                            {booking.status}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Campaign Analytics */}
              {selectedBooking ? (
                <CampaignAnalytics
                  booking={selectedBooking}
                  screen={screens.find(s => s.id === selectedBooking.screen_id)}
                  venue={venues.find(v => v.id === screens.find(s => s.id === selectedBooking.screen_id)?.venue_id)}
                />
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BarChart3 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">Select a Campaign</h3>
                    <p className="text-slate-500 text-sm">
                      Choose a campaign above to view detailed analytics
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Megaphone className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2">No Active Campaigns</h3>
                <p className="text-slate-500 text-sm mb-4">
                  Create your first campaign to start tracking performance
                </p>
                <Link to={createPageUrl("AICampaignCreator")}>
                  <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Campaign
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget">
          <BudgetManager
            user={user}
            bookings={bookings}
            transactions={transactions}
            onRefresh={refetchBookings}
          />
        </TabsContent>

        {/* Spend History Tab */}
        <TabsContent value="spend">
          <SpendHistory
            transactions={transactions}
            bookings={bookings}
          />
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardContent className="p-6">
              <CampaignTemplates onSelectTemplate={handleTemplateSelect} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(createPageUrl("MyBookings"))}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-violet-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900">My Bookings</p>
              <p className="text-sm text-slate-500">View all ad slot bookings</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(createPageUrl("CampaignManager"))}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900">Campaign Manager</p>
              <p className="text-sm text-slate-500">Advanced campaign controls</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(createPageUrl("Wallet"))}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900">Wallet</p>
              <p className="text-sm text-slate-500">Manage funds & transactions</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}