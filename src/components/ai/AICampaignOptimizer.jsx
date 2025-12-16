import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  TrendingUp, 
  Target, 
  DollarSign, 
  Users, 
  MapPin,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";

/**
 * AI Campaign Optimizer
 * Provides AI-powered suggestions for campaign optimization
 */
export default function AICampaignOptimizer({ campaign, booking, onApplySuggestion }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const analyzeAndOptimize = async () => {
    setLoading(true);
    try {
      // Gather campaign performance data
      const performanceData = {
        impressions: campaign?.impressions || booking?.impressions || 0,
        clicks: campaign?.clicks || 0,
        conversions: campaign?.conversions || 0,
        spend: campaign?.spend || booking?.total_cost || 0,
        budget: campaign?.budget || booking?.total_cost || 0,
        ctr: campaign?.impressions ? ((campaign.clicks / campaign.impressions) * 100).toFixed(2) : 0,
        cpc: campaign?.clicks ? (campaign.spend / campaign.clicks).toFixed(2) : 0,
        duration: campaign ? `${campaign.start_date} to ${campaign.end_date}` : 'N/A',
        targeting: {
          cities: campaign?.target_cities || [],
          venues: campaign?.target_venue_types || [],
          demographics: campaign?.target_demographics || {}
        }
      };

      const prompt = `You are an expert DOOH (Digital Out-of-Home) advertising campaign optimizer. 

CAMPAIGN PERFORMANCE DATA:
${JSON.stringify(performanceData, null, 2)}

Analyze this campaign and provide actionable optimization recommendations in the following categories:

1. TARGETING OPTIMIZATION: Suggest adjustments to location, venue types, or demographic targeting
2. BUDGET ALLOCATION: Recommend how to redistribute budget for better ROI
3. CREATIVE OPTIMIZATION: Suggest improvements to ad creative and messaging
4. TIMING & SCHEDULING: Recommend optimal time slots and duration adjustments
5. SCREEN SELECTION: Suggest adding/removing specific screen types or locations

For each recommendation, include:
- Priority level (High/Medium/Low)
- Expected impact (% improvement estimate)
- Implementation difficulty (Easy/Medium/Hard)
- Specific action items

Focus on data-driven insights that can maximize ROI and campaign effectiveness.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: {
              type: "number",
              description: "Campaign performance score 0-100"
            },
            key_insights: {
              type: "array",
              items: { type: "string" }
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  priority: { type: "string" },
                  expected_impact: { type: "string" },
                  difficulty: { type: "string" },
                  action_items: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            }
          }
        }
      });

      setSuggestions(response);
      toast.success("AI analysis complete!");
    } catch (error) {
      console.error("AI optimization error:", error);
      toast.error("Failed to generate AI suggestions");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      targeting: Target,
      budget: DollarSign,
      creative: Sparkles,
      timing: TrendingUp,
      screen: MapPin,
      default: Users
    };
    const Icon = icons[category?.toLowerCase()] || icons.default;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Analyze Button */}
      {!suggestions && (
        <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">AI Campaign Optimizer</CardTitle>
                <CardDescription>Get AI-powered recommendations to improve your campaign</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              onClick={analyzeAndOptimize}
              disabled={loading}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze & Optimize Campaign
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* AI Suggestions */}
      {suggestions && (
        <>
          {/* Performance Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Campaign Performance Score</span>
                <div className="text-3xl font-bold text-violet-600">
                  {suggestions.overall_score}/100
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-500"
                  style={{ width: `${suggestions.overall_score}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Key Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-600" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {suggestions.key_insights?.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700">{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-600" />
              AI Recommendations
            </h3>
            {suggestions.recommendations?.map((rec, index) => (
              <Card key={index} className="border-l-4 border-violet-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getCategoryIcon(rec.category)}
                      </div>
                      <div>
                        <CardTitle className="text-base mb-1">{rec.title}</CardTitle>
                        <CardDescription className="text-sm">{rec.description}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Impact & Difficulty */}
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-slate-600">Impact:</span>
                      <span className="font-medium text-green-600">{rec.expected_impact}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-slate-600">Difficulty:</span>
                      <span className="font-medium text-blue-600">{rec.difficulty}</span>
                    </div>
                  </div>

                  {/* Action Items */}
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Action Items:</p>
                    <ul className="space-y-1.5">
                      {rec.action_items?.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <ArrowRight className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Apply Button */}
                  {onApplySuggestion && (
                    <Button
                      onClick={() => onApplySuggestion(rec)}
                      variant="outline"
                      size="sm"
                      className="border-violet-200 hover:bg-violet-50"
                    >
                      Apply Suggestion
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Re-analyze Button */}
          <Button
            onClick={analyzeAndOptimize}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Re-analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Re-analyze Campaign
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
}