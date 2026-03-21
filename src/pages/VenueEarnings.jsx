import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { DollarSign, TrendingUp, Clock, Loader2, CheckCircle2 } from "lucide-react";

export default function VenueEarnings() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const { toast } = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const u = await base44.auth.me();
    setUser(u);
    const [t, p] = await Promise.all([
      base44.entities.Transaction.filter({ user_email: u.email }, "-created_date", 20),
      base44.entities.PayoutRequest.filter({ venue_owner_email: u.email }, "-created_date"),
    ]);
    setTransactions(t);
    setPayouts(p);
  };

  const handlePayoutRequest = async () => {
    const amount = Number(payoutAmount);
    if (!amount || amount < 100) { toast({ title: "Minimum payout is AED 100", variant: "destructive" }); return; }
    if (amount > (user?.wallet_balance || 0)) { toast({ title: "Insufficient balance", variant: "destructive" }); return; }
    setLoading(true);
    try {
      await base44.entities.PayoutRequest.create({
        venue_owner_email: user.email,
        amount,
        bank_name: user.bank_name || "",
        account_holder_name: user.account_holder_name || "",
        iban: user.iban || "",
        swift_code: user.swift_code || "",
        status: "pending",
      });
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: "Payout Request Submitted - BeyondWalls",
        body: `Hi ${user.full_name},\n\nYour payout request of AED ${amount} has been submitted and is pending admin approval.\n\nExpected processing: 1-3 business days.\n\nBeyondWalls Team`,
      });
      toast({ title: "Payout request submitted!", description: "Admin will process it within 1-3 business days." });
      setPayoutAmount("");
      setShowPayoutForm(false);
      loadData();
    } catch (err) {
      toast({ title: "Error", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">Earnings & Payouts</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {[
            { label: "Wallet Balance", value: `AED ${(user?.wallet_balance || 0).toLocaleString()}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Total Earned", value: `AED ${(user?.total_earned || 0).toLocaleString()}`, icon: TrendingUp, color: "text-violet-600", bg: "bg-violet-50" },
            { label: "Pending Payouts", value: payouts.filter(p => p.status === "pending").length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          ].map((s, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center mb-2`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <p className="font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payout Request */}
        <Card className="border-0 shadow-sm mb-6">
          <CardHeader className="pb-2"><CardTitle className="text-base sm:text-lg">Request Payout</CardTitle></CardHeader>
          <CardContent>
            {!user?.iban ? (
              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                <span className="text-amber-600 text-sm">⚠️ Please add your bank details in Settings before requesting a payout.</span>
              </div>
            ) : !showPayoutForm ? (
              <Button onClick={() => setShowPayoutForm(true)} className="bg-violet-600 hover:bg-violet-700">
                Request Payout
              </Button>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label>Amount (AED) - min AED 100</Label>
                  <Input className="mt-1" type="number" placeholder="e.g. 500" value={payoutAmount} onChange={e => setPayoutAmount(e.target.value)} />
                  <p className="text-xs text-slate-500 mt-1">Available: AED {(user?.wallet_balance || 0).toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-1">
                  <p className="font-medium text-slate-700">Payout to:</p>
                  <p className="text-slate-600">{user?.bank_name} · {user?.iban}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowPayoutForm(false)} className="flex-1">Cancel</Button>
                  <Button onClick={handlePayoutRequest} disabled={loading} className="flex-1 bg-violet-600 hover:bg-violet-700">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Request"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payout History */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-base sm:text-lg">Transaction History</CardTitle></CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-slate-500 text-center py-6">No transactions yet</p>
            ) : (
              <div className="space-y-2">
                {transactions.map(t => (
                  <div key={t.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{t.description || t.type?.replace("_", " ")}</p>
                      <p className="text-xs text-slate-400">{new Date(t.created_date).toLocaleDateString()}</p>
                    </div>
                    <span className={`font-bold text-sm ${["earnings", "topup", "refund"].includes(t.type) ? "text-emerald-600" : "text-red-500"}`}>
                      {["earnings", "topup", "refund"].includes(t.type) ? "+" : "-"}AED {Math.abs(t.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}