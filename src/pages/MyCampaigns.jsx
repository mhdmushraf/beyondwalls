import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Search, Megaphone, BarChart3, DollarSign, Calendar } from "lucide-react";

export default function MyCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    const u = await base44.auth.me();
    setUser(u);
    const c = await base44.entities.Campaign.filter({ advertiser_email: u.email }, "-created_date");
    setCampaigns(c);
    setLoading(false);
  };

  const statusColor = {
    active: "bg-emerald-100 text-emerald-700",
    pending_approval: "bg-amber-100 text-amber-700",
    draft: "bg-slate-100 text-slate-600",
    paused: "bg-orange-100 text-orange-700",
    rejected: "bg-red-100 text-red-700",
    completed: "bg-blue-100 text-blue-700",
    approved: "bg-violet-100 text-violet-700",
  };

  const filtered = campaigns.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <SEOHead noIndex title="My Campaigns | Beyond Walls" />
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">My Campaigns</h1>
          <Link to="/CreateCampaign">
            <Button className="bg-violet-600 hover:bg-violet-700 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" /> New Campaign
            </Button>
          </Link>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input className="pl-9" placeholder="Search campaigns..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {filtered.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Megaphone className="w-14 h-14 text-slate-200 mb-4" />
              <p className="text-slate-500 mb-4">No campaigns found</p>
              <Link to="/CreateCampaign">
                <Button className="bg-violet-600 hover:bg-violet-700">Create Campaign</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => (
              <Link key={c.id} to={`/CampaignDetail?id=${c.id}`}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Megaphone className="w-5 h-5 text-violet-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900 truncate">{c.name}</p>
                          <p className="text-sm text-slate-500 capitalize">{c.goal?.replace("_", " ")}</p>
                          <div className="flex flex-wrap gap-3 mt-2">
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <DollarSign className="w-3 h-3" /> AED {c.total_budget?.toLocaleString()}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <BarChart3 className="w-3 h-3" /> {c.total_impressions?.toLocaleString() || 0} impressions
                            </span>
                            {c.start_date && (
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {c.start_date}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge className={`${statusColor[c.status]} text-xs flex-shrink-0`}>
                        {c.status?.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}