import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Search, CheckCircle2, XCircle, Loader2, Megaphone, Eye } from "lucide-react";

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("pending");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCampaigns();
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    if (id) base44.entities.Campaign.filter({ id }).then(c => { if (c[0]) setSelected(c[0]); });
  }, []);

  const loadCampaigns = async () => {
    const c = await base44.entities.Campaign.list("-created_date");
    setCampaigns(c);
    setLoading(false);
  };

  const handleApprove = async (c) => {
    setActionLoading(true);
    try {
      await base44.entities.Campaign.update(c.id, { approval_status: "approved", status: "active" });
      await base44.entities.Notification.create({
        recipient_email: c.advertiser_email,
        type: "campaign_approved",
        title: "Campaign Approved!",
        message: `Your campaign "${c.name}" has been approved and is now live.`,
        reference_id: c.id,
      });
      await base44.integrations.Core.SendEmail({
        to: c.advertiser_email,
        subject: "🚀 Campaign Approved & Live - BeyondWalls",
        body: `Hi there,\n\nYour campaign "${c.name}" has been approved and is now live on selected screens.\n\nBudget: AED ${c.total_budget?.toLocaleString()}\nScreens: ${c.selected_screens?.length || 0}\n\nTrack performance in your dashboard.\n\nBeyondWalls Team`,
      });
      toast({ title: "Campaign approved!", description: "Advertiser notified by email." });
      setSelected(null);
      loadCampaigns();
    } catch (err) {
      toast({ title: "Error", variant: "destructive" });
    }
    setActionLoading(false);
  };

  const handleReject = async (c) => {
    if (!rejectionReason.trim()) {
      toast({ title: "Please provide rejection reason", variant: "destructive" });
      return;
    }
    setActionLoading(true);
    try {
      await base44.entities.Campaign.update(c.id, { approval_status: "rejected", status: "rejected", rejection_reason: rejectionReason });
      await base44.entities.Notification.create({
        recipient_email: c.advertiser_email,
        type: "campaign_rejected",
        title: "Campaign Not Approved",
        message: `Campaign "${c.name}" was not approved. Reason: ${rejectionReason}`,
        reference_id: c.id,
      });
      await base44.integrations.Core.SendEmail({
        to: c.advertiser_email,
        subject: "Campaign Update - BeyondWalls",
        body: `Hi there,\n\nYour campaign "${c.name}" was not approved.\n\nReason: ${rejectionReason}\n\nPlease update your campaign and resubmit, or contact support.\n\nBeyondWalls Team`,
      });
      toast({ title: "Campaign rejected", description: "Advertiser notified." });
      setSelected(null);
      setRejectionReason("");
      loadCampaigns();
    } catch (err) {
      toast({ title: "Error", variant: "destructive" });
    }
    setActionLoading(false);
  };

  const statusColor = {
    active: "bg-emerald-100 text-emerald-700", pending_approval: "bg-amber-100 text-amber-700",
    draft: "bg-slate-100 text-slate-600", rejected: "bg-red-100 text-red-700",
    approved: "bg-violet-100 text-violet-700", completed: "bg-blue-100 text-blue-700",
  };

  const filtered = campaigns.filter(c => {
    const matchSearch = c.name?.toLowerCase().includes(search.toLowerCase()) || c.advertiser_email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || c.approval_status === filter || (filter === "pending" && c.approval_status === "pending");
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <SEOHead noIndex title="Campaign Approvals | Beyond Walls" />
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Campaign Management</h1>
          <p className="text-slate-500 mt-1">{campaigns.filter(c => c.approval_status === "pending").length} pending review</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-9" placeholder="Search campaigns..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "pending", "approved", "rejected"].map(f => (
              <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}
                className={filter === f ? "bg-violet-600 hover:bg-violet-700 capitalize" : "capitalize"}>
                {f}
              </Button>
            ))}
          </div>
        </div>

        {/* Detail Panel — bottom sheet on mobile */}
        {selected && (
          <div className="fixed inset-0 z-50 bg-black/50 lg:static lg:bg-transparent lg:z-auto" onClick={(e) => { if (e.target === e.currentTarget) { setSelected(null); setRejectionReason(""); } }}>
            <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto lg:static lg:max-h-none lg:mb-6 rounded-t-2xl lg:rounded-xl">
          <Card className="border-2 border-violet-200 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{selected.name}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => { setSelected(null); setRejectionReason(""); }}>✕</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4 mb-4 text-sm">
                <div className="space-y-2">
                  <div><span className="text-slate-500">Advertiser:</span> <span className="font-medium break-all">{selected.advertiser_email}</span></div>
                  <div><span className="text-slate-500">Goal:</span> <span className="font-medium capitalize">{selected.goal?.replace("_", " ")}</span></div>
                  <div><span className="text-slate-500">Budget:</span> <span className="font-medium">AED {selected.total_budget?.toLocaleString()}</span></div>
                  <div><span className="text-slate-500">Screens:</span> <span className="font-medium">{selected.selected_screens?.length || 0} screens</span></div>
                  <div><span className="text-slate-500">Duration:</span> <span className="font-medium">{selected.start_date} → {selected.end_date}</span></div>
                </div>
                <div>
                  {selected.creative_urls?.length > 0 && (
                    <div>
                      <p className="text-slate-500 mb-2 text-xs">Creatives:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {selected.creative_urls.slice(0, 4).map((url, i) => (
                          <img key={i} src={url} alt="" className="w-full h-20 object-cover rounded-lg border" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {selected.approval_status === "pending" && (
                <div className="space-y-3 border-t pt-4">
                  <Input placeholder="Rejection reason (if rejecting)..." value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} />
                  <div className="flex gap-3">
                    <Button onClick={() => handleReject(selected)} disabled={actionLoading} variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50">
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><XCircle className="w-4 h-4 mr-1" />Reject</>}
                    </Button>
                    <Button onClick={() => handleApprove(selected)} disabled={actionLoading} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-1" />Approve &amp; Go Live</>}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
            </div>
          </div>
        )}

        {loading ? <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" /></div> : (
          <div className="space-y-2">
            {filtered.map(c => (
              <Card key={c.id} className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => setSelected(c)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Megaphone className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 text-sm truncate">{c.name}</p>
                        <p className="text-xs text-slate-500 truncate">{c.advertiser_email} · AED {c.total_budget?.toLocaleString()}</p>
                      </div>
                    </div>
                    <Badge className={`${statusColor[c.approval_status] || "bg-slate-100 text-slate-600"} text-xs flex-shrink-0`}>
                      {c.approval_status}
                    </Badge>
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