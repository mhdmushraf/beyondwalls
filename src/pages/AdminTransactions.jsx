import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  TrendingUp,
  Banknote,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCard from "@/components/dashboard/StatsCard";

export default function AdminTransactions() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) {
          base44.auth.redirectToLogin(createPageUrl("AdminTransactions"));
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
        base44.auth.redirectToLogin(createPageUrl("AdminTransactions"));
      }
    };
    checkAdminAuth();
  }, []);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["admin-transactions"],
    queryFn: () => base44.entities.Transaction.list("-created_date"),
    enabled: authChecked
  });

  if (!authChecked) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <History className="w-10 h-10 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Checking permissions...</p>
        </div>
      </div>
    );
  }

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.user_id?.toLowerCase().includes(search.toLowerCase()) ||
                         tx.description?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalTopUps = transactions
    .filter(t => t.type === "top_up")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalAdSpend = transactions
    .filter(t => t.type === "ad_spend")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalWithdrawals = transactions
    .filter(t => t.type === "withdrawal")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const typeColors = {
    top_up: "bg-emerald-100 text-emerald-700",
    ad_spend: "bg-violet-100 text-violet-700",
    earning: "bg-blue-100 text-blue-700",
    withdrawal: "bg-amber-100 text-amber-700",
    refund: "bg-rose-100 text-rose-700"
  };

  const getIcon = (type) => {
    switch (type) {
      case "top_up":
      case "earning":
      case "refund":
        return <ArrowDownLeft className="w-4 h-4" />;
      case "ad_spend":
      case "withdrawal":
        return <ArrowUpRight className="w-4 h-4" />;
      default:
        return <History className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Transaction History</h1>
        <p className="text-slate-500 mt-1">View all platform transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Top-ups"
          value={`AED ${totalTopUps.toLocaleString()}`}
          icon={ArrowDownLeft}
          color="emerald"
        />
        <StatsCard
          title="Total Ad Spend"
          value={`AED ${totalAdSpend.toLocaleString()}`}
          icon={TrendingUp}
          color="violet"
        />
        <StatsCard
          title="Total Withdrawals"
          value={`AED ${totalWithdrawals.toLocaleString()}`}
          icon={Banknote}
          color="amber"
        />
        <StatsCard
          title="Total Transactions"
          value={transactions.length}
          icon={History}
          color="indigo"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={typeFilter} onValueChange={setTypeFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="top_up">Top-ups</TabsTrigger>
            <TabsTrigger value="ad_spend">Ad Spend</TabsTrigger>
            <TabsTrigger value="earning">Earnings</TabsTrigger>
            <TabsTrigger value="withdrawal">Withdrawals</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-slate-600">Transaction</th>
                  <th className="text-left p-4 font-medium text-slate-600">User</th>
                  <th className="text-left p-4 font-medium text-slate-600">Amount</th>
                  <th className="text-left p-4 font-medium text-slate-600">Status</th>
                  <th className="text-left p-4 font-medium text-slate-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">Loading...</td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">No transactions found</td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            tx.type === "top_up" || tx.type === "earning" || tx.type === "refund"
                              ? "bg-emerald-100 text-emerald-600"
                              : "bg-violet-100 text-violet-600"
                          }`}>
                            {getIcon(tx.type)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 capitalize">
                              {tx.type?.replace("_", " ")}
                            </p>
                            <p className="text-sm text-slate-500">{tx.description || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-900">{tx.user_id}</p>
                      </td>
                      <td className="p-4">
                        <p className={`font-semibold ${
                          tx.type === "top_up" || tx.type === "earning" || tx.type === "refund"
                            ? "text-emerald-600"
                            : "text-slate-900"
                        }`}>
                          {tx.type === "top_up" || tx.type === "earning" || tx.type === "refund" ? "+" : "-"}
                          AED {tx.amount?.toLocaleString()}
                        </p>
                        {tx.balance_after !== undefined && (
                          <p className="text-xs text-slate-500">
                            Balance: AED {tx.balance_after?.toLocaleString()}
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge className={
                          tx.status === "completed" 
                            ? "bg-emerald-100 text-emerald-700"
                            : tx.status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }>
                          {tx.status || "completed"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-900">
                          {tx.created_date && format(new Date(tx.created_date), "MMM d, yyyy")}
                        </p>
                        <p className="text-xs text-slate-500">
                          {tx.created_date && format(new Date(tx.created_date), "h:mm a")}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}