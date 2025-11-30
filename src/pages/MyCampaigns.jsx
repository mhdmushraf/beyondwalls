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
  MonitorPlay,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import CampaignCard from "@/components/dashboard/CampaignCard";

export default function MyCampaigns() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch campaigns (AI campaigns)
  const { data: campaigns = [], isLoading: campaignsLoading, refetch: refetchCampaigns } = useQuery({
    queryKey: ["campaigns", user?.email],
    queryFn: () => base44.entities.Campaign.filter({ advertiser_id: user?.email }, "-created_date"),
    enabled: !!user?.email
  });

  // Fetch ad slot bookings (regular bookings)
  const { data: bookings = [], isLoading: bookingsLoading, refetch: refetchBookings } = useQuery({
    queryKey: ["my-bookings", user?.email],
    queryFn: () => base44.entities.AdSlotBooking.filter({ advertiser_id: user?.email }, "-created_date"),
    enabled: !!user?.email
  });

  // Fetch screens for display info
  const { data: screens = [] } = useQuery({
    queryKey: ["all-screens-for-campaigns"],
    queryFn: () => base44.entities.Screen.list(),
    enabled: !!user?.email
  });

  // Fetch venues for display info
  const { data: venues = [] } = useQuery({
    queryKey: ["all-venues-for-campaigns"],
    queryFn: () => base44.entities.Venue.list(),
    enabled: !!user?.email
  });

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

  const isLoading = campaignsLoading || bookingsLoading;
  const refetch = () => { refetchCampaigns(); refetchBookings(); };

  // Combine campaigns and bookings into a unified view
  const allCampaigns = [
    ...campaigns.map(c => ({
      ...c,
      source: "campaign",
      screen_names: (c.screen_ids || []).map(sid => {
        const screen = screens.find(s => s.id === sid);
        const venue = screen ? venues.find(v => v.id === screen.venue_id) : null;
        return screen ? `${screen.name} (${venue?.name || 'Unknown'})` : null;
      }).filter(Boolean)
    })),
    ...bookings.map(b => {
      const screen = screens.find(s => s.id === b.screen_id);
      const venue = screen ? venues.find(v => v.id === screen.venue_id) : null;
      return {
        id: b.id,
        name: b.campaign_name || "Ad Booking",
        status: b.status === "active" ? "active" : b.status === "pending" ? "pending_approval" : b.status,
        start_date: b.start_date,
        end_date: b.end_date,
        creative_url: b.creative_url,
        creative_type: b.creative_type,
        total_cost: b.total_cost,
        impressions: b.impressions || 0,
        clicks: b.clicks || 0,
        created_date: b.created_date,
        source: "booking",
        screen_names: screen ? [`${screen.name} (${venue?.name || 'Unknown'})`] : [],
        screen_id: b.screen_id,
        slot_number: b.slot_number
      };
    })
  ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

  const filteredCampaigns = allCampaigns.filter(campaign => {
    const matchesSearch = campaign.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewCampaign = (campaign) => {
    if (campaign.source === "booking") {
      navigate(createPageUrl(`CampaignManager?id=${campaign.id}`));
    } else {
      navigate(createPageUrl(`CampaignDetails?id=${campaign.id}`));
    }
  };

  const handlePause = async (campaign) => {
    if (campaign.source === "booking") {
      await base44.entities.AdSlotBooking.update(campaign.id, { status: "paused" });
    } else {
      await base44.entities.Campaign.update(campaign.id, { status: "paused" });
    }
    refetch();
  };

  const handleResume = async (campaign) => {
    if (campaign.source === "booking") {
      await base44.entities.AdSlotBooking.update(campaign.id, { status: "active" });
    } else {
      await base44.entities.Campaign.update(campaign.id, { status: "active" });
    }
    refetch();
  };

  const statusCounts = {
    all: allCampaigns.length,
    active: allCampaigns.filter(c => c.status === "active").length,
    pending_approval: allCampaigns.filter(c => c.status === "pending_approval" || c.status === "pending").length,
    draft: allCampaigns.filter(c => c.status === "draft").length,
    completed: allCampaigns.filter(c => c.status === "completed").length
  };

  if (!user) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading campaigns...</p>
        </div>
      </div>
    );
  }

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
            <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                {/* Creative Preview */}
                <div className="aspect-video bg-slate-100 relative">
                  {campaign.creative_url ? (
                    campaign.creative_type === "video" ? (
                      <video src={campaign.creative_url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={campaign.creative_url} alt={campaign.name} className="w-full h-full object-cover" />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Megaphone className="w-12 h-12 text-slate-300" />
                    </div>
                  )}
                  <Badge className={`absolute top-3 right-3 ${
                    campaign.status === "active" ? "bg-emerald-500" :
                    campaign.status === "pending_approval" || campaign.status === "pending" ? "bg-amber-500" :
                    campaign.status === "draft" ? "bg-slate-500" :
                    campaign.status === "completed" ? "bg-blue-500" :
                    campaign.status === "paused" ? "bg-orange-500" : "bg-slate-500"
                  }`}>
                    {campaign.status?.replace("_", " ")}
                  </Badge>
                  {campaign.source === "campaign" && (
                    <Badge className="absolute top-3 left-3 bg-violet-600">AI Campaign</Badge>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-1 truncate">{campaign.name}</h3>
                  
                  {/* Screen Info */}
                  {campaign.screen_names?.length > 0 && (
                    <div className="flex items-center gap-1 text-sm text-slate-500 mb-2">
                      <MonitorPlay className="w-3 h-3" />
                      <span className="truncate">
                        {campaign.screen_names.length === 1 
                          ? campaign.screen_names[0] 
                          : `${campaign.screen_names.length} screens`
                        }
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1 text-sm text-slate-500 mb-3">
                    <Calendar className="w-3 h-3" />
                    {campaign.start_date} - {campaign.end_date}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="font-bold text-violet-600">
                      AED {(campaign.total_cost || campaign.budget || 0).toLocaleString()}
                    </span>
                    <div className="flex gap-2">
                      {(campaign.status === "active" || campaign.status === "paused") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => campaign.status === "active" ? handlePause(campaign) : handleResume(campaign)}
                        >
                          {campaign.status === "active" ? "Pause" : "Resume"}
                        </Button>
                      )}
                      <Button size="sm" onClick={() => handleViewCampaign(campaign)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}