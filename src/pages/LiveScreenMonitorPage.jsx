import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  ArrowLeft, MonitorPlay, Wifi, WifiOff, Clock, LayoutGrid,
  Image as ImageIcon, Video, Play, Pause, RefreshCw, Eye, Layers, ChevronRight,
  Power, RotateCcw, PowerOff, Square
} from "lucide-react";

function PlaylistItem({ index, slot, isActive }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${isActive ? "bg-violet-50 border border-violet-200 shadow-sm" : "hover:bg-slate-50"}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${isActive ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500"}`}>
        {index + 1}
      </div>
      <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0">
        {slot.url ? (
          slot.type === "video"
            ? <video src={slot.url} className="w-full h-full object-cover" muted />
            : <img src={slot.url} alt={slot.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-slate-600" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? "text-violet-800" : "text-slate-700"}`}>{slot.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {slot.type === "video" ? <Video className="w-3 h-3 text-slate-400" /> : <ImageIcon className="w-3 h-3 text-slate-400" />}
          <span className="text-xs text-slate-400 capitalize">{slot.type}</span>
          {slot.isOwner
            ? <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 rounded-full">Owner</span>
            : <span className="text-xs bg-blue-100 text-blue-600 px-1.5 rounded-full">Ad Slot</span>}
        </div>
      </div>
      {isActive && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
          <span className="text-xs text-violet-600 font-medium">Now</span>
        </div>
      )}
    </div>
  );
}

export default function LiveScreenMonitorPage() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const screenId = urlParams.get("id");

  const [screen, setScreen] = useState(null);
  const [venue, setVenue] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [commandLoading, setCommandLoading] = useState(null);
  const [localAdIndex, setLocalAdIndex] = useState(0);
  const adTimerRef = useRef(null);
  const pollRef = useRef(null);


  useEffect(() => {
    if (!screenId) { navigate("/MyScreens"); return; }
    loadData();
  }, [screenId]);

  const loadData = async () => {
    const screens = await base44.entities.Screen.filter({ id: screenId });
    const s = screens[0];
    if (!s) { navigate("/MyScreens"); return; }
    setScreen(s);

    if (s.venue_id) {
      const venues = await base44.entities.Venue.filter({ id: s.venue_id });
      setVenue(venues[0] || null);
    }

    // Load active ad bookings
    try {
      const today = new Date().toISOString().split('T')[0];
      const allBookings = await base44.entities.AdBooking.filter({ screen_id: s.id, status: "active" });
      setBookings(allBookings.filter(b => b.start_date <= today && b.end_date >= today));
    } catch (e) { setBookings([]); }

    // Load active campaigns for this screen
    try {
      const allCampaigns = await base44.entities.Campaign.filter({ status: "active" });
      setCampaigns(allCampaigns.filter(c => c.selected_screens?.includes(s.id)));
    } catch (e) { setCampaigns([]); }

    setLastRefresh(new Date());
    setLoading(false);
  };

  // Poll screen online status every 20s (detects heartbeat from ScreenPlayer)
  useEffect(() => {
    if (!screenId) return;
    pollRef.current = setInterval(async () => {
      try {
        const screens = await base44.entities.Screen.filter({ id: screenId });
        if (screens[0]) {
          setScreen(screens[0]);
          setLastRefresh(new Date());
        }
      } catch (e) {}
    }, 3000); // poll every 3s for near real-time tracking
    return () => clearInterval(pollRef.current);
  }, [screenId]);

  // Build the SAME playlist as ScreenPlayer does
  const buildPlaylist = () => {
    if (!screen) return [];

    const maxPublicAds = screen.public_ad_slots || 0;
    const maxInternalSlots = screen.internal_slots || 0;

    // Owner slots
    const ownerSlots = [];
    for (let i = 1; i <= maxInternalSlots; i++) {
      const url = screen[`owner_slot_${i}_url`];
      const type = screen[`owner_slot_${i}_type`] || "image";
      ownerSlots.push({ name: `Owner Slot ${i}`, type, url, isOwner: true });
    }

    // Ad slots from bookings + campaigns — use creative_url to match ScreenPlayer
    const advertiserAds = [
      ...bookings.map(b => ({ name: b.campaign_name || "Ad Slot", type: b.creative_type || "image", url: b.creative_url, isOwner: false })),
      ...campaigns.map(c => ({ name: c.name, type: c.creative_type || "image", url: c.creative_urls?.[0] || c.creative_url, isOwner: false }))
    ].filter(ad => ad.url).slice(0, maxPublicAds);

    // Interleave
    const playlist = [];
    let advIdx = 0, ownerIdx = 0;
    while (advIdx < advertiserAds.length || ownerIdx < ownerSlots.length) {
      if (advIdx < advertiserAds.length) playlist.push(advertiserAds[advIdx++]);
      if (ownerIdx < ownerSlots.length) playlist.push(ownerSlots[ownerIdx++]);
    }

    // Fill remaining ad slots as placeholders if no advertiser content
    if (advertiserAds.length === 0 && ownerSlots.length === 0) {
      return [{ name: "BeyondWalls Default", type: "image", url: null, isOwner: false }];
    }

    return playlist;
  };

  const playlist = buildPlaylist();

  // Sync localAdIndex when screen heartbeat updates current_ad_index
  useEffect(() => {
    const idx = (screen?.current_ad_index ?? 0) % Math.max(playlist.length, 1);
    setLocalAdIndex(idx);
  }, [screen?.current_ad_index]);

  // Local timer to advance preview in sync with slot_duration when player is active
  useEffect(() => {
    if (adTimerRef.current) clearInterval(adTimerRef.current);
    if (screen?.player_active && playlist.length > 1 && screen?.slot_duration) {
      adTimerRef.current = setInterval(() => {
        setLocalAdIndex(prev => (prev + 1) % playlist.length);
      }, screen.slot_duration * 1000);
    }
    return () => { if (adTimerRef.current) clearInterval(adTimerRef.current); };
  }, [screen?.player_active, screen?.slot_duration, playlist.length]);

  const activeSlot = playlist[localAdIndex] || null;

  // objectFit based on screen display_mode (mirrors ScreenPlayer)
  const objectFitClass = screen?.display_mode === "stretch" ? "object-fill"
    : screen?.display_mode === "fill" ? "object-cover" : "object-contain";

  // Aspect-ratio style for the preview container
  const previewAspectStyle = screen?.width_px && screen?.height_px
    ? { aspectRatio: `${screen.width_px} / ${screen.height_px}` }
    : { aspectRatio: "16 / 9" };

  const isPlayerActive = screen?.player_active ?? false;

  // Online = heartbeat received within last 60 seconds (player sends every 15s)
  const isOnline = screen?.last_heartbeat &&
    (new Date() - new Date(screen.last_heartbeat)) < 60000;

  const sendCommand = async (command) => {
    setCommandLoading(command);
    await base44.entities.Screen.update(screenId, { player_command: command });
    toast.success(`Command "${command}" sent to screen. Player will respond shortly.`);
    setCommandLoading(null);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur border-b border-slate-700 px-4 sm:px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl text-slate-300 hover:text-white hover:bg-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <MonitorPlay className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-white truncate">{screen?.name}</h1>
            <p className="text-xs text-slate-400 truncate">{venue?.name} · Live Monitor</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isOnline
              ? <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1"><Wifi className="w-3 h-3" />Online</Badge>
              : <Badge className="bg-slate-700 text-slate-400 border border-slate-600 flex items-center gap-1"><WifiOff className="w-3 h-3" />Offline</Badge>}
            <Button size="sm" variant="ghost" onClick={loadData} className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-5 gap-6">

          {/* Left: Live Preview */}
          <div className="lg:col-span-3 space-y-4">

            {/* Screen Controls */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Screen Controls</p>
              <div className="flex flex-wrap gap-2">
                {/* Play — when paused, stopped, or offline */}
                {(!isPlayerActive || !isOnline) && (
                  <Button
                    size="sm"
                    onClick={() => sendCommand("resume")}
                    disabled={!!commandLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {commandLoading === "resume" ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Play className="w-3.5 h-3.5 mr-1.5" />}
                    Resume
                  </Button>
                )}
                {/* Pause — only when playing */}
                {isPlayerActive && (
                  <Button
                    size="sm"
                    onClick={() => sendCommand("pause")}
                    disabled={!!commandLoading}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {commandLoading === "pause" ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Pause className="w-3.5 h-3.5 mr-1.5" />}
                    Pause
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => sendCommand("restart_playlist")}
                  disabled={!!commandLoading}
                  variant="outline"
                  className="border-blue-500/40 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
                >
                  {commandLoading === "restart_playlist" ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <RotateCcw className="w-3.5 h-3.5 mr-1.5" />}
                  Restart
                </Button>
                <Button
                  size="sm"
                  onClick={() => sendCommand("stop_playback")}
                  disabled={!!commandLoading}
                  variant="outline"
                  className="border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  {commandLoading === "stop_playback" ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Square className="w-3.5 h-3.5 mr-1.5" />}
                  Stop
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2">Commands are received by the player on its next sync cycle (~15s)</p>
            </div>

            {/* Live Preview — only shown when online */}
            {isOnline ? (
              <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-xs text-slate-400 font-medium">
                      Live Preview — {activeSlot?.isOwner ? "Owner Content" : activeSlot ? "Ad Content" : "No Content"}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">{screen?.width_px}×{screen?.height_px} · {screen?.display_mode || "fit"}</span>
                </div>

                {/* Preview frame — matches screen aspect ratio & display mode */}
                <div className="relative bg-black w-full flex items-center justify-center p-2">
                  <div className="relative bg-black w-full" style={previewAspectStyle}>
                    {activeSlot ? (
                      activeSlot.type === "video"
                        ? <video key={activeSlot.url} src={activeSlot.url} className={`w-full h-full ${objectFitClass}`} autoPlay muted loop />
                        : <img key={activeSlot.url} src={activeSlot.url} alt="Preview" className={`w-full h-full ${objectFitClass}`} />
                    ) : screen?.default_image_url ? (
                      <img src={screen.default_image_url} alt="Default" className={`w-full h-full ${objectFitClass}`} />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-600">
                        <MonitorPlay className="w-16 h-16 opacity-30" />
                        <p className="text-sm">No content uploaded yet</p>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/ManageScreenContent?id=${screenId}`)} className="border-slate-600 text-slate-400 hover:text-white mt-1">
                          Upload Content
                        </Button>
                      </div>
                    )}

                    {activeSlot && (
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="bg-violet-600/90 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE
                        </span>
                        <span className="bg-black/60 text-slate-300 text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">{activeSlot.name}</span>
                      </div>
                    )}

                    {screen?.last_heartbeat && (
                      <div className="absolute bottom-3 right-3 bg-black/60 text-slate-400 text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                        Last ping: {new Date(screen.last_heartbeat).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </div>

                {playlist.length > 0 && (
                  <div className="px-4 py-3 border-t border-slate-700">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Slot {localAdIndex + 1} of {playlist.length}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{screen?.slot_duration || 30}s per slot</span>
                    </div>
                    <div className="flex gap-1">
                      {playlist.map((_, i) => (
                        <div key={i} className={`h-1 rounded-full flex-1 transition-all duration-300 ${i === localAdIndex ? "bg-violet-500" : "bg-slate-700"}`} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                <div className="aspect-video flex flex-col items-center justify-center gap-4 text-slate-500">
                  <WifiOff className="w-14 h-14 opacity-30" />
                  <div className="text-center">
                    <p className="text-slate-400 font-medium">Screen is Offline</p>
                    <p className="text-xs text-slate-600 mt-1">Live preview is unavailable. Use the controls above to start the screen.</p>
                    {screen?.last_heartbeat && (
                      <p className="text-xs text-slate-600 mt-1">Last seen: {new Date(screen.last_heartbeat).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Screen Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: LayoutGrid, label: "Total Slots", value: screen?.total_slots ?? "—" },
                { icon: Layers, label: "Ad Slots", value: screen?.public_ad_slots ?? "—" },
                { icon: MonitorPlay, label: "Internal Slots", value: screen?.internal_slots ?? "—" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
                  <Icon className="w-4 h-4 text-violet-400 mx-auto mb-1.5" />
                  <p className="text-lg font-bold text-white">{value}</p>
                  <p className="text-xs text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Playlist */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
              <div className="px-4 py-4 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-semibold text-white">Content Playlist</span>
                </div>
                <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded-full">{playlist.length} slots</span>
              </div>

              <div className="p-3 space-y-1 max-h-[60vh] overflow-y-auto">
                {playlist.map((slot, i) => (
                  <PlaylistItem
                    key={i}
                    index={i}
                    slot={slot}
                    isActive={i === localAdIndex}
                  />
                ))}
                {playlist.length === 0 && (
                  <div className="py-8 text-center text-slate-500 text-sm">No slots configured</div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Quick Actions</p>
              <button onClick={() => navigate(`/ManageScreenContent?id=${screenId}`)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-700 transition-colors text-left">
                <div className="w-8 h-8 bg-violet-600/20 rounded-lg flex items-center justify-center"><ImageIcon className="w-4 h-4 text-violet-400" /></div>
                <span className="text-sm text-slate-300">Manage Content</span>
                <ChevronRight className="w-4 h-4 text-slate-500 ml-auto" />
              </button>
              <button onClick={() => navigate(`/ScreenDetail/${screenId}`)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-700 transition-colors text-left">
                <div className="w-8 h-8 bg-indigo-600/20 rounded-lg flex items-center justify-center"><Eye className="w-4 h-4 text-indigo-400" /></div>
                <span className="text-sm text-slate-300">Screen Details</span>
                <ChevronRight className="w-4 h-4 text-slate-500 ml-auto" />
              </button>
            </div>

            <p className="text-xs text-slate-500 text-center">Last synced: {lastRefresh.toLocaleTimeString()} · Auto-syncs every 3s</p>
          </div>
        </div>
      </div>
    </div>
  );
}