import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Megaphone, BarChart3, DollarSign, Calendar, Pause, Play, Loader2 } from "lucide-react";

export default function CampaignDetail() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    if (id) {
      base44.entities.Campaign.filter({ id }).then(c => {
        setCampaign(c[0] || null);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const togglePause = async () => {
    if (!campaign) return;
    setActionLoading(true);
    const newStatus = campaign.status === "paused" ? "active" : "paused";
    await base44.entities.Campaign.update(campaign.id, { status: newStatus });
    setCampaign(c => ({ ...c, status: newStatus }));
    toast({ title: newStatus === "paused" ? "Campaign paused" : "Campaign resumed" });
    setActionLoading(false);
  };

  const statusColor = {
    active: "bg-emerald-100 text-emerald-700", pending_approval: "bg-amber-100 text-amber-700",
    draft: "bg-slate-100 text-slate-600", paused: "bg-orange-100 text-orange-700",
    rejected: "bg-red-100 text-red-700", completed: "bg-blue-100 text-blue-700",
    approved: "bg-violet-100 text-violet-700",
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" /></div>;
  if (!campaign) return <div className="min-h-screen flex items-center justify-center"><p className="text-slate-500">Campaign not found</p></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{campaign.name}</h1>
          </div>
          <Badge className={statusColor[campaign.status]}>{campaign.status?.replace("_", " ")}</Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Budget", value: `AED ${campaign.total_budget?.toLocaleString()}`, icon: DollarSign },
            { label: "Spent", value: `AED ${(campaign.spent_budget || 0).toLocaleString()}`, icon: DollarSign },
            { label: "Impressions", value: (campaign.total_impressions || 0).toLocaleString(), icon: BarChart3 },
            { label: "Screens", value: campaign.selected_screens?.length || 0, icon: Megaphone },
          ].map((s, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Details */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base">Campaign Details</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Goal</span><span className="capitalize font-medium">{campaign.goal?.replace("_", " ")}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Start Date</span><span className="font-medium">{campaign.start_date || "N/A"}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">End Date</span><span className="font-medium">{campaign.end_date || "N/A"}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Creative Type</span><span className="font-medium capitalize">{campaign.creative_type}</span></div>
              {campaign.rejection_reason && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg">
                  <p className="text-xs text-red-600"><span className="font-semibold">Rejection reason:</span> {campaign.rejection_reason}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {campaign.creative_urls?.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-base">Creatives</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {campaign.creative_urls.map((url, i) => (
                    <img key={i} src={url} alt="" className="w-full h-24 sm:h-32 object-cover rounded-lg border" />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions */}
        {(campaign.status === "active" || campaign.status === "paused") && (
          <Button onClick={togglePause} disabled={actionLoading} variant="outline" className="w-full sm:w-auto">
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : campaign.status === "paused" ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
            {campaign.status === "paused" ? "Resume Campaign" : "Pause Campaign"}
          </Button>
        )}
      </div>
    </div>
  );
}