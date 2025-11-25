import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Building2,
  MonitorPlay,
  Wallet,
  TrendingUp,
  Plus,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import StatsCard from "@/components/dashboard/StatsCard";

export default function VenueDashboard() {
  const [user, setUser] = useState(null);

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

  const { data: venues = [], isLoading: loadingVenues } = useQuery({
    queryKey: ["my-venues", user?.email],
    queryFn: () => base44.entities.Venue.filter({ owner_id: user?.email }),
    enabled: !!user?.email
  });

  const { data: screens = [] } = useQuery({
    queryKey: ["my-screens", venues],
    queryFn: async () => {
      if (venues.length === 0) return [];
      const venueIds = venues.map(v => v.id);
      const allScreens = await base44.entities.Screen.list();
      return allScreens.filter(s => venueIds.includes(s.venue_id));
    },
    enabled: venues.length > 0
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["venue-earnings", user?.email],
    queryFn: () => base44.entities.Transaction.filter({ user_id: user?.email, type: "earning" }, "-created_date", 10),
    enabled: !!user?.email
  });

  const onlineScreens = screens.filter(s => s.status === "online").length;
  const totalEarnings = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  const statusColors = {
    approved: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    rejected: "bg-rose-100 text-rose-700"
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            Welcome back, {user?.full_name?.split(" ")[0] || "Partner"}
          </h1>
          <p className="text-slate-500 mt-1">Here's how your venues are performing</p>
        </div>
        <Link to={createPageUrl("AddVenue")}>
          <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25">
            <Plus className="w-4 h-4 mr-2" />
            Add Venue
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatsCard
          title="Total Earnings"
          value={`AED ${user?.wallet_balance?.toLocaleString() || "0"}`}
          icon={Wallet}
          color="emerald"
          trend="up"
          trendValue="+12%"
        />
        <StatsCard
          title="Active Venues"
          value={venues.filter(v => v.status === "approved").length}
          icon={Building2}
          color="violet"
        />
        <StatsCard
          title="Total Screens"
          value={screens.length}
          icon={MonitorPlay}
          color="indigo"
        />
        <StatsCard
          title="Online Screens"
          value={onlineScreens}
          icon={Activity}
          color="amber"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Venues Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">My Venues</h2>
            <Link to={createPageUrl("MyVenues")}>
              <Button variant="ghost" className="text-violet-600">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {loadingVenues ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="bg-white rounded-xl border p-6 animate-pulse">
                  <div className="h-6 w-48 bg-slate-200 rounded mb-4" />
                  <div className="h-4 w-32 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : venues.length === 0 ? (
            <Card className="border-2 border-dashed border-slate-200">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-violet-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">No venues yet</h3>
                <p className="text-slate-500 mb-6">Add your first venue to start earning</p>
                <Link to={createPageUrl("AddVenue")}>
                  <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Venue
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {venues.slice(0, 4).map((venue) => {
                const venueScreens = screens.filter(s => s.venue_id === venue.id);
                const onlineCount = venueScreens.filter(s => s.status === "online").length;
                
                return (
                  <Card key={venue.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          {venue.image_url ? (
                            <img 
                              src={venue.image_url} 
                              alt={venue.name}
                              className="w-16 h-16 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center">
                              <Building2 className="w-8 h-8 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-slate-900">{venue.name}</h3>
                            <p className="text-sm text-slate-500">{venue.address}</p>
                            <p className="text-sm text-slate-500">{venue.city}</p>
                          </div>
                        </div>
                        <Badge className={statusColors[venue.status] || statusColors.pending}>
                          {venue.status}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <MonitorPlay className="w-4 h-4 text-slate-400" />
                            <span className="text-sm">{venueScreens.length} screens</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm">{onlineCount} online</span>
                          </div>
                        </div>
                        <Link to={createPageUrl(`VenueDetails?id=${venue.id}`)}>
                          <Button variant="outline" size="sm">Manage</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Earnings Card */}
          <Card className="bg-gradient-to-br from-emerald-600 to-teal-600 border-0 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardHeader>
              <CardTitle className="text-white/80 text-sm font-medium">Available Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold mb-2">
                AED {user?.wallet_balance?.toLocaleString() || "0"}
              </p>
              <p className="text-white/60 text-sm mb-6">70% revenue share</p>
              <Link to={createPageUrl("VenueEarnings")}>
                <Button className="w-full bg-white text-emerald-600 hover:bg-white/90">
                  <Wallet className="w-4 h-4 mr-2" />
                  Withdraw Funds
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Screen Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Screen Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                    <span className="text-sm">Online</span>
                  </div>
                  <span className="font-semibold">{onlineScreens}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-300 rounded-full" />
                    <span className="text-sm">Offline</span>
                  </div>
                  <span className="font-semibold">{screens.length - onlineScreens}</span>
                </div>
                <Progress 
                  value={screens.length > 0 ? (onlineScreens / screens.length) * 100 : 0} 
                  className="h-2"
                />
                <p className="text-xs text-slate-500 text-center">
                  {screens.length > 0 ? Math.round((onlineScreens / screens.length) * 100) : 0}% screens online
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Earnings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-center text-slate-500 py-4 text-sm">No earnings yet</p>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium text-sm text-slate-900">Ad Revenue</p>
                        <p className="text-xs text-slate-500">
                          {tx.created_date && format(new Date(tx.created_date), "MMM d, h:mm a")}
                        </p>
                      </div>
                      <p className="font-semibold text-emerald-600">+AED {tx.amount}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}