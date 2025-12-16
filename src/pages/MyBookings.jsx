import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Megaphone,
  MonitorPlay,
  Calendar,
  Clock,
  Plus,
  Eye,
  Search,
  BarChart3,
  Settings,
  Download,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InvoiceDownloadButton from "@/components/invoices/InvoiceGenerator";
import LiveScreenPreview from "@/components/previews/LiveScreenPreview";

export default function MyBookings() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  const { data: bookings = [] } = useQuery({
    queryKey: ["my-bookings", user?.email],
    queryFn: () => base44.entities.AdSlotBooking.filter({ advertiser_id: user?.email }, "-created_date"),
    enabled: !!user?.email
  });

  const { data: screens = [] } = useQuery({
    queryKey: ["all-screens"],
    queryFn: () => base44.entities.Screen.list(),
    enabled: !!user
  });

  const { data: venues = [] } = useQuery({
    queryKey: ["all-venues"],
    queryFn: () => base44.entities.Venue.list(),
    enabled: !!user
  });

  const loadUser = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl("MyBookings"));
        return;
      }
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {
      base44.auth.redirectToLogin(createPageUrl("MyBookings"));
    }
  };

  const activeBookings = bookings.filter(b => b.status === "active");
  const pendingBookings = bookings.filter(b => b.status === "pending");
  const completedBookings = bookings.filter(b => b.status === "completed");

  const filteredBookings = (list) => list.filter(b => 
    b.campaign_name?.toLowerCase().includes(search.toLowerCase())
  );

  // Get all active ads for a screen to show in preview
  const getScreenActiveAds = (screenId) => {
    const screenBookings = bookings.filter(b => b.screen_id === screenId && b.status === "active");
    const screen = screens.find(s => s.id === screenId);
    const slots = [];
    
    // Add owner slots
    if (screen?.owner_slot_1_url) slots.push({ url: screen.owner_slot_1_url, type: screen.owner_slot_1_type || "image", name: "Owner Ad 1" });
    if (screen?.owner_slot_2_url) slots.push({ url: screen.owner_slot_2_url, type: screen.owner_slot_2_type || "image", name: "Owner Ad 2" });
    if (screen?.owner_slot_3_url) slots.push({ url: screen.owner_slot_3_url, type: screen.owner_slot_3_type || "image", name: "Owner Ad 3" });
    
    // Add booked ads
    screenBookings.forEach(b => {
      if (b.creative_url) {
        slots.push({ url: b.creative_url, type: b.creative_type || "image", name: b.campaign_name || "Campaign" });
      }
    });
    
    return slots;
  };

  const BookingCard = ({ booking }) => {
    const screen = screens.find(s => s.id === booking.screen_id);
    const venue = screen ? venues.find(v => v.id === screen.venue_id) : null;
    const screenSlots = booking.status === "active" ? getScreenActiveAds(booking.screen_id) : [];
    
    return (
      <Card className="group hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-xl border-white/20 transform hover:-translate-y-1">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row items-start gap-3 sm:gap-4">
            {/* Live Preview for active bookings - show running screen */}
            <div className="w-full lg:w-48 flex-shrink-0">
              {booking.status === "active" && screenSlots.length > 0 ? (
                <LiveScreenPreview slots={screenSlots} size="small" />
              ) : (
                <div className="h-32 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden">
                  {booking.creative_url ? (
                    booking.creative_type === "video" ? (
                      <video src={booking.creative_url} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={booking.creative_url} className="w-full h-full object-cover" alt="" />
                    )
                  ) : (
                    <Megaphone className="w-8 h-8 text-violet-400" />
                  )}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 w-full">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900 text-sm sm:text-base truncate">{booking.campaign_name || "Ad Campaign"}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 truncate">
                    <MonitorPlay className="w-3 h-3 inline mr-1" />
                    {screen?.name || "Screen"} • Slot #{booking.slot_number}
                  </p>
                </div>
                <Badge variant={
                  booking.status === "active" ? "default" :
                  booking.status === "pending" ? "secondary" : "outline"
                } className="text-xs flex-shrink-0">
                  {booking.status}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(booking.start_date), "MMM d")} - {format(new Date(booking.end_date), "MMM d")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {booking.weeks_booked}w
                </span>
              </div>
              <div className="mt-3 pt-3 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <p className="font-semibold text-violet-600">AED {booking.total_cost}</p>
                <div className="flex flex-wrap items-center gap-2">
                  {booking.status === "active" && (
                    <InvoiceDownloadButton 
                      type="advertiser" 
                      booking={booking} 
                      screen={screen} 
                      venue={venue} 
                      user={user} 
                    />
                  )}
                  <Link to={createPageUrl(`CampaignManager?id=${booking.id}`)}>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      <Settings className="w-3 h-3 sm:mr-1" />
                      <span className="hidden sm:inline">Manage</span>
                    </Button>
                  </Link>
                  <Link to={createPageUrl(`CampaignReport?id=${booking.id}`)}>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      <BarChart3 className="w-3 h-3 sm:mr-1" />
                      <span className="hidden sm:inline">Report</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!user) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-violet-50/30">
      <div className="p-6 lg:p-8">
        {/* Header with Glassmorphism */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-2xl shadow-indigo-500/10">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">My Ad Bookings 🎯</h1>
            <p className="text-slate-600 mt-2 text-lg font-medium">Manage your advertising campaigns</p>
          </div>
          <Link to={createPageUrl("BookSlot")}>
            <Button className="bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 hover:from-indigo-700 hover:via-blue-700 hover:to-violet-700 shadow-2xl shadow-indigo-500/30 transform hover:scale-105 transition-all duration-200 px-6 py-6">
              <Plus className="w-5 h-5 mr-2" />
              Book New Slot
            </Button>
          </Link>
        </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search campaigns..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

        <Tabs defaultValue="active">
          <TabsList className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl p-1">
            <TabsTrigger value="active" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white">Active ({activeBookings.length})</TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white">Pending ({pendingBookings.length})</TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-slate-700 data-[state=active]:text-white">Completed ({completedBookings.length})</TabsTrigger>
          </TabsList>

        <TabsContent value="active" className="mt-6">
          {filteredBookings(activeBookings).length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 mb-4">No active bookings</p>
                <Link to={createPageUrl("BookSlot")}>
                  <Button>Book Your First Slot</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredBookings(activeBookings).map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <div className="grid gap-4">
            {filteredBookings(pendingBookings).map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className="grid gap-4">
              {filteredBookings(completedBookings).map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}