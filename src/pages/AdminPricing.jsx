import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  DollarSign,
  Plus,
  Pencil,
  Trash2,
  Zap,
  Clock,
  Calendar,
  TrendingUp,
  Building2,
  Sun,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";

const RULE_TYPES = [
  { value: "time_of_day", label: "Time of Day", icon: Clock, description: "Adjust prices based on hours" },
  { value: "day_of_week", label: "Day of Week", icon: Calendar, description: "Weekend/weekday pricing" },
  { value: "seasonal", label: "Seasonal", icon: Sun, description: "Holiday and seasonal rates" },
  { value: "demand", label: "Demand-Based", icon: TrendingUp, description: "Auto-adjust by occupancy" },
  { value: "venue_type", label: "Venue Type", icon: Building2, description: "Premium venue pricing" },
];

const SUGGESTED_RULES = [
  { name: "Lunch Rush Premium", type: "time_of_day", multiplier: 1.2, conditions: { hours: "11-14" }, priority: 2 },
  { name: "Evening Peak", type: "time_of_day", multiplier: 1.25, conditions: { hours: "17-21" }, priority: 2 },
  { name: "Weekend Premium", type: "day_of_week", multiplier: 1.15, conditions: { days: [5, 6] }, priority: 1 },
  { name: "Winter Season (Peak)", type: "seasonal", multiplier: 1.2, start_date: "2025-11-01", end_date: "2026-02-28", priority: 3 },
  { name: "Summer Discount", type: "seasonal", multiplier: 0.85, start_date: "2025-06-01", end_date: "2025-08-31", priority: 3 },
  { name: "Ramadan Special", type: "seasonal", multiplier: 1.3, start_date: "2026-02-28", end_date: "2026-03-30", priority: 4 },
  { name: "High Demand Surge", type: "demand", multiplier: 1.3, conditions: { occupancy_min: 0.8 }, priority: 5 },
  { name: "Low Demand Discount", type: "demand", multiplier: 0.85, conditions: { occupancy_max: 0.2 }, priority: 5 },
  { name: "Mall Premium", type: "venue_type", multiplier: 1.25, conditions: { venue_types: ["mall"] }, priority: 1 },
  { name: "Hotel Premium", type: "venue_type", multiplier: 1.2, conditions: { venue_types: ["hotel"] }, priority: 1 },
];

export default function AdminPricing() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "time_of_day",
    multiplier: 1.0,
    conditions: {},
    priority: 1,
    is_active: true,
    start_date: "",
    end_date: ""
  });

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["pricing-rules"],
    queryFn: () => base44.entities.PricingRule.list()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PricingRule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-rules"] });
      toast.success("Pricing rule created");
      setShowDialog(false);
      resetForm();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PricingRule.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-rules"] });
      toast.success("Pricing rule updated");
      setShowDialog(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PricingRule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing-rules"] });
      toast.success("Pricing rule deleted");
    }
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.PricingRule.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pricing-rules"] })
  });

  const resetForm = () => {
    setFormData({
      name: "",
      type: "time_of_day",
      multiplier: 1.0,
      conditions: {},
      priority: 1,
      is_active: true,
      start_date: "",
      end_date: ""
    });
    setEditingRule(null);
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      type: rule.type,
      multiplier: rule.multiplier,
      conditions: rule.conditions || {},
      priority: rule.priority || 1,
      is_active: rule.is_active !== false,
      start_date: rule.start_date || "",
      end_date: rule.end_date || ""
    });
    setShowDialog(true);
  };

  const handleSubmit = () => {
    if (editingRule) {
      updateMutation.mutate({ id: editingRule.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleApplySuggested = async (suggestion) => {
    await base44.entities.PricingRule.create({
      ...suggestion,
      is_active: true
    });
    queryClient.invalidateQueries({ queryKey: ["pricing-rules"] });
    toast.success(`Applied: ${suggestion.name}`);
  };

  const getRuleIcon = (type) => {
    const ruleType = RULE_TYPES.find(r => r.value === type);
    return ruleType?.icon || Zap;
  };

  const existingRuleNames = rules.map(r => r.name);
  const availableSuggestions = SUGGESTED_RULES.filter(s => !existingRuleNames.includes(s.name));

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Dynamic Pricing</h1>
          <p className="text-slate-500">Manage pricing rules and multipliers</p>
        </div>
        <Button 
          onClick={() => { resetForm(); setShowDialog(true); }}
          className="bg-gradient-to-r from-violet-600 to-indigo-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Rule
        </Button>
      </div>

      {/* Suggested Rules */}
      {availableSuggestions.length > 0 && (
        <Card className="mb-8 border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-amber-600" />
              Suggested Pricing Rules
            </CardTitle>
            <CardDescription>
              Click to automatically apply these optimized pricing strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {availableSuggestions.slice(0, 6).map((suggestion, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  className="bg-white"
                  onClick={() => handleApplySuggested(suggestion)}
                >
                  {suggestion.multiplier > 1 ? "+" : ""}{((suggestion.multiplier - 1) * 100).toFixed(0)}% {suggestion.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Rules */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rules.map((rule) => {
            const Icon = getRuleIcon(rule.type);
            return (
              <Card key={rule.id} className={`${!rule.is_active ? 'opacity-60' : ''}`}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        rule.multiplier > 1 ? 'bg-rose-100' : 'bg-emerald-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          rule.multiplier > 1 ? 'text-rose-600' : 'text-emerald-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{rule.name}</h3>
                        <Badge variant="outline" className="text-xs capitalize">
                          {rule.type.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                    <Switch
                      checked={rule.is_active !== false}
                      onCheckedChange={(checked) => toggleMutation.mutate({ id: rule.id, is_active: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-500 text-sm">Multiplier</span>
                    <span className={`text-2xl font-bold ${
                      rule.multiplier > 1 ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {rule.multiplier > 1 ? '+' : ''}{((rule.multiplier - 1) * 100).toFixed(0)}%
                    </span>
                  </div>

                  {rule.start_date && rule.end_date && (
                    <div className="text-xs text-slate-500 mb-3">
                      {format(new Date(rule.start_date), "MMM d")} - {format(new Date(rule.end_date), "MMM d, yyyy")}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(rule)}>
                      <Pencil className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-rose-600 hover:bg-rose-50"
                      onClick={() => deleteMutation.mutate(rule.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {rules.length === 0 && (
            <div className="col-span-full text-center py-12">
              <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No pricing rules configured</p>
              <p className="text-sm text-slate-400">Add rules or apply suggestions above</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRule ? "Edit Pricing Rule" : "Add Pricing Rule"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rule Name</Label>
              <Input
                placeholder="e.g., Weekend Premium"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Rule Type</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RULE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Price Multiplier ({((formData.multiplier - 1) * 100).toFixed(0)}%)</Label>
              <Input
                type="number"
                step="0.05"
                min="0.5"
                max="3"
                value={formData.multiplier}
                onChange={(e) => setFormData({ ...formData, multiplier: parseFloat(e.target.value) })}
              />
              <p className="text-xs text-slate-500 mt-1">
                1.0 = no change, 1.2 = +20%, 0.8 = -20%
              </p>
            </div>
            <div>
              <Label>Priority (Higher = Applied First)</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              />
            </div>
            {formData.type === "seasonal" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.name || createMutation.isPending || updateMutation.isPending}
              className="bg-gradient-to-r from-violet-600 to-indigo-600"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editingRule ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}