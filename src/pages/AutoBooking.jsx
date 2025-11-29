import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, addWeeks } from "date-fns";
import {
  Zap,
  Plus,
  Settings,
  Pause,
  Play,
  Trash2,
  MonitorPlay,
  MapPin,
  Building2,
  DollarSign,
  Target,
  Calendar,
  Loader2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Clock,
  Upload,
  X,
  RefreshCw,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function AutoBooking() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [executing, setExecuting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    target_cities: [],
    target_venue_types: [],
    target_screen_sizes: [],
    max_price_per_slot: "",
    weekly_budget: "",
    total_budget: "",
    min_daily_footfall: "",
    creative_url: "",
    creative_type: "image",
    campaign_name_prefix: "",
    booking_duration_weeks: 1,
    is_recurring: false,
    max_screens: "",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: format(addWeeks(new Date(), 4), "yyyy-MM-dd")
  });

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["auto-booking-rules", user?.email],
    queryFn: () => base44.entities.AutoBookingRule.filter({ advertiser_id: user?.email }, "-created_date"),
    enabled: !!user?.email
  });

  const { data: venues = [] } = useQuery({
    queryKey: ["venues"],
    queryFn: () => base44.entities.Venue.filter({ status: "approved" })
  });

  const { data: screens = [] } = useQuery({
    queryKey: ["screens"],
    queryFn: () => base44.entities.Screen.filter({ status: "online" })
  });

  const { data: existingBookings = [] } = useQuery({
    queryKey: ["active-bookings"],
    queryFn: () => base44.entities.AdSlotBooking.filter({ status: "active" })
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl("AutoBooking"));
        return;
      }
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {
      base44.auth.redirectToLogin(createPageUrl("AutoBooking"));
    }
  };

  const cities = [...new Set(venues.map(v => v.city).filter(Boolean))];
  const venueTypes = [...new Set(venues.map(v => v.type).filter(Boolean))];
  const screenSizes = ["32\"", "43\"", "55\"", "65\"", "75\"", "85+\""];

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      toast.error("Please upload an image or video");
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
      toast.error("Upload failed");
    }
    setUploading(false);
  };

  const handleCreateRule = async () => {
    if (!formData.name || !formData.total_budget || !formData.creative_url) {
      toast.error("Please fill in required fields");
      return;
    }

    setSaving(true);
    try {
      await base44.entities.AutoBookingRule.create({
        ...formData,
        advertiser_id: user.email,
        max_price_per_slot: parseFloat(formData.max_price_per_slot) || null,
        weekly_budget: parseFloat(formData.weekly_budget) || null,
        total_budget: parseFloat(formData.total_budget),
        min_daily_footfall: parseInt(formData.min_daily_footfall) || null,
        max_screens: parseInt(formData.max_screens) || null,
        status: "active",
        spent_amount: 0,
        bookings_created: 0,
        booked_screen_ids: []
      });

      queryClient.invalidateQueries({ queryKey: ["auto-booking-rules"] });
      toast.success("Auto-booking rule created!");
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to create rule");
    }
    setSaving(false);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      target_cities: [],
      target_venue_types: [],
      target_screen_sizes: [],
      max_price_per_slot: "",
      weekly_budget: "",
      total_budget: "",
      min_daily_footfall: "",
      creative_url: "",
      creative_type: "image",
      campaign_name_prefix: "",
      booking_duration_weeks: 1,
      is_recurring: false,
      max_screens: "",
      start_date: format(new Date(), "yyyy-MM-dd"),
      end_date: format(addWeeks(new Date(), 4), "yyyy-MM-dd")
    });
  };

  const handleToggleStatus = async (rule) => {
    const newStatus = rule.status === "active" ? "paused" : "active";
    await base44.entities.AutoBookingRule.update(rule.id, { status: newStatus });
    queryClient.invalidateQueries({ queryKey: ["auto-booking-rules"] });
    toast.success(`Rule ${newStatus === "active" ? "activated" : "paused"}`);
  };

  const handleDeleteRule = async (rule) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;
    await base44.entities.AutoBookingRule.delete(rule.id);
    queryClient.invalidateQueries({ queryKey: ["auto-booking-rules"] });
    toast.success("Rule deleted");
  };

  const executeRule = async (rule) => {
    if ((user?.wallet_balance || 0) < 100) {
      toast.error("Insufficient wallet balance");
      return;
    }

    setExecuting(rule.id);
    try {
      // Find matching screens
      const matchingScreens = screens.filter(screen => {
        const venue = venues.find(v => v.id === screen.venue_id);
        if (!venue) return false;

        // Check city filter
        if (rule.target_cities?.length > 0 && !rule.target_cities.includes(venue.city)) return false;

        // Check venue type filter
        if (rule.target_venue_types?.length > 0 && !rule.target_venue_types.includes(venue.type)) return false;

        // Check screen size filter
        if (rule.target_screen_sizes?.length > 0 && !rule.target_screen_sizes.includes(screen.size)) return false;

        // Check price filter
        if (rule.max_price_per_slot && screen.slot_price > rule.max_price_per_slot) return false;

        // Check footfall filter
        if (rule.min_daily_footfall && venue.avg_daily_footfall < rule.min_daily_footfall) return false;

        // Check if already booked by this rule
        if (rule.booked_screen_ids?.includes(screen.id)) return false;

        return true;
      });

      // Check available slots for each screen
      const availableScreens = matchingScreens.filter(screen => {
        const screenBookings = existingBookings.filter(b => b.screen_id === screen.id);
        return screenBookings.length < 5; // Has available slots
      });

      if (availableScreens.length === 0) {
        toast.error("No matching screens with available slots found");
        setExecuting(null);
        return;
      }

      // Calculate how many screens we can book
      const remainingBudget = rule.total_budget - (rule.spent_amount || 0);
      const maxScreensToBook = rule.max_screens 
        ? Math.min(rule.max_screens - (rule.booked_screen_ids?.length || 0), availableScreens.length)
        : availableScreens.length;

      let bookedCount = 0;
      let totalSpent = 0;
      const newBookedScreenIds = [...(rule.booked_screen_ids || [])];

      for (const screen of availableScreens.slice(0, maxScreensToBook)) {
        const cost = (screen.slot_price || 100) * rule.booking_duration_weeks;
        
        // Check budget constraints
        if (rule.weekly_budget && totalSpent + cost > rule.weekly_budget) continue;
        if (totalSpent + cost > remainingBudget) continue;
        if (cost > (user.wallet_balance - totalSpent)) continue;

        // Find available slot
        const screenBookings = existingBookings.filter(b => b.screen_id === screen.id);
        const bookedSlots = screenBookings.map(b => b.slot_number);
        const availableSlot = [1, 2, 3, 4, 5].find(s => !bookedSlots.includes(s));

        if (!availableSlot) continue;

        const venue = venues.find(v => v.id === screen.venue_id);
        const startDate = new Date(rule.start_date);
        const endDate = addWeeks(startDate, rule.booking_duration_weeks);

        // Create booking
        await base44.entities.AdSlotBooking.create({
          screen_id: screen.id,
          advertiser_id: user.email,
          slot_number: availableSlot,
          creative_url: rule.creative_url,
          creative_type: rule.creative_type,
          duration_seconds: 15,
          start_date: format(startDate, "yyyy-MM-dd"),
          end_date: format(endDate, "yyyy-MM-dd"),
          weeks_booked: rule.booking_duration_weeks,
          total_cost: cost,
          status: "pending",
          campaign_name: `${rule.campaign_name_prefix || rule.name} - ${screen.name}`
        });

        // Create transaction
        await base44.entities.Transaction.create({
          user_id: user.email,
          type: "ad_spend",
          amount: cost,
          balance_after: user.wallet_balance - totalSpent - cost,
          reference_id: screen.id,
          description: `Auto-booking: ${screen.name}`,
          status: "completed"
        });

        newBookedScreenIds.push(screen.id);
        totalSpent += cost;
        bookedCount++;
      }

      // Update rule
      await base44.entities.AutoBookingRule.update(rule.id, {
        spent_amount: (rule.spent_amount || 0) + totalSpent,
        bookings_created: (rule.bookings_created || 0) + bookedCount,
        booked_screen_ids: newBookedScreenIds,
        last_execution: new Date().toISOString()
      });

      // Update user wallet
      await base44.auth.updateMe({
        wallet_balance: user.wallet_balance - totalSpent,
        total_spent: (user.total_spent || 0) + totalSpent
      });

      queryClient.invalidateQueries({ queryKey: ["auto-booking-rules"] });
      queryClient.invalidateQueries({ queryKey: ["active-bookings"] });

      if (bookedCount > 0) {
        toast.success(`Successfully booked ${bookedCount} screens for AED ${totalSpent.toLocaleString()}`);
        setUser({ ...user, wallet_balance: user.wallet_balance - totalSpent });
      } else {
        toast.error("Could not book any screens within budget constraints");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to execute auto-booking");
    }
    setExecuting(null);
  };

  const toggleArrayItem = (array, item) => {
    return array.includes(item) 
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  if (!user) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Zap className="w-8 h-8 text-violet-600" />
            Auto-Booking
          </h1>
          <p className="text-slate-500">Set up rules to automatically book ad slots</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-slate-500">Wallet Balance</p>
            <p className="font-bold text-violet-600">AED {user.wallet_balance?.toLocaleString() || 0}</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="bg-gradient-to-r from-violet-600 to-indigo-600">
            <Plus className="w-4 h-4 mr-2" />
            New Rule
          </Button>
        </div>
      </div>

      {/* Rules List */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-violet-600" />
          </CardContent>
        </Card>
      ) : rules.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Zap className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Auto-Booking Rules</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Create rules to automatically find and book ad slots based on your targeting criteria
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-violet-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Rule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => {
            const budgetUsed = ((rule.spent_amount || 0) / rule.total_budget) * 100;
            
            return (
              <Card key={rule.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        rule.status === "active" ? "bg-emerald-100" : "bg-slate-100"
                      }`}>
                        <Zap className={`w-6 h-6 ${
                          rule.status === "active" ? "text-emerald-600" : "text-slate-400"
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-lg">{rule.name}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                          {rule.target_cities?.length > 0 && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {rule.target_cities.join(", ")}
                            </span>
                          )}
                          {rule.target_venue_types?.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {rule.target_venue_types.join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        rule.status === "active" ? "bg-emerald-100 text-emerald-700" :
                        rule.status === "paused" ? "bg-amber-100 text-amber-700" :
                        "bg-slate-100 text-slate-700"
                      }>
                        {rule.status}
                      </Badge>
                      {rule.is_recurring && (
                        <Badge variant="outline">
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Recurring
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Budget Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-500">Budget Used</span>
                      <span className="font-medium">
                        AED {(rule.spent_amount || 0).toLocaleString()} / {rule.total_budget.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={budgetUsed} className="h-2" />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <p className="text-sm text-slate-500">Bookings Created</p>
                      <p className="text-xl font-bold text-slate-900">{rule.bookings_created || 0}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <p className="text-sm text-slate-500">Max Price/Slot</p>
                      <p className="text-xl font-bold text-slate-900">
                        {rule.max_price_per_slot ? `AED ${rule.max_price_per_slot}` : "Any"}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <p className="text-sm text-slate-500">Duration</p>
                      <p className="text-xl font-bold text-slate-900">{rule.booking_duration_weeks}w</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <p className="text-sm text-slate-500">Max Screens</p>
                      <p className="text-xl font-bold text-slate-900">{rule.max_screens || "∞"}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-slate-500">
                      {rule.last_execution && (
                        <span>Last run: {format(new Date(rule.last_execution), "MMM d, h:mm a")}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(rule)}
                      >
                        {rule.status === "active" ? (
                          <><Pause className="w-4 h-4 mr-1" /> Pause</>
                        ) : (
                          <><Play className="w-4 h-4 mr-1" /> Activate</>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => executeRule(rule)}
                        disabled={executing === rule.id || rule.status !== "active"}
                        className="bg-violet-600 hover:bg-violet-700"
                      >
                        {executing === rule.id ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4 mr-1" />
                        )}
                        Run Now
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-rose-600"
                        onClick={() => handleDeleteRule(rule)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Rule Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-violet-600" />
              Create Auto-Booking Rule
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rule Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Dubai Restaurants Campaign"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Campaign Name Prefix</Label>
                  <Input
                    value={formData.campaign_name_prefix}
                    onChange={(e) => setFormData({ ...formData, campaign_name_prefix: e.target.value })}
                    placeholder="e.g., Summer Sale"
                  />
                </div>
              </div>
            </div>

            {/* Targeting */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-violet-600" />
                Targeting Criteria
              </h3>

              <div className="space-y-2">
                <Label>Target Cities</Label>
                <div className="flex flex-wrap gap-2">
                  {cities.map((city) => (
                    <Badge
                      key={city}
                      variant={formData.target_cities.includes(city) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setFormData({
                        ...formData,
                        target_cities: toggleArrayItem(formData.target_cities, city)
                      })}
                    >
                      {city}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Venue Types</Label>
                <div className="flex flex-wrap gap-2">
                  {venueTypes.map((type) => (
                    <Badge
                      key={type}
                      variant={formData.target_venue_types.includes(type) ? "default" : "outline"}
                      className="cursor-pointer capitalize"
                      onClick={() => setFormData({
                        ...formData,
                        target_venue_types: toggleArrayItem(formData.target_venue_types, type)
                      })}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Screen Sizes</Label>
                <div className="flex flex-wrap gap-2">
                  {screenSizes.map((size) => (
                    <Badge
                      key={size}
                      variant={formData.target_screen_sizes.includes(size) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setFormData({
                        ...formData,
                        target_screen_sizes: toggleArrayItem(formData.target_screen_sizes, size)
                      })}
                    >
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min Daily Footfall</Label>
                  <Input
                    type="number"
                    value={formData.min_daily_footfall}
                    onChange={(e) => setFormData({ ...formData, min_daily_footfall: e.target.value })}
                    placeholder="e.g., 500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Screens to Book</Label>
                  <Input
                    type="number"
                    value={formData.max_screens}
                    onChange={(e) => setFormData({ ...formData, max_screens: e.target.value })}
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-violet-600" />
                Budget & Pricing
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Total Budget (AED) *</Label>
                  <Input
                    type="number"
                    value={formData.total_budget}
                    onChange={(e) => setFormData({ ...formData, total_budget: e.target.value })}
                    placeholder="e.g., 5000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Weekly Budget Cap</Label>
                  <Input
                    type="number"
                    value={formData.weekly_budget}
                    onChange={(e) => setFormData({ ...formData, weekly_budget: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Price/Slot/Week</Label>
                  <Input
                    type="number"
                    value={formData.max_price_per_slot}
                    onChange={(e) => setFormData({ ...formData, max_price_per_slot: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-600" />
                Schedule
              </h3>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Booking Duration</Label>
                  <Select
                    value={String(formData.booking_duration_weeks)}
                    onValueChange={(v) => setFormData({ ...formData, booking_duration_weeks: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Week</SelectItem>
                      <SelectItem value="2">2 Weeks</SelectItem>
                      <SelectItem value="4">4 Weeks</SelectItem>
                      <SelectItem value="8">8 Weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-medium text-slate-900">Recurring Bookings</p>
                  <p className="text-sm text-slate-500">Automatically renew bookings when they expire</p>
                </div>
                <Switch
                  checked={formData.is_recurring}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
                />
              </div>
            </div>

            {/* Creative */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <MonitorPlay className="w-4 h-4 text-violet-600" />
                Ad Creative *
              </h3>

              {formData.creative_url ? (
                <div className="relative">
                  {formData.creative_type === "video" ? (
                    <video src={formData.creative_url} className="w-full h-48 object-cover rounded-xl" controls />
                  ) : (
                    <img src={formData.creative_url} className="w-full h-48 object-cover rounded-xl" alt="Creative" />
                  )}
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => setFormData({ ...formData, creative_url: "", creative_type: "image" })}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="block">
                  <div className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    uploading ? "border-violet-300 bg-violet-50" : "border-slate-200 hover:border-violet-300"
                  }`}>
                    {uploading ? (
                      <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-600">Upload image or video</p>
                      </>
                    )}
                  </div>
                  <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
                </label>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateRule}
              disabled={saving}
              className="bg-gradient-to-r from-violet-600 to-indigo-600"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              Create Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}