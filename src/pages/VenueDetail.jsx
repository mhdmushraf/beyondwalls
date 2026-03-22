import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2, Users, Clock, Mail, Phone, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function VenueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [venue, setVenue] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    const [u, venues] = await Promise.all([
      base44.auth.me(),
      base44.entities.Venue.filter({ id })
    ]);
    setUser(u);
    setVenue(venues[0] || null);
    setLoading(false);
  };

  const handleApproval = async (status) => {
    setUpdating(true);
    await base44.entities.Venue.update(venue.id, { approval_status: status });
    setVenue(prev => ({ ...prev, approval_status: status }));
    toast({
      title: status === "approved" ? "Venue Approved" : "Venue Rejected",
      description: `The venue has been ${status}.`,
    });
    setUpdating(false);
  };

  const statusColor = {
    approved: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    rejected: "bg-red-100 text-red-700",
  };

  const isAdmin = user?.role === "admin" || user?.user_role === "admin";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
    </div>
  );

  if (!venue) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <p className="text-slate-500 mb-4">Venue not found.</p>
      <Button onClick={() => navigate(-1)}>Go Back</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{venue.name}</h1>
            <p className="text-sm text-slate-500 capitalize">{venue.venue_type?.replace(/_/g, " ")}</p>
          </div>
          <Badge className={statusColor[venue.approval_status] || "bg-slate-100 text-slate-600"}>
            {venue.approval_status}
          </Badge>
        </div>

        {/* Main image */}
        {venue.image_url ? (
          <div className="rounded-2xl overflow-hidden shadow-sm h-56 sm:h-72">
            <img src={venue.image_url} alt={venue.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="rounded-2xl bg-violet-50 h-40 flex items-center justify-center">
            <Building2 className="w-16 h-16 text-violet-200" />
          </div>
        )}

        {/* Additional photos */}
        {venue.photo_urls && venue.photo_urls.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {venue.photo_urls.map((url, i) => (
              <div key={i} className="rounded-xl overflow-hidden h-28">
                <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* Admin Approve/Reject */}
        {isAdmin && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm font-medium text-slate-700 mb-3">Admin Actions</p>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleApproval("approved")}
                  disabled={updating || venue.approval_status === "approved"}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Approve
                </Button>
                <Button
                  onClick={() => handleApproval("rejected")}
                  disabled={updating || venue.approval_status === "rejected"}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" /> Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Details */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Venue Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-violet-500 flex-shrink-0" />{venue.address}, {venue.city}{venue.country ? `, ${venue.country}` : ""}</div>
            {venue.description && <p className="text-slate-500">{venue.description}</p>}
            {venue.contact_phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-violet-500" />{venue.contact_phone}</div>}
            {venue.contact_email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-violet-500" />{venue.contact_email}</div>}
            {venue.opening_time && venue.closing_time && (
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-violet-500" />{venue.opening_time} – {venue.closing_time}</div>
            )}
          </CardContent>
        </Card>

        {/* Audience Insights */}
        {(venue.daily_footfall || venue.weekly_footfall) && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Audience Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              {venue.daily_footfall && <div className="flex items-center gap-2"><Users className="w-4 h-4 text-violet-500" />{venue.daily_footfall.toLocaleString()} daily visitors</div>}
              {venue.weekly_footfall && <div className="flex items-center gap-2"><Users className="w-4 h-4 text-violet-500" />{venue.weekly_footfall.toLocaleString()} weekly visitors</div>}
              {venue.peak_hours && <p><span className="font-medium">Peak Hours:</span> {venue.peak_hours}</p>}
              {venue.avg_dwell_time_minutes && <p><span className="font-medium">Avg. Dwell:</span> {venue.avg_dwell_time_minutes} min</p>}
              {venue.audience_age_group && <p><span className="font-medium">Age Group:</span> <span className="capitalize">{venue.audience_age_group.replace(/_/g, " ")}</span></p>}
              {venue.audience_gender && <p><span className="font-medium">Gender:</span> <span className="capitalize">{venue.audience_gender.replace(/_/g, " ")}</span></p>}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}