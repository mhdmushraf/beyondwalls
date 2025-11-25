import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  TrendingUp,
  Clock,
  MapPin,
  DollarSign,
  Target,
  Loader2,
  ChevronRight,
  Star,
  Zap,
  Calendar,
  Building2,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AIRecommendations({ 
  user, 
  screens = [], 
  venues = [], 
  onSelectScreen,
  currentBookings = []
}) {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { data: userBookings = [] } = useQuery({
    queryKey: ["user-bookings", user?.email],
    queryFn: () => base44.entities.AdSlotBooking.filter({ advertiser_id: user?.email }),
    enabled: !!user?.email
  });

  const { data: allBookings = [] } = useQuery({
    queryKey: ["all-bookings-stats"],
    queryFn: () => base44.entities.AdSlotBooking.list()
  });

  const { data: pricingRules = [] } = useQuery({
    queryKey: ["pricing-rules"],
    queryFn: () => base44.entities.PricingRule.list()
  });

  const generateRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      // Prepare context data
      const userHistory = userBookings.map(b => ({
        venue_type: venues.find(v => v.id === screens.find(s => s.id === b.screen_id)?.venue_id)?.type,
        screen_size: screens.find(s => s.id === b.screen_id)?.size,
        duration_weeks: b.weeks_booked,
        cost: b.total_cost,
        status: b.status
      }));

      const availableScreensData = screens.map(s => {
        const venue = venues.find(v => v.id === s.venue_id);
        const screenBookings = allBookings.filter(b => b.screen_id === s.id && b.status === "active");
        return {
          id: s.id,
          name: s.name,
          venue_name: venue?.name,
          venue_type: venue?.type,
          city: venue?.city,
          size: s.size,
          price: s.slot_price,
          available_slots: 5 - screenBookings.length,
          avg_daily_views: s.avg_daily_views || 500
        };
      });

      const activePricingRules = pricingRules.filter(r => r.is_active);

      const prompt = `You are an AI advertising consultant for a DOOH (Digital Out-of-Home) advertising platform in the UAE. Analyze the following data and provide personalized campaign recommendations.

USER PROFILE:
- Wallet Balance: AED ${user?.wallet_balance || 0}
- Past Bookings: ${JSON.stringify(userHistory)}
- Total Spent: AED ${user?.total_spent || 0}

AVAILABLE SCREENS:
${JSON.stringify(availableScreensData.slice(0, 15))}

ACTIVE PRICING RULES:
${JSON.stringify(activePricingRules)}

CURRENT DATE: ${new Date().toISOString().split('T')[0]}

Based on this data, provide recommendations in the following categories:
1. TOP SCREEN PICKS: Best 3 screens based on value, availability, and fit with user's history
2. OPTIMAL TIMING: Best times/days to book for lower prices
3. BUDGET OPTIMIZATION: How to maximize reach within their wallet balance
4. TRENDING VENUES: Venue types performing well currently
5. DURATION TIPS: Recommended booking duration for best ROI

Be specific with screen names and actionable advice.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            top_screens: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  screen_id: { type: "string" },
                  screen_name: { type: "string" },
                  reason: { type: "string" },
                  match_score: { type: "number" },
                  suggested_weeks: { type: "number" },
                  estimated_cost: { type: "number" }
                }
              }
            },
            timing_recommendations: {
              type: "object",
              properties: {
                best_days: { type: "array", items: { type: "string" } },
                best_hours: { type: "string" },
                avoid_periods: { type: "array", items: { type: "string" } },
                potential_savings: { type: "string" }
              }
            },
            budget_tips: {
              type: "array",
              items: { type: "string" }
            },
            trending_venues: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  venue_type: { type: "string" },
                  trend: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            duration_recommendation: {
              type: "object",
              properties: {
                optimal_weeks: { type: "number" },
                reason: { type: "string" },
                discount_tip: { type: "string" }
              }
            },
            personalized_message: { type: "string" }
          }
        }
      });

      setRecommendations(response);
    } catch (err) {
      console.error("AI recommendation error:", err);
      setError("Failed to generate recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && screens.length > 0 && venues.length > 0) {
      generateRecommendations();
    }
  }, [user?.email, screens.length, venues.length]);

  if (loading) {
    return (
      <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50">
        <CardContent className="py-12 text-center">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-violet-700 font-medium">AI is analyzing your profile...</p>
          <p className="text-sm text-violet-500 mt-1">Finding the best opportunities for you</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-rose-200 bg-rose-50">
        <CardContent className="py-8 text-center">
          <p className="text-rose-600 mb-4">{error}</p>
          <Button variant="outline" onClick={generateRecommendations}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations) return null;

  return (
    <Card className="border-violet-200 bg-gradient-to-br from-violet-50/50 to-indigo-50/50 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Recommendations</CardTitle>
              <CardDescription>Personalized suggestions based on your profile</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={generateRecommendations}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        {recommendations.personalized_message && (
          <p className="text-sm text-slate-600 mt-3 p-3 bg-white rounded-lg">
            💡 {recommendations.personalized_message}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="screens" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="screens" className="text-xs">Top Picks</TabsTrigger>
            <TabsTrigger value="timing" className="text-xs">Timing</TabsTrigger>
            <TabsTrigger value="budget" className="text-xs">Budget</TabsTrigger>
            <TabsTrigger value="trends" className="text-xs">Trends</TabsTrigger>
          </TabsList>

          {/* Top Screen Picks */}
          <TabsContent value="screens" className="space-y-3">
            {recommendations.top_screens?.map((rec, i) => {
              const screen = screens.find(s => s.name === rec.screen_name || s.id === rec.screen_id);
              return (
                <div 
                  key={i}
                  className="bg-white rounded-xl p-4 border border-slate-100 hover:border-violet-300 transition-all cursor-pointer"
                  onClick={() => screen && onSelectScreen?.(screen)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-900">{rec.screen_name}</h4>
                        <Badge className="bg-violet-100 text-violet-700">
                          {rec.match_score}% match
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{rec.reason}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {rec.suggested_weeks} weeks suggested
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          ~AED {rec.estimated_cost}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {/* Timing Recommendations */}
          <TabsContent value="timing" className="space-y-4">
            <div className="bg-white rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-emerald-600" />
                <h4 className="font-semibold text-slate-900">Best Times to Book</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Best Days:</span>
                  <div className="flex gap-1">
                    {recommendations.timing_recommendations?.best_days?.map((day, i) => (
                      <Badge key={i} variant="outline" className="text-emerald-600 border-emerald-200">
                        {day}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Best Hours:</span>
                  <span className="font-medium">{recommendations.timing_recommendations?.best_hours}</span>
                </div>
                {recommendations.timing_recommendations?.potential_savings && (
                  <div className="mt-3 p-2 bg-emerald-50 rounded-lg text-emerald-700">
                    💰 {recommendations.timing_recommendations.potential_savings}
                  </div>
                )}
              </div>
            </div>
            {recommendations.timing_recommendations?.avoid_periods?.length > 0 && (
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <h4 className="font-medium text-amber-800 mb-2">⚠️ Avoid These Periods</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  {recommendations.timing_recommendations.avoid_periods.map((period, i) => (
                    <li key={i}>• {period}</li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>

          {/* Budget Tips */}
          <TabsContent value="budget" className="space-y-3">
            <div className="bg-white rounded-xl p-4 border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-violet-600" />
                <h4 className="font-semibold text-slate-900">Budget Optimization</h4>
              </div>
              <div className="text-sm text-slate-600 mb-3">
                Your balance: <span className="font-bold text-violet-600">AED {user?.wallet_balance?.toLocaleString() || 0}</span>
              </div>
              <ul className="space-y-2">
                {recommendations.budget_tips?.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Zap className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-600">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
            {recommendations.duration_recommendation && (
              <div className="bg-violet-50 rounded-xl p-4 border border-violet-200">
                <h4 className="font-medium text-violet-800 mb-2">📅 Duration Tip</h4>
                <p className="text-sm text-violet-700">
                  <strong>{recommendations.duration_recommendation.optimal_weeks} weeks</strong> is optimal. 
                  {recommendations.duration_recommendation.reason}
                </p>
                {recommendations.duration_recommendation.discount_tip && (
                  <p className="text-xs text-violet-600 mt-2">
                    💡 {recommendations.duration_recommendation.discount_tip}
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          {/* Trending Venues */}
          <TabsContent value="trends" className="space-y-3">
            {recommendations.trending_venues?.map((venue, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-semibold text-slate-900 capitalize">{venue.venue_type}</h4>
                  </div>
                  <Badge className={venue.trend === "up" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100"}>
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {venue.trend === "up" ? "Trending" : "Stable"}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500">{venue.reason}</p>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}