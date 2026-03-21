import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, MonitorPlay, Megaphone, Building2,
  Clock, CheckCircle2, AlertCircle, DollarSign,
  ArrowRight, TrendingUp, Wifi, WifiOff
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, pendingUsers: 0, campaigns: 0, pendingCampaigns: 0, screens: 0, venues: 0, offlineScreens: 0, payouts: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [users, campaigns, screens, venues, payouts] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.Campaign.list(),
        base44.entities.Screen.list(),
        base44.entities.Venue.list(),
        base44.entities.PayoutRequest.filter({ status: "pending" }),
      ]);
      setStats({
        users: users.length,
        pendingUsers: users.filter(u => u.approval_status === "pending" && u.profile_complete).length,
        campaigns: campaigns.length,
        pendingCampaigns: campaigns.filter(c => c.approval_status === "pending").length,
        screens: screens.length,
        venues: venues.length,
        offlineScreens: screens.filter(s => !s.is_online && s.approval_status === "approved").length,
        payouts: payouts.length,
      });
      setRecentUsers(users.filter(u => u.approval_status === "pending" && u.profile_complete).slice(0, 3));
      setRecentCampaigns(campaigns.filter(c => c.approval_status === "pending").slice(0, 3));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" /></div>;

  const statCards = [
    { label: "Total Users", value: stats.users, icon: Users, color: "text-violet-600", bg: "bg-violet-50", link: "/AdminUsers" },
    { label: "Pending Approvals", value: stats.pendingUsers, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", link: "/AdminUserApprovals", alert: stats.pendingUsers > 0 },
    { label: "Total Campaigns", value: stats.campaigns, icon: Megaphone, color: "text-blue-600", bg: "bg-blue-50", link: "/AdminCampaigns" },
    { label: "Pending Campaigns", value: stats.pendingCampaigns, icon: Clock, color: "text-orange-600", bg: "bg-orange-50", link: "/AdminCampaigns", alert: stats.pendingCampaigns > 0 },
    { label: "Total Screens", value: stats.screens, icon: MonitorPlay, color: "text-emerald-600", bg: "bg-emerald-50", link: "/AdminScreens" },
    { label: "Offline Screens", value: stats.offlineScreens, icon: WifiOff, color: "text-red-600", bg: "bg-red-50", link: "/AdminScreens", alert: stats.offlineScreens > 0 },
    { label: "Total Venues", value: stats.venues, icon: Building2, color: "text-teal-600", bg: "bg-teal-50", link: "/AdminVenues" },
    { label: "Pending Payouts", value: stats.payouts, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", link: "/AdminWalletRequests", alert: stats.payouts > 0 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">Platform overview and pending actions</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {statCards.map((s, i) => (
            <Link key={i} to={s.link}>
              <Card className={`border-0 shadow-sm hover:shadow-md transition-all cursor-pointer ${s.alert ? "ring-2 ring-amber-300" : ""}`}>
                <CardContent className="p-4">
                  <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center mb-2`}>
                    <s.icon className={`w-4 h-4 ${s.color}`} />
                  </div>
                  <div className="flex items-center gap-1">
                    <p className="text-xl sm:text-2xl font-bold text-slate-900">{s.value}</p>
                    {s.alert && s.value > 0 && <span className="w-2 h-2 bg-amber-500 rounded-full" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Pending User Approvals */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base sm:text-lg">Pending User Approvals</CardTitle>
              <Link to="/AdminUserApprovals">
                <Button variant="ghost" size="sm" className="text-violet-600 text-xs">View All <ArrowRight className="w-3 h-3 ml-1" /></Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentUsers.length === 0 ? (
                <div className="flex items-center gap-2 py-4 text-slate-500">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm">No pending approvals</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentUsers.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100">
                      <div>
                        <p className="font-medium text-sm text-slate-900">{u.full_name}</p>
                        <p className="text-xs text-slate-500">{u.user_role} · {u.email}</p>
                      </div>
                      <Link to={`/AdminUserApprovals?id=${u.id}`}>
                        <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-xs h-7">Review</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Campaigns */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base sm:text-lg">Pending Campaigns</CardTitle>
              <Link to="/AdminCampaigns">
                <Button variant="ghost" size="sm" className="text-violet-600 text-xs">View All <ArrowRight className="w-3 h-3 ml-1" /></Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentCampaigns.length === 0 ? (
                <div className="flex items-center gap-2 py-4 text-slate-500">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm">No pending campaigns</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentCampaigns.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-orange-50 border border-orange-100">
                      <div>
                        <p className="font-medium text-sm text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-500">AED {c.total_budget?.toLocaleString()} · {c.advertiser_email}</p>
                      </div>
                      <Link to={`/AdminCampaigns?id=${c.id}`}>
                        <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-xs h-7">Review</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Admin Links */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "User Approvals", link: "/AdminUserApprovals", icon: Users, color: "bg-violet-600" },
            { label: "Campaigns", link: "/AdminCampaigns", icon: Megaphone, color: "bg-blue-600" },
            { label: "Screens", link: "/AdminScreens", icon: MonitorPlay, color: "bg-emerald-600" },
            { label: "Payouts", link: "/AdminWalletRequests", icon: DollarSign, color: "bg-amber-600" },
          ].map((item, i) => (
            <Link key={i} to={item.link}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center`}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-slate-700">{item.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}