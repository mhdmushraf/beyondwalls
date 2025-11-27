import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  CreditCard,
  Building2,
  TrendingUp,
  Download,
  Loader2
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

export default function Wallet() {
  const [user, setUser] = useState(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

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

  const { data: transactions = [], refetch } = useQuery({
    queryKey: ["wallet-transactions", user?.email],
    queryFn: () => base44.entities.Transaction.filter({ user_id: user?.email }, "-created_date"),
    enabled: !!user?.email
  });

  // Calculate all values from transactions for accuracy
  const totalTopUps = transactions
    .filter(t => t.type === "top_up" && t.status === "completed")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalEarnings = transactions
    .filter(t => t.type === "earning" && t.status === "completed")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const totalSpent = transactions
    .filter(t => t.type === "ad_spend" && t.status === "completed")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalWithdrawals = transactions
    .filter(t => t.type === "withdrawal" && t.status === "completed")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalRefunds = transactions
    .filter(t => t.type === "refund" && t.status === "completed")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  // Calculate actual balance from transactions
  const calculatedBalance = totalTopUps + totalEarnings + totalRefunds - totalSpent - totalWithdrawals;

  const handleTopUp = async () => {
    const topUpAmount = parseFloat(amount);
    if (!topUpAmount || topUpAmount < 50) {
      toast.error("Minimum top-up is AED 50");
      return;
    }

    setLoading(true);
    try {
      const newBalance = (user.wallet_balance || 0) + topUpAmount;
      
      await base44.auth.updateMe({ wallet_balance: newBalance });
      
      await base44.entities.Transaction.create({
        user_id: user.email,
        type: "top_up",
        amount: topUpAmount,
        balance_after: newBalance,
        description: "Wallet top-up",
        status: "completed",
        payment_method: "credit_card"
      });

      setUser({ ...user, wallet_balance: newBalance });
      refetch();
      toast.success("Wallet topped up successfully!");
      setShowTopUp(false);
      setAmount("");
    } catch (error) {
      toast.error("Top-up failed");
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
      const newBalance = (user.wallet_balance || 0) - withdrawAmount;
      
      await base44.auth.updateMe({ wallet_balance: newBalance });
      
      await base44.entities.Transaction.create({
        user_id: user.email,
        type: "withdrawal",
        amount: withdrawAmount,
        balance_after: newBalance,
        description: "Withdrawal to bank account",
        status: "pending"
      });

      // Notify admin
      await base44.entities.AdminNotification.create({
        type: "withdrawal_request",
        title: "New Withdrawal Request",
        message: `${user.full_name} requested withdrawal of AED ${withdrawAmount}`,
        reference_id: user.email,
        reference_type: "user"
      });

      setUser({ ...user, wallet_balance: newBalance });
      refetch();
      toast.success("Withdrawal request submitted!");
      setShowWithdraw(false);
      setAmount("");
    } catch (error) {
      toast.error("Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [100, 250, 500, 1000, 2500];

  const earnings = transactions.filter(t => t.type === "earning" || t.type === "top_up");
  const spending = transactions.filter(t => t.type === "ad_spend" || t.type === "withdrawal");

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
      <Card className="mb-8 bg-gradient-to-br from-violet-600 to-indigo-600 text-white border-0">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-white/70 mb-1">Available Balance</p>
              <p className="text-5xl font-bold">AED {calculatedBalance.toLocaleString()}</p>
              <div className="flex gap-8 mt-6">
                <div>
                  <p className="text-white/70 text-sm">Total Earnings</p>
                  <p className="text-2xl font-semibold text-emerald-300">
                    +AED {totalEarnings.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-white/70 text-sm">Total Spent</p>
                  <p className="text-2xl font-semibold text-rose-300">
                    -AED {totalSpent.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button 
                size="lg"
                className="bg-white text-violet-600 hover:bg-white/90"
                onClick={() => setShowTopUp(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Funds
              </Button>
              {totalEarnings > 0 && (
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                  onClick={() => setShowWithdraw(true)}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Withdraw
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Screen Earnings</p>
                <p className="text-lg font-bold text-emerald-600">
                  AED {totalEarnings.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Ad Spending</p>
                <p className="text-lg font-bold text-rose-600">
                  AED {totalSpent.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Net Balance</p>
                <p className="text-lg font-bold text-violet-600">
                  AED {(totalEarnings - totalSpent).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Transactions</p>
                <p className="text-lg font-bold text-blue-600">{transactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
              <TabsTrigger value="spending">Spending</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <TransactionList transactions={transactions} />
            </TabsContent>
            <TabsContent value="earnings">
              <TransactionList transactions={earnings} />
            </TabsContent>
            <TabsContent value="spending">
              <TransactionList transactions={spending} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Top Up Dialog */}
      <Dialog open={showTopUp} onOpenChange={setShowTopUp}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Funds</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-2">
              {quickAmounts.map((amt) => (
                <Button
                  key={amt}
                  variant={amount === String(amt) ? "default" : "outline"}
                  onClick={() => setAmount(String(amt))}
                >
                  {amt}
                </Button>
              ))}
            </div>
            <div>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg"
              />
              <p className="text-sm text-slate-500 mt-1">Minimum: AED 50</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTopUp(false)}>Cancel</Button>
            <Button 
              onClick={handleTopUp}
              disabled={loading || !amount}
              className="bg-gradient-to-r from-violet-600 to-indigo-600"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Add AED ${amount || 0}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={showWithdraw} onOpenChange={setShowWithdraw}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
              Minimum withdrawal: AED 100. Funds will be transferred to your registered bank account within 3-5 business days.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdraw(false)}>Cancel</Button>
            <Button 
              onClick={handleWithdraw}
              disabled={loading || !amount}
              variant="destructive"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Withdraw AED ${amount || 0}`}
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
      {transactions.map((tx) => (
        <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              tx.type === "earning" || tx.type === "top_up" 
                ? "bg-emerald-100" 
                : "bg-rose-100"
            }`}>
              {tx.type === "earning" || tx.type === "top_up" ? (
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
            <p className={`font-semibold ${
              tx.type === "earning" || tx.type === "top_up" 
                ? "text-emerald-600" 
                : "text-rose-600"
            }`}>
              {tx.type === "earning" || tx.type === "top_up" ? "+" : "-"}
              AED {tx.amount?.toLocaleString()}
            </p>
            <Badge variant={tx.status === "completed" ? "secondary" : "outline"} className="text-xs">
              {tx.status}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}