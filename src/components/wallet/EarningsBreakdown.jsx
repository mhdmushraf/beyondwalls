import React from "react";
import { format, startOfMonth, endOfMonth, subMonths, eachMonthOfInterval } from "date-fns";
import {
  Building2,
  MonitorPlay,
  TrendingUp,
  Calendar,
  Percent
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const COLORS = ["#8b5cf6", "#6366f1", "#3b82f6", "#22c55e", "#f59e0b"];

export default function EarningsBreakdown({ transactions, screens, venues, bookings }) {
  // Filter earning transactions
  const earningTransactions = transactions.filter(t => t.type === "earning");

  // Calculate monthly earnings for chart
  const last6Months = eachMonthOfInterval({
    start: subMonths(new Date(), 5),
    end: new Date()
  });

  const monthlyData = last6Months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const monthEarnings = earningTransactions
      .filter(t => {
        const txDate = new Date(t.created_date);
        return txDate >= monthStart && txDate <= monthEnd;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

    return {
      month: format(month, "MMM"),
      earnings: monthEarnings
    };
  });

  // Calculate earnings by screen
  const earningsByScreen = {};
  earningTransactions.forEach(tx => {
    const screenId = tx.reference_id;
    if (!earningsByScreen[screenId]) {
      earningsByScreen[screenId] = 0;
    }
    earningsByScreen[screenId] += Math.abs(tx.amount || 0);
  });

  // Map to screen data for pie chart
  const screenEarningsData = Object.entries(earningsByScreen)
    .map(([screenId, amount]) => {
      const screen = screens.find(s => s.id === screenId);
      const venue = screen ? venues.find(v => v.id === screen.venue_id) : null;
      return {
        name: screen?.name || "Unknown",
        venue: venue?.name || "",
        value: amount
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Calculate total earnings
  const totalEarnings = earningTransactions.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  // Calculate this month's earnings
  const thisMonthStart = startOfMonth(new Date());
  const thisMonthEarnings = earningTransactions
    .filter(t => new Date(t.created_date) >= thisMonthStart)
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  // Calculate last month's earnings for comparison
  const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
  const lastMonthEnd = endOfMonth(subMonths(new Date(), 1));
  const lastMonthEarnings = earningTransactions
    .filter(t => {
      const txDate = new Date(t.created_date);
      return txDate >= lastMonthStart && txDate <= lastMonthEnd;
    })
    .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);

  const growthPercent = lastMonthEarnings > 0 
    ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Earnings</p>
                <p className="text-lg font-bold text-emerald-600">AED {totalEarnings.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">This Month</p>
                <p className="text-lg font-bold text-violet-600">AED {thisMonthEarnings.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Percent className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Growth</p>
                <p className={`text-lg font-bold ${Number(growthPercent) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {Number(growthPercent) >= 0 ? "+" : ""}{growthPercent}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <MonitorPlay className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Active Screens</p>
                <p className="text-lg font-bold text-amber-600">{screens.filter(s => s.status === "online").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Earnings Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Monthly Earnings (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v/1000}k`} />
                  <Tooltip 
                    formatter={(value) => [`AED ${value.toLocaleString()}`, "Earnings"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                  />
                  <Bar dataKey="earnings" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Earnings by Screen */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Earnings by Screen (Top 5)</CardTitle>
          </CardHeader>
          <CardContent>
            {screenEarningsData.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={screenEarningsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        dataKey="value"
                      >
                        {screenEarningsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `AED ${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {screenEarningsData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-slate-500 truncate">{item.venue}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        AED {item.value.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-slate-400">
                No earnings data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Commission Info */}
      <Card className="bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Percent className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="font-medium text-violet-900">Revenue Share: 70%</p>
              <p className="text-sm text-violet-600">
                You receive 70% of all ad revenue from your screens. BeyondWalls retains 30% as platform commission.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}