import React, { useState } from "react";
import { format, subDays, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

export default function SpendHistory({ transactions = [], bookings = [] }) {
  const [timeRange, setTimeRange] = useState("30d");
  const [chartType, setChartType] = useState("area");

  // Filter transactions by time range
  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case "7d": return subDays(now, 7);
      case "30d": return subDays(now, 30);
      case "90d": return subDays(now, 90);
      case "12m": return subDays(now, 365);
      default: return subDays(now, 30);
    }
  };

  const startDate = getDateRange();
  const filteredTransactions = transactions.filter(t => 
    t.type === "ad_spend" && 
    new Date(t.created_date) >= startDate
  );

  // Calculate totals
  const totalSpend = filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const avgDailySpend = totalSpend / (timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365);

  // Previous period comparison
  const prevStartDate = subDays(startDate, timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90);
  const prevTransactions = transactions.filter(t => 
    t.type === "ad_spend" && 
    new Date(t.created_date) >= prevStartDate &&
    new Date(t.created_date) < startDate
  );
  const prevTotalSpend = prevTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const spendChange = prevTotalSpend > 0 ? ((totalSpend - prevTotalSpend) / prevTotalSpend) * 100 : 0;

  // Generate daily spend data
  const generateDailyData = () => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, "yyyy-MM-dd");
      
      const daySpend = filteredTransactions
        .filter(t => format(new Date(t.created_date), "yyyy-MM-dd") === dateStr)
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      
      data.push({
        date: timeRange === "7d" ? format(date, "EEE") : format(date, "MMM d"),
        spend: daySpend,
        campaigns: filteredTransactions.filter(t => 
          format(new Date(t.created_date), "yyyy-MM-dd") === dateStr
        ).length
      });
    }
    
    return data;
  };

  const dailyData = generateDailyData();

  // Group spending by campaign
  const campaignSpend = bookings.reduce((acc, booking) => {
    const spend = filteredTransactions
      .filter(t => t.reference_id === booking.id)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    if (spend > 0) {
      acc.push({
        name: booking.campaign_name || `Campaign ${booking.id.slice(0, 6)}`,
        spend,
        status: booking.status
      });
    }
    return acc;
  }, []).sort((a, b) => b.spend - a.spend);

  const handleExport = () => {
    const csvContent = [
      ["Date", "Amount (AED)", "Description", "Campaign"],
      ...filteredTransactions.map(t => [
        format(new Date(t.created_date), "yyyy-MM-dd"),
        t.amount,
        t.description,
        t.reference_id || "-"
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spend-history-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-violet-600" />
            Spend History
          </h3>
          <p className="text-sm text-slate-500">Track your advertising spend over time</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Total Spend</p>
            <p className="text-2xl font-bold text-violet-600">AED {totalSpend.toLocaleString()}</p>
            <div className={`flex items-center gap-1 text-xs mt-1 ${
              spendChange >= 0 ? "text-rose-600" : "text-emerald-600"
            }`}>
              {spendChange >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{Math.abs(spendChange).toFixed(1)}% vs previous period</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Avg Daily Spend</p>
            <p className="text-2xl font-bold text-slate-900">AED {avgDailySpend.toFixed(0)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Active Campaigns</p>
            <p className="text-2xl font-bold text-slate-900">
              {bookings.filter(b => b.status === "active").length}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Transactions</p>
            <p className="text-2xl font-bold text-slate-900">{filteredTransactions.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Spend Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Spend Over Time</CardTitle>
            <div className="flex gap-1">
              <Button
                variant={chartType === "area" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setChartType("area")}
              >
                Area
              </Button>
              <Button
                variant={chartType === "bar" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setChartType("bar")}
              >
                Bar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "area" ? (
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${v}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
                    formatter={(value) => [`AED ${value.toLocaleString()}`, "Spend"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="spend" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    fill="url(#spendGradient)" 
                  />
                </AreaChart>
              ) : (
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
                    formatter={(value) => [`AED ${value.toLocaleString()}`, "Spend"]}
                  />
                  <Bar dataKey="spend" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Spend by Campaign */}
      {campaignSpend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-violet-600" />
              Spend by Campaign
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {campaignSpend.slice(0, 5).map((campaign, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center text-xs font-bold text-violet-600">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{campaign.name}</p>
                      <Badge variant="outline" className="text-xs capitalize">{campaign.status}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-violet-600">AED {campaign.spend.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">
                      {((campaign.spend / totalSpend) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-slate-500">No transactions in this period</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.slice(0, 10).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-rose-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{tx.description}</p>
                      <p className="text-xs text-slate-500">
                        {format(new Date(tx.created_date), "MMM d, yyyy • h:mm a")}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-rose-600">-AED {tx.amount?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}