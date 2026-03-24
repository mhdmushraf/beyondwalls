import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft, MonitorPlay, MapPin, Wifi, WifiOff, Code,
  Layers, Clock, DollarSign, LayoutGrid, Maximize2, Image as ImageIcon,
  Pencil, KeyRound, Copy, ExternalLink, Play, Pause, RotateCcw, Square, RefreshCw
} from "lucide-react";

function StatCard({ icon: Icon, label, value, iconClass = "text-violet-500" }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
      <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
        <Icon className={`w-4 h-4 ${iconClass}`} />
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="font-semibold text-slate-800 text-sm">{value}</p>
      </div>
    </div>
  );
}

export default function ScreenDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [screen, setScreen] = useState(null);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commandLoading, setCommandLoading] = useState(null);

  const sendCommand = async (command) => {
    setCommandLoading(command);
    await base44.entities.Screen.update(id, { player_command: command });
    toast.success(`Command "${command}" sent. Player responds in ~15s.`);
    setCommandLoading(null);
  };

  const loadData = async () => {
    const screens = await base44.entities.Screen.filter({ id });
    const s = screens[0];
    setScreen(s);
    if (s?.venue_id) {
      const venues = await base44.entities.Venue.filter({ id: s.venue_id });
      setVenue(venues[0] || null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(), 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
    </div>
  );

  if (!screen) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-500">Screen not found.</p>
    </div>
  );

  // Accurate online check based on heartbeat (not stale is_online field)
  const isOnline = screen?.last_heartbeat && (new Date() - new Date(screen.last_heartbeat)) < 60000;

  const approvalColors = {
    approved: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    rejected: "bg-red-100 text-red-700",
  };

  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const aspectRatio = () => {
    const w = screen.width_px, h = screen.height_px;
    if (!w || !h) return null;
    const d = gcd(w, h);
    return `${w / d}:${h / d}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50/30">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-100 px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-violet-200 flex-shrink-0">
              <MonitorPlay className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-slate-900 truncate">{screen.name}</h1>
              <p className="text-xs text-slate-500 truncate">{venue?.name || "Unknown Venue"}</p>
            </div>
          </div>
          <Badge className={`flex-shrink-0 ${approvalColors[screen.approval_status] || "bg-slate-100 text-slate-600"}`}>
            {screen.approval_status}
          </Badge>
          <Link to={`/EditScreen/${screen.id}`}>
            <Button size="sm" variant="outline" className="flex-shrink-0 rounded-xl border-slate-200">
              <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Screen Photo */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {screen.screen_image_url ? (
            <img src={screen.screen_image_url} alt={screen.name} className="w-full h-56 sm:h-72 object-cover" />
          ) : (
            <div className="w-full h-48 bg-slate-100 flex flex-col items-center justify-center gap-2">
              <ImageIcon className="w-10 h-10 text-slate-300" />
              <p className="text-sm text-slate-400">No photo uploaded</p>
            </div>
          )}
        </div>

        {/* Online Status & Setup Code */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2">
            {isOnline
              ? <><Wifi className="w-5 h-5 text-emerald-500" /><span className="text-sm font-medium text-emerald-600">Online</span></>
              : <><WifiOff className="w-5 h-5 text-slate-400" /><span className="text-sm font-medium text-slate-500">Offline</span></>
            }
            {screen.last_heartbeat && (
              <span className="text-xs text-slate-400 ml-1">
                · Last seen: {new Date(screen.last_heartbeat).toLocaleTimeString()}
              </span>
            )}
          </div>
          {screen.approval_status === "approved" && screen.setup_code && (
            <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto">
              <div className="flex items-center gap-2 bg-violet-50 rounded-xl px-4 py-2">
                <Code className="w-4 h-4 text-violet-600" />
                <span className="text-sm text-violet-700 font-mono font-bold tracking-widest">{screen.setup_code}</span>
                <span className="text-xs text-violet-400 ml-1">Setup Code</span>
              </div>
              {screen.screen_pin && (
                <div className="flex items-center gap-2 bg-indigo-50 rounded-xl px-4 py-2">
                  <KeyRound className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm text-indigo-700 font-mono font-bold tracking-widest">{screen.screen_pin}</span>
                  <span className="text-xs text-indigo-400 ml-1">PIN</span>
                </div>
              )}
            </div>
          )}
          {screen.approval_status === "pending" && (
            <p className="text-xs text-amber-600 sm:ml-auto">⏳ Awaiting admin approval before you can connect this screen.</p>
          )}
          {screen.approval_status === "rejected" && (
            <p className="text-xs text-red-600 sm:ml-auto">❌ {screen.rejection_reason || "Screen was rejected."}</p>
          )}
        </div>

        {/* Screen Controls — for approved screens */}
        {screen.approval_status === "approved" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <MonitorPlay className="w-4 h-4 text-violet-500" /> Screen Controls
            </h2>
            {!isOnline && (
              <div className="mb-3 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-500">
                <WifiOff className="w-4 h-4 text-slate-400" />
                Screen is offline — commands are queued and will execute when the player reconnects.
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {(!screen.player_active || !isOnline) && (
                <button
                  onClick={() => sendCommand("resume")}
                  disabled={!!commandLoading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium disabled:opacity-60"
                >
                  {commandLoading === "resume" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Resume
                </button>
              )}
              {isOnline && screen.player_active && (
                <button
                  onClick={() => sendCommand("pause")}
                  disabled={!!commandLoading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium disabled:opacity-60"
                >
                  {commandLoading === "pause" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4" />} Pause
                </button>
              )}
              <button
                onClick={() => sendCommand("restart_playlist")}
                disabled={!isOnline || !!commandLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-blue-300 text-blue-600 hover:bg-blue-50 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {commandLoading === "restart_playlist" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />} Restart
              </button>
              <button
                onClick={() => sendCommand("stop_playback")}
                disabled={!isOnline || !!commandLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {commandLoading === "stop_playback" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />} Stop
              </button>
              <button
                onClick={() => sendCommand("restart")}
                disabled={!isOnline || !!commandLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {commandLoading === "restart" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Reboot App
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">Commands sent to screen — player responds within ~15s</p>
          </div>
        )}

        {/* QR Code for Screen Player Setup */}
        {screen.approval_status === "approved" && screen.setup_code && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
              <Code className="w-4 h-4 text-violet-500" /> QR Code — Screen Player Setup
            </h2>
            <p className="text-xs text-slate-400 mb-4">Scan this QR code with the physical device to auto-connect the screen player instantly.</p>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <QRCodeSVG
                  value={`${window.location.origin}/ScreenPlayer?setup_code=${screen.setup_code}&auto_start=true`}
                  size={160}
                  level="M"
                  includeMargin={false}
                />
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 bg-violet-50 rounded-xl px-4 py-2 w-fit">
                  <Code className="w-4 h-4 text-violet-600" />
                  <span className="text-sm text-violet-700 font-mono font-bold tracking-widest">{screen.setup_code}</span>
                </div>
                <p className="text-xs text-slate-500">Point any QR scanner or Android/iOS device camera at the code. The screen player app will open and auto-configure.</p>
              </div>
            </div>
          </div>
        )}

        {/* Kiosk Auto-Login Link */}
        {screen.approval_status === "approved" && screen.setup_code && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-violet-500" /> Kiosk Auto-Login Link
            </h2>
            <p className="text-xs text-slate-400 mb-3">Copy this link and paste it into your kiosk browser. It will auto-connect the screen on load.</p>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <span className="text-xs text-slate-600 font-mono flex-1 min-w-0 truncate">
                {`${window.location.origin}/ScreenPlayer?setup_code=${screen.setup_code}&auto_start=true`}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="flex-shrink-0 rounded-lg"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/ScreenPlayer?setup_code=${screen.setup_code}&auto_start=true`);
                  toast.success("Kiosk link copied!");
                }}
              >
                <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
              </Button>
            </div>
          </div>
        )}

        {/* Location */}
        {(screen.location_description || venue) && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-violet-500" /> Location
            </h2>
            {venue && <p className="text-slate-800 font-medium">{venue.name}</p>}
            {venue?.address && <p className="text-sm text-slate-500">{venue.address}, {venue.city}</p>}
            {screen.location_description && (
              <p className="text-sm text-slate-600 mt-1 bg-slate-50 rounded-lg px-3 py-2">{screen.location_description}</p>
            )}
          </div>
        )}

        {/* Dimensions */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-violet-500" /> Screen Specifications
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard icon={Maximize2} label="Resolution" value={`${screen.width_px || "—"} × ${screen.height_px || "—"} px`} />
            {aspectRatio() && <StatCard icon={Maximize2} label="Aspect Ratio" value={aspectRatio()} />}
            <StatCard icon={Layers} label="Display Mode" value={screen.display_mode || "fit"} />
          </div>
        </div>

        {/* Ad Slots */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-violet-500" /> Ad Slot Configuration
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={LayoutGrid} label="Total Slots" value={screen.total_slots ?? "—"} />
            <StatCard icon={LayoutGrid} label="Ad Slots" value={screen.public_ad_slots ?? "—"} iconClass="text-blue-500" />
            <StatCard icon={LayoutGrid} label="Internal Slots" value={screen.internal_slots ?? "—"} iconClass="text-indigo-500" />
            <StatCard icon={Clock} label="Slot Duration" value={`${screen.slot_duration ?? "—"}s`} iconClass="text-amber-500" />
          </div>
        </div>

        {/* Pricing & Performance */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-violet-500" /> Pricing & Performance
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={DollarSign} label="Price / Slot / Week" value={`AED ${screen.price_per_week ?? "—"}`} iconClass="text-emerald-500" />
            <StatCard icon={MonitorPlay} label="Total Impressions" value={(screen.total_impressions || 0).toLocaleString()} iconClass="text-violet-500" />
          </div>
        </div>

      </div>
    </div>
  );
}