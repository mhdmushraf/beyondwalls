import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  Megaphone,
  Eye,
  Calendar,
  MonitorPlay
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import CampaignCard from "@/components/dashboard/CampaignCard";

export default function MyCampaigns() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const { data: campaigns = [], isLoading, refetch } = useQuery({
    queryKey: ["campaigns", user?.email],
    queryFn: () => base44.entities.Campaign.filter({ advertiser_id: user?.email }, "-created_date"),
    enabled: !!user?.email
  });

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewCampaign = (campaign) => {
    navigate(createPageUrl(`CampaignDetails?id=${campaign.id}`));
  };

  const handlePause = async (campaign) => {
    await base44.entities.Campaign.update(campaign.id, { status: "paused" });
    refetch();
  };

  const handleResume = async (campaign) => {
    await base44.entities.Campaign.update(campaign.id, { status: "active" });
    refetch();
  };

  const statusCounts = {
    all: campaigns.length,
    active: campaigns.filter(c => c.status === "active").length,
    pending_approval: campaigns.filter(c => c.status === "pending_approval").length,
    draft: campaigns.filter(c => c.status === "draft").length,
    completed: campaigns.filter(c => c.status === "completed").length
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">My Campaigns</h1>
          <p className="text-slate-500 mt-1">Manage and monitor all your advertising campaigns</p>
        </div>
        <Link to={createPageUrl("CreateCampaign")}>
          <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25">
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="all" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
              All ({statusCounts.all})
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
              Active ({statusCounts.active})
            </TabsTrigger>
            <TabsTrigger value="pending_approval" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
              Pending ({statusCounts.pending_approval})
            </TabsTrigger>
            <TabsTrigger value="draft" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
              Drafts ({statusCounts.draft})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Campaigns Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
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
      ) : filteredCampaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-8 h-8 text-violet-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">
            {search || statusFilter !== "all" ? "No campaigns found" : "No campaigns yet"}
          </h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            {search || statusFilter !== "all" 
              ? "Try adjusting your search or filters"
              : "Create your first campaign to start reaching audiences across the UAE"
            }
          </p>
          {!search && statusFilter === "all" && (
            <Link to={createPageUrl("CreateCampaign")}>
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onView={handleViewCampaign}
              onPause={handlePause}
              onResume={handleResume}
            />
          ))}
        </div>
      )}
    </div>
  );
}