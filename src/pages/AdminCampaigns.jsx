import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  Megaphone,
  Calendar,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AdminCampaigns() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending_approval");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const { data: campaigns = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-campaigns"],
    queryFn: () => base44.entities.Campaign.list("-created_date")
  });

  const { data: screens = [] } = useQuery({
    queryKey: ["all-screens"],
    queryFn: () => base44.entities.Screen.list()
  });

  const { data: users = [] } = useQuery({
    queryKey: ["all-users"],
    queryFn: () => base44.entities.User.list()
  });

  const getScreenNames = (screenIds) => {
    if (!screenIds || screenIds.length === 0) return "—";
    return screenIds.map(id => screens.find(s => s.id === id)?.name || id).join(", ");
  };

  const getAdvertiserName = (email) => {
    const user = users.find(u => u.email === email);
    return user?.full_name || email;
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Campaign.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      toast.success("Campaign updated successfully");
    }
  });

  const handleApprove = async (campaign) => {
    updateMutation.mutate({
      id: campaign.id,
      data: { status: "approved" }
    });
  };

  const handleReject = async () => {
    if (!selectedCampaign) return;
    updateMutation.mutate({
      id: selectedCampaign.id,
      data: { status: "rejected", rejection_reason: rejectionReason }
    });
    setShowRejectDialog(false);
    setRejectionReason("");
    setSelectedCampaign(null);
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name?.toLowerCase().includes(search.toLowerCase()) ||
                         campaign.advertiser_id?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    draft: "bg-slate-100 text-slate-700",
    pending_approval: "bg-amber-100 text-amber-700",
    approved: "bg-blue-100 text-blue-700",
    rejected: "bg-red-100 text-red-700",
    active: "bg-emerald-100 text-emerald-700",
    paused: "bg-orange-100 text-orange-700",
    completed: "bg-violet-100 text-violet-700"
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Campaign Management</h1>
        <p className="text-slate-500 mt-1">Review and manage advertising campaigns</p>
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
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending_approval">Pending</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-slate-600">Campaign</th>
                  <th className="text-left p-4 font-medium text-slate-600">Advertiser</th>
                  <th className="text-left p-4 font-medium text-slate-600">Duration</th>
                  <th className="text-left p-4 font-medium text-slate-600">Budget</th>
                  <th className="text-left p-4 font-medium text-slate-600">Status</th>
                  <th className="text-left p-4 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">Loading...</td>
                  </tr>
                ) : filteredCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">No campaigns found</td>
                  </tr>
                ) : (
                  filteredCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {campaign.creative_url ? (
                            <img 
                              src={campaign.creative_url} 
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                              <Megaphone className="w-6 h-6 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-slate-900">{campaign.name}</p>
                            <p className="text-sm text-slate-500 truncate max-w-[200px]" title={getScreenNames(campaign.screen_ids)}>
                              {getScreenNames(campaign.screen_ids)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{getAdvertiserName(campaign.advertiser_id)}</p>
                          <p className="text-xs text-slate-500">{campaign.advertiser_id}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-900">
                          {campaign.start_date && format(new Date(campaign.start_date), "MMM d")} - 
                          {campaign.end_date && format(new Date(campaign.end_date), "MMM d")}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-slate-900">AED {campaign.total_cost || 0}</p>
                      </td>
                      <td className="p-4">
                        <Badge className={statusColors[campaign.status]}>
                          {campaign.status?.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => setSelectedCampaign(campaign)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {campaign.status === "pending_approval" && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                onClick={() => handleApprove(campaign)}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                onClick={() => {
                                  setSelectedCampaign(campaign);
                                  setShowRejectDialog(true);
                                }}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Details Dialog */}
      <Dialog open={!!selectedCampaign && !showRejectDialog} onOpenChange={() => setSelectedCampaign(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Campaign Details</DialogTitle>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-500">Campaign Name</Label>
                  <p className="font-medium">{selectedCampaign.name}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Advertiser</Label>
                  <p className="font-medium">{getAdvertiserName(selectedCampaign.advertiser_id)}</p>
                  <p className="text-sm text-slate-500">{selectedCampaign.advertiser_id}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Duration</Label>
                  <p className="font-medium">
                    {selectedCampaign.start_date && format(new Date(selectedCampaign.start_date), "MMM d, yyyy")} - 
                    {selectedCampaign.end_date && format(new Date(selectedCampaign.end_date), "MMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-500">Budget</Label>
                  <p className="font-medium">AED {selectedCampaign.total_cost}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Screens</Label>
                  <p className="font-medium">{getScreenNames(selectedCampaign.screen_ids)}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Time Slots</Label>
                  <p className="font-medium">{selectedCampaign.time_slots?.join(", ") || "—"}</p>
                </div>
              </div>
              {selectedCampaign.creative_url && (
                <div>
                  <Label className="text-slate-500">Creative Preview</Label>
                  {selectedCampaign.creative_type === "video" ? (
                    <video 
                      src={selectedCampaign.creative_url} 
                      controls 
                      className="w-full aspect-video rounded-lg mt-2"
                    />
                  ) : (
                    <img 
                      src={selectedCampaign.creative_url} 
                      alt="Creative"
                      className="w-full aspect-video object-cover rounded-lg mt-2"
                    />
                  )}
                </div>
              )}
              {selectedCampaign.status === "pending_approval" && (
                <DialogFooter>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowRejectDialog(true);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      handleApprove(selectedCampaign);
                      setSelectedCampaign(null);
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Campaign</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this campaign
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}