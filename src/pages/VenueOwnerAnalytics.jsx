import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  Users, DollarSign, Eye, TrendingUp, MapPin, Clock,
  Calendar, Activity, Leaf
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function VenueOwnerAnalytics() {
  const [user, setUser] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState(null);

  useEffect(() => {
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

  // Fetch data
  const { data: venues = [] } = useQuery({
    queryKey: ["my-venues", user?.email],
    queryFn: () => base44.entities.Venue.filter({ owner_id: user?.email }),
    enabled: !!user
  });

  const { data: screens = [] } = useQuery({
    queryKey: ["venue-screens", selectedVenue?.id],
    queryFn: () => base44.entities.Screen.filter({ venue_id: selectedVenue?.id }),
    enabled: !!selectedVenue
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["venue-bookings"],
    queryFn: () => base44.entities.AdSlotBooking.list(),
    enabled: !!selectedVenue
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["venue-earnings", user?.email],
    queryFn: () => base44.entities.Transaction.filter({ 
      user_id: user?.email,
      type: "earning"
    }),
    enabled: !!user
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!selectedVenue || !screens.length) return null;

    const venueScreenIds = screens.map(s => s.id);
    const venueBookings = bookings.filter(b => venueScreenIds.includes(b.screen_id));
    
    const totalEarnings = venueBookings.reduce((sum, b) => sum + (b.venue_share || 0), 0);
    const totalImpressions = venueBookings.reduce((sum, b) => sum + (b.impressions || 0), 0);
    const activeAds = venueBookings.filter(b => b.status === "active").length;

    // Audience demographics from venue
    const demographics = selectedVenue.customer_age_groups || [];
    const peakHours = selectedVenue.peak_hours || [];
    const dwellTime = selectedVenue.customer_dwell_time_minutes || 0;

    // Sustainability metrics
    const totalScreens = screens.length;
    const energyPerScreen = 0.05; // kWh per hour
    const paperSaved = totalScreens * 2 * 30; // 2kg per screen per month
    const carbonOffset = energyPerScreen * totalScreens * 24 * 30 * 0.4; // kg CO2

    return {
      totalEarnings,
      totalImpressions,
      activeAds,
      demographics,
      peakHours,
      dwellTime,
      sustainability: {
        energy: energyPerScreen * totalScreens * 24 * 30,
        paperSaved,
        carbonOffset,
        treesSaved: Math.floor(paperSaved / 10)
      }
    };
  }, [selectedVenue, screens, bookings]);

  // Chart data
  const earningsData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return date.toISOString().slice(0, 7);
    });

    return last6Months.map(month => {
      const monthTransactions = transactions.filter(t => 
        t.created_date?.startsWith(month)
      );
      const earnings = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
      return {
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        earnings
      };
    });
  }, [transactions]);

  const audienceData = useMemo(() => {
    if (!metrics?.demographics.length) return [];
    return metrics.demographics.map(age => ({
      name: age,
      value: 1
    }));
  }, [metrics]);

  const COLORS = ['#8B5CF6', '#6366F1', '#EC4899', '#F59E0B', '#10B981'];

  if (!user) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Venue Analytics</h1>
          <p className="text-slate-600 mt-1">Detailed insights for your venues and screens</p>
        </div>

        {/* Venue Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Venue</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              className="w-full p-2 border rounded-lg"
              value={selectedVenue?.id || ""}
              onChange={(e) => {
                const venue = venues.find(v => v.id === e.target.value);
                setSelectedVenue(venue);
              }}
            >
              <option value="">Choose a venue...</option>
              {venues.map(venue => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} - {venue.city}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>

        {selectedVenue && metrics && (
          <>
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    AED {metrics.totalEarnings.toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">70% revenue share</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Impressions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-violet-600">
                    {metrics.totalImpressions.toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Ad views delivered</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Active Ads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-indigo-600">
                    {metrics.activeAds}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Currently running</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Screens Online</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {screens.filter(s => s.status === "online").length}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">of {screens.length} total</p>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Tabs */}
            <Tabs defaultValue="earnings" className="space-y-6">
              <TabsList>
                <TabsTrigger value="earnings">Earnings</TabsTrigger>
                <TabsTrigger value="audience">Audience</TabsTrigger>
                <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
              </TabsList>

              {/* Earnings Tab */}
              <TabsContent value="earnings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Earnings Trend (Last 6 Months)</CardTitle>
                    <CardDescription>Monthly revenue from your venue screens</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={earningsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                        <YAxis stroke="#64748B" fontSize={12} />
                        <Tooltip />
                        <Line type="monotone" dataKey="earnings" stroke="#10B981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Audience Tab */}
              <TabsContent value="audience" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Audience Demographics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {audienceData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={audienceData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name }) => name}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {audienceData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-slate-600 text-center py-12">No demographic data available</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Venue Insights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-violet-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-violet-600" />
                          <span className="text-sm font-medium">Avg. Dwell Time</span>
                        </div>
                        <Badge className="bg-violet-600">{metrics.dwellTime} min</Badge>
                      </div>

                      <div className="p-3 bg-indigo-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-5 h-5 text-indigo-600" />
                          <span className="text-sm font-medium">Peak Hours</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {metrics.peakHours.map((hour, idx) => (
                            <Badge key={idx} variant="outline" className="text-indigo-600 border-indigo-600">
                              {hour}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Sustainability Tab */}
              <TabsContent value="sustainability" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="w-5 h-5 text-green-600" />
                      Environmental Impact
                    </CardTitle>
                    <CardDescription>
                      Your contribution to a greener future through digital signage
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Leaf className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium text-green-900">Paper Saved</span>
                        </div>
                        <div className="text-2xl font-bold text-green-700">
                          {metrics.sustainability.paperSaved} kg
                        </div>
                        <p className="text-xs text-green-600 mt-1">vs traditional posters</p>
                      </div>

                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Carbon Offset</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-700">
                          {metrics.sustainability.carbonOffset.toFixed(1)} kg
                        </div>
                        <p className="text-xs text-blue-600 mt-1">CO₂ emissions saved</p>
                      </div>

                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Leaf className="w-5 h-5 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-900">Trees Saved</span>
                        </div>
                        <div className="text-2xl font-bold text-emerald-700">
                          {metrics.sustainability.treesSaved}
                        </div>
                        <p className="text-xs text-emerald-600 mt-1">equivalent trees</p>
                      </div>

                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-5 h-5 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-900">Energy Use</span>
                        </div>
                        <div className="text-2xl font-bold text-yellow-700">
                          {metrics.sustainability.energy.toFixed(1)} kWh
                        </div>
                        <p className="text-xs text-yellow-600 mt-1">monthly consumption</p>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        🌱 By using digital signage, you're making a positive environmental impact! 
                        Digital screens eliminate the need for printing, reducing waste and carbon emissions.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}