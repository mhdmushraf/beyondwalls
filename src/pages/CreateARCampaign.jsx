import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Eye,
  Play,
  Smartphone,
  Upload,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Image,
  Link as LinkIcon,
  MapPin,
  Calendar,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const AR_TYPES = [
  {
    id: "product_try_on",
    name: "Product Try-On",
    description: "Let users virtually try products like watches, sunglasses, jewelry",
    icon: Eye,
    examples: "Watches, Sunglasses, Jewelry, Hats"
  },
  {
    id: "room_placement",
    name: "Room Placement",
    description: "Allow users to place furniture and decor in their space",
    icon: Box,
    examples: "Furniture, Appliances, Art, Decor"
  },
  {
    id: "interactive_demo",
    name: "Interactive Demo",
    description: "Showcase animated products with interactive features",
    icon: Play,
    examples: "Electronics, Vehicles, Machinery"
  },
  {
    id: "3d_viewer",
    name: "3D Viewer",
    description: "Simple 360° product visualization",
    icon: Smartphone,
    examples: "Any product, Food & Beverage, Packaging"
  }
];

const CTA_OPTIONS = [
  { id: "buy_now", label: "Buy Now" },
  { id: "book_demo", label: "Book Demo" },
  { id: "learn_more", label: "Learn More" },
  { id: "contact_us", label: "Contact Us" },
  { id: "custom", label: "Custom CTA" }
];

const PLACEMENT_OPTIONS = [
  { id: "standard", label: "Standard", multiplier: 1, description: "Regular screen placement" },
  { id: "prime_location", label: "Prime Location", multiplier: 1.15, description: "High-traffic areas (+15%)" },
  { id: "peak_hour", label: "Peak Hours", multiplier: 1.20, description: "Rush hour display (+20%)" },
  { id: "multi_screen", label: "Multi-Screen Sync", multiplier: 1.25, description: "Synchronized display (+25%)" }
];

