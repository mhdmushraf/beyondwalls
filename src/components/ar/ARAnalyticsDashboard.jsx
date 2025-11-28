import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  LabelList,
  AreaChart,
  Area
} from "recharts";
import {
  ScanLine,
  MousePointer,
  Eye,
  Target,
  TrendingUp,
  Download,
  MapPin,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#10b981', '#f59e0b'];

export default function ARAnalyticsDashboard({ campaigns, analyticsEvents }) {
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedCampaign, setSelectedCampaign] = useState("all");

  // Filter events by time range
  const filteredEvents = useMemo(() => {
    const now = new Date();
    const ranges = {
      "24h": 1,
      "7d": 7,
      "30d": 30,
      "90d": 90
    };
    const daysAgo = ranges[timeRange] || 7;
    const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    return analyticsEvents.filter(e => {
      const eventDate = new Date(e.created_date);
      const matchesTime = eventDate >= cutoff;
      const matchesCampaign = selectedCampaign === "all" || e.campaign_id === selectedCampaign;
      return matchesTime && matchesCampaign;
    });
  }, [analyticsEvents, timeRange, selectedCampaign]);

  // Conversion Funnel Data
  const funnelData = useMemo(() => {
    const scans = filteredEvents.filter(e => e.event_type === "scan").length;
    const arStarts = filteredEvents.filter(e => e.event_type === "ar_start").length;
    const interactions = filteredEvents.filter(e => e.event_type === "interaction").length;
    const ctaClicks = filteredEvents.filter(e => e.event_type === "cta_click").length;

    return [
      { name: "Scans", value: scans, fill: "#8b5cf6" },
      { name: "AR Started", value: arStarts, fill: "#6366f1" },
      { name: "Interactions", value: interactions, fill: "#3b82f6" },
      { name: "CTA Clicks", value: ctaClicks, fill: "#10b981" }
    ];
  }, [filteredEvents]);

  // Top 5 Campaigns by Interactions
  const topCampaigns = useMemo(() => {
    const campaignInteractions = {};
    filteredEvents.forEach(e => {
      if (e.event_type === "interaction" || e.event_type === "cta_click") {
        campaignInteractions[e.campaign_id] = (campaignInteractions[e.campaign_id] || 0) + 1;
      }
    });

    return Object.entries(campaignInteractions)
      .map(([id, count]) => {
        const campaign = campaigns.find(c => c.id === id);
        return { name: campaign?.name || "Unknown", interactions: count, id };
      })
      .sort((a, b) => b.interactions - a.interactions)
      .slice(0, 5);
  }, [filteredEvents, campaigns]);

  // Geospatial Distribution
  const geoDistribution = useMemo(() => {
    const locations = {};
    filteredEvents.forEach(e => {
      if (e.location) {
        locations[e.location] = (locations[e.location] || 0) + 1;
      }
    });

    return Object.entries(locations)
      .map(([location, count]) => ({ location, scans: count }))
      .sort((a, b) => b.scans - a.scans)
      .slice(0, 8);
  }, [filteredEvents]);

  // Daily Trend
  const dailyTrend = useMemo(() => {
    const days = {};
    const ranges = { "24h": 1, "7d": 7, "30d": 30, "90d": 90 };
    const daysBack = ranges[timeRange] || 7;

    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      days[key] = { date: key, scans: 0, interactions: 0, conversions: 0 };
    }

    filteredEvents.forEach(e => {
      const key = e.created_date?.split('T')[0];
      if (days[key]) {
        if (e.event_type === "scan") days[key].scans++;
        if (e.event_type === "interaction") days[key].interactions++;
        if (e.event_type === "cta_click") days[key].conversions++;
      }
    });

    return Object.values(days);
  }, [filteredEvents, timeRange]);

  // Export CSV
  const exportCSV = () => {
    const headers = ["Campaign", "Event Type", "Device", "Location", "Duration", "Date"];
    const rows = filteredEvents.map(e => {
      const campaign = campaigns.find(c => c.id === e.campaign_id);
      return [
        campaign?.name || "Unknown",
        e.event_type,
        e.device_type || "unknown",
        e.location || "N/A",
        e.duration_seconds || 0,
        e.created_date
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ar-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const totalScans = funnelData[0]?.value || 0;
  const conversionRate = totalScans > 0 
    ? ((funnelData[3]?.value / totalScans) * 100).toFixed(1) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Campaigns" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              {campaigns.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={exportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <ScanLine className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{totalScans}</p>
                <p className="text-xs text-slate-500">Total Scans</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <MousePointer className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{funnelData[2]?.value || 0}</p>
                <p className="text-xs text-slate-500">Interactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{funnelData[3]?.value || 0}</p>
                <p className="text-xs text-slate-500">Conversions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{conversionRate}%</p>
                <p className="text-xs text-slate-500">Conv. Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-violet-600" />
              Conversion Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Campaigns */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-600" />
              Top 5 Campaigns by Interactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCampaigns.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No interaction data yet</p>
            ) : (
              <div className="space-y-3">
                {topCampaigns.map((campaign, i) => (
                  <div key={campaign.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm`}
                      style={{ backgroundColor: COLORS[i] }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{campaign.name}</p>
                      <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${(campaign.interactions / topCampaigns[0].interactions) * 100}%`,
                            backgroundColor: COLORS[i]
                          }}
                        />
                      </div>
                    </div>
                    <Badge variant="outline">{campaign.interactions}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Geo Distribution */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-5 h-5 text-violet-600" />
              Scans by Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            {geoDistribution.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No location data yet</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={geoDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="scans" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Trend */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-violet-600" />
              Activity Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => v.slice(5)}
                  />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="scans" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="interactions" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="conversions" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}