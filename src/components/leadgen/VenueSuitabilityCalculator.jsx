import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calculator, 
  Loader2, 
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  Sparkles
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function VenueSuitabilityCalculator() {
  const [loading, setLoading] = useState(false);
  const [venueType, setVenueType] = useState("");
  const [dailyFootfall, setDailyFootfall] = useState("");
  const [screenSize, setScreenSize] = useState("");
  const [location, setLocation] = useState("");
  const [dwellTime, setDwellTime] = useState("");
  const [results, setResults] = useState(null);

  const calculateSuitability = async () => {
    if (!venueType || !dailyFootfall || !screenSize) {
      toast.error("Please fill in required fields");
      return;
    }

    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a venue monetization expert for BeyondWalls DOOH platform.

Analyze this venue's suitability for digital advertising:
- Venue Type: ${venueType}
- Daily Footfall: ${dailyFootfall} people
- Screen Size: ${screenSize}
- Location: ${location || "Dubai"}
- Average Dwell Time: ${dwellTime || "30"} minutes

Calculate and provide:
1. Suitability score (0-100)
2. Estimated daily viewers (considering visibility and dwell time)
3. Estimated monthly earnings (at 70% revenue share, AED 99-250/week per slot)
4. Estimated annual revenue potential
5. Key optimization recommendations
6. Best venue types to target for partnerships

Be realistic and based on UAE DOOH market rates.`,
        response_json_schema: {
          type: "object",
          properties: {
            suitability_score: { type: "number", description: "0-100 score" },
            score_rating: { type: "string", description: "Excellent, Good, Fair, or Poor" },
            estimated_daily_viewers: { type: "number" },
            estimated_monthly_earnings: { type: "number" },
            estimated_annual_revenue: { type: "number" },
            earnings_breakdown: {
              type: "object",
              properties: {
                conservative: { type: "number" },
                realistic: { type: "number" },
                optimistic: { type: "number" }
              }
            },
            recommendations: { 
              type: "array", 
              items: { type: "string" },
              description: "3-5 specific recommendations"
            },
            strengths: { type: "array", items: { type: "string" } },
            challenges: { type: "array", items: { type: "string" } }
          }
        }
      });

      setResults(response);
      toast.success("Analysis complete!");
    } catch (error) {
      toast.error("Failed to calculate suitability");
    }
    setLoading(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-amber-600";
    return "text-slate-500";
  };

  return (
    <Card className="border-2 border-emerald-200">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-emerald-600" />
          Venue Suitability Calculator
        </CardTitle>
        <p className="text-sm text-slate-600 mt-1">
          Discover your venue's revenue potential with BeyondWalls
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Venue Type *</Label>
            <Select value={venueType} onValueChange={setVenueType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="cafe">Café</SelectItem>
                <SelectItem value="gym">Gym/Fitness Center</SelectItem>
                <SelectItem value="mall">Shopping Mall</SelectItem>
                <SelectItem value="hotel">Hotel</SelectItem>
                <SelectItem value="coworking">Coworking Space</SelectItem>
                <SelectItem value="salon">Salon/Spa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Daily Footfall *</Label>
            <Input
              type="number"
              placeholder="e.g., 500"
              value={dailyFootfall}
              onChange={(e) => setDailyFootfall(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Screen Size *</Label>
            <Select value={screenSize} onValueChange={setScreenSize}>
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="43">43"</SelectItem>
                <SelectItem value="55">55"</SelectItem>
                <SelectItem value="65">65"</SelectItem>
                <SelectItem value="75">75"</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              placeholder="e.g., Dubai Marina"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Average Dwell Time (minutes)</Label>
            <Input
              type="number"
              placeholder="e.g., 45"
              value={dwellTime}
              onChange={(e) => setDwellTime(e.target.value)}
            />
          </div>
        </div>

        <Button 
          onClick={calculateSuitability} 
          disabled={loading} 
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 h-11"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Calculate Revenue Potential
        </Button>

        {results && (
          <div className="space-y-4 mt-6 pt-6 border-t">
            {/* Score */}
            <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
              <p className="text-sm text-slate-600 mb-2">Suitability Score</p>
              <p className={`text-6xl font-bold ${getScoreColor(results.suitability_score)}`}>
                {results.suitability_score}
              </p>
              <Badge className="mt-2 bg-emerald-100 text-emerald-800">{results.score_rating}</Badge>
              <Progress value={results.suitability_score} className="mt-3 h-3" />
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 text-violet-600 mb-1">
                  <Eye className="w-4 h-4" />
                  <p className="text-xs font-medium">Daily Viewers</p>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {results.estimated_daily_viewers?.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <p className="text-xs font-medium">Monthly Earnings</p>
                </div>
                <p className="text-2xl font-bold text-emerald-700">
                  AED {results.estimated_monthly_earnings?.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Annual Projection */}
            <div className="p-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg">
              <p className="text-sm opacity-90 mb-1">Annual Revenue Potential</p>
              <p className="text-3xl font-bold">AED {results.estimated_annual_revenue?.toLocaleString()}</p>
            </div>

            {/* Earnings Breakdown */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-700 mb-3">Revenue Scenarios:</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">Conservative</span>
                  <span className="font-semibold text-slate-700">AED {results.earnings_breakdown?.conservative?.toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">Realistic</span>
                  <span className="font-semibold text-emerald-600">AED {results.earnings_breakdown?.realistic?.toLocaleString()}/mo</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">Optimistic</span>
                  <span className="font-semibold text-violet-600">AED {results.earnings_breakdown?.optimistic?.toLocaleString()}/mo</span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">✨ Recommendations:</p>
              <div className="space-y-2">
                {results.recommendations?.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-violet-600 font-bold">•</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Challenges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-50 rounded-lg">
                <p className="text-xs font-medium text-emerald-700 mb-2">Strengths:</p>
                <ul className="space-y-1">
                  {results.strengths?.map((s, i) => (
                    <li key={i} className="text-xs text-slate-700">✓ {s}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <p className="text-xs font-medium text-amber-700 mb-2">Challenges:</p>
                <ul className="space-y-1">
                  {results.challenges?.map((c, i) => (
                    <li key={i} className="text-xs text-slate-700">⚠ {c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}