import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Users, CheckCircle2, XCircle, Search, Loader2, Eye } from "lucide-react";
import { EmailTemplates } from "@/components/notifications/EmailTemplates";

export default function AdminUserApprovals() {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadUsers();
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    if (id) {
      base44.entities.User.filter({ id }).then(u => { if (u[0]) setSelected(u[0]); });
    }
  }, []);

  const loadUsers = async () => {
    const all = await base44.entities.User.list("-created_date");
    const complete = all.filter(u => u.profile_complete);
    // Deduplicate by email, keeping the most recently created record
    const seen = new Set();
    const deduped = complete.filter(u => {
      if (!u.email || seen.has(u.email)) return false;
      seen.add(u.email);
      return true;
    });
    setUsers(deduped);
    setLoading(false);
  };

  const handleApprove = async (u) => {
    setActionLoading(true);
    try {
      await base44.entities.User.update(u.id, { approval_status: "approved" });
      await base44.entities.Notification.create({
        recipient_email: u.email,
        type: "account_approved",
        title: "Account Approved!",
        message: "Your BeyondWalls account has been approved. You can now start using the platform.",
      });
      await base44.integrations.Core.SendEmail({
        to: u.email,
        subject: "🎉 Account Approved - Welcome to BeyondWalls!",
        body: EmailTemplates.accountApproved(u.full_name, u.user_role),
      });
      toast.success("User approved!", { description: `Email sent to ${u.email}`, duration: 3000 });
      setSelected(null);
      loadUsers();
    } catch (err) {
      toast.error("Something went wrong");
    }
    setActionLoading(false);
  };

  const handleReject = async (u) => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setActionLoading(true);
    try {
      await base44.entities.User.update(u.id, { approval_status: "rejected", rejection_reason: rejectionReason });
      await base44.entities.Notification.create({
        recipient_email: u.email,
        type: "account_rejected",
        title: "Account Application Update",
        message: `Your account application was not approved. Reason: ${rejectionReason}`,
      });
      await base44.integrations.Core.SendEmail({
        to: u.email,
        subject: "Account Application Update - BeyondWalls",
        body: EmailTemplates.accountRejected(u.full_name, rejectionReason),
      });
      toast.success("User rejected", { description: `Email sent to ${u.email}`, duration: 3000 });
      setSelected(null);
      setRejectionReason("");
      loadUsers();
    } catch (err) {
      toast.error("Something went wrong");
    }
    setActionLoading(false);
  };

  const pending = users.filter(u => u.approval_status === "pending" && u.email?.toLowerCase().includes(search.toLowerCase()) || u.full_name?.toLowerCase().includes(search.toLowerCase()));
  const approved = users.filter(u => u.approval_status === "approved");
  const rejected = users.filter(u => u.approval_status === "rejected");

  const roleColor = { advertiser: "bg-blue-100 text-blue-700", venue_owner: "bg-violet-100 text-violet-700", admin: "bg-red-100 text-red-700" };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <SEOHead noIndex title="User Approvals | Beyond Walls" />
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">User Approvals</h1>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="text-amber-600 font-medium">{users.filter(u => u.approval_status === "pending").length} Pending</span>
            <span className="text-emerald-600 font-medium">{approved.length} Approved</span>
            <span className="text-red-600 font-medium">{rejected.length} Rejected</span>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input className="pl-9" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* User Detail — bottom sheet on mobile, inline card on desktop */}
        {selected && (
          <div className="fixed inset-0 z-50 bg-black/50 lg:static lg:bg-transparent lg:z-auto" onClick={(e) => { if (e.target === e.currentTarget) { setSelected(null); setRejectionReason(""); } }}>
            <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto lg:static lg:max-h-none lg:mb-6 rounded-t-2xl lg:rounded-xl">
          <Card className="border-2 border-violet-200 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Review: {selected.full_name}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => { setSelected(null); setRejectionReason(""); }}>✕</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2 text-sm">
                  <div><span className="text-slate-500">Email:</span> <span className="font-medium break-all">{selected.email}</span></div>
                  <div><span className="text-slate-500">Role:</span> <Badge className={roleColor[selected.user_role] || ""}>{selected.user_role}</Badge></div>
                  <div><span className="text-slate-500">Company:</span> <span className="font-medium">{selected.company_name || "N/A"}</span></div>
                  <div><span className="text-slate-500">Phone:</span> <span className="font-medium">{selected.phone || "N/A"}</span></div>
                  <div><span className="text-slate-500">City:</span> <span className="font-medium">{selected.city || "N/A"}</span></div>
                  <div><span className="text-slate-500">Joined:</span> <span className="font-medium">{new Date(selected.created_date).toLocaleDateString()}</span></div>
                </div>
                <div className="space-y-3">
                  {selected.trade_license_url && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Trade License</p>
                      <a href={selected.trade_license_url} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="outline" className="text-xs"><Eye className="w-3 h-3 mr-1" />View Document</Button>
                      </a>
                    </div>
                  )}
                  {selected.emirates_id_url && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Emirates ID</p>
                      <a href={selected.emirates_id_url} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="outline" className="text-xs"><Eye className="w-3 h-3 mr-1" />View Document</Button>
                      </a>
                    </div>
                  )}
                </div>
              </div>
              {selected.approval_status === "pending" && (
                <div className="space-y-3 border-t pt-4">
                  <Input placeholder="Rejection reason (required if rejecting)..." value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} />
                  <div className="flex gap-3">
                    <Button onClick={() => handleReject(selected)} disabled={actionLoading} variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50">
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><XCircle className="w-4 h-4 mr-1" />Reject</>}
                    </Button>
                    <Button onClick={() => handleApprove(selected)} disabled={actionLoading} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-1" />Approve</>}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
            </div>
          </div>
        )}

        {/* Users List */}
        {loading ? <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" /></div> : (
          <div className="space-y-2">
            {users.filter(u => {
              const q = search.toLowerCase();
              return u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
            }).map(u => (
              <Card key={u.id} className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => setSelected(u)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-violet-600">
                        {u.full_name?.charAt(0) || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 text-sm truncate">{u.full_name}</p>
                        <p className="text-xs text-slate-500 truncate">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2 flex-shrink-0">
                      <Badge className={roleColor[u.user_role] || "bg-slate-100 text-slate-600"}>{u.user_role}</Badge>
                      <Badge className={u.approval_status === "approved" ? "bg-emerald-100 text-emerald-700" : u.approval_status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}>
                        {u.approval_status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}