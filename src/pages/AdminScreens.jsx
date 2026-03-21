import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Search, MonitorPlay, Wifi, WifiOff, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function AdminScreens() {
  const [screens, setScreens] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("pending");
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { loadScreens(); }, []);

  const loadScreens = async () => {
    const s = await base44.entities.Screen.list("-created_date");
    setScreens(s);
    setLoading(false);
  };

  const handleApprove = async (s) => {
    setActionLoading(true);
    try {
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
      loadScreens();
    } catch (err) {
      toast({ title: "Error", variant: "destructive" });
    }
    setActionLoading(false);
  };

  const handleReject = async (s) => {
    if (!rejectionReason.trim()) { toast({ title: "Please provide rejection reason", variant: "destructive" }); return; }
    setActionLoading(true);
    try {
      await base44.entities.Screen.update(s.id, { approval_status: "rejected", status: "inactive", rejection_reason: rejectionReason });
      await base44.integrations.Core.SendEmail({
        to: s.owner_email,
        subject: "Screen Registration Update - BeyondWalls",
        body: `Hi,\n\nYour screen "${s.name}" registration was not approved.\n\nReason: ${rejectionReason}\n\nContact hello@beyondwalls.ae for help.\n\nBeyondWalls Team`,
      });
      toast({ title: "Screen rejected." });
      setSelected(null);
      setRejectionReason("");
      loadScreens();
    } catch (err) {
      toast({ title: "Error", variant: "destructive" });
    }
    setActionLoading(false);
  };

  const filtered = screens.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) || s.owner_email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || s.approval_status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Screen Management</h1>
          <p className="text-slate-500 mt-1">{screens.filter(s => s.approval_status === "pending").length} pending approval · {screens.filter(s => !s.is_online && s.approval_status === "approved").length} offline</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
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
                  <div><span className="text-slate-500">Resolution:</span> <span className="font-medium">{selected.width_px}×{selected.height_px}px</span></div>
                  <div><span className="text-slate-500">Slots:</span> <span className="font-medium">{selected.total_slots} ({selected.public_ad_slots} ad + {selected.internal_slots} internal)</span></div>
                  <div><span className="text-slate-500">Duration:</span> <span className="font-medium">{selected.slot_duration}s per slot</span></div>
                  <div><span className="text-slate-500">Price:</span> <span className="font-medium">AED {selected.price_per_week}/week</span></div>
                  <div><span className="text-slate-500">Setup Code:</span> <span className="font-mono font-bold text-violet-600">{selected.setup_code}</span></div>
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
            {filtered.map(s => (
              <Card key={s.id} className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => setSelected(s)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.is_online ? "bg-emerald-50" : "bg-slate-100"}`}>
                        {s.is_online ? <Wifi className="w-4 h-4 text-emerald-600" /> : <WifiOff className="w-4 h-4 text-slate-400" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 text-sm truncate">{s.name}</p>
                        <p className="text-xs text-slate-500 truncate">{s.owner_email} · {s.width_px}×{s.height_px}px</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge className={s.approval_status === "approved" ? "bg-emerald-100 text-emerald-700" : s.approval_status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}>
                        {s.approval_status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}