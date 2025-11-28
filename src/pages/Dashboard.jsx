import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
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
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCard from "@/components/dashboard/StatsCard";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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
      
      // Check approval status
      if (userData.approval_status === "pending" || userData.approval_status === "rejected") {
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
  const totalEarnings = transactions
    .filter(t => t.type === "earning" && t.status === "completed")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const totalSpent = transactions
    .filter(t => t.type === "ad_spend" && t.status === "completed")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const totalTopUps = transactions
    .filter(t => t.type === "top_up" && t.status === "completed")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const totalWithdrawals = transactions
    .filter(t => t.type === "withdrawal" && t.status === "completed")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalRefunds = transactions
    .filter(t => t.type === "refund" && t.status === "completed")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  // Calculated balance: topups + earnings + refunds - spent - withdrawals
  const calculatedBalance = totalTopUps + totalEarnings + totalRefunds - totalSpent - totalWithdrawals;

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

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            Welcome back, {user.full_name?.split(" ")[0]}!
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your screens and advertising campaigns
          </p>
        </div>
        <div className="flex gap-3">
          {user.is_venue_owner && (
            <Link to={createPageUrl("AddScreen")}>
              <Button variant="outline">
                <MonitorPlay className="w-4 h-4 mr-2" />
                Add Screen
              </Button>
            </Link>
          )}
          <Link to={createPageUrl("AICampaignCreator")}>
            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* Wallet Card - Unified */}
      <Card className="mb-8 bg-gradient-to-br from-violet-600 to-indigo-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-white/70 text-sm mb-1">Wallet Balance</p>
              <p className="text-4xl font-bold">AED {calculatedBalance.toLocaleString()}</p>
              <div className="flex gap-6 mt-4">
                <div>
                  <p className="text-white/70 text-xs">Total Earnings</p>
                  <p className="text-lg font-semibold flex items-center gap-1">
                    <ArrowDownRight className="w-4 h-4 text-emerald-300" />
                    AED {totalEarnings.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-white/70 text-xs">Total Spent</p>
                  <p className="text-lg font-semibold flex items-center gap-1">
                    <ArrowUpRight className="w-4 h-4 text-rose-300" />
                    AED {totalSpent.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to={createPageUrl("Wallet")}>
                <Button className="bg-white text-violet-600 hover:bg-white/90">
                  <Wallet className="w-4 h-4 mr-2" />
                  Manage Wallet
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="My Screens"
          value={screens.length}
          icon={MonitorPlay}
          color="violet"
          trend={onlineScreens.length > 0 ? "up" : undefined}
          trendValue={onlineScreens.length > 0 ? `${onlineScreens.length} online` : undefined}
        />
        <StatsCard
          title="Active Ads"
          value={activeBookings.length}
          icon={Megaphone}
          color="indigo"
        />
        <StatsCard
          title="My Venues"
          value={venues.length}
          icon={Building2}
          color="emerald"
        />
        <StatsCard
          title="This Month"
          value={`AED ${(totalEarnings - totalSpent).toLocaleString()}`}
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="screens" className="space-y-6">
        <TabsList>
          <TabsTrigger value="screens">My Screens</TabsTrigger>
          <TabsTrigger value="ads">My Ads</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="screens">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Screens</CardTitle>
              <Link to={createPageUrl("MyScreens")}>
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {screens.length === 0 ? (
                <div className="text-center py-8">
                  <MonitorPlay className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 mb-4">No screens yet</p>
                  <Link to={createPageUrl("AddScreen")}>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Screen
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {screens.slice(0, 5).map((screen) => (
                    <div key={screen.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
                          <MonitorPlay className="w-6 h-6 text-violet-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{screen.name}</p>
                          <p className="text-sm text-slate-500">{screen.size} • {screen.orientation}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={screen.status === "online" ? "default" : "secondary"}>
                          {screen.status}
                        </Badge>
                        <p className="text-sm text-slate-500 mt-1">
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>My Ad Bookings</CardTitle>
              <Link to={createPageUrl("MyBookings")}>
                <Button variant="ghost" size="sm">View All</Button>
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Link to={createPageUrl("Wallet")}>
                <Button variant="ghost" size="sm">View All</Button>
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
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === "earning" || tx.type === "top_up" 
                            ? "bg-emerald-100" 
                            : "bg-rose-100"
                        }`}>
                          {tx.type === "earning" || tx.type === "top_up" ? (
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
                      <p className={`font-semibold ${
                        tx.type === "earning" || tx.type === "top_up" 
                          ? "text-emerald-600" 
                          : "text-rose-600"
                      }`}>
                        {tx.type === "earning" || tx.type === "top_up" ? "+" : "-"}
                        AED {tx.amount}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}