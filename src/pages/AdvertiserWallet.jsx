import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Wallet,
  Plus,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  History,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import StatsCard from "@/components/dashboard/StatsCard";

const quickAmounts = [100, 500, 1000, 2500, 5000, 10000];

export default function AdvertiserWallet() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
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

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions", user?.email],
    queryFn: () => base44.entities.Transaction.filter({ user_id: user?.email }, "-created_date"),
    enabled: !!user?.email
  });

  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setProcessing(true);
    try {
      const amount = parseFloat(topUpAmount);
      const newBalance = (user?.wallet_balance || 0) + amount;

      // Create transaction record
      await base44.entities.Transaction.create({
        user_id: user.email,
        type: "top_up",
        amount: amount,
        balance_after: newBalance,
        payment_method: paymentMethod,
        description: `Wallet top-up via ${paymentMethod.replace("_", " ")}`,
        status: "completed"
      });

      // Update user balance
      await base44.auth.updateMe({ wallet_balance: newBalance });
      setUser({ ...user, wallet_balance: newBalance });

      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      
      setShowTopUp(false);
      setTopUpAmount("");
      toast.success(`Successfully added AED ${amount} to your wallet`);
    } catch (error) {
      toast.error("Failed to process payment");
    } finally {
      setProcessing(false);
    }
  };

  const totalTopUps = transactions
    .filter(t => t.type === "top_up")
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const totalSpent = transactions
    .filter(t => t.type === "ad_spend")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const getTransactionIcon = (type) => {
    switch (type) {
      case "top_up":
        return <ArrowDownLeft className="w-4 h-4 text-emerald-600" />;
      case "ad_spend":
        return <ArrowUpRight className="w-4 h-4 text-rose-600" />;
      case "refund":
        return <ArrowDownLeft className="w-4 h-4 text-blue-600" />;
      default:
        return <History className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Wallet</h1>
          <p className="text-slate-500 mt-1">Manage your funds and view transaction history</p>
        </div>
        <Button 
          onClick={() => setShowTopUp(true)}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25"
        >
          <Plus className="w-4 h-4 mr-2" />
          Top Up Wallet
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-8">
        <Card className="bg-gradient-to-br from-violet-600 to-indigo-600 border-0 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="pb-2">
            <CardTitle className="text-white/80 text-sm font-medium">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">AED {user?.wallet_balance?.toLocaleString() || "0"}</p>
          </CardContent>
        </Card>
        
        <StatsCard
          title="Total Top-ups"
          value={`AED ${totalTopUps.toLocaleString()}`}
          icon={ArrowDownLeft}
          color="emerald"
        />
        <StatsCard
          title="Total Spent"
          value={`AED ${totalSpent.toLocaleString()}`}
          icon={TrendingUp}
          color="rose"
        />
      </div>

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
              <p className="text-slate-500 mb-6">Your transaction history will appear here</p>
              <Button onClick={() => setShowTopUp(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Funds
              </Button>
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
                      tx.type === "top_up" || tx.type === "refund" 
                        ? "bg-emerald-100" 
                        : "bg-rose-100"
                    }`}>
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 capitalize">
                        {tx.type?.replace("_", " ")}
                      </p>
                      <p className="text-sm text-slate-500">
                        {tx.description || (tx.payment_method && `via ${tx.payment_method.replace("_", " ")}`)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      tx.type === "top_up" || tx.type === "refund" 
                        ? "text-emerald-600" 
                        : "text-slate-900"
                    }`}>
                      {tx.type === "top_up" || tx.type === "refund" ? "+" : "-"}AED {tx.amount?.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">
                      {tx.created_date && format(new Date(tx.created_date), "MMM d, yyyy • h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Up Dialog */}
      <Dialog open={showTopUp} onOpenChange={setShowTopUp}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Top Up Wallet</DialogTitle>
            <DialogDescription>
              Add funds to your wallet to run advertising campaigns
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Quick Amounts */}
            <div className="space-y-2">
              <Label>Quick Select</Label>
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant={topUpAmount === String(amount) ? "default" : "outline"}
                    className={topUpAmount === String(amount) ? "bg-violet-600 hover:bg-violet-700" : ""}
                    onClick={() => setTopUpAmount(String(amount))}
                  >
                    AED {amount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div className="space-y-2">
              <Label>Or enter custom amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">AED</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="pl-12"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <Label
                  htmlFor="credit_card"
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "credit_card" 
                      ? "border-violet-600 bg-violet-50" 
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <RadioGroupItem value="credit_card" id="credit_card" className="sr-only" />
                  <CreditCard className="w-5 h-5 text-slate-600" />
                  <span className="flex-1 font-medium">Credit/Debit Card</span>
                  {paymentMethod === "credit_card" && (
                    <CheckCircle2 className="w-5 h-5 text-violet-600" />
                  )}
                </Label>
                <Label
                  htmlFor="apple_pay"
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "apple_pay" 
                      ? "border-violet-600 bg-violet-50" 
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <RadioGroupItem value="apple_pay" id="apple_pay" className="sr-only" />
                  <div className="w-5 h-5 bg-black rounded flex items-center justify-center text-white text-xs font-bold">A</div>
                  <span className="flex-1 font-medium">Apple Pay</span>
                  {paymentMethod === "apple_pay" && (
                    <CheckCircle2 className="w-5 h-5 text-violet-600" />
                  )}
                </Label>
              </RadioGroup>
            </div>

            <Button
              className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              onClick={handleTopUp}
              disabled={processing || !topUpAmount}
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Add AED {topUpAmount || "0"} to Wallet
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}