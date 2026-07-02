import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import SEOHead from "@/components/SEOHead";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Building2, MapPin, Users, Clock, Phone } from "lucide-react";
import VenueLocationPicker from "@/components/venue/VenueLocationPicker";
import VenuePhotoUploader from "@/components/venue/VenuePhotoUploader";
import { Camera } from "lucide-react";

const VENUE_TYPES = ["restaurant", "cafe", "gym", "mall", "coworking", "hotel", "clinic", "salon", "retail", "other"];

const CITIES_AREAS = {
  Dubai: ["Downtown Dubai", "Dubai Marina", "JBR", "Business Bay", "DIFC", "Jumeirah", "Deira", "Bur Dubai", "Al Quoz", "Al Barsha", "Mirdif", "Dubai Silicon Oasis", "JLT", "Palm Jumeirah", "Dubai Hills", "Al Nahda", "Other"],
  "Abu Dhabi": ["Al Reem Island", "Corniche", "Khalidiyah", "Al Zahiyah", "Yas Island", "Saadiyat Island", "Mussafah", "Al Ain", "Khalifa City", "Other"],
  Sharjah: ["Al Majaz", "Al Taawun", "Al Khan", "Al Nahda", "Al Qasimia", "Other"],
  Ajman: ["Ajman Downtown", "Al Rashidiya", "Al Nuaimiya", "Other"],
  RAK: ["RAK City", "Al Nakheel", "Al Marjan Island", "Other"],
  Fujairah: ["Fujairah City", "Dibba", "Other"],
  UAQ: ["Umm Al Quwain City", "Other"],
};

const CITIES = Object.keys(CITIES_AREAS);

const AGE_GROUPS = [
  { value: "under_18", label: "Under 18" },
  { value: "18_25", label: "18–25" },
  { value: "25_35", label: "25–35" },
  { value: "35_50", label: "35–50" },
  { value: "50_plus", label: "50+" },
  { value: "mixed", label: "Mixed (All Ages)" },
];

const GENDER_SPLIT = [
  { value: "male_dominant", label: "Mostly Male" },
  { value: "female_dominant", label: "Mostly Female" },
  { value: "mixed", label: "Mixed" },
];

const SelectField = ({ label, value, onChange, options, placeholder, required }) => (
  <div>
    <Label className="text-sm font-medium text-slate-700">{label}{required && " *"}</Label>
    <select
      className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all appearance-none cursor-pointer"
      value={value}
      onChange={e => onChange(e.target.value)}
      required={required}
    >
      <option value="">{placeholder || "Select..."}</option>
      {options.map(o => (
        <option key={typeof o === "string" ? o : o.value} value={typeof o === "string" ? o : o.value}>
          {typeof o === "string" ? o.charAt(0).toUpperCase() + o.slice(1) : o.label}
        </option>
      ))}
    </select>
  </div>
);

