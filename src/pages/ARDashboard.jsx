import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Crown,
  Sparkles,
  Plus,
  Box,
  ScanLine,
  Eye,
  MousePointer,
  TrendingUp,
  Clock,
  Zap,
  ArrowRight,
  BarChart3,
  CreditCard,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ARSubscriptionCard from "@/components/ar/ARSubscriptionCard";
import ARCampaignCard from "@/components/ar/ARCampaignCard";
import ARUpgradeModal from "@/components/ar/ARUpgradeModal";

export default function ARDashboard() {
  const [user, setUser] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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

  const { data: subscription } = useQuery({
    queryKey: ["ar-subscription", user?.email],
    queryFn: () => base44.entities.ARSubscription.filter({ user_id: user?.email }),
    enabled: !!user?.email,
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ["ar-campaigns", user?.email],
    queryFn: () => base44.entities.ARCampaign.filter({ advertiser_id: user?.email }, "-created_date"),
    enabled: !!user?.email,
  });

  const { data: analyticsEvents = [] } = useQuery({
    queryKey: ["ar-analytics"],
    queryFn: () => base44.entities.ARAnalyticsEvent.list("-created_date", 100),
    enabled: !!user?.email,
  });

  const activeSubscription = subscription?.[0];
  const hasARAccess = activeSubscription?.status === "active";

  // Calculate stats
  const totalScans = campaigns.reduce((sum, c) => sum + (c.total_scans || 0), 0);
  const totalEngagements = campaigns.reduce((sum, c) => sum + (c.total_engagements || 0), 0);
  const activeCampaigns = campaigns.filter(c => c.status === "active").length;
  const avgDuration = campaigns.length > 0 
    ? campaigns.reduce((sum, c) => sum + (c.avg_session_duration || 0), 0) / campaigns.length 
    : 0;

  const stats = [
    { label: "Total Scans", value: totalScans.toLocaleString(), icon: ScanLine, color: "violet" },
    { label: "Engagements", value: totalEngagements.toLocaleString(), icon: MousePointer, color: "emerald" },
    { label: "Active Campaigns", value: activeCampaigns, icon: Box, color: "amber" },
    { label: "Avg. Duration", value: `${Math.round(avgDuration)}s`, icon: Clock, color: "blue" },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">AR Engage Dashboard</h1>
              <Badge className="bg-amber-100 text-amber-700">Premium</Badge>
            </div>
            <p className="text-slate-500">Manage your augmented reality advertising campaigns</p>
          </div>
          <div className="flex gap-3">
            {hasARAccess ? (
              <Link to={createPageUrl("CreateARCampaign")}>
                <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600">
                  <Plus className="w-4 h-4 mr-2" />
                  New AR Campaign
                </Button>
              </Link>
            ) : (
              <Button 
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600"
                onClick={() => setShowUpgradeModal(true)}
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to AR Premium
              </Button>
            )}
          </div>
        </div>

        {/* Subscription Status */}
        <ARSubscriptionCard 
          subscription={activeSubscription} 
          onUpgrade={() => setShowUpgradeModal(true)} 
        />

        {/* Stats Grid */}
        {hasARAccess && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <Card key={i} className="border-0 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                    <div className={`w-10 h-10 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Access State */}
        {!hasARAccess && (
          <Card className="border-0 shadow-lg mb-8 bg-gradient-to-br from-violet-50 to-fuchsia-50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Unlock AR Engage Premium</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Create immersive AR advertising experiences. Let customers virtually try products, 
                visualize furniture in their space, and more.
              </p>
              <div className="flex flex-wrap gap-4 justify-center mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Box className="w-4 h-4 text-violet-600" />
                  3D Product Visualization
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Eye className="w-4 h-4 text-violet-600" />
                  Virtual Try-On
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <BarChart3 className="w-4 h-4 text-violet-600" />
                  Advanced Analytics
                </div>
              </div>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600"
                onClick={() => setShowUpgradeModal(true)}
              >
                View Pricing Plans
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Campaigns List */}
        {hasARAccess && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Your AR Campaigns</h2>
              <Link to={createPageUrl("ARCampaigns")} className="text-violet-600 text-sm font-medium hover:underline">
                View All
              </Link>
            </div>

            {campaigns.length === 0 ? (
              <Card className="border-0 shadow-md">
                <CardContent className="p-8 text-center">
                  <Box className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">No AR Campaigns Yet</h3>
                  <p className="text-slate-500 mb-4">Create your first AR campaign to get started</p>
                  <Link to={createPageUrl("CreateARCampaign")}>
                    <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Create AR Campaign
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaigns.slice(0, 6).map((campaign) => (
                  <ARCampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Upgrade Modal */}
        <ARUpgradeModal 
          open={showUpgradeModal} 
          onClose={() => setShowUpgradeModal(false)}
          currentSubscription={activeSubscription}
        />
      </div>
    </div>
  );
}