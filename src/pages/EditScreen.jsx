import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Loader2, MonitorPlay, LayoutGrid, Settings2, DollarSign, Info } from "lucide-react";

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

export default function EditScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [screen, setScreen] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => {
    base44.entities.Screen.filter({ id }).then(screens => {
      const s = screens[0];
      if (!s) { navigate(-1); return; }
      setScreen(s);
      setForm({
        name: s.name || "",
        location_description: s.location_description || "",
        width_px: String(s.width_px || ""),
        height_px: String(s.height_px || ""),
        display_mode: s.display_mode || "fit",
        total_slots: String(s.total_slots ?? 10),
        public_ad_slots: String(s.public_ad_slots ?? 7),
        internal_slots: String(s.internal_slots ?? 3),
        slot_duration: String(s.slot_duration ?? 30),
        price_per_week: String(s.price_per_week || ""),
      });
      setLoading(false);
    });
  }, [id]);

  // Keep total_slots in sync
  useEffect(() => {
    const pub = parseInt(form.public_ad_slots) || 0;
    const int = parseInt(form.internal_slots) || 0;
    setForm(f => ({ ...f, total_slots: String(pub + int) }));
  }, [form.public_ad_slots, form.internal_slots]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) {
      toast({ title: "Screen name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    await base44.entities.Screen.update(id, {
      name: form.name,
      location_description: form.location_description,
      width_px: Number(form.width_px),
      height_px: Number(form.height_px),
      display_mode: form.display_mode,
      total_slots: Number(form.total_slots),
      public_ad_slots: Number(form.public_ad_slots),
      internal_slots: Number(form.internal_slots),
      slot_duration: Number(form.slot_duration),
      price_per_week: Number(form.price_per_week),
    });
    toast({ title: "Screen updated successfully" });
    setSaving(false);
    navigate(`/ScreenDetail/${id}`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
    </div>
  );

  const internalSlots = parseInt(form.internal_slots) || 0;
  const MAX_INTERNAL = 6;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50/30">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-100 px-4 sm:px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-violet-200">
              <MonitorPlay className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Edit Screen</h1>
              <p className="text-xs text-slate-500 truncate max-w-xs">{screen?.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <form onSubmit={handleSave} className="space-y-5">

          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
            <SectionHeader icon={Settings2} title="Basic Details" subtitle="Name and location of this screen" />
            <div className="space-y-4">
              <div>
                <Label className="text-slate-700 font-medium text-sm">Screen Name *</Label>
                <Input
                  className="mt-1.5 border-slate-200 focus:ring-violet-500"
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700 font-medium text-sm">Width (px)</Label>
                  <Input className="mt-1.5 border-slate-200" type="number" value={form.width_px}
                    onChange={e => setForm(f => ({ ...f, width_px: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-slate-700 font-medium text-sm">Height (px)</Label>
                  <Input className="mt-1.5 border-slate-200" type="number" value={form.height_px}
                    onChange={e => setForm(f => ({ ...f, height_px: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label className="text-slate-700 font-medium text-sm">Display Mode</Label>
                <select
                  className="mt-1.5 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  value={form.display_mode}
                  onChange={e => setForm(f => ({ ...f, display_mode: e.target.value }))}
                >
                  <option value="fit">Fit — maintain aspect ratio</option>
                  <option value="fill">Fill — crop to fill screen</option>
                  <option value="stretch">Stretch — distort to fill</option>
                </select>
              </div>
            </div>
          </div>

          {/* Slot Allocation */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
            <SectionHeader icon={LayoutGrid} title="Slot Allocation" subtitle="Adjust how slots are split between ads and your own content" />
            <div className="space-y-4">

              <div className="flex gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 items-start">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Internal slots are for your own content (max {MAX_INTERNAL}). Total slots = Ad slots + Internal slots.
                  Changing internal slots will affect how many owner content slots are available in "Manage Content".
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700 font-medium text-sm">Ad Slots (public)</Label>
                  <Input className="mt-1.5 border-slate-200" type="number" min="1" value={form.public_ad_slots}
                    onChange={e => setForm(f => ({ ...f, public_ad_slots: e.target.value }))} />
                  <p className="text-xs text-slate-400 mt-1">Available for advertisers to book</p>
                </div>
                <div>
                  <Label className="text-slate-700 font-medium text-sm">Internal Slots (owner)</Label>
                  <Input
                    className={`mt-1.5 border-slate-200 ${internalSlots > MAX_INTERNAL ? "border-red-400 ring-1 ring-red-300" : ""}`}
                    type="number" min="0" max={MAX_INTERNAL} value={form.internal_slots}
                    onChange={e => setForm(f => ({ ...f, internal_slots: e.target.value }))}
                  />
                  <p className="text-xs text-slate-400 mt-1">Your own content (max {MAX_INTERNAL})</p>
                  {internalSlots > MAX_INTERNAL && (
                    <p className="text-xs text-red-500 mt-1">Maximum {MAX_INTERNAL} internal slots allowed</p>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-700 flex items-center justify-between">
                <span>Total slots</span>
                <span className="font-bold text-violet-700 text-lg">{form.total_slots}</span>
              </div>

              <div>
                <Label className="text-slate-700 font-medium text-sm">Slot Duration</Label>
                <select
                  className="mt-1.5 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  value={form.slot_duration}
                  onChange={e => setForm(f => ({ ...f, slot_duration: e.target.value }))}
                >
                  <option value="15">15 seconds</option>
                  <option value="30">30 seconds</option>
                  <option value="45">45 seconds</option>
                  <option value="60">60 seconds</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
            <SectionHeader icon={DollarSign} title="Pricing" subtitle="Weekly rate for advertisers" />
            <div>
              <Label className="text-slate-700 font-medium text-sm">Price Per Slot Per Week (AED)</Label>
              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">AED</span>
                <Input className="pl-14 border-slate-200 focus:ring-violet-500" type="number"
                  value={form.price_per_week}
                  onChange={e => setForm(f => ({ ...f, price_per_week: e.target.value }))} />
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
              disabled={saving || internalSlots > MAX_INTERNAL}
              className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-200"
            >
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}