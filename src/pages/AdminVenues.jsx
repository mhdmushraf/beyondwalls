import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Search, Building2, CheckCircle2, XCircle, Loader2,
  MapPin, Phone, Mail, Clock, Users, X, TrendingUp
} from "lucide-react";
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

const statusColor = {
  approved: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  rejected: "bg-red-100 text-red-700",
};

export default function AdminVenues() {
  const [venues, setVenues] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("pending");
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { loadVenues(); }, []);

  const loadVenues = async () => {
    const v = await base44.entities.Venue.list("-created_date");
    setVenues(v);
    setLoading(false);
  };

  const handleApprove = async (v) => {
    setActionLoading(true);
    await base44.entities.Venue.update(v.id, { approval_status: "approved", status: "active" });
    await base44.entities.Notification.create({
      recipient_email: v.owner_email,
      type: "account_approved",
      title: "Venue Approved!",
      message: `Your venue "${v.name}" has been approved. You can now add screens to it.`,
      reference_id: v.id,
    });
    await base44.integrations.Core.SendEmail({
      to: v.owner_email,
      subject: "Venue Approved - BeyondWalls",
      body: `Hi,\n\nGreat news! Your venue "${v.name}" has been approved.\n\nYou can now register screens for this venue and start earning revenue.\n\nBeyondWalls Team`,
    });
    toast({ title: "Venue approved!" });
    setSelected(null);
    loadVenues();
    setActionLoading(false);
  };

  const handleReject = async (v) => {
    if (!rejectionReason.trim()) { toast({ title: "Please provide rejection reason", variant: "destructive" }); return; }
    setActionLoading(true);
    await base44.entities.Venue.update(v.id, { approval_status: "rejected", status: "inactive" });
    await base44.integrations.Core.SendEmail({
      to: v.owner_email,
      subject: "Venue Registration Update - BeyondWalls",
      body: `Hi,\n\nYour venue "${v.name}" was not approved.\n\nReason: ${rejectionReason}\n\nContact hello@beyondwalls.ae for help.\n\nBeyondWalls Team`,
    });
    toast({ title: "Venue rejected." });
    setSelected(null);
    setRejectionReason("");
    loadVenues();
    setActionLoading(false);
  };

  const filtered = venues.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = v.name?.toLowerCase().includes(q) || v.owner_email?.toLowerCase().includes(q);
    const matchFilter = filter === "all" || v.approval_status === filter;
    return matchSearch && matchFilter;
  });

  const thumbnail = (v) => v.image_url || (v.photo_urls && v.photo_urls.length > 0 ? v.photo_urls[0] : null);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Venue Management</h1>
          <p className="text-slate-500 mt-1">{venues.filter(v => v.approval_status === "pending").length} pending approval</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-9" placeholder="Search venues..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "pending", "approved", "rejected"].map(f => (
              <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}
                className={filter === f ? "bg-violet-600 hover:bg-violet-700 capitalize" : "capitalize"}>{f}</Button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Venue Cards */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" /></div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No venues found</p>
            ) : filtered.map(v => {
              const img = thumbnail(v);
              const isSelected = selected?.id === v.id;
              return (
                <Card
                  key={v.id}
                  className={`cursor-pointer transition-all hover:shadow-md border ${isSelected ? "border-violet-400 shadow-md" : "border-transparent shadow-sm"}`}
                  onClick={() => { setSelected(v); setRejectionReason(""); }}
                >
                  <CardContent className="p-0">
                    <div className="flex items-stretch gap-0">
                      {/* Thumbnail */}
                      <div className="w-24 sm:w-32 flex-shrink-0 rounded-l-xl overflow-hidden">
                        {img ? (
                          <img src={img} alt={v.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-violet-50 flex items-center justify-center min-h-[88px]">
                            <Building2 className="w-8 h-8 text-violet-200" />
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-slate-900 text-sm leading-tight">{v.name}</p>
                            <Badge className={`${statusColor[v.approval_status]} text-xs flex-shrink-0 capitalize`}>{v.approval_status}</Badge>
                          </div>
                          <p className="text-xs text-slate-500 capitalize mt-0.5">{v.venue_type?.replace(/_/g, " ")}</p>
                        </div>
                        <div className="mt-2 space-y-0.5">
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <MapPin className="w-3 h-3 text-violet-400 flex-shrink-0" />
                            <span className="truncate">{v.city}{v.address ? `, ${v.address}` : ""}</span>
                          </div>
                          <p className="text-xs text-slate-400 truncate">{v.owner_email}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Detail Panel */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            {selected ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-0">
                  {/* Header image */}
                  <div className="relative rounded-t-xl overflow-hidden h-48">
                    {thumbnail(selected) ? (
                      <img src={thumbnail(selected)} alt={selected.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-violet-50 flex items-center justify-center">
                        <Building2 className="w-16 h-16 text-violet-200" />
                      </div>
                    )}
                    <button
                      onClick={() => { setSelected(null); setRejectionReason(""); }}
                      className="absolute top-3 right-3 bg-white/90 rounded-full p-1.5 hover:bg-white shadow"
                    >
                      <X className="w-4 h-4 text-slate-600" />
                    </button>
                    <div className="absolute bottom-3 left-3">
                      <Badge className={`${statusColor[selected.approval_status]} capitalize shadow`}>{selected.approval_status}</Badge>
                    </div>
                  </div>

                  {/* Photo strip */}
                  {selected.photo_urls && selected.photo_urls.length > 1 && (
                    <div className="flex gap-2 px-4 pt-3 overflow-x-auto">
                      {selected.photo_urls.map((url, i) => (
                        <div key={i} className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                          <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-4 space-y-4">
                    {/* Name & type */}
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{selected.name}</h2>
                      <p className="text-sm text-slate-500 capitalize">{selected.venue_type?.replace(/_/g, " ")}</p>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                        <span>{selected.address}, {selected.city}{selected.country ? `, ${selected.country}` : ""}</span>
                      </div>
                      {selected.description && <p className="text-slate-500 text-sm leading-relaxed">{selected.description}</p>}
                      {selected.contact_phone && (
                        <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-violet-500" />{selected.contact_phone}</div>
                      )}
                      {selected.contact_email && (
                        <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-violet-500" />{selected.contact_email}</div>
                      )}
                      {(selected.opening_time || selected.closing_time) && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-violet-500" />
                          {selected.opening_time} {selected.closing_time ? `– ${selected.closing_time}` : ""}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Users className="w-3.5 h-3.5" /> Owner: {selected.owner_email}
                      </div>
                    </div>

                    {/* Audience Insights */}
                    {(selected.daily_footfall || selected.weekly_footfall || selected.avg_dwell_time_minutes || selected.peak_hours || selected.audience_age_group || selected.audience_gender) && (
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Audience Insights</p>
                        <div className="grid grid-cols-2 gap-2">
                          {selected.daily_footfall > 0 && (
                            <div className="bg-slate-50 rounded-lg p-2.5">
                              <p className="text-xs text-slate-400">Daily Visitors</p>
                              <p className="font-semibold text-slate-800 text-sm">{selected.daily_footfall.toLocaleString()}</p>
                            </div>
                          )}
                          {selected.weekly_footfall > 0 && (
                            <div className="bg-slate-50 rounded-lg p-2.5">
                              <p className="text-xs text-slate-400">Weekly Visitors</p>
                              <p className="font-semibold text-slate-800 text-sm">{selected.weekly_footfall.toLocaleString()}</p>
                            </div>
                          )}
                          {selected.avg_dwell_time_minutes > 0 && (
                            <div className="bg-slate-50 rounded-lg p-2.5">
                              <p className="text-xs text-slate-400">Avg. Dwell Time</p>
                              <p className="font-semibold text-slate-800 text-sm">{selected.avg_dwell_time_minutes} min</p>
                            </div>
                          )}
                          {selected.peak_hours && (
                            <div className="bg-slate-50 rounded-lg p-2.5">
                              <p className="text-xs text-slate-400">Peak Hours</p>
                              <p className="font-semibold text-slate-800 text-sm">{selected.peak_hours}</p>
                            </div>
                          )}
                          {selected.audience_age_group && (
                            <div className="bg-slate-50 rounded-lg p-2.5">
                              <p className="text-xs text-slate-400">Age Group</p>
                              <p className="font-semibold text-slate-800 text-sm capitalize">{selected.audience_age_group.replace(/_/g, " ")}</p>
                            </div>
                          )}
                          {selected.audience_gender && (
                            <div className="bg-slate-50 rounded-lg p-2.5">
                              <p className="text-xs text-slate-400">Gender</p>
                              <p className="font-semibold text-slate-800 text-sm capitalize">{selected.audience_gender.replace(/_/g, " ")}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Map */}
                    {selected.latitude && selected.longitude && (
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Location</p>
                        <div className="rounded-xl overflow-hidden" style={{ height: 200 }}>
                          <MapContainer
                            center={[selected.latitude, selected.longitude]}
                            zoom={15}
                            scrollWheelZoom={false}
                            style={{ height: "100%", width: "100%" }}
                          >
                            <TileLayer
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={[selected.latitude, selected.longitude]} icon={markerIcon} />
                          </MapContainer>
                        </div>
                      </div>
                    )}

                    {/* Admin Actions */}
                    {selected.approval_status === "pending" && (
                      <div className="space-y-2 border-t pt-4">
                        <Input
                          placeholder="Rejection reason (required to reject)..."
                          value={rejectionReason}
                          onChange={e => setRejectionReason(e.target.value)}
                        />
                        <div className="flex gap-3">
                          <Button onClick={() => handleReject(selected)} disabled={actionLoading} variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50">
                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><XCircle className="w-4 h-4 mr-1" />Reject</>}
                          </Button>
                          <Button onClick={() => handleApprove(selected)} disabled={actionLoading} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-1" />Approve</>}
                          </Button>
                        </div>
                      </div>
                    )}
                    {selected.approval_status !== "pending" && (
                      <div className="flex gap-3 border-t pt-4">
                        {selected.approval_status !== "approved" && (
                          <Button onClick={() => handleApprove(selected)} disabled={actionLoading} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-1" />Approve</>}
                          </Button>
                        )}
                        {selected.approval_status !== "rejected" && (
                          <Button onClick={() => handleReject(selected)} disabled={actionLoading} variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50">
                            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><XCircle className="w-4 h-4 mr-1" />Reject</>}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
                <Building2 className="w-10 h-10 mb-2 text-slate-300" />
                <p className="text-sm">Select a venue to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}