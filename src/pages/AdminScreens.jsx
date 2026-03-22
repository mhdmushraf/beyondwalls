import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Search, MonitorPlay, CheckCircle2, XCircle, Loader2,
  Wifi, WifiOff, X, DollarSign, Layers, Clock, Code, Image
} from "lucide-react";

const statusColor = {
  approved: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  rejected: "bg-red-100 text-red-700",
};

export default function AdminScreens() {
  const [screens, setScreens] = useState([]);
  const [venues, setVenues] = useState({});
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("pending");
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [s, v] = await Promise.all([
      base44.entities.Screen.list("-created_date"),
      base44.entities.Venue.list(),
    ]);
    const venueMap = {};
    v.forEach(venue => { venueMap[venue.id] = venue; });
    setScreens(s);
    setVenues(venueMap);
    setLoading(false);
  };

  const handleApprove = async (s) => {
    setActionLoading(true);
    await base44.entities.Screen.update(s.id, { approval_status: "approved", status: "active" });
    await base44.entities.Notification.create({
      recipient_email: s.owner_email,
      type: "screen_approved",
      title: "Screen Approved!",
      message: `Your screen "${s.name}" has been approved. Connect it using setup code: ${s.setup_code}`,
      reference_id: s.id,
    });
    await base44.integrations.Core.SendEmail({
      to: s.owner_email,
      subject: "Screen Approved - BeyondWalls",
      body: `Great news! Your screen "${s.name}" has been approved.\n\nSetup Code: ${s.setup_code}\n\nConnect your display at: https://beyondwalls.ae/ScreenPlayer?code=${s.setup_code}\n\nBeyondWalls Team`,
    });
    toast({ title: "Screen approved!", description: "Owner notified." });
    setSelected(null);
    loadData();
    setActionLoading(false);
  };

  const handleReject = async (s) => {
    if (!rejectionReason.trim()) { toast({ title: "Please provide rejection reason", variant: "destructive" }); return; }
    setActionLoading(true);
    await base44.entities.Screen.update(s.id, { approval_status: "rejected", status: "inactive", rejection_reason: rejectionReason });
    await base44.integrations.Core.SendEmail({
      to: s.owner_email,
      subject: "Screen Registration Update - BeyondWalls",
      body: `Hi,\n\nYour screen "${s.name}" registration was not approved.\n\nReason: ${rejectionReason}\n\nContact hello@beyondwalls.ae for help.\n\nBeyondWalls Team`,
    });
    toast({ title: "Screen rejected." });
    setSelected(null);
    setRejectionReason("");
    loadData();
    setActionLoading(false);
  };

  const filtered = screens.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = s.name?.toLowerCase().includes(q) || s.owner_email?.toLowerCase().includes(q);
    const matchFilter = filter === "all" || s.approval_status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Screen Management</h1>
          <p className="text-slate-500 mt-1">
            {screens.filter(s => s.approval_status === "pending").length} pending approval ·{" "}
            {screens.filter(s => s.is_online && s.approval_status === "approved").length} online
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-9" placeholder="Search screens..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "pending", "approved", "rejected"].map(f => (
              <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}
                className={filter === f ? "bg-violet-600 hover:bg-violet-700 capitalize" : "capitalize"}>{f}</Button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Screen List */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" /></div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No screens found</p>
            ) : filtered.map(s => {
              const venue = venues[s.venue_id];
              const isSelected = selected?.id === s.id;
              return (
                <Card
                  key={s.id}
                  className={`cursor-pointer transition-all hover:shadow-md border ${isSelected ? "border-violet-400 shadow-md" : "border-transparent shadow-sm"}`}
                  onClick={() => { setSelected(s); setRejectionReason(""); }}
                >
                  <CardContent className="p-0">
                    <div className="flex items-stretch gap-0">
                      {/* Thumbnail */}
                      <div className="w-24 sm:w-32 flex-shrink-0 rounded-l-xl overflow-hidden">
                        {s.screen_image_url ? (
                          <img src={s.screen_image_url} alt={s.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-violet-50 flex items-center justify-center min-h-[88px]">
                            <MonitorPlay className="w-8 h-8 text-violet-200" />
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-slate-900 text-sm leading-tight">{s.name}</p>
                            <Badge className={`${statusColor[s.approval_status]} text-xs flex-shrink-0 capitalize`}>{s.approval_status}</Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{venue?.name || "Unknown Venue"}</p>
                        </div>
                        <div className="mt-2 space-y-0.5">
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            {s.is_online
                              ? <Wifi className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                              : <WifiOff className="w-3 h-3 text-slate-300 flex-shrink-0" />}
                            <span>{s.width_px}×{s.height_px}px · {s.total_slots} slots</span>
                          </div>
                          <p className="text-xs text-slate-400 truncate">{s.owner_email}</p>
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
                    {selected.screen_image_url ? (
                      <img src={selected.screen_image_url} alt={selected.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-violet-50 flex items-center justify-center">
                        <MonitorPlay className="w-16 h-16 text-violet-200" />
                      </div>
                    )}
                    <button
                      onClick={() => { setSelected(null); setRejectionReason(""); }}
                      className="absolute top-3 right-3 bg-white/90 rounded-full p-1.5 hover:bg-white shadow"
                    >
                      <X className="w-4 h-4 text-slate-600" />
                    </button>
                    <div className="absolute bottom-3 left-3 flex gap-2">
                      <Badge className={`${statusColor[selected.approval_status]} capitalize shadow`}>{selected.approval_status}</Badge>
                      {selected.is_online
                        ? <Badge className="bg-emerald-100 text-emerald-700 shadow">Online</Badge>
                        : <Badge className="bg-slate-100 text-slate-500 shadow">Offline</Badge>}
                    </div>
                  </div>

                  <div className="p-4 space-y-4">
                    {/* Name & venue */}
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{selected.name}</h2>
                      <p className="text-sm text-slate-500">{venues[selected.venue_id]?.name || "Unknown Venue"}</p>
                      {selected.location_description && (
                        <p className="text-xs text-slate-400 mt-0.5">{selected.location_description}</p>
                      )}
                    </div>

                    {/* Owner */}
                    <div className="text-sm text-slate-500">
                      <span className="font-medium text-slate-700">Owner: </span>{selected.owner_email}
                    </div>

                    {/* Tech Specs */}
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Technical Specs</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-50 rounded-lg p-2.5">
                          <p className="text-xs text-slate-400">Resolution</p>
                          <p className="font-semibold text-slate-800 text-sm">{selected.width_px}×{selected.height_px}px</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2.5">
                          <p className="text-xs text-slate-400">Display Mode</p>
                          <p className="font-semibold text-slate-800 text-sm capitalize">{selected.display_mode || "fit"}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2.5">
                          <p className="text-xs text-slate-400">Slot Duration</p>
                          <p className="font-semibold text-slate-800 text-sm">{selected.slot_duration}s</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2.5">
                          <p className="text-xs text-slate-400">Price/Week</p>
                          <p className="font-semibold text-slate-800 text-sm">AED {selected.price_per_week}</p>
                        </div>
                      </div>
                    </div>

                    {/* Ad Slots */}
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ad Slot Config</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                          <p className="text-xs text-slate-400">Total</p>
                          <p className="font-bold text-slate-800">{selected.total_slots}</p>
                        </div>
                        <div className="bg-violet-50 rounded-lg p-2.5 text-center">
                          <p className="text-xs text-violet-400">Ad Slots</p>
                          <p className="font-bold text-violet-700">{selected.public_ad_slots}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                          <p className="text-xs text-slate-400">Internal</p>
                          <p className="font-bold text-slate-800">{selected.internal_slots}</p>
                        </div>
                      </div>
                    </div>

                    {/* Setup Code */}
                    <div className="bg-violet-50 rounded-lg p-3 flex items-center gap-3">
                      <Code className="w-4 h-4 text-violet-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-violet-400">Setup Code</p>
                        <p className="font-mono font-bold text-violet-700 text-sm">{selected.setup_code}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    {selected.tags && selected.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {selected.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs capitalize">{tag}</Badge>
                        ))}
                      </div>
                    )}

                    {/* Rejection reason if rejected */}
                    {selected.approval_status === "rejected" && selected.rejection_reason && (
                      <div className="bg-red-50 rounded-lg p-3 text-sm text-red-700">
                        <span className="font-semibold">Rejection Reason: </span>{selected.rejection_reason}
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
                <MonitorPlay className="w-10 h-10 mb-2 text-slate-300" />
                <p className="text-sm">Select a screen to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}