import React, { useState } from "react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Download,
  Filter,
  Search,
  Wallet as WalletIcon,
  FileText,
  Building2,
  MonitorPlay,
  Megaphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TransactionHistory({ transactions, viewType = "all" }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Calculate date ranges
  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    // Search filter
    if (search && !tx.description?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    // Type filter
    if (typeFilter !== "all" && tx.type !== typeFilter) {
      return false;
    }

    // Date filter
    if (dateFilter !== "all") {
      const txDate = new Date(tx.created_date);
      if (dateFilter === "this_month" && txDate < thisMonthStart) return false;
      if (dateFilter === "last_month" && (txDate < lastMonthStart || txDate > lastMonthEnd)) return false;
    }

    return true;
  });

  // Calculate summary
  const summary = {
    earnings: filteredTransactions.filter(t => t.type === "earning").reduce((sum, t) => sum + Math.abs(t.amount || 0), 0),
    spending: filteredTransactions.filter(t => t.type === "ad_spend").reduce((sum, t) => sum + Math.abs(t.amount || 0), 0),
    topups: filteredTransactions.filter(t => t.type === "top_up").reduce((sum, t) => sum + Math.abs(t.amount || 0), 0),
    withdrawals: filteredTransactions.filter(t => t.type === "withdrawal").reduce((sum, t) => sum + Math.abs(t.amount || 0), 0)
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "earning":
        return <Building2 className="w-4 h-4" />;
      case "ad_spend":
        return <Megaphone className="w-4 h-4" />;
      case "top_up":
        return <WalletIcon className="w-4 h-4" />;
      case "withdrawal":
        return <ArrowUpRight className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "earning":
      case "top_up":
      case "refund":
        return { bg: "bg-emerald-100", text: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700" };
      case "ad_spend":
      case "withdrawal":
        return { bg: "bg-rose-100", text: "text-rose-600", badge: "bg-rose-100 text-rose-700" };
      default:
        return { bg: "bg-slate-100", text: "text-slate-600", badge: "bg-slate-100 text-slate-700" };
    }
  };

  const formatAmount = (tx) => {
    const isPositive = tx.type === "earning" || tx.type === "top_up" || tx.type === "refund";
    const amount = Math.abs(tx.amount || 0);
    return `${isPositive ? "+" : "-"}AED ${amount.toLocaleString()}`;
  };

  const exportCSV = () => {
    const headers = ["Date", "Type", "Description", "Amount", "Balance After", "Status"];
    const rows = filteredTransactions.map(tx => [
      format(new Date(tx.created_date), "yyyy-MM-dd HH:mm"),
      tx.type,
      tx.description,
      tx.amount,
      tx.balance_after,
      tx.status
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      {viewType === "all" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-emerald-50 border-emerald-100">
            <CardContent className="p-3">
              <p className="text-xs text-emerald-600">Earnings</p>
              <p className="text-lg font-bold text-emerald-700">AED {summary.earnings.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-rose-50 border-rose-100">
            <CardContent className="p-3">
              <p className="text-xs text-rose-600">Ad Spend</p>
              <p className="text-lg font-bold text-rose-700">AED {summary.spending.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-100">
            <CardContent className="p-3">
              <p className="text-xs text-blue-600">Top-ups</p>
              <p className="text-lg font-bold text-blue-700">AED {summary.topups.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 border-amber-100">
            <CardContent className="p-3">
              <p className="text-xs text-amber-600">Withdrawals</p>
              <p className="text-lg font-bold text-amber-700">AED {summary.withdrawals.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="earning">Earnings</SelectItem>
            <SelectItem value="ad_spend">Ad Spend</SelectItem>
            <SelectItem value="top_up">Top-ups</SelectItem>
            <SelectItem value="withdrawal">Withdrawals</SelectItem>
            <SelectItem value="refund">Refunds</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="last_month">Last Month</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <WalletIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No transactions found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTransactions.map((tx) => {
            const colors = getTypeColor(tx.type);
            const isPositive = tx.type === "earning" || tx.type === "top_up" || tx.type === "refund";

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colors.bg}`}>
                    {isPositive ? (
                      <ArrowDownRight className={`w-5 h-5 ${colors.text}`} />
                    ) : (
                      <ArrowUpRight className={`w-5 h-5 ${colors.text}`} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">{tx.description}</p>
                      <Badge className={`text-xs ${colors.badge}`}>
                        {tx.type?.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span>{tx.created_date && format(new Date(tx.created_date), "MMM d, yyyy • h:mm a")}</span>
                      {tx.reference_id && (
                        <span className="text-xs text-slate-400">• Ref: {tx.reference_id.slice(0, 8)}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                    {formatAmount(tx)}
                  </p>
                  <p className="text-xs text-slate-400">
                    Balance: AED {(tx.balance_after || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}