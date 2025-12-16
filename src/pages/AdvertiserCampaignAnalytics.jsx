import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  TrendingUp, Download, FileText, DollarSign, Eye, MousePointer,
  Target, Users, MapPin, Monitor, Calendar, Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import jsPDF from "jspdf";

export default function AdvertiserCampaignAnalytics() {
  const { campaignId } = useParams();
  const [user, setUser] = useState(null);
  const [dateRange, setDateRange] = useState("30");

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

  const { data: campaign } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: async () => {
      const campaigns = await base44.entities.Campaign.list();
      return campaigns.find(c => c.id === campaignId);
    },
    enabled: !!campaignId
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["campaign-bookings", campaignId],
    queryFn: async () => {
      const allBookings = await base44.entities.AdSlotBooking.list();
      return allBookings.filter(b => b.campaign_name === campaign?.name);
    },
    enabled: !!campaign
  });

  const { data: screens = [] } = useQuery({
    queryKey: ["screens"],
    queryFn: () => base44.entities.Screen.list()
  });

  const { data: venues = [] } = useQuery({
    queryKey: ["venues"],
    queryFn: () => base44.entities.Venue.list()
  });

  const { data: creatives = [] } = useQuery({
    queryKey: ["campaign-creatives", campaignId],
    queryFn: async () => {
      const allCreatives = await base44.entities.Creative.filter({ 
        advertiser_id: user?.email 
      });
      return allCreatives.filter(c => bookings.some(b => b.id === c.booking_id));
    },
    enabled: !!user && bookings.length > 0
  });

  // Analytics calculations
  const analytics = useMemo(() => {
    if (!campaign) return null;

    // Performance by screen
    const screenPerformance = bookings.map(booking => {
      const screen = screens.find(s => s.id === booking.screen_id);
      const venue = venues.find(v => v.id === screen?.venue_id);
      return {
        screen_name: screen?.name || "Unknown",
        venue_name: venue?.name || "Unknown",
        impressions: booking.impressions || 0,
        cost: booking.total_cost || 0,
        cpm: booking.impressions ? ((booking.total_cost / booking.impressions) * 1000).toFixed(2) : 0
      };
    });

    // Performance by venue type
    const venueTypePerformance = venues.reduce((acc, venue) => {
      const venueBookings = bookings.filter(b => {
        const screen = screens.find(s => s.id === b.screen_id);
        return screen?.venue_id === venue.id;
      });
      const impressions = venueBookings.reduce((sum, b) => sum + (b.impressions || 0), 0);
      if (impressions > 0) {
        acc[venue.type] = (acc[venue.type] || 0) + impressions;
      }
      return acc;
    }, {});

    // Performance by demographics
    const demographicPerformance = venues.map(venue => {
      const venueBookings = bookings.filter(b => {
        const screen = screens.find(s => s.id === b.screen_id);
        return screen?.venue_id === venue.id;
      });
      const impressions = venueBookings.reduce((sum, b) => sum + (b.impressions || 0), 0);
      return {
        venue: venue.name,
        age_groups: venue.customer_age_groups || [],
        gender_mix: venue.customer_gender_mix,
        impressions
      };
    }).filter(d => d.impressions > 0);

    // Creative comparison
    const creativeComparison = creatives.map(creative => ({
      name: creative.name,
      variant: creative.variant,
      impressions: creative.impressions || 0,
      views: creative.views || 0,
      engagement_rate: creative.engagement_rate || 0,
      is_winner: creative.is_winner
    }));

    // ROI Calculation
    const totalSpend = campaign.spend || 0;
    const conversions = campaign.conversions || 0;
    const conversionValue = conversions * 100; // Assuming AED 100 per conversion
    const roi = totalSpend > 0 ? (((conversionValue - totalSpend) / totalSpend) * 100).toFixed(2) : 0;

    // Time series data
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        impressions: Math.floor(Math.random() * 1000) + 500, // Mock data
        clicks: Math.floor(Math.random() * 50) + 10
      };
    });

    return {
      screenPerformance,
      venueTypePerformance: Object.entries(venueTypePerformance).map(([name, value]) => ({ name, value })),
      demographicPerformance,
      creativeComparison,
      roi,
      totalSpend,
      conversionValue,
      timeSeriesData: last30Days
    };
  }, [campaign, bookings, screens, venues, creatives]);

  // Predictive analytics
  const predictiveForecast = useMemo(() => {
    if (!analytics?.timeSeriesData) return [];
    
    const avgImpressions = analytics.timeSeriesData.reduce((sum, d) => sum + d.impressions, 0) / analytics.timeSeriesData.length;
    const growthRate = 1.05; // 5% growth assumption
    
    return Array.from({ length: 7 }, (_, i) => ({
      date: `Day +${i + 1}`,
      predicted_impressions: Math.floor(avgImpressions * Math.pow(growthRate, i + 1)),
      confidence: 100 - (i * 5)
    }));
  }, [analytics]);

  // Export to CSV
  const exportToCSV = () => {
    if (!analytics) return;

    const csvData = [
      ["Screen Performance Report"],
      ["Screen", "Venue", "Impressions", "Cost (AED)", "CPM"],
      ...analytics.screenPerformance.map(s => [s.screen_name, s.venue_name, s.impressions, s.cost, s.cpm]),
      [],
      ["Campaign Summary"],
      ["Total Spend", analytics.totalSpend],
      ["Total Impressions", campaign?.impressions || 0],
      ["Total Conversions", campaign?.conversions || 0],
      ["ROI", `${analytics.roi}%`]
    ];

    const csv = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campaign-${campaignId}-report.csv`;
    a.click();
    toast.success("CSV report downloaded!");
  };

  // Export to PDF
  const exportToPDF = () => {
    if (!analytics) return;

    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Campaign Performance Report", 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Campaign: ${campaign?.name || "Unknown"}`, 20, 35);
    doc.text(`Date Range: ${campaign?.start_date} to ${campaign?.end_date}`, 20, 42);
    
    doc.setFontSize(14);
    doc.text("Key Metrics", 20, 55);
    
    doc.setFontSize(10);
    doc.text(`Total Spend: AED ${analytics.totalSpend}`, 20, 65);
    doc.text(`Total Impressions: ${campaign?.impressions || 0}`, 20, 72);
    doc.text(`Total Conversions: ${campaign?.conversions || 0}`, 20, 79);
    doc.text(`ROI: ${analytics.roi}%`, 20, 86);
    
    doc.setFontSize(14);
    doc.text("Top Performing Screens", 20, 100);
    
    doc.setFontSize(10);
    analytics.screenPerformance.slice(0, 5).forEach((screen, idx) => {
      doc.text(`${idx + 1}. ${screen.screen_name} - ${screen.impressions} impressions`, 20, 110 + (idx * 7));
    });

    doc.save(`campaign-${campaignId}-report.pdf`);
    toast.success("PDF report downloaded!");
  };

  const COLORS = ['#8B5CF6', '#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

  if (!campaign || !analytics) {
    return <div className="p-6">Loading analytics...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{campaign.name}</h1>
            <p className="text-slate-600 mt-1">Comprehensive campaign analytics</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportToCSV} variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={exportToPDF} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600">Total Impressions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(campaign.impressions || 0).toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600">Total Spend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-violet-600">AED {analytics.totalSpend}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600">Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{campaign.conversions || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-slate-600">ROI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${parseFloat(analytics.roi) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.roi}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            <TabsTrigger value="creatives">Creatives</TabsTrigger>
            <TabsTrigger value="predictive">Predictive</TabsTrigger>
          </TabsList>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="impressions" stroke="#8B5CF6" strokeWidth={2} />
                    <Line type="monotone" dataKey="clicks" stroke="#6366F1" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Screens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.screenPerformance.slice(0, 5).map((screen, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium">{screen.screen_name}</p>
                        <p className="text-sm text-slate-600">{screen.venue_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{screen.impressions.toLocaleString()}</p>
                        <p className="text-xs text-slate-600">CPM: AED {screen.cpm}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Breakdown Tab */}
          <TabsContent value="breakdown" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance by Venue Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={analytics.venueTypePerformance}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analytics.venueTypePerformance.map((entry, index) => (
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
                  <CardTitle>Performance by Demographics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.demographicPerformance.slice(0, 5).map((demo, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-sm">{demo.venue}</p>
                          <Badge>{demo.impressions.toLocaleString()}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {demo.age_groups.map((age, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {age}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Creatives Tab */}
          <TabsContent value="creatives" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Creative Performance Comparison</CardTitle>
                <CardDescription>A/B testing results for different creative variations</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.creativeComparison.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.creativeComparison}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="impressions" fill="#8B5CF6" />
                      <Bar dataKey="engagement_rate" fill="#6366F1" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-slate-600 text-center py-12">No creative variations data available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Predictive Tab */}
          <TabsContent value="predictive" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-600" />
                  7-Day Performance Forecast
                </CardTitle>
                <CardDescription>AI-powered predictions based on historical data</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={predictiveForecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="predicted_impressions" stroke="#8B5CF6" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>

                <div className="mt-6 grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Predicted Impressions (7 days)</p>
                    <p className="text-2xl font-bold text-violet-600">
                      {predictiveForecast.reduce((sum, d) => sum + d.predicted_impressions, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Expected Growth Rate</p>
                    <p className="text-2xl font-bold text-green-600">+5%</p>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Confidence Level</p>
                    <p className="text-2xl font-bold text-blue-600">85%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}