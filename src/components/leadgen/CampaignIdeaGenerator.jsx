import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Sparkles, 
  Loader2, 
  Target, 
  TrendingUp,
  Users,
  MapPin,
  DollarSign
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function CampaignIdeaGenerator() {
  const [loading, setLoading] = useState(false);
  const [businessType, setBusinessType] = useState("");
  const [budget, setBudget] = useState("");
  const [targetCity, setTargetCity] = useState("");
  const [campaignGoal, setCampaignGoal] = useState("");
  const [suggestions, setSuggestions] = useState(null);

  const generateIdeas = async () => {
    if (!businessType || !budget) {
      toast.error("Please fill in business type and budget");
      return;
    }

    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a DOOH advertising strategist for BeyondWalls platform in UAE.

Generate personalized campaign suggestions for:
- Business Type: ${businessType}
- Budget: AED ${budget}
- Target City: ${targetCity || "Dubai"}
- Campaign Goal: ${campaignGoal || "brand awareness"}

Provide:
1. 3 tailored campaign strategies with specific venue types
2. Expected reach and impressions
3. Recommended screen locations and timing
4. Creative suggestions
5. Estimated ROI and performance metrics

Be specific to UAE market and realistic about results.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            strategies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  venue_types: { type: "array", items: { type: "string" } },
                  expected_reach: { type: "string" },
                  estimated_impressions: { type: "string" },
                  timing_recommendation: { type: "string" },
                  creative_tips: { type: "string" },
                  estimated_roi: { type: "string" }
                }
              }
            },
            overall_recommendation: { type: "string" }
          }
        }
      });

      setSuggestions(response);
      toast.success("Campaign ideas generated!");
    } catch (error) {
      toast.error("Failed to generate ideas");
    }
    setLoading(false);
  };

  return (
    <Card className="border-2 border-violet-200">
      <CardHeader className="bg-gradient-to-r from-violet-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-600" />
          AI Campaign Idea Generator
        </CardTitle>
        <p className="text-sm text-slate-600 mt-1">
          Get personalized DOOH campaign suggestions tailored to your business
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Business Type *</Label>
            <Input
              placeholder="e.g., Restaurant, Gym, Real Estate"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Budget (AED) *</Label>
            <Input
              type="number"
              placeholder="e.g., 5000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Target City</Label>
            <Select value={targetCity} onValueChange={setTargetCity}>
              <SelectTrigger>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dubai">Dubai</SelectItem>
                <SelectItem value="Abu Dhabi">Abu Dhabi</SelectItem>
                <SelectItem value="Sharjah">Sharjah</SelectItem>
                <SelectItem value="Ajman">Ajman</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Campaign Goal</Label>
            <Select value={campaignGoal} onValueChange={setCampaignGoal}>
              <SelectTrigger>
                <SelectValue placeholder="Select goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="brand awareness">Brand Awareness</SelectItem>
                <SelectItem value="foot traffic">Foot Traffic</SelectItem>
                <SelectItem value="product launch">Product Launch</SelectItem>
                <SelectItem value="event promotion">Event Promotion</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={generateIdeas} disabled={loading} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 h-11">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Generate Campaign Ideas
        </Button>

        {suggestions && (
          <div className="space-y-4 mt-6">
            <div className="p-4 bg-violet-50 rounded-lg border border-violet-200">
              <p className="text-sm text-violet-900">{suggestions.overall_recommendation}</p>
            </div>

            <div className="space-y-3">
              {suggestions.strategies.map((strategy, idx) => (
                <Card key={idx} className="border-violet-100">
                  <CardContent className="p-4">
                    <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-violet-600" />
                      {strategy.name}
                    </h4>
                    <p className="text-sm text-slate-600 mb-3">{strategy.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1 text-slate-600">
                        <Users className="w-3 h-3 text-violet-600" />
                        Reach: {strategy.expected_reach}
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                        {strategy.estimated_impressions}
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <MapPin className="w-3 h-3 text-amber-600" />
                        {strategy.timing_recommendation}
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <DollarSign className="w-3 h-3 text-green-600" />
                        ROI: {strategy.estimated_roi}
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs font-medium text-slate-700 mb-1">Venue Types:</p>
                      <div className="flex flex-wrap gap-1">
                        {strategy.venue_types.map((venue, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{venue}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 p-2 bg-amber-50 rounded">
                      <p className="text-xs text-amber-800"><strong>Creative Tip:</strong> {strategy.creative_tips}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}