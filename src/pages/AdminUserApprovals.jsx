import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  XCircle,
  Eye,
  User,
  Building2,
  FileText,
  Mail,
  Phone,
  Clock,
  Search,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import DocumentPreview from "@/components/DocumentPreview";
import { NotificationService } from "@/components/notifications/NotificationService";

export default function AdminUserApprovals() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["pending-users"],
    queryFn: () => base44.entities.User.list("-created_date")
  });

  const pendingUsers = users.filter(u => u.approval_status === "pending");
  const approvedUsers = users.filter(u => u.approval_status === "approved");
  const rejectedUsers = users.filter(u => u.approval_status === "rejected");

  const approveMutation = useMutation({
    mutationFn: async (userId) => {
      const user = users.find(u => u.id === userId);
      
      await base44.entities.User.update(userId, {
        approval_status: "approved",
        approved_at: new Date().toISOString()
      });
      
      // Create user notification
      if (user) {
        await base44.entities.UserNotification.create({
          user_id: user.email,
          type: "account_approved",
          title: "Account Approved! 🎉",
          message: "Your BeyondWalls account has been approved. You can now access all features.",
          action_url: "/Dashboard",
          is_read: false,
          email_sent: true
        });

        // Send approval email
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: "✅ Your BeyondWalls Account is Approved!",
          body: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        BEYONDWALLS
   Account Approved!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dear ${user.full_name},

Great news! Your BeyondWalls account has been approved and is now active.

🎉 YOU'RE ALL SET!
━━━━━━━━━━━━━━━━━━━━━━━━━
You can now log in to your dashboard and start using the platform.

${user.user_role === "advertiser" ? `
📱 NEXT STEPS FOR ADVERTISERS
━━━━━━━━━━━━━━━━━━━━━━━━━
1. Browse 500+ premium screens across UAE
2. Top up your wallet
3. Create your first ad campaign
4. Track performance in real-time
` : `
💰 NEXT STEPS FOR VENUE OWNERS
━━━━━━━━━━━━━━━━━━━━━━━━━
1. Add your venue details
2. Register your screens
3. Start earning 70% revenue share
4. Track earnings in your dashboard
`}

🚀 Let's get started: www.beyondwalls.ae

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Questions? Contact us at info@beyondwalls.ae
Phone: +971 55 614 0067

BeyondWalls - Advertise Beyond Boundaries
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          `.trim()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["pending-users"]);
      toast.success("User approved successfully");
      setSelectedUser(null);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ userId, reason }) => {
      const user = users.find(u => u.id === userId);
      
      await base44.entities.User.update(userId, {
        approval_status: "rejected",
        rejection_reason: reason
      });
      
      if (user) {
        // Create user notification
        await base44.entities.UserNotification.create({
          user_id: user.email,
          type: "account_rejected",
          title: "Account Application Update",
          message: `Your account application was not approved. Reason: ${reason}`,
          is_read: false,
          email_sent: true
        });

        // Send rejection email
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: "BeyondWalls Account Application Update",
          body: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        BEYONDWALLS
   Account Application Update
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dear ${user.full_name},

We have reviewed your BeyondWalls account application.

Unfortunately, we are unable to approve your account at this time.

📋 REASON
━━━━━━━━━━━━━━━━━━━━━━━━━
${reason}

💡 WHAT YOU CAN DO
━━━━━━━━━━━━━━━━━━━━━━━━━
If you believe this is an error or would like to reapply with updated information, please contact our support team.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Contact Support: info@beyondwalls.ae
Phone: +971 55 614 0067

BeyondWalls - Advertise Beyond Boundaries
www.beyondwalls.ae
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          `.trim()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["pending-users"]);
      toast.success("User rejected");
      setShowRejectDialog(false);
      setSelectedUser(null);
      setRejectReason("");
    }
  });

  const filteredPending = pendingUsers.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const UserCard = ({ user, showActions = false }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{user.full_name}</h3>
              <p className="text-sm text-slate-500">{user.email}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="outline" className="capitalize">
                  {user.account_type || "Individual"}
                </Badge>
                <Badge variant="secondary" className="capitalize">
                  {user.user_role?.replace("_", " ") || "Advertiser"}
                </Badge>
              </div>
            </div>
          </div>
          {showActions && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedUser(user)}>
                <Eye className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => approveMutation.mutate(user.id)}
              >
                <CheckCircle2 className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => {
                  setSelectedUser(user);
                  setShowRejectDialog(true);
                }}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">User Approvals</h1>
          <p className="text-slate-500">Review and approve new user registrations</p>
        </div>
        <Badge className="bg-amber-100 text-amber-800 text-lg px-4 py-2">
          {pendingUsers.length} Pending
        </Badge>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search users..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingUsers.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedUsers.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedUsers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="grid gap-4">
            {filteredPending.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <p className="text-slate-600">No pending approvals</p>
                </CardContent>
              </Card>
            ) : (
              filteredPending.map((user) => (
                <UserCard key={user.id} user={user} showActions />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <div className="grid gap-4">
            {approvedUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <div className="grid gap-4">
            {rejectedUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser && !showRejectDialog} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Full Name</p>
                  <p className="font-medium">{selectedUser.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Phone</p>
                  <p className="font-medium">{selectedUser.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Account Type</p>
                  <p className="font-medium capitalize">{selectedUser.account_type || "Individual"}</p>
                </div>
                {selectedUser.company_name && (
                  <div>
                    <p className="text-sm text-slate-500">Company Name</p>
                    <p className="font-medium">{selectedUser.company_name}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-slate-500">User Role</p>
                  <p className="font-medium capitalize">{selectedUser.user_role?.replace("_", " ")}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {selectedUser.emirates_id_url && (
                  <DocumentPreview url={selectedUser.emirates_id_url} title="Emirates ID" />
                )}
                {selectedUser.trade_license_url && (
                  <DocumentPreview url={selectedUser.trade_license_url} title="Trade License" />
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>Close</Button>
            <Button 
              variant="destructive"
              onClick={() => setShowRejectDialog(true)}
            >
              Reject
            </Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => approveMutation.mutate(selectedUser.id)}
            >
              Approve User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject User</DialogTitle>
          </DialogHeader>
          <div>
            <p className="text-slate-600 mb-4">
              Please provide a reason for rejecting {selectedUser?.full_name}'s application:
            </p>
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
            <Button 
              variant="destructive"
              disabled={!rejectReason.trim()}
              onClick={() => rejectMutation.mutate({ userId: selectedUser.id, reason: rejectReason })}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}