import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, Building2, Users, Clock, Mail, Phone, ArrowLeft,
  CheckCircle, XCircle, Edit, Globe, Eye, Calendar, TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function VenueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => { loadData(); }, [id]);

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
    toast.success(status === "approved" ? "Venue Approved" : "Venue Rejected", {
      description: `The venue has been ${status}.`, duration: 3000
    });
    setUpdating(false);
  };

  const statusColor = {
    approved: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    rejected: "bg-red-100 text-red-700",
  };

  const isAdmin = user?.role === "admin" || user?.user_role === "admin";
  const isOwner = user?.email === venue?.owner_email;

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

        {/* Owner Edit Button (only when approved) */}
        {isOwner && !isAdmin && venue.approval_status === "approved" && (
          <div className="flex justify-end">
            <Button
              onClick={() => navigate(`/EditVenue/${venue.id}`)}
              variant="outline"
              className="border-violet-300 text-violet-700 hover:bg-violet-50"
            >
              <Edit className="w-4 h-4 mr-2" /> Edit Details
            </Button>
          </div>
        )}

        {/* Re-submitted for review notice */}
        {isOwner && !isAdmin && venue.approval_status === "pending" && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            ⏳ This venue is pending admin approval. You can edit details once it's approved.
          </div>
        )}

        {/* Main image */}
        {(venue.image_url || (venue.photo_urls && venue.photo_urls.length > 0)) ? (
          <div className="rounded-2xl overflow-hidden shadow-sm h-56 sm:h-72">
            <img
              src={venue.image_url || venue.photo_urls[0]}
              alt={venue.name}
              className="w-full h-full object-cover"
            />
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

        {/* Venue Details */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Venue Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
              <span>{venue.address}, {venue.city}{venue.country ? `, ${venue.country}` : ""}</span>
            </div>
            {venue.description && (
              <p className="text-slate-500 leading-relaxed">{venue.description}</p>
            )}
            {venue.contact_phone && (
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-violet-500" />{venue.contact_phone}</div>
            )}
            {venue.contact_email && (
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-violet-500" />{venue.contact_email}</div>
            )}
            {(venue.opening_time || venue.closing_time) && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-500" />
                {venue.opening_time} {venue.closing_time ? `– ${venue.closing_time}` : ""}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audience Insights */}
        {(venue.daily_footfall || venue.weekly_footfall || venue.peak_hours || venue.avg_dwell_time_minutes || venue.audience_age_group || venue.audience_gender) && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Audience Insights</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm text-slate-600">
              {venue.daily_footfall > 0 && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Daily Visitors</p>
                  <p className="font-semibold text-slate-800">{venue.daily_footfall.toLocaleString()}</p>
                </div>
              )}
              {venue.weekly_footfall > 0 && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Weekly Visitors</p>
                  <p className="font-semibold text-slate-800">{venue.weekly_footfall.toLocaleString()}</p>
                </div>
              )}
              {venue.avg_dwell_time_minutes > 0 && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Avg. Dwell Time</p>
                  <p className="font-semibold text-slate-800">{venue.avg_dwell_time_minutes} min</p>
                </div>
              )}
              {venue.peak_hours && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Peak Hours</p>
                  <p className="font-semibold text-slate-800">{venue.peak_hours}</p>
                </div>
              )}
              {venue.audience_age_group && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Age Group</p>
                  <p className="font-semibold text-slate-800 capitalize">{venue.audience_age_group.replace(/_/g, " ")}</p>
                </div>
              )}
              {venue.audience_gender && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400 mb-1">Audience Gender</p>
                  <p className="font-semibold text-slate-800 capitalize">{venue.audience_gender.replace(/_/g, " ")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Map Location */}
        {venue.latitude && venue.longitude && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-violet-500" /> Location on Map
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden rounded-b-xl">
              <div style={{ height: 280 }}>
                <MapContainer
                  center={[venue.latitude, venue.longitude]}
                  zoom={15}
                  scrollWheelZoom={false}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[venue.latitude, venue.longitude]} icon={markerIcon} />
                </MapContainer>
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}