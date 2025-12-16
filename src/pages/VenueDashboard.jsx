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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header with Glassmorphism */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-xl shadow-violet-500/5">
          <div>
            <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome back, {user?.full_name?.split(" ")[0] || "Partner"} ✨
            </h1>
            <p className="text-slate-600 mt-2 text-lg">Here's how your venues are performing today</p>
          </div>
          <Link to={createPageUrl("AddVenue")}>
            <Button className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 shadow-2xl shadow-violet-500/30 transform hover:scale-105 transition-all duration-200 text-lg px-6 py-6">
              <Plus className="w-5 h-5 mr-2" />
              Add Venue
            </Button>
          </Link>
        </div>

        {/* Stats Grid with Enhanced Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
            <StatsCard
              title="Total Earnings"
              value={`AED ${user?.wallet_balance?.toLocaleString() || "0"}`}
              icon={Wallet}
              color="emerald"
              trend="up"
              trendValue="+12%"
            />
          </div>
          
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
            <StatsCard
              title="Active Venues"
              value={venues.filter(v => v.status === "approved").length}
              icon={Building2}
              color="violet"
            />
          </div>
          
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
            <StatsCard
              title="Total Screens"
              value={screens.length}
              icon={MonitorPlay}
              color="indigo"
            />
          </div>
          
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
            <StatsCard
              title="Online Screens"
              value={onlineScreens}
              icon={Activity}
              color="amber"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Venues Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between bg-white/60 backdrop-blur-xl p-4 rounded-xl border border-white/20">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">My Venues</h2>
              <Link to={createPageUrl("MyVenues")}>
                <Button variant="ghost" className="text-violet-600 hover:bg-violet-50 transition-all duration-200">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {loadingVenues ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-6 animate-pulse">
                    <div className="h-6 w-48 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl mb-4" />
                    <div className="h-4 w-32 bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : venues.length === 0 ? (
              <Card className="border-2 border-dashed border-violet-200 bg-gradient-to-br from-white to-violet-50/50 backdrop-blur-xl shadow-xl">
                <CardContent className="py-16 text-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-500 rounded-3xl blur-3xl opacity-20" />
                    <div className="relative w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-violet-500/30 transform hover:scale-110 transition-all duration-300">
                      <Building2 className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No venues yet</h3>
                  <p className="text-slate-600 mb-8 text-lg">Add your first venue to start earning</p>
                  <Link to={createPageUrl("AddVenue")}>
                    <Button className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 shadow-2xl shadow-violet-500/30 transform hover:scale-105 transition-all duration-200 text-lg px-8 py-6">
                      <Plus className="w-5 h-5 mr-2" />
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
                    <Card key={venue.id} className="group relative bg-white/80 backdrop-blur-xl border-white/20 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300 transform hover:-translate-y-1">
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <CardContent className="p-6 relative">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            {venue.image_url ? (
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-500 rounded-2xl blur-lg opacity-30" />
                                <img 
                                  src={venue.image_url} 
                                  alt={venue.name}
                                  className="relative w-20 h-20 rounded-2xl object-cover shadow-xl border-2 border-white/50"
                                />
                              </div>
                            ) : (
                              <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-lg">
                                <Building2 className="w-10 h-10 text-violet-600" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-bold text-slate-900 text-lg">{venue.name}</h3>
                              <p className="text-sm text-slate-600">{venue.address}</p>
                              <p className="text-sm text-slate-600 font-medium">{venue.city}</p>
                            </div>
                          </div>
                          <Badge className={`${statusColors[venue.status] || statusColors.pending} shadow-lg`}>
                            {venue.status}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100/50">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 rounded-lg">
                              <MonitorPlay className="w-4 h-4 text-violet-600" />
                              <span className="text-sm font-semibold text-violet-900">{venueScreens.length} screens</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg">
                              <Activity className="w-4 h-4 text-emerald-600" />
                              <span className="text-sm font-semibold text-emerald-900">{onlineCount} online</span>
                            </div>
                          </div>
                          <Link to={createPageUrl(`VenueDetails?id=${venue.id}`)}>
                            <Button variant="outline" size="sm" className="border-violet-200 hover:bg-violet-50 hover:border-violet-300 transition-all duration-200">Manage</Button>
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
            <Card className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-green-600 border-0 text-white overflow-hidden shadow-2xl shadow-emerald-500/30">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
              <CardHeader className="relative">
                <CardTitle className="text-white/90 text-sm font-semibold tracking-wide">Available Earnings</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-5xl font-black mb-2 tracking-tight">
                  AED {user?.wallet_balance?.toLocaleString() || "0"}
                </p>
                <p className="text-white/80 text-sm mb-8 font-medium">70% revenue share 💰</p>
                <Link to={createPageUrl("VenueEarnings")}>
                  <Button className="w-full bg-white text-emerald-600 hover:bg-white/95 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 font-semibold py-6">
                    <Wallet className="w-5 h-5 mr-2" />
                    Withdraw Funds
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Screen Status */}
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Screen Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/50 animate-pulse" />
                      <span className="text-sm font-semibold text-emerald-900">Online</span>
                    </div>
                    <span className="font-bold text-lg text-emerald-600">{onlineScreens}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-slate-400 rounded-full" />
                      <span className="text-sm font-semibold text-slate-700">Offline</span>
                    </div>
                    <span className="font-bold text-lg text-slate-600">{screens.length - onlineScreens}</span>
                  </div>
                  <div className="relative pt-2">
                    <Progress 
                      value={screens.length > 0 ? (onlineScreens / screens.length) * 100 : 0} 
                      className="h-3 bg-slate-200"
                    />
                  </div>
                  <p className="text-sm text-slate-600 text-center font-semibold bg-violet-50 py-2 rounded-lg">
                    {screens.length > 0 ? Math.round((onlineScreens / screens.length) * 100) : 0}% screens online
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Earnings */}
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Recent Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Wallet className="w-8 h-8 text-emerald-600" />
                    </div>
                    <p className="text-slate-600 font-medium">No earnings yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {transactions.slice(0, 5).map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl hover:shadow-md transition-all duration-200">
                        <div>
                          <p className="font-semibold text-sm text-slate-900">Ad Revenue 🎯</p>
                          <p className="text-xs text-slate-600 font-medium">
                            {tx.created_date && format(new Date(tx.created_date), "MMM d, h:mm a")}
                          </p>
                        </div>
                        <p className="font-bold text-emerald-600 text-lg">+AED {tx.amount}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}