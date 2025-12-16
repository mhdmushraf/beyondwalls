import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, Users, TrendingUp, Clock, Calendar, 
  ShoppingBag, Zap, Target, Sparkles, Activity
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

export default function AudienceAnalytics() {
  const [user, setUser] = useState(null);
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [forecastDate, setForecastDate] = useState(new Date().toISOString().split('T')[0]);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const { data: screens = [] } = useQuery({
    queryKey: ["screens"],
    queryFn: () => base44.entities.Screen.list()
  });

  const { data: venues = [] } = useQuery({
    queryKey: ["venues"],
    queryFn: () => base44.entities.Venue.list()
  });

  const { data: forecasts = [] } = useQuery({
    queryKey: ["forecasts", selectedScreen?.id, forecastDate],
    queryFn: () => base44.entities.AudienceForecast.filter({
      screen_id: selectedScreen?.id,
      forecast_date: forecastDate
    }),
    enabled: !!selectedScreen
  });

  // Generate AI forecast
  const generateForecastMutation = useMutation({
    mutationFn: async () => {
      const screen = selectedScreen;
      const venue = venues.find(v => v.id === screen.venue_id);
      
      const prompt = `Analyze and forecast audience behavior for a DOOH screen:

LOCATION: ${venue?.name} - ${venue?.type} in ${venue?.city}
SCREEN DETAILS: ${screen.size}, ${screen.orientation}, ${screen.location_in_venue}
VENUE DATA:
- Daily footfall: ${venue?.estimated_daily_viewers || 'Unknown'}
- Peak hours: ${venue?.peak_hours?.join(', ') || 'Unknown'}
- Customer age groups: ${venue?.customer_age_groups?.join(', ') || 'Unknown'}
- Gender mix: ${venue?.customer_gender_mix || 'Unknown'}
- Dwell time: ${venue?.customer_dwell_time_minutes || 'Unknown'} minutes

FORECAST FOR: ${forecastDate}

Provide detailed hourly forecasts (9am-9pm) including:
1. Predicted footfall per hour
2. Audience emotional state percentages (rushed, relaxed, shopping-focused, entertainment-seeking)
3. Purchase intent score (0-100)
4. Demographic breakdown by age
5. Recommended ad types for each time slot
6. Key insights and patterns

Format as JSON array of hourly forecasts.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            forecasts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  time_slot: { type: "string" },
                  predicted_footfall: { type: "number" },
                  audience_sentiment: {
                    type: "object",
                    properties: {
                      rushed: { type: "number" },
                      relaxed: { type: "number" },
                      shopping_focused: { type: "number" },
                      entertainment_seeking: { type: "number" }
                    }
                  },
                  purchase_intent_score: { type: "number" },
                  demographic_breakdown: {
                    type: "object",
                    properties: {
                      age_18_25: { type: "number" },
                      age_26_35: { type: "number" },
                      age_36_45: { type: "number" },
                      age_46_plus: { type: "number" }
                    }
                  },
                  confidence_level: { type: "number" },
                  recommended_ad_types: {
                    type: "array",
                    items: { type: "string" }
                  },
                  ai_insights: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Save forecasts to database
      for (const forecast of response.forecasts) {
        await base44.entities.AudienceForecast.create({
          screen_id: screen.id,
          venue_id: venue.id,
          forecast_date: forecastDate,
          ...forecast
        });
      }

      return response.forecasts;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forecasts"] });
      toast.success("AI forecast generated!");
    }
  });

  const timeSeriesData = forecasts.map(f => ({
    time: f.time_slot,
    footfall: f.predicted_footfall,
    purchase_intent: f.purchase_intent_score
  }));

  const sentimentData = forecasts.length > 0 ? [
    { name: "Rushed", value: Math.round(forecasts.reduce((sum, f) => sum + (f.audience_sentiment?.rushed || 0), 0) / forecasts.length) },
    { name: "Relaxed", value: Math.round(forecasts.reduce((sum, f) => sum + (f.audience_sentiment?.relaxed || 0), 0) / forecasts.length) },
    { name: "Shopping", value: Math.round(forecasts.reduce((sum, f) => sum + (f.audience_sentiment?.shopping_focused || 0), 0) / forecasts.length) },
    { name: "Entertainment", value: Math.round(forecasts.reduce((sum, f) => sum + (f.audience_sentiment?.entertainment_seeking || 0), 0) / forecasts.length) }
  ] : [];

  const COLORS = ['#8B5CF6', '#6366F1', '#EC4899', '#F59E0B'];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Brain className="w-8 h-8 text-violet-600" />
              AI Audience Analytics
            </h1>
            <p className="text-slate-600 mt-1">Predictive insights for precision targeting</p>
          </div>
        </div>

        {/* Screen & Date Selector */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select Screen</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                className="w-full p-2 border rounded-lg"
                value={selectedScreen?.id || ""}
                onChange={(e) => {
                  const screen = screens.find(s => s.id === e.target.value);
                  setSelectedScreen(screen);
                }}
              >
                <option value="">Choose a screen...</option>
                {screens.map(screen => {
                  const venue = venues.find(v => v.id === screen.venue_id);
                  return (
                    <option key={screen.id} value={screen.id}>
                      {screen.name} - {venue?.name}
                    </option>
                  );
                })}
              </select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Forecast Date</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <input
                type="date"
                className="flex-1 p-2 border rounded-lg"
                value={forecastDate}
                onChange={(e) => setForecastDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <Button
                onClick={() => generateForecastMutation.mutate()}
                disabled={!selectedScreen || generateForecastMutation.isPending}
                className="bg-gradient-to-r from-violet-600 to-indigo-600"
              >
                {generateForecastMutation.isPending ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Forecast
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {selectedScreen && forecasts.length > 0 && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sentiment">Emotional States</TabsTrigger>
              <TabsTrigger value="purchase">Purchase Intent</TabsTrigger>
              <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Total Predicted Footfall
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {forecasts.reduce((sum, f) => sum + (f.predicted_footfall || 0), 0).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4" />
                      Avg Purchase Intent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(forecasts.reduce((sum, f) => sum + (f.purchase_intent_score || 0), 0) / forecasts.length)}%
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Peak Hour
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-violet-600">
                      {forecasts.sort((a, b) => (b.predicted_footfall || 0) - (a.predicted_footfall || 0))[0]?.time_slot}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-600 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      Confidence
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(forecasts.reduce((sum, f) => sum + (f.confidence_level || 0), 0) / forecasts.length)}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Hourly Footfall & Purchase Intent Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="footfall" stroke="#8B5CF6" strokeWidth={2} name="Footfall" />
                      <Line type="monotone" dataKey="purchase_intent" stroke="#10B981" strokeWidth={2} name="Purchase Intent %" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sentiment Tab */}
            <TabsContent value="sentiment" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Audience Emotional States</CardTitle>
                    <CardDescription>Average distribution throughout the day</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={sentimentData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {sentimentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Best Times to Target</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">High Purchase Intent</span>
                          <Badge className="bg-green-600">Best ROI</Badge>
                        </div>
                        <p className="text-sm text-slate-600">
                          {forecasts
                            .filter(f => (f.purchase_intent_score || 0) > 70)
                            .map(f => f.time_slot)
                            .join(', ') || 'N/A'}
                        </p>
                      </div>

                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">Relaxed Audience</span>
                          <Badge className="bg-blue-600">High Engagement</Badge>
                        </div>
                        <p className="text-sm text-slate-600">
                          {forecasts
                            .filter(f => (f.audience_sentiment?.relaxed || 0) > 40)
                            .map(f => f.time_slot)
                            .join(', ') || 'N/A'}
                        </p>
                      </div>

                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">Peak Footfall</span>
                          <Badge className="bg-orange-600">Max Reach</Badge>
                        </div>
                        <p className="text-sm text-slate-600">
                          {forecasts
                            .sort((a, b) => (b.predicted_footfall || 0) - (a.predicted_footfall || 0))
                            .slice(0, 3)
                            .map(f => f.time_slot)
                            .join(', ')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Purchase Intent Tab */}
            <TabsContent value="purchase" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Purchase Intent by Time Slot</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={forecasts.map(f => ({
                      time: f.time_slot,
                      score: f.purchase_intent_score
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="score" fill="#10B981" name="Purchase Intent Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recommendations Tab */}
            <TabsContent value="recommendations" className="space-y-6">
              {forecasts.map((forecast, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{forecast.time_slot}</CardTitle>
                      <div className="flex gap-2">
                        <Badge>Confidence: {forecast.confidence_level}%</Badge>
                        <Badge className="bg-violet-600">Intent: {forecast.purchase_intent_score}%</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-semibold">AI Insights:</Label>
                      <p className="text-sm text-slate-600 mt-1">{forecast.ai_insights}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Recommended Ad Types:</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {forecast.recommended_ad_types?.map((type, i) => (
                          <Badge key={i} variant="outline">{type}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        )}

        {selectedScreen && forecasts.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">Click "Generate Forecast" to analyze audience behavior patterns</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}