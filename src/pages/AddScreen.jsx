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
  Building2
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
    hourly_rate: "",
    device_type: "",
    device_id: ""
  });

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

  const { data: venues = [] } = useQuery({
    queryKey: ["my-venues", user?.email],
    queryFn: () => base44.entities.Venue.filter({ owner_id: user?.email }),
    enabled: !!user?.email
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate player PIN
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      
      await base44.entities.Screen.create({
        ...formData,
        owner_id: user.email,
        slot_price: parseFloat(formData.hourly_rate) || 0,
        hourly_rate: parseFloat(formData.hourly_rate) || 0,
        player_pin: pin,
        status: "pending_approval",
        avg_daily_views: 0,
        total_slots: 8,
        owner_slots: 3,
        available_slots: 5,
        is_public: true
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
              {venues.length === 0 && (
                <p className="text-sm text-amber-600">
                  You need to add a venue first before adding screens.
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
                <Label>Hourly Rate (AED) *</Label>
                <Input
                  type="number"
                  placeholder="e.g., 100"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
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
              <Label>Device ID (Optional)</Label>
              <Input
                placeholder="Unique identifier for the device"
                value={formData.device_id}
                onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
              />
              <p className="text-xs text-slate-500">
                This will be auto-generated when you install the player app
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={loading || !formData.venue_id || !formData.name || !formData.size || !formData.hourly_rate || !formData.device_type}
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