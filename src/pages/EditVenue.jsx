import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import VenuePhotoUploader from "@/components/venue/VenuePhotoUploader";
import VenueLocationPicker from "@/components/venue/VenueLocationPicker";

const VENUE_TYPES = [
  { value: "restaurant", label: "Restaurant" },
  { value: "cafe", label: "Café" },
  { value: "gym", label: "Gym" },
  { value: "mall", label: "Mall" },
  { value: "coworking", label: "Co-working" },
  { value: "hotel", label: "Hotel" },
  { value: "clinic", label: "Clinic" },
  { value: "salon", label: "Salon" },
  { value: "retail", label: "Retail" },
  { value: "other", label: "Other" },
];

const AGE_GROUPS = [
  { value: "under_18", label: "Under 18" },
  { value: "18_25", label: "18–25" },
  { value: "25_35", label: "25–35" },
  { value: "35_50", label: "35–50" },
  { value: "50_plus", label: "50+" },
  { value: "mixed", label: "Mixed" },
];

const GENDER_OPTIONS = [
  { value: "male_dominant", label: "Male Dominant" },
  { value: "female_dominant", label: "Female Dominant" },
  { value: "mixed", label: "Mixed" },
];

const SelectField = ({ label, value, onChange, options, required }) => (
  <div className="space-y-1">
    <Label>{label}{required && <span className="text-red-500 ml-1">*</span>}</Label>
    <select
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
    >
      <option value="">Select {label}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

export default function EditVenue() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadVenue(); }, [id]);

  const loadVenue = async () => {
    const venues = await base44.entities.Venue.filter({ id });
    if (venues[0]) setForm(venues[0]);
    setLoading(false);
  };

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.venue_type || !form.address || !form.city) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    await base44.entities.Venue.update(id, {
      ...form,
      approval_status: "pending",
    });
    toast.success("Venue updated!", { description: "Your changes have been submitted for admin approval.", duration: 4000 });
    navigate(`/VenueDetail/${id}`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
    </div>
  );

  if (!form) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <p className="text-slate-500">Venue not found.</p>
      <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <SEOHead noIndex title="Edit Venue | Beyond Walls" />
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Venue</h1>
            <p className="text-sm text-slate-500">Changes will be submitted for admin re-approval.</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          ⚠️ After saving, this venue will be set to <strong>pending</strong> and reviewed by our team before going live again.
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Basic Info */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Venue Name <span className="text-red-500">*</span></Label>
                <Input value={form.name || ""} onChange={e => set("name", e.target.value)} placeholder="e.g. The Coffee House" />
              </div>
              <SelectField label="Venue Type" value={form.venue_type} onChange={v => set("venue_type", v)} options={VENUE_TYPES} required />
              <div className="space-y-1">
                <Label>Description</Label>
                <textarea
                  value={form.description || ""}
                  onChange={e => set("description", e.target.value)}
                  placeholder="Describe your venue..."
                  rows={3}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Photos */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base">Photos</CardTitle></CardHeader>
            <CardContent>
              <VenuePhotoUploader
                photos={form.photo_urls || []}
                onPhotosChange={urls => set("photo_urls", urls)}
              />
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base">Location</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Address <span className="text-red-500">*</span></Label>
                <Input value={form.address || ""} onChange={e => set("address", e.target.value)} placeholder="Street address" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>City <span className="text-red-500">*</span></Label>
                  <Input value={form.city || ""} onChange={e => set("city", e.target.value)} placeholder="Dubai" />
                </div>
                <div className="space-y-1">
                  <Label>Country</Label>
                  <Input value={form.country || "UAE"} onChange={e => set("country", e.target.value)} />
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Pin Location on Map</Label>
                <VenueLocationPicker
                  lat={form.latitude}
                  lng={form.longitude}
                  onChange={({ lat, lng }) => { set("latitude", lat); set("longitude", lng); }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Operating Hours & Contact */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base">Operating Hours & Contact</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Opening Time</Label>
                  <Input type="time" value={form.opening_time || ""} onChange={e => set("opening_time", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Closing Time</Label>
                  <Input type="time" value={form.closing_time || ""} onChange={e => set("closing_time", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Contact Phone</Label>
                <Input value={form.contact_phone || ""} onChange={e => set("contact_phone", e.target.value)} placeholder="+971 50 000 0000" />
              </div>
              <div className="space-y-1">
                <Label>Contact Email</Label>
                <Input type="email" value={form.contact_email || ""} onChange={e => set("contact_email", e.target.value)} placeholder="venue@email.com" />
              </div>
            </CardContent>
          </Card>

          {/* Audience Analytics */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base">Audience Analytics</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Daily Footfall</Label>
                  <Input type="number" value={form.daily_footfall || ""} onChange={e => set("daily_footfall", Number(e.target.value))} placeholder="e.g. 500" />
                </div>
                <div className="space-y-1">
                  <Label>Weekly Footfall</Label>
                  <Input type="number" value={form.weekly_footfall || ""} onChange={e => set("weekly_footfall", Number(e.target.value))} placeholder="e.g. 3000" />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Peak Hours</Label>
                <Input value={form.peak_hours || ""} onChange={e => set("peak_hours", e.target.value)} placeholder="e.g. 12pm – 3pm, 7pm – 10pm" />
              </div>
              <div className="space-y-1">
                <Label>Avg. Dwell Time (minutes)</Label>
                <Input type="number" value={form.avg_dwell_time_minutes || ""} onChange={e => set("avg_dwell_time_minutes", Number(e.target.value))} placeholder="e.g. 45" />
              </div>
              <SelectField label="Audience Age Group" value={form.audience_age_group} onChange={v => set("audience_age_group", v)} options={AGE_GROUPS} />
              <SelectField label="Audience Gender" value={form.audience_gender} onChange={v => set("audience_gender", v)} options={GENDER_OPTIONS} />
            </CardContent>
          </Card>

          <Button type="submit" disabled={saving} className="w-full bg-violet-600 hover:bg-violet-700 py-3 text-base">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save & Submit for Approval"}
          </Button>
        </form>
      </div>
    </div>
  );
}