import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Target,
  Bell,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Loader2,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function BudgetGoals({ bookingId, advertiserId, totalBudget, currentSpend = 0 }) {
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newAlert, setNewAlert] = useState({
    alert_type: "budget_threshold",
    threshold_percentage: 50,
    budget_goal: totalBudget
  });

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["budget-alerts", bookingId],
    queryFn: () => base44.entities.BudgetAlert.filter({ booking_id: bookingId }),
    enabled: !!bookingId
  });

  const spendPercentage = totalBudget > 0 ? (currentSpend / totalBudget) * 100 : 0;

  // Check and trigger alerts
  useEffect(() => {
    checkAlerts();
  }, [currentSpend, alerts]);

  const checkAlerts = async () => {
    for (const alert of alerts) {
      if (!alert.is_triggered && alert.is_active) {
        let shouldTrigger = false;

        if (alert.alert_type === "budget_threshold") {
          shouldTrigger = spendPercentage >= alert.threshold_percentage;
        }

        if (shouldTrigger) {
          await triggerAlert(alert);
        }
      }
    }
  };

  const triggerAlert = async (alert) => {
    try {
      await base44.entities.BudgetAlert.update(alert.id, {
        is_triggered: true,
        triggered_at: new Date().toISOString(),
        current_spend: currentSpend
      });

      // Send notification email
      if (!alert.notification_sent) {
        await base44.integrations.Core.SendEmail({
          to: advertiserId,
          subject: `⚠️ Budget Alert: ${alert.threshold_percentage}% of budget spent`,
          body: `Your campaign has reached ${alert.threshold_percentage}% of its budget.\n\nTotal Budget: AED ${totalBudget}\nCurrent Spend: AED ${currentSpend}\n\nLog in to your dashboard to review your campaign.`
        });

        await base44.entities.BudgetAlert.update(alert.id, { notification_sent: true });
      }

      queryClient.invalidateQueries({ queryKey: ["budget-alerts", bookingId] });
      toast.warning(`Alert triggered: ${alert.threshold_percentage}% of budget spent`);
    } catch (error) {
      console.error("Failed to trigger alert:", error);
    }
  };

  const handleAddAlert = async () => {
    setSaving(true);
    try {
      await base44.entities.BudgetAlert.create({
        ...newAlert,
        booking_id: bookingId,
        advertiser_id: advertiserId,
        budget_goal: totalBudget
      });
      queryClient.invalidateQueries({ queryKey: ["budget-alerts", bookingId] });
      setShowAddDialog(false);
      setNewAlert({ alert_type: "budget_threshold", threshold_percentage: 50, budget_goal: totalBudget });
      toast.success("Budget alert created");
    } catch (error) {
      toast.error("Failed to create alert");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await base44.entities.BudgetAlert.delete(id);
      queryClient.invalidateQueries({ queryKey: ["budget-alerts", bookingId] });
      toast.success("Alert deleted");
    } catch (error) {
      toast.error("Failed to delete alert");
    }
  };

  const handleToggleAlert = async (id, isActive) => {
    try {
      await base44.entities.BudgetAlert.update(id, { is_active: isActive });
      queryClient.invalidateQueries({ queryKey: ["budget-alerts", bookingId] });
    } catch (error) {
      toast.error("Failed to update alert");
    }
  };

  const alertTypeLabels = {
    budget_threshold: "Budget Threshold",
    performance_low: "Low Performance",
    performance_high: "High Performance",
    campaign_ending: "Campaign Ending Soon"
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-violet-600" />
            Budget Goals & Alerts
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Alert
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Budget Alert</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Alert Type</Label>
                  <Select
                    value={newAlert.alert_type}
                    onValueChange={(v) => setNewAlert({ ...newAlert, alert_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="budget_threshold">Budget Threshold</SelectItem>
                      <SelectItem value="performance_low">Low Performance Warning</SelectItem>
                      <SelectItem value="campaign_ending">Campaign Ending Soon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newAlert.alert_type === "budget_threshold" && (
                  <div>
                    <Label>Alert when budget reaches (%)</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={newAlert.threshold_percentage}
                        onChange={(e) => setNewAlert({ ...newAlert, threshold_percentage: parseInt(e.target.value) })}
                        className="w-24"
                      />
                      <span className="text-slate-500">%</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      You'll be notified when AED {Math.round(totalBudget * newAlert.threshold_percentage / 100)} is spent
                    </p>
                  </div>
                )}

                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-sm text-slate-600">
                    You'll receive an email notification when this alert is triggered.
                  </p>
                </div>

                <Button onClick={handleAddAlert} className="w-full" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Create Alert
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Budget Overview */}
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-slate-500">Budget Spent</p>
              <p className="text-2xl font-bold text-violet-600">
                AED {currentSpend.toLocaleString()} 
                <span className="text-sm text-slate-400 font-normal ml-1">
                  / {totalBudget.toLocaleString()}
                </span>
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              spendPercentage >= 90 ? "bg-rose-100" :
              spendPercentage >= 70 ? "bg-amber-100" : "bg-emerald-100"
            }`}>
              <DollarSign className={`w-6 h-6 ${
                spendPercentage >= 90 ? "text-rose-600" :
                spendPercentage >= 70 ? "text-amber-600" : "text-emerald-600"
              }`} />
            </div>
          </div>
          <Progress value={spendPercentage} className="h-2" />
          <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
            <span>{spendPercentage.toFixed(1)}% spent</span>
            <span>AED {(totalBudget - currentSpend).toLocaleString()} remaining</span>
          </div>
        </div>

        {/* Active Alerts */}
        {alerts.length === 0 ? (
          <div className="text-center py-6">
            <Bell className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No budget alerts set</p>
            <p className="text-slate-400 text-xs mt-1">Add alerts to get notified about spending milestones</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-700">Active Alerts</h4>
            {alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  alert.is_triggered 
                    ? "bg-amber-50 border-amber-200" 
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    alert.is_triggered ? "bg-amber-100" : "bg-slate-100"
                  }`}>
                    {alert.is_triggered ? (
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Bell className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-slate-900">
                      {alertTypeLabels[alert.alert_type]}
                    </p>
                    <p className="text-xs text-slate-500">
                      {alert.alert_type === "budget_threshold" 
                        ? `Alert at ${alert.threshold_percentage}% (AED ${Math.round(totalBudget * alert.threshold_percentage / 100)})`
                        : alert.alert_type
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {alert.is_triggered && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                      Triggered
                    </Badge>
                  )}
                  <Switch
                    checked={alert.is_active}
                    onCheckedChange={(checked) => handleToggleAlert(alert.id, checked)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-rose-500"
                    onClick={() => handleDeleteAlert(alert.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Add Buttons */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => {
              setNewAlert({ alert_type: "budget_threshold", threshold_percentage: 50, budget_goal: totalBudget });
              setShowAddDialog(true);
            }}
          >
            50% Alert
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => {
              setNewAlert({ alert_type: "budget_threshold", threshold_percentage: 75, budget_goal: totalBudget });
              setShowAddDialog(true);
            }}
          >
            75% Alert
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => {
              setNewAlert({ alert_type: "budget_threshold", threshold_percentage: 90, budget_goal: totalBudget });
              setShowAddDialog(true);
            }}
          >
            90% Alert
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}