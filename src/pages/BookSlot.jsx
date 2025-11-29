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
  Mail,
  Star,
  Sparkles,
  RefreshCw,
  ShoppingCart,
  Plus,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
import { Switch } from "@/components/ui/switch";
import PricingCalculator from "@/components/pricing/PricingCalculator";
import AIRecommendations from "@/components/recommendations/AIRecommendations";
import AdvancedScreenSearch from "@/components/booking/AdvancedScreenSearch";
import BookingCart from "@/components/booking/BookingCart";
import CartCheckout from "@/components/booking/CartCheckout";

export default function BookSlot() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [selectedScreens, setSelectedScreens] = useState([]); // Multi-select
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);


  const [formData, setFormData] = useState({
    campaign_name: "",
    creative_url: "",
    creative_type: "image",
    start_date: new Date(),
    weeks: 1,
    headline: "",
    description: "",
    business_name: "",
    product_service: ""
  });
  const [adCopyVariations, setAdCopyVariations] = useState([]);
  const [generatingCopy, setGeneratingCopy] = useState(false);
  
  // Cart state
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState(false);

  // All hooks must be called before any conditional returns
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

  const { data: favorites = [], refetch: refetchFavorites } = useQuery({
    queryKey: ["favorites", user?.email],
    queryFn: () => base44.entities.FavoriteScreen.filter({ user_id: user?.email }),
    enabled: !!user?.email
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl("BookSlot"));
        return;
      }
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {
      base44.auth.redirectToLogin(createPageUrl("BookSlot"));
    }
  };

  // All useMemo and derived values
  const endDate = addWeeks(formData.start_date, formData.weeks);

  const isFavorite = (screenId) => favorites.some(f => f.screen_id === screenId);

  const toggleFavorite = async (e, screenId) => {
    e.stopPropagation();
    const existing = favorites.find(f => f.screen_id === screenId);
    if (existing) {
      await base44.entities.FavoriteScreen.delete(existing.id);
      toast.success("Removed from favorites");
    } else {
      await base44.entities.FavoriteScreen.create({ user_id: user.email, screen_id: screenId });
      toast.success("Added to favorites");
    }
    refetchFavorites();
  };

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

  

  const generateAdCopy = async () => {
    if (!formData.business_name && !formData.campaign_name) {
      toast.error("Please enter a campaign or business name first");
      return;
    }

    setGeneratingCopy(true);
    try {
      const venue = selectedScreen ? venues.find(v => v.id === selectedScreen.venue_id) : null;
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert advertising copywriter. Generate 3 compelling ad copy variations for a digital signage advertisement.

BUSINESS/CAMPAIGN INFO:
- Campaign Name: ${formData.campaign_name || "N/A"}
- Business Name: ${formData.business_name || "N/A"}
- Product/Service: ${formData.product_service || "General business promotion"}
- Venue Type: ${venue?.type || "retail venue"}
- Location: ${venue?.city || "UAE"}

Generate 3 different ad copy variations with different tones (professional, friendly, urgent). Each should have:
- A catchy headline (max 6 words, impactful)
- A short description (max 15 words, clear call-to-action)

The ads will be displayed on digital screens in ${venue?.type || "public"} venues.`,
        response_json_schema: {
          type: "object",
          properties: {
            variations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  headline: { type: "string" },
                  description: { type: "string" },
                  tone: { type: "string" }
                }
              }
            }
          }
        }
      });

      setAdCopyVariations(response.variations || []);
      if (response.variations?.length > 0) {
        setFormData({
          ...formData,
          headline: response.variations[0].headline,
          description: response.variations[0].description
        });
      }
      toast.success("Ad copy generated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate ad copy");
    }
    setGeneratingCopy(false);
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

  const { totalCost = 0, dynamicPrice = 0 } = calculateDynamicPrice || {};

  // Cart functions
  const addToCart = () => {
    if (!formData.creative_url || !formData.campaign_name) {
      toast.error("Please complete all required fields");
      return;
    }

    // Multi-screen mode: add all selected screens with same creative
    if (multiSelectMode && selectedScreens.length > 0) {
      const newItems = selectedScreens.map(screen => {
        const screenBookings = allBookings.filter(b => b.screen_id === screen.id);
        const bookedSlots = screenBookings.map(b => b.slot_number);
        const availableSlot = [1, 2, 3, 4, 5].find(s => !bookedSlots.includes(s)) || 1;
        const price = screen.slot_price || 100;
        
        return {
          id: `${screen.id}-${availableSlot}-${Date.now()}`,
          screenId: screen.id,
          slotNumber: availableSlot,
          campaignName: formData.campaign_name,
          creativeUrl: formData.creative_url,
          creativeType: formData.creative_type,
          startDate: format(formData.start_date, "yyyy-MM-dd"),
          endDate: format(endDate, "yyyy-MM-dd"),
          weeks: formData.weeks,
          totalCost: price * formData.weeks,
          headline: formData.headline,
          description: formData.description
        };
      });
      
      setCartItems([...cartItems, ...newItems]);
      toast.success(`Added ${selectedScreens.length} screens to cart!`);
      setSelectedScreens([]);
    } else {
      // Single screen mode
      if (!selectedScreen || !selectedSlot) {
        toast.error("Please select a screen and slot");
        return;
      }

      const cartItem = {
        id: `${selectedScreen.id}-${selectedSlot}-${Date.now()}`,
        screenId: selectedScreen.id,
        slotNumber: selectedSlot,
        campaignName: formData.campaign_name,
        creativeUrl: formData.creative_url,
        creativeType: formData.creative_type,
        startDate: format(formData.start_date, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
        weeks: formData.weeks,
        totalCost: totalCost,
        headline: formData.headline,
        description: formData.description
      };

      setCartItems([...cartItems, cartItem]);
      toast.success("Added to cart!");
    }
    
    // Reset form for next booking
    setSelectedScreen(null);
    setSelectedSlot(null);
    setFormData({
      campaign_name: "",
      creative_url: "",
      creative_type: "image",
      start_date: new Date(),
      weeks: 1,
      headline: "",
      description: "",
      business_name: formData.business_name,
      product_service: formData.product_service
    });
    setAdCopyVariations([]);
    setStep(1);
  };

  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
    toast.success("Removed from cart");
  };

  const clearCart = () => {
    setCartItems([]);
    toast.success("Cart cleared");
  };

  const handleCartCheckout = () => {
    setCartOpen(false);
    setCheckoutMode(true);
  };

  const handleCheckoutSuccess = () => {
    setCartItems([]);
    setCheckoutMode(false);
  };

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
      // Create booking with pending status - requires admin approval
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
        status: "pending",
        campaign_name: formData.campaign_name
      });

      // Create admin notification for approval
      await base44.entities.AdminNotification.create({
        type: "campaign_approval",
        title: "New Campaign Pending Approval",
        message: `${user.full_name || user.email} submitted campaign "${formData.campaign_name}" for ${selectedScreen.name}`,
        reference_id: booking.id,
        reference_type: "AdSlotBooking",
        status: "unread"
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

      // Send pending approval email to advertiser
      const venue = venues.find(v => v.id === selectedScreen.venue_id);
      try {
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: `🎯 Booking Confirmed - Pending Approval | BeyondWalls`,
          body: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        BEYONDWALLS
   Digital Out-of-Home Advertising
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dear ${user.full_name || "Valued Advertiser"},

Thank you for choosing BeyondWalls! Your ad booking has been successfully submitted and is now pending approval from our team.

📋 BOOKING DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Campaign: ${formData.campaign_name}
📺 Screen: ${selectedScreen.name}
📍 Venue: ${venue?.name || 'N/A'} - ${venue?.city || 'N/A'}
🎰 Slot: #${selectedSlot}
📅 Duration: ${format(formData.start_date, "PPP")} to ${format(endDate, "PPP")}
💰 Total Cost: AED ${totalCost.toLocaleString()}

⏳ STATUS: PENDING APPROVAL
━━━━━━━━━━━━━━━━━━━━━━━━━
Our team will review your campaign within 24-48 hours. You will receive an email notification once your campaign is approved.

💡 WHAT'S NEXT?
• Our team reviews your creative content
• You'll receive approval confirmation via email
• Your ad goes live on the scheduled start date

📊 Track your campaign status anytime in your dashboard.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Need help? Contact us at info@beyondwalls.ae
Phone: +971 55 614 0067

BeyondWalls - Advertise Beyond Boundaries
www.beyondwalls.ae
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          `.trim()
        });
      } catch (emailError) {
        console.log("Email sending failed, but booking succeeded");
      }

      // Send notification email to admin
      try {
        await base44.integrations.Core.SendEmail({
          to: "info@beyondwalls.ae",
          subject: `🔔 New Campaign Pending Approval: ${formData.campaign_name}`,
          body: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ADMIN NOTIFICATION - NEW BOOKING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A new campaign requires your approval.

📋 CAMPAIGN DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━
Campaign: ${formData.campaign_name}
Advertiser: ${user.full_name || user.email}
Email: ${user.email}
Screen: ${selectedScreen.name}
Venue: ${venue?.name || 'N/A'}
Duration: ${format(formData.start_date, "PPP")} to ${format(endDate, "PPP")}
Total Value: AED ${totalCost.toLocaleString()}

Please review and approve/reject this campaign in the admin dashboard.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          `.trim()
        });
      } catch (emailError) {
        console.log("Admin notification email failed");
      }

      toast.success("Booking submitted! Awaiting admin approval.");
      navigate(createPageUrl("BookingPending") + `?booking_id=${booking.id}`);
    } catch (error) {
      toast.error("Failed to book slot");
    } finally {
      setLoading(false);
    }
  };



  if (!user) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Show checkout mode - rendered inline instead of early return to prevent hooks issue
  if (checkoutMode && cartItems.length > 0) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => setCheckoutMode(false)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Checkout</h1>
            <p className="text-slate-500">Review and confirm your bookings</p>
          </div>
        </div>
        <CartCheckout
          cartItems={cartItems}
          user={user}
          venues={venues}
          screens={screens}
          onBack={() => setCheckoutMode(false)}
          onSuccess={handleCheckoutSuccess}
        />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Book Ad Slot</h1>
            <p className="text-slate-500">Advertise on screens across the UAE</p>
          </div>
        </div>
        <BookingCart
          cartItems={cartItems}
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
          onCheckout={handleCartCheckout}
          venues={venues}
          screens={screens}
          userBalance={user?.wallet_balance}
          isOpen={cartOpen}
          onOpenChange={setCartOpen}
        />
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
          {/* Multi-select toggle */}
          <Card className="bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-violet-600" />
                  <div>
                    <p className="font-medium text-slate-900">Multi-Screen Booking</p>
                    <p className="text-sm text-slate-500">Select multiple screens for your campaign</p>
                  </div>
                </div>
                <Switch 
                  checked={multiSelectMode} 
                  onCheckedChange={(checked) => {
                    setMultiSelectMode(checked);
                    if (!checked) {
                      setSelectedScreens([]);
                    } else {
                      setSelectedScreen(null);
                    }
                  }}
                />
              </div>
              {multiSelectMode && selectedScreens.length > 0 && (
                <div className="mt-3 pt-3 border-t border-violet-200">
                  <div className="flex flex-wrap gap-2">
                    {selectedScreens.map(s => {
                      const venue = venues.find(v => v.id === s.venue_id);
                      return (
                        <Badge key={s.id} className="bg-violet-100 text-violet-700 px-2 py-1">
                          {s.name} • {venue?.name}
                          <button 
                            onClick={() => setSelectedScreens(selectedScreens.filter(ss => ss.id !== s.id))}
                            className="ml-1 hover:text-violet-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <AIRecommendations
            user={user}
            screens={screens}
            venues={venues}
            currentBookings={existingBookings}
            onSelectScreen={(screen) => {
              if (multiSelectMode) {
                if (!selectedScreens.find(s => s.id === screen.id)) {
                  setSelectedScreens([...selectedScreens, screen]);
                }
              } else {
                setSelectedScreen(screen);
                setStep(2);
              }
            }}
          />

          <AdvancedScreenSearch
            screens={screens}
            venues={venues}
            allBookings={allBookings}
            favorites={favorites}
            onSelectScreen={(screen) => {
              if (!multiSelectMode) setSelectedScreen(screen);
            }}
            onToggleFavorite={toggleFavorite}
            selectedScreen={selectedScreen}
            multiSelect={multiSelectMode}
            selectedScreens={selectedScreens}
            onToggleScreen={(screen) => {
              const exists = selectedScreens.find(s => s.id === screen.id);
              if (exists) {
                setSelectedScreens(selectedScreens.filter(s => s.id !== screen.id));
              } else {
                setSelectedScreens([...selectedScreens, screen]);
              }
            }}
          />

          <div className="flex justify-end">
            <Button 
              onClick={() => setStep(2)}
              disabled={multiSelectMode ? selectedScreens.length === 0 : !selectedScreen}
              className="bg-gradient-to-r from-violet-600 to-indigo-600"
            >
              Continue {multiSelectMode && selectedScreens.length > 0 && `(${selectedScreens.length} screens)`}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Select Slot & Upload Creative */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Multi-screen summary */}
          {multiSelectMode && selectedScreens.length > 0 && (
            <Card className="bg-violet-50 border-violet-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="w-5 h-5 text-violet-600" />
                  <span className="font-semibold text-violet-900">Multi-Screen Booking: {selectedScreens.length} screens</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedScreens.map(s => {
                    const venue = venues.find(v => v.id === s.venue_id);
                    return (
                      <Badge key={s.id} variant="outline" className="bg-white">
                        {s.name} • AED {s.slot_price}/wk
                      </Badge>
                    );
                  })}
                </div>
                <p className="text-sm text-violet-600 mt-2">
                  Total: AED {selectedScreens.reduce((sum, s) => sum + (s.slot_price || 100), 0) * formData.weeks}/campaign
                </p>
              </CardContent>
            </Card>
          )}

          {!multiSelectMode && (
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
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
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
                      className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                        isBooked 
                          ? "bg-slate-100 border-slate-200 cursor-not-allowed opacity-50"
                          : selectedSlot === slot
                            ? "bg-violet-50 border-violet-600"
                            : "bg-white border-slate-200 hover:border-violet-300"
                      }`}
                    >
                      <p className="font-bold text-sm sm:text-lg">Slot {slot}</p>
                      <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">
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
          )}

          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label className="text-sm">Campaign Name</Label>
                  <Input 
                    placeholder="e.g., Summer Sale Campaign"
                    value={formData.campaign_name}
                    onChange={(e) => setFormData({...formData, campaign_name: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Business Name</Label>
                  <Input 
                    placeholder="e.g., Fresh Bites Restaurant"
                    value={formData.business_name}
                    onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Product/Service (for AI ad copy)</Label>
                <Input 
                  placeholder="e.g., Healthy food delivery, 20% off this week"
                  value={formData.product_service}
                  onChange={(e) => setFormData({...formData, product_service: e.target.value})}
                />
              </div>

              {/* AI Ad Copy Generator */}
              <div className="border rounded-xl p-4 bg-gradient-to-br from-violet-50 to-indigo-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-violet-600" />
                    <Label className="text-violet-800 font-semibold">AI Ad Copy Generator</Label>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={generateAdCopy}
                    disabled={generatingCopy}
                    className="border-violet-300 text-violet-700 hover:bg-violet-100"
                  >
                    {generatingCopy ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-1" />
                    )}
                    Generate
                  </Button>
                </div>

                {adCopyVariations.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                    {adCopyVariations.map((variation, i) => (
                      <div
                        key={i}
                        onClick={() => setFormData({
                          ...formData,
                          headline: variation.headline,
                          description: variation.description
                        })}
                        className={`p-2 sm:p-3 rounded-lg border-2 cursor-pointer transition-all text-sm ${
                          formData.headline === variation.headline
                            ? "border-violet-600 bg-white"
                            : "border-transparent bg-white/50 hover:border-violet-300"
                        }`}
                      >
                        <span className="text-[10px] sm:text-xs text-violet-600 font-medium">{variation.tone}</span>
                        <p className="font-semibold text-slate-900 mt-1 text-xs sm:text-sm">{variation.headline}</p>
                        <p className="text-slate-600 text-[10px] sm:text-xs mt-1">{variation.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-violet-600 mb-3">
                    Enter campaign details above, then click Generate for AI-powered ad copy suggestions
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <Label className="text-xs">Headline</Label>
                    <Input
                      placeholder="Your catchy headline"
                      value={formData.headline}
                      onChange={(e) => setFormData({...formData, headline: e.target.value})}
                      className="bg-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Description</Label>
                    <Input
                      placeholder="Short description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="bg-white mt-1"
                    />
                  </div>
                </div>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label className="text-sm">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start mt-1 text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        {format(formData.start_date, "PP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
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
                  <Label className="text-sm">Duration (Weeks)</Label>
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

          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="order-2 sm:order-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 order-1 sm:order-2">
              <Button 
                variant="outline"
                onClick={addToCart}
                disabled={multiSelectMode ? (!formData.creative_url || !formData.campaign_name) : (!selectedSlot || !formData.creative_url || !formData.campaign_name)}
                className="border-violet-300 text-violet-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add {multiSelectMode && selectedScreens.length > 1 ? `${selectedScreens.length} Screens` : ""} to Cart
              </Button>
              {!multiSelectMode && (
                <Button 
                  onClick={() => setStep(3)}
                  disabled={!selectedSlot || !formData.creative_url || !formData.campaign_name}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600"
                >
                  Review Booking
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
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