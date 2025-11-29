import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Search,
  Users,
  Shield,
  Mail,
  Phone,
  Building2,
  Megaphone,
  CheckCircle2,
  Clock,
  XCircle,
  Wallet,
  Plus,
  Loader2,
  Settings,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [walletAmount, setWalletAmount] = useState("");
  const [walletLoading, setWalletLoading] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [adminForm, setAdminForm] = useState({
    permissions: []
  });
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl("AdminUsers"));
        return;
      }
      const userData = await base44.auth.me();
      const isAdmin = userData?.user_role === "admin" || userData?.role === "admin";
      if (!isAdmin) {
        window.location.href = createPageUrl("Dashboard");
        return;
      }
      setAuthChecked(true);
    } catch (e) {
      base44.auth.redirectToLogin(createPageUrl("AdminUsers"));
    }
  };

  const availablePermissions = [
    { value: "all", label: "Full Access", description: "Access to all admin features" },
    { value: "dashboard", label: "Dashboard", description: "View admin dashboard" },
    { value: "users", label: "Users", description: "Manage users and approvals" },
    { value: "bookings", label: "Bookings", description: "Manage ad bookings and campaigns" },
    { value: "venues", label: "Venues", description: "Manage venues" },
    { value: "screens", label: "Screens", description: "Manage screens" },
    { value: "wallet", label: "Wallet", description: "Manage wallets and transactions" },
    { value: "pricing", label: "Pricing", description: "Manage dynamic pricing" },
    { value: "blog", label: "Blog", description: "Manage blog posts" },
    { value: "crm", label: "CRM", description: "Access CRM and leads" }
  ];

  const handleOpenAdminDialog = (user = null) => {
    setSelectedUser(user);
    setAdminForm({
      permissions: user?.admin_permissions || []
    });
    setShowAdminDialog(true);
  };

  const handleSaveAdminPermissions = async () => {
    if (!selectedUser) return;
    setWalletLoading(true);
    try {
      await base44.entities.User.update(selectedUser.id, {
        role: "admin",
        user_role: "admin",
        admin_permissions: adminForm.permissions
      });
      toast.success("Admin permissions updated");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setShowAdminDialog(false);
    } catch (error) {
      toast.error("Failed to update permissions");
    }
    setWalletLoading(false);
  };

  const togglePermission = (perm) => {
    if (perm === "all") {
      setAdminForm({ permissions: adminForm.permissions.includes("all") ? [] : ["all"] });
    } else {
      const newPerms = adminForm.permissions.filter(p => p !== "all");
      if (newPerms.includes(perm)) {
        setAdminForm({ permissions: newPerms.filter(p => p !== perm) });
      } else {
        setAdminForm({ permissions: [...newPerms, perm] });
      }
    }
  };

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => base44.entities.User.list("-created_date"),
    enabled: authChecked
  });

  if (!authChecked) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Checking permissions...</p>
        </div>
      </div>
    );
  }

  const handleAddWallet = (user) => {
    setSelectedUser(user);
    setWalletAmount("");
    setShowWalletDialog(true);
  };

  const handleWalletSubmit = async () => {
    const amount = parseFloat(walletAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setWalletLoading(true);
    try {
      const newBalance = (selectedUser.wallet_balance || 0) + amount;
      await base44.entities.User.update(selectedUser.id, {
        wallet_balance: newBalance
      });

      await base44.entities.Transaction.create({
        user_id: selectedUser.email,
        type: "top_up",
        amount: amount,
        balance_after: newBalance,
        description: "Admin wallet top-up",
        status: "completed",
        payment_method: "bank_transfer"
      });

      toast.success(`Added AED ${amount.toLocaleString()} to ${selectedUser.full_name}'s wallet`);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setShowWalletDialog(false);
    } catch (error) {
      toast.error("Failed to add wallet balance");
    } finally {
      setWalletLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                         user.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || user.user_role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleColors = {
    advertiser: "bg-violet-100 text-violet-700",
    venue_owner: "bg-indigo-100 text-indigo-700",
    admin: "bg-rose-100 text-rose-700"
  };

  const verificationColors = {
    verified: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    rejected: "bg-red-100 text-red-700"
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-1">View and manage platform users</p>
        </div>
        <Button 
          onClick={() => handleOpenAdminDialog(null)}
          className="bg-gradient-to-r from-violet-600 to-indigo-600"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Create Admin
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs sm:text-sm">Total Users</p>
                <p className="text-xl sm:text-3xl font-bold text-slate-900">{users.length}</p>
              </div>
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs sm:text-sm">Advertisers</p>
                <p className="text-xl sm:text-3xl font-bold text-violet-600">
                  {users.filter(u => u.user_role === "advertiser").length}
                </p>
              </div>
              <Megaphone className="w-6 h-6 sm:w-8 sm:h-8 text-violet-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs sm:text-sm">Venue Owners</p>
                <p className="text-xl sm:text-3xl font-bold text-indigo-600">
                  {users.filter(u => u.user_role === "venue_owner").length}
                </p>
              </div>
              <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs sm:text-sm">Pending</p>
                <p className="text-xl sm:text-3xl font-bold text-amber-600">
                  {users.filter(u => u.verification_status === "pending").length}
                </p>
              </div>
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-amber-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 sm:pl-10"
          />
        </div>
        <Tabs value={roleFilter} onValueChange={setRoleFilter} className="w-full overflow-x-auto">
          <TabsList className="w-full sm:w-auto justify-start">
            <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
            <TabsTrigger value="advertiser" className="text-xs sm:text-sm">Advertisers</TabsTrigger>
            <TabsTrigger value="venue_owner" className="text-xs sm:text-sm">Venues</TabsTrigger>
            <TabsTrigger value="admin" className="text-xs sm:text-sm">Admins</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-slate-600">User</th>
                  <th className="text-left p-4 font-medium text-slate-600">Contact</th>
                  <th className="text-left p-4 font-medium text-slate-600">Account Type</th>
                  <th className="text-left p-4 font-medium text-slate-600">Role</th>
                  <th className="text-left p-4 font-medium text-slate-600">Verification</th>
                  <th className="text-left p-4 font-medium text-slate-600">Wallet</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">Loading...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">No users found</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white">
                              {user.full_name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-900">{user.full_name}</p>
                            <p className="text-sm text-slate-500">
                              {user.created_date && format(new Date(user.created_date), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                            <Phone className="w-4 h-4" />
                            {user.phone}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-900 capitalize">{user.account_type || "Individual"}</p>
                        {user.company_name && (
                          <p className="text-xs text-slate-500">{user.company_name}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge className={roleColors[user.user_role] || roleColors.advertiser}>
                          {user.user_role === "venue_owner" ? (
                            <><Building2 className="w-3 h-3 mr-1" /> Venue Owner</>
                          ) : user.user_role === "admin" ? (
                            <><Shield className="w-3 h-3 mr-1" /> Admin</>
                          ) : (
                            <><Megaphone className="w-3 h-3 mr-1" /> Advertiser</>
                          )}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={verificationColors[user.verification_status] || verificationColors.pending}>
                          {user.verification_status === "verified" ? (
                            <><CheckCircle2 className="w-3 h-3 mr-1" /> Verified</>
                          ) : user.verification_status === "rejected" ? (
                            <><XCircle className="w-3 h-3 mr-1" /> Rejected</>
                          ) : (
                            <><Clock className="w-3 h-3 mr-1" /> Pending</>
                          )}
                        </Badge>
                      </td>
                      <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                  <p className="font-medium text-slate-900">
                                                    AED {user.wallet_balance?.toLocaleString() || 0}
                                                  </p>
                                                  <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => handleAddWallet(user)}
                                                    className="h-7 px-2"
                                                  >
                                                    <Plus className="w-3 h-3 mr-1" />
                                                    Add
                                                  </Button>
                                                  {(user.user_role === "admin" || user.role === "admin") && (
                                                    <Button 
                                                      variant="outline" 
                                                      size="sm"
                                                      onClick={() => handleOpenAdminDialog(user)}
                                                      className="h-7 px-2"
                                                    >
                                                      <Settings className="w-3 h-3" />
                                                    </Button>
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

      {/* Add Wallet Dialog */}
      <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-violet-600" />
              Add Wallet Balance
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Avatar>
                <AvatarImage src={selectedUser?.avatar_url} />
                <AvatarFallback className="bg-violet-500 text-white">
                  {selectedUser?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedUser?.full_name}</p>
                <p className="text-sm text-slate-500">
                  Current: AED {selectedUser?.wallet_balance?.toLocaleString() || 0}
                </p>
              </div>
            </div>
            <div>
              <Label>Amount to Add (AED)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={walletAmount}
                onChange={(e) => setWalletAmount(e.target.value)}
                min="1"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWalletDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleWalletSubmit}
              disabled={walletLoading || !walletAmount}
              className="bg-gradient-to-r from-violet-600 to-indigo-600"
            >
              {walletLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...</>
              ) : (
                <><Plus className="w-4 h-4 mr-2" /> Add Balance</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Permissions Dialog */}
      <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-violet-600" />
              {selectedUser ? "Edit Admin Permissions" : "Create Admin User"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedUser && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <Avatar>
                  <AvatarImage src={selectedUser?.avatar_url} />
                  <AvatarFallback className="bg-violet-500 text-white">
                    {selectedUser?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedUser?.full_name}</p>
                  <p className="text-sm text-slate-500">{selectedUser?.email}</p>
                </div>
              </div>
            )}

            <div>
              <Label className="mb-3 block">Permissions</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availablePermissions.map((perm) => (
                  <label
                    key={perm.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      adminForm.permissions.includes(perm.value) || (perm.value !== "all" && adminForm.permissions.includes("all"))
                        ? "border-violet-500 bg-violet-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={adminForm.permissions.includes(perm.value) || (perm.value !== "all" && adminForm.permissions.includes("all"))}
                      onChange={() => togglePermission(perm.value)}
                      disabled={perm.value !== "all" && adminForm.permissions.includes("all")}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-slate-900">{perm.label}</p>
                      <p className="text-xs text-slate-500">{perm.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdminDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveAdminPermissions}
              disabled={walletLoading || adminForm.permissions.length === 0}
              className="bg-gradient-to-r from-violet-600 to-indigo-600"
            >
              {walletLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                <><Shield className="w-4 h-4 mr-2" /> Save Permissions</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}