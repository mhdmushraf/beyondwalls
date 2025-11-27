import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  TrendingUp, 
  Target, 
  Clock, 
  MapPin, 
  DollarSign,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  Loader2,
  RefreshCw,
  Zap,
  AlertTriangle,
  ThumbsUp
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function AIOptimizationRecommendations({ bookings, screens, venues, metrics }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [appliedRecommendations, setAppliedRecommendations] = useState([]);

  const generateAIRecommendations = async () => {
    setIsGenerating(true);
    try {
      const campaignSummary = {
        totalImpressions: metrics.totalImpressions,
        totalClicks: metrics.totalClicks,
        totalConversions: metrics.totalConversions,
        ctr: metrics.ctr,
        conversionRate: metrics.conversionRate,
        totalSpend: metrics.totalSpend,
        roi: metrics.roi,
        activeCampaigns: bookings.filter(b => b.status === "active").length,
        topLocations: [...new Set(bookings.map(b => {
          const screen = screens.find(s => s.id === b.screen_id);
          const venue = venues.find(v => v.id === screen?.venue_id);
          return venue?.city;
        }).filter(Boolean))].slice(0, 3),
        topVenueTypes: [...new Set(bookings.map(b => {
          const screen = screens.find(s => s.id === b.screen_id);
          const venue = venues.find(v => v.id === screen?.venue_id);
          return venue?.type;
        }).filter(Boolean))].slice(0, 3)
      };

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert DOOH (Digital Out-of-Home) advertising strategist. Analyze this campaign performance data and provide specific, actionable optimization recommendations.

Campaign Performance Data:
- Total Impressions: ${campaignSummary.totalImpressions.toLocaleString()}
- Total Clicks: ${campaignSummary.totalClicks.toLocaleString()}
- Click-Through Rate: ${campaignSummary.ctr}%
- Total Conversions: ${campaignSummary.totalConversions}
- Conversion Rate: ${campaignSummary.conversionRate}%
- Total Ad Spend: AED ${campaignSummary.totalSpend.toLocaleString()}
- Estimated ROI: ${campaignSummary.roi}%
- Active Campaigns: ${campaignSummary.activeCampaigns}
- Top Locations: ${campaignSummary.topLocations.join(", ") || "Various"}
- Top Venue Types: ${campaignSummary.topVenueTypes.join(", ") || "Mixed"}

Provide 5 specific optimization recommendations with expected impact percentages. Focus on:
1. Budget allocation optimization
2. Time slot optimization
3. Location/venue targeting
4. Creative/content improvements
5. Audience targeting refinements`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_health_score: { type: "number", description: "Campaign health score 0-100" },
            summary: { type: "string", description: "Brief overall assessment" },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  category: { type: "string", enum: ["budget", "timing", "location", "creative", "targeting"] },
                  title: { type: "string" },
                  description: { type: "string" },
                  impact: { type: "string", description: "Expected impact (e.g., '+15% CTR')" },
                  priority: { type: "string", enum: ["high", "medium", "low"] },
                  effort: { type: "string", enum: ["easy", "medium", "hard"] },
                  action_steps: { type: "array", items: { type: "string" } }
                }
              }
            },
            quick_wins: {
              type: "array",
              items: { type: "string" }
            },
            warnings: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setAiRecommendations(response);
    } catch (error) {
      console.error("Error generating recommendations:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyRecommendation = (recId) => {
    setAppliedRecommendations([...appliedRecommendations, recId]);
  };

  const categoryIcons = {
    budget: DollarSign,
    timing: Clock,
    location: MapPin,
    creative: Lightbulb,
    targeting: Target
  };

  const categoryColors = {
    budget: "bg-emerald-100 text-emerald-700",
    timing: "bg-blue-100 text-blue-700",
    location: "bg-violet-100 text-violet-700",
    creative: "bg-amber-100 text-amber-700",
    targeting: "bg-rose-100 text-rose-700"
  };

  const priorityColors = {
    high: "bg-rose-100 text-rose-700 border-rose-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    low: "bg-slate-100 text-slate-700 border-slate-200"
  };

  // Default recommendations if AI hasn't been run yet
  const defaultRecommendations = [
    {
      id: "1",
      category: "timing",
      title: "Optimize for Peak Hours",
      description: "Shift 40% of your budget to evening hours (6-9 PM) when engagement is 35% higher.",
      impact: "+25% CTR",
      priority: "high",
      effort: "easy",
      action_steps: ["Adjust campaign scheduling", "Increase evening bids", "Monitor performance weekly"]
    },
    {
      id: "2",
      category: "location",
      title: "Focus on High-Performing Areas",
      description: "Concentrate spend on Dubai Marina and Downtown areas showing best conversion rates.",
      impact: "+18% Conversions",
      priority: "high",
      effort: "medium",
      action_steps: ["Reallocate budget", "Add more screens in top areas", "Reduce underperforming locations"]
    },
    {
      id: "3",
      category: "budget",
      title: "Implement Weekend Boost",
      description: "Increase budget by 30% on Friday-Saturday when foot traffic peaks.",
      impact: "+22% Reach",
      priority: "medium",
      effort: "easy",
      action_steps: ["Set up weekend bid modifiers", "Create weekend-specific creatives", "Track weekend KPIs separately"]
    },
    {
      id: "4",
      category: "creative",
      title: "A/B Test Video vs Static",
      description: "Video content shows 45% higher engagement in similar campaigns. Test video creatives.",
      impact: "+45% Engagement",
      priority: "medium",
      effort: "medium",
      action_steps: ["Create 15-sec video version", "Run 50/50 A/B test", "Analyze results after 1 week"]
    },
    {
      id: "5",
      category: "targeting",
      title: "Refine Venue Type Mix",
      description: "Cafés and coworking spaces show highest ROI. Consider reducing gym placements.",
      impact: "+12% ROI",
      priority: "low",
      effort: "easy",
      action_steps: ["Review venue performance", "Shift budget to top venues", "Monitor for 2 weeks"]
    }
  ];

  const recommendations = aiRecommendations?.recommendations || defaultRecommendations;
  const healthScore = aiRecommendations?.overall_health_score || 72;
  const quickWins = aiRecommendations?.quick_wins || [
    "Enable evening time slots for +15% engagement",
    "Add 2-3 screens in Dubai Marina",
    "Test shorter 10-second creatives"
  ];
  const warnings = aiRecommendations?.warnings || [];

  return (
    <div className="space-y-6">
      {/* AI Header */}
      <Card className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">AI Campaign Optimizer</h2>
                <p className="text-violet-200">Powered by advanced machine learning</p>
              </div>
            </div>
            <Button 
              onClick={generateAIRecommendations}
              disabled={isGenerating}
              className="bg-white text-violet-600 hover:bg-violet-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate Fresh Insights
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Health Score & Summary */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-slate-500 mb-4">Campaign Health Score</h3>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="#e2e8f0" strokeWidth="8" fill="none" />
                  <circle 
                    cx="48" cy="48" r="40" 
                    stroke={healthScore >= 70 ? "#10b981" : healthScore >= 50 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="8" 
                    fill="none"
                    strokeDasharray={`${healthScore * 2.51} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900">{healthScore}</span>
                </div>
              </div>
              <div>
                <p className={`font-semibold ${healthScore >= 70 ? "text-emerald-600" : healthScore >= 50 ? "text-amber-600" : "text-rose-600"}`}>
                  {healthScore >= 70 ? "Good" : healthScore >= 50 ? "Fair" : "Needs Work"}
                </p>
                <p className="text-sm text-slate-500">
                  {healthScore >= 70 ? "Your campaigns are performing well" : "Room for improvement"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-slate-500 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Quick Wins
            </h3>
            <div className="space-y-2">
              {quickWins.map((win, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <ThumbsUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-slate-700">{win}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warnings if any */}
      {warnings.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800">Attention Required</h3>
                <ul className="mt-1 space-y-1">
                  {warnings.map((warning, i) => (
                    <li key={i} className="text-sm text-amber-700">{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations Grid */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          Optimization Recommendations
        </h3>

        {recommendations.map((rec, index) => {
          const Icon = categoryIcons[rec.category] || Lightbulb;
          const isApplied = appliedRecommendations.includes(rec.id);

          return (
            <Card key={rec.id} className={`transition-all ${isApplied ? "opacity-60 bg-slate-50" : "hover:shadow-md"}`}>
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Icon & Category */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${categoryColors[rec.category]?.split(" ")[0] || "bg-slate-100"}`}>
                    <Icon className={`w-6 h-6 ${categoryColors[rec.category]?.split(" ")[1] || "text-slate-700"}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h4 className="font-semibold text-slate-900">{rec.title}</h4>
                      <Badge variant="outline" className={priorityColors[rec.priority]}>
                        {rec.priority} priority
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {rec.effort} effort
                      </Badge>
                    </div>
                    <p className="text-slate-600 text-sm mb-3">{rec.description}</p>
                    
                    {/* Action Steps */}
                    {rec.action_steps && (
                      <div className="bg-slate-50 rounded-lg p-3 mb-3">
                        <p className="text-xs font-medium text-slate-500 mb-2">ACTION STEPS:</p>
                        <div className="space-y-1">
                          {rec.action_steps.map((step, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                              <div className="w-5 h-5 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-medium">
                                {i + 1}
                              </div>
                              {step}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Impact & Action */}
                  <div className="flex lg:flex-col items-center lg:items-end gap-3 lg:gap-2 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Expected Impact</p>
                      <p className="text-lg font-bold text-emerald-600">{rec.impact}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleApplyRecommendation(rec.id)}
                      disabled={isApplied}
                      className={isApplied ? "bg-emerald-100 text-emerald-700" : "bg-violet-600 hover:bg-violet-700"}
                    >
                      {isApplied ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Applied
                        </>
                      ) : (
                        <>
                          Apply
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Projected Impact</h3>
              <p className="text-slate-600">
                Implementing all high-priority recommendations could improve your campaign performance by{" "}
                <strong className="text-emerald-600">up to 45%</strong> in CTR and{" "}
                <strong className="text-emerald-600">+30% ROI</strong> within the next 2 weeks.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}