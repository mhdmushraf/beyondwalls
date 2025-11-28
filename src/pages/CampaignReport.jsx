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
  Users,
  MapPin,
  Phone,
  Globe,
  QrCode,
  Share2,
  Building2
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

  // Generate performance data based on venue footfall
  const generatePerformanceData = () => {
    if (!booking) return [];
    const startDate = parseISO(booking.start_date);
    const endDate = new Date() < parseISO(booking.end_date) ? new Date() : parseISO(booking.end_date);
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const baseFootfall = venue?.avg_daily_footfall || 500;
    
    return days.map((day, i) => {
      const dayOfWeek = day.getDay();
      // Weekend multiplier
      const weekendMultiplier = (dayOfWeek === 5 || dayOfWeek === 6) ? 1.4 : 1;
      const dailyFootfall = Math.floor(baseFootfall * weekendMultiplier * (0.8 + Math.random() * 0.4));
      // Estimated views (people who looked at screen) - ~60-80% of footfall
      const screenViews = Math.floor(dailyFootfall * (0.6 + Math.random() * 0.2));
      // Dwell time - avg seconds people spend looking
      const avgDwellTime = Math.floor(8 + Math.random() * 7);
      
      return {
        date: format(day, "MMM d"),
        footfall: dailyFootfall,
        screenViews: screenViews,
        dwellTime: avgDwellTime
      };
    });
  };

  const performanceData = generatePerformanceData();
  
  const totalFootfall = performanceData.reduce((sum, d) => sum + d.footfall, 0);
  const totalScreenViews = performanceData.reduce((sum, d) => sum + d.screenViews, 0);
  const avgDwellTime = performanceData.length > 0 
    ? (performanceData.reduce((sum, d) => sum + d.dwellTime, 0) / performanceData.length).toFixed(1)
    : 0;
  const viewRate = totalFootfall > 0 ? ((totalScreenViews / totalFootfall) * 100).toFixed(1) : 0;

  const hourlyData = [
    { hour: "6AM", footfall: 80, label: "Early Morning" },
    { hour: "9AM", footfall: 280, label: "Morning Rush" },
    { hour: "12PM", footfall: 450, label: "Lunch Peak" },
    { hour: "3PM", footfall: 320, label: "Afternoon" },
    { hour: "6PM", footfall: 580, label: "Evening Peak" },
    { hour: "9PM", footfall: 350, label: "Night" },
  ];

  const demographicData = [
    { name: "18-24", value: 25, color: "#8b5cf6" },
    { name: "25-34", value: 35, color: "#6366f1" },
    { name: "35-44", value: 22, color: "#3b82f6" },
    { name: "45-54", value: 12, color: "#0ea5e9" },
    { name: "55+", value: 6, color: "#06b6d4" },
  ];

  // Cost per thousand views (CPM style for DOOH)
  const costPerThousandViews = totalScreenViews > 0 ? ((booking?.total_cost || 0) / totalScreenViews * 1000).toFixed(2) : 0;
  // Cost per visitor reached (CPV)
  const costPerVisitor = totalFootfall > 0 ? ((booking?.total_cost || 0) / totalFootfall).toFixed(3) : 0;
  
  // Conversion tracking estimates
  const estimatedWebsiteVisits = Math.floor(totalScreenViews * 0.02); // 2% conversion estimate
  const estimatedCalls = Math.floor(totalScreenViews * 0.005); // 0.5% call estimate
  const estimatedQRScans = Math.floor(totalScreenViews * 0.01); // 1% QR scan estimate
  const totalConversions = estimatedWebsiteVisits + estimatedCalls + estimatedQRScans;
  const conversionRate = totalScreenViews > 0 ? ((totalConversions / totalScreenViews) * 100).toFixed(2) : 0;
  const costPerConversion = totalConversions > 0 ? ((booking?.total_cost || 0) / totalConversions).toFixed(2) : 0;

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
                <p className="text-sm text-slate-500">Venue Footfall</p>
                <p className="text-2xl font-bold text-slate-900">{totalFootfall.toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-1">Total visitors</p>
              </div>
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Screen Views</p>
                <p className="text-2xl font-bold text-slate-900">{totalScreenViews.toLocaleString()}</p>
                <p className="text-xs text-emerald-600 mt-1">{viewRate}% view rate</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Eye className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Avg Dwell Time</p>
                <p className="text-2xl font-bold text-slate-900">{avgDwellTime}s</p>
                <p className="text-xs text-slate-400 mt-1">Per viewer</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">CPM (Cost/1000)</p>
                <p className="text-2xl font-bold text-slate-900">AED {costPerThousandViews}</p>
                <p className="text-xs text-slate-400 mt-1">Per 1000 views</p>
              </div>
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Extended Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-violet-600">Est. Reach</p>
                <p className="text-2xl font-bold text-violet-900">{totalFootfall.toLocaleString()}</p>
                <p className="text-xs text-violet-500 mt-1">Based on venue footfall</p>
              </div>
              <div className="w-10 h-10 bg-violet-200 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-violet-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">Cost Per Visitor</p>
                <p className="text-2xl font-bold text-emerald-900">AED {costPerVisitor}</p>
                <p className="text-xs text-emerald-500 mt-1">Per person reached</p>
              </div>
              <div className="w-10 h-10 bg-emerald-200 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-amber-900">{conversionRate}%</p>
                <p className="text-xs text-amber-500 mt-1">Est. offline actions</p>
              </div>
              <div className="w-10 h-10 bg-amber-200 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-rose-600">Cost/Conversion</p>
                <p className="text-2xl font-bold text-rose-900">AED {costPerConversion}</p>
                <p className="text-xs text-rose-500 mt-1">Per action taken</p>
              </div>
              <div className="w-10 h-10 bg-rose-200 rounded-xl flex items-center justify-center">
                <Share2 className="w-5 h-5 text-rose-700" />
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
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
          <TabsTrigger value="attribution">Attribution</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Daily Reach & Views</CardTitle>
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
                    <Line type="monotone" dataKey="footfall" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Venue Footfall" />
                    <Line type="monotone" dataKey="screenViews" stroke="#22c55e" strokeWidth={2} dot={false} name="Screen Views" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-violet-500" />
                  <span className="text-sm text-slate-600">Venue Footfall</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm text-slate-600">Screen Views</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timing">
          <Card>
            <CardHeader>
              <CardTitle>Footfall by Time of Day</CardTitle>
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
                      formatter={(value) => [`${value} visitors`, "Footfall"]}
                    />
                    <Bar dataKey="footfall" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Visitors" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-4 bg-violet-50 rounded-xl">
                <p className="text-sm text-violet-800">
                  <strong>Peak Hours:</strong> Highest foot traffic between 6PM - 9PM (Evening Peak) with ~580 visitors per hour. Best time for maximum ad exposure!
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

        <TabsContent value="conversions">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estimated Offline Conversions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Website Visits</p>
                      <p className="text-xs text-slate-500">From screen exposure</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{estimatedWebsiteVisits}</p>
                </div>
                
                <div className="p-4 bg-emerald-50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Phone Calls</p>
                      <p className="text-xs text-slate-500">Inquiries generated</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">{estimatedCalls}</p>
                </div>
                
                <div className="p-4 bg-violet-50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                      <QrCode className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">QR Code Scans</p>
                      <p className="text-xs text-slate-500">Direct interactions</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-violet-600">{estimatedQRScans}</p>
                </div>

                <div className="p-4 bg-slate-900 rounded-xl">
                  <div className="flex items-center justify-between text-white">
                    <span className="font-medium">Total Conversions</span>
                    <span className="text-2xl font-bold">{totalConversions}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <MapPin className="w-5 h-5 text-violet-600" />
                    <p className="font-semibold">Venue Details</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-500">Venue</p>
                      <p className="font-medium">{venue?.name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Type</p>
                      <p className="font-medium capitalize">{venue?.type || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Area</p>
                      <p className="font-medium">{venue?.area || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">City</p>
                      <p className="font-medium">{venue?.city || "N/A"}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-xl text-white">
                  <p className="text-sm opacity-80 mb-1">Daily Avg. Footfall</p>
                  <p className="text-3xl font-bold">{venue?.avg_daily_footfall?.toLocaleString() || "N/A"}</p>
                  <p className="text-xs opacity-70 mt-1">visitors per day</p>
                </div>

                <div className="p-4 bg-emerald-50 rounded-xl">
                  <p className="text-sm text-emerald-600 mb-1">Screen Visibility Score</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-3 bg-emerald-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(viewRate, 100)}%` }} />
                    </div>
                    <span className="font-bold text-emerald-700">{viewRate}%</span>
                  </div>
                  <p className="text-xs text-emerald-600 mt-1">of visitors viewed your ad</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attribution">
          <div className="space-y-6">
            {/* Screen Performance Attribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MonitorPlay className="w-5 h-5 text-violet-600" />
                  Screen Performance Attribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl border border-violet-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                          <MonitorPlay className="w-6 h-6 text-violet-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{screen?.name || "Screen"}</p>
                          <p className="text-sm text-slate-500">{venue?.name} • {venue?.city}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-violet-600">100%</p>
                        <p className="text-xs text-slate-500">Attribution</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3 mt-4">
                      <div className="text-center p-2 bg-white rounded-lg">
                        <p className="text-lg font-bold text-slate-900">{totalFootfall.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">Reach</p>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg">
                        <p className="text-lg font-bold text-slate-900">{totalScreenViews.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">Views</p>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg">
                        <p className="text-lg font-bold text-slate-900">{totalConversions}</p>
                        <p className="text-xs text-slate-500">Conversions</p>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg">
                        <p className="text-lg font-bold text-slate-900">AED {booking.total_cost}</p>
                        <p className="text-xs text-slate-500">Spend</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Venue Attribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  Venue Attribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{venue?.name || "Venue"}</p>
                        <p className="text-sm text-slate-500 capitalize">{venue?.type} • {venue?.area}, {venue?.city}</p>
                      </div>
                    </div>
                    <Badge className="bg-indigo-100 text-indigo-700">Primary Venue</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs text-slate-500">Venue Score</p>
                      <p className="text-xl font-bold text-indigo-600">92/100</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs text-slate-500">Avg Footfall</p>
                      <p className="text-xl font-bold text-slate-900">{venue?.avg_daily_footfall?.toLocaleString() || "N/A"}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs text-slate-500">View Rate</p>
                      <p className="text-xl font-bold text-emerald-600">{viewRate}%</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs text-slate-500">Conversion Rate</p>
                      <p className="text-xl font-bold text-amber-600">{conversionRate}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="relative">
                    <div className="h-12 bg-violet-600 rounded-lg flex items-center justify-between px-4">
                      <span className="text-white font-medium">Venue Footfall</span>
                      <span className="text-white font-bold">{totalFootfall.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="relative ml-4">
                    <div className="h-12 bg-violet-500 rounded-lg flex items-center justify-between px-4" style={{ width: `${viewRate}%`, minWidth: '200px' }}>
                      <span className="text-white font-medium">Screen Views</span>
                      <span className="text-white font-bold">{totalScreenViews.toLocaleString()}</span>
                    </div>
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-slate-500 ml-2">
                      {viewRate}%
                    </span>
                  </div>
                  <div className="relative ml-8">
                    <div className="h-12 bg-violet-400 rounded-lg flex items-center justify-between px-4" style={{ width: `${Math.min(conversionRate * 10, 60)}%`, minWidth: '180px' }}>
                      <span className="text-white font-medium">Engaged</span>
                      <span className="text-white font-bold">{Math.floor(totalScreenViews * 0.15)}</span>
                    </div>
                  </div>
                  <div className="relative ml-12">
                    <div className="h-12 bg-emerald-500 rounded-lg flex items-center justify-between px-4" style={{ width: '40%', minWidth: '160px' }}>
                      <span className="text-white font-medium">Conversions</span>
                      <span className="text-white font-bold">{totalConversions}</span>
                    </div>
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-slate-500 ml-2">
                      {conversionRate}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attribution Summary */}
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Campaign Attribution Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-white/10 rounded-xl">
                    <p className="text-slate-300 text-sm">Total Spend</p>
                    <p className="text-2xl font-bold">AED {booking.total_cost}</p>
                  </div>
                  <div className="p-4 bg-white/10 rounded-xl">
                    <p className="text-slate-300 text-sm">Cost per View</p>
                    <p className="text-2xl font-bold">AED {costPerVisitor}</p>
                  </div>
                  <div className="p-4 bg-white/10 rounded-xl">
                    <p className="text-slate-300 text-sm">Cost per Conversion</p>
                    <p className="text-2xl font-bold">AED {costPerConversion}</p>
                  </div>
                  <div className="p-4 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                    <p className="text-emerald-300 text-sm">ROI Score</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {totalConversions > 0 ? Math.min(Math.round((totalConversions / (booking.total_cost / 100)) * 10), 100) : 0}/100
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}