import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  DollarSign,
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Settings,
  Plus,
  Edit2,
  Check,
  X,
  Loader2,
  PieChart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#8b5cf6", "#6366f1", "#3b82f6", "#0ea5e9", "#10b981", "#f59e0b"];

export default function BudgetManager({ 
  user,
  bookings = [], 
  transactions = [],
  onRefresh 
}) {
  const [showSetBudgetDialog, setShowSetBudgetDialog] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [newDailyBudget, setNewDailyBudget] = useState("");
  const [saving, setSaving] = useState(false);

  // Calculate wallet balance from transactions
  const totalTopUps = transactions
    .filter(t => (t.type === "top_up" || t.type === "earning" || t.type === "refund") && t.status === "completed")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalSpent = transactions
    .filter(t => (t.type === "ad_spend" || t.type === "withdrawal") && t.status === "completed")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const walletBalance = totalTopUps - totalSpent;

  // Active campaigns spending
  const activeBookings = bookings.filter(b => b.status === "active" || b.status === "pending");
  const totalCommitted = activeBookings.reduce((sum, b) => sum + (b.total_cost || 0), 0);
  const availableBalance = walletBalance - totalCommitted;

  // Budget allocation by campaign
  const budgetAllocation = activeBookings.map((booking, i) => ({
    name: booking.campaign_name || `Campaign ${i + 1}`,
    value: booking.total_cost || 0,
    daily: booking.daily_budget || 0,
    status: booking.status,
    id: booking.id
  }));

  // Calculate daily spending rate
  const todaySpend = transactions
    .filter(t => {
      if (t.type !== "ad_spend") return false;
      const txDate = new Date(t.created_date);
      const today = new Date();
      return txDate.toDateString() === today.toDateString();
    })
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const handleUpdateDailyBudget = async () => {
    if (!editingBooking || !newDailyBudget) return;
    
    setSaving(true);
    try {
      await base44.entities.AdSlotBooking.update(editingBooking.id, {
        daily_budget: parseFloat(newDailyBudget)
      });
      toast.success("Daily budget updated");
      setEditingBooking(null);
      setNewDailyBudget("");
      onRefresh?.();
    } catch (error) {
      toast.error("Failed to update budget");
    } finally {
      setSaving(false);
    }
  };

  const handlePauseCampaign = async (bookingId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "paused" : "active";
      await base44.entities.AdSlotBooking.update(bookingId, { status: newStatus });
      toast.success(`Campaign ${newStatus === "paused" ? "paused" : "resumed"}`);
      onRefresh?.();
    } catch (error) {
      toast.error("Failed to update campaign");
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-violet-200 mb-1">
              <Wallet className="w-4 h-4" />
              <span className="text-sm">Wallet Balance</span>
            </div>
            <p className="text-2xl font-bold">AED {walletBalance.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">Committed</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">AED {totalCommitted.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Available</span>
            </div>
            <p className={`text-2xl font-bold ${availableBalance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              AED {availableBalance.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm">Today's Spend</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">AED {todaySpend.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Balance Warning */}
      {availableBalance < 500 && availableBalance >= 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div className="flex-1">
              <p className="font-medium text-amber-800">Low Balance Warning</p>
              <p className="text-sm text-amber-600">Add funds to avoid campaign interruptions</p>
            </div>
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
              Add Funds
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Budget Allocation Chart */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="w-4 h-4 text-violet-600" />
              Budget Allocation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {budgetAllocation.length > 0 ? (
              <>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={budgetAllocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {budgetAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `AED ${v.toLocaleString()}`} />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {budgetAllocation.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="truncate max-w-[150px]">{item.name}</span>
                      </div>
                      <span className="font-medium">AED {item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <PieChart className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-slate-500">No active campaigns</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Campaign Budgets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="w-4 h-4 text-violet-600" />
              Campaign Budgets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeBookings.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-slate-500">No active campaigns</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeBookings.map((booking) => {
                  const spent = transactions
                    .filter(t => t.reference_id === booking.id && t.type === "ad_spend")
                    .reduce((sum, t) => sum + (t.amount || 0), 0);
                  const progress = booking.total_cost > 0 ? (spent / booking.total_cost) * 100 : 0;

                  return (
                    <div key={booking.id} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate max-w-[150px]">
                            {booking.campaign_name || "Campaign"}
                          </span>
                          <Badge variant={booking.status === "active" ? "default" : "secondary"} className="text-xs">
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              setEditingBooking(booking);
                              setNewDailyBudget(booking.daily_budget?.toString() || "");
                            }}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Switch
                            checked={booking.status === "active"}
                            onCheckedChange={() => handlePauseCampaign(booking.id, booking.status)}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>AED {spent.toLocaleString()} spent</span>
                        <span>AED {booking.total_cost?.toLocaleString()} total</span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                      
                      {booking.daily_budget > 0 && (
                        <p className="text-xs text-violet-600 mt-2">
                          Daily cap: AED {booking.daily_budget}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Daily Budget Dialog */}
      <Dialog open={!!editingBooking} onOpenChange={() => setEditingBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Daily Budget Cap</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Campaign</Label>
              <p className="text-sm text-slate-600 mt-1">
                {editingBooking?.campaign_name || "Campaign"}
              </p>
            </div>
            <div>
              <Label>Total Budget</Label>
              <p className="text-lg font-semibold text-violet-600 mt-1">
                AED {editingBooking?.total_cost?.toLocaleString()}
              </p>
            </div>
            <div>
              <Label>Daily Budget Cap (AED)</Label>
              <Input
                type="number"
                placeholder="e.g., 500"
                value={newDailyBudget}
                onChange={(e) => setNewDailyBudget(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">
                Leave empty for no daily limit
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingBooking(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateDailyBudget} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}