export default function CreateARCampaign() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    ar_type: "",
    model_url: "",
    thumbnail_url: "",
    cta_type: "learn_more",
    cta_url: "",
    placement_type: "standard",
    screen_ids: [],
    start_date: "",
    end_date: ""
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {
      base44.auth.redirectToLogin();
    }
  };

  const { data: subscription } = useQuery({
    queryKey: ["ar-subscription", user?.email],
    queryFn: () => base44.entities.ARSubscription.filter({ user_id: user?.email }),
    enabled: !!user?.email,
  });

  const { data: screens = [] } = useQuery({
    queryKey: ["screens"],
    queryFn: () => base44.entities.Screen.filter({ status: "online", is_public: true }),
  });

  const activeSubscription = subscription?.[0];
  const hasCredits = activeSubscription && (activeSubscription.ar_credits - (activeSubscription.credits_used || 0)) > 0;

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({
        ...prev,
        [type === "model" ? "model_url" : "thumbnail_url"]: file_url
      }));
      toast.success(`${type === "model" ? "3D Model" : "Thumbnail"} uploaded successfully`);
    } catch (error) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!hasCredits) {
      toast.error("No AR credits available. Please upgrade your subscription.");
      return;
    }

    setSubmitting(true);
    try {
      // Create the AR campaign
      await base44.entities.ARCampaign.create({
        advertiser_id: user.email,
        name: formData.name,
        ar_type: formData.ar_type,
        model_url: formData.model_url,
        thumbnail_url: formData.thumbnail_url,
        cta_type: formData.cta_type,
        cta_url: formData.cta_url,
        placement_type: formData.placement_type,
        screen_ids: formData.screen_ids,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: "pending_review",
        model_status: "pending",
        credits_used: 1,
        total_scans: 0,
        total_engagements: 0
      });

      // Deduct credit from subscription
      await base44.entities.ARSubscription.update(activeSubscription.id, {
        credits_used: (activeSubscription.credits_used || 0) + 1
      });

      toast.success("AR Campaign created successfully! It's now under review.");
      navigate(createPageUrl("ARDashboard"));
    } catch (error) {
      toast.error("Failed to create campaign. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.name && formData.ar_type;
      case 2: return formData.model_url;
      case 3: return formData.cta_type && formData.cta_url;
      case 4: return formData.start_date && formData.end_date;
      default: return true;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!activeSubscription || activeSubscription.status !== "active") {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">AR Premium Required</h2>
              <p className="text-slate-600 mb-6">
                You need an active AR Premium subscription to create AR campaigns.
              </p>
              <Button 
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600"
                onClick={() => navigate(createPageUrl("ARDashboard"))}
              >
                View Subscription Options
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("ARDashboard"))}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create AR Campaign</h1>
            <p className="text-slate-500">Step {step} of 4</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full ${
                s <= step ? "bg-violet-600" : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Basic Info & AR Type */}
        {step === 1 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Campaign Name *</Label>
                <Input
                  placeholder="e.g., Summer Watch Collection AR"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <Label>AR Experience Type *</Label>
                <div className="grid md:grid-cols-2 gap-4">
                  {AR_TYPES.map((type) => (
                    <div
                      key={type.id}
                      onClick={() => setFormData({ ...formData, ar_type: type.id })}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.ar_type === type.id
                          ? "border-violet-500 bg-violet-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <type.icon className={`w-5 h-5 ${formData.ar_type === type.id ? "text-violet-600" : "text-slate-400"}`} />
                        <span className="font-semibold text-slate-900">{type.name}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{type.description}</p>
                      <p className="text-xs text-slate-400">Examples: {type.examples}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Upload 3D Model */}
        {step === 2 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Upload 3D Assets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>3D Model (GLB/GLTF) *</Label>
                <div className={`border-2 border-dashed rounded-xl p-8 text-center ${formData.model_url ? "border-emerald-300 bg-emerald-50" : "border-slate-300"}`}>
                  {formData.model_url ? (
                    <div className="flex items-center justify-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">3D Model Uploaded</span>
                    </div>
                  ) : (
                    <>
                      <Box className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600 mb-2">Upload your 3D model</p>
                      <p className="text-sm text-slate-400 mb-4">Supported formats: GLB, GLTF (Max 50MB)</p>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".glb,.gltf"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, "model")}
                          disabled={uploading}
                        />
                        <Button disabled={uploading} asChild>
                          <span>
                            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                            Choose File
                          </span>
                        </Button>
                      </label>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Thumbnail Image (Optional)</Label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center ${formData.thumbnail_url ? "border-emerald-300 bg-emerald-50" : "border-slate-300"}`}>
                  {formData.thumbnail_url ? (
                    <div className="flex items-center justify-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">Thumbnail Uploaded</span>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, "thumbnail")}
                        disabled={uploading}
                      />
                      <div className="flex items-center justify-center gap-2 text-slate-500">
                        <Image className="w-5 h-5" />
                        <span>Add preview thumbnail</span>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: CTA & Placement */}
        {step === 3 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Call-to-Action & Placement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Call-to-Action Button *</Label>
                <Select
                  value={formData.cta_type}
                  onValueChange={(v) => setFormData({ ...formData, cta_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select CTA type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CTA_OPTIONS.map((cta) => (
                      <SelectItem key={cta.id} value={cta.id}>{cta.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>CTA Destination URL *</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="https://yourwebsite.com/product"
                    className="pl-10"
                    value={formData.cta_url}
                    onChange={(e) => setFormData({ ...formData, cta_url: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Placement Type</Label>
                <RadioGroup
                  value={formData.placement_type}
                  onValueChange={(v) => setFormData({ ...formData, placement_type: v })}
                >
                  {PLACEMENT_OPTIONS.map((option) => (
                    <div key={option.id} className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <label htmlFor={option.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-900">{option.label}</span>
                          {option.multiplier > 1 && (
                            <Badge variant="outline" className="text-amber-600 border-amber-200">
                              +{((option.multiplier - 1) * 100).toFixed(0)}%
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">{option.description}</p>
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Schedule */}
        {step === 4 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Campaign Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    min={formData.start_date || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Campaign Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Campaign Name</span>
                    <span className="font-medium text-slate-900">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">AR Type</span>
                    <span className="font-medium text-slate-900">
                      {AR_TYPES.find(t => t.id === formData.ar_type)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Placement</span>
                    <span className="font-medium text-slate-900">
                      {PLACEMENT_OPTIONS.find(p => p.id === formData.placement_type)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Credits Used</span>
                    <span className="font-medium text-violet-600">1 AR Credit</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || submitting}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create AR Campaign
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}