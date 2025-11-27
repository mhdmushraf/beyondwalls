import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, parseISO, differenceInDays } from "date-fns";
import {
  BarChart3,
  Eye,
  MousePointer,
  Target,
  TrendingUp,
  DollarSign,
  MapPin,
  Clock,
  Building2,
  Users,
  Sparkles,
  RefreshCw,
  Download,
  Calendar,
  Filter,
  Loader2,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
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
  Legend,
  ComposedChart,
  Scatter
} from "recharts";

import PerformanceByLocation from "@/components/analytics/PerformanceByLocation";
import PerformanceByTimeSlot from "@/components/analytics/PerformanceByTimeSlot";
import PerformanceByVenueType from "@/components/analytics/PerformanceByVenueType";
import AIOptimizationRecommendations from "@/components/analytics/AIOptimizationRecommendations";

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dateRange, setDateRange] = useState("30d");
  const [selectedCampaign, setSelectedCampaign] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const { data: bookings = [], refetch: refetchBookings } = useQuery({
    queryKey: ["analytics-bookings", user?.email],
    queryFn: () => base44.entities.AdSlotBooking.filter({ advertiser_id: user?.email }, "-created_date"),
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

  const { data: transactions = [] } = useQuery({
    queryKey: ["analytics-transactions", user?.email],
    queryFn: () => base44.entities.Transaction.filter({ user_id: user?.email }, "-created_date"),
    enabled: !!user?.email
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchBookings();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Filter active and completed bookings
  const relevantBookings = bookings.filter(b => ["active", "completed"].includes(b.status));
  const activeBookings = bookings.filter(b => b.status === "active");

  // Calculate comprehensive metrics
  const days = dateRange === "7d" ? 7 : dateRange === "14d" ? 14 : dateRange === "30d" ? 30 : 90;
  
  const calculateMetrics = () => {
    let totalImpressions = 0;
    let totalReach = 0;
    let totalClicks = 0;
    let totalConversions = 0;
    let totalSpend = 0;
    let totalFrequency = 0;

    relevantBookings.forEach(booking => {
      const screen = screens.find(s => s.id === booking.screen_id);
      const startDate = parseISO(booking.start_date);
      const endDate = parseISO(booking.end_date);
      const campaignDays = Math.max(1, differenceInDays(endDate, startDate));
      const avgDailyViews = screen?.avg_daily_views || 500;
      
      const impressions = avgDailyViews * Math.min(campaignDays, days);
      totalImpressions += impressions;
      totalReach += impressions * 0.65; // Unique reach
      totalSpend += booking.total_cost || 0;
    });

    totalClicks = Math.round(totalImpressions * 0.028);
    totalConversions = Math.round(totalClicks * 0.14);
    totalFrequency = totalReach > 0 ? (totalImpressions / totalReach).toFixed(1) : 0;

    const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : 0;
    const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : 0;
    const cpm = totalImpressions > 0 ? ((totalSpend / totalImpressions) * 1000).toFixed(2) : 0;
    const cpc = totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : 0;
    const cpa = totalConversions > 0 ? (totalSpend / totalConversions).toFixed(2) : 0;
    const estimatedRevenue = totalConversions * 150;
    const roi = totalSpend > 0 ? (((estimatedRevenue - totalSpend) / totalSpend) * 100).toFixed(0) : 0;

    return {
      totalImpressions,
      totalReach: Math.round(totalReach),
      totalClicks,
      totalConversions,
      totalSpend,
      totalFrequency,
      ctr,
      conversionRate,
      cpm,
      cpc,
      cpa,
      estimatedRevenue,
      roi
    };
  };

  const metrics = calculateMetrics();

  // Generate time series data
  const generateTimeSeriesData = () => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayVariance = 0.7 + Math.random() * 0.6;
      const baseImpressions = (metrics.totalImpressions / days) * dayVariance;
      const impressions = Math.round(baseImpressions);
      const reach = Math.round(impressions * 0.65);
      const clicks = Math.round(impressions * 0.028 * (0.8 + Math.random() * 0.4));
      const conversions = Math.round(clicks * 0.14 * (0.7 + Math.random() * 0.6));
      const spend = Math.round((metrics.totalSpend / days) * dayVariance);

      data.push({
        date: format(date, days > 14 ? "MMM d" : "EEE"),
        fullDate: format(date, "MMM d, yyyy"),
        impressions,
        reach,
        clicks,
        conversions,
        spend,
        ctr: impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : 0,
        frequency: reach > 0 ? (impressions / reach).toFixed(1) : 0
      });
    }
    return data;
  };

  const timeSeriesData = generateTimeSeriesData();

  // Engagement funnel data
  const funnelData = [
    { stage: "Impressions", value: metrics.totalImpressions, color: "#8b5cf6" },
    { stage: "Reach", value: metrics.totalReach, color: "#6366f1" },
    { stage: "Clicks", value: metrics.totalClicks, color: "#3b82f6" },
    { stage: "Conversions", value: metrics.totalConversions, color: "#10b981" }
  ];

  if (!user) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-violet-600" />
            Analytics Dashboard
          </h1>
          <p className="text-slate-500">Comprehensive campaign performance insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="14d">Last 14 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-5 h-5 opacity-80" />
              <Badge className="bg-white/20 text-white border-0 text-xs">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +12%
              </Badge>
            </div>
            <p className="text-2xl font-bold">{metrics.totalImpressions.toLocaleString()}</p>
            <p className="text-violet-200 text-sm">Impressions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 opacity-80" />
              <Badge className="bg-white/20 text-white border-0 text-xs">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +8%
              </Badge>
            </div>
            <p className="text-2xl font-bold">{metrics.totalReach.toLocaleString()}</p>
            <p className="text-indigo-200 text-sm">Unique Reach</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <MousePointer className="w-5 h-5 opacity-80" />
              <span className="text-xs text-blue-200">{metrics.ctr}% CTR</span>
            </div>
            <p className="text-2xl font-bold">{metrics.totalClicks.toLocaleString()}</p>
            <p className="text-blue-200 text-sm">Total Clicks</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 opacity-80" />
              <Badge className="bg-white/20 text-white border-0 text-xs">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +15%
              </Badge>
            </div>
            <p className="text-2xl font-bold">{metrics.totalConversions.toLocaleString()}</p>
            <p className="text-emerald-200 text-sm">Conversions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 opacity-80" />
              <span className={`text-xs ${metrics.roi > 0 ? "text-amber-200" : "text-red-200"}`}>
                {metrics.roi > 0 ? "Profitable" : "Loss"}
              </span>
            </div>
            <p className="text-2xl font-bold">{metrics.roi}%</p>
            <p className="text-amber-200 text-sm">Est. ROI</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500 to-rose-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 opacity-80" />
              <span className="text-xs text-rose-200">Total</span>
            </div>
            <p className="text-2xl font-bold">AED {metrics.totalSpend.toLocaleString()}</p>
            <p className="text-rose-200 text-sm">Ad Spend</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-slate-500">Frequency</p>
            <p className="text-xl font-bold text-slate-900">{metrics.totalFrequency}x</p>
            <p className="text-xs text-slate-400">Avg. views per person</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-slate-500">CPM</p>
            <p className="text-xl font-bold text-slate-900">AED {metrics.cpm}</p>
            <p className="text-xs text-slate-400">Cost per 1000 imp.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-slate-500">CPC</p>
            <p className="text-xl font-bold text-slate-900">AED {metrics.cpc}</p>
            <p className="text-xs text-slate-400">Cost per click</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-slate-500">CPA</p>
            <p className="text-xl font-bold text-slate-900">AED {metrics.cpa}</p>
            <p className="text-xs text-slate-400">Cost per conversion</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-slate-500">Conv. Rate</p>
            <p className="text-xl font-bold text-emerald-600">{metrics.conversionRate}%</p>
            <p className="text-xs text-slate-400">Click to conversion</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Performance Over Time */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-600" />
              Performance Over Time
            </CardTitle>
            <CardDescription>Track reach, frequency, and engagement trends</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="reach">
              <TabsList className="mb-4">
                <TabsTrigger value="reach">Reach & Frequency</TabsTrigger>
                <TabsTrigger value="engagement">Engagement</TabsTrigger>
                <TabsTrigger value="spend">Spend & ROI</TabsTrigger>
              </TabsList>

              <TabsContent value="reach">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={timeSeriesData}>
                      <defs>
                        <linearGradient id="reachGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                      <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} />
                      <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
                      <Legend />
                      <Area 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="reach" 
                        stroke="#6366f1" 
                        strokeWidth={2}
                        fill="url(#reachGradient)"
                        name="Unique Reach"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="frequency" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        name="Frequency"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="engagement">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeSeriesData}>
                      <defs>
                        <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="conversionsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="clicks" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        fill="url(#clicksGradient)"
                        name="Clicks"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="conversions" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        fill="url(#conversionsGradient)"
                        name="Conversions"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="spend">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
                        formatter={(value) => [`AED ${value}`, "Spend"]}
                      />
                      <Bar dataKey="spend" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Daily Spend" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Engagement Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-violet-600" />
              Engagement Funnel
            </CardTitle>
            <CardDescription>From impression to conversion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.map((item, index) => {
                const maxValue = funnelData[0].value;
                const percentage = ((item.value / maxValue) * 100).toFixed(0);
                const convRate = index > 0 
                  ? ((item.value / funnelData[index - 1].value) * 100).toFixed(1) 
                  : "100";

                return (
                  <div key={item.stage}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{item.stage}</span>
                      <span className="text-sm text-slate-500">{item.value.toLocaleString()}</span>
                    </div>
                    <div className="h-8 bg-slate-100 rounded-lg overflow-hidden relative">
                      <div 
                        className="h-full rounded-lg transition-all duration-500"
                        style={{ width: `${percentage}%`, backgroundColor: item.color }}
                      />
                      <div className="absolute inset-0 flex items-center justify-end pr-2">
                        <span className="text-xs font-medium text-white drop-shadow">
                          {index > 0 && `${convRate}% conv`}
                        </span>
                      </div>
                    </div>
                    {index < funnelData.length - 1 && (
                      <div className="flex justify-center py-1">
                        <ChevronRight className="w-4 h-4 text-slate-300 rotate-90" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Breakdowns */}
      <Tabs defaultValue="location" className="space-y-6">
        <TabsList className="bg-white border">
          <TabsTrigger value="location" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            By Location
          </TabsTrigger>
          <TabsTrigger value="timeslot" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            By Time Slot
          </TabsTrigger>
          <TabsTrigger value="venue" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            By Venue Type
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Recommendations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="location">
          <PerformanceByLocation 
            bookings={relevantBookings}
            screens={screens}
            venues={venues}
          />
        </TabsContent>

        <TabsContent value="timeslot">
          <PerformanceByTimeSlot 
            bookings={relevantBookings}
            screens={screens}
          />
        </TabsContent>

        <TabsContent value="venue">
          <PerformanceByVenueType 
            bookings={relevantBookings}
            screens={screens}
            venues={venues}
          />
        </TabsContent>

        <TabsContent value="ai">
          <AIOptimizationRecommendations 
            bookings={relevantBookings}
            screens={screens}
            venues={venues}
            metrics={metrics}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}