export default function AddVenue() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "", venue_type: "", address: "", city: "",
    description: "", daily_footfall: "", weekly_footfall: "",
    photo_urls: [],
    peak_hours: "", avg_dwell_time_minutes: "",
    audience_age_group: "", audience_gender: "",
    opening_time: "", closing_time: "",
    contact_phone: "", contact_email: "",
    latitude: null, longitude: null,
  });

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.venue_type || !form.city || !form.address) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const venue = await base44.entities.Venue.create({
        ...form,
        owner_email: user.email,
        daily_footfall: Number(form.daily_footfall) || 0,
        weekly_footfall: Number(form.weekly_footfall) || 0,
        avg_dwell_time_minutes: Number(form.avg_dwell_time_minutes) || 0,
        approval_status: "pending",
        status: "pending",
      });

      await base44.entities.Notification.create({
        recipient_email: "admin",
        type: "system",
        title: "New Venue Pending Approval",
        message: `${user.full_name} submitted venue "${form.name}" for approval`,
        reference_id: venue.id,
      });

      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: "Venue Submitted for Review - BeyondWalls",
        body: `Hi ${user.full_name},\n\nYour venue "${form.name}" has been submitted and is pending admin approval. We'll notify you once it's reviewed (usually within 24 hours).\n\nBeyondWalls Team`,
      });

      toast.success("Venue submitted!", { description: "Awaiting admin approval.", duration: 3000 });
      navigate("/MyVenues");
    } catch (err) {
      toast.error("Error: " + err.message);
    }
    setLoading(false);
  };

  const Section = ({ icon: Icon, title, children }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
          <Icon className="w-4 h-4 text-violet-600" />
        </div>
        <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <SEOHead noIndex title="Add Venue | Beyond Walls" />
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Add New Venue</h1>
            <p className="text-sm text-slate-500 mt-0.5">Fill in details to list your venue on BeyondWalls</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Info */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <Section icon={Building2} title="Basic Information">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label className="text-sm font-medium text-slate-700">Venue Name *</Label>
                    <Input className="mt-1" placeholder="e.g. The Coffee House" value={form.name} onChange={e => set("name", e.target.value)} required />
                  </div>
                  <SelectField label="Venue Type" value={form.venue_type} onChange={v => set("venue_type", v)} options={VENUE_TYPES} placeholder="Select venue type" required />
                  <SelectField label="City" value={form.city} onChange={v => set("city", v)} options={CITIES} placeholder="Select city" required />
                  <div className="sm:col-span-2">
                    <Label className="text-sm font-medium text-slate-700">Full Address *</Label>
                    <Input className="mt-1" placeholder="Street, building, floor" value={form.address} onChange={e => set("address", e.target.value)} required />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-sm font-medium text-slate-700">Description</Label>
                    <textarea className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all min-h-[80px]"
                      placeholder="Describe your venue..." value={form.description} onChange={e => set("description", e.target.value)} />
                  </div>
                </div>
              </Section>
            </CardContent>
          </Card>

          {/* Venue Photos */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <Section icon={Camera} title="Venue Photos (up to 3)">
                <p className="text-xs text-slate-500 -mt-2">Help advertisers visualize your venue with real photos.</p>
                <VenuePhotoUploader
                  photos={form.photo_urls}
                  onChange={urls => set("photo_urls", urls)}
                />
              </Section>
            </CardContent>
          </Card>

          {/* Map */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <Section icon={MapPin} title="Pin Venue Location on Map">
                <VenueLocationPicker
                  latitude={form.latitude}
                  longitude={form.longitude}
                  onChange={(lat, lng) => setForm(f => ({ ...f, latitude: lat, longitude: lng }))}
                />
              </Section>
            </CardContent>
          </Card>

          {/* Operating Hours & Contact */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <Section icon={Clock} title="Operating Hours & Contact">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Opening Time</Label>
                    <Input className="mt-1" type="time" value={form.opening_time} onChange={e => set("opening_time", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Closing Time</Label>
                    <Input className="mt-1" type="time" value={form.closing_time} onChange={e => set("closing_time", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Contact Phone</Label>
                    <Input className="mt-1" placeholder="+971 55 000 0000" value={form.contact_phone} onChange={e => set("contact_phone", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Contact Email</Label>
                    <Input className="mt-1" type="email" placeholder="venue@email.com" value={form.contact_email} onChange={e => set("contact_email", e.target.value)} />
                  </div>
                </div>
              </Section>
            </CardContent>
          </Card>

          {/* Advertiser Metrics */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <Section icon={Users} title="Audience & Analytics Metrics">
                <p className="text-xs text-slate-500 -mt-2">These metrics help advertisers target the right audience and estimate campaign performance.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Daily Footfall (Approx)</Label>
                    <Input className="mt-1" type="number" placeholder="e.g. 500" value={form.daily_footfall} onChange={e => set("daily_footfall", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Weekly Footfall (Approx)</Label>
                    <Input className="mt-1" type="number" placeholder="e.g. 3000" value={form.weekly_footfall} onChange={e => set("weekly_footfall", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Avg. Dwell Time (minutes)</Label>
                    <Input className="mt-1" type="number" placeholder="e.g. 30" value={form.avg_dwell_time_minutes} onChange={e => set("avg_dwell_time_minutes", e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Peak Hours</Label>
                    <Input className="mt-1" placeholder="e.g. 12pm–2pm, 7pm–10pm" value={form.peak_hours} onChange={e => set("peak_hours", e.target.value)} />
                  </div>
                  <SelectField label="Primary Age Group" value={form.audience_age_group} onChange={v => set("audience_age_group", v)} options={AGE_GROUPS} placeholder="Select age group" />
                  <SelectField label="Audience Gender Split" value={form.audience_gender} onChange={v => set("audience_gender", v)} options={GENDER_SPLIT} placeholder="Select gender split" />
                </div>
              </Section>
            </CardContent>
          </Card>

          <div className="flex gap-3 pb-6">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : "Submit for Approval"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}