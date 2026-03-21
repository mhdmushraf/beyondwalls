import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Search, Building2, CheckCircle2, XCircle, Loader2, MapPin, Users } from "lucide-react";

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
    try {
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
    } catch (err) {
      toast({ title: "Error", variant: "destructive" });
    }
    setActionLoading(false);
  };

  const handleReject = async (v) => {
    if (!rejectionReason.trim()) { toast({ title: "Please provide rejection reason", variant: "destructive" }); return; }
    setActionLoading(true);
    try {
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
    } catch (err) {
      toast({ title: "Error", variant: "destructive" });
    }
    setActionLoading(false);
  };

  const filtered = venues.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = v.name?.toLowerCase().includes(q) || v.owner_email?.toLowerCase().includes(q);
    const matchFilter = filter === "all" || v.approval_status === filter;
    return matchSearch && matchFilter;
  });

  const statusColor = { approved: "bg-emerald-100 text-emerald-700", pending: "bg-amber-100 text-amber-700", rejected: "bg-red-100 text-red-700" };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Venue Management</h1>
          <p className="text-slate-500 mt-1">{venues.filter(v => v.approval_status === "pending").length} pending approval</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-9" placeholder="Search venues..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2">
            {["all", "pending", "approved", "rejected"].map(f => (
              <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}
                className={filter === f ? "bg-violet-600 hover:bg-violet-700 capitalize" : "capitalize"}>{f}</Button>
            ))}
          </div>
        </div>

        {selected && (
          <Card className="border-2 border-violet-200 shadow-lg mb-6">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-bold text-slate-900">{selected.name}</h3>
                <Button variant="ghost" size="sm" onClick={() => { setSelected(null); setRejectionReason(""); }}>✕</Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-sm mb-4">
                <div className="space-y-1.5">
                  <div><span className="text-slate-500">Owner:</span> <span className="font-medium">{selected.owner_email}</span></div>
                  <div><span className="text-slate-500">Type:</span> <span className="font-medium capitalize">{selected.venue_type}</span></div>
                  <div><span className="text-slate-500">City:</span> <span className="font-medium">{selected.city}</span></div>
                  <div><span className="text-slate-500">Address:</span> <span className="font-medium">{selected.address}</span></div>
                  {selected.daily_footfall > 0 && <div><span className="text-slate-500">Daily Footfall:</span> <span className="font-medium">{selected.daily_footfall.toLocaleString()}</span></div>}
                </div>
              </div>
              {selected.approval_status === "pending" && (
                <div className="space-y-3 border-t pt-4">
                  <Input placeholder="Rejection reason..." value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} />
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
            </CardContent>
          </Card>
        )}

        {loading ? <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" /></div> : (
          <div className="space-y-2">
            {filtered.map(v => (
              <Card key={v.id} className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => setSelected(v)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-violet-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 text-sm truncate">{v.name}</p>
                        <p className="text-xs text-slate-500 truncate capitalize">{v.venue_type} · {v.city} · {v.owner_email}</p>
                      </div>
                    </div>
                    <Badge className={`${statusColor[v.approval_status]} text-xs flex-shrink-0`}>{v.approval_status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filtered.length === 0 && <p className="text-center text-slate-500 py-8">No venues found</p>}
          </div>
        )}
      </div>
    </div>
  );
}