import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  Users, TrendingUp, DollarSign, MonitorPlay, Building2,
  Calendar, Activity, Zap, ArrowUp, ArrowDown, Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import PermissionGuard from "@/components/permissions/PermissionGuard";

export default function AdminAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("30"); // days
  const [user, setUser] = useState(null);

  // Fetch current user
  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {
      console.error("Auth error:", e);
    }
  };

  // Fetch all data
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: venues = [] } = useQuery({
    queryKey: ["venues"],
    queryFn: () => base44.entities.Venue.list(),
  });

  const { data: screens = [] } = useQuery({
    queryKey: ["screens"],
    queryFn: () => base44.entities.Screen.list(),
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["bookings"],
    queryFn: () => base44.entities.AdSlotBooking.list(),
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => base44.entities.Campaign.list(),
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => base44.entities.Transaction.list(),
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const timeRangeDate = new Date(now.getTime() - timeRange * 24 * 60 * 60 * 1000);

    // User metrics
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.approval_status === "approved").length;
    const newUsers = users.filter(u => {
      const created = new Date(u.created_date);
      return created >= timeRangeDate;
    }).length;
    const pendingApprovals = users.filter(u => u.approval_status === "pending").length;

    // Booking metrics
    const totalBookings = bookings.length;
    const activeBookings = bookings.filter(b => b.status === "active").length;
    const totalAdSpend = bookings.reduce((sum, b) => sum + (b.total_cost || 0), 0);
    const avgBookingValue = totalBookings > 0 ? totalAdSpend / totalBookings : 0;

    // Campaign metrics
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.status === "active").length;
    const totalImpressions = campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
    const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0;

    // Venue metrics
    const totalVenues = venues.length;
    const approvedVenues = venues.filter(v => v.status === "approved").length;
    const totalScreens = screens.length;
    const onlineScreens = screens.filter(s => s.status === "online").length;

    // Revenue metrics
    const platformRevenue = transactions
      .filter(t => t.type === "ad_spend")
      .reduce((sum, t) => sum + (t.amount * 0.3), 0); // 30% platform share
    
    const venueEarnings = transactions
      .filter(t => t.type === "earning")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalUsers,
      activeUsers,
      newUsers,
      pendingApprovals,
      totalBookings,
      activeBookings,
      totalAdSpend,
      avgBookingValue,
      totalCampaigns,
      activeCampaigns,
      totalImpressions,
      totalClicks,
      avgCTR,
      totalVenues,
      approvedVenues,
      totalScreens,
      onlineScreens,
      platformRevenue,
      venueEarnings
    };
  }, [users, bookings, campaigns, venues, screens, transactions, timeRange]);

  // Chart data
  const userGrowthData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
      const dayUsers = users.filter(u => u.created_date?.startsWith(date)).length;
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: dayUsers
      };
    });
  }, [users]);

  const revenueData = useMemo(() => {
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      return date.toISOString().slice(0, 7); // YYYY-MM
    });

    return last12Months.map(month => {
      const monthBookings = bookings.filter(b => b.created_date?.startsWith(month));
      const revenue = monthBookings.reduce((sum, b) => sum + (b.total_cost || 0), 0);
      return {
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        revenue: revenue,
        bookings: monthBookings.length
      };
    });
  }, [bookings]);

  const venueTypeData = useMemo(() => {
    const types = {};
    venues.forEach(v => {
      types[v.type] = (types[v.type] || 0) + 1;
    });
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  }, [venues]);

  const campaignPerformanceData = useMemo(() => {
    return campaigns
      .filter(c => c.status === "active" && c.impressions > 0)
      .slice(0, 10)
      .map(c => ({
        name: c.name?.substring(0, 20) || "Campaign",
        impressions: c.impressions || 0,
        clicks: c.clicks || 0,
        ctr: c.impressions ? ((c.clicks / c.impressions) * 100).toFixed(1) : 0
      }));
  }, [campaigns]);

  const COLORS = ['#8B5CF6', '#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444'];

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <PermissionGuard user={user} requiredPermission="dashboard">
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
              <p className="text-slate-600 mt-1">Comprehensive platform insights and metrics</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTimeRange("7")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === "7" 
                    ? "bg-violet-600 text-white" 
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setTimeRange("30")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === "30" 
                    ? "bg-violet-600 text-white" 
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setTimeRange("90")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === "90" 
                    ? "bg-violet-600 text-white" 
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                90 Days
              </button>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Users</CardTitle>
                  <Users className="w-5 h-5 text-violet-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{metrics.totalUsers}</div>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <ArrowUp className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">{metrics.newUsers} new</span>
                  <span className="text-slate-500">in last {timeRange} days</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Active Campaigns</CardTitle>
                  <Zap className="w-5 h-5 text-indigo-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{metrics.activeCampaigns}</div>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <span className="text-slate-600">of {metrics.totalCampaigns} total</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  AED {metrics.totalAdSpend.toLocaleString()}
                </div>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <span className="text-slate-600">Platform: AED {metrics.platformRevenue.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Screens</CardTitle>
                  <MonitorPlay className="w-5 h-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{metrics.totalScreens}</div>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <Activity className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">{metrics.onlineScreens} online</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different analytics views */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-white">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="venues">Venues</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>User Growth (Last 30 Days)</CardTitle>
                    <CardDescription>New user registrations per day</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={userGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                        <YAxis stroke="#64748B" fontSize={12} />
                        <Tooltip />
                        <Line type="monotone" dataKey="users" stroke="#8B5CF6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Revenue Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trend (Last 12 Months)</CardTitle>
                    <CardDescription>Monthly revenue and booking count</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                        <YAxis stroke="#64748B" fontSize={12} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="revenue" fill="#8B5CF6" name="Revenue (AED)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Additional metrics grid */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Active Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.activeBookings}</div>
                    <p className="text-sm text-slate-600 mt-1">Average value: AED {metrics.avgBookingValue.toFixed(0)}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Total Impressions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.totalImpressions.toLocaleString()}</div>
                    <p className="text-sm text-slate-600 mt-1">Avg CTR: {metrics.avgCTR}%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Venue Earnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">AED {metrics.venueEarnings.toLocaleString()}</div>
                    <p className="text-sm text-slate-600 mt-1">70% revenue share</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Registrations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={userGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                        <YAxis stroke="#64748B" fontSize={12} />
                        <Tooltip />
                        <Line type="monotone" dataKey="users" stroke="#8B5CF6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>User Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">Active Users</span>
                      <Badge className="bg-green-600">{metrics.activeUsers}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="text-sm font-medium">Pending Approvals</span>
                      <Badge className="bg-yellow-600">{metrics.pendingApprovals}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">New Users ({timeRange}d)</span>
                      <Badge className="bg-blue-600">{metrics.newUsers}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Campaigns Tab */}
            <TabsContent value="campaigns" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Campaign Performance</CardTitle>
                  <CardDescription>Impressions, clicks and CTR for active campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={campaignPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                      <YAxis stroke="#64748B" fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="impressions" fill="#8B5CF6" name="Impressions" />
                      <Bar dataKey="clicks" fill="#6366F1" name="Clicks" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Revenue Tab */}
            <TabsContent value="revenue" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                      <YAxis stroke="#64748B" fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="revenue" fill="#10B981" name="Revenue (AED)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Venues Tab */}
            <TabsContent value="venues" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Venue Distribution by Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={venueTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {venueTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Venue & Screen Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-violet-50 rounded-lg">
                      <span className="text-sm font-medium">Total Venues</span>
                      <Badge className="bg-violet-600">{metrics.totalVenues}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">Approved Venues</span>
                      <Badge className="bg-green-600">{metrics.approvedVenues}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">Total Screens</span>
                      <Badge className="bg-blue-600">{metrics.totalScreens}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">Online Screens</span>
                      <Badge className="bg-green-600">{metrics.onlineScreens}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PermissionGuard>
  );
}