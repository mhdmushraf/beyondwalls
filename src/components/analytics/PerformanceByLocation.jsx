import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, Eye, Play, Users, MonitorPlay } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { MetricExplainer } from "@/components/onboarding/MetricExplainer";

export default function PerformanceByLocation({ bookings, screens, venues }) {
  // Group performance data by city - DOOH specific metrics
  const locationData = {};
  
  bookings.forEach(booking => {
    const screen = screens.find(s => s.id === booking.screen_id);
    const venue = venues.find(v => v.id === screen?.venue_id);
    const city = venue?.city || "Unknown";
    
    if (!locationData[city]) {
      locationData[city] = {
        city,
        impressions: 0,
        playouts: 0,
        reach: 0,
        spend: 0,
        screens: 0,
        screenTime: 0
      };
    }
    
    // Use venue's estimated viewers if available
    const dailyViewers = venue?.estimated_daily_viewers || screen?.avg_daily_views || 500;
    const days = booking.weeks_booked ? booking.weeks_booked * 7 : 7;
    const impressions = dailyViewers * days;
    const playoutsPerDay = 6 * 12; // 6 per hour × 12 operating hours
    
    locationData[city].impressions += impressions;
    locationData[city].reach += Math.round(impressions * 0.65);
    locationData[city].playouts += playoutsPerDay * days;
    locationData[city].screenTime += Math.round((playoutsPerDay * 15 / 60) * days);
    locationData[city].spend += booking.total_cost || 0;
    locationData[city].screens += 1;
  });

  const chartData = Object.values(locationData)
    .map(loc => ({
      ...loc,
      frequency: loc.reach > 0 ? (loc.impressions / loc.reach).toFixed(1) : 0,
      cpm: loc.impressions > 0 ? ((loc.spend / loc.impressions) * 1000).toFixed(2) : 0
    }))
    .sort((a, b) => b.impressions - a.impressions);

  const colors = ["#8b5cf6", "#6366f1", "#3b82f6", "#0ea5e9", "#14b8a6", "#10b981"];

  const topCity = chartData[0];

  return (
    <div className="space-y-6">
      {/* Location Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-violet-600" />
            Performance by City
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                  <YAxis type="category" dataKey="city" stroke="#94a3b8" fontSize={12} width={100} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
                    formatter={(value) => [value.toLocaleString(), "Impressions"]}
                  />
                  <Bar dataKey="impressions" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-slate-500">
              No location data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location Details Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {chartData.map((location, index) => (
          <Card key={location.city} className={index === 0 ? "border-2 border-violet-200 bg-violet-50/50" : ""}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <h3 className="font-semibold text-slate-900">{location.city}</h3>
                </div>
                {index === 0 && (
                  <Badge className="bg-violet-100 text-violet-700 border-0">
                    Top Performer
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
                    <MetricExplainer metric="playouts" showIcon={false}>
                      <Play className="w-3 h-3" />
                      <span className="text-xs">Playouts</span>
                    </MetricExplainer>
                  </div>
                  <p className="font-bold text-slate-900">{location.playouts.toLocaleString()}</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
                    <MetricExplainer metric="impressions" showIcon={false}>
                      <Eye className="w-3 h-3" />
                      <span className="text-xs">Views</span>
                    </MetricExplainer>
                  </div>
                  <p className="font-bold text-slate-900">{location.impressions.toLocaleString()}</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
                    <MetricExplainer metric="reach" showIcon={false}>
                      <Users className="w-3 h-3" />
                      <span className="text-xs">Reach</span>
                    </MetricExplainer>
                  </div>
                  <p className="font-bold text-emerald-600">{location.reach.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-sm">
                <span className="text-slate-500">{location.screens} screens</span>
                <span className="text-slate-700 font-medium">AED {location.spend.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Location Insights - Simplified */}
      {topCity && (
        <Card className="bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-100">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">📍 Location Insight</h3>
                <p className="text-slate-600">
                  <strong>{topCity.city}</strong> is your best performing location! Your ads were seen by approximately{" "}
                  <strong>{topCity.reach.toLocaleString()}</strong> unique people. Consider increasing your presence in this area.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}