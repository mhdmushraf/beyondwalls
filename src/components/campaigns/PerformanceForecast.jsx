import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { format, addDays, differenceInDays, parseISO } from "date-fns";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Sparkles,
  Loader2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Eye,
  DollarSign,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";

export default function PerformanceForecast({ booking, screen, venue, historicalBookings = [] }) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (booking && screen) {
      generateForecast();
    }
  }, [booking?.id]);

  const generateForecast = async () => {
    if (!booking || !screen) return;

    setLoading(true);
    try {
      // Calculate historical averages from similar bookings
      const similarBookings = historicalBookings.filter(b => 
        b.screen_id === screen.id || 
        (venue && historicalBookings.some(hb => hb.screen_id === b.screen_id))
      );

      const avgImpressions = similarBookings.length > 0
        ? similarBookings.reduce((sum, b) => sum + (b.impressions || 500), 0) / similarBookings.length
        : screen.avg_daily_views || 300;

      // Use AI to generate forecast
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a performance forecast for a DOOH advertising campaign with the following details:
        
Campaign Details:
- Duration: ${differenceInDays(parseISO(booking.end_date), parseISO(booking.start_date))} days
- Screen Location: ${venue?.type || 'retail'} in ${venue?.city || 'Dubai'}
- Average Daily Footfall: ${venue?.avg_daily_footfall || 500}
- Screen Size: ${screen?.size || '55"'}
- Historical Average Impressions: ${avgImpressions}
- Budget: AED ${booking.total_cost}
- Start Date: ${booking.start_date}

Based on current market trends and seasonality, provide:
1. Daily impression forecast with confidence intervals
2. Expected engagement rate
3. Optimization recommendations
4. Risk factors
5. Performance score prediction (1-100)`,
        response_json_schema: {
          type: "object",
          properties: {
            daily_impressions_forecast: {
              type: "object",
              properties: {
                low: { type: "number" },
                expected: { type: "number" },
                high: { type: "number" }
              }
            },
            total_impressions_forecast: {
              type: "object",
              properties: {
                low: { type: "number" },
                expected: { type: "number" },
                high: { type: "number" }
              }
            },
            expected_engagement_rate: { type: "number" },
            cost_per_impression: { type: "number" },
            performance_score: { type: "number" },
            optimization_tips: {
              type: "array",
              items: { type: "string" }
            },
            risk_factors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  factor: { type: "string" },
                  impact: { type: "string" },
                  mitigation: { type: "string" }
                }
              }
            },
            weekly_trend: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  week: { type: "number" },
                  impressions: { type: "number" },
                  engagement: { type: "number" }
                }
              }
            },
            best_performing_days: { type: "array", items: { type: "string" } },
            confidence_level: { type: "string" }
          }
        }
      });

      setForecast(response);
    } catch (error) {
      console.error("Forecast error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return null;

  const daysRemaining = differenceInDays(parseISO(booking.end_date), new Date());
  const campaignDuration = differenceInDays(parseISO(booking.end_date), parseISO(booking.start_date));
  const progressPercent = Math.min(100, Math.max(0, ((campaignDuration - daysRemaining) / campaignDuration) * 100));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-violet-600" />
            Performance Forecast
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={generateForecast} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
          </div>
        ) : forecast ? (
          <div className="space-y-6">
            {/* Campaign Progress */}
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">Campaign Progress</span>
                <span className="text-sm font-medium">{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <p className="text-xs text-slate-400 mt-2">
                {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Campaign ended"}
              </p>
            </div>

            {/* Forecast Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-violet-600" />
                  <span className="text-xs text-slate-500">Projected Impressions</span>
                </div>
                <p className="text-xl font-bold text-violet-600">
                  {forecast.total_impressions_forecast?.expected?.toLocaleString() || "N/A"}
                </p>
                <p className="text-xs text-slate-400">
                  Range: {forecast.total_impressions_forecast?.low?.toLocaleString()} - {forecast.total_impressions_forecast?.high?.toLocaleString()}
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs text-slate-500">Engagement Rate</span>
                </div>
                <p className="text-xl font-bold text-emerald-600">
                  {forecast.expected_engagement_rate?.toFixed(1) || 0}%
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-amber-600" />
                  <span className="text-xs text-slate-500">Cost per Impression</span>
                </div>
                <p className="text-xl font-bold text-amber-600">
                  AED {forecast.cost_per_impression?.toFixed(3) || 0}
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-slate-500">Performance Score</span>
                </div>
                <p className="text-xl font-bold text-blue-600">
                  {forecast.performance_score || 0}/100
                </p>
                <Badge 
                  variant="secondary" 
                  className={
                    forecast.performance_score >= 80 ? "bg-emerald-100 text-emerald-700" :
                    forecast.performance_score >= 60 ? "bg-amber-100 text-amber-700" :
                    "bg-rose-100 text-rose-700"
                  }
                >
                  {forecast.confidence_level || "Medium Confidence"}
                </Badge>
              </div>
            </div>

            {/* Weekly Trend Chart */}
            {forecast.weekly_trend && forecast.weekly_trend.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Projected Weekly Performance</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecast.weekly_trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="week" tickFormatter={(v) => `Week ${v}`} stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                        formatter={(value, name) => [value.toLocaleString(), name === "impressions" ? "Impressions" : "Engagement %"]}
                      />
                      <Area type="monotone" dataKey="impressions" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Optimization Tips */}
            {forecast.optimization_tips && forecast.optimization_tips.length > 0 && (
              <div className="bg-emerald-50 rounded-xl p-4">
                <h4 className="font-medium text-emerald-800 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Optimization Recommendations
                </h4>
                <ul className="space-y-2">
                  {forecast.optimization_tips.map((tip, i) => (
                    <li key={i} className="text-sm text-emerald-700 flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risk Factors */}
            {forecast.risk_factors && forecast.risk_factors.length > 0 && (
              <div className="bg-amber-50 rounded-xl p-4">
                <h4 className="font-medium text-amber-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Risk Factors
                </h4>
                <div className="space-y-3">
                  {forecast.risk_factors.map((risk, i) => (
                    <div key={i} className="bg-white rounded-lg p-3">
                      <p className="font-medium text-slate-900 text-sm">{risk.factor}</p>
                      <p className="text-xs text-amber-600 mt-1">Impact: {risk.impact}</p>
                      <p className="text-xs text-slate-500 mt-1">Mitigation: {risk.mitigation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Best Days */}
            {forecast.best_performing_days && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500">Best performing days:</span>
                <span className="font-medium text-slate-900">{forecast.best_performing_days.join(", ")}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">Click refresh to generate AI forecast</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}