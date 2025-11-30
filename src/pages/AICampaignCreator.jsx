import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, addDays } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Loader2,
  CheckCircle2,
  Upload,
  RefreshCw,
  Lightbulb,
  Target,
  Clock,
  DollarSign,
  Image as ImageIcon,
  FileText,
  Wand2,
  MonitorPlay,
  MapPin,
  TrendingUp,
  Users,
  X,
  Copy,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CreativePreview from "@/components/campaigns/CreativePreview";
import CampaignGoalSelector from "@/components/campaigns/CampaignGoalSelector";
import DemographicsSelector from "@/components/campaigns/DemographicsSelector";
import AIOptimizationPanel from "@/components/campaigns/AIOptimizationPanel";

export default function AICampaignCreator() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Basic input from user
  const [businessInfo, setBusinessInfo] = useState({
    business_name: "",
    product_service: "",
    target_audience: "",
    campaign_goal: "awareness",
    target_kpi: "",
    budget: "",
    daily_budget: ""
  });

  // Demographics targeting
  const [demographics, setDemographics] = useState({
    age_groups: [],
    gender: "all",
    interests: [],
    income_level: "any"
  });

  // AI-generated suggestions
  const [aiSuggestions, setAiSuggestions] = useState(null);

  // Final campaign data
  const [campaignData, setCampaignData] = useState({
    name: "",
    headline: "",
    description: "",
    goal: "awareness",
    target_kpi: null,
    target_cities: [],
    target_venue_types: [],
    target_demographics: {},
    screen_ids: [],
    time_slots: [],
    start_date: null,
    end_date: null,
    creative_url: "",
    creative_type: "",
    budget: 0,
    daily_budget: 0,
    suggested_price: 0,
    duration_seconds: 15,
    auto_optimize: true
  });

  // Draft campaign for review
  const [draftCampaign, setDraftCampaign] = useState(null);

  const { data: venues = [] } = useQuery({
    queryKey: ["venues"],
    queryFn: () => base44.entities.Venue.filter({ status: "approved" })
  });

  const { data: screens = [] } = useQuery({
    queryKey: ["screens"],
    queryFn: () => base44.entities.Screen.filter({ status: "online" })
  });

  useEffect(() => {
    loadUser();
    loadTemplate();
  }, []);

  const loadUser = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl("AICampaignCreator"));
        return;
      }
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {
      base44.auth.redirectToLogin(createPageUrl("AICampaignCreator"));
    }
  };

  const loadTemplate = () => {
    const savedTemplate = sessionStorage.getItem("campaignTemplate");
    if (savedTemplate) {
      try {
        const template = JSON.parse(savedTemplate);
        setBusinessInfo(prev => ({
          ...prev,
          campaign_goal: template.goal || "awareness",
          budget: template.budget_range?.min?.toString() || ""
        }));
        setCampaignData(prev => ({
          ...prev,
          name: template.name || "",
          goal: template.goal || "awareness",
          target_venue_types: template.target_venue_types || [],
          time_slots: template.time_slots || [],
          headline: template.headline_template || "",
          description: template.description_template || ""
        }));
        setDemographics(prev => ({
          ...prev,
          ...template.target_demographics
        }));
        sessionStorage.removeItem("campaignTemplate");
      } catch (e) {
        console.error("Failed to load template:", e);
      }
    }
  };

  const generateAISuggestions = async () => {
    if (!businessInfo.product_service || !businessInfo.target_audience) {
      toast.error("Please fill in your product/service and target audience");
      return;
    }

    setAiLoading(true);
    try {
      const venueData = venues.map(v => ({
        type: v.type,
        city: v.city,
        area: v.area,
        footfall: v.avg_daily_footfall
      }));

      const prompt = `You are an expert DOOH (Digital Out-of-Home) advertising strategist. Based on the following business information, generate comprehensive campaign recommendations.

BUSINESS INFORMATION:
- Business Name: ${businessInfo.business_name}
- Product/Service: ${businessInfo.product_service}
- Target Audience: ${businessInfo.target_audience}
- Campaign Goal: ${businessInfo.campaign_goal}
- Budget: AED ${businessInfo.budget || "Flexible"}

AVAILABLE VENUES IN UAE:
${JSON.stringify(venueData.slice(0, 20), null, 2)}

Generate the following recommendations:

1. TARGET DEMOGRAPHICS: Suggest 3-5 specific demographic segments that would be most receptive to this product/service.

2. RECOMMENDED VENUE TYPES: Which venue types (restaurant, cafe, mall, gym, coworking, hotel, hospital) would be most effective and why.

3. RECOMMENDED CITIES: Which UAE cities to target based on the product and audience.

4. TIME SLOTS: Recommend optimal time slots:
   - morning (6AM-12PM)
   - afternoon (12PM-5PM)  
   - evening (5PM-10PM)
   - peak (12PM-2PM, 6PM-9PM)

5. AD COPY: Generate 3 variations of compelling headlines (max 8 words) and descriptions (max 20 words) for the digital signage.

6. CAMPAIGN DURATION: Recommend optimal campaign length in days.

7. PRICING STRATEGY: Based on current market demand, suggest:
   - Optimal budget allocation
   - Best days to run (weekdays vs weekends)
   - Seasonality considerations

8. IMAGERY SUGGESTIONS: Describe 3 creative concepts that would work well for this campaign on digital screens.

9. ESTIMATED REACH: Estimate daily impressions based on venue selection.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            target_demographics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  segment: { type: "string" },
                  age_range: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            recommended_venue_types: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  reason: { type: "string" },
                  priority: { type: "number" }
                }
              }
            },
            recommended_cities: {
              type: "array",
              items: { type: "string" }
            },
            time_slots: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  slot: { type: "string" },
                  reason: { type: "string" },
                  effectiveness_score: { type: "number" }
                }
              }
            },
            ad_copy_variations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  headline: { type: "string" },
                  description: { type: "string" },
                  tone: { type: "string" }
                }
              }
            },
            campaign_duration_days: { type: "number" },
            pricing_strategy: {
              type: "object",
              properties: {
                recommended_daily_budget: { type: "number" },
                best_days: { type: "array", items: { type: "string" } },
                seasonality_note: { type: "string" }
              }
            },
            imagery_suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  concept: { type: "string" },
                  description: { type: "string" },
                  color_palette: { type: "string" }
                }
              }
            },
            estimated_daily_impressions: { type: "number" }
          }
        }
      });

      setAiSuggestions(response);
      
      // Auto-populate campaign data with AI suggestions
      setCampaignData(prev => ({
        ...prev,
        name: `${businessInfo.business_name} - ${businessInfo.campaign_goal} Campaign`,
        goal: businessInfo.campaign_goal,
        target_kpi: businessInfo.target_kpi,
        headline: response.ad_copy_variations?.[0]?.headline || "",
        description: response.ad_copy_variations?.[0]?.description || "",
        target_cities: response.recommended_cities || [],
        target_venue_types: response.recommended_venue_types?.map(v => v.type) || [],
        target_demographics: demographics,
        time_slots: response.time_slots?.map(t => t.slot) || [],
        start_date: new Date(),
        end_date: addDays(new Date(), response.campaign_duration_days || 7),
        budget: parseFloat(businessInfo.budget) || 0,
        daily_budget: parseFloat(businessInfo.daily_budget) || 0,
        suggested_price: response.pricing_strategy?.recommended_daily_budget * (response.campaign_duration_days || 7) || 0,
        auto_optimize: true
      }));

      setStep(3);
      toast.success("AI recommendations generated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate AI suggestions");
    } finally {
      setAiLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      toast.error("Please upload an image or video file");
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setCampaignData({
        ...campaignData,
        creative_url: file_url,
        creative_type: isVideo ? "video" : "image"
      });
      toast.success("Creative uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const generateAIImage = async () => {
    if (!aiSuggestions?.imagery_suggestions?.[0]) {
      toast.error("No imagery suggestions available");
      return;
    }

    setUploading(true);
    try {
      const concept = aiSuggestions.imagery_suggestions[0];
      const prompt = `Create a professional digital signage advertisement for ${businessInfo.business_name}. ${concept.description}. Use ${concept.color_palette} color palette. The ad should feature: "${campaignData.headline}" as the headline. Modern, clean, eye-catching design suitable for a digital screen in a ${campaignData.target_venue_types[0] || 'retail'} environment. High contrast, easy to read from distance.`;

      const { url } = await base44.integrations.Core.GenerateImage({ prompt });
      setCampaignData({
        ...campaignData,
        creative_url: url,
        creative_type: "image"
      });
      toast.success("AI image generated!");
    } catch (error) {
      toast.error("Failed to generate image");
    } finally {
      setUploading(false);
    }
  };

  const matchingScreens = screens.filter(screen => {
    const venue = venues.find(v => v.id === screen.venue_id);
    if (!venue) return false;
    
    const cityMatch = campaignData.target_cities.length === 0 || 
                      campaignData.target_cities.includes(venue.city);
    const typeMatch = campaignData.target_venue_types.length === 0 || 
                      campaignData.target_venue_types.includes(venue.type);
    
    return cityMatch && typeMatch;
  });

  const totalCost = campaignData.suggested_price || 
    matchingScreens.slice(0, 5).reduce((sum, s) => sum + (s.slot_price || 100), 0);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const selectedScreenIds = campaignData.screen_ids.length > 0 
        ? campaignData.screen_ids 
        : matchingScreens.slice(0, 5).map(s => s.id);

      // Check wallet balance
      const currentUser = await base44.auth.me();
      const userWalletBalance = currentUser.wallet_balance || 0;
      
      if (userWalletBalance < totalCost) {
        toast.error(`Insufficient wallet balance. You have AED ${userWalletBalance.toLocaleString()} but need AED ${totalCost.toLocaleString()}`);
        setLoading(false);
        return;
      }

      // Deduct from advertiser wallet
      const newBalance = userWalletBalance - totalCost;
      await base44.auth.updateMe({
        wallet_balance: newBalance,
        total_spent: (currentUser.total_spent || 0) + totalCost
      });

      // Create deduction transaction
      await base44.entities.Transaction.create({
        user_id: user.email,
        type: "ad_spend",
        amount: -totalCost,
        balance_after: newBalance,
        reference_id: `ai-campaign-${Date.now()}`,
        description: `AI Campaign: ${campaignData.name}`,
        status: "completed"
      });

      // Create the campaign
      const campaign = await base44.entities.Campaign.create({
        name: campaignData.name,
        advertiser_id: user.email,
        goal: campaignData.goal,
        target_kpi: campaignData.target_kpi ? parseFloat(campaignData.target_kpi) : null,
        start_date: format(campaignData.start_date, 'yyyy-MM-dd'),
        end_date: format(campaignData.end_date, 'yyyy-MM-dd'),
        time_slots: campaignData.time_slots,
        target_cities: campaignData.target_cities,
        target_venue_types: campaignData.target_venue_types,
        target_demographics: campaignData.target_demographics,
        screen_ids: selectedScreenIds,
        creative_url: campaignData.creative_url,
        creative_type: campaignData.creative_type,
        headline: campaignData.headline,
        description: campaignData.description,
        duration_seconds: campaignData.duration_seconds,
        budget: campaignData.budget,
        daily_budget: campaignData.daily_budget,
        total_cost: totalCost,
        status: "pending_approval",
        impressions: 0,
        clicks: 0,
        conversions: 0,
        spend: totalCost,
        ai_suggestions: aiSuggestions,
        auto_optimize: campaignData.auto_optimize
      });

      // Create admin notification
      await base44.entities.AdminNotification.create({
        type: "campaign_approval",
        title: "New AI Campaign Submitted",
        message: `${user.full_name || user.email} submitted AI campaign "${campaignData.name}" for AED ${totalCost.toLocaleString()}`,
        reference_id: campaign.id,
        reference_type: "Campaign",
        status: "unread"
      });

      toast.success("Campaign submitted for approval! Payment deducted from wallet.");
      navigate(createPageUrl("MyCampaigns"));
    } catch (error) {
      console.error(error);
      toast.error("Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">AI Campaign Creator</h1>
            <Badge className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
          </div>
          <p className="text-slate-500">Let AI help you create the perfect campaign in minutes</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-sm font-medium text-slate-600">Step {step} of 4</span>
          <Progress value={(step / 4) * 100} className="flex-1 h-2" />
        </div>
        <div className="flex gap-2">
          {["Goals & Budget", "Targeting", "AI Recommendations", "Creative & Launch"].map((label, i) => (
            <div
              key={i}
              className={`flex-1 text-center text-xs py-1 rounded ${
                step > i + 1 ? "bg-violet-100 text-violet-700" :
                step === i + 1 ? "bg-violet-600 text-white" :
                "bg-slate-100 text-slate-500"
              }`}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Goals & Budget */}
      {step === 1 && (
        <Card className="border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Campaign Goals & Budget</h2>
                <p className="text-slate-500">Define your objectives and AI will optimize for them</p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Business Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input
                    placeholder="e.g., Fresh Bites Restaurant"
                    value={businessInfo.business_name}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, business_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Product or Service</Label>
                  <Input
                    placeholder="e.g., Mediterranean healthy food delivery"
                    value={businessInfo.product_service}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, product_service: e.target.value })}
                  />
                </div>
              </div>

              {/* Goal Selector */}
              <CampaignGoalSelector
                selectedGoal={businessInfo.campaign_goal}
                targetKpi={businessInfo.target_kpi}
                onGoalChange={(goal) => setBusinessInfo({ ...businessInfo, campaign_goal: goal })}
                onKpiChange={(kpi) => setBusinessInfo({ ...businessInfo, target_kpi: kpi })}
              />

              {/* Budget */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Total Campaign Budget (AED)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 5000"
                    value={businessInfo.budget}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, budget: e.target.value })}
                  />
                  <p className="text-xs text-slate-500">AI will optimize spend within this budget</p>
                </div>
                <div className="space-y-2">
                  <Label>Daily Budget Cap (AED) - Optional</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 500"
                    value={businessInfo.daily_budget}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, daily_budget: e.target.value })}
                  />
                  <p className="text-xs text-slate-500">Maximum spend per day</p>
                </div>
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!businessInfo.product_service || !businessInfo.budget}
                className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600"
              >
                Continue to Targeting
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Targeting */}
      {step === 2 && (
        <Card className="border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Target Audience & Demographics</h2>
                <p className="text-slate-500">Define who you want to reach</p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Audience Description */}
              <div className="space-y-2">
                <Label>Describe Your Target Audience</Label>
                <Textarea
                  placeholder="e.g., Health-conscious professionals aged 25-45, gym-goers, office workers looking for quick healthy lunch options"
                  className="h-20"
                  value={businessInfo.target_audience}
                  onChange={(e) => setBusinessInfo({ ...businessInfo, target_audience: e.target.value })}
                />
              </div>

              {/* Demographics Selector */}
              <DemographicsSelector
                demographics={demographics}
                onChange={setDemographics}
              />

              {/* Navigation */}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={generateAISuggestions}
                  disabled={aiLoading}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      AI is analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate AI Recommendations
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: AI Suggestions Review */}
      {step === 3 && aiSuggestions && (
        <div className="space-y-6">
          {/* Demographics Card */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-violet-600" />
                </div>
                <h3 className="font-bold text-slate-900">Target Demographics</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                {aiSuggestions.target_demographics?.map((demo, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-4">
                    <p className="font-semibold text-slate-900">{demo.segment}</p>
                    <p className="text-sm text-violet-600">{demo.age_range}</p>
                    <p className="text-xs text-slate-500 mt-1">{demo.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Venue & Location Recommendations */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-slate-900">Recommended Venues</h3>
                </div>
                <div className="space-y-2">
                  {aiSuggestions.recommended_venue_types?.map((venue, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium capitalize">{venue.type}</p>
                        <p className="text-xs text-slate-500">{venue.reason}</p>
                      </div>
                      <Badge variant="secondary">{venue.priority}/10</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-slate-900">Optimal Time Slots</h3>
                </div>
                <div className="space-y-2">
                  {aiSuggestions.time_slots?.map((slot, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium capitalize">{slot.slot}</p>
                        <p className="text-xs text-slate-500">{slot.reason}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-medium">{slot.effectiveness_score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ad Copy Suggestions */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-slate-900">AI-Generated Ad Copy</h3>
                </div>
                <Button variant="outline" size="sm" onClick={generateAISuggestions}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Regenerate
                </Button>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {aiSuggestions.ad_copy_variations?.map((copy, i) => (
                  <div 
                    key={i} 
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      campaignData.headline === copy.headline 
                        ? 'border-violet-600 bg-violet-50' 
                        : 'border-slate-200 hover:border-violet-300'
                    }`}
                    onClick={() => setCampaignData({
                      ...campaignData,
                      headline: copy.headline,
                      description: copy.description
                    })}
                  >
                    <Badge variant="secondary" className="mb-2">{copy.tone}</Badge>
                    <p className="font-bold text-slate-900 mb-1">{copy.headline}</p>
                    <p className="text-sm text-slate-600">{copy.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Schedule */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow">
                  <DollarSign className="w-5 h-5 text-violet-600" />
                </div>
                <h3 className="font-bold text-slate-900">Pricing & Scheduling Strategy</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-slate-500">Recommended Budget</p>
                  <p className="text-2xl font-bold text-violet-600">
                    AED {(aiSuggestions.pricing_strategy?.recommended_daily_budget * (aiSuggestions.campaign_duration_days || 7)).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">
                    AED {aiSuggestions.pricing_strategy?.recommended_daily_budget}/day × {aiSuggestions.campaign_duration_days} days
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-slate-500">Best Days to Run</p>
                  <p className="font-bold text-slate-900">
                    {aiSuggestions.pricing_strategy?.best_days?.join(", ")}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-slate-500">Est. Daily Impressions</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {aiSuggestions.estimated_daily_impressions?.toLocaleString()}
                  </p>
                </div>
              </div>
              {aiSuggestions.pricing_strategy?.seasonality_note && (
                <p className="text-sm text-slate-600 mt-4 bg-white rounded-lg p-3">
                  💡 {aiSuggestions.pricing_strategy.seasonality_note}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Matching Screens */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <MonitorPlay className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Matching Screens</h3>
                    <p className="text-sm text-slate-500">{matchingScreens.length} screens available</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {matchingScreens.slice(0, 8).map((screen) => {
                  const venue = venues.find(v => v.id === screen.venue_id);
                  return (
                    <div key={screen.id} className="bg-slate-50 rounded-lg p-3">
                      <p className="font-medium text-sm truncate">{screen.name}</p>
                      <p className="text-xs text-slate-500">{venue?.name}</p>
                      <p className="text-xs text-violet-600">{venue?.city}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={() => setStep(4)}
              className="bg-gradient-to-r from-violet-600 to-indigo-600"
            >
              Continue to Creative
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Creative & Launch */}
      {step === 4 && (
        <div className="space-y-6">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Ad Creative</h2>
                  <p className="text-slate-500">Upload your own or let AI generate one</p>
                </div>
              </div>

              {/* Real-Time Preview */}
              <div className="mb-6">
                <Label className="mb-3 block">Real-Time Preview</Label>
                <CreativePreview
                  creativeUrl={campaignData.creative_url}
                  creativeType={campaignData.creative_type}
                  headline={campaignData.headline}
                  description={campaignData.description}
                  inline={true}
                />
              </div>

              {/* Creative Options */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Upload Option */}
                <div>
                  <Label className="mb-3 block">Upload Your Creative</Label>
                  {campaignData.creative_url ? (
                    <div className="relative">
                      {campaignData.creative_type === "video" ? (
                        <video
                          src={campaignData.creative_url}
                          className="w-full aspect-video rounded-xl bg-slate-100 object-cover"
                          controls
                        />
                      ) : (
                        <img
                          src={campaignData.creative_url}
                          alt="Creative"
                          className="w-full aspect-video rounded-xl bg-slate-100 object-cover"
                        />
                      )}
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => setCampaignData({ ...campaignData, creative_url: "", creative_type: "" })}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="block">
                      <div className={`
                        border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                        ${uploading ? 'border-violet-300 bg-violet-50' : 'border-slate-200 hover:border-violet-300'}
                      `}>
                        {uploading ? (
                          <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto" />
                        ) : (
                          <>
                            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                            <p className="font-medium text-slate-700">Drop file or click to upload</p>
                            <p className="text-sm text-slate-500">MP4, JPEG, PNG (max 50MB)</p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="video/*,image/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>

                {/* AI Generate Option */}
                <div>
                  <Label className="mb-3 block">Or Generate with AI</Label>
                  <div className="border-2 border-dashed border-violet-200 rounded-xl p-6 bg-violet-50/50">
                    {aiSuggestions?.imagery_suggestions?.[0] && (
                      <div className="mb-4">
                        <p className="font-medium text-slate-900 mb-2">AI Concept:</p>
                        <p className="text-sm text-slate-600">{aiSuggestions.imagery_suggestions[0].description}</p>
                        <p className="text-xs text-violet-600 mt-1">Colors: {aiSuggestions.imagery_suggestions[0].color_palette}</p>
                      </div>
                    )}
                    <Button
                      onClick={generateAIImage}
                      disabled={uploading}
                      className="w-full bg-gradient-to-r from-violet-600 to-indigo-600"
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Wand2 className="w-4 h-4 mr-2" />
                      )}
                      Generate AI Image
                    </Button>
                  </div>
                </div>
              </div>

              {/* Campaign Summary */}
              <div className="bg-slate-50 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-slate-900 mb-4">Campaign Summary</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Campaign Name</span>
                    <span className="font-medium">{campaignData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration</span>
                    <span className="font-medium">
                      {campaignData.start_date && format(campaignData.start_date, "MMM d")} - 
                      {campaignData.end_date && format(campaignData.end_date, "MMM d")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cities</span>
                    <span className="font-medium">{campaignData.target_cities.join(", ") || "All"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Venues</span>
                    <span className="font-medium capitalize">{campaignData.target_venue_types.join(", ") || "All"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Time Slots</span>
                    <span className="font-medium capitalize">{campaignData.time_slots.join(", ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Screens</span>
                    <span className="font-medium">{matchingScreens.length} matching</span>
                  </div>
                </div>
                <div className="border-t border-slate-200 mt-4 pt-4 flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Estimated Cost</span>
                  <span className="text-2xl font-bold text-violet-600">AED {totalCost.toLocaleString()}</span>
                </div>
              </div>

              {/* AI Optimization Panel */}
              {draftCampaign && (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">AI Performance Optimization</h3>
                        <p className="text-sm text-slate-500">Get real-time recommendations</p>
                      </div>
                    </div>
                    <AIOptimizationPanel
                      campaign={draftCampaign}
                      onUpdate={async (updates) => {
                        setDraftCampaign({ ...draftCampaign, ...updates });
                      }}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDraftCampaign({
                        ...campaignData,
                        goal: businessInfo.campaign_goal,
                        target_kpi: businessInfo.target_kpi,
                        budget: parseFloat(businessInfo.budget) || 0,
                        daily_budget: parseFloat(businessInfo.daily_budget) || 0,
                        target_demographics: demographics,
                        ai_suggestions: aiSuggestions,
                        status: "draft"
                      });
                      toast.success("Draft saved for review");
                    }}
                    disabled={!campaignData.creative_url}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !campaignData.creative_url}
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Submit for Approval
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}