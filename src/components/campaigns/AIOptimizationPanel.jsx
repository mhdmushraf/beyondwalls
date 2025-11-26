import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Zap,
  Clock,
  Target,
  Loader2,
  ChevronRight,
  Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function AIOptimizationPanel({ campaign, onUpdate }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [applyingOptimization, setApplyingOptimization] = useState(null);

  const analyzePerformance = async () => {
    setAnalyzing(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this DOOH campaign and provide optimization recommendations:

CAMPAIGN DATA:
- Name: ${campaign.name}
- Goal: ${campaign.goal}
- Target KPI: ${campaign.target_kpi || "Not set"}
- Budget: AED ${campaign.budget || campaign.total_cost}
- Duration: ${campaign.start_date} to ${campaign.end_date}
- Target Cities: ${campaign.target_cities?.join(", ") || "All"}
- Target Venues: ${campaign.target_venue_types?.join(", ") || "All"}
- Time Slots: ${campaign.time_slots?.join(", ") || "All day"}

CURRENT PERFORMANCE:
- Impressions: ${campaign.impressions || 0}
- Spend: AED ${campaign.spend || 0}
- Performance Score: ${campaign.performance_score || "Not calculated"}

Provide specific, actionable optimization recommendations to improve campaign performance.`,
        response_json_schema: {
          type: "object",
          properties: {
            performance_score: { type: "number", description: "Score 0-100" },
            status: { type: "string", enum: ["excellent", "good", "needs_attention", "poor"] },
            summary: { type: "string" },
            optimizations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  impact: { type: "string", enum: ["high", "medium", "low"] },
                  type: { type: "string", enum: ["timing", "targeting", "budget", "creative", "placement"] },
                  action: { type: "string" },
                  estimated_improvement: { type: "string" }
                }
              }
            },
            predicted_results: {
              type: "object",
              properties: {
                impressions: { type: "number" },
                engagement_rate: { type: "number" },
                cost_per_impression: { type: "number" }
              }
            }
          }
        }
      });

      setSuggestions(response);
      
      // Update campaign with performance score
      if (onUpdate && response.performance_score) {
        await onUpdate({ performance_score: response.performance_score });
      }
      
      toast.success("Analysis complete!");
    } catch (error) {
      toast.error("Failed to analyze campaign");
    }
    setAnalyzing(false);
  };

  const applyOptimization = async (optimization) => {
    setApplyingOptimization(optimization.id);
    try {
      // Log the optimization
      const currentOptimizations = campaign.ai_optimizations || [];
      await onUpdate({
        ai_optimizations: [
          ...currentOptimizations,
          {
            ...optimization,
            applied_at: new Date().toISOString(),
            status: "applied"
          }
        ]
      });
      
      toast.success(`Applied: ${optimization.title}`);
    } catch (error) {
      toast.error("Failed to apply optimization");
    }
    setApplyingOptimization(null);
  };

  const statusColors = {
    excellent: "text-emerald-600 bg-emerald-50",
    good: "text-blue-600 bg-blue-50",
    needs_attention: "text-amber-600 bg-amber-50",
    poor: "text-red-600 bg-red-50"
  };

  const impactColors = {
    high: "bg-red-100 text-red-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-blue-100 text-blue-700"
  };

  return (
    <div className="space-y-6">
      {/* Auto-Optimize Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">AI Auto-Optimization</p>
                <p className="text-sm text-slate-500">Let AI automatically optimize your campaign</p>
              </div>
            </div>
            <Switch
              checked={campaign.auto_optimize || false}
              onCheckedChange={(checked) => onUpdate({ auto_optimize: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Analyze Button */}
      <Button
        onClick={analyzePerformance}
        disabled={analyzing}
        className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600"
      >
        {analyzing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Analyzing Campaign...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Analyze & Get AI Recommendations
          </>
        )}
      </Button>

      {/* Results */}
      {suggestions && (
        <>
          {/* Performance Score */}
          <Card className={statusColors[suggestions.status]}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium opacity-80">Performance Score</p>
                  <p className="text-4xl font-bold">{suggestions.performance_score}/100</p>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-current flex items-center justify-center">
                  {suggestions.status === "excellent" && <CheckCircle2 className="w-8 h-8" />}
                  {suggestions.status === "good" && <TrendingUp className="w-8 h-8" />}
                  {suggestions.status === "needs_attention" && <AlertTriangle className="w-8 h-8" />}
                  {suggestions.status === "poor" && <AlertTriangle className="w-8 h-8" />}
                </div>
              </div>
              <p className="text-sm opacity-90">{suggestions.summary}</p>
            </CardContent>
          </Card>

          {/* Predicted Results */}
          {suggestions.predicted_results && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-violet-600" />
                  Predicted Results (After Optimization)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-violet-600">
                      {suggestions.predicted_results.impressions?.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">Est. Impressions</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-emerald-600">
                      {suggestions.predicted_results.engagement_rate}%
                    </p>
                    <p className="text-xs text-slate-500">Engagement Rate</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      AED {suggestions.predicted_results.cost_per_impression?.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500">Cost/Impression</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Optimization Suggestions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Optimization Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestions.optimizations?.map((opt, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-slate-200 rounded-xl hover:border-violet-200 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-slate-900">{opt.title}</p>
                        <Badge className={impactColors[opt.impact]} variant="secondary">
                          {opt.impact} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{opt.description}</p>
                      <p className="text-xs text-emerald-600 font-medium">
                        📈 {opt.estimated_improvement}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => applyOptimization(opt)}
                      disabled={applyingOptimization === opt.id}
                    >
                      {applyingOptimization === opt.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Apply
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}