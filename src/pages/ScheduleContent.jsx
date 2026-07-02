import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import SEOHead from "@/components/SEOHead";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft, Plus, Trash2, Clock, CalendarDays, MonitorPlay,
  Image as ImageIcon, Video, ChevronDown, CheckCircle2, Loader2
} from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_LABELS = { 0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat" };

const TIMEZONES = [
  { value: "Asia/Dubai", label: "Dubai (GMT+4)" },
  { value: "Asia/Riyadh", label: "Riyadh (GMT+3)" },
  { value: "Asia/Kuwait", label: "Kuwait (GMT+3)" },
  { value: "Asia/Bahrain", label: "Bahrain (GMT+3)" },
  { value: "Asia/Qatar", label: "Qatar (GMT+3)" },
  { value: "Asia/Muscat", label: "Muscat (GMT+4)" },
  { value: "Asia/Karachi", label: "Karachi (GMT+5)" },
  { value: "Asia/Kolkata", label: "India (GMT+5:30)" },
  { value: "Europe/London", label: "London (GMT+0/+1)" },
  { value: "Europe/Paris", label: "Paris (GMT+1/+2)" },
  { value: "America/New_York", label: "New York (GMT-5/-4)" },
  { value: "America/Los_Angeles", label: "Los Angeles (GMT-8/-7)" },
  { value: "UTC", label: "UTC (GMT+0)" },
];

function ScheduleCard({ schedule, asset, onDelete }) {
  const daysText = schedule.days_of_week?.length > 0
    ? schedule.days_of_week.map(d => DAY_LABELS[d]).join(", ")
    : "Every day";
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex gap-3">
      <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0">
        {asset?.file_url ? (
          asset.file_type === "video"
            ? <video src={asset.file_url} className="w-full h-full object-cover" muted />
            : <img src={asset.file_url} alt={asset.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-slate-600" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 text-sm truncate">{schedule.name || asset?.name || "Untitled"}</p>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <MonitorPlay className="w-3 h-3" /> Slot {schedule.slot_index}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {schedule.start_time} – {schedule.end_time}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <CalendarDays className="w-3 h-3" /> {daysText}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge className={schedule.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}>
              {schedule.is_active ? "Active" : "Inactive"}
            </Badge>
            <button onClick={() => onDelete(schedule.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ScheduleContent() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const screenId = urlParams.get("id");

  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState(null);
  const [assets, setAssets] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    media_asset_id: "",
    slot_index: 1,
    days_of_week: [],
    start_time: "08:00",
    end_time: "22:00",
    timezone: "Asia/Dubai",
    is_active: true,
  });

  useEffect(() => {
    if (!screenId) { navigate("/MyScreens"); return; }
    loadData();
  }, [screenId]);

  const loadData = async () => {
    const u = await base44.auth.me();
    setUser(u);
    const [screens, assetList, scheduleList] = await Promise.all([
      base44.entities.Screen.filter({ id: screenId }),
      base44.entities.MediaAsset.filter({ owner_email: u.email }),
      base44.entities.ContentSchedule.filter({ screen_id: screenId }),
    ]);
    if (!screens[0]) { navigate("/MyScreens"); return; }
    setScreen(screens[0]);
    setAssets(assetList);
    setSchedules(scheduleList.sort((a, b) => a.slot_index - b.slot_index));
    setLoading(false);
  };

  const toggleDay = (day) => {
    setForm(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day].sort(),
    }));
  };

  const handleSave = async () => {
    const asset = assets.find(a => a.id === form.media_asset_id);
    if (!asset) { toast.error("Please select a media asset"); return; }
    if (!form.start_time || !form.end_time) { toast.error("Please set start and end times"); return; }
    if (form.start_time >= form.end_time) { toast.error("End time must be after start time"); return; }

    setSaving(true);
    await base44.entities.ContentSchedule.create({
      owner_email: user.email,
      screen_id: screenId,
      slot_index: form.slot_index,
      media_asset_id: asset.id,
      media_url: asset.file_url,
      media_type: asset.file_type,
      name: form.name || asset.name,
      days_of_week: form.days_of_week,
      start_time: form.start_time,
      end_time: form.end_time,
      timezone: form.timezone || "Asia/Dubai",
      is_active: true,
    });

    toast.success("Schedule created!");
    setShowForm(false);
    setForm({ name: "", media_asset_id: "", slot_index: 1, days_of_week: [], start_time: "08:00", end_time: "22:00", timezone: "Asia/Dubai", is_active: true });
    setSaving(false);
    loadData();
  };

  const handleDelete = async (id) => {
    await base44.entities.ContentSchedule.delete(id);
    toast.success("Schedule deleted");
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  const selectedAsset = assets.find(a => a.id === form.media_asset_id);
  const maxSlots = screen?.internal_slots || 6;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <SEOHead noIndex title="Schedule Content | Beyond Walls" />
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/MyScreens")}><ArrowLeft className="w-5 h-5" /></Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-slate-900">Schedule Content</h1>
            <p className="text-xs text-slate-500 truncate">{screen?.name} · {schedules.length} schedule(s)</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-gradient-to-r from-violet-600 to-indigo-600">
            <Plus className="w-4 h-4 mr-2" /> New Schedule
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">

        {/* How it works banner */}
        <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
          <p className="text-sm font-semibold text-violet-800 mb-1">How scheduling works</p>
          <p className="text-xs text-violet-700 leading-relaxed">
            Create time-based schedules to control which content plays on each of your screen's internal slots. The system checks schedules every 5 minutes and automatically swaps the content. For example: <span className="font-medium">"Show Lunch Menu on Slot 1, every weekday, 12:00 – 14:00"</span>.
          </p>
        </div>

        {/* New Schedule Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-violet-200 shadow-sm p-5 space-y-5">
            <h2 className="font-semibold text-slate-800 text-sm">Create New Schedule</h2>

            {/* Schedule Name */}
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Schedule Name (optional)</label>
              <input
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Lunch Menu"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* Media Asset Picker */}
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Select Media Asset *</label>
              {assets.length === 0 ? (
                <div className="text-sm text-slate-400 bg-slate-50 rounded-lg p-4 text-center">
                  No assets in your library. <button onClick={() => navigate("/MyContentLibrary")} className="text-violet-600 font-medium hover:underline">Upload one first →</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {assets.map(asset => (
                    <button
                      key={asset.id}
                      onClick={() => setForm(prev => ({ ...prev, media_asset_id: asset.id }))}
                      className={`rounded-lg border-2 overflow-hidden text-left transition-all ${
                        form.media_asset_id === asset.id ? "border-violet-500 ring-2 ring-violet-200" : "border-slate-200 hover:border-violet-300"
                      }`}
                    >
                      <div className="aspect-video bg-slate-900 relative">
                        {asset.file_type === "video"
                          ? <video src={asset.file_url} className="w-full h-full object-cover" muted />
                          : <img src={asset.file_url} alt={asset.name} className="w-full h-full object-cover" />}
                        {form.media_asset_id === asset.id && (
                          <div className="absolute inset-0 bg-violet-600/30 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <Badge className={`absolute top-1 left-1 text-xs py-0 px-1 ${asset.file_type === "video" ? "bg-blue-600" : "bg-violet-600"}`}>
                          {asset.file_type === "video" ? <Video className="w-2.5 h-2.5" /> : <ImageIcon className="w-2.5 h-2.5" />}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-700 font-medium truncate px-2 py-1">{asset.name}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Slot Index */}
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Owner Slot *</label>
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: maxSlots }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setForm(prev => ({ ...prev, slot_index: n }))}
                    className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                      form.slot_index === n
                        ? "bg-violet-600 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Days of Week */}
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Days of Week (leave empty for every day)</label>
              <div className="flex gap-2 flex-wrap">
                {DAYS.map((day, i) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(i)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      form.days_of_week.includes(i)
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Timezone */}
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Timezone *</label>
              <select
                value={form.timezone}
                onChange={e => setForm(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
              >
                {TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">Start Time *</label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={e => setForm(prev => ({ ...prev, start_time: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">End Time *</label>
                <input
                  type="time"
                  value={form.end_time}
                  onChange={e => setForm(prev => ({ ...prev, end_time: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !form.media_asset_id} className="flex-1 bg-violet-600 hover:bg-violet-700">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</> : <><CheckCircle2 className="w-4 h-4 mr-2" />Save Schedule</>}
              </Button>
            </div>
          </div>
        )}

        {/* Existing Schedules */}
        {schedules.length === 0 && !showForm ? (
          <div className="text-center py-16">
            <CalendarDays className="w-14 h-14 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No schedules yet</p>
            <p className="text-slate-400 text-sm mt-1">Create a schedule to control when your content plays</p>
            <Button onClick={() => setShowForm(true)} className="mt-4 bg-violet-600 hover:bg-violet-700">
              <Plus className="w-4 h-4 mr-2" /> Create First Schedule
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map(s => (
              <ScheduleCard
                key={s.id}
                schedule={s}
                asset={assets.find(a => a.id === s.media_asset_id)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}