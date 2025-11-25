import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, addWeeks, getDay, getHours, isWithinInterval, parseISO } from "date-fns";
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
  Eye,
  AlertCircle,
  Mail
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
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);
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

  // Dynamic pricing calculation
  const calculateDynamicPrice = useMemo(() => {
    if (!selectedScreen) return { dynamicPrice: 0, totalCost: 0, multiplier: 1, basePrice: 0 };
    
    const basePrice = selectedScreen.slot_price || 100;
    const venue = venues.find(v => v.id === selectedScreen.venue_id);
    
    // Demand multiplier
    const screenBookings = allBookings.filter(b => b.screen_id === selectedScreen.id && b.status === "active");
    const occupancyRate = screenBookings.length / 5;
    let demandMultiplier = 1;
    if (occupancyRate >= 0.8) demandMultiplier = 1.3;
    else if (occupancyRate >= 0.6) demandMultiplier = 1.15;
    else if (occupancyRate >= 0.4) demandMultiplier = 1.0;
    else if (occupancyRate >= 0.2) demandMultiplier = 0.9;
    else demandMultiplier = 0.85;

    // Time of day multiplier
    const hour = getHours(formData.start_date);
    let timeMultiplier = 1;
    if (hour >= 11 && hour <= 14) timeMultiplier = 1.2;
    else if (hour >= 17 && hour <= 21) timeMultiplier = 1.25;
    else if (hour >= 6 && hour <= 9) timeMultiplier = 1.1;

    // Day of week multiplier
    const day = getDay(formData.start_date);
    let dayMultiplier = 1;
    if (day === 5 || day === 6) dayMultiplier = 1.15;
    else if (day === 4) dayMultiplier = 1.1;

    // Seasonal multiplier
    const month = formData.start_date.getMonth();
    let seasonMultiplier = 1;
    if (month >= 10 || month <= 2) seasonMultiplier = 1.2;
    else if (month >= 5 && month <= 8) seasonMultiplier = 0.85;

    // Venue type multiplier
    let venueMultiplier = 1;
    if (venue) {
      const premiumVenues = ["mall", "hotel", "hospital"];
      if (premiumVenues.includes(venue.type)) venueMultiplier = 1.25;
      else if (venue.avg_daily_footfall > 1000) venueMultiplier = 1.15;
    }

    // Custom pricing rules
    let customMultiplier = 1;
    pricingRules.filter(rule => rule.is_active).forEach(rule => {
      if (rule.type === "seasonal" && rule.start_date && rule.end_date) {
        try {
          const start = parseISO(rule.start_date);
          const end = parseISO(rule.end_date);
          if (isWithinInterval(formData.start_date, { start, end })) {
            customMultiplier *= rule.multiplier;
          }
        } catch (e) {}
      }
    });

    const totalMultiplier = demandMultiplier * timeMultiplier * dayMultiplier * seasonMultiplier * venueMultiplier * customMultiplier;
    const dynamicPrice = Math.round(basePrice * totalMultiplier);
    const totalCost = dynamicPrice * formData.weeks;

    return { dynamicPrice, totalCost, multiplier: totalMultiplier, basePrice };
  }, [selectedScreen, formData.start_date, formData.weeks, allBookings, venues, pricingRules]);

  // Real-time availability check
  const checkSlotAvailability = async () => {
    if (!selectedScreen || !selectedSlot) return true;
    
    setCheckingAvailability(true);
    setAvailabilityError(null);
    
    try {
      // Refresh bookings to get latest data
      const latestBookings = await base44.entities.AdSlotBooking.filter({
        screen_id: selectedScreen.id,
        status: "active"
      });
      
      const isSlotTaken = latestBookings.some(b => b.slot_number === selectedSlot);
      
      if (isSlotTaken) {
        setAvailabilityError(`Slot ${selectedSlot} was just booked by another user. Please select a different slot.`);
        queryClient.invalidateQueries({ queryKey: ["screen-bookings", selectedScreen.id] });
        return false;
      }
      
      // Check if screen is still online
      const screenData = await base44.entities.Screen.filter({ id: selectedScreen.id });
      if (screenData.length === 0 || screenData[0].status !== "online") {
        setAvailabilityError("This screen is no longer available. Please select another screen.");
        return false;
      }
      
      return true;
    } catch (error) {
      setAvailabilityError("Failed to verify availability. Please try again.");
      return false;
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Send confirmation emails
  const sendConfirmationEmails = async (booking, screenOwner) => {
    const venue = venues.find(v => v.id === selectedScreen.venue_id);
    
    // Email to advertiser
    const advertiserEmailBody = `
Dear ${user.full_name},

Your ad slot booking has been confirmed! 🎉

Booking Details:
━━━━━━━━━━━━━━━━━━━━━━━━━
📺 Screen: ${selectedScreen.name}
📍 Venue: ${venue?.name || 'N/A'} - ${venue?.city || 'N/A'}
🎯 Campaign: ${formData.campaign_name}
📅 Duration: ${format(formData.start_date, "PPP")} to ${format(addWeeks(formData.start_date, formData.weeks), "PPP")}
💰 Total Cost: AED ${calculateDynamicPrice.totalCost.toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━━━━

Your ad will start displaying on ${format(formData.start_date, "PPP")}.

Track your campaign performance in your dashboard.

Best regards,
BeyondWalls Team
    `.trim();

    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `✅ Booking Confirmed: ${formData.campaign_name}`,
      body: advertiserEmailBody
    });

    // Email to venue owner
    if (screenOwner) {
      const ownerShare = calculateDynamicPrice.totalCost * 0.7;
      const ownerEmailBody = `
Dear ${screenOwner.full_name},

Great news! A new ad has been booked on your screen! 💰

Booking Details:
━━━━━━━━━━━━━━━━━━━━━━━━━
📺 Screen: ${selectedScreen.name}
🎯 Campaign: ${formData.campaign_name}
📅 Duration: ${format(formData.start_date, "PPP")} to ${format(addWeeks(formData.start_date, formData.weeks), "PPP")}
💵 Your Earnings: AED ${ownerShare.toLocaleString()} (70% revenue share)
━━━━━━━━━━━━━━━━━━━━━━━━━

The earnings have been credited to your wallet.

View your earnings in your dashboard.

Best regards,
BeyondWalls Team
      `.trim();

      await base44.integrations.Core.SendEmail({
        to: screenOwner.email,
        subject: `💰 New Booking on ${selectedScreen.name}`,
        body: ownerEmailBody
      });
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

  const endDate = addWeeks(formData.start_date, formData.weeks);
  const { totalCost = 0, dynamicPrice = 0 } = calculateDynamicPrice || {};

  const handleSubmit = async () => {
    if (totalCost > (user?.wallet_balance || 0)) {
      toast.error("Insufficient wallet balance");
      return;
    }

    setLoading(true);
    
    // Final availability check before booking
    const isAvailable = await checkSlotAvailability();
    if (!isAvailable) {
      setLoading(false);
      setStep(2); // Go back to slot selection
      return;
    }

    try {
      // Create booking
      const booking = await base44.entities.AdSlotBooking.create({
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
      let screenOwner = null;
      const screenOwnerData = await base44.entities.User.filter({ email: selectedScreen.owner_id });
      if (screenOwnerData.length > 0) {
        screenOwner = screenOwnerData[0];
        const ownerShare = totalCost * 0.7; // 70% to screen owner
        await base44.entities.User.update(screenOwner.id, {
          wallet_balance: (screenOwner.wallet_balance || 0) + ownerShare,
          total_earnings: (screenOwner.total_earnings || 0) + ownerShare
        });

        await base44.entities.Transaction.create({
          user_id: screenOwner.email,
          type: "earning",
          amount: ownerShare,
          balance_after: (screenOwner.wallet_balance || 0) + ownerShare,
          reference_id: selectedScreen.id,
          description: `Ad slot earning from ${selectedScreen.name}`,
          status: "completed"
        });
      }

      // Send confirmation emails
      try {
        await sendConfirmationEmails(booking, screenOwner);
      } catch (emailError) {
        console.log("Email sending failed, but booking succeeded");
      }

      toast.success("Ad slot booked successfully! Confirmation email sent.");
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
              <CardTitle className="flex items-center justify-between">
                <span>Select Available Slot</span>
                <Badge variant="outline" className="font-normal">
                  {getAvailableSlots().length} of 5 available
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {availabilityError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-rose-700">{availabilityError}</p>
                </div>
              )}
              <div className="grid grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((slot) => {
                  const isBooked = !getAvailableSlots().includes(slot);
                  return (
                    <button
                      key={slot}
                      disabled={isBooked}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setAvailabilityError(null);
                      }}
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
              {getAvailableSlots().length === 0 && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
                  <AlertCircle className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                  <p className="text-amber-800 font-medium">No slots available on this screen</p>
                  <p className="text-amber-600 text-sm mt-1">Please select a different screen</p>
                </div>
              )}
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
                      AED {dynamicPrice || 0}/week × {formData.weeks} weeks
                      {calculateDynamicPrice.multiplier !== 1 && (
                        <span className={calculateDynamicPrice.multiplier > 1 ? "text-rose-500 ml-1" : "text-emerald-500 ml-1"}>
                          ({calculateDynamicPrice.multiplier > 1 ? "+" : ""}{((calculateDynamicPrice.multiplier - 1) * 100).toFixed(0)}% dynamic pricing)
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-violet-600">AED {(totalCost || 0).toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center mt-3 text-sm">
                  <span className="text-slate-500">Wallet Balance</span>
                  <span className={user?.wallet_balance >= totalCost ? "text-emerald-600" : "text-rose-600"}>
                    AED {user?.wallet_balance?.toLocaleString() || 0}
                  </span>
                </div>
                {user?.wallet_balance < totalCost && (
                  <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                    <p className="text-sm text-rose-700">Insufficient balance. Please top up your wallet.</p>
                  </div>
                )}
                <div className="mt-4 p-3 bg-violet-50 border border-violet-200 rounded-lg flex items-center gap-2">
                  <Mail className="w-5 h-5 text-violet-600" />
                  <p className="text-sm text-violet-700">Confirmation email will be sent to {user?.email}</p>
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
              disabled={loading || checkingAvailability || totalCost > (user?.wallet_balance || 0)}
              className="bg-gradient-to-r from-violet-600 to-indigo-600"
            >
              {loading || checkingAvailability ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {checkingAvailability ? "Checking availability..." : "Processing..."}
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