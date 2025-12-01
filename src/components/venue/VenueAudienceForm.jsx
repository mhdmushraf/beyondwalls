import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Eye, Clock, Calendar, UserCircle } from "lucide-react";
import VenueAnalyticsCalculator from "@/components/analytics/VenueAnalyticsCalculator";

const SCREEN_LOCATIONS = [
  { value: "counter", label: "Counter/Reception", visibility: 80 },
  { value: "waiting_area", label: "Waiting Area", visibility: 70 },
  { value: "entrance", label: "Entrance/Lobby", visibility: 60 },
  { value: "tables", label: "Seating/Tables", visibility: 50 },
  { value: "equipment_area", label: "Equipment Area (Gyms)", visibility: 65 },
  { value: "walkway", label: "Walkway/Corridor", visibility: 40 },
  { value: "other", label: "Other", visibility: 50 }
];

const PEAK_HOURS = [
  { value: "6-8 AM", label: "6-8 AM (Early Morning)" },
  { value: "8-10 AM", label: "8-10 AM (Morning Rush)" },
  { value: "10-12 PM", label: "10 AM-12 PM (Late Morning)" },
  { value: "12-2 PM", label: "12-2 PM (Lunch)" },
  { value: "2-4 PM", label: "2-4 PM (Afternoon)" },
  { value: "4-6 PM", label: "4-6 PM (Pre-Evening)" },
  { value: "6-8 PM", label: "6-8 PM (Evening Peak)" },
  { value: "8-10 PM", label: "8-10 PM (Late Evening)" },
  { value: "10 PM+", label: "10 PM+ (Night)" }
];

const DWELL_TIMES = [
  { value: 15, label: "< 15 minutes (Quick stops)" },
  { value: 30, label: "15-30 minutes (Quick service)" },
  { value: 45, label: "30-45 minutes (Casual visit)" },
  { value: 60, label: "45-60 minutes (Standard visit)" },
  { value: 90, label: "1-1.5 hours (Extended stay)" },
  { value: 120, label: "1.5+ hours (Long stay)" }
];

const AGE_GROUPS = [
  { value: "18-24", label: "18-24" },
  { value: "25-34", label: "25-34" },
  { value: "35-44", label: "35-44" },
  { value: "45-54", label: "45-54" },
  { value: "55+", label: "55+" }
];

const GENDER_OPTIONS = [
  { value: "mostly_male", label: "Mostly Male" },
  { value: "mostly_female", label: "Mostly Female" },
  { value: "mixed", label: "Mixed / Balanced" },
  { value: "unknown", label: "Not Sure" }
];

const VENUE_DEFAULTS = {
  cafe: { daily_customers: 200, dwell_time: 30, visibility: 70 },
  restaurant: { daily_customers: 150, dwell_time: 60, visibility: 60 },
  gym: { daily_customers: 300, dwell_time: 90, visibility: 65 },
  mall: { daily_customers: 1000, dwell_time: 120, visibility: 50 },
  salon: { daily_customers: 50, dwell_time: 60, visibility: 80 },
  coworking: { daily_customers: 100, dwell_time: 240, visibility: 60 },
  hotel: { daily_customers: 200, dwell_time: 30, visibility: 70 },
  hospital: { daily_customers: 500, dwell_time: 45, visibility: 75 },
  other: { daily_customers: 100, dwell_time: 30, visibility: 50 }
};

