import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import {
  BarChart3,
  DollarSign,
  Eye,
  TrendingUp,
  Megaphone,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
  Cell
} from "recharts";

export default function AllCampaignsReport({ bookings, screens, venues }) {
  // Calculate totals
  const totalSpend = bookings.reduce((sum, b) => sum + (b.total_cost || 0), 0);
  const activeCount = bookings.filter(b => b.status === "active").length;
  const pausedCount = bookings.filter(b => b.status === "paused").length;
  const completedCount = bookings.filter(b => b.status === "completed").length;
  const pendingCount = bookings.filter(b => b.status === "pending").length;

  // Mock impressions (in real app, this would come from analytics)
  const totalImpressions = bookings.reduce((sum, b) => {
    const weeks = b.weeks_booked || 1;
    const screen = screens.find(s => s.id === b.screen_id);
    const avgDaily = screen?.avg_daily_views || 500;
    return sum + (avgDaily * 7 * weeks);
  }, 0);

  // Spend by status for pie chart
  const spendByStatus = [
    { name: "Active", value: bookings.filter(b => b.status === "active").reduce((s, b) => s + (b.total_cost || 0), 0), color: "#10b981" },
    { name: "Paused", value: bookings.filter(b => b.status === "paused").reduce((s, b) => s + (b.total_cost || 0), 0), color: "#f59e0b" },
    { name: "Completed", value: bookings.filter(b => b.status === "completed").reduce((s, b) => s + (b.total_cost || 0), 0), color: "#6366f1" },
    { name: "Pending", value: bookings.filter(b => b.status === "pending").reduce((s, b) => s + (b.total_cost || 0), 0), color: "#94a3b8" },
  ].filter(s => s.value > 0);

  // Spend by venue type
  const spendByVenue = {};
  bookings.forEach(b => {
    const screen = screens.find(s => s.id === b.screen_id);
    const venue = screen ? venues.find(v => v.id === screen.venue_id) : null;
    const venueName = venue?.name || "Unknown";
    spendByVenue[venueName] = (spendByVenue[venueName] || 0) + (b.total_cost || 0);
  });

  const venueChartData = Object.entries(spendByVenue)
    .map(([name, value]) => ({ name: name.substring(0, 15), value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const statusColors = {
    active: "bg-emerald-100 text-emerald-700",
    paused: "bg-amber-100 text-amber-700",
    pending: "bg-blue-100 text-blue-700",
    completed: "bg-slate-100 text-slate-700",
    cancelled: "bg-red-100 text-red-700"
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-200 text-sm">Total Spend</p>
                <p className="text-2xl font-bold">AED {totalSpend.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-violet-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Total Campaigns</p>
                <p className="text-2xl font-bold text-slate-900">{bookings.length}</p>
              </div>
              <Megaphone className="w-8 h-8 text-slate-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Est. Impressions</p>
                <p className="text-2xl font-bold text-slate-900">{(totalImpressions / 1000).toFixed(1)}K</p>
              </div>
              <Eye className="w-8 h-8 text-slate-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Active Now</p>
                <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Status Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Spend by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {spendByStatus.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spendByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {spendByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `AED ${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                No campaign data
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Spend by Venue</CardTitle>
          </CardHeader>
          <CardContent>
            {venueChartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={venueChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={(v) => `${v}`} />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip formatter={(value) => `AED ${value.toLocaleString()}`} />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                No venue data
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No campaigns yet</p>
            ) : (
              bookings.map((booking) => {
                const screen = screens.find(s => s.id === booking.screen_id);
                const venue = screen ? venues.find(v => v.id === screen.venue_id) : null;
                const impressions = (screen?.avg_daily_views || 500) * 7 * (booking.weeks_booked || 1);
                
                return (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200">
                        {booking.creative_url && (
                          booking.creative_type === "video" ? (
                            <video src={booking.creative_url} className="w-full h-full object-cover" />
                          ) : (
                            <img src={booking.creative_url} className="w-full h-full object-cover" alt="" />
                          )
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{booking.campaign_name}</p>
                        <p className="text-sm text-slate-500">
                          {screen?.name} • {venue?.city || "N/A"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={statusColors[booking.status]}>{booking.status}</Badge>
                          <span className="text-xs text-slate-400">
                            {booking.start_date} - {booking.end_date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-violet-600">AED {(booking.total_cost || 0).toLocaleString()}</p>
                      <p className="text-xs text-slate-500">{(impressions / 1000).toFixed(1)}K impressions</p>
                      <Link to={createPageUrl(`CampaignManager?id=${booking.id}`)}>
                        <Button size="sm" variant="ghost" className="mt-1">
                          <BarChart3 className="w-4 h-4 mr-1" />
                          Manage
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}