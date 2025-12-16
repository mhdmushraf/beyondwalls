import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Store, 
  MapPin, 
  DollarSign, 
  Upload,
  CheckCircle2,
  Loader2,
  Calendar
} from "lucide-react";
import { toast } from "sonner";

export default function LocalBusinessMarketplace() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    business_name: "",
    business_phone: "",
    business_category: "restaurant",
    screen_id: "",
    venue_id: "",
    creative_url: "",
    creative_type: "image",
    campaign_duration_weeks: 1
  });
  const [uploading, setUploading] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setFormData(prev => ({ ...prev, business_owner_email: userData.email }));
    } catch (e) {
      console.error("Auth error:", e);
    }
  };

  // Fetch available screens with local business enabled
  const { data: screens = [] } = useQuery({
    queryKey: ["local-screens"],
    queryFn: () => base44.entities.Screen.filter({ local_business_enabled: true }),
  });

  const { data: venues = [] } = useQuery({
    queryKey: ["venues"],
    queryFn: () => base44.entities.Venue.list(),
  });

  const createListingMutation = useMutation({
    mutationFn: (data) => base44.entities.LocalBusinessListing.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["local-listings"] });
      toast.success("Campaign submitted for approval!");
      setStep(1);
      setFormData({
        business_name: "",
        business_phone: "",
        business_category: "restaurant",
        screen_id: "",
        venue_id: "",
        creative_url: "",
        creative_type: "image",
        campaign_duration_weeks: 1,
        business_owner_email: user?.email
      });
    },
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ 
        ...formData, 
        creative_url: file_url,
        creative_type: file.type.startsWith('video') ? 'video' : 'image'
      });
      toast.success("Creative uploaded!");
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    const selectedScreen = screens.find(s => s.id === formData.screen_id);
    const totalCost = selectedScreen ? selectedScreen.slot_price * formData.campaign_duration_weeks * 0.7 : 0; // 30% discount for local businesses

    createListingMutation.mutate({
      ...formData,
      total_cost: totalCost,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + formData.campaign_duration_weeks * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  };

  if (!user) {
    return <div className="p-6">Loading...</div>;
  }

  const selectedScreen = screens.find(s => s.id === formData.screen_id);
  const totalCost = selectedScreen ? selectedScreen.slot_price * formData.campaign_duration_weeks * 0.7 : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Local Business Marketplace</h1>
          <p className="text-slate-600">Advertise on nearby screens at discounted rates</p>
          <Badge className="mt-2 bg-green-600">30% Off for Local Businesses</Badge>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-12 h-2 rounded-full ${step >= s ? 'bg-violet-600' : 'bg-slate-200'}`}
            />
          ))}
        </div>

        {/* Step 1: Business Info */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5 text-violet-600" />
                Business Information
              </CardTitle>
              <CardDescription>Tell us about your business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Business Name</Label>
                <Input
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  placeholder="Your Business Name"
                />
              </div>

              <div>
                <Label>Contact Phone</Label>
                <Input
                  value={formData.business_phone}
                  onChange={(e) => setFormData({ ...formData, business_phone: e.target.value })}
                  placeholder="+971 XX XXX XXXX"
                />
              </div>

              <div>
                <Label>Business Category</Label>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={formData.business_category}
                  onChange={(e) => setFormData({ ...formData, business_category: e.target.value })}
                >
                  <option value="restaurant">Restaurant</option>
                  <option value="retail">Retail</option>
                  <option value="service">Service</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="health">Health & Fitness</option>
                  <option value="education">Education</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <Button 
                onClick={() => setStep(2)}
                disabled={!formData.business_name || !formData.business_phone}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600"
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Select Screen */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-violet-600" />
                Choose Your Screen
              </CardTitle>
              <CardDescription>Select a nearby screen location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {screens.length === 0 ? (
                <p className="text-slate-600 text-center py-8">No screens available for local advertising yet</p>
              ) : (
                <div className="space-y-3">
                  {screens.map((screen) => {
                    const venue = venues.find(v => v.id === screen.venue_id);
                    const weeklyPrice = screen.slot_price * 0.7; // 30% discount
                    
                    return (
                      <div
                        key={screen.id}
                        onClick={() => setFormData({ 
                          ...formData, 
                          screen_id: screen.id,
                          venue_id: screen.venue_id
                        })}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.screen_id === screen.id
                            ? 'border-violet-500 bg-violet-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{venue?.name || 'Venue'}</h3>
                            <p className="text-sm text-slate-600">{venue?.address}</p>
                            <Badge className="mt-2" variant="outline">
                              {screen.size} • {screen.orientation}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              AED {weeklyPrice}
                            </div>
                            <p className="text-xs text-slate-500 line-through">
                              AED {screen.slot_price}
                            </p>
                            <p className="text-xs text-green-600 font-medium">per week</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)}
                  disabled={!formData.screen_id}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Upload Creative & Duration */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-violet-600" />
                Campaign Details
              </CardTitle>
              <CardDescription>Upload your ad and set duration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Upload Your Ad Creative</Label>
                <Input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="mt-2"
                />
                {uploading && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </div>
                )}
                {formData.creative_url && !uploading && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    Creative uploaded successfully
                  </div>
                )}
              </div>

              <div>
                <Label>Campaign Duration (Weeks)</Label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.campaign_duration_weeks}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    campaign_duration_weeks: parseInt(e.target.value) || 1 
                  })}
                  className="mt-2"
                />
              </div>

              {/* Cost Summary */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Total Campaign Cost:</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      AED {totalCost.toFixed(2)}
                    </div>
                    <p className="text-xs text-green-600">30% local discount applied</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 mt-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formData.campaign_duration_weeks} week{formData.campaign_duration_weeks > 1 ? 's' : ''} • 
                  {' '}{formData.campaign_duration_weeks * 7} days</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!formData.creative_url || createListingMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  {createListingMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Submit Campaign
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}