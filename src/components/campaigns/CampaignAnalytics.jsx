import React, { useState } from "react";
import { format, differenceInDays, parseISO, subDays } from "date-fns";
import {
  Eye,
  MousePointer,
  Target,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Legend
} from "recharts";

export default function CampaignAnalytics({ booking, screen, venue }) {
  const [dateRange, setDateRange] = useState("7d");

  if (!booking) return null;

  // Calculate campaign duration and progress
  const startDate = parseISO(booking.start_date);
  const endDate = parseISO(booking.end_date);
  const totalDays = differenceInDays(endDate, startDate) || 1;
  const daysElapsed = Math.max(0, Math.min(differenceInDays(new Date(), startDate), totalDays));
  const progressPercent = Math.round((daysElapsed / totalDays) * 100);

  // Simulated metrics based on screen data and campaign duration
  const avgDailyViews = screen?.avg_daily_views || 500;
  const totalImpressions = avgDailyViews * daysElapsed;
  const estimatedTotalImpressions = avgDailyViews * totalDays;
  
  // Simulated engagement metrics
  const baseEngagementRate = 0.032; // 3.2% base
  const engagementVariance = Math.random() * 0.01;
  const engagementRate = baseEngagementRate + engagementVariance;
  const engagedUsers = Math.round(totalImpressions * engagementRate);
  
  // CTR and conversions (simulated)
  const ctr = 0.024 + (Math.random() * 0.008); // 2.4-3.2%
  const clicks = Math.round(totalImpressions * ctr);
  const conversionRate = 0.12 + (Math.random() * 0.05); // 12-17%
  const conversions = Math.round(clicks * conversionRate);
  
  // ROI calculation
  const estimatedRevenuePerConversion = 150; // AED
  const estimatedRevenue = conversions * estimatedRevenuePerConversion;
  const roi = booking.total_cost > 0 ? ((estimatedRevenue - booking.total_cost) / booking.total_cost * 100) : 0;
  const costPerImpression = booking.total_cost / (totalImpressions || 1);
  const costPerClick = booking.total_cost / (clicks || 1);
  const costPerConversion = booking.total_cost / (conversions || 1);

  // Generate daily performance data
  const generateDailyData = () => {
    const days = dateRange === "7d" ? 7 : dateRange === "14d" ? 14 : 30;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayVariance = 0.7 + Math.random() * 0.6;
      const impressions = Math.round(avgDailyViews * dayVariance);
      const dayClicks = Math.round(impressions * ctr * (0.8 + Math.random() * 0.4));
      data.push({
        date: format(date, "MMM d"),
        impressions,
        clicks: dayClicks,
        engagement: Math.round(impressions * engagementRate * (0.8 + Math.random() * 0.4)),
        conversions: Math.round(dayClicks * conversionRate * (0.7 + Math.random() * 0.6))
      });
    }
    return data;
  };

  const dailyData = generateDailyData();

  // Hourly distribution data
  const hourlyData = [
    { hour: "6AM", impressions: 120 },
    { hour: "9AM", impressions: 450 },
    { hour: "12PM", impressions: 680 },
    { hour: "3PM", impressions: 520 },
    { hour: "6PM", impressions: 890 },
    { hour: "9PM", impressions: 720 },
    { hour: "12AM", impressions: 180 },
  ];

  // Audience demographics (simulated)
  const demographicsData = [
    { name: "18-24", value: 22, color: "#8b5cf6" },
    { name: "25-34", value: 35, color: "#6366f1" },
    { name: "35-44", value: 25, color: "#3b82f6" },
    { name: "45-54", value: 12, color: "#0ea5e9" },
    { name: "55+", value: 6, color: "#06b6d4" },
  ];

  // Device/location breakdown
  const locationData = [
    { name: venue?.city || "Dubai", value: 65 },
    { name: "Nearby Areas", value: 25 },
    { name: "Other", value: 10 },
  ];

  const MetricCard = ({ title, value, subValue, icon: Icon, trend, trendValue, color = "violet" }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className={`text-2xl font-bold text-${color}-600 mt-1`}>{value}</p>
            {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
          </div>
          <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center`}>
            <Icon className={`w-5 h-5 text-${color}-600`} />
          </div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${trend === "up" ? "text-emerald-600" : "text-rose-600"}`}>
            {trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{trendValue}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Campaign Progress */}
      <Card className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Campaign Progress</h3>
              <p className="text-violet-200 text-sm">
                {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{daysElapsed}</p>
                <p className="text-violet-200 text-sm">Days Active</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{totalDays - daysElapsed}</p>
                <p className="text-violet-200 text-sm">Days Left</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{progressPercent}%</p>
                <p className="text-violet-200 text-sm">Complete</p>
              </div>
            </div>
          </div>
          <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Impressions"
          value={totalImpressions.toLocaleString()}
          subValue={`of ${estimatedTotalImpressions.toLocaleString()} est.`}
          icon={Eye}
          trend="up"
          trendValue="+12% vs avg"
          color="violet"
        />
        <MetricCard
          title="Click-Through Rate"
          value={`${(ctr * 100).toFixed(2)}%`}
          subValue={`${clicks.toLocaleString()} clicks`}
          icon={MousePointer}
          trend="up"
          trendValue="+8% vs avg"
          color="blue"
        />
        <MetricCard
          title="Conversions"
          value={conversions.toLocaleString()}
          subValue={`${(conversionRate * 100).toFixed(1)}% conv. rate`}
          icon={Target}
          trend="up"
          trendValue="+15% vs avg"
          color="emerald"
        />
        <MetricCard
          title="Est. ROI"
          value={`${roi.toFixed(0)}%`}
          subValue={`AED ${estimatedRevenue.toLocaleString()} revenue`}
          icon={TrendingUp}
          trend={roi > 0 ? "up" : "down"}
          trendValue={roi > 0 ? "Profitable" : "Below target"}
          color="amber"
        />
      </div>

      {/* Cost Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-slate-500">Cost per Impression</p>
            <p className="text-xl font-bold text-slate-900">AED {costPerImpression.toFixed(3)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-slate-500">Cost per Click</p>
            <p className="text-xl font-bold text-slate-900">AED {costPerClick.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-slate-500">Cost per Conversion</p>
            <p className="text-xl font-bold text-slate-900">AED {costPerConversion.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-slate-500">Total Spend</p>
            <p className="text-xl font-bold text-violet-600">AED {booking.total_cost?.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-violet-600" />
              Performance Over Time
            </CardTitle>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="14d">Last 14 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="impressions">
            <TabsList className="mb-4">
              <TabsTrigger value="impressions">Impressions</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="conversions">Conversions</TabsTrigger>
            </TabsList>

            <TabsContent value="impressions">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData}>
                    <defs>
                      <linearGradient id="impressionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
                      formatter={(value) => [value.toLocaleString(), "Impressions"]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="impressions" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      fill="url(#impressionGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="engagement">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
                    <Legend />
                    <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Clicks" />
                    <Line type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Engagements" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="conversions">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
                    <Bar dataKey="conversions" fill="#10b981" radius={[4, 4, 0, 0]} name="Conversions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Audience & Time Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-600" />
              Audience Demographics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={demographicsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {demographicsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {demographicsData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-violet-600" />
              Peak Performance Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                  <YAxis type="category" dataKey="hour" stroke="#94a3b8" fontSize={12} width={50} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="impressions" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-3 bg-violet-50 rounded-lg">
              <p className="text-sm text-violet-800">
                <strong>Best performing:</strong> 6PM - 9PM with highest engagement rates
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-700 font-medium mb-2">
                <TrendingUp className="w-4 h-4" />
                Strong Performance
              </div>
              <p className="text-sm text-emerald-600">
                Your CTR of {(ctr * 100).toFixed(2)}% is above the industry average of 2.1%
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                <Users className="w-4 h-4" />
                Target Audience
              </div>
              <p className="text-sm text-blue-600">
                25-34 age group shows highest engagement at {venue?.city || "your location"}
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-2 text-amber-700 font-medium mb-2">
                <Clock className="w-4 h-4" />
                Optimization Tip
              </div>
              <p className="text-sm text-amber-600">
                Consider extending campaigns to cover evening peak hours (6-9PM)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}