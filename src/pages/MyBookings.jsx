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
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MyBookings() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");

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

  const { data: bookings = [] } = useQuery({
    queryKey: ["my-bookings", user?.email],
    queryFn: () => base44.entities.AdSlotBooking.filter({ advertiser_id: user?.email }, "-created_date"),
    enabled: !!user?.email
  });

  const { data: screens = [] } = useQuery({
    queryKey: ["all-screens"],
    queryFn: () => base44.entities.Screen.list()
  });

  const activeBookings = bookings.filter(b => b.status === "active");
  const pendingBookings = bookings.filter(b => b.status === "pending");
  const completedBookings = bookings.filter(b => b.status === "completed");

  const filteredBookings = (list) => list.filter(b => 
    b.campaign_name?.toLowerCase().includes(search.toLowerCase())
  );

  const BookingCard = ({ booking }) => {
    const screen = screens.find(s => s.id === booking.screen_id);
    
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
              {booking.creative_url ? (
                booking.creative_type === "video" ? (
                  <video src={booking.creative_url} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <img src={booking.creative_url} className="w-full h-full object-cover rounded-xl" alt="" />
                )
              ) : (
                <Megaphone className="w-8 h-8 text-violet-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{booking.campaign_name || "Ad Campaign"}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    <MonitorPlay className="w-3 h-3 inline mr-1" />
                    {screen?.name || "Screen"} • Slot #{booking.slot_number}
                  </p>
                </div>
                <Badge variant={
                  booking.status === "active" ? "default" :
                  booking.status === "pending" ? "secondary" : "outline"
                }>
                  {booking.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(booking.start_date), "MMM d")} - {format(new Date(booking.end_date), "MMM d, yyyy")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {booking.weeks_booked} week{booking.weeks_booked > 1 ? "s" : ""}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                <p className="font-semibold text-violet-600">AED {booking.total_cost}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">My Ad Bookings</h1>
          <p className="text-slate-500">Manage your advertising slots</p>
        </div>
        <Link to={createPageUrl("BookSlot")}>
          <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">
            <Plus className="w-4 h-4 mr-2" />
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
        <TabsList>
          <TabsTrigger value="active">Active ({activeBookings.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
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
  );
}