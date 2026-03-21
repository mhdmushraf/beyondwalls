import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MonitorPlay, TrendingUp, DollarSign, Plus, BarChart3,
  Megaphone, Clock, CheckCircle2, AlertCircle, ArrowRight
} from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const u = await base44.auth.me();
      setUser(u);
      if (u?.user_role === "advertiser") {
        const c = await base44.entities.Campaign.filter({ advertiser_email: u.email });
        setCampaigns(c);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
    </div>
  );

  const activeCampaigns = campaigns.filter(c => c.status === "active").length;
  const pendingCampaigns = campaigns.filter(c => c.status === "pending_approval").length;
  const totalSpent = campaigns.reduce((sum, c) => sum + (c.spent_budget || 0), 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + (c.total_impressions || 0), 0);

  const statusColor = {
    active: "bg-emerald-100 text-emerald-700",
    pending_approval: "bg-amber-100 text-amber-700",
    draft: "bg-slate-100 text-slate-700",
    paused: "bg-orange-100 text-orange-700",
    rejected: "bg-red-100 text-red-700",
    completed: "bg-blue-100 text-blue-700",
    approved: "bg-violet-100 text-violet-700",
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Welcome back, {user?.full_name?.split(" ")[0]} 👋
            </h1>
            <p className="text-slate-500 mt-1">Here's an overview of your advertising activity</p>
          </div>
          <Link to="/CreateCampaign">
            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            { label: "Active Campaigns", value: activeCampaigns, icon: Megaphone, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Pending Approval", value: pendingCampaigns, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Total Spent (AED)", value: `${totalSpent.toLocaleString()}`, icon: DollarSign, color: "text-violet-600", bg: "bg-violet-50" },
            { label: "Total Impressions", value: totalImpressions.toLocaleString(), icon: BarChart3, color: "text-blue-600", bg: "bg-blue-50" },
          ].map((stat, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Wallet Card */}
        <Card className="mb-6 border-0 shadow-sm bg-gradient-to-r from-violet-600 to-indigo-700 text-white">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm mb-1">Wallet Balance</p>
                <p className="text-3xl sm:text-4xl font-bold">AED {(user?.wallet_balance || 0).toLocaleString()}</p>
                <p className="text-white/70 text-sm mt-1">Available for campaigns</p>
              </div>
              <div className="flex flex-col gap-2">
                <Link to="/Wallet">
                  <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs">
                    Top Up
                  </Button>
                </Link>
                <Link to="/Wallet">
                  <Button size="sm" variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 text-xs">
                    View History
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Campaigns */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">My Campaigns</CardTitle>
            <Link to="/MyCampaigns">
              <Button variant="ghost" size="sm" className="text-violet-600 text-xs">
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {campaigns.length === 0 ? (
              <div className="text-center py-10">
                <Megaphone className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 mb-4">No campaigns yet</p>
                <Link to="/CreateCampaign">
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                    Create Your First Campaign
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {campaigns.slice(0, 5).map(c => (
                  <Link key={c.id} to={`/CampaignDetail?id=${c.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Megaphone className="w-4 h-4 text-violet-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 text-sm truncate">{c.name}</p>
                          <p className="text-xs text-slate-500">Budget: AED {c.total_budget?.toLocaleString()}</p>
                        </div>
                      </div>
                      <Badge className={`${statusColor[c.status] || "bg-slate-100 text-slate-700"} text-xs flex-shrink-0 ml-2`}>
                        {c.status?.replace("_", " ")}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}