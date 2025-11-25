import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, differenceInDays, eachDayOfInterval, parseISO } from "date-fns";
import {
  ArrowLeft,
  BarChart3,
  Eye,
  TrendingUp,
  Calendar,
  MonitorPlay,
  Download,
  Clock,
  DollarSign,
  Target,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function CampaignReport() {
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

  // Generate mock performance data
  const generatePerformanceData = () => {
    if (!booking) return [];
    const startDate = parseISO(booking.start_date);
    const endDate = new Date() < parseISO(booking.end_date) ? new Date() : parseISO(booking.end_date);
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    return days.map((day, i) => ({
      date: format(day, "MMM d"),
      impressions: Math.floor(Math.random() * 500 + 200 + (i * 10)),
      views: Math.floor(Math.random() * 300 + 100 + (i * 5)),
      engagement: Math.floor(Math.random() * 50 + 20)
    }));
  };

  const performanceData = generatePerformanceData();
  
  const totalImpressions = performanceData.reduce((sum, d) => sum + d.impressions, 0);
  const totalViews = performanceData.reduce((sum, d) => sum + d.views, 0);
  const avgEngagement = performanceData.length > 0 
    ? (performanceData.reduce((sum, d) => sum + d.engagement, 0) / performanceData.length).toFixed(1)
    : 0;

  const hourlyData = [
    { hour: "6AM", impressions: 120 },
    { hour: "9AM", impressions: 350 },
    { hour: "12PM", impressions: 520 },
    { hour: "3PM", impressions: 410 },
    { hour: "6PM", impressions: 680 },
    { hour: "9PM", impressions: 450 },
  ];

  const demographicData = [
    { name: "18-24", value: 25, color: "#8b5cf6" },
    { name: "25-34", value: 35, color: "#6366f1" },
    { name: "35-44", value: 22, color: "#3b82f6" },
    { name: "45-54", value: 12, color: "#0ea5e9" },
    { name: "55+", value: 6, color: "#06b6d4" },
  ];

  const costPerImpression = totalImpressions > 0 ? ((booking?.total_cost || 0) / totalImpressions).toFixed(3) : 0;

  if (!booking) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <p className="text-slate-500">Loading report...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Campaign Report</h1>
          <p className="text-slate-500">{booking.campaign_name}</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Campaign Info */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-6 items-center justify-between">
            <div className="flex items-center gap-4">
              {booking.creative_url && (
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100">
                  {booking.creative_type === "video" ? (
                    <video src={booking.creative_url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={booking.creative_url} className="w-full h-full object-cover" alt="" />
                  )}
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-slate-900">{booking.campaign_name}</h2>
                <p className="text-slate-500 flex items-center gap-2 mt-1">
                  <MonitorPlay className="w-4 h-4" />
                  {screen?.name} • {venue?.name}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge>{booking.status}</Badge>
                  <span className="text-sm text-slate-500">
                    {format(parseISO(booking.start_date), "MMM d")} - {format(parseISO(booking.end_date), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Total Spent</p>
              <p className="text-2xl font-bold text-violet-600">AED {booking.total_cost}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Impressions</p>
                <p className="text-2xl font-bold text-slate-900">{totalImpressions.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <Eye className="w-5 h-5 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Views</p>
                <p className="text-2xl font-bold text-slate-900">{totalViews.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Avg Engagement</p>
                <p className="text-2xl font-bold text-slate-900">{avgEngagement}%</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Cost per Impression</p>
                <p className="text-2xl font-bold text-slate-900">AED {costPerImpression}</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timing">Timing Analysis</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Daily Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "white", 
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px"
                      }} 
                    />
                    <Line type="monotone" dataKey="impressions" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-violet-500" />
                  <span className="text-sm text-slate-600">Impressions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span className="text-sm text-slate-600">Views</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timing">
          <Card>
            <CardHeader>
              <CardTitle>Impressions by Time of Day</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="hour" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "white", 
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px"
                      }} 
                    />
                    <Bar dataKey="impressions" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 bg-violet-50 rounded-xl">
                <p className="text-sm text-violet-800">
                  <strong>Peak Performance:</strong> Your ad performs best between 6PM - 9PM with an average of 680 impressions per hour.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Age Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={demographicData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {demographicData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {demographicData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-slate-600">{item.name}: {item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Venue Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Venue Type</p>
                  <p className="font-semibold capitalize">{venue?.type || "N/A"}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Location</p>
                  <p className="font-semibold">{venue?.city}, {venue?.area}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Avg Daily Footfall</p>
                  <p className="font-semibold">{venue?.avg_daily_footfall?.toLocaleString() || "N/A"} visitors</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500">Operating Hours</p>
                  <p className="font-semibold">{venue?.operating_hours || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}