import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  Box,
  ScanLine,
  BarChart3,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ARCampaignCard from "@/components/ar/ARCampaignCard";

export default function ARCampaigns() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

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

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["ar-campaigns", user?.email],
    queryFn: () => base44.entities.ARCampaign.filter({ advertiser_id: user?.email }, "-created_date"),
    enabled: !!user?.email,
  });

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesType = typeFilter === "all" || c.ar_type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === "active").length,
    pending: campaigns.filter(c => c.status === "pending_review").length,
    totalScans: campaigns.reduce((sum, c) => sum + (c.total_scans || 0), 0)
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AR Campaigns</h1>
            <p className="text-slate-500">Manage your augmented reality campaigns</p>
          </div>
          <Link to={createPageUrl("CreateARCampaign")}>
            <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600">
              <Plus className="w-4 h-4 mr-2" />
              New AR Campaign
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-sm text-slate-500">Total Campaigns</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
              <p className="text-sm text-slate-500">Active</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              <p className="text-sm text-slate-500">Pending Review</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-violet-600">{stats.totalScans.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Total Scans</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search campaigns..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending_review">Pending</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="AR Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="product_try_on">Try-On</SelectItem>
              <SelectItem value="room_placement">Room Placement</SelectItem>
              <SelectItem value="interactive_demo">Interactive</SelectItem>
              <SelectItem value="3d_viewer">3D Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Campaigns Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="border-0 shadow-md h-64 animate-pulse bg-slate-100" />
            ))}
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <Box className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">No campaigns found</h3>
              <p className="text-slate-500 mb-4">
                {campaigns.length === 0 
                  ? "Create your first AR campaign to get started"
                  : "Try adjusting your filters"
                }
              </p>
              {campaigns.length === 0 && (
                <Link to={createPageUrl("CreateARCampaign")}>
                  <Button className="bg-gradient-to-r from-violet-600 to-fuchsia-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Create AR Campaign
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCampaigns.map((campaign) => (
              <ARCampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}