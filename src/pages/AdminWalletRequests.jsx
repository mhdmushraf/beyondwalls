import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  ExternalLink,
  Loader2,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { NotificationService } from "@/components/notifications/NotificationService";

export default function AdminWalletRequests() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl("AdminWalletRequests"));
        return;
      }
      const userData = await base44.auth.me();
      const isAdmin = userData?.user_role === "admin" || userData?.role === "admin";
      if (!isAdmin) {
        window.location.href = createPageUrl("Dashboard");
        return;
      }
      setUser(userData);
    } catch (e) {
      base44.auth.redirectToLogin(createPageUrl("AdminWalletRequests"));
    }
  };

  const { data: requests = [], refetch } = useQuery({
    queryKey: ["wallet-requests-admin"],
    queryFn: () => base44.entities.WalletRequest.list("-created_date")
  });

  const { data: users = [] } = useQuery({
    queryKey: ["all-users"],
    queryFn: () => base44.entities.User.list()
  });

  const pendingRequests = requests.filter(r => r.status === "pending");
  const approvedRequests = requests.filter(r => r.status === "approved");
  const rejectedRequests = requests.filter(r => r.status === "rejected");

  const pendingTopUps = pendingRequests.filter(r => r.request_type === "top_up");
  const pendingWithdrawals = pendingRequests.filter(r => r.request_type === "withdrawal");

  const handleApprove = async () => {
    if (!selectedRequest) return;
    setProcessing(true);

    try {
      // Get user data
      const targetUser = users.find(u => u.email === selectedRequest.user_id);
      
      if (selectedRequest.request_type === "top_up") {
        // Add funds to user wallet
        const currentBalance = targetUser?.wallet_balance || 0;
        const newBalance = currentBalance + selectedRequest.amount;

        // Update user wallet balance
        await base44.entities.User.update(selectedRequest.user_id, {
          wallet_balance: newBalance
        });

        // Create transaction record
        await base44.entities.Transaction.create({
          user_id: selectedRequest.user_id,
          type: "top_up",
          amount: selectedRequest.amount,
          balance_after: newBalance,
          description: "Wallet top-up (Admin approved)",
          status: "completed",
          payment_method: "bank_transfer"
        });

        // Update the request status
        await base44.entities.WalletRequest.update(selectedRequest.id, {
          status: "approved",
          admin_notes: adminNotes,
          processed_by: user.email,
          processed_at: new Date().toISOString()
        });

        toast.success("Top-up approved successfully!");
      } else {
        // Withdrawal - Create transaction record
        const currentBalance = targetUser?.wallet_balance || 0;
        const newBalance = Math.max(0, currentBalance - selectedRequest.amount);

        // Update user wallet balance
        await base44.entities.User.update(selectedRequest.user_id, {
          wallet_balance: newBalance
        });

        // Create transaction record
        await base44.entities.Transaction.create({
          user_id: selectedRequest.user_id,
          type: "withdrawal",
          amount: selectedRequest.amount,
          balance_after: newBalance,
          description: "Withdrawal (Admin approved)",
          status: "completed",
          payment_method: "bank_transfer"
        });

        // Update the request status
        await base44.entities.WalletRequest.update(selectedRequest.id, {
          status: "approved",
          admin_notes: adminNotes || "Withdrawal approved",
          processed_by: user.email,
          processed_at: new Date().toISOString()
        });

        toast.success("Withdrawal approved successfully!");
      }

      refetch();
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      setShowDialog(false);
      setSelectedRequest(null);
      setAdminNotes("");
    } catch (error) {
      console.error("Approval error:", error);
      toast.error(error.message || "Failed to process request");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    if (!adminNotes.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setProcessing(true);

    try {
      await base44.entities.WalletRequest.update(selectedRequest.id, {
        status: "rejected",
        admin_notes: adminNotes,
        processed_by: user.email,
        processed_at: new Date().toISOString()
      });

      // Send rejection email
      try {
        await base44.integrations.Core.SendEmail({
          to: selectedRequest.user_id,
          subject: `❌ ${selectedRequest.request_type === "top_up" ? "Top-up" : "Withdrawal"} Request Rejected | BeyondWalls`,
          body: `
Dear ${selectedRequest.user_name || "Valued Customer"},

We regret to inform you that your ${selectedRequest.request_type === "top_up" ? "top-up" : "withdrawal"} request has been rejected.

Amount: AED ${selectedRequest.amount.toLocaleString()}
Reason: ${adminNotes}

If you have any questions, please contact our support team.

Best regards,
BeyondWalls Team
          `.trim()
        });
      } catch (e) {
        console.log("Email failed");
      }

      toast.success("Request rejected");
      refetch();
      setShowDialog(false);
      setSelectedRequest(null);
      setAdminNotes("");
    } catch (error) {
      toast.error("Failed to reject request");
    } finally {
      setProcessing(false);
    }
  };

  const openReviewDialog = (request) => {
    setSelectedRequest(request);
    setAdminNotes("");
    setShowDialog(true);
  };

  const filteredRequests = (list) => list.filter(r =>
    r.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.user_id?.toLowerCase().includes(search.toLowerCase())
  );

  if (!user) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Wallet Requests</h1>
        <p className="text-slate-500">Review and process top-up and withdrawal requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-amber-700">Pending Requests</p>
                <p className="text-2xl font-bold text-amber-800">{pendingRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Pending Top-ups</p>
                <p className="text-2xl font-bold text-slate-900">{pendingTopUps.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Pending Withdrawals</p>
                <p className="text-2xl font-bold text-slate-900">{pendingWithdrawals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Approved</p>
                <p className="text-2xl font-bold text-slate-900">{approvedRequests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <RequestsTable 
            requests={filteredRequests(pendingRequests)} 
            onReview={openReviewDialog}
            showActions
          />
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <RequestsTable requests={filteredRequests(approvedRequests)} />
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <RequestsTable requests={filteredRequests(rejectedRequests)} />
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Request</DialogTitle>
            <DialogDescription>Review and approve or reject wallet requests</DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">Type</span>
                  <Badge className={selectedRequest.request_type === "top_up" ? "bg-emerald-100 text-emerald-700" : "bg-violet-100 text-violet-700"}>
                    {selectedRequest.request_type === "top_up" ? "Top-up" : "Withdrawal"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">User</span>
                  <span className="font-medium">{selectedRequest.user_name || selectedRequest.user_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount</span>
                  <span className="font-bold text-lg">AED {selectedRequest.amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date</span>
                  <span>{selectedRequest.request_date && format(new Date(selectedRequest.request_date), "PPP")}</span>
                </div>
              </div>

              {selectedRequest.receipt_url && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-700">Bank Transfer Receipt</span>
                    </div>
                    <a href={selectedRequest.receipt_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </a>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-slate-700">Admin Notes</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes (required for rejection)"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing}
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </>
              )}
            </Button>
            <Button
              onClick={handleApprove}
              disabled={processing}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Approve
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RequestsTable({ requests, onReview, showActions }) {
  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No requests found</p>
        </CardContent>
      </Card>
    );
  }

  const statusColors = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-rose-100 text-rose-700"
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-slate-500">Date</th>
                <th className="text-left p-4 text-sm font-medium text-slate-500">User</th>
                <th className="text-left p-4 text-sm font-medium text-slate-500">Type</th>
                <th className="text-right p-4 text-sm font-medium text-slate-500">Amount</th>
                <th className="text-center p-4 text-sm font-medium text-slate-500">Receipt</th>
                <th className="text-left p-4 text-sm font-medium text-slate-500">Status</th>
                {showActions && <th className="text-right p-4 text-sm font-medium text-slate-500">Action</th>}
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-b hover:bg-slate-50">
                  <td className="p-4 text-sm text-slate-500">
                    {req.request_date && format(new Date(req.request_date), "MMM d, yyyy")}
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-slate-900">{req.user_name || "—"}</p>
                    <p className="text-sm text-slate-500">{req.user_id}</p>
                  </td>
                  <td className="p-4">
                    <Badge className={req.request_type === "top_up" ? "bg-emerald-100 text-emerald-700" : "bg-violet-100 text-violet-700"}>
                      {req.request_type === "top_up" ? "Top-up" : "Withdrawal"}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-semibold">AED {req.amount?.toLocaleString()}</span>
                  </td>
                  <td className="p-4 text-center">
                    {req.receipt_url ? (
                      <a href={req.receipt_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <Badge className={statusColors[req.status]}>
                      {req.status}
                    </Badge>
                  </td>
                  {showActions && (
                    <td className="p-4 text-right">
                      <Button size="sm" onClick={() => onReview(req)}>
                        Review
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}