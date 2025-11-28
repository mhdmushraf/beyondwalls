import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ScanLine,
  BarChart3,
  MoreVertical,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import moment from "moment";

const STATUS_CONFIG = {
  draft: { label: "Draft", color: "slate" },
  pending_review: { label: "Pending Review", color: "amber" },
  active: { label: "Active", color: "emerald" },
  paused: { label: "Paused", color: "orange" },
  completed: { label: "Completed", color: "blue" },
  rejected: { label: "Rejected", color: "red" }
};

export default function AdminARCampaigns() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const queryClient = useQueryClient();

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
    queryKey: ["admin-ar-campaigns"],
    queryFn: () => base44.entities.ARCampaign.list("-created_date"),
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ["admin-ar-subscriptions"],
    queryFn: () => base44.entities.ARSubscription.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ARCampaign.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ar-campaigns"] });
      toast.success("Campaign updated");
    }
  });

  const handleApprove = async (campaign) => {
    await updateMutation.mutateAsync({
      id: campaign.id,
      data: { status: "active", model_status: "approved" }
    });

    // Send notification email
    await base44.integrations.Core.SendEmail({
      to: campaign.advertiser_id,
      subject: "🎉 Your AR Campaign is Now Live!",
      body: `Great news! Your AR campaign "${campaign.name}" has been approved and is now live.\n\nView your campaign dashboard to track performance.`
    });
  };

  const handleReject = async () => {
    if (!selectedCampaign) return;
    
    await updateMutation.mutateAsync({
      id: selectedCampaign.id,
      data: { status: "rejected", model_status: "rejected" }
    });

    await base44.integrations.Core.SendEmail({
      to: selectedCampaign.advertiser_id,
      subject: "AR Campaign Review Update",
      body: `Your AR campaign "${selectedCampaign.name}" requires changes.\n\nReason: ${rejectReason}\n\nPlease update your campaign and resubmit.`
    });

    setShowRejectDialog(false);
    setSelectedCampaign(null);
    setRejectReason("");
  };

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = !search || 
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.advertiser_id?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: campaigns.length,
    pending: campaigns.filter(c => c.status === "pending_review").length,
    active: campaigns.filter(c => c.status === "active").length,
    subscriptions: subscriptions.filter(s => s.status === "active").length
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AR Campaigns Management</h1>
            <p className="text-slate-500">Review and manage AR premium campaigns</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Campaigns</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <Box className="w-8 h-8 text-violet-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Pending Review</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Active Campaigns</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">AR Subscribers</p>
                  <p className="text-2xl font-bold text-violet-600">{stats.subscriptions}</p>
                </div>
                <Sparkles className="w-8 h-8 text-violet-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by name or advertiser..."
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Campaigns Table */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Advertiser</TableHead>
                  <TableHead>AR Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scans</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => {
                  const status = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.draft;
                  return (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                            <Box className="w-5 h-5 text-violet-600" />
                          </div>
                          <span className="font-medium">{campaign.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">{campaign.advertiser_id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{campaign.ar_type?.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`bg-${status.color}-100 text-${status.color}-700`}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{campaign.total_scans || 0}</TableCell>
                      <TableCell className="text-slate-500">
                        {moment(campaign.created_date).format("MMM D, YYYY")}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {campaign.status === "pending_review" && (
                              <>
                                <DropdownMenuItem onClick={() => handleApprove(campaign)}>
                                  <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedCampaign(campaign);
                                    setShowRejectDialog(true);
                                  }}
                                >
                                  <XCircle className="w-4 h-4 mr-2 text-red-600" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem>
                              <BarChart3 className="w-4 h-4 mr-2" />
                              Analytics
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filteredCampaigns.length === 0 && (
              <div className="p-12 text-center">
                <Box className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No AR campaigns found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Campaign</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-slate-600 mb-4">
                Please provide a reason for rejecting "{selectedCampaign?.name}"
              </p>
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleReject}
                disabled={!rejectReason}
                className="bg-red-600 hover:bg-red-700"
              >
                Reject Campaign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}