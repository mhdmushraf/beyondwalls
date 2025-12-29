import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Users,
  Building2,
  MonitorPlay,
  Megaphone,
  Wallet,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatsCard from "@/components/dashboard/StatsCard";
import AdminOnboarding from "@/components/admin/AdminOnboarding";
import SystemHealthMonitor from "@/components/admin/SystemHealthMonitor";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl("AdminDashboard"));
        return;
      }
      
      const userData = await base44.auth.me();
      
      // Security check: Only admins can access this page
      const isAdmin = userData?.user_role === "admin" || userData?.role === "admin";
      if (!isAdmin) {
        window.location.href = createPageUrl("Dashboard");
        return;
      }
      
      setUser(userData);
      setAuthChecked(true);
    } catch (e) {
      base44.auth.redirectToLogin(createPageUrl("AdminDashboard"));
    }
  };

  const { data: users = [] } = useQuery({
    queryKey: ["all-users"],
    queryFn: () => base44.entities.User.list(),
    enabled: authChecked
  });

  const { data: venues = [] } = useQuery({
    queryKey: ["all-venues"],
    queryFn: () => base44.entities.Venue.list(),
    enabled: authChecked
  });

  const { data: screens = [] } = useQuery({
    queryKey: ["all-screens"],
    queryFn: () => base44.entities.Screen.list(),
    enabled: authChecked
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ["all-campaigns"],
    queryFn: () => base44.entities.Campaign.list("-created_date", 50),
    enabled: authChecked
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["all-transactions"],
    queryFn: () => base44.entities.Transaction.list("-created_date", 20),
    enabled: authChecked
  });

  if (!authChecked) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const pendingCampaigns = campaigns.filter(c => c.status === "pending_approval");
  const pendingVenues = venues.filter(v => v.status === "pending");
  const onlineScreens = screens.filter(s => s.status === "online").length;
  const totalRevenue = transactions
    .filter(t => t.type === "ad_spend")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
          Admin Dashboard
        </h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">Overview of platform activity</p>
      </div>

      {/* Onboarding Checklist */}
      {showOnboarding && (
        <AdminOnboarding onDismiss={() => setShowOnboarding(false)} />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        <StatsCard
          title="Total Users"
          value={users.length}
          icon={Users}
          color="violet"
        />
        <StatsCard
          title="Active Venues"
          value={venues.filter(v => v.status === "approved").length}
          icon={Building2}
          color="indigo"
        />
        <StatsCard
          title="Online Screens"
          value={`${onlineScreens}/${screens.length}`}
          icon={MonitorPlay}
          color="emerald"
        />
        <StatsCard
          title="Total Revenue"
          value={`AED ${totalRevenue.toLocaleString()}`}
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* Pending Approvals Alert */}
      {(pendingCampaigns.length > 0 || pendingVenues.length > 0) && (
        <Card className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900">Pending Approvals</p>
                <p className="text-sm text-slate-600">
                  {pendingCampaigns.length} campaigns and {pendingVenues.length} venues waiting for review
                </p>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                {pendingCampaigns.length > 0 && (
                  <Link to={createPageUrl("AdminCampaigns")}>
                    <Button variant="outline" size="sm" className="border-amber-300">
                      Review Campaigns
                    </Button>
                  </Link>
                )}
                {pendingVenues.length > 0 && (
                  <Link to={createPageUrl("AdminVenues")}>
                    <Button variant="outline" size="sm" className="border-amber-300">
                      Review Venues
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Campaigns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Pending Campaigns</CardTitle>
            <Link to={createPageUrl("AdminCampaigns")}>
              <Button variant="ghost" size="sm" className="text-violet-600">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingCampaigns.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No pending campaigns</p>
            ) : (
              <div className="space-y-3">
                {pendingCampaigns.slice(0, 5).map((campaign) => (
                  <div 
                    key={campaign.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{campaign.name}</p>
                      <p className="text-sm text-slate-500">
                        {campaign.created_date && format(new Date(campaign.created_date), "MMM d, h:mm a")}
                      </p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Venues */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Pending Venues</CardTitle>
            <Link to={createPageUrl("AdminVenues")}>
              <Button variant="ghost" size="sm" className="text-violet-600">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingVenues.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No pending venues</p>
            ) : (
              <div className="space-y-3">
                {pendingVenues.slice(0, 5).map((venue) => (
                  <div 
                    key={venue.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{venue.name}</p>
                      <p className="text-sm text-slate-500">{venue.city} • {venue.type}</p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Transactions</CardTitle>
            <Link to={createPageUrl("AdminTransactions")}>
              <Button variant="ghost" size="sm" className="text-violet-600">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((tx) => (
                  <div 
                    key={tx.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                  >
                    <div>
                      <p className="font-medium text-slate-900 capitalize">{tx.type?.replace("_", " ")}</p>
                      <p className="text-sm text-slate-500">{tx.user_id}</p>
                    </div>
                    <p className={`font-semibold ${
                      tx.type === "top_up" || tx.type === "earning" ? "text-emerald-600" : "text-slate-900"
                    }`}>
                      AED {tx.amount?.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Health Monitor */}
        <SystemHealthMonitor />
      </div>
    </div>
  );
}