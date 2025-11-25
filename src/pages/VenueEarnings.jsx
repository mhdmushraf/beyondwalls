import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Wallet,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  History,
  Loader2,
  Building,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import StatsCard from "@/components/dashboard/StatsCard";

export default function VenueEarnings() {
  const [user, setUser] = useState(null);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankDetails, setBankDetails] = useState({ name: "", iban: "", bank: "" });
  const [processing, setProcessing] = useState(false);

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

  const { data: transactions = [], isLoading, refetch } = useQuery({
    queryKey: ["venue-transactions", user?.email],
    queryFn: () => base44.entities.Transaction.filter({ user_id: user?.email }, "-created_date"),
    enabled: !!user?.email
  });

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < 500) {
      toast.error("Minimum withdrawal amount is AED 500");
      return;
    }
    if (amount > (user?.wallet_balance || 0)) {
      toast.error("Insufficient balance");
      return;
    }

    setProcessing(true);
    try {
      const newBalance = (user?.wallet_balance || 0) - amount;

      await base44.entities.Transaction.create({
        user_id: user.email,
        type: "withdrawal",
        amount: amount,
        balance_after: newBalance,
        description: `Withdrawal to ${bankDetails.bank} - ${bankDetails.iban.slice(-4)}`,
        status: "pending"
      });

      await base44.auth.updateMe({ wallet_balance: newBalance });
      setUser({ ...user, wallet_balance: newBalance });

      refetch();
      setShowWithdraw(false);
      setWithdrawAmount("");
      toast.success("Withdrawal request submitted! Processing within 2-3 business days.");
    } catch (error) {
      toast.error("Failed to process withdrawal");
    } finally {
      setProcessing(false);
    }
  };

  const totalEarnings = transactions
    .filter(t => t.type === "earning")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const totalWithdrawn = transactions
    .filter(t => t.type === "withdrawal")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const pendingWithdrawals = transactions
    .filter(t => t.type === "withdrawal" && t.status === "pending")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const getTransactionIcon = (type) => {
    switch (type) {
      case "earning":
        return <ArrowDownLeft className="w-4 h-4 text-emerald-600" />;
      case "withdrawal":
        return <ArrowUpRight className="w-4 h-4 text-rose-600" />;
      default:
        return <History className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Earnings</h1>
          <p className="text-slate-500 mt-1">Track your earnings and withdrawals</p>
        </div>
        <Button 
          onClick={() => setShowWithdraw(true)}
          disabled={(user?.wallet_balance || 0) < 500}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25"
        >
          <Banknote className="w-4 h-4 mr-2" />
          Withdraw Funds
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <Card className="bg-gradient-to-br from-emerald-600 to-teal-600 border-0 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="pb-2">
            <CardTitle className="text-white/80 text-sm font-medium">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">AED {user?.wallet_balance?.toLocaleString() || "0"}</p>
          </CardContent>
        </Card>
        
        <StatsCard
          title="Total Earnings"
          value={`AED ${totalEarnings.toLocaleString()}`}
          icon={TrendingUp}
          color="emerald"
        />
        <StatsCard
          title="Total Withdrawn"
          value={`AED ${totalWithdrawn.toLocaleString()}`}
          icon={Banknote}
          color="violet"
        />
        <StatsCard
          title="Pending Withdrawals"
          value={`AED ${pendingWithdrawals.toLocaleString()}`}
          icon={History}
          color="amber"
        />
      </div>

      {/* Revenue Share Info */}
      <Card className="mb-8 bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-200">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">70% Revenue Share</p>
              <p className="text-sm text-slate-600">You earn 70% of all ad revenue generated by your screens</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <History className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">No transactions yet</h3>
              <p className="text-slate-500">Your earnings will appear here once ads start running on your screens</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      tx.type === "earning" ? "bg-emerald-100" : "bg-rose-100"
                    }`}>
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 capitalize">
                        {tx.type?.replace("_", " ")}
                      </p>
                      <p className="text-sm text-slate-500">{tx.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      tx.type === "earning" ? "text-emerald-600" : "text-slate-900"
                    }`}>
                      {tx.type === "earning" ? "+" : "-"}AED {tx.amount?.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">
                      {tx.created_date && format(new Date(tx.created_date), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdraw Dialog */}
      <Dialog open={showWithdraw} onOpenChange={setShowWithdraw}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>
              Minimum withdrawal: AED 500. Processing time: 2-3 business days.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <p className="text-sm text-emerald-600">Available Balance</p>
              <p className="text-3xl font-bold text-emerald-700">AED {user?.wallet_balance?.toLocaleString() || 0}</p>
            </div>

            <div className="space-y-2">
              <Label>Withdrawal Amount (AED)</Label>
              <Input
                type="number"
                placeholder="Minimum AED 500"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min={500}
                max={user?.wallet_balance || 0}
              />
            </div>

            <div className="space-y-2">
              <Label>Account Holder Name</Label>
              <Input
                placeholder="As per bank account"
                value={bankDetails.name}
                onChange={(e) => setBankDetails({ ...bankDetails, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Input
                placeholder="e.g., Emirates NBD"
                value={bankDetails.bank}
                onChange={(e) => setBankDetails({ ...bankDetails, bank: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>IBAN</Label>
              <Input
                placeholder="AE..."
                value={bankDetails.iban}
                onChange={(e) => setBankDetails({ ...bankDetails, iban: e.target.value })}
              />
            </div>

            <Button
              className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600"
              onClick={handleWithdraw}
              disabled={processing || !withdrawAmount || parseFloat(withdrawAmount) < 500 || !bankDetails.name || !bankDetails.iban}
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Request Withdrawal
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}