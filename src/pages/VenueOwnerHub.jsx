import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Settings,
  BarChart3,
  Users,
  Calendar,
  ArrowRight,
  Activity,
  Eye,
  Clock,
  DollarSign,
  Loader2,
  Zap,
  CheckCircle2,
  AlertCircle,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateEstimatedViewers, calculateEstimatedEarnings } from "@/components/analytics/VenueAnalyticsCalculator";

export default function VenueOwnerHub() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl("VenueOwnerHub"));
        return;
      }
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {
      base44.auth.redirectToLogin(createPageUrl("VenueOwnerHub"));
    }
  };

  const { data: venues = [] } = useQuery({
    queryKey: ["owner-venues", user?.email],
    queryFn: () => base44.entities.Venue.filter({ owner_id: user?.email }),
    enabled: !!user?.email
  });

  const { data: screens = [] } = useQuery({
    queryKey: ["owner-screens", venues],
    queryFn: async () => {
      if (venues.length === 0) return [];
      const venueIds = venues.map(v => v.id);
      const allScreens = await base44.entities.Screen.list();
      return allScreens.filter(s => venueIds.includes(s.venue_id));
    },
    enabled: venues.length > 0
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["venue-bookings", screens],
    queryFn: async () => {
      if (screens.length === 0) return [];
      const screenIds = screens.map(s => s.id);
      const allBookings = await base44.entities.AdSlotBooking.list();
      return allBookings.filter(b => screenIds.includes(b.screen_id) && b.status === "active");
    },
    enabled: screens.length > 0
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["venue-transactions", user?.email],
    queryFn: () => base44.entities.Transaction.filter({ user_id: user?.email, type: "earning" }, "-created_date", 20),
    enabled: !!user?.email
  });

  const approvedVenues = venues.filter(v => v.status === "approved");
  const pendingVenues = venues.filter(v => v.status === "pending");
  const onlineScreens = screens.filter(s => s.status === "online");
  const offlineScreens = screens.filter(s => s.status === "offline");
  
  const totalEarnings = transactions.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
  const thisMonthEarnings = transactions
    .filter(t => {
      const txDate = new Date(t.created_date);
      const now = new Date();
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  // Calculate total estimated monthly potential
  const totalMonthlyPotential = venues
    .filter(v => v.status === "approved")
    .reduce((sum, v) => sum + (calculateEstimatedEarnings(v).monthlyEarnings || 0), 0);

  const activeAdsCount = bookings.length;

  if (!user) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-2xl shadow-emerald-500/10">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent">
              Venue Owner Hub 🏢
            </h1>
            <p className="text-slate-600 mt-2 text-lg font-medium">Manage your venues, screens, and earnings</p>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl("AddVenue")}>
              <Button variant="outline" className="border-emerald-200 hover:bg-emerald-50">
                <Plus className="w-4 h-4 mr-2" />
                Add Venue
              </Button>
            </Link>
            <Link to={createPageUrl("AddScreen")}>
              <Button className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:via-teal-700 hover:to-green-700 shadow-2xl shadow-emerald-500/30">
                <Plus className="w-4 h-4 mr-2" />
                Add Screen
              </Button>
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm mb-1">Total Earnings</p>
                  <p className="text-3xl font-bold">AED {totalEarnings.toLocaleString()}</p>
                  <p className="text-emerald-200 text-sm mt-1">All time</p>
                </div>
                <Wallet className="w-10 h-10 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-violet-600 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-violet-100 text-sm mb-1">This Month</p>
                  <p className="text-3xl font-bold">AED {thisMonthEarnings.toLocaleString()}</p>
                  <p className="text-violet-200 text-sm mt-1">+{totalMonthlyPotential > 0 ? Math.round((thisMonthEarnings / totalMonthlyPotential) * 100) : 0}% of potential</p>
                </div>
                <TrendingUp className="w-10 h-10 text-violet-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-600 to-blue-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm mb-1">Active Ads</p>
                  <p className="text-3xl font-bold">{activeAdsCount}</p>
                  <p className="text-indigo-200 text-sm mt-1">Across all screens</p>
                </div>
                <Package className="w-10 h-10 text-indigo-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-600 to-orange-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm mb-1">Monthly Potential</p>
                  <p className="text-3xl font-bold">AED {totalMonthlyPotential.toLocaleString()}</p>
                  <p className="text-amber-200 text-sm mt-1">Estimated</p>
                </div>
                <DollarSign className="w-10 h-10 text-amber-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="venues">Venues ({venues.length})</TabsTrigger>
            <TabsTrigger value="screens">Screens ({screens.length})</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Venue Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    Venue Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="font-medium">Approved</span>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700">{approvedVenues.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-600" />
                        <span className="font-medium">Pending</span>
                      </div>
                      <Badge className="bg-amber-100 text-amber-700">{pendingVenues.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-violet-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <MonitorPlay className="w-5 h-5 text-violet-600" />
                        <span className="font-medium">Total Screens</span>
                      </div>
                      <Badge className="bg-violet-100 text-violet-700">{screens.length}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Screen Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    Screen Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-600">Online Status</span>
                        <span className="text-sm font-semibold">
                          {onlineScreens.length}/{screens.length}
                        </span>
                      </div>
                      <Progress 
                        value={screens.length > 0 ? (onlineScreens.length / screens.length) * 100 : 0}
                        className="h-3"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-emerald-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-xs text-emerald-700 font-medium">Online</span>
                        </div>
                        <p className="text-2xl font-bold text-emerald-600">{onlineScreens.length}</p>
                      </div>
                      <div className="p-3 bg-rose-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-rose-500 rounded-full" />
                          <span className="text-xs text-rose-700 font-medium">Offline</span>
                        </div>
                        <p className="text-2xl font-bold text-rose-600">{offlineScreens.length}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="hover:shadow-xl transition-all cursor-pointer group" onClick={() => navigate(createPageUrl("MyVenues"))}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                      <Building2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">Manage Venues</h3>
                  <p className="text-sm text-slate-600">Edit details, view analytics</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-all cursor-pointer group" onClick={() => navigate(createPageUrl("MyScreens"))}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center group-hover:bg-violet-200 transition-colors">
                      <MonitorPlay className="w-6 h-6 text-violet-600" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-violet-600 transition-colors" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">Manage Screens</h3>
                  <p className="text-sm text-slate-600">Monitor status, update content</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-all cursor-pointer group" onClick={() => navigate(createPageUrl("ManageOwnerSlots"))}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                      <Settings className="w-6 h-6 text-indigo-600" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">My Ad Slots</h3>
                  <p className="text-sm text-slate-600">Manage your free slots</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Venues Tab */}
          <TabsContent value="venues">
            <div className="space-y-4">
              {venues.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">No venues yet</h3>
                    <p className="text-slate-500 mb-6">Add your first venue to start earning</p>
                    <Link to={createPageUrl("AddVenue")}>
                      <Button className="bg-gradient-to-r from-emerald-600 to-teal-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Venue
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                venues.map((venue) => {
                  const venueScreens = screens.filter(s => s.venue_id === venue.id);
                  const venueOnline = venueScreens.filter(s => s.status === "online").length;
                  const venueBookings = bookings.filter(b => venueScreens.some(s => s.id === b.screen_id));
                  const analytics = calculateEstimatedViewers(venue);
                  const earnings = calculateEstimatedEarnings(venue);

                  return (
                    <Card key={venue.id} className="hover:shadow-xl transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            {venue.image_url ? (
                              <img 
                                src={venue.image_url} 
                                alt={venue.name}
                                className="w-20 h-20 rounded-xl object-cover shadow-lg"
                              />
                            ) : (
                              <div className="w-20 h-20 bg-emerald-100 rounded-xl flex items-center justify-center">
                                <Building2 className="w-10 h-10 text-emerald-600" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-bold text-slate-900 text-lg">{venue.name}</h3>
                              <p className="text-sm text-slate-600">{venue.city} • {venue.area}</p>
                              <Badge className="mt-2" variant={venue.status === "approved" ? "default" : "secondary"}>
                                {venue.status}
                              </Badge>
                            </div>
                          </div>
                          <Link to={createPageUrl(`VenueDetails?id=${venue.id}`)}>
                            <Button variant="outline" size="sm">
                              <Settings className="w-4 h-4 mr-2" />
                              Manage
                            </Button>
                          </Link>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                          <div className="p-3 bg-violet-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <MonitorPlay className="w-4 h-4 text-violet-600" />
                              <span className="text-xs text-slate-600">Screens</span>
                            </div>
                            <p className="text-xl font-bold text-slate-900">{venueScreens.length}</p>
                            <p className="text-xs text-emerald-600">{venueOnline} online</p>
                          </div>
                          <div className="p-3 bg-indigo-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Package className="w-4 h-4 text-indigo-600" />
                              <span className="text-xs text-slate-600">Active Ads</span>
                            </div>
                            <p className="text-xl font-bold text-slate-900">{venueBookings.length}</p>
                          </div>
                          <div className="p-3 bg-emerald-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Eye className="w-4 h-4 text-emerald-600" />
                              <span className="text-xs text-slate-600">Daily Viewers</span>
                            </div>
                            <p className="text-xl font-bold text-slate-900">{analytics.estimatedDailyViewers.toLocaleString()}</p>
                          </div>
                          <div className="p-3 bg-amber-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <DollarSign className="w-4 h-4 text-amber-600" />
                              <span className="text-xs text-slate-600">Est. Monthly</span>
                            </div>
                            <p className="text-xl font-bold text-slate-900">AED {earnings.monthlyEarnings.toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Screens Tab */}
          <TabsContent value="screens">
            <div className="grid md:grid-cols-2 gap-4">
              {screens.length === 0 ? (
                <Card className="md:col-span-2">
                  <CardContent className="py-16 text-center">
                    <MonitorPlay className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 mb-2">No screens yet</h3>
                    <p className="text-slate-500 mb-6">Add screens to your venues to start earning</p>
                    <Link to={createPageUrl("AddScreen")}>
                      <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Screen
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                screens.map((screen) => {
                  const venue = venues.find(v => v.id === screen.venue_id);
                  const screenBookings = bookings.filter(b => b.screen_id === screen.id);

                  return (
                    <Card key={screen.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-slate-900">{screen.name}</h3>
                            <p className="text-sm text-slate-500">{venue?.name}</p>
                          </div>
                          <Badge variant={screen.status === "online" ? "default" : "secondary"}>
                            {screen.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="p-2 bg-slate-50 rounded">
                            <p className="text-xs text-slate-500">Size</p>
                            <p className="font-medium">{screen.size}</p>
                          </div>
                          <div className="p-2 bg-slate-50 rounded">
                            <p className="text-xs text-slate-500">Active Ads</p>
                            <p className="font-medium text-emerald-600">{screenBookings.length}</p>
                          </div>
                        </div>
                        <Link to={createPageUrl(`ManageOwnerSlots?screen_id=${screen.id}`)} className="block mt-3">
                          <Button variant="outline" size="sm" className="w-full">
                            <Settings className="w-4 h-4 mr-2" />
                            Manage
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Reach</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {venues.filter(v => v.status === "approved").map(venue => {
                      const analytics = calculateEstimatedViewers(venue);
                      return (
                        <div key={venue.id} className="p-4 bg-slate-50 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-slate-900">{venue.name}</p>
                            <Badge variant="secondary">{venue.city}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-violet-600">
                            <Eye className="w-4 h-4" />
                            <span className="text-lg font-bold">
                              {analytics.estimatedDailyViewers.toLocaleString()}
                            </span>
                            <span className="text-sm text-slate-500">viewers/day</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Potential</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {venues.filter(v => v.status === "approved").map(venue => {
                      const earnings = calculateEstimatedEarnings(venue);
                      return (
                        <div key={venue.id} className="p-4 bg-emerald-50 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-slate-900">{venue.name}</p>
                            <Badge className="bg-emerald-100 text-emerald-700">{venue.type}</Badge>
                          </div>
                          <div className="flex items-center gap-2 text-emerald-600">
                            <DollarSign className="w-4 h-4" />
                            <span className="text-lg font-bold">
                              AED {earnings.monthlyEarnings.toLocaleString()}
                            </span>
                            <span className="text-sm text-slate-500">/month</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  {transactions.length === 0 ? (
                    <div className="text-center py-12">
                      <Wallet className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <h3 className="font-semibold text-slate-900 mb-2">No earnings yet</h3>
                      <p className="text-slate-500">Earnings will appear as ads run on your screens</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                          <div>
                            <p className="font-medium text-slate-900">{tx.description}</p>
                            <p className="text-sm text-slate-500">
                              {tx.created_date && format(new Date(tx.created_date), "MMM d, yyyy • h:mm a")}
                            </p>
                          </div>
                          <p className="text-lg font-bold text-emerald-600">
                            +AED {Math.abs(tx.amount || 0).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
                <CardHeader>
                  <CardTitle className="text-white">Wallet</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <p className="text-emerald-100 text-sm mb-2">Available Balance</p>
                    <p className="text-4xl font-bold">AED {(user?.wallet_balance || 0).toLocaleString()}</p>
                  </div>
                  <Link to={createPageUrl("Wallet")}>
                    <Button className="w-full bg-white text-emerald-600 hover:bg-white/90">
                      <Wallet className="w-4 h-4 mr-2" />
                      Manage Wallet
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}