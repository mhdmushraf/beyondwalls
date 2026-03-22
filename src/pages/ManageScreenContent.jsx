import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Upload, Loader2, Image as ImageIcon, Video, X,
  CheckCircle2, MonitorPlay, Eye, Wifi, WifiOff, Activity
} from "lucide-react";
import LiveScreenPreview from "@/components/previews/LiveScreenPreview";

// --- Single Slot Uploader ---
function SlotUploader({ slotNumber, url, type, onUpload, onRemove, uploading }) {
  return (
    <div className="border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-medium text-slate-800 text-sm">Internal Slot {slotNumber}</p>
          <p className="text-xs text-slate-400">Shown between advertiser ads</p>
        </div>
        {url && (
          <div className="flex items-center gap-2">
            <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full flex items-center gap-1">
              {type === "video" ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
              {type}
            </span>
            <button onClick={() => onRemove(slotNumber)} className="text-red-400 hover:text-red-600 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {url ? (
        <div className="relative rounded-lg overflow-hidden bg-slate-900 aspect-video">
          {type === "video" ? (
            <video src={url} className="w-full h-full object-contain" muted controls />
          ) : (
            <img src={url} alt={`Slot ${slotNumber}`} className="w-full h-full object-contain" />
          )}
          <div className="absolute top-2 left-2 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Uploaded
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-violet-300 transition-colors">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => onUpload(slotNumber, e)}
            className="hidden"
            id={`slot-${slotNumber}`}
            disabled={uploading}
          />
          <label htmlFor={`slot-${slotNumber}`} className="cursor-pointer flex flex-col items-center">
            {uploading ? (
              <Loader2 className="w-8 h-8 text-violet-600 animate-spin mb-2" />
            ) : (
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
            )}
            <p className="text-slate-600 text-sm font-medium">
              {uploading ? "Uploading..." : "Click to upload"}
            </p>
            <p className="text-slate-400 text-xs mt-1">Image or Video</p>
          </label>
        </div>
      )}
    </div>
  );
}

// --- Main Page ---
export default function ManageScreenContent() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const screenId = urlParams.get("id");

  const [screen, setScreen] = useState(null);
  const [venue, setVenue] = useState(null);
  const [slots, setSlots] = useState({});
  const [uploading, setUploading] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!screenId) { navigate("/MyScreens"); return; }
    loadData();
    const interval = setInterval(async () => {
      const s = await base44.entities.Screen.filter({ id: screenId });
      if (s[0]) setScreen(s[0]);
    }, 15000);
    return () => clearInterval(interval);
  }, [screenId]);

  const loadData = async () => {
    const s = await base44.entities.Screen.filter({ id: screenId });
    const scr = s[0];
    if (!scr) { navigate("/MyScreens"); return; }
    setScreen(scr);
    const initialSlots = {};
    const totalInternal = scr.internal_slots || 6;
    for (let i = 1; i <= totalInternal; i++) {
      initialSlots[`owner_slot_${i}_url`] = scr[`owner_slot_${i}_url`] || "";
      initialSlots[`owner_slot_${i}_type`] = scr[`owner_slot_${i}_type`] || "image";
    }
    setSlots(initialSlots);

    if (scr.venue_id) {
      const venues = await base44.entities.Venue.filter({ id: scr.venue_id });
      setVenue(venues[0] || null);
    }
    setLoading(false);
  };

  const handleUpload = async (slotNumber, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) { toast.error("Please upload an image or video file"); return; }

    setUploading(prev => ({ ...prev, [slotNumber]: true }));
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setSlots(prev => ({
      ...prev,
      [`owner_slot_${slotNumber}_url`]: file_url,
      [`owner_slot_${slotNumber}_type`]: isVideo ? "video" : "image",
    }));
    toast.success(`Slot ${slotNumber} uploaded!`);
    setUploading(prev => ({ ...prev, [slotNumber]: false }));
  };

  const handleRemove = (slotNumber) => {
    setSlots(prev => ({
      ...prev,
      [`owner_slot_${slotNumber}_url`]: "",
      [`owner_slot_${slotNumber}_type`]: "image",
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Screen.update(screenId, slots);
    toast.success("Content saved successfully!");
    setSaving(false);
  };

  // Build preview slots from current state (dynamic based on internal_slots)
  const previewSlots = Array.from({ length: screen?.internal_slots || 6 }, (_, i) => i + 1).map(n => ({
    url: slots[`owner_slot_${n}_url`],
    type: slots[`owner_slot_${n}_type`] || "image",
    name: `Internal Slot ${n}`,
  })).filter(s => s.url);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/MyScreens")} className="p-2 hover:bg-white rounded-xl border border-slate-200">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{screen?.name}</h1>
            <p className="text-sm text-slate-500">{venue?.name} · Internal Content Manager</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {screen?.last_heartbeat && (new Date() - new Date(screen.last_heartbeat)) < 60000
              ? <Badge className="bg-emerald-100 text-emerald-700 flex items-center gap-1"><Wifi className="w-3 h-3" />Online</Badge>
              : <Badge className="bg-slate-100 text-slate-500 flex items-center gap-1"><WifiOff className="w-3 h-3" />Offline</Badge>}
            <Link to={`/LiveScreenMonitorPage?id=${screenId}`}>
              <Button size="sm" className="bg-violet-600 hover:bg-violet-700 flex items-center gap-1.5 rounded-xl">
                <Activity className="w-3.5 h-3.5" /> Live Monitor
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Slots */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ImageIcon className="w-5 h-5 text-violet-600" /> Internal Ad Slots
                </CardTitle>
                <CardDescription>
                  These {screen?.internal_slots || 3} slots rotate between paid advertiser content on your screen.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: screen?.internal_slots || 6 }, (_, i) => i + 1).map(n => (
                  <SlotUploader
                    key={n}
                    slotNumber={n}
                    url={slots[`owner_slot_${n}_url`]}
                    type={slots[`owner_slot_${n}_type`]}
                    onUpload={handleUpload}
                    onRemove={handleRemove}
                    uploading={!!uploading[n]}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button onClick={handleSave} disabled={saving} className="w-full bg-violet-600 hover:bg-violet-700">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          {/* Right: Info + Live Preview */}
          <div className="space-y-4">
            {/* How it works */}
            <Card className="border-0 shadow-sm bg-violet-50">
              <CardContent className="p-4 space-y-2 text-sm">
                <p className="font-semibold text-violet-800">How it works</p>
                <p className="text-violet-700 text-xs leading-relaxed">
                  Your internal content fills the <strong>{screen?.internal_slots || 3} reserved slots</strong> on your screen.
                  They rotate alongside the <strong>{screen?.public_ad_slots || 7} advertiser slots</strong> in a continuous playlist.
                </p>
                <div className="bg-white rounded-lg p-2 text-xs text-slate-600 font-mono">
                  Ad 1 → <span className="text-violet-600">Internal 1</span> → Ad 2 → <span className="text-violet-600">Internal 2</span> → Ad 3 → <span className="text-violet-600">Internal 3</span> → Ad 4…
                </div>
              </CardContent>
            </Card>

            {/* Live Preview */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="w-4 h-4 text-violet-500" /> Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {previewSlots.length > 0 ? (
                  <LiveScreenPreview slots={previewSlots} size="medium" autoPlay={true} />
                ) : (
                  <div className="bg-slate-900 rounded-lg h-40 flex flex-col items-center justify-center text-slate-500 gap-2">
                    <MonitorPlay className="w-8 h-8 opacity-30" />
                    <p className="text-xs">Upload content to preview</p>
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-2 text-center">Preview cycles every 5 seconds</p>
              </CardContent>
            </Card>

            {/* Screen specs */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 space-y-2 text-sm">
                <p className="font-semibold text-slate-700 mb-1">Screen Specs</p>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Resolution</span>
                  <span className="font-medium text-slate-700">{screen?.width_px}×{screen?.height_px}px</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Slot Duration</span>
                  <span className="font-medium text-slate-700">{screen?.slot_duration}s</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Total Slots</span>
                  <span className="font-medium text-slate-700">{screen?.total_slots}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Internal Slots</span>
                  <span className="font-medium text-violet-700">{screen?.internal_slots}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}