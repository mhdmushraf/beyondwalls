import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Clock,
  CheckCircle2,
  MonitorPlay,
  Calendar,
  MapPin,
  ArrowRight,
  Mail,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function BookingPending() {
  const [bookingId, setBookingId] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("booking_id");
    if (id) setBookingId(id);
  }, []);

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: async () => {
      const bookings = await base44.entities.AdSlotBooking.filter({ id: bookingId });
      return bookings[0];
    },
    enabled: !!bookingId
  });

  const { data: screen } = useQuery({
    queryKey: ["screen", booking?.screen_id],
    queryFn: async () => {
      const screens = await base44.entities.Screen.filter({ id: booking?.screen_id });
      return screens[0];
    },
    enabled: !!booking?.screen_id
  });

  const { data: venue } = useQuery({
    queryKey: ["venue", screen?.venue_id],
    queryFn: async () => {
      const venues = await base44.entities.Venue.filter({ id: screen?.venue_id });
      return venues[0];
    },
    enabled: !!screen?.venue_id
  });

  const { data: pendingBookings = [] } = useQuery({
    queryKey: ["my-pending-bookings"],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.AdSlotBooking.filter({ 
        advertiser_id: user.email, 
        status: "pending" 
      });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-50">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-50 p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/25">
            <Clock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Booking Submitted!</h1>
          <p className="text-slate-600 text-lg">Your campaign is pending approval from our team</p>
        </div>

        {/* Current Booking Details */}
        {booking && (
          <Card className="mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <MonitorPlay className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-lg">{booking.campaign_name}</h2>
                  <Badge className="bg-amber-400 text-amber-900 mt-1">Pending Approval</Badge>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MonitorPlay className="w-5 h-5 text-violet-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Screen</p>
                      <p className="font-medium">{screen?.name || "Loading..."}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-violet-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Venue</p>
                      <p className="font-medium">{venue?.name || "Loading..."} - {venue?.city}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-violet-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Duration</p>
                      <p className="font-medium">{booking.start_date} to {booking.end_date}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-2">Creative Preview</p>
                  <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden">
                    {booking.creative_type === "video" ? (
                      <video src={booking.creative_url} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={booking.creative_url} className="w-full h-full object-cover" alt="Creative" />
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Investment</p>
                  <p className="text-2xl font-bold text-violet-600">AED {booking.total_cost?.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Slot</p>
                  <p className="font-medium">#{booking.slot_number}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* What Happens Next */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">What Happens Next?</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Review in Progress</p>
                  <p className="text-sm text-slate-500">Our team will review your creative content within 24-48 hours</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-violet-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Email Notification</p>
                  <p className="text-sm text-slate-500">You'll receive an email once your campaign is approved</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-emerald-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Go Live!</p>
                  <p className="text-sm text-slate-500">Your ad starts displaying on the scheduled start date</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email Confirmation Notice */}
        <Card className="mb-6 bg-violet-50 border-violet-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <p className="font-medium text-violet-900">Confirmation Email Sent</p>
              <p className="text-sm text-violet-700">Check your inbox for booking details and updates</p>
            </div>
          </CardContent>
        </Card>

        {/* Other Pending Campaigns */}
        {pendingBookings.length > 1 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">All Pending Campaigns ({pendingBookings.length})</h3>
              <div className="space-y-3">
                {pendingBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="font-medium text-slate-900">{b.campaign_name}</p>
                        <p className="text-xs text-slate-500">{b.start_date} - {b.end_date}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      Pending
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to={createPageUrl("MyBookings")}>
            <Button variant="outline" className="w-full sm:w-auto">
              View All Bookings
            </Button>
          </Link>
          <Link to={createPageUrl("BookSlot")}>
            <Button className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600">
              Book Another Slot
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* BeyondWalls Footer */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <MonitorPlay className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              BeyondWalls
            </span>
          </div>
          <p className="text-slate-500 text-sm">Advertise Beyond Boundaries</p>
          <p className="text-slate-400 text-xs mt-2">info@beyondwalls.ae • +971 55 614 0067</p>
        </div>
      </div>
    </div>
  );
}