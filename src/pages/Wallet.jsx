import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  CreditCard,
  Building2,
  TrendingUp,
  Download,
  Loader2,
  Upload,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Settings,
  PieChart
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
import { toast } from "sonner";
import { format } from "date-fns";
import TopUpModal from "@/components/wallet/TopUpModal";
import TransactionHistory from "@/components/wallet/TransactionHistory";
import PayoutSettings from "@/components/wallet/PayoutSettings";
import EarningsBreakdown from "@/components/wallet/EarningsBreakdown";

export default function Wallet() {
  const [user, setUser] = useState(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showPayoutSettings, setShowPayoutSettings] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: transactions = [], refetch } = useQuery({
    queryKey: ["wallet-transactions", user?.email],
    queryFn: () => base44.entities.Transaction.filter({ user_id: user?.email }, "-created_date"),
    enabled: !!user?.email
  });

  const { data: walletRequests = [], refetch: refetchRequests } = useQuery({
    queryKey: ["wallet-requests", user?.email],
    queryFn: () => base44.entities.WalletRequest.filter({ user_id: user?.email }, "-created_date"),
    enabled: !!user?.email
  });

  const { data: screens = [] } = useQuery({
    queryKey: ["user-screens", user?.email],
    queryFn: () => base44.entities.Screen.filter({ owner_id: user?.email }),
    enabled: !!user?.email
  });

  const { data: venues = [] } = useQuery({
    queryKey: ["user-venues", user?.email],
    queryFn: () => base44.entities.Venue.filter({ owner_id: user?.email }),
    enabled: !!user?.email
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["screen-bookings-for-wallet", user?.email],
    queryFn: async () => {
      const screenIds = screens.map(s => s.id);
      if (screenIds.length === 0) return [];
      const allBookings = await base44.entities.AdSlotBooking.list();
      return allBookings.filter(b => screenIds.includes(b.screen_id));
    },
    enabled: !!user?.email && screens.length > 0
  });

  const isVenueOwner = user?.is_venue_owner || screens.length > 0;

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl("Wallet"));
        return;
      }
      
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {
      base44.auth.redirectToLogin(createPageUrl("Wallet"));
    }
  };

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.includes("pdf") && !file.type.includes("image")) {
      toast.error("Please upload a PDF or image file");
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setReceiptUrl(file_url);
      toast.success("Receipt uploaded");
    } catch (error) {
      toast.error("Failed to upload receipt");
    } finally {
      setUploading(false);
    }
  };

  const pendingRequests = walletRequests.filter(r => r.status === "pending");

  // Calculate all values from transactions for accuracy
  // Handle both positive and negative amounts in transactions
  const totalTopUps = transactions
    .filter(t => t.type === "top_up" && t.status === "completed")
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  const totalEarnings = transactions
    .filter(t => t.type === "earning" && t.status === "completed")
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
  
  // Ad spend can be stored as negative, so take absolute value
  const totalSpent = transactions
    .filter(t => t.type === "ad_spend" && t.status === "completed")
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  const totalWithdrawals = transactions
    .filter(t => t.type === "withdrawal" && t.status === "completed")
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  const totalRefunds = transactions
    .filter(t => t.type === "refund" && t.status === "completed")
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  // Use user's wallet_balance as source of truth, fallback to calculation
  const calculatedBalance = user?.wallet_balance ?? (totalTopUps + totalEarnings + totalRefunds - totalSpent - totalWithdrawals);

  const handleTopUp = async () => {
    const topUpAmount = parseFloat(amount);
    if (!topUpAmount || topUpAmount < 50) {
      toast.error("Minimum top-up is AED 50");
      return;
    }
    if (!receiptUrl) {
      toast.error("Please upload bank transfer receipt");
      return;
    }

    setLoading(true);
    try {
      await base44.entities.WalletRequest.create({
        user_id: user.email,
        user_name: user.full_name,
        request_type: "top_up",
        amount: topUpAmount,
        receipt_url: receiptUrl,
        request_date: new Date().toISOString(),
        status: "pending"
      });

      await base44.entities.AdminNotification.create({
        type: "withdrawal_request",
        title: "New Top-up Request",
        message: `${user.full_name || user.email} requested top-up of AED ${topUpAmount}`,
        reference_id: user.email,
        reference_type: "WalletRequest"
      });

      refetch();
      refetchRequests();
      toast.success("Top-up request submitted! Admin will review your receipt.");
      setShowTopUp(false);
      setAmount("");
      setReceiptUrl("");
    } catch (error) {
      toast.error("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);
    if (!withdrawAmount || withdrawAmount < 100) {
      toast.error("Minimum withdrawal is AED 100");
      return;
    }
    if (withdrawAmount > calculatedBalance) {
      toast.error("Insufficient balance");
      return;
    }

    setLoading(true);
    try {
      await base44.entities.WalletRequest.create({
        user_id: user.email,
        user_name: user.full_name,
        request_type: "withdrawal",
        amount: withdrawAmount,
        request_date: new Date().toISOString(),
        status: "pending"
      });

      await base44.entities.AdminNotification.create({
        type: "withdrawal_request",
        title: "New Withdrawal Request",
        message: `${user.full_name || user.email} requested withdrawal of AED ${withdrawAmount}`,
        reference_id: user.email,
        reference_type: "WalletRequest"
      });

      refetch();
      refetchRequests();
      toast.success("Withdrawal request submitted! Admin will process your request.");
      setShowWithdraw(false);
      setAmount("");
    } catch (error) {
      toast.error("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [100, 250, 500, 1000, 2500];

  const earnings = transactions.filter(t => t.type === "earning" || t.type === "top_up");
  const spending = transactions.filter(t => t.type === "ad_spend" || t.type === "withdrawal");

  const handleRefresh = () => {
    refetch();
    refetchRequests();
    loadUser();
  };

  if (!user) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">My Wallet</h1>
        <p className="text-slate-500">Manage your funds for advertising and earnings</p>
      </div>

      {/* Balance Card */}
      <Card className="mb-6 sm:mb-8 bg-gradient-to-br from-violet-600 to-indigo-600 text-white border-0">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div>
              <p className="text-white/70 mb-1 text-sm">Available Balance</p>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold">AED {calculatedBalance.toLocaleString()}</p>
              <div className="flex flex-wrap gap-4 sm:gap-8 mt-4 sm:mt-6">
                <div>
                  <p className="text-white/70 text-xs sm:text-sm">Total Earnings</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-emerald-300">
                    +AED {totalEarnings.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-white/70 text-xs sm:text-sm">Total Spent</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-rose-300">
                    -AED {totalSpent.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-row flex-wrap gap-2 sm:gap-3">
              <Button 
                className="flex-1 sm:flex-none bg-white text-violet-600 hover:bg-white/90"
                onClick={() => setShowTopUp(true)}
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="text-sm sm:text-base">Add Funds</span>
              </Button>
              {totalEarnings > 0 && (
                <Button 
                  variant="outline"
                  className="flex-1 sm:flex-none border-white/30 text-white hover:bg-white/10"
                  onClick={() => setShowWithdraw(true)}
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  <span className="text-sm sm:text-base">Withdraw</span>
                </Button>
              )}
              {isVenueOwner && (
                <Button 
                  variant="outline"
                  className="flex-1 sm:flex-none border-white/30 text-white hover:bg-white/10"
                  onClick={() => setShowPayoutSettings(true)}
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  <span className="text-sm sm:text-base">Payout Settings</span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests Alert */}
      {pendingRequests.length > 0 && (
        <Card className="mb-8 border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">You have {pendingRequests.length} pending request(s)</p>
                <p className="text-sm text-amber-600">Admin will review and process your requests soon.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate-500">Earnings</p>
                <p className="text-sm sm:text-lg font-bold text-emerald-600 truncate">
                  AED {totalEarnings.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate-500">Spending</p>
                <p className="text-sm sm:text-lg font-bold text-rose-600 truncate">
                  AED {totalSpent.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate-500">Net</p>
                <p className="text-sm sm:text-lg font-bold text-violet-600 truncate">
                  AED {(totalEarnings - totalSpent).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate-500">Transactions</p>
                <p className="text-sm sm:text-lg font-bold text-blue-600">{transactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          {isVenueOwner && <TabsTrigger value="earnings">Earnings</TabsTrigger>}
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-slate-500">Earnings</p>
                    <p className="text-sm sm:text-lg font-bold text-emerald-600 truncate">
                      AED {totalEarnings.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-slate-500">Spending</p>
                    <p className="text-sm sm:text-lg font-bold text-rose-600 truncate">
                      AED {totalSpent.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-slate-500">Net</p>
                    <p className="text-sm sm:text-lg font-bold text-violet-600 truncate">
                      AED {(totalEarnings - totalSpent).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-slate-500">Transactions</p>
                    <p className="text-sm sm:text-lg font-bold text-blue-600">{transactions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab("transactions")}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <TransactionList transactions={transactions.slice(0, 5)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionHistory transactions={transactions} viewType="all" />
            </CardContent>
          </Card>
        </TabsContent>

        {isVenueOwner && (
          <TabsContent value="earnings">
            <EarningsBreakdown 
              transactions={transactions}
              screens={screens}
              venues={venues}
              bookings={bookings}
            />
          </TabsContent>
        )}

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>My Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <RequestList requests={walletRequests} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Top Up Modal */}
      <TopUpModal
        open={showTopUp}
        onOpenChange={setShowTopUp}
        user={user}
        onSuccess={handleRefresh}
      />

      {/* Payout Settings Dialog */}
      <Dialog open={showPayoutSettings} onOpenChange={setShowPayoutSettings}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payout Settings</DialogTitle>
          </DialogHeader>
          <PayoutSettings user={user} onUpdate={handleRefresh} />
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={showWithdraw} onOpenChange={(open) => { setShowWithdraw(open); if (!open) setAmount(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdrawal Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                <strong>Note:</strong> Your withdrawal request will be reviewed by admin. Funds will be transferred to your registered bank account within 3-5 business days after approval.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Request Date</label>
              <Input value={format(new Date(), "PPP")} disabled className="mt-1 bg-slate-50" />
            </div>

            <p className="text-slate-600">
              Available for withdrawal: <span className="font-bold text-emerald-600">
                AED {calculatedBalance.toLocaleString()}
              </span>
            </p>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg"
            />
            <p className="text-sm text-slate-500">
              Minimum withdrawal: AED 100
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdraw(false)}>Cancel</Button>
            <Button 
              onClick={handleWithdraw}
              disabled={loading || !amount || parseFloat(amount) > calculatedBalance}
              variant="destructive"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Submit Request`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TransactionList({ transactions }) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <WalletIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => {
        // Determine if transaction is positive based on type and amount
        const isPositiveType = tx.type === "earning" || tx.type === "top_up" || tx.type === "refund";
        const amount = tx.amount || 0;
        // If amount is negative, it's a deduction. If positive and earning/topup/refund, it's income
        const isPositive = amount > 0 ? isPositiveType : false;
        const displayAmount = Math.abs(amount);
        
        return (
          <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isPositive ? "bg-emerald-100" : "bg-rose-100"
              }`}>
                {isPositive ? (
                  <ArrowDownRight className="w-5 h-5 text-emerald-600" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 text-rose-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-slate-900">{tx.description}</p>
                <p className="text-sm text-slate-500">
                  {tx.created_date && format(new Date(tx.created_date), "MMM d, yyyy • h:mm a")}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                {isPositive ? "+" : "-"}AED {displayAmount.toLocaleString()}
              </p>
              <Badge variant={tx.status === "completed" ? "secondary" : "outline"} className="text-xs">
                {tx.status}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RequestList({ requests }) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">No requests yet</p>
      </div>
    );
  }

  const statusColors = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-rose-100 text-rose-700"
  };

  const statusIcons = {
    pending: Clock,
    approved: CheckCircle2,
    rejected: XCircle
  };

  return (
    <div className="space-y-3">
      {requests.map((req) => {
        const StatusIcon = statusIcons[req.status] || Clock;
        return (
          <div key={req.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                req.request_type === "top_up" ? "bg-emerald-100" : "bg-amber-100"
              }`}>
                {req.request_type === "top_up" ? (
                  <ArrowDownRight className="w-5 h-5 text-emerald-600" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-slate-900">
                  {req.request_type === "top_up" ? "Top-up Request" : "Withdrawal Request"}
                </p>
                <p className="text-sm text-slate-500">
                  {req.request_date && format(new Date(req.request_date), "MMM d, yyyy • h:mm a")}
                </p>
                {req.admin_notes && (
                  <p className="text-xs text-slate-400 mt-1">Note: {req.admin_notes}</p>
                )}
              </div>
            </div>
            <div className="text-right flex items-center gap-3">
              {req.receipt_url && (
                <a href={req.receipt_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              )}
              <div>
                <p className="font-semibold text-slate-900">AED {req.amount?.toLocaleString()}</p>
                <Badge className={`${statusColors[req.status]} text-xs`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {req.status}
                </Badge>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}