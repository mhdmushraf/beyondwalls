import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  UtensilsCrossed, 
  ShoppingBag, 
  Dumbbell, 
  Briefcase,
  Hotel,
  TrendingUp,
  Target,
  DollarSign
} from "lucide-react";
import {
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

export default function PerformanceByVenueType({ bookings, screens, venues }) {
  const venueIcons = {
    restaurant: UtensilsCrossed,
    cafe: UtensilsCrossed,
    mall: ShoppingBag,
    gym: Dumbbell,
    coworking: Briefcase,
    hotel: Hotel,
    hospital: Building2,
    other: Building2
  };

  const venueColors = {
    restaurant: "#ef4444",
    cafe: "#f97316",
    mall: "#8b5cf6",
    gym: "#10b981",
    coworking: "#3b82f6",
    hotel: "#6366f1",
    hospital: "#14b8a6",
    other: "#64748b"
  };

  // Group performance by venue type
  const venueTypeData = {};
  
  bookings.forEach(booking => {
    const screen = screens.find(s => s.id === booking.screen_id);
    const venue = venues.find(v => v.id === screen?.venue_id);
    const type = venue?.type || "other";
    
    if (!venueTypeData[type]) {
      venueTypeData[type] = {
        type,
        name: type.charAt(0).toUpperCase() + type.slice(1).replace("_", " "),
        impressions: 0,
        clicks: 0,
        conversions: 0,
        spend: 0,
        screens: 0,
        avgFootfall: 0
      };
    }
    
    const avgDailyViews = screen?.avg_daily_views || 500;
    const days = booking.weeks_booked ? booking.weeks_booked * 7 : 7;
    const impressions = avgDailyViews * days;
    
    venueTypeData[type].impressions += impressions;
    venueTypeData[type].clicks += Math.round(impressions * 0.028);
    venueTypeData[type].conversions += Math.round(impressions * 0.028 * 0.14);
    venueTypeData[type].spend += booking.total_cost || 0;
    venueTypeData[type].screens += 1;
    venueTypeData[type].avgFootfall += venue?.avg_daily_footfall || 500;
  });

  const chartData = Object.values(venueTypeData)
    .map(v => ({
      ...v,
      ctr: v.impressions > 0 ? ((v.clicks / v.impressions) * 100).toFixed(2) : 0,
      convRate: v.clicks > 0 ? ((v.conversions / v.clicks) * 100).toFixed(1) : 0,
      cpc: v.clicks > 0 ? (v.spend / v.clicks).toFixed(2) : 0,
      roi: v.spend > 0 ? (((v.conversions * 150 - v.spend) / v.spend) * 100).toFixed(0) : 0,
      avgFootfall: v.screens > 0 ? Math.round(v.avgFootfall / v.screens) : 0
    }))
    .sort((a, b) => b.impressions - a.impressions);

  // Simulated comparative data for radar chart
  const radarData = chartData.slice(0, 5).map(v => ({
    venue: v.name,
    reach: Math.min(100, (v.impressions / 10000) * 100),
    engagement: parseFloat(v.ctr) * 20,
    conversion: parseFloat(v.convRate) * 5,
    efficiency: Math.min(100, 100 - parseFloat(v.cpc) * 2),
    roi: Math.max(0, Math.min(100, parseFloat(v.roi)))
  }));

  const topVenue = chartData[0];

  return (
    <div className="space-y-6">
      {/* Venue Type Cards */}
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
        {chartData.map((venue, index) => {
          const Icon = venueIcons[venue.type] || Building2;
          const color = venueColors[venue.type] || "#64748b";
          const isTop = index === 0;

          return (
            <Card key={venue.type} className={isTop ? "border-2 border-violet-200 bg-violet-50/50" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <h3 className="font-semibold text-slate-900">{venue.name}</h3>
                  </div>
                  {isTop && (
                    <Badge className="bg-violet-100 text-violet-700 border-0 text-xs">
                      Top
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Impressions</span>
                    <span className="font-medium">{venue.impressions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">CTR</span>
                    <span className="font-medium">{venue.ctr}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Conversions</span>
                    <span className="font-medium text-emerald-600">{venue.conversions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">ROI</span>
                    <span className={`font-medium ${venue.roi > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {venue.roi}%
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
                  <span>{venue.screens} screens</span>
                  <span>Avg {venue.avgFootfall.toLocaleString()} footfall</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Impressions by Venue Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-violet-600" />
              Impressions Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="impressions"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.map((entry) => (
                      <Cell 
                        key={`cell-${entry.type}`} 
                        fill={venueColors[entry.type] || "#64748b"} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [value.toLocaleString(), "Impressions"]}
                    contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-violet-600" />
              CTR & Conversion by Venue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} angle={-15} textAnchor="end" height={50} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <Legend />
                  <Bar dataKey="ctr" name="CTR %" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="convRate" name="Conv Rate %" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROI Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-violet-600" />
            ROI by Venue Type
          </CardTitle>
          <CardDescription>Compare return on investment across different venue categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {chartData.map((venue) => {
              const color = venueColors[venue.type] || "#64748b";
              const roiValue = parseFloat(venue.roi);
              const maxRoi = Math.max(...chartData.map(v => Math.abs(parseFloat(v.roi))));
              const width = maxRoi > 0 ? Math.abs(roiValue / maxRoi * 100) : 0;

              return (
                <div key={venue.type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700">{venue.name}</span>
                    <span className={`text-sm font-bold ${roiValue >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {roiValue >= 0 ? "+" : ""}{venue.roi}%
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${width}%`, 
                        backgroundColor: roiValue >= 0 ? "#10b981" : "#ef4444" 
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Venue Type Insight */}
      {topVenue && (
        <Card className="bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-100">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Venue Type Recommendation</h3>
                <p className="text-slate-600">
                  <strong>{topVenue.name}</strong> venues deliver the highest performance with{" "}
                  <strong>{topVenue.ctr}%</strong> CTR and <strong>{topVenue.roi}%</strong> ROI. 
                  Consider focusing your campaign budget on these venues for optimal results.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}