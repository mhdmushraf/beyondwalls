import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import SEOHead from "@/components/SEOHead";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeft, Loader2, MonitorPlay, Ruler, Settings2,
  DollarSign, MapPin, LayoutGrid, Monitor, Info, Camera, X
} from "lucide-react";

const DPI = 96; // Standard screen DPI for conversions

function convertToPixels(value, unit) {
  const num = parseFloat(value);
  if (isNaN(num)) return 0;
  if (unit === "px") return Math.round(num);
  if (unit === "cm") return Math.round((num / 2.54) * DPI);
  if (unit === "mm") return Math.round((num / 25.4) * DPI);
  return Math.round(num);
}

function generateSetupCode() {
  return "BW-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generatePin() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-violet-600" />
      </div>
      <div>
        <h3 className="font-semibold text-slate-900 text-base">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, children, hint }) {
  return (
    <div>
      <Label className="text-slate-700 font-medium text-sm">{label}</Label>
      <select
        className="mt-1.5 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
        value={value}
        onChange={onChange}
      >
        {children}
      </select>
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

function InfoBox({ children }) {
  return (
    <div className="flex gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-sm text-blue-700">
      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}

export default function AddScreen() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [venues, setVenues] = useState([]);
  const [screenImageUrl, setScreenImageUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [defaultImageUrl, setDefaultImageUrl] = useState("");
  const [uploadingDefault, setUploadingDefault] = useState(false);

  const [physicalWidth, setPhysicalWidth] = useState("");
  const [physicalHeight, setPhysicalHeight] = useState("");
  const [physicalUnit, setPhysicalUnit] = useState("cm");

  const [form, setForm] = useState({
    venue_id: "",
    name: "",
    width_px: "1920",
    height_px: "1080",
    display_mode: "fit",
    total_slots: "10",
    public_ad_slots: "7",
    internal_slots: "3",
    slot_duration: "30",
    price_per_week: "",
    location_description: "",
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const venueId = urlParams.get("venue_id");
    if (venueId) setForm(f => ({ ...f, venue_id: venueId }));
    base44.auth.me().then(u => {
      setUser(u);
      base44.entities.Venue.filter({ owner_email: u.email, approval_status: "approved" }).then(setVenues);
    });
  }, []);

  // Auto-convert physical dimensions to pixels when values or unit change
  useEffect(() => {
    if (physicalUnit === "px") {
      if (physicalWidth) setForm(f => ({ ...f, width_px: physicalWidth }));
      if (physicalHeight) setForm(f => ({ ...f, height_px: physicalHeight }));
    } else {
      if (physicalWidth) setForm(f => ({ ...f, width_px: String(convertToPixels(physicalWidth, physicalUnit)) }));
      if (physicalHeight) setForm(f => ({ ...f, height_px: String(convertToPixels(physicalHeight, physicalUnit)) }));
    }
  }, [physicalWidth, physicalHeight, physicalUnit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.venue_id || !form.name) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    const screen = await base44.entities.Screen.create({
      ...form,
      owner_email: user.email,
      setup_code: generateSetupCode(),
      screen_pin: generatePin(),
      screen_image_url: screenImageUrl || null,
      default_image_url: defaultImageUrl || null,
      width_px: Number(form.width_px),
      height_px: Number(form.height_px),
      total_slots: Number(form.total_slots),
      public_ad_slots: Number(form.public_ad_slots),
      internal_slots: Number(form.internal_slots),
      slot_duration: Number(form.slot_duration),
      price_per_week: Number(form.price_per_week),
      approval_status: "pending",
      status: "pending",
    });

    await base44.entities.Notification.create({
      recipient_email: "admin",
      type: "screen_approved",
      title: "New Screen Pending Approval",
      message: `${user.full_name} registered screen "${form.name}"`,
      reference_id: screen.id,
    });

    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: "Screen Registered - BeyondWalls",
      body: `Hi ${user.full_name},\n\nYour screen "${form.name}" has been registered with setup code: ${screen.setup_code}\n\nPending admin approval. Once approved, connect it via the ScreenPlayer app.\n\nBeyondWalls Team`,
    });

    toast({ title: "Screen registered!", description: `Setup code: ${screen.setup_code}` });
    setLoading(false);
    navigate("/MyScreens");
  };

  const aspectRatioPreview = () => {
    const w = Number(form.width_px);
    const h = Number(form.height_px);
    if (!w || !h) return null;
    const gcd = (a, b) => b ? gcd(b, a % b) : a;
    const d = gcd(w, h);
    return `${w / d}:${h / d}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50/30">
      <SEOHead noIndex title="Add Screen | Beyond Walls" />
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-100 px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-violet-200">
              <MonitorPlay className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Register New Screen</h1>
              <p className="text-xs text-slate-500">Add a digital screen to your venue</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Screen Photo Upload */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
            <SectionHeader icon={Camera} title="Screen Photo" subtitle="Upload a photo of the physical screen installation" />
            <div>
              {screenImageUrl ? (
                <div className="relative">
                  <img src={screenImageUrl} alt="Screen" className="w-full h-48 object-cover rounded-xl border border-slate-200" />
                  <button
                    type="button"
                    onClick={() => setScreenImageUrl("")}
                    className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-50"
                  >
                    <X className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-all">
                  {uploadingPhoto ? (
                    <><Loader2 className="w-6 h-6 text-violet-500 animate-spin mb-2" /><span className="text-sm text-slate-500">Uploading...</span></>
                  ) : (
                    <><Camera className="w-8 h-8 text-slate-300 mb-2" /><span className="text-sm text-slate-500">Click to upload a photo</span><span className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP</span></>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setUploadingPhoto(true);
                      const { file_url } = await base44.integrations.Core.UploadFile({ file });
                      setScreenImageUrl(file_url);
                      setUploadingPhoto(false);
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Default Image */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
            <SectionHeader icon={Camera} title="Default / Stop Image" subtitle="Image shown when screen is stopped or has no active content" />
            <div>
              {defaultImageUrl ? (
                <div className="relative">
                  <img src={defaultImageUrl} alt="Default" className="w-full h-40 object-cover rounded-xl border border-slate-200" />
                  <button type="button" onClick={() => setDefaultImageUrl("")} className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-50">
                    <X className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-all">
                  {uploadingDefault ? (
                    <><Loader2 className="w-6 h-6 text-violet-500 animate-spin mb-2" /><span className="text-sm text-slate-500">Uploading...</span></>
                  ) : (
                    <><Camera className="w-8 h-8 text-slate-300 mb-2" /><span className="text-sm text-slate-500">Click to upload default image</span><span className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP</span></>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setUploadingDefault(true);
                    const { file_url } = await base44.integrations.Core.UploadFile({ file });
                    setDefaultImageUrl(file_url);
                    setUploadingDefault(false);
                  }} />
                </label>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
            <SectionHeader icon={Monitor} title="Basic Information" subtitle="Identify this screen and its location" />
            <div className="space-y-4">
              <div>
                <Label className="text-slate-700 font-medium text-sm">Venue *</Label>
                <select
                  className="mt-1.5 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  value={form.venue_id}
                  onChange={e => setForm(f => ({ ...f, venue_id: e.target.value }))}
                  required
                >
                  <option value="">Select a venue</option>
                  {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
                {venues.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" /> No approved venues yet. Add and get a venue approved first.
                  </p>
                )}
              </div>
              <div>
                <Label className="text-slate-700 font-medium text-sm">Screen Name *</Label>
                <Input
                  className="mt-1.5 border-slate-200 focus:ring-violet-500"
                  placeholder="e.g. Main Entrance Screen"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label className="text-slate-700 font-medium text-sm">Location in Venue</Label>
                <Input
                  className="mt-1.5 border-slate-200 focus:ring-violet-500"
                  placeholder="e.g. Near entrance, left wall"
                  value={form.location_description}
                  onChange={e => setForm(f => ({ ...f, location_description: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Screen Dimensions */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
            <SectionHeader icon={Ruler} title="Screen Dimensions" subtitle="Enter physical size and the player will use pixel resolution" />
            <div className="space-y-4">
              <InfoBox>
                Enter the physical dimensions of the screen. The system will automatically convert them to pixel resolution for the player. You can also enter pixels directly by selecting "px" as the unit.
              </InfoBox>

              {/* Unit Selector */}
              <div>
                <Label className="text-slate-700 font-medium text-sm">Measurement Unit</Label>
                <div className="mt-1.5 flex gap-2">
                  {["cm", "mm", "px"].map(u => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setPhysicalUnit(u)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${physicalUnit === u ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-200" : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"}`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              {/* Physical dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700 font-medium text-sm">Width ({physicalUnit})</Label>
                  <Input
                    className="mt-1.5 border-slate-200 focus:ring-violet-500"
                    type="number"
                    placeholder={physicalUnit === "px" ? "e.g. 1920" : physicalUnit === "cm" ? "e.g. 84" : "e.g. 840"}
                    value={physicalWidth}
                    onChange={e => setPhysicalWidth(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-slate-700 font-medium text-sm">Height ({physicalUnit})</Label>
                  <Input
                    className="mt-1.5 border-slate-200 focus:ring-violet-500"
                    type="number"
                    placeholder={physicalUnit === "px" ? "e.g. 1080" : physicalUnit === "cm" ? "e.g. 192" : "e.g. 1920"}
                    value={physicalHeight}
                    onChange={e => setPhysicalHeight(e.target.value)}
                  />
                </div>
              </div>

              {/* Pixel Resolution Preview */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Pixel Resolution (used by player)</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-slate-900">{form.width_px || "—"}</span>
                    <span className="text-slate-400 font-medium">×</span>
                    <span className="text-2xl font-bold text-slate-900">{form.height_px || "—"}</span>
                    <span className="text-slate-500 text-sm">px</span>
                  </div>
                  {aspectRatioPreview() && (
                    <span className="ml-auto bg-violet-100 text-violet-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      {aspectRatioPreview()}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <Label className="text-slate-500 text-xs">Width (px) — override</Label>
                    <Input
                      className="mt-1 border-slate-200 focus:ring-violet-500 text-sm h-9"
                      type="number"
                      value={form.width_px}
                      onChange={e => setForm(f => ({ ...f, width_px: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-slate-500 text-xs">Height (px) — override</Label>
                    <Input
                      className="mt-1 border-slate-200 focus:ring-violet-500 text-sm h-9"
                      type="number"
                      value={form.height_px}
                      onChange={e => setForm(f => ({ ...f, height_px: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <SelectField
                label="Display Mode"
                value={form.display_mode}
                onChange={e => setForm(f => ({ ...f, display_mode: e.target.value }))}
                hint="'Fit' is recommended — shows full content without distortion (may add black bars)"
              >
                <option value="fit">Fit — maintain aspect ratio, may have black bars</option>
                <option value="fill">Fill — crop to fill screen, no black bars</option>
                <option value="stretch">Stretch — distort to fill screen</option>
              </SelectField>
            </div>
          </div>

          {/* Ad Slot Configuration */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
            <SectionHeader icon={LayoutGrid} title="Ad Slot Configuration" subtitle="Control how many ad slots are available on this screen" />
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-slate-700 font-medium text-sm">Total Slots</Label>
                  <Input className="mt-1.5 border-slate-200 focus:ring-violet-500" type="number" value={form.total_slots}
                    onChange={e => setForm(f => ({ ...f, total_slots: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-slate-700 font-medium text-sm">Ad Slots</Label>
                  <Input className="mt-1.5 border-slate-200 focus:ring-violet-500" type="number" value={form.public_ad_slots}
                    onChange={e => setForm(f => ({ ...f, public_ad_slots: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-slate-700 font-medium text-sm">Internal Slots</Label>
                  <Input className="mt-1.5 border-slate-200 focus:ring-violet-500" type="number" value={form.internal_slots}
                    onChange={e => setForm(f => ({ ...f, internal_slots: e.target.value }))} />
                </div>
              </div>

              <SelectField
                label="Slot Duration"
                value={form.slot_duration}
                onChange={e => setForm(f => ({ ...f, slot_duration: e.target.value }))}
              >
                <option value="15">15 seconds</option>
                <option value="30">30 seconds</option>
                <option value="45">45 seconds</option>
                <option value="60">60 seconds</option>
              </SelectField>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
            <SectionHeader icon={DollarSign} title="Pricing" subtitle="Set the weekly rate for advertisers to book this screen" />
            <div>
              <Label className="text-slate-700 font-medium text-sm">Price Per Slot Per Week (AED) *</Label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">AED</span>
                <Input
                  className="pl-14 border-slate-200 focus:ring-violet-500"
                  type="number"
                  placeholder="e.g. 200"
                  value={form.price_per_week}
                  onChange={e => setForm(f => ({ ...f, price_per_week: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pb-6">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1 rounded-xl border-slate-200">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-200"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Registering...</>
                : <><MonitorPlay className="w-4 h-4 mr-2" />Register Screen</>
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}