export default function VenueAudienceForm({ formData, setFormData, venueType }) {
  // Apply defaults when venue type changes
  React.useEffect(() => {
    if (venueType && VENUE_DEFAULTS[venueType]) {
      const defaults = VENUE_DEFAULTS[venueType];
      setFormData(prev => ({
        ...prev,
        daily_customers: prev.daily_customers || defaults.daily_customers,
        customer_dwell_time_minutes: prev.customer_dwell_time_minutes || defaults.dwell_time,
        screen_visibility_percent: prev.screen_visibility_percent || defaults.visibility
      }));
    }
  }, [venueType]);

  const handleScreenLocationChange = (location) => {
    const locationData = SCREEN_LOCATIONS.find(l => l.value === location);
    setFormData(prev => ({
      ...prev,
      screen_location: location,
      screen_visibility_percent: locationData?.visibility || prev.screen_visibility_percent
    }));
  };

  const togglePeakHour = (hour) => {
    const current = formData.peak_hours || [];
    const updated = current.includes(hour)
      ? current.filter(h => h !== hour)
      : [...current, hour];
    setFormData(prev => ({ ...prev, peak_hours: updated }));
  };

  const toggleAgeGroup = (age) => {
    const current = formData.customer_age_groups || [];
    const updated = current.includes(age)
      ? current.filter(a => a !== age)
      : [...current, age];
    setFormData(prev => ({ ...prev, customer_age_groups: updated }));
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-violet-600" />
          Audience & Traffic Analytics
        </CardTitle>
        <CardDescription>
          Help us calculate accurate viewer estimates for advertisers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Daily Customers */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            Estimated Daily Customers *
          </Label>
          <Input
            type="number"
            placeholder="e.g., 500"
            value={formData.daily_customers || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, daily_customers: parseInt(e.target.value) || "" }))}
            className="text-lg"
          />
          <p className="text-xs text-slate-500">How many customers visit your venue on an average day?</p>
        </div>

        {/* Screen Location with Auto-Visibility */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-slate-500" />
            Screen Location *
          </Label>
          <Select 
            value={formData.screen_location || ""} 
            onValueChange={handleScreenLocationChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Where will the screen be placed?" />
            </SelectTrigger>
            <SelectContent>
              {SCREEN_LOCATIONS.map((loc) => (
                <SelectItem key={loc.value} value={loc.value}>
                  {loc.label} (~{loc.visibility}% visibility)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Visibility Slider */}
        <div className="space-y-2">
          <Label className="flex items-center justify-between">
            <span>Screen Visibility</span>
            <span className="text-violet-600 font-bold">{formData.screen_visibility_percent || 50}%</span>
          </Label>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={formData.screen_visibility_percent || 50}
            onChange={(e) => setFormData(prev => ({ ...prev, screen_visibility_percent: parseInt(e.target.value) }))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>10% (Few see it)</span>
            <span>100% (Everyone sees it)</span>
          </div>
        </div>

        {/* Dwell Time */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            Average Customer Dwell Time *
          </Label>
          <Select 
            value={String(formData.customer_dwell_time_minutes || "")} 
            onValueChange={(v) => setFormData(prev => ({ ...prev, customer_dwell_time_minutes: parseInt(v) }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="How long do customers stay?" />
            </SelectTrigger>
            <SelectContent>
              {DWELL_TIMES.map((time) => (
                <SelectItem key={time.value} value={String(time.value)}>
                  {time.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Peak Hours */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            Peak Hours (select all that apply)
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {PEAK_HOURS.map((hour) => (
              <Button
                key={hour.value}
                type="button"
                size="sm"
                variant={(formData.peak_hours || []).includes(hour.value) ? "default" : "outline"}
                className={`text-xs ${(formData.peak_hours || []).includes(hour.value) ? "bg-violet-600" : ""}`}
                onClick={() => togglePeakHour(hour.value)}
              >
                {hour.value}
              </Button>
            ))}
          </div>
        </div>

        {/* Demographics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-slate-500" />
              Customer Age Groups
            </Label>
            <div className="flex flex-wrap gap-1">
              {AGE_GROUPS.map((age) => (
                <Button
                  key={age.value}
                  type="button"
                  size="sm"
                  variant={(formData.customer_age_groups || []).includes(age.value) ? "default" : "outline"}
                  className={`text-xs ${(formData.customer_age_groups || []).includes(age.value) ? "bg-violet-600" : ""}`}
                  onClick={() => toggleAgeGroup(age.value)}
                >
                  {age.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Gender Mix</Label>
            <Select 
              value={formData.customer_gender_mix || "unknown"} 
              onValueChange={(v) => setFormData(prev => ({ ...prev, customer_gender_mix: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Special Events */}
        <div className="space-y-2">
          <Label>Special Events / Busy Days</Label>
          <Textarea
            placeholder="e.g., Friday brunch, weekend evenings, sports events, ladies night..."
            value={formData.special_events || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, special_events: e.target.value }))}
            rows={2}
          />
        </div>

        {/* Live Analytics Preview */}
        {formData.daily_customers > 0 && (
          <VenueAnalyticsCalculator venue={formData} showEarnings={true} />
        )}
      </CardContent>
    </Card>
  );
}