import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, Loader2, DollarSign } from "lucide-react";

export default function Wallet() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [topupAmount, setTopupAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const u = await base44.auth.me();
    setUser(u);
    const t = await base44.entities.Transaction.filter({ user_email: u.email }, "-created_date", 20);
    setTransactions(t);
  };

  const handleTopUp = async () => {
    const amount = Number(topupAmount);
    if (!amount || amount < 50) {
      toast({ title: "Minimum top-up is AED 50", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const newBalance = (user.wallet_balance || 0) + amount;
      await base44.auth.updateMe({ wallet_balance: newBalance });
      await base44.entities.Transaction.create({
        user_email: user.email,
        type: "topup",
        amount,
        description: "Wallet top-up",
        status: "completed",
        balance_before: user.wallet_balance || 0,
        balance_after: newBalance,
      });
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: "Wallet Topped Up - BeyondWalls",
        body: `Hi ${user.full_name},\n\nAED ${amount} has been added to your BeyondWalls wallet.\n\nNew Balance: AED ${newBalance.toLocaleString()}\n\nBeyondWalls Team`,
      });
      setUser(u => ({ ...u, wallet_balance: newBalance }));
      setTopupAmount("");
      toast({ title: `AED ${amount} added to wallet!` });
      loadData();
    } catch (err) {
      toast({ title: "Top-up failed", variant: "destructive" });
    }
    setLoading(false);
  };

  const txIcon = { topup: ArrowDownLeft, campaign_payment: ArrowUpRight, payout: ArrowUpRight, refund: ArrowDownLeft, earnings: ArrowDownLeft };
  const txColor = { topup: "text-emerald-600", campaign_payment: "text-red-500", payout: "text-orange-500", refund: "text-emerald-600", earnings: "text-emerald-600" };

  const quickAmounts = [100, 250, 500, 1000];

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">My Wallet</h1>

        {/* Balance Card */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-violet-600 to-indigo-700 text-white mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <WalletIcon className="w-6 h-6 text-white/70" />
              <span className="text-white/70">Available Balance</span>
            </div>
            <p className="text-4xl font-bold mb-1">AED {(user?.wallet_balance || 0).toLocaleString()}</p>
            <p className="text-white/60 text-sm">Total Spent: AED {(user?.total_spent || 0).toLocaleString()}</p>
          </CardContent>
        </Card>

        {/* Top Up */}
        <Card className="border-0 shadow-sm mb-6">
          <CardHeader><CardTitle className="text-lg">Top Up Wallet</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {quickAmounts.map(a => (
                <Button key={a} variant={topupAmount == a ? "default" : "outline"} size="sm"
                  onClick={() => setTopupAmount(String(a))}
                  className={topupAmount == a ? "bg-violet-600 hover:bg-violet-700" : ""}>
                  AED {a}
                </Button>
              ))}
            </div>
            <div className="flex gap-3">
              <Input type="number" placeholder="Enter amount (min AED 50)" value={topupAmount} onChange={e => setTopupAmount(e.target.value)} className="flex-1" />
              <Button onClick={handleTopUp} disabled={loading} className="bg-violet-600 hover:bg-violet-700 flex-shrink-0">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1" /> Top Up</>}
              </Button>
            </div>
            <p className="text-xs text-slate-400">💡 Note: Payment gateway integration (Stripe) requires Builder+ plan upgrade</p>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-lg">Transaction History</CardTitle></CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-slate-500 text-center py-6">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {transactions.map(t => {
                  const Icon = txIcon[t.type] || DollarSign;
                  const isPositive = ["topup", "refund", "earnings"].includes(t.type);
                  return (
                    <div key={t.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isPositive ? "bg-emerald-50" : "bg-red-50"}`}>
                          <Icon className={`w-4 h-4 ${isPositive ? "text-emerald-600" : "text-red-500"}`} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{t.description || t.type?.replace("_", " ")}</p>
                          <p className="text-xs text-slate-400">{new Date(t.created_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`font-bold ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
                        {isPositive ? "+" : "-"}AED {Math.abs(t.amount).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}