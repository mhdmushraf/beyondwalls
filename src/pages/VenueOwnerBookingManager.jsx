import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar as CalendarIcon, Check, X, DollarSign, Clock, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function VenueOwnerBookingManager() {
  const [user, setUser] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [pricingTiers, setPricingTiers] = useState({});

  const queryClient = useQueryClient();

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

  const { data: venues = [] } = useQuery({
    queryKey: ["my-venues", user?.email],
    queryFn: () => base44.entities.Venue.filter({ owner_id: user?.email }),
    enabled: !!user
  });

  const { data: screens = [] } = useQuery({
    queryKey: ["venue-screens", selectedVenue?.id],
    queryFn: () => base44.entities.Screen.filter({ venue_id: selectedVenue?.id }),
    enabled: !!selectedVenue
  });

  const { data: allBookings = [] } = useQuery({
    queryKey: ["venue-bookings"],
    queryFn: () => base44.entities.AdSlotBooking.list()
  });

  const { data: localListings = [] } = useQuery({
    queryKey: ["local-listings", selectedVenue?.id],
    queryFn: async () => {
      const listings = await base44.entities.LocalBusinessListing.list();
      return listings.filter(l => l.venue_id === selectedVenue?.id);
    },
    enabled: !!selectedVenue
  });

  const venueBookings = useMemo(() => {
    if (!screens.length) return [];
    const screenIds = screens.map(s => s.id);
    return allBookings.filter(b => screenIds.includes(b.screen_id));
  }, [screens, allBookings]);

  // Approve booking
  const approveBookingMutation = useMutation({
    mutationFn: async (bookingId) => {
      await base44.entities.AdSlotBooking.update(bookingId, { status: "active" });
      // Send notification
      const booking = venueBookings.find(b => b.id === bookingId);
      if (booking) {
        await base44.entities.UserNotification.create({
          user_id: booking.advertiser_id,
          type: "booking_approved",
          title: "Booking Approved",
          message: `Your booking at ${selectedVenue?.name} has been approved!`,
          reference_id: bookingId,
          reference_type: "booking"
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venue-bookings"] });
      toast.success("Booking approved!");
    }
  });

  // Reject booking
  const rejectBookingMutation = useMutation({
    mutationFn: async ({ bookingId, reason }) => {
      await base44.entities.AdSlotBooking.update(bookingId, { 
        status: "cancelled",
        cancellation_reason: reason
      });
      // Send notification
      const booking = venueBookings.find(b => b.id === bookingId);
      if (booking) {
        await base44.entities.UserNotification.create({
          user_id: booking.advertiser_id,
          type: "booking_rejected",
          title: "Booking Rejected",
          message: `Your booking request was not approved. Reason: ${reason}`,
          reference_id: bookingId,
          reference_type: "booking"
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venue-bookings"] });
      toast.success("Booking rejected");
    }
  });

  // Approve local listing
  const approveListingMutation = useMutation({
    mutationFn: async (listingId) => {
      await base44.entities.LocalBusinessListing.update(listingId, { 
        venue_owner_approved: true,
        status: "active"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["local-listings"] });
      toast.success("Local business approved!");
    }
  });

  // Update pricing tier
  const updatePricingMutation = useMutation({
    mutationFn: async ({ screenId, data }) => {
      await base44.entities.Screen.update(screenId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venue-screens"] });
      toast.success("Pricing updated!");
    }
  });

  // Calendar data
  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayBookings = venueBookings.filter(b => {
        const start = new Date(b.start_date);
        const end = new Date(b.end_date);
        return date >= start && date <= end && b.status === "active";
      });

      days.push({
        date: day,
        dateStr,
        bookings: dayBookings.length,
        hasBookings: dayBookings.length > 0
      });
    }

    return days;
  }, [currentMonth, venueBookings]);

  const pendingBookings = venueBookings.filter(b => b.status === "pending");
  const pendingListings = localListings.filter(l => !l.venue_owner_approved);

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Booking Manager</h1>
          <p className="text-slate-600 mt-1">Manage bookings and availability for your venues</p>
        </div>

        {/* Venue Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Select Venue</CardTitle>
          </CardHeader>
          <CardContent>
            <select
              className="w-full p-2 border rounded-lg"
              value={selectedVenue?.id || ""}
              onChange={(e) => {
                const venue = venues.find(v => v.id === e.target.value);
                setSelectedVenue(venue);
              }}
            >
              <option value="">Choose a venue...</option>
              {venues.map(venue => (
                <option key={venue.id} value={venue.id}>{venue.name}</option>
              ))}
            </select>
          </CardContent>
        </Card>

        {selectedVenue && (
          <Tabs defaultValue="calendar" className="space-y-6">
            <TabsList>
              <TabsTrigger value="calendar">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="requests">
                <Bell className="w-4 h-4 mr-2" />
                Requests ({pendingBookings.length + pendingListings.length})
              </TabsTrigger>
              <TabsTrigger value="pricing">
                <DollarSign className="w-4 h-4 mr-2" />
                Pricing
              </TabsTrigger>
            </TabsList>

            {/* Calendar View */}
            <TabsContent value="calendar">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center font-semibold text-sm text-slate-600 p-2">
                        {day}
                      </div>
                    ))}
                    
                    {/* Empty cells for offset */}
                    {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}

                    {calendarData.map((day) => (
                      <div
                        key={day.date}
                        className={`p-3 border rounded-lg text-center cursor-pointer transition-colors ${
                          day.hasBookings
                            ? 'bg-violet-100 border-violet-300 hover:bg-violet-200'
                            : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-semibold">{day.date}</div>
                        {day.hasBookings && (
                          <Badge className="mt-1 text-xs bg-violet-600">
                            {day.bookings} booking{day.bookings > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-violet-100 border border-violet-300 rounded" />
                      <span>Booked</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-white border border-slate-200 rounded" />
                      <span>Available</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Requests Tab */}
            <TabsContent value="requests" className="space-y-6">
              {/* Ad Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle>Pending Ad Bookings ({pendingBookings.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingBookings.length === 0 ? (
                    <p className="text-slate-600 text-center py-8">No pending bookings</p>
                  ) : (
                    <div className="space-y-3">
                      {pendingBookings.map((booking) => {
                        const screen = screens.find(s => s.id === booking.screen_id);
                        return (
                          <div key={booking.id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="font-semibold">{booking.campaign_name}</p>
                                <p className="text-sm text-slate-600">Screen: {screen?.name}</p>
                                <p className="text-sm text-slate-600">
                                  {booking.start_date} to {booking.end_date}
                                </p>
                              </div>
                              <Badge className="bg-violet-600">AED {booking.total_cost}</Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => approveBookingMutation.mutate(booking.id)}
                                className="bg-green-600 hover:bg-green-700"
                                disabled={approveBookingMutation.isPending}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const reason = prompt("Reason for rejection:");
                                  if (reason) {
                                    rejectBookingMutation.mutate({ bookingId: booking.id, reason });
                                  }
                                }}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                disabled={rejectBookingMutation.isPending}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Local Business Listings */}
              <Card>
                <CardHeader>
                  <CardTitle>Pending Local Business Requests ({pendingListings.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingListings.length === 0 ? (
                    <p className="text-slate-600 text-center py-8">No pending local business requests</p>
                  ) : (
                    <div className="space-y-3">
                      {pendingListings.map((listing) => (
                        <div key={listing.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-semibold">{listing.business_name}</p>
                              <p className="text-sm text-slate-600">{listing.business_category}</p>
                              <p className="text-sm text-slate-600">
                                {listing.campaign_duration_weeks} week{listing.campaign_duration_weeks > 1 ? 's' : ''}
                              </p>
                            </div>
                            <Badge className="bg-green-600">AED {listing.total_cost}</Badge>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => approveListingMutation.mutate(listing.id)}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={approveListingMutation.isPending}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve Local Business
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pricing Tab */}
            <TabsContent value="pricing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Screen Pricing & Availability</CardTitle>
                  <CardDescription>Set pricing tiers and manage local business marketplace</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {screens.map((screen) => (
                      <div key={screen.id} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{screen.name}</p>
                            <p className="text-sm text-slate-600">{screen.size} • {screen.orientation}</p>
                          </div>
                          <Badge>{screen.pricing_tier || "standard"}</Badge>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm">Base Price (AED/week)</Label>
                            <Input
                              type="number"
                              defaultValue={screen.slot_price}
                              onBlur={(e) => {
                                updatePricingMutation.mutate({
                                  screenId: screen.id,
                                  data: { slot_price: parseFloat(e.target.value) }
                                });
                              }}
                              className="mt-1"
                            />
                          </div>

                          <div>
                            <Label className="text-sm">Pricing Tier</Label>
                            <select
                              className="w-full mt-1 p-2 border rounded-lg"
                              defaultValue={screen.pricing_tier || "standard"}
                              onChange={(e) => {
                                updatePricingMutation.mutate({
                                  screenId: screen.id,
                                  data: { pricing_tier: e.target.value }
                                });
                              }}
                            >
                              <option value="standard">Standard</option>
                              <option value="premium">Premium (+20%)</option>
                              <option value="elite">Elite (+50%)</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <Label className="text-sm font-medium">Enable Local Business Marketplace</Label>
                            <p className="text-xs text-slate-600">Allow nearby businesses to book at 30% discount</p>
                          </div>
                          <Switch
                            checked={screen.local_business_enabled || false}
                            onCheckedChange={(checked) => {
                              updatePricingMutation.mutate({
                                screenId: screen.id,
                                data: { local_business_enabled: checked }
                              });
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}