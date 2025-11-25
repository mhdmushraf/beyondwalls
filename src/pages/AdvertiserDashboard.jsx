import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Megaphone,
  Wallet,
  Eye,
  MonitorPlay,
  Plus,
  ArrowRight,
  TrendingUp,
  Calendar,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import StatsCard from "@/components/dashboard/StatsCard";
import CampaignCard from "@/components/dashboard/CampaignCard";
import { format } from "date-fns";

export default function AdvertiserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {
      base44.auth.redirectToLogin();
    }
  };

  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
    queryKey: ["campaigns", user?.email],
    queryFn: () => base44.entities.Campaign.filter({ advertiser_id: user?.email }, "-created_date", 10),
    enabled: !!user?.email
  });

  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ["transactions", user?.email],
    queryFn: () => base44.entities.Transaction.filter({ user_id: user?.email }, "-created_date", 5),
    enabled: !!user?.email
  });

  // Auto-refresh wallet balance every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadUser();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const activeCampaigns = campaigns.filter(c => c.status === "active").length;
  const totalImpressions = campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + (c.spend || 0), 0);

  const handleViewCampaign = (campaign) => {
    navigate(createPageUrl(`CampaignDetails?id=${campaign.id}`));
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
            Welcome back, {user?.full_name?.split(" ")[0] || "Advertiser"}
          </h1>
          <p className="text-slate-500 mt-1">Here's what's happening with your campaigns</p>
        </div>
        <Link to={createPageUrl("CreateCampaign")}>
          <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25">
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatsCard
          title="Wallet Balance"
          value={`AED ${user?.wallet_balance?.toLocaleString() || "0"}`}
          icon={Wallet}
          color="emerald"
        />
        <StatsCard
          title="Active Campaigns"
          value={activeCampaigns}
          icon={Megaphone}
          color="violet"
          trend="up"
          trendValue="+2"
        />
        <StatsCard
          title="Total Impressions"
          value={totalImpressions.toLocaleString()}
          icon={Eye}
          color="indigo"
          trend="up"
          trendValue="+15%"
        />
        <StatsCard
          title="Total Spent"
          value={`AED ${totalSpent.toLocaleString()}`}
          icon={TrendingUp}
          color="amber"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Campaigns Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Recent Campaigns</h2>
            <Link to={createPageUrl("MyCampaigns")}>
              <Button variant="ghost" className="text-violet-600">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {loadingCampaigns ? (
            <div className="grid gap-4">
              {[1, 2].map(i => (
                <div key={i} className="bg-white rounded-xl border border-slate-100 p-5">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32 mb-4" />
                  <Skeleton className="h-32 w-full rounded-lg mb-4" />
                  <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                    <Skeleton className="h-16 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <Card className="border-2 border-dashed border-slate-200">
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Megaphone className="w-8 h-8 text-violet-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">No campaigns yet</h3>
                <p className="text-slate-500 mb-6">Create your first campaign to start reaching audiences</p>
                <Link to={createPageUrl("CreateCampaign")}>
                  <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Campaign
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {campaigns.slice(0, 3).map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onView={handleViewCampaign}
                  onPause={() => {}}
                  onResume={() => {}}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Wallet Card */}
          <Card className="bg-gradient-to-br from-violet-600 to-indigo-600 border-0 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <CardHeader>
              <CardTitle className="text-white/80 text-sm font-medium">Available Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold mb-6">
                AED {user?.wallet_balance?.toLocaleString() || "0"}
              </p>
              <Link to={createPageUrl("AdvertiserWallet")}>
                <Button className="w-full bg-white text-violet-600 hover:bg-white/90">
                  <Wallet className="w-4 h-4 mr-2" />
                  Top Up Wallet
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Transactions</CardTitle>
                <Link to={createPageUrl("AdvertiserWallet")}>
                  <Button variant="ghost" size="sm" className="text-violet-600 -mr-2">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loadingTransactions ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <p className="text-center text-slate-500 py-4 text-sm">No transactions yet</p>
              ) : (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium text-sm text-slate-900 capitalize">
                          {tx.type.replace("_", " ")}
                        </p>
                        <p className="text-xs text-slate-500">
                          {tx.created_date && format(new Date(tx.created_date), "MMM d, h:mm a")}
                        </p>
                      </div>
                      <p className={`font-semibold ${
                        tx.type === "top_up" || tx.type === "refund" 
                          ? "text-emerald-600" 
                          : "text-slate-900"
                      }`}>
                        {tx.type === "top_up" || tx.type === "refund" ? "+" : "-"}
                        AED {tx.amount}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to={createPageUrl("CreateCampaign")} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-3" />
                  Create New Campaign
                </Button>
              </Link>
              <Link to={createPageUrl("AdvertiserWallet")} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Wallet className="w-4 h-4 mr-3" />
                  Add Funds
                </Button>
              </Link>
              <Link to={createPageUrl("MyCampaigns")} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Megaphone className="w-4 h-4 mr-3" />
                  Manage Campaigns
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}