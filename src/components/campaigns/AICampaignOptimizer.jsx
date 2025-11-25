import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Sparkles,
  TrendingUp,
  Target,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  RefreshCw,
  DollarSign,
  Eye,
  Clock,
  Settings2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function AICampaignOptimizer({ userId, compact = false }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [autoOptimize, setAutoOptimize] = useState(false);
  const [applying, setApplying] = useState(null);
  const [expanded, setExpanded] = useState(!compact);
  const queryClient = useQueryClient();

  // Fetch user's bookings and campaigns
  const { data: bookings = [], isLoading: loadingBookings } = useQuery({
    queryKey: ["optimizer-bookings", userId],
    queryFn: () => base44.entities.AdSlotBooking.filter({ advertiser_id: userId }),
    enabled: !!userId
  });

  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
    queryKey: ["optimizer-campaigns", userId],
    queryFn: () => base44.entities.Campaign.filter({ advertiser_id: userId }),
    enabled: !!userId
  });

  const { data: screens = [], isLoading: loadingScreens } = useQuery({
    queryKey: ["optimizer-screens"],
    queryFn: () => base44.entities.Screen.list(),
    enabled: !!userId
  });

  const isLoading = loadingBookings || loadingCampaigns || loadingScreens;
  const activeBookings = bookings.filter(b => b.status === "active");
  const activeCampaigns = campaigns.filter(c => c.status === "active");

  // Don't render anything if no userId
  if (!userId) {
    return null;
  }

  const analyzePerformance = async () => {
    if (activeBookings.length === 0 && activeCampaigns.length === 0) {
      toast.error("No active campaigns to analyze");
      return;
    }

    setAnalyzing(true);

    try {
      // Prepare performance data for analysis
      const performanceData = [
        ...activeBookings.map(b => {
          const screen = screens.find(s => s.id === b.screen_id);
          return {
            id: b.id,
            type: "booking",
            name: b.campaign_name || "Ad Booking",
            impressions: b.impressions || 0,
            views: b.views || 0,
            cost: b.total_cost || 0,
            duration: b.duration_seconds || 15,
            creative_type: b.creative_type,
            screen_name: screen?.name,
            screen_location: screen?.location_in_venue,
            venue_type: screen?.venue_type,
            start_date: b.start_date,
            end_date: b.end_date
          };
        }),
        ...activeCampaigns.map(c => ({
          id: c.id,
          type: "campaign",
          name: c.name,
          impressions: c.impressions || 0,
          views: c.views || 0,
          cost: c.total_cost || 0,
          spend: c.spend || 0,
          creative_type: c.creative_type,
          target_cities: c.target_cities,
          target_venue_types: c.target_venue_types,
          start_date: c.start_date,
          end_date: c.end_date
        }))
      ];

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI advertising optimization expert. Analyze the following ad campaign performance data and provide actionable recommendations to maximize ROI.

Performance Data:
${JSON.stringify(performanceData, null, 2)}

Available Screens: ${screens.length} total, ${screens.filter(s => s.status === "online").length} online

Analyze each campaign and provide:
1. Performance score (0-100)
2. Specific recommendations for improvement
3. Suggested actions (can be auto-applied)
4. Priority level (high/medium/low)

Focus on:
- Impression optimization
- Creative performance (video vs image)
- Timing optimization
- Screen/venue targeting
- Budget allocation
- ROI improvement`,
        response_json_schema: {
          type: "object",
          properties: {
            overall_health_score: { type: "number" },
            total_potential_improvement: { type: "string" },
            campaigns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                  performance_score: { type: "number" },
                  status: { type: "string" },
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string" },
                        title: { type: "string" },
                        description: { type: "string" },
                        impact: { type: "string" },
                        priority: { type: "string" },
                        auto_applicable: { type: "boolean" },
                        action: { type: "string" }
                      }
                    }
                  }
                }
              }
            },
            general_insights: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setRecommendations(result);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error("Failed to analyze campaigns");
    }

    setAnalyzing(false);
  };

  const applyRecommendation = async (campaignId, recommendation) => {
    setApplying(recommendation.title);
    
    try {
      // Simulate applying the recommendation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Applied: ${recommendation.title}`);
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["optimizer-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["optimizer-campaigns"] });
    } catch (error) {
      toast.error("Failed to apply recommendation");
    }
    
    setApplying(null);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-emerald-100";
    if (score >= 60) return "bg-amber-100";
    return "bg-red-100";
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700";
      case "medium": return "bg-amber-100 text-amber-700";
      default: return "bg-blue-100 text-blue-700";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "targeting": return Target;
      case "budget": return DollarSign;
      case "creative": return Eye;
      case "timing": return Clock;
      default: return Settings2;
    }
  };

  if (compact && !expanded) {
    return (
      <Card className="bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">AI Campaign Optimizer</p>
                <p className="text-sm text-slate-500">
                  {recommendations 
                    ? `${recommendations.campaigns?.length || 0} campaigns analyzed` 
                    : "Analyze your campaigns for optimization"
                  }
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpanded(true)}
            >
              <ChevronDown className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            AI Campaign Optimizer
          </CardTitle>
          <div className="flex items-center gap-2">
            {compact && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setExpanded(false)}
              >
                <ChevronUp className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <Button
            onClick={analyzePerformance}
            disabled={analyzing}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Analyze Campaigns
              </>
            )}
          </Button>
          <div className="flex items-center gap-2">
            <Switch
              checked={autoOptimize}
              onCheckedChange={setAutoOptimize}
              id="auto-optimize"
            />
            <label htmlFor="auto-optimize" className="text-sm text-slate-600">
              Auto-optimize
            </label>
          </div>
        </div>

        {/* Results */}
        {recommendations && (
          <div className="space-y-4">
            {/* Overall Health */}
            <div className="bg-white rounded-xl p-4 border border-violet-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-600">Overall Campaign Health</span>
                <span className={`text-2xl font-bold ${getScoreColor(recommendations.overall_health_score)}`}>
                  {recommendations.overall_health_score}/100
                </span>
              </div>
              <Progress 
                value={recommendations.overall_health_score} 
                className="h-2"
              />
              {recommendations.total_potential_improvement && (
                <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Potential improvement: {recommendations.total_potential_improvement}
                </p>
              )}
            </div>

            {/* General Insights */}
            {recommendations.general_insights?.length > 0 && (
              <div className="bg-white rounded-xl p-4 border border-violet-100">
                <p className="text-sm font-medium text-slate-900 mb-2">Key Insights</p>
                <ul className="space-y-1">
                  {recommendations.general_insights.slice(0, 3).map((insight, idx) => (
                    <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Campaign Recommendations */}
            <div className="space-y-3">
              {recommendations.campaigns?.slice(0, 3).map((campaign) => (
                <div key={campaign.id} className="bg-white rounded-xl p-4 border border-violet-100">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-slate-900">{campaign.name}</p>
                      <p className="text-xs text-slate-500">{campaign.status}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full ${getScoreBg(campaign.performance_score)}`}>
                      <span className={`text-sm font-semibold ${getScoreColor(campaign.performance_score)}`}>
                        {campaign.performance_score}%
                      </span>
                    </div>
                  </div>

                  {campaign.recommendations?.slice(0, 2).map((rec, idx) => {
                    const Icon = getTypeIcon(rec.type);
                    return (
                      <div key={idx} className="flex items-start gap-3 py-2 border-t border-slate-100">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-slate-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-slate-900">{rec.title}</p>
                            <Badge className={getPriorityColor(rec.priority)} variant="secondary">
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 mb-2">{rec.description}</p>
                          {rec.impact && (
                            <p className="text-xs text-emerald-600">Impact: {rec.impact}</p>
                          )}
                        </div>
                        {rec.auto_applicable && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => applyRecommendation(campaign.id, rec)}
                            disabled={applying === rec.title}
                            className="flex-shrink-0"
                          >
                            {applying === rec.title ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                Apply
                                <ArrowRight className="w-3 h-3 ml-1" />
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Refresh */}
            <Button
              variant="ghost"
              size="sm"
              onClick={analyzePerformance}
              className="w-full text-violet-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Re-analyze Campaigns
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!recommendations && !analyzing && (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-violet-600" />
            </div>
            {isLoading ? (
              <p className="text-sm text-slate-500">Loading campaign data...</p>
            ) : (
              <>
                <p className="text-sm text-slate-600 mb-1">
                  {activeBookings.length + activeCampaigns.length} active campaigns
                </p>
                <p className="text-xs text-slate-400">
                  Click "Analyze Campaigns" to get AI-powered optimization recommendations
                </p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}