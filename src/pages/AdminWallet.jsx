import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Wallet,
  Users,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Download,
  DollarSign,
  PiggyBank,
  CreditCard,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminWallet() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");

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

  const { data: users = [] } = useQuery({
    queryKey: ["all-users-wallet"],
    queryFn: () => base44.entities.User.list()
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["all-transactions"],
    queryFn: () => base44.entities.Transaction.list("-created_date", 200)
  });

  // Calculate totals
  const totalWalletBalance = users.reduce((sum, u) => sum + (u.wallet_balance || 0), 0);
  const totalSpent = users.reduce((sum, u) => sum + (u.total_spent || 0), 0);
  const totalEarnings = users.reduce((sum, u) => sum + (u.total_earnings || 0), 0);
  
  // Platform revenue (30% of ad spend)
  const platformRevenue = transactions
    .filter(t => t.type === "ad_spend" && t.status === "completed")
    .reduce((sum, t) => sum + (t.amount * 0.3), 0);

  // Transaction stats
  const topUps = transactions.filter(t => t.type === "top_up" && t.status === "completed");
  const adSpends = transactions.filter(t => t.type === "ad_spend" && t.status === "completed");
  const earnings = transactions.filter(t => t.type === "earning" && t.status === "completed");
  const withdrawals = transactions.filter(t => t.type === "withdrawal");

  const totalTopUps = topUps.reduce((sum, t) => sum + t.amount, 0);
  const totalAdSpend = adSpends.reduce((sum, t) => sum + t.amount, 0);
  const totalEarningsAmount = earnings.reduce((sum, t) => sum + t.amount, 0);
  const pendingWithdrawals = withdrawals.filter(t => t.status === "pending").reduce((sum, t) => sum + t.amount, 0);

  // Calculate earnings per user from transactions
  const earningsByUser = {};
  transactions
    .filter(t => t.type === "earning" && t.status === "completed")
    .forEach(t => {
      earningsByUser[t.user_id] = (earningsByUser[t.user_id] || 0) + (t.amount || 0);
    });

  // Filter users by search
  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Sort users by wallet balance
  const sortedUsers = [...filteredUsers].sort((a, b) => (b.wallet_balance || 0) - (a.wallet_balance || 0));

  const transactionTypeColors = {
    top_up: "bg-emerald-100 text-emerald-700",
    ad_spend: "bg-violet-100 text-violet-700",
    earning: "bg-blue-100 text-blue-700",
    withdrawal: "bg-amber-100 text-amber-700",
    refund: "bg-rose-100 text-rose-700"
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Wallet System Overview</h1>
        <p className="text-slate-500">Monitor all wallet balances and transactions</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100 text-sm">Total Wallet Balances</p>
                <p className="text-3xl font-bold mt-1">AED {totalWalletBalance.toLocaleString()}</p>
                <p className="text-violet-200 text-sm mt-1">{users.length} users</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <Wallet className="w-7 h-7" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Platform Revenue (30%)</p>
                <p className="text-3xl font-bold mt-1">AED {platformRevenue.toLocaleString()}</p>
                <p className="text-emerald-200 text-sm mt-1">From ad bookings</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-7 h-7" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Total Ad Spend</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">AED {totalAdSpend.toLocaleString()}</p>
                <p className="text-slate-500 text-sm mt-1">{adSpends.length} transactions</p>
              </div>
              <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center">
                <CreditCard className="w-7 h-7 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Venue Owner Earnings</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">AED {totalEarningsAmount.toLocaleString()}</p>
                <p className="text-slate-500 text-sm mt-1">70% revenue share</p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Top-ups</p>
                <p className="font-bold text-lg">AED {totalTopUps.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Pending Withdrawals</p>
                <p className="font-bold text-lg">AED {pendingWithdrawals.toLocaleString()}</p>
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
                <p className="text-sm text-slate-500">Avg. Balance</p>
                <p className="font-bold text-lg">AED {users.length > 0 ? Math.round(totalWalletBalance / users.length).toLocaleString() : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Transactions</p>
                <p className="font-bold text-lg">{transactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">User Wallets</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>All User Wallets</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Wallet Balance</TableHead>
                    <TableHead className="text-right">Total Spent</TableHead>
                    <TableHead className="text-right">Total Earnings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{u.full_name || "—"}</p>
                          <p className="text-sm text-slate-500">{u.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {u.user_role?.replace("_", " ") || "user"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-semibold ${(u.wallet_balance || 0) > 0 ? "text-emerald-600" : "text-slate-500"}`}>
                          AED {(u.wallet_balance || 0).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-violet-600">
                          AED {(u.total_spent || 0).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-blue-600">
                          AED {(earningsByUser[u.email] || u.total_earnings || 0).toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 50).map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-sm text-slate-500">
                        {format(new Date(t.created_date), "MMM d, h:mm a")}
                      </TableCell>
                      <TableCell className="text-sm">{t.user_id}</TableCell>
                      <TableCell>
                        <Badge className={transactionTypeColors[t.type]}>
                          {t.type?.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600 max-w-xs truncate">
                        {t.description || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-semibold ${
                          ["top_up", "earning", "refund"].includes(t.type) 
                            ? "text-emerald-600" 
                            : "text-slate-900"
                        }`}>
                          {["top_up", "earning", "refund"].includes(t.type) ? "+" : "-"}
                          AED {t.amount?.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={t.status === "completed" ? "default" : "secondary"}>
                          {t.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}