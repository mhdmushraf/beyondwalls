import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  MonitorPlay,
  Loader2,
  CheckCircle2,
  Building2,
  Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import OwnerSlotsUploader from "@/components/screens/OwnerSlotsUploader";

const SCREEN_SIZES = [
  { value: "32\"", label: "32 inch" },
  { value: "43\"", label: "43 inch" },
  { value: "55\"", label: "55 inch" },
  { value: "65\"", label: "65 inch" },
  { value: "75\"", label: "75 inch" },
  { value: "85+\"", label: "85+ inch" }
];

const DEVICE_TYPES = [
  { value: "android_tv", label: "Android TV" },
  { value: "webos", label: "LG WebOS" },
  { value: "tizen", label: "Samsung Tizen" },
  { value: "fire_tv", label: "Amazon Fire TV" },
  { value: "buzz_box", label: "BeyondWalls Buzz Box" }
];

export default function AddScreen() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    venue_id: "",
    name: "",
    size: "",
    orientation: "landscape",
    resolution: "FHD",
    location_in_venue: "",
    monthly_rate: "",
    device_type: ""
  });

  const [ownerSlots, setOwnerSlots] = useState({
    owner_slot_1_url: "",
    owner_slot_1_type: "image",
    owner_slot_2_url: "",
    owner_slot_2_type: "image",
    owner_slot_3_url: "",
    owner_slot_3_type: "image"
  });

  const { data: allVenues = [] } = useQuery({
    queryKey: ["my-venues", user?.email],
    queryFn: () => base44.entities.Venue.filter({ owner_id: user?.email }),
    enabled: !!user?.email
  });
  
  // Filter to only approved venues (not suspended)
  const venues = allVenues.filter(v => v.status === "approved");

  // Get venue_id from URL if provided
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const venueId = urlParams.get("venue_id");
    if (venueId) {
      setFormData(prev => ({ ...prev, venue_id: venueId }));
    }
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

  // Generate a unique device ID
  const generateDeviceId = () => {
    const prefix = "BW";
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate player PIN
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Auto-generate device ID
      const deviceId = generateDeviceId();

      await base44.entities.Screen.create({
        ...formData,
        ...ownerSlots,
        device_id: deviceId,
        owner_id: user.email,
        slot_price: parseFloat(formData.monthly_rate) || 0,
        monthly_rate: parseFloat(formData.monthly_rate) || 0,
        player_pin: pin,
        status: "pending_approval",
        avg_daily_views: 0,
        total_slots: 8,
        owner_slots: 3,
        available_slots: 5,
        is_public: true,
        owner_slots_last_updated: new Date().toISOString()
      });

      // Notify admin
      await base44.entities.AdminNotification.create({
        type: "new_screen",
        title: "New Screen Added",
        message: `${user.full_name} added a new screen: ${formData.name}`,
        reference_id: user.email,
        reference_type: "screen",
        status: "unread"
      });

      // Send email notification to admin
      try {
        await base44.integrations.Core.SendEmail({
          to: "hello@beyondwalls.ae",
          subject: "📺 New Screen Awaiting Approval | BeyondWalls",
          body: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        BEYONDWALLS ADMIN
   New Screen Submission
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A new screen has been submitted and is awaiting approval.

📋 SCREEN DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━
📺 Screen: ${formData.name}
📍 Venue: ${selectedVenue?.name || "N/A"}
📐 Size: ${formData.size} (${formData.orientation})
💰 Rate: AED ${formData.monthly_rate}/month
🖥️ Device: ${formData.device_type}

👤 OWNER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${user.full_name || "N/A"}
Email: ${user.email}

⚡ ACTION REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━━
Please review and approve this screen in the admin panel.

View in Admin Panel: https://beyondwalls.ae/AdminScreens

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BeyondWalls Admin Panel
www.beyondwalls.ae
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          `.trim()
        });
      } catch (emailErr) {
        console.log("Admin email failed but screen was created");
      }

      // Send confirmation email to user
      const selectedVenue = venues.find(v => v.id === formData.venue_id);
      try {
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: "📺 Screen Submitted for Approval | BeyondWalls",
          body: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        BEYONDWALLS
   Digital Out-of-Home Advertising
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dear ${user.full_name || "Valued Partner"},

Your screen has been submitted for approval!

📋 SCREEN DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━
📺 Screen: ${formData.name}
📍 Venue: ${selectedVenue?.name || "N/A"}
📐 Size: ${formData.size} (${formData.orientation})
💰 Rate: AED ${formData.hourly_rate}/week

⏳ STATUS: PENDING APPROVAL
━━━━━━━━━━━━━━━━━━━━━━━━━
Our team will review your screen within 24-48 hours. Once approved, you'll receive a setup code to connect your screen.

💡 WHAT'S NEXT?
• Our team reviews your screen details
• You'll receive a setup code via email
• Connect your screen using the BeyondWalls Player

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Need help? Contact us at info@beyondwalls.ae
Phone: +971 55 614 0067

BeyondWalls - Advertise Beyond Boundaries
www.beyondwalls.ae
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          `.trim()
        });
      } catch (emailErr) {
        console.log("Email failed but screen was created");
      }

      toast.success("Screen submitted for approval!");
      navigate(createPageUrl("MyScreens"));
    } catch (error) {
      toast.error("Failed to add screen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Add New Screen</h1>
          <p className="text-slate-500">Register a screen to display ads</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-0 shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MonitorPlay className="w-5 h-5 text-violet-600" />
              Screen Details
            </CardTitle>
            <CardDescription>Information about the screen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Venue *</Label>
              <Select 
                value={formData.venue_id} 
                onValueChange={(v) => setFormData({ ...formData, venue_id: v })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose venue" />
                </SelectTrigger>
                <SelectContent>
                  {venues.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        {venue.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {venues.length === 0 && allVenues.length === 0 && (
                <p className="text-sm text-amber-600">
                  You need to add a venue first before adding screens.
                </p>
              )}
              {venues.length === 0 && allVenues.length > 0 && (
                <p className="text-sm text-red-600">
                  All your venues are suspended. Please contact support to reactivate.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Screen Name *</Label>
              <Input
                placeholder="e.g., Main Entrance Display"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Screen Size *</Label>
                <Select 
                  value={formData.size} 
                  onValueChange={(v) => setFormData({ ...formData, size: v })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCREEN_SIZES.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Orientation *</Label>
                <Select 
                  value={formData.orientation} 
                  onValueChange={(v) => setFormData({ ...formData, orientation: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="landscape">Landscape</SelectItem>
                    <SelectItem value="portrait">Portrait</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Resolution</Label>
                <Select 
                  value={formData.resolution} 
                  onValueChange={(v) => setFormData({ ...formData, resolution: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HD">HD (720p)</SelectItem>
                    <SelectItem value="FHD">Full HD (1080p)</SelectItem>
                    <SelectItem value="4K">4K</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Monthly Rate (AED) *</Label>
                <Input
                  type="number"
                  placeholder="e.g., 3000"
                  value={formData.monthly_rate}
                  onChange={(e) => setFormData({ ...formData, monthly_rate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Location in Venue</Label>
              <Input
                placeholder="e.g., Near entrance, Dining area, etc."
                value={formData.location_in_venue}
                onChange={(e) => setFormData({ ...formData, location_in_venue: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl mb-6">
          <CardHeader>
            <CardTitle>Device Information</CardTitle>
            <CardDescription>Details about the display device</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Device Type *</Label>
              <Select 
                value={formData.device_type} 
                onValueChange={(v) => setFormData({ ...formData, device_type: v })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select device type" />
                </SelectTrigger>
                <SelectContent>
                  {DEVICE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Device ID</Label>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Auto-generated by BeyondWalls</p>
                    <p className="text-xs text-slate-400 mt-1">A unique ID will be assigned when you submit</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Owner Slots Section */}
        <div className="mb-6">
          <OwnerSlotsUploader 
            slots={ownerSlots}
            onChange={setOwnerSlots}
            required={true}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={loading || !formData.venue_id || !formData.name || !formData.size || !formData.monthly_rate || !formData.device_type || !ownerSlots.owner_slot_1_url || !ownerSlots.owner_slot_2_url || !ownerSlots.owner_slot_3_url}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Add Screen
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}