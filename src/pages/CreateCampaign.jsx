import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Upload,
  MapPin,
  MonitorPlay,
  Calendar,
  Clock,
  Building2,
  Loader2,
  Play,
  Image as ImageIcon,
  X,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CreativePreview from "@/components/campaigns/CreativePreview";

const STEPS = [
  { id: 1, name: "Details", icon: Calendar },
  { id: 2, name: "Locations", icon: MapPin },
  { id: 3, name: "Screens", icon: MonitorPlay },
  { id: 4, name: "Creative", icon: ImageIcon },
  { id: 5, name: "Review", icon: CheckCircle2 }
];

const TIME_SLOTS = [
  { id: "morning", label: "Morning", time: "6AM - 12PM" },
  { id: "afternoon", label: "Afternoon", time: "12PM - 5PM" },
  { id: "evening", label: "Evening", time: "5PM - 10PM" },
  { id: "peak", label: "Peak Hours", time: "12PM - 2PM, 6PM - 9PM" }
];

const CITIES = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah"];
const VENUE_TYPES = ["restaurant", "cafe", "mall", "gym", "coworking", "hotel", "hospital"];

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    start_date: null,
    end_date: null,
    time_slots: [],
    target_cities: [],
    target_venue_types: [],
    screen_ids: [],
    creative_url: "",
    creative_type: "",
    duration_seconds: 15
  });

  const [filters, setFilters] = useState({
    city: "",
    venue_type: "",
    size: "",
    orientation: ""
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

  const { data: venues = [] } = useQuery({
    queryKey: ["venues"],
    queryFn: () => base44.entities.Venue.filter({ status: "approved" })
  });

  const { data: screens = [] } = useQuery({
    queryKey: ["screens"],
    queryFn: () => base44.entities.Screen.filter({ status: "online" })
  });

  const filteredScreens = screens.filter(screen => {
    const venue = venues.find(v => v.id === screen.venue_id);
    if (!venue) return false;
    
    if (formData.target_cities.length > 0 && !formData.target_cities.includes(venue.city)) return false;
    if (formData.target_venue_types.length > 0 && !formData.target_venue_types.includes(venue.type)) return false;
    if (filters.size && screen.size !== filters.size) return false;
    if (filters.orientation && screen.orientation !== filters.orientation) return false;
    
    return true;
  });

  const selectedScreens = screens.filter(s => formData.screen_ids.includes(s.id));
  const totalCost = selectedScreens.reduce((sum, s) => {
    const days = formData.start_date && formData.end_date
      ? Math.ceil((new Date(formData.end_date) - new Date(formData.start_date)) / (1000 * 60 * 60 * 24)) + 1
      : 0;
    const hoursPerDay = formData.time_slots.length * 4; // ~4 hours per slot
    return sum + (s.hourly_rate * hoursPerDay * days);
  }, 0);

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
      setFormData({
        ...formData,
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

  const handleSubmit = async () => {
    if (totalCost > (user?.wallet_balance || 0)) {
      toast.error("Insufficient wallet balance");
      return;
    }

    setLoading(true);
    try {
      await base44.entities.Campaign.create({
        ...formData,
        advertiser_id: user.email,
        total_cost: totalCost,
        status: "pending_approval",
        impressions: 0,
        spend: 0
      });

      toast.success("Campaign submitted for approval!");
      navigate(createPageUrl("MyCampaigns"));
    } catch (error) {
      toast.error("Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name && formData.start_date && formData.end_date && formData.time_slots.length > 0;
      case 2:
        return formData.target_cities.length > 0;
      case 3:
        return formData.screen_ids.length > 0;
      case 4:
        return formData.creative_url;
      default:
        return true;
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Create Campaign</h1>
          <p className="text-slate-500">Set up your advertising campaign</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center">
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center transition-all
                  ${step >= s.id 
                    ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25' 
                    : 'bg-slate-100 text-slate-400'
                  }
                `}>
                  {step > s.id ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <s.icon className="w-5 h-5" />
                  )}
                </div>
                <p className={`text-sm mt-2 font-medium ${step >= s.id ? 'text-slate-900' : 'text-slate-400'}`}>
                  {s.name}
                </p>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${step > s.id ? 'bg-violet-600' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="border-0 shadow-xl">
        <CardContent className="p-8">
          {/* Step 1: Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input
                  placeholder="e.g., Summer Sale Promotion"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formData.start_date 
                          ? format(formData.start_date, "PPP")
                          : "Select date"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={formData.start_date}
                        onSelect={(date) => setFormData({ ...formData, start_date: date })}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formData.end_date 
                          ? format(formData.end_date, "PPP")
                          : "Select date"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={formData.end_date}
                        onSelect={(date) => setFormData({ ...formData, end_date: date })}
                        disabled={(date) => date < (formData.start_date || new Date())}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Time Slots</Label>
                <div className="grid grid-cols-2 gap-3">
                  {TIME_SLOTS.map((slot) => (
                    <label
                      key={slot.id}
                      className={`
                        flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                        ${formData.time_slots.includes(slot.id) 
                          ? 'border-violet-600 bg-violet-50' 
                          : 'border-slate-200 hover:border-slate-300'
                        }
                      `}
                    >
                      <Checkbox
                        checked={formData.time_slots.includes(slot.id)}
                        onCheckedChange={(checked) => {
                          setFormData({
                            ...formData,
                            time_slots: checked
                              ? [...formData.time_slots, slot.id]
                              : formData.time_slots.filter(s => s !== slot.id)
                          });
                        }}
                      />
                      <div>
                        <p className="font-medium">{slot.label}</p>
                        <p className="text-sm text-slate-500">{slot.time}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Locations */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Target Cities</Label>
                <div className="grid grid-cols-3 gap-3">
                  {CITIES.map((city) => (
                    <label
                      key={city}
                      className={`
                        flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                        ${formData.target_cities.includes(city) 
                          ? 'border-violet-600 bg-violet-50' 
                          : 'border-slate-200 hover:border-slate-300'
                        }
                      `}
                    >
                      <Checkbox
                        checked={formData.target_cities.includes(city)}
                        onCheckedChange={(checked) => {
                          setFormData({
                            ...formData,
                            target_cities: checked
                              ? [...formData.target_cities, city]
                              : formData.target_cities.filter(c => c !== city)
                          });
                        }}
                      />
                      <span className="font-medium">{city}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Venue Types (Optional)</Label>
                <div className="grid grid-cols-4 gap-3">
                  {VENUE_TYPES.map((type) => (
                    <label
                      key={type}
                      className={`
                        flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all text-sm
                        ${formData.target_venue_types.includes(type) 
                          ? 'border-violet-600 bg-violet-50' 
                          : 'border-slate-200 hover:border-slate-300'
                        }
                      `}
                    >
                      <Checkbox
                        checked={formData.target_venue_types.includes(type)}
                        onCheckedChange={(checked) => {
                          setFormData({
                            ...formData,
                            target_venue_types: checked
                              ? [...formData.target_venue_types, type]
                              : formData.target_venue_types.filter(t => t !== type)
                          });
                        }}
                      />
                      <span className="capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Screens */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Select value={filters.size} onValueChange={(v) => setFilters({ ...filters, size: v })}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sizes</SelectItem>
                    <SelectItem value="32&quot;">32"</SelectItem>
                    <SelectItem value="55&quot;">55"</SelectItem>
                    <SelectItem value="65&quot;">65"</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.orientation} onValueChange={(v) => setFilters({ ...filters, orientation: v })}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Orientation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                    <SelectItem value="portrait">Portrait</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="secondary" className="ml-auto">
                  {formData.screen_ids.length} selected
                </Badge>
              </div>

              <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
                {filteredScreens.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No screens available for selected locations
                  </div>
                ) : (
                  filteredScreens.map((screen) => {
                    const venue = venues.find(v => v.id === screen.venue_id);
                    const isSelected = formData.screen_ids.includes(screen.id);
                    
                    return (
                      <label
                        key={screen.id}
                        className={`
                          flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                          ${isSelected ? 'border-violet-600 bg-violet-50' : 'border-slate-200 hover:border-slate-300'}
                        `}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            setFormData({
                              ...formData,
                              screen_ids: checked
                                ? [...formData.screen_ids, screen.id]
                                : formData.screen_ids.filter(id => id !== screen.id)
                            });
                          }}
                        />
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                          <MonitorPlay className="w-6 h-6 text-slate-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{screen.name}</p>
                          <p className="text-sm text-slate-500">
                            {venue?.name} • {venue?.city} • {screen.size} {screen.orientation}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">AED {screen.hourly_rate}/hr</p>
                          <p className="text-xs text-slate-500">{screen.avg_daily_views || 0} views/day</p>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Step 4: Creative */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Upload Your Ad Creative</Label>
                <p className="text-sm text-slate-500">Supported: MP4, MOV, JPEG, PNG (max 50MB)</p>
              </div>

              {/* Real-Time Preview Button */}
              {formData.creative_url && (
                <CreativePreview
                  creativeUrl={formData.creative_url}
                  creativeType={formData.creative_type}
                  triggerButton={
                    <Button variant="outline" className="w-full">
                      <MonitorPlay className="w-4 h-4 mr-2" />
                      Preview on Different Screens & Venues
                    </Button>
                  }
                />
              )}

              {formData.creative_url ? (
                <div className="relative">
                  {formData.creative_type === "video" ? (
                    <video
                      src={formData.creative_url}
                      className="w-full aspect-video rounded-xl bg-slate-100 object-cover"
                      controls
                    />
                  ) : (
                    <img
                      src={formData.creative_url}
                      alt="Creative"
                      className="w-full aspect-video rounded-xl bg-slate-100 object-cover"
                    />
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => setFormData({ ...formData, creative_url: "", creative_type: "" })}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="block">
                  <div className={`
                    border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
                    ${uploading ? 'border-violet-300 bg-violet-50' : 'border-slate-200 hover:border-violet-300 hover:bg-violet-50'}
                  `}>
                    {uploading ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-12 h-12 text-violet-600 animate-spin mb-4" />
                        <p className="text-slate-600">Uploading...</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-lg font-medium text-slate-900 mb-1">Drop your file here</p>
                        <p className="text-slate-500">or click to browse</p>
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

              <div className="space-y-2">
                <Label>Ad Duration (seconds)</Label>
                <Select 
                  value={String(formData.duration_seconds)} 
                  onValueChange={(v) => setFormData({ ...formData, duration_seconds: parseInt(v) })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 seconds</SelectItem>
                    <SelectItem value="15">15 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">60 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Campaign Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Name</span>
                      <span className="font-medium">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Duration</span>
                      <span className="font-medium">
                        {formData.start_date && format(formData.start_date, "MMM d")} - 
                        {formData.end_date && format(formData.end_date, "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Time Slots</span>
                      <span className="font-medium">{formData.time_slots.join(", ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cities</span>
                      <span className="font-medium">{formData.target_cities.join(", ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Screens</span>
                      <span className="font-medium">{formData.screen_ids.length} selected</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Creative Preview</h3>
                  {formData.creative_url && (
                    formData.creative_type === "video" ? (
                      <video
                        src={formData.creative_url}
                        className="w-full aspect-video rounded-xl bg-slate-100 object-cover"
                        controls
                      />
                    ) : (
                      <img
                        src={formData.creative_url}
                        alt="Creative"
                        className="w-full aspect-video rounded-xl bg-slate-100 object-cover"
                      />
                    )
                  )}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-slate-900">Total Cost</span>
                  <span className="text-2xl font-bold text-violet-600">AED {totalCost.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Wallet Balance</span>
                  <span className={user?.wallet_balance >= totalCost ? "text-emerald-600" : "text-rose-600"}>
                    AED {user?.wallet_balance?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {step < 5 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || totalCost > (user?.wallet_balance || 0)}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              >
                {loading ? (
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
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}