import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PullToRefresh from "@/components/mobile/PullToRefresh";
import {
  Wallet,
  MonitorPlay,
  Megaphone,
  Building2,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Eye,
  Calendar,
  Sparkles,
  Loader2,
  Package,
  Leaf,
  Gamepad2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCard from "@/components/dashboard/StatsCard";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl("Dashboard"));
        return;
      }
      
      const userData = await base44.auth.me();
      setUser(userData);

      // Check if profile is complete - if not, redirect to complete profile
      if (!userData.profile_complete) {
        navigate(createPageUrl("CompleteProfile"));
        return;
      }

      // Check approval status - only approved users can access dashboard
      if (userData.approval_status !== "approved") {
        navigate(createPageUrl("PendingApproval"));
        return;
      }
    } catch (e) {
      base44.auth.redirectToLogin(createPageUrl("Dashboard"));
    }
  };

  const { data: venues = [] } = useQuery({
    queryKey: ["my-venues"],
    queryFn: () => base44.entities.Venue.filter({ owner_id: user?.email }),
    enabled: !!user?.email
  });

  const { data: screens = [] } = useQuery({
    queryKey: ["my-screens"],
    queryFn: () => base44.entities.Screen.filter({ owner_id: user?.email }),
    enabled: !!user?.email
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => base44.entities.AdSlotBooking.filter({ advertiser_id: user?.email }),
    enabled: !!user?.email
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["my-transactions"],
    queryFn: () => base44.entities.Transaction.filter({ user_id: user?.email }, "-created_date"),
    enabled: !!user?.email
  });

  const activeBookings = bookings.filter(b => b.status === "active");
  const onlineScreens = screens.filter(s => s.status === "online");
  
  // Calculate from actual transactions for accuracy
  // Use Math.abs() because some transactions may be stored with negative amounts
  const totalEarnings = transactions
    .filter(t => t.type === "earning" && t.status === "completed")
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
  
  const totalSpent = transactions
    .filter(t => t.type === "ad_spend" && t.status === "completed")
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
  
  const totalTopUps = transactions
    .filter(t => t.type === "top_up" && t.status === "completed")
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
  
  const totalWithdrawals = transactions
    .filter(t => t.type === "withdrawal" && t.status === "completed")
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  const totalRefunds = transactions
    .filter(t => t.type === "refund" && t.status === "completed")
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
  
  // Use user's wallet_balance as source of truth, fallback to calculation
  const calculatedBalance = user?.wallet_balance ?? (totalTopUps + totalEarnings + totalRefunds - totalSpent - totalWithdrawals);

  if (!user) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const handleRefresh = async () => {
    // Refetch all queries
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ["my-venues"] }),
      queryClient.refetchQueries({ queryKey: ["my-screens"] }),
      queryClient.refetchQueries({ queryKey: ["my-bookings"] }),
      queryClient.refetchQueries({ queryKey: ["my-transactions"] }),
    ]);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-indigo-50/30">
        <div className="p-6 lg:p-8">
        {/* Header with Glassmorphism */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8 bg-white/60 backdrop-blur-xl p-4 sm:p-6 rounded-2xl border border-white/20 shadow-2xl shadow-violet-500/10">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome back, {user.full_name?.split(" ")[0]}! ✨
            </h1>
            <p className="text-slate-600 mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg font-medium">
              Manage your screens and advertising campaigns
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {user.is_venue_owner && (
              <Link to={createPageUrl("AddScreen")}>
                <Button variant="outline" size="sm" className="border-violet-200 hover:bg-violet-50 hover:border-violet-300 transition-all duration-200 shadow-lg text-xs sm:text-sm">
                  <MonitorPlay className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Add Screen
                </Button>
              </Link>
            )}
            <Link to={createPageUrl("BookSlot")}>
              <Button variant="outline" size="sm" className="border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 shadow-lg text-xs sm:text-sm">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Book Ad
              </Button>
            </Link>
            <Link to={createPageUrl("AICampaignCreator")}>
              <Button className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 shadow-2xl shadow-violet-500/30 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base lg:text-lg px-4 sm:px-6 py-5 sm:py-6">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                AI Campaign
              </Button>
            </Link>
          </div>
        </div>

        {/* Wallet Card - Enhanced */}
        <Card className="mb-6 sm:mb-8 relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 text-white border-0 overflow-hidden shadow-2xl shadow-violet-500/30">
          <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          <CardContent className="p-4 sm:p-6 lg:p-8 relative">
            <div className="flex flex-col gap-4 sm:gap-6">
              <div>
                <p className="text-white/90 text-xs sm:text-sm mb-1 sm:mb-2 font-semibold tracking-wide">Wallet Balance</p>
                <p className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight">AED {calculatedBalance.toLocaleString()}</p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-8 mt-4 sm:mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                    <p className="text-white/80 text-xs mb-1 font-medium">Total Earnings</p>
                    <p className="text-base sm:text-lg lg:text-xl font-bold flex items-center gap-2">
                      <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
                      AED {totalEarnings.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                    <p className="text-white/80 text-xs mb-1 font-medium">Total Spent</p>
                    <p className="text-base sm:text-lg lg:text-xl font-bold flex items-center gap-2">
                      <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-rose-300" />
                      AED {totalSpent.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <Link to={createPageUrl("Wallet")} className="flex-1 sm:flex-none">
                  <Button className="w-full sm:w-auto bg-white text-violet-600 hover:bg-white/95 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 font-semibold py-5 sm:py-6 px-6 sm:px-8 text-sm sm:text-base lg:text-lg">
                    <Wallet className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
                    Manage Wallet
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid with Glow Effects */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
            <StatsCard
              title="My Screens"
              value={screens.length}
              icon={MonitorPlay}
              color="violet"
              trend={onlineScreens.length > 0 ? "up" : undefined}
              trendValue={onlineScreens.length > 0 ? `${onlineScreens.length} online` : undefined}
            />
          </div>
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
            <StatsCard
              title="Active Ads"
              value={activeBookings.length}
              icon={Megaphone}
              color="indigo"
            />
          </div>
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
            <StatsCard
              title="My Venues"
              value={venues.length}
              icon={Building2}
              color="emerald"
            />
          </div>
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
            <StatsCard
              title="This Month"
              value={`AED ${(totalEarnings - totalSpent).toLocaleString()}`}
              icon={TrendingUp}
              color="amber"
            />
          </div>
        </div>

        {/* Quick Actions - Innovative Features */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Link to={createPageUrl("CampaignBundles")}>
            <div className="group relative p-4 sm:p-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-emerald-200 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 mb-2 sm:mb-3" />
              <p className="font-bold text-slate-900 text-sm sm:text-base">Campaign Bundles</p>
              <p className="text-xs text-slate-600 mt-1">Save 20-30%</p>
            </div>
          </Link>
          <Link to={createPageUrl("LocalBusinessBooking")}>
            <div className="group relative p-4 sm:p-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-amber-200 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600 mb-2 sm:mb-3" />
              <p className="font-bold text-slate-900 text-sm sm:text-base">Local Business</p>
              <p className="text-xs text-slate-600 mt-1">50% OFF</p>
            </div>
          </Link>
          <Link to={createPageUrl("BookSlot")}>
            <div className="group relative p-4 sm:p-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-pink-200 hover:shadow-2xl hover:shadow-pink-500/20 transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-rose-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Gamepad2 className="w-6 h-6 sm:w-8 sm:h-8 text-pink-600 mb-2 sm:mb-3" />
              <p className="font-bold text-slate-900 text-sm sm:text-base">Scan & Win</p>
              <p className="text-xs text-slate-600 mt-1">3x Engagement</p>
            </div>
          </Link>
          <Link to={createPageUrl("SustainabilityReport")}>
            <div className="group relative p-4 sm:p-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-green-200 hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Leaf className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mb-2 sm:mb-3" />
              <p className="font-bold text-slate-900 text-sm sm:text-base">Sustainability</p>
              <p className="text-xs text-slate-600 mt-1">Track Impact</p>
            </div>
          </Link>
          <Link to={createPageUrl("AnalyticsDashboard")}>
            <div className="group relative p-4 sm:p-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-violet-200 hover:shadow-2xl hover:shadow-violet-500/20 transition-all duration-300 cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-violet-600 mb-2 sm:mb-3" />
              <p className="font-bold text-slate-900 text-sm sm:text-base">Analytics</p>
              <p className="text-xs text-slate-600 mt-1">Performance</p>
            </div>
          </Link>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="screens" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl p-1">
            <TabsTrigger value="screens" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">My Screens</TabsTrigger>
            <TabsTrigger value="ads" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">My Ads</TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="screens">
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100/50">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">My Screens</CardTitle>
                <Link to={createPageUrl("MyScreens")}>
                  <Button variant="ghost" size="sm" className="hover:bg-violet-50">View All</Button>
                </Link>
              </CardHeader>
              <CardContent className="p-6">
                {screens.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-500 rounded-3xl blur-3xl opacity-20" />
                      <div className="relative w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-violet-500/30">
                        <MonitorPlay className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <p className="text-slate-600 mb-6 text-lg font-medium">No screens yet</p>
                    <Link to={createPageUrl("AddScreen")}>
                      <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-xl transform hover:scale-105 transition-all">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Screen
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {screens.slice(0, 5).map((screen) => (
                      <div key={screen.id} className="group relative flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-violet-50/30 rounded-2xl hover:shadow-xl transition-all duration-300 border border-white/50">
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="flex items-center gap-4 relative">
                          <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <MonitorPlay className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-lg">{screen.name}</p>
                            <p className="text-sm text-slate-600 font-medium">{screen.size} • {screen.orientation}</p>
                          </div>
                        </div>
                        <div className="text-right relative">
                          <Badge variant={screen.status === "online" ? "default" : "secondary"} className="shadow-md">
                            {screen.status}
                          </Badge>
                          <p className="text-sm text-slate-600 mt-1 font-medium">
                            {screen.available_slots}/5 slots available
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

          <TabsContent value="ads">
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100/50">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">My Ad Bookings</CardTitle>
                <Link to={createPageUrl("MyBookings")}>
                  <Button variant="ghost" size="sm" className="hover:bg-indigo-50">View All</Button>
                </Link>
              </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 mb-4">No ad bookings yet</p>
                  <div className="flex gap-3 justify-center">
                    <Link to={createPageUrl("AICampaignCreator")}>
                      <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI Campaign
                      </Button>
                    </Link>
                    <Link to={createPageUrl("BookSlot")}>
                      <Button variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Manual Booking
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Megaphone className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{booking.campaign_name || "Ad Campaign"}</p>
                          <p className="text-sm text-slate-500">Slot #{booking.slot_number}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={booking.status === "active" ? "default" : "secondary"}>
                          {booking.status}
                        </Badge>
                        <p className="text-sm text-slate-500 mt-1">
                          AED {booking.total_cost}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

          <TabsContent value="transactions">
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100/50">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Recent Transactions</CardTitle>
                <Link to={createPageUrl("Wallet")}>
                  <Button variant="ghost" size="sm" className="hover:bg-emerald-50">View All</Button>
                </Link>
              </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => {
                    // Credits: earning, top_up, refund | Debits: ad_spend, withdrawal
                    const isCreditType = tx.type === "earning" || tx.type === "top_up" || tx.type === "refund";
                    const displayAmount = Math.abs(tx.amount || 0);
                    
                    return (
                      <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isCreditType ? "bg-emerald-100" : "bg-rose-100"
                          }`}>
                            {isCreditType ? (
                              <ArrowDownRight className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <ArrowUpRight className="w-5 h-5 text-rose-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{tx.description}</p>
                            <p className="text-sm text-slate-500">{tx.type}</p>
                          </div>
                        </div>
                        <p className={`font-semibold ${isCreditType ? "text-emerald-600" : "text-rose-600"}`}>
                          {isCreditType ? "+" : "-"}AED {displayAmount.toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </div>
    </PullToRefresh>
  );
}