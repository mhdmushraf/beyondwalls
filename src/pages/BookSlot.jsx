import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, addWeeks } from "date-fns";
import {
  ArrowLeft,
  ArrowRight,
  MonitorPlay,
  MapPin,
  Building2,
  Search,
  Filter,
  Upload,
  Loader2,
  CheckCircle2,
  X,
  Calendar,
  Clock,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import PricingCalculator from "@/components/pricing/PricingCalculator";
import AIRecommendations from "@/components/recommendations/AIRecommendations";

export default function BookSlot() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ city: "", venue_type: "" });
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    campaign_name: "",
    creative_url: "",
    creative_type: "image",
    start_date: new Date(),
    weeks: 1
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

  const { data: screens = [] } = useQuery({
    queryKey: ["available-screens"],
    queryFn: () => base44.entities.Screen.filter({ status: "online" })
  });

  const { data: venues = [] } = useQuery({
    queryKey: ["venues"],
    queryFn: () => base44.entities.Venue.filter({ status: "approved" })
  });

  const { data: existingBookings = [] } = useQuery({
    queryKey: ["screen-bookings", selectedScreen?.id],
    queryFn: () => base44.entities.AdSlotBooking.filter({ 
      screen_id: selectedScreen?.id, 
      status: "active" 
    }),
    enabled: !!selectedScreen
  });

  const { data: allBookings = [] } = useQuery({
    queryKey: ["all-bookings"],
    queryFn: () => base44.entities.AdSlotBooking.filter({ status: "active" })
  });

  const { data: pricingRules = [] } = useQuery({
    queryKey: ["pricing-rules"],
    queryFn: () => base44.entities.PricingRule.list()
  });

  const filteredScreens = screens.filter(screen => {
    const venue = venues.find(v => v.id === screen.venue_id);
    if (!venue) return false;
    
    if (filters.city && venue.city !== filters.city) return false;
    if (filters.venue_type && venue.type !== filters.venue_type) return false;
    if (search && !screen.name.toLowerCase().includes(search.toLowerCase()) && 
        !venue.name.toLowerCase().includes(search.toLowerCase())) return false;
    
    return true;
  });

  const getAvailableSlots = () => {
    if (!selectedScreen) return [];
    const bookedSlots = existingBookings.map(b => b.slot_number);
    return [1, 2, 3, 4, 5].filter(slot => !bookedSlots.includes(slot));
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
      setFormData({
        ...formData,
        creative_url: file_url,
        creative_type: isVideo ? "video" : "image"
      });
      toast.success("Creative uploaded");
    } catch (error) {
      toast.error("Failed to upload");
    } finally {
      setUploading(false);
    }
  };

  const totalCost = selectedScreen ? selectedScreen.slot_price * formData.weeks : 0;
  const endDate = addWeeks(formData.start_date, formData.weeks);

  const handleSubmit = async () => {
    if (totalCost > (user?.wallet_balance || 0)) {
      toast.error("Insufficient wallet balance");
      return;
    }

    setLoading(true);
    try {
      // Create booking
      await base44.entities.AdSlotBooking.create({
        screen_id: selectedScreen.id,
        advertiser_id: user.email,
        slot_number: selectedSlot,
        creative_url: formData.creative_url,
        creative_type: formData.creative_type,
        duration_seconds: 15,
        start_date: format(formData.start_date, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        weeks_booked: formData.weeks,
        total_cost: totalCost,
        status: "active",
        campaign_name: formData.campaign_name
      });

      // Deduct from wallet
      await base44.auth.updateMe({
        wallet_balance: (user.wallet_balance || 0) - totalCost,
        total_spent: (user.total_spent || 0) + totalCost
      });

      // Create transaction
      await base44.entities.Transaction.create({
        user_id: user.email,
        type: "ad_spend",
        amount: totalCost,
        balance_after: (user.wallet_balance || 0) - totalCost,
        reference_id: selectedScreen.id,
        description: `Ad slot booking on ${selectedScreen.name}`,
        status: "completed"
      });

      // Credit screen owner
      const screenOwner = await base44.entities.User.filter({ email: selectedScreen.owner_id });
      if (screenOwner.length > 0) {
        const owner = screenOwner[0];
        const ownerShare = totalCost * 0.7; // 70% to screen owner
        await base44.entities.User.update(owner.id, {
          wallet_balance: (owner.wallet_balance || 0) + ownerShare,
          total_earnings: (owner.total_earnings || 0) + ownerShare
        });

        await base44.entities.Transaction.create({
          user_id: owner.email,
          type: "earning",
          amount: ownerShare,
          balance_after: (owner.wallet_balance || 0) + ownerShare,
          reference_id: selectedScreen.id,
          description: `Ad slot earning from ${selectedScreen.name}`,
          status: "completed"
        });
      }

      toast.success("Ad slot booked successfully!");
      navigate(createPageUrl("MyBookings"));
    } catch (error) {
      toast.error("Failed to book slot");
    } finally {
      setLoading(false);
    }
  };

  const cities = [...new Set(venues.map(v => v.city))];
  const venueTypes = [...new Set(venues.map(v => v.type))];

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Book Ad Slot</h1>
          <p className="text-slate-500">Advertise on screens across the UAE</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-3 mb-8">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
              step >= s ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-400"
            }`}>
              {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
            </div>
            {s < 3 && <div className={`flex-1 h-1 ${step > s ? "bg-violet-600" : "bg-slate-200"}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Select Screen */}
      {step === 1 && (
        <div className="space-y-6">
          {/* AI Recommendations */}
          <AIRecommendations
            user={user}
            screens={screens}
            venues={venues}
            currentBookings={existingBookings}
            onSelectScreen={(screen) => {
              setSelectedScreen(screen);
              setStep(2);
            }}
          />

          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search screens or venues..." 
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filters.city} onValueChange={(v) => setFilters({...filters, city: v})}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.venue_type} onValueChange={(v) => setFilters({...filters, venue_type: v})}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Venue Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {venueTypes.map(type => (
                  <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScreens.map((screen) => {
              const venue = venues.find(v => v.id === screen.venue_id);
              const bookedCount = 5 - (screen.available_slots || 5);
              
              return (
                <Card 
                  key={screen.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedScreen?.id === screen.id ? "ring-2 ring-violet-600" : ""
                  }`}
                  onClick={() => setSelectedScreen(screen)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MonitorPlay className="w-7 h-7 text-violet-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">{screen.name}</h3>
                        <p className="text-sm text-slate-500 truncate">{venue?.name}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                          <MapPin className="w-3 h-3" />
                          <span>{venue?.city}</span>
                          <span>•</span>
                          <span>{screen.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div>
                        <p className="text-lg font-bold text-violet-600">AED {screen.slot_price}/week</p>
                        <p className="text-xs text-slate-500">per slot</p>
                      </div>
                      <Badge variant={bookedCount === 5 ? "destructive" : "secondary"}>
                        {5 - bookedCount} slots available
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredScreens.length === 0 && (
            <div className="text-center py-12">
              <MonitorPlay className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No screens available</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button 
              onClick={() => setStep(2)}
              disabled={!selectedScreen}
              className="bg-gradient-to-r from-violet-600 to-indigo-600"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Select Slot & Upload Creative */}
      {step === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Available Slot</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((slot) => {
                  const isBooked = !getAvailableSlots().includes(slot);
                  return (
                    <button
                      key={slot}
                      disabled={isBooked}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isBooked 
                          ? "bg-slate-100 border-slate-200 cursor-not-allowed opacity-50"
                          : selectedSlot === slot
                            ? "bg-violet-50 border-violet-600"
                            : "bg-white border-slate-200 hover:border-violet-300"
                      }`}
                    >
                      <p className="font-bold text-lg">Slot {slot}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {isBooked ? "Booked" : "Available"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Campaign Name</Label>
                <Input 
                  placeholder="e.g., Summer Sale Campaign"
                  value={formData.campaign_name}
                  onChange={(e) => setFormData({...formData, campaign_name: e.target.value})}
                />
              </div>

              <div>
                <Label>Upload Ad Creative (15 seconds)</Label>
                {formData.creative_url ? (
                  <div className="relative mt-2">
                    {formData.creative_type === "video" ? (
                      <video src={formData.creative_url} className="w-full max-h-48 rounded-lg object-cover" controls />
                    ) : (
                      <img src={formData.creative_url} className="w-full max-h-48 rounded-lg object-cover" alt="Creative" />
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => setFormData({...formData, creative_url: "", creative_type: "image"})}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="block mt-2">
                    <div className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      uploading ? "border-violet-300 bg-violet-50" : "border-slate-200 hover:border-violet-300"
                    }`}>
                      {uploading ? (
                        <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-slate-600">Click to upload image or video</p>
                        </>
                      )}
                    </div>
                    <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start mt-1">
                        <Calendar className="w-4 h-4 mr-2" />
                        {format(formData.start_date, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={formData.start_date}
                        onSelect={(date) => setFormData({...formData, start_date: date || new Date()})}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Duration (Weeks)</Label>
                  <Select 
                    value={String(formData.weeks)} 
                    onValueChange={(v) => setFormData({...formData, weeks: parseInt(v)})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 8, 12].map(w => (
                        <SelectItem key={w} value={String(w)}>{w} week{w > 1 ? "s" : ""}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Pricing Calculator */}
          {selectedScreen && (
            <PricingCalculator
              basePrice={selectedScreen.slot_price || 100}
              screen={selectedScreen}
              venue={venues.find(v => v.id === selectedScreen.venue_id)}
              pricingRules={pricingRules}
              bookings={allBookings}
              selectedDate={formData.start_date}
              weeks={formData.weeks}
            />
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              onClick={() => setStep(3)}
              disabled={!selectedSlot || !formData.creative_url || !formData.campaign_name}
              className="bg-gradient-to-r from-violet-600 to-indigo-600"
            >
              Review Booking
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Confirm */}
      {step === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Screen</span>
                    <span className="font-medium">{selectedScreen?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Slot Number</span>
                    <span className="font-medium">Slot {selectedSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Campaign</span>
                    <span className="font-medium">{formData.campaign_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration</span>
                    <span className="font-medium">{formData.weeks} week{formData.weeks > 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Start Date</span>
                    <span className="font-medium">{format(formData.start_date, "PPP")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">End Date</span>
                    <span className="font-medium">{format(endDate, "PPP")}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-2">Creative Preview</p>
                  {formData.creative_type === "video" ? (
                    <video src={formData.creative_url} className="w-full rounded-lg" controls />
                  ) : (
                    <img src={formData.creative_url} className="w-full rounded-lg" alt="Creative" />
                  )}
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-bold">Total Cost</p>
                    <p className="text-sm text-slate-500">
                      AED {selectedScreen?.slot_price}/week × {formData.weeks} weeks
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-violet-600">AED {totalCost}</p>
                </div>
                <div className="flex justify-between items-center mt-3 text-sm">
                  <span className="text-slate-500">Wallet Balance</span>
                  <span className={user?.wallet_balance >= totalCost ? "text-emerald-600" : "text-rose-600"}>
                    AED {user?.wallet_balance?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading || totalCost > (user?.wallet_balance || 0)}
              className="bg-gradient-to-r from-violet-600 to-indigo-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm Booking
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}