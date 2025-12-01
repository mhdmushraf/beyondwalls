import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, parseISO, differenceInDays } from "date-fns";
import {
  BarChart3,
  Eye,
  MonitorPlay,
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
  ChevronRight,
  Play,
  Repeat
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
import { MetricExplainer } from "@/components/onboarding/MetricExplainer";

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dateRange, setDateRange] = useState("30d");
  const [selectedCampaign, setSelectedCampaign] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl("AnalyticsDashboard"));
        return;
      }
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {
      base44.auth.redirectToLogin(createPageUrl("AnalyticsDashboard"));
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchBookings();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Filter active and completed bookings
  const relevantBookings = bookings.filter(b => ["active", "completed"].includes(b.status));
  const activeBookings = bookings.filter(b => b.status === "active");

  // Calculate comprehensive metrics for DOOH (Digital Out-of-Home)
  const days = dateRange === "7d" ? 7 : dateRange === "14d" ? 14 : dateRange === "30d" ? 30 : 90;
  
  const calculateMetrics = () => {
    let totalImpressions = 0;
    let totalReach = 0;
    let totalPlayouts = 0;
    let totalScreenTime = 0; // in minutes
    let totalSpend = 0;
    let activeScreensCount = 0;

    relevantBookings.forEach(booking => {
      const screen = screens.find(s => s.id === booking.screen_id);
      const venue = venues.find(v => v.id === screen?.venue_id);
      const startDate = parseISO(booking.start_date);
      const endDate = parseISO(booking.end_date);
      const campaignDays = Math.max(1, differenceInDays(endDate, startDate));
      
      // Use venue's estimated daily viewers if available, otherwise screen avg_daily_views
      const dailyViewers = venue?.estimated_daily_viewers || screen?.avg_daily_views || 500;
      
      const impressions = dailyViewers * Math.min(campaignDays, days);
      totalImpressions += impressions;
      totalReach += impressions * 0.65; // Unique reach (accounting for repeat visitors)
      
      // Calculate playouts: ads play in 10-minute loop, 15 sec each = ~6 playouts per hour
      // Operating hours avg ~12 hours/day
      const playoutsPerDay = 6 * 12; // 72 playouts per day
      totalPlayouts += playoutsPerDay * Math.min(campaignDays, days);
      
      // Screen time: 15 seconds per playout
      totalScreenTime += (playoutsPerDay * 15 / 60) * Math.min(campaignDays, days);
      
      totalSpend += booking.total_cost || 0;
      activeScreensCount++;
    });

    const totalFrequency = totalReach > 0 ? (totalImpressions / totalReach).toFixed(1) : 0;
    
    // DOOH-specific metrics
    const cpm = totalImpressions > 0 ? ((totalSpend / totalImpressions) * 1000).toFixed(2) : 0;
    const costPerPlayout = totalPlayouts > 0 ? (totalSpend / totalPlayouts).toFixed(2) : 0;
    const avgDailyImpressions = totalImpressions / days;
    const avgScreenTime = totalScreenTime / days; // minutes per day
    
    // Estimated brand lift (industry benchmark for DOOH is 15-25%)
    const estimatedBrandLift = 18;
    
    return {
      totalImpressions,
      totalReach: Math.round(totalReach),
      totalPlayouts,
      totalScreenTime: Math.round(totalScreenTime),
      totalSpend,
      totalFrequency,
      cpm,
      costPerPlayout,
      avgDailyImpressions: Math.round(avgDailyImpressions),
      avgScreenTime: avgScreenTime.toFixed(1),
      activeScreensCount,
      estimatedBrandLift
    };
  };

  const metrics = calculateMetrics();

  // Generate time series data for DOOH
  const generateTimeSeriesData = () => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayVariance = 0.7 + Math.random() * 0.6;
      const baseImpressions = (metrics.totalImpressions / days) * dayVariance;
      const impressions = Math.round(baseImpressions);
      const reach = Math.round(impressions * 0.65);
      const playouts = Math.round((metrics.totalPlayouts / days) * dayVariance);
      const screenTime = Math.round((metrics.totalScreenTime / days) * dayVariance);
      const spend = Math.round((metrics.totalSpend / days) * dayVariance);

      data.push({
        date: format(date, days > 14 ? "MMM d" : "EEE"),
        fullDate: format(date, "MMM d, yyyy"),
        impressions,
        reach,
        playouts,
        screenTime,
        spend,
        frequency: reach > 0 ? (impressions / reach).toFixed(1) : 0
      });
    }
    return data;
  };

  const timeSeriesData = generateTimeSeriesData();

  // Audience funnel data for DOOH
  const funnelData = [
    { stage: "Total Playouts", value: metrics.totalPlayouts, color: "#8b5cf6", desc: "Times your ad played" },
    { stage: "Impressions", value: metrics.totalImpressions, color: "#6366f1", desc: "Estimated views" },
    { stage: "Unique Reach", value: metrics.totalReach, color: "#3b82f6", desc: "Individual viewers" },
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

      {/* Key Metrics Grid - DOOH Specific with Explainers */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-violet-500 to-violet-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Play className="w-5 h-5 opacity-80" />
              <Badge className="bg-white/20 text-white border-0 text-xs">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +12%
              </Badge>
            </div>
            <p className="text-2xl font-bold">{metrics.totalPlayouts.toLocaleString()}</p>
            <MetricExplainer metric="playouts">
              <p className="text-violet-200 text-sm">Ad Playouts</p>
            </MetricExplainer>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-5 h-5 opacity-80" />
              <Badge className="bg-white/20 text-white border-0 text-xs">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +8%
              </Badge>
            </div>
            <p className="text-2xl font-bold">{metrics.totalImpressions.toLocaleString()}</p>
            <MetricExplainer metric="impressions">
              <p className="text-indigo-200 text-sm">Impressions</p>
            </MetricExplainer>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 opacity-80" />
              <MetricExplainer metric="frequency">
                <span className="text-xs text-blue-200">{metrics.totalFrequency}x freq</span>
              </MetricExplainer>
            </div>
            <p className="text-2xl font-bold">{metrics.totalReach.toLocaleString()}</p>
            <MetricExplainer metric="reach">
              <p className="text-blue-200 text-sm">Unique Reach</p>
            </MetricExplainer>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <MonitorPlay className="w-5 h-5 opacity-80" />
              <span className="text-xs text-emerald-200">{metrics.activeScreensCount} screens</span>
            </div>
            <p className="text-2xl font-bold">{metrics.totalScreenTime} min</p>
            <MetricExplainer metric="screenTime">
              <p className="text-emerald-200 text-sm">Screen Time</p>
            </MetricExplainer>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 opacity-80" />
              <span className="text-xs text-amber-200">Est. Lift</span>
            </div>
            <p className="text-2xl font-bold">{metrics.estimatedBrandLift}%</p>
            <MetricExplainer metric="brandLift">
              <p className="text-amber-200 text-sm">Brand Awareness</p>
            </MetricExplainer>
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

      {/* Secondary Metrics - DOOH Specific with Help */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <MetricExplainer metric="frequency">
              <p className="text-sm text-slate-500">Frequency</p>
            </MetricExplainer>
            <p className="text-xl font-bold text-slate-900">{metrics.totalFrequency}x</p>
            <p className="text-xs text-slate-400">How often each person saw your ad</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MetricExplainer metric="cpm">
              <p className="text-sm text-slate-500">CPM</p>
            </MetricExplainer>
            <p className="text-xl font-bold text-slate-900">AED {metrics.cpm}</p>
            <p className="text-xs text-slate-400">Cost per 1,000 views</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MetricExplainer metric="costPerPlayout">
              <p className="text-sm text-slate-500">Cost per Playout</p>
            </MetricExplainer>
            <p className="text-xl font-bold text-slate-900">AED {metrics.costPerPlayout}</p>
            <p className="text-xs text-slate-400">Cost each time ad displays</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-slate-500">Daily Average</p>
            <p className="text-xl font-bold text-emerald-600">{metrics.avgDailyImpressions.toLocaleString()}</p>
            <p className="text-xs text-slate-400">People seeing your ad daily</p>
          </CardContent>
        </Card>
      </div>

      {/* Simple Explanation Banner */}
      <Card className="bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">📊 What do these numbers mean?</h4>
              <p className="text-sm text-slate-600">
                Your ads played <strong>{metrics.totalPlayouts.toLocaleString()}</strong> times on screens, 
                reaching approximately <strong>{metrics.totalReach.toLocaleString()}</strong> unique people. 
                On average, each person saw your ad <strong>{metrics.totalFrequency} times</strong>, 
                which helps build brand recognition. Click on any metric label to learn more!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                <TabsTrigger value="engagement">Playouts & Views</TabsTrigger>
                <TabsTrigger value="spend">Ad Spend</TabsTrigger>
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
                        <linearGradient id="playoutsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="impressionsGradient" x1="0" y1="0" x2="0" y2="1">
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
                        dataKey="playouts" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        fill="url(#playoutsGradient)"
                        name="Playouts"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="impressions" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        fill="url(#impressionsGradient)"
                        name="Impressions"
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

        {/* Audience Funnel - DOOH */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-violet-600" />
              Audience Funnel
            </CardTitle>
            <CardDescription>From playouts to unique viewers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.map((item, index) => {
                const maxValue = funnelData[0].value;
                const percentage = ((item.value / maxValue) * 100).toFixed(0);

                return (
                  <div key={item.stage}>
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="text-sm font-medium text-slate-700">{item.stage}</span>
                        <p className="text-xs text-slate-400">{item.desc}</p>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{item.value.toLocaleString()}</span>
                    </div>
                    <div className="h-8 bg-slate-100 rounded-lg overflow-hidden relative">
                      <div 
                        className="h-full rounded-lg transition-all duration-500"
                        style={{ width: `${percentage}%`, backgroundColor: item.color }}
                      />
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
            
            {/* DOOH specific insights */}
            <div className="mt-6 p-3 bg-violet-50 rounded-lg border border-violet-100">
              <p className="text-xs font-medium text-violet-800 mb-2">📊 DOOH Insights</p>
              <ul className="text-xs text-violet-600 space-y-1">
                <li>• Your ads play ~72 times/day per screen</li>
                <li>• Average dwell time exposure: 15 seconds</li>
                <li>• Industry avg brand recall: 47%</li>
              </ul>
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