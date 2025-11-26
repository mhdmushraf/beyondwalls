import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Wallet,
  TrendingUp,
  DollarSign,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminPlatformWallet() {
  const [user, setUser] = useState(null);

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

  const { data: platformWallets = [], isLoading } = useQuery({
    queryKey: ["platform-wallet"],
    queryFn: () => base44.entities.PlatformWallet.list()
  });

  const { data: platformTransactions = [] } = useQuery({
    queryKey: ["platform-transactions"],
    queryFn: () => base44.entities.Transaction.filter({ 
      user_id: "platform@beyondwalls.ae" 
    }, "-created_date", 50)
  });

  const platformWallet = platformWallets[0] || { balance: 0, total_revenue: 0, total_tax_collected: 0 };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">BeyondWalls Platform Wallet</h1>
        <p className="text-slate-500">30% commission from all ad bookings</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-200 text-sm">Platform Balance</p>
                <p className="text-3xl font-bold mt-1">
                  AED {(platformWallet.balance || 0).toLocaleString()}
                </p>
              </div>
              <Wallet className="w-10 h-10 text-violet-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Total Revenue (30%)</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  AED {(platformWallet.total_revenue || 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Transactions</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {platformTransactions.length}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-violet-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown Info */}
      <Card className="mb-8 border-violet-200 bg-violet-50">
        <CardContent className="p-6">
          <h3 className="font-semibold text-violet-900 mb-3">Revenue Split Model</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-violet-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Venue Owners</p>
                  <p className="text-2xl font-bold text-emerald-600">70%</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-violet-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">BeyondWalls</p>
                  <p className="text-2xl font-bold text-violet-600">30%</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Commission History</CardTitle>
        </CardHeader>
        <CardContent>
          {platformTransactions.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No commission transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {platformTransactions.map((txn) => (
                <div key={txn.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{txn.description}</p>
                      <p className="text-sm text-slate-500">
                        {format(new Date(txn.created_date), "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">+AED {txn.amount?.toLocaleString()}</p>
                    <Badge variant="outline" className="text-xs">30% commission</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}