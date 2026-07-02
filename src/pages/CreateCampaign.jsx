import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import SEOHead from "@/components/SEOHead";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeft, ArrowRight, Upload, MapPin, Target,
  DollarSign, CheckCircle2, Loader2, X, MonitorPlay
} from "lucide-react";

const GOALS = [
  { value: "brand_awareness", label: "Brand Awareness", icon: "🎯" },
  { value: "drive_traffic", label: "Drive Traffic", icon: "🚀" },
  { value: "promote_event", label: "Promote Event", icon: "🎉" },
  { value: "product_launch", label: "Product Launch", icon: "✨" },
  { value: "other", label: "Other", icon: "📢" },
];

export default function CreateCampaign() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [screens, setScreens] = useState([]);
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    goal: "",
    total_budget: "",
    start_date: "",
    end_date: "",
    selected_screens: [],
    creative_urls: [],
    creative_type: "image",
    target_cities: [],
    target_venue_types: [],
  });

  useEffect(() => {
    base44.auth.me().then(setUser);
    base44.entities.Screen.filter({ approval_status: "approved", status: "active" }).then(setScreens);
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm(f => ({ ...f, creative_urls: [...f.creative_urls, file_url], creative_type: file.type.startsWith("video") ? "video" : "image" }));
      toast({ title: "Creative uploaded!" });
    } catch (err) {
      toast({ title: "Upload failed", variant: "destructive" });
    }
    setUploading(false);
  };

  const toggleScreen = (id) => {
    setForm(f => ({
      ...f,
      selected_screens: f.selected_screens.includes(id)
        ? f.selected_screens.filter(s => s !== id)
        : [...f.selected_screens, id]
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (user.wallet_balance < Number(form.total_budget)) {
      toast({ title: "Insufficient wallet balance", description: "Please top up your wallet first", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const campaign = await base44.entities.Campaign.create({
        ...form,
        advertiser_email: user.email,
        total_budget: Number(form.total_budget),
        status: "pending_approval",
        approval_status: "pending",
      });

      // Deduct from wallet
      await base44.auth.updateMe({ wallet_balance: (user.wallet_balance || 0) - Number(form.total_budget) });

      // Create transaction
      await base44.entities.Transaction.create({
        user_email: user.email,
        type: "campaign_payment",
        amount: Number(form.total_budget),
        description: `Campaign: ${form.name}`,
        reference_id: campaign.id,
        status: "completed",
      });

      // Notify admin
      await base44.entities.Notification.create({
        recipient_email: "admin",
        type: "campaign_approved",
        title: "New Campaign Pending Review",
        message: `${user.full_name} submitted campaign "${form.name}" for AED ${form.total_budget}`,
        reference_id: campaign.id,
      });

      // Email advertiser
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: "Campaign Submitted for Review - BeyondWalls",
        body: `Hi ${user.full_name},\n\nYour campaign "${form.name}" has been submitted and is pending admin approval. You'll be notified once it's reviewed.\n\nBudget: AED ${form.total_budget}\n\nBeyondWalls Team`,
      });

      toast({ title: "Campaign submitted for approval!", description: "You'll receive an email confirmation shortly." });
      navigate("/MyCampaigns");
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const steps = ["Details", "Creatives", "Screens", "Budget & Review"];

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <SEOHead noIndex title="Create Campaign | Beyond Walls" />
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Create Campaign</h1>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <div className={`flex items-center gap-2 flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${step === i + 1 ? "bg-violet-600 text-white" : step > i + 1 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                {step > i + 1 ? <CheckCircle2 className="w-4 h-4" /> : <span>{i + 1}</span>}
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < 3 && <div className={`h-0.5 w-6 flex-shrink-0 ${step > i + 1 ? "bg-emerald-400" : "bg-slate-200"}`} />}
            </React.Fragment>
          ))}
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 sm:p-6">
            {/* Step 1: Details */}
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-slate-900">Campaign Details</h2>
                <div>
                  <Label>Campaign Name *</Label>
                  <Input className="mt-1" placeholder="e.g. Summer Sale 2026" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <Label className="mb-2 block">Campaign Goal *</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {GOALS.map(g => (
                      <button key={g.value} onClick={() => setForm(f => ({ ...f, goal: g.value }))}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${form.goal === g.value ? "border-violet-600 bg-violet-50" : "border-slate-200 hover:border-slate-300"}`}>
                        <div className="text-2xl mb-1">{g.icon}</div>
                        <div className="text-sm font-medium text-slate-800">{g.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Creatives */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-slate-900">Upload Creatives</h2>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
                  <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 mb-2">Drag & drop or click to upload</p>
                  <p className="text-xs text-slate-400 mb-4">Supported: JPG, PNG, MP4 (max 50MB)</p>
                  <label>
                    <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
                    <Button variant="outline" disabled={uploading} className="cursor-pointer" asChild>
                      <span>{uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</> : "Choose File"}</span>
                    </Button>
                  </label>
                </div>
                {form.creative_urls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {form.creative_urls.map((url, i) => (
                      <div key={i} className="relative group rounded-lg overflow-hidden border border-slate-200">
                        <img src={url} alt="" className="w-full h-28 object-cover" />
                        <button onClick={() => setForm(f => ({ ...f, creative_urls: f.creative_urls.filter((_, j) => j !== i) }))}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Screen Selection */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Select Screens ({form.selected_screens.length} selected)</h2>
                {screens.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No approved screens available yet</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {screens.map(s => (
                      <button key={s.id} onClick={() => toggleScreen(s.id)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${form.selected_screens.includes(s.id) ? "border-violet-600 bg-violet-50" : "border-slate-200 hover:border-slate-300"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <MonitorPlay className="w-4 h-4 text-violet-600" />
                          <span className="font-medium text-sm">{s.name}</span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          AED {s.price_per_week}/week
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Budget & Review */}
            {step === 4 && (
              <div className="space-y-5">
                <h2 className="text-lg font-semibold text-slate-900">Budget & Schedule</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date *</Label>
                    <Input className="mt-1" type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
                  </div>
                  <div>
                    <Label>End Date *</Label>
                    <Input className="mt-1" type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>Total Budget (AED) *</Label>
                  <Input className="mt-1" type="number" placeholder="e.g. 500" value={form.total_budget} onChange={e => setForm(f => ({ ...f, total_budget: e.target.value }))} />
                  <p className="text-xs text-slate-500 mt-1">Wallet balance: AED {(user?.wallet_balance || 0).toLocaleString()}</p>
                </div>
                {/* Summary */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <h3 className="font-semibold text-slate-800">Campaign Summary</h3>
                  <div className="text-sm text-slate-600 space-y-1">
                    <div className="flex justify-between"><span>Name:</span><span className="font-medium">{form.name}</span></div>
                    <div className="flex justify-between"><span>Goal:</span><span className="font-medium">{form.goal}</span></div>
                    <div className="flex justify-between"><span>Screens:</span><span className="font-medium">{form.selected_screens.length} selected</span></div>
                    <div className="flex justify-between"><span>Creatives:</span><span className="font-medium">{form.creative_urls.length} uploaded</span></div>
                    <div className="flex justify-between font-semibold text-slate-900 border-t pt-2 mt-2"><span>Total Budget:</span><span>AED {Number(form.total_budget || 0).toLocaleString()}</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {step === 1 ? "Cancel" : "Back"}
              </Button>
              {step < 4 ? (
                <Button onClick={() => setStep(s => s + 1)} disabled={step === 1 && (!form.name || !form.goal)}
                  className="bg-violet-600 hover:bg-violet-700">
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading || !form.name || !form.total_budget}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : "Submit Campaign"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}