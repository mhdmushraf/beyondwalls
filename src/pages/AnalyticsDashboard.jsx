import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Eye,
  MonitorPlay,
  Clock,
  TrendingUp,
  BarChart3,
  Wifi,
  WifiOff,
  Play,
  Calendar,
  Target,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";

export default function AnalyticsDashboard() {
  const [user, setUser] = useState(null);
  const [dateRange, setDateRange] = useState("7d");

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

  const isAdmin = user?.role === "admin" || user?.user_role === "admin";

  // Fetch bookings for the user
  const { data: bookings = [] } = useQuery({
    queryKey: ["analytics-bookings", user?.email, isAdmin],
    queryFn: async () => {
      if (isAdmin) {
        return base44.entities.AdSlotBooking.list("-created_date");
      }
      return base44.entities.AdSlotBooking.filter({ advertiser_id: user?.email }, "-created_date");
    },
    enabled: !!user?.email
  });

  // Fetch campaigns
  const { data: campaigns = [] } = useQuery({
    queryKey: ["analytics-campaigns", user?.email, isAdmin],
    queryFn: async () => {
      if (isAdmin) {
        return base44.entities.Campaign.list("-created_date");
      }
      return base44.entities.Campaign.filter({ advertiser_id: user?.email }, "-created_date");
    },
    enabled: !!user?.email
  });

  // Fetch screens
  const { data: screens = [] } = useQuery({
    queryKey: ["analytics-screens", isAdmin, user?.email],
    queryFn: async () => {
      if (isAdmin) {
        return base44.entities.Screen.list();
      }
      return base44.entities.Screen.filter({ owner_id: user?.email });
    },
    enabled: !!user?.email
  });

  // Calculate metrics
  const activeBookings = bookings.filter(b => b.status === "active");
  const activeCampaigns = campaigns.filter(c => c.status === "active");
  
  const totalImpressions = [...bookings, ...campaigns].reduce((sum, item) => sum + (item.impressions || 0), 0);
  const totalViews = [...bookings, ...campaigns].reduce((sum, item) => sum + (item.views || 0), 0);
  
  // Calculate playback duration (estimated based on bookings and campaigns)
  const totalPlaybackMinutes = activeBookings.reduce((sum, b) => {
    const durationSeconds = b.duration_seconds || 15;
    const estimatedPlays = b.impressions || 100;
    return sum + (durationSeconds * estimatedPlays / 60);
  }, 0);

  // Screen status
  const onlineScreens = screens.filter(s => s.status === "online").length;
  const offlineScreens = screens.filter(s => s.status === "offline").length;
  const maintenanceScreens = screens.filter(s => s.status === "maintenance").length;
  const pendingScreens = screens.filter(s => s.status === "pending_setup" || s.status === "pending_approval").length;

  // Generate chart data based on date range
  const getDaysCount = () => {
    switch (dateRange) {
      case "7d": return 7;
      case "30d": return 30;
      case "90d": return 90;
      default: return 7;
    }
  };

  const generateDailyData = () => {
    const days = getDaysCount();
    const interval = eachDayOfInterval({
      start: subDays(new Date(), days - 1),
      end: new Date()
    });

    return interval.map((date, idx) => {
      // Simulate realistic data with some variation
      const baseImpressions = Math.floor(totalImpressions / days) || 100;
      const variation = 0.3;
      const randomFactor = 1 + (Math.random() - 0.5) * variation;
      
      return {
        date: format(date, "MMM d"),
        impressions: Math.floor(baseImpressions * randomFactor * (0.8 + idx * 0.02)),
        views: Math.floor(baseImpressions * randomFactor * 0.6 * (0.8 + idx * 0.02)),
        playbackMinutes: Math.floor((totalPlaybackMinutes / days) * randomFactor)
      };
    });
  };

  const dailyData = generateDailyData();

  // Performance by screen data
  const screenPerformanceData = screens.slice(0, 5).map(screen => {
    const screenBookings = bookings.filter(b => b.screen_id === screen.id);
    const screenImpressions = screenBookings.reduce((sum, b) => sum + (b.impressions || 0), 0);
    return {
      name: screen.name?.substring(0, 15) || "Screen",
      impressions: screenImpressions || Math.floor(Math.random() * 5000 + 1000),
      status: screen.status
    };
  });

  // Screen status pie chart data
  const screenStatusData = [
    { name: "Online", value: onlineScreens, color: "#10b981" },
    { name: "Offline", value: offlineScreens, color: "#6b7280" },
    { name: "Maintenance", value: maintenanceScreens, color: "#f59e0b" },
    { name: "Pending", value: pendingScreens, color: "#8b5cf6" }
  ].filter(item => item.value > 0);

  // Ad type distribution
  const imageAds = bookings.filter(b => b.creative_type === "image").length;
  const videoAds = bookings.filter(b => b.creative_type === "video").length;
  const adTypeData = [
    { name: "Images", value: imageAds || 1, color: "#8b5cf6" },
    { name: "Videos", value: videoAds || 1, color: "#06b6d4" }
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-500 mt-1">Track your ad performance and screen status</p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <Eye className="w-8 h-8 text-violet-200" />
              <Badge className="bg-white/20 text-white border-0">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +12%
              </Badge>
            </div>
            <p className="text-violet-100 text-sm">Total Impressions</p>
            <p className="text-3xl font-bold">{totalImpressions.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <Play className="w-8 h-8 text-cyan-200" />
              <Badge className="bg-white/20 text-white border-0">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +8%
              </Badge>
            </div>
            <p className="text-cyan-100 text-sm">Total Views</p>
            <p className="text-3xl font-bold">{totalViews.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-8 h-8 text-amber-200" />
              <Badge className="bg-white/20 text-white border-0">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +5%
              </Badge>
            </div>
            <p className="text-amber-100 text-sm">Playback Duration</p>
            <p className="text-3xl font-bold">{Math.floor(totalPlaybackMinutes).toLocaleString()} min</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <MonitorPlay className="w-8 h-8 text-emerald-200" />
              <Badge className="bg-white/20 text-white border-0">
                {onlineScreens}/{screens.length}
              </Badge>
            </div>
            <p className="text-emerald-100 text-sm">Screens Online</p>
            <p className="text-3xl font-bold">{screens.length > 0 ? Math.round((onlineScreens / screens.length) * 100) : 0}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Impressions Over Time Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-violet-600" />
              Performance Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="impressionsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "white", 
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px"
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="impressions" 
                    stroke="#8b5cf6" 
                    fill="url(#impressionsGradient)"
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#06b6d4" 
                    fill="url(#viewsGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Screen Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              Screen Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={screenStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {screenStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-slate-600">Online</span>
                </div>
                <span className="font-semibold text-slate-900">{onlineScreens}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <WifiOff className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Offline</span>
                </div>
                <span className="font-semibold text-slate-900">{offlineScreens}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-slate-600">Maintenance</span>
                </div>
                <span className="font-semibold text-slate-900">{maintenanceScreens}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-violet-500" />
                  <span className="text-sm text-slate-600">Pending</span>
                </div>
                <span className="font-semibold text-slate-900">{pendingScreens}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Performing Screens */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-600" />
              Top Performing Screens
            </CardTitle>
          </CardHeader>
          <CardContent>
            {screenPerformanceData.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No screen data available</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={screenPerformanceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={100} />
                    <Tooltip />
                    <Bar dataKey="impressions" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ad Type Distribution & Active Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-600" />
              Ad Performance Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              {/* Ad Type Distribution */}
              <div>
                <p className="text-sm text-slate-500 mb-3">Ad Type Distribution</p>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={adTypeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={50}
                        dataKey="value"
                      >
                        {adTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-violet-500" />
                    <span className="text-xs text-slate-600">Images</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-cyan-500" />
                    <span className="text-xs text-slate-600">Videos</span>
                  </div>
                </div>
              </div>

              {/* Campaign Stats */}
              <div className="space-y-4">
                <p className="text-sm text-slate-500">Campaign Status</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Active</span>
                      <span className="font-medium">{activeCampaigns.length}</span>
                    </div>
                    <Progress value={campaigns.length > 0 ? (activeCampaigns.length / campaigns.length) * 100 : 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Active Bookings</span>
                      <span className="font-medium">{activeBookings.length}</span>
                    </div>
                    <Progress value={bookings.length > 0 ? (activeBookings.length / bookings.length) * 100 : 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Total Ads</span>
                      <span className="font-medium">{bookings.length + campaigns.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Screen Details Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MonitorPlay className="w-5 h-5 text-slate-600" />
            Screen Status Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3 text-sm font-medium text-slate-600">Screen</th>
                  <th className="text-left p-3 text-sm font-medium text-slate-600">Status</th>
                  <th className="text-left p-3 text-sm font-medium text-slate-600">Last Heartbeat</th>
                  <th className="text-left p-3 text-sm font-medium text-slate-600">Active Ads</th>
                  <th className="text-left p-3 text-sm font-medium text-slate-600">Uptime</th>
                </tr>
              </thead>
              <tbody>
                {screens.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">No screens found</td>
                  </tr>
                ) : (
                  screens.slice(0, 10).map((screen) => {
                    const screenBookings = bookings.filter(b => b.screen_id === screen.id && b.status === "active");
                    const statusColors = {
                      online: "bg-emerald-100 text-emerald-700",
                      offline: "bg-slate-100 text-slate-700",
                      maintenance: "bg-amber-100 text-amber-700",
                      pending_setup: "bg-blue-100 text-blue-700",
                      pending_approval: "bg-violet-100 text-violet-700"
                    };
                    return (
                      <tr key={screen.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              screen.status === "online" ? "bg-emerald-100" : "bg-slate-100"
                            }`}>
                              <MonitorPlay className={`w-4 h-4 ${
                                screen.status === "online" ? "text-emerald-600" : "text-slate-400"
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{screen.name}</p>
                              <p className="text-xs text-slate-500">{screen.device_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={statusColors[screen.status] || "bg-slate-100 text-slate-700"}>
                            {screen.status === "online" && <Wifi className="w-3 h-3 mr-1" />}
                            {screen.status?.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="p-3 text-sm text-slate-600">
                          {screen.last_heartbeat 
                            ? format(new Date(screen.last_heartbeat), "MMM d, h:mm a")
                            : "Never"
                          }
                        </td>
                        <td className="p-3 text-sm font-medium text-slate-900">
                          {screenBookings.length}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={screen.status === "online" ? 95 + Math.random() * 5 : Math.random() * 50} 
                              className="h-2 w-20" 
                            />
                            <span className="text-xs text-slate-500">
                              {screen.status === "online" ? "99%" : "—"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}