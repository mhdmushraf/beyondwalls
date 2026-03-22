import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  MonitorPlay, Lock, Wifi, WifiOff, Volume2, VolumeX,
  Maximize, Minimize, RefreshCw, CheckCircle2, AlertCircle,
  SkipForward, SkipBack, Play, Pause, Clock, Zap, Activity, Settings, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const generateSessionId = () => "SES-" + Date.now().toString(36) + "-" + Math.random().toString(36).substr(2, 9);
const PLAYER_VERSION = "2.1.0";
const AD_DURATION = 8000;
const animations = ["fade", "slideLeft", "slideRight", "slideUp", "slideDown", "zoom", "flip", "blur"];

export default function ScreenPlayer() {
  const [screenId, setScreenId] = useState("");
  const [setupCode, setSetupCode] = useState("");
  const [authMode, setAuthMode] = useState("setup_code");
  const [pin, setPin] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [screen, setScreen] = useState(null);
  const [error, setError] = useState("");
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [animationType, setAnimationType] = useState("fade");
  const [isPaused, setIsPaused] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("connected");
  const [lastHeartbeat, setLastHeartbeat] = useState(null);
  const [adProgress, setAdProgress] = useState(0);
  const [adStartTime, setAdStartTime] = useState(null);
  const [totalPlaytime, setTotalPlaytime] = useState(0);
  const [adsPlayed, setAdsPlayed] = useState(0);
  const [mediaError, setMediaError] = useState(null);
  const [sessionId] = useState(generateSessionId);
  const [uptimeSeconds, setUptimeSeconds] = useState(0);
  const [autoStartMode, setAutoStartMode] = useState(false);
  const [urlParams, setUrlParams] = useState(null);
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Parse URL params once on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUrlParams({
      code: params.get("setup_code"),
      id: params.get("screen_id"),
      pin: params.get("pin"),
      autoStart: params.get("auto_start") === "true",
      token: params.get("device_token")
    });
  }, []);

  // Handle auto-login
  useEffect(() => {
    if (!urlParams || !sessionId) return;
    const { code, id, pin: pinParam, autoStart, token } = urlParams;
    if (autoStart || token) setAutoStartMode(true);
    if (token) {
      handleAutoAuthenticate("device_token", token, null);
    } else if (code) {
      setSetupCode(code);
      setAuthMode("setup_code");
      if (autoStart) handleAutoAuthenticate("setup_code", code, null);
    } else if (id) {
      setScreenId(id);
      setAuthMode("screen_id");
      if (pinParam) setPin(pinParam);
      if (autoStart) handleAutoAuthenticate("screen_id", id, pinParam);
    }
  }, [urlParams, sessionId]);

  const markScreenOnline = async (foundScreen) => {
    await base44.entities.Screen.update(foundScreen.id, {
      status: "active",
      is_online: true,
      player_active: true,
      current_ad_index: 0,
      last_heartbeat: new Date().toISOString(),
      current_session_id: sessionId,
      session_started_at: new Date().toISOString(),
      uptime_seconds: 0,
      player_version: PLAYER_VERSION
    });
  };

  const handleAutoAuthenticate = async (mode, idOrCode, pinCode) => {
    if (authenticated || connecting) return;
    setConnecting(true);
    try {
      const screens = await base44.entities.Screen.list();
      let foundScreen = null;
      if (mode === "device_token") {
        foundScreen = screens.find(s => s.device_token === idOrCode);
        if (!foundScreen) { setError("Invalid device token."); setConnecting(false); return; }
      } else if (mode === "setup_code") {
        foundScreen = screens.find(s => s.setup_code === idOrCode.toUpperCase());
      } else {
        foundScreen = screens.find(s => s.device_id === idOrCode || s.id === idOrCode);
        if (foundScreen?.player_pin && foundScreen.player_pin !== pinCode) {
          setError("Invalid PIN"); setConnecting(false); return;
        }
      }
      if (foundScreen) {
        setScreen(foundScreen);
        setAuthenticated(true);
        await markScreenOnline(foundScreen);
      } else {
        setError("Screen not found");
      }
    } catch (e) {
      setError("Auto-connect failed");
    }
    setConnecting(false);
  };

  // Fetch ad bookings
  const { data: bookings = [], refetch: refetchBookings } = useQuery({
    queryKey: ["player-bookings", screen?.id],
    queryFn: async () => {
      const allBookings = await base44.entities.AdBooking.filter({ screen_id: screen?.id, status: "active" });
      const today = new Date().toISOString().split('T')[0];
      return allBookings.filter(b => b.start_date <= today && b.end_date >= today);
    },
    enabled: authenticated && !!screen?.id,
    refetchInterval: 10000,
    staleTime: 0
  });

  // Fetch campaigns
  const { data: campaigns = [], refetch: refetchCampaigns } = useQuery({
    queryKey: ["player-campaigns", screen?.id],
    queryFn: async () => {
      const allCampaigns = await base44.entities.Campaign.filter({ status: "active" });
      return allCampaigns.filter(c => c.selected_screens?.includes(screen?.id));
    },
    enabled: authenticated && !!screen?.id,
    refetchInterval: 10000,
    staleTime: 0
  });

  // Fetch platform settings
  const { data: platformSettings = [] } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: () => base44.entities.PlatformSettings.list(),
    enabled: authenticated,
    staleTime: 60000
  });

  // Check for remote commands
  const { data: screenData } = useQuery({
    queryKey: ["screen-commands", screen?.id],
    queryFn: () => base44.entities.Screen.filter({ id: screen?.id }),
    enabled: authenticated && !!screen?.id,
    refetchInterval: 5000
  });

  useEffect(() => {
    if (screenData?.[0]?.player_command) {
      const command = screenData[0].player_command;
      if (command === "skip") goToNextAd();
      else if (command === "pause") setIsPaused(true);
      else if (command === "resume") setIsPaused(false);
      else if (command === "refresh") { refetchBookings(); refetchCampaigns(); }
      else if (command === "restart") window.location.reload();
      base44.entities.Screen.update(screen.id, { player_command: null });
    }
  }, [screenData]);

  const defaultContentUrl = platformSettings.find(s => s.setting_key === "default_screen_content_url")?.setting_value || "https://images.unsplash.com/photo-1557683316-973673baf926?w=1920";
  const defaultContentType = platformSettings.find(s => s.setting_key === "default_screen_content_type")?.setting_value || "image";

  // Build owner slots
  const ownerSlots = [];
  if (screen) {
    const totalInternal = screen.internal_slots || 6;
    for (let i = 1; i <= totalInternal; i++) {
      if (screen[`owner_slot_${i}_url`]) {
        ownerSlots.push({
          id: `owner-${i}`,
          name: `Owner Slot ${i}`,
          creative_url: screen[`owner_slot_${i}_url`],
          creative_type: screen[`owner_slot_${i}_type`] || "image",
          type: "owner"
        });
      }
    }
  }

  // Build advertiser ads
  const advertiserAds = [
    ...bookings.map(b => ({ id: b.id, name: b.campaign_name || "Ad Slot", creative_url: b.creative_url, creative_type: b.creative_type, type: "booking" })),
    ...campaigns.map(c => ({ id: c.id, name: c.name, creative_url: c.creative_url, creative_type: c.creative_type, type: "campaign" }))
  ].filter(ad => ad.creative_url);

  // Build interleaved playlist
  const buildPlaylist = () => {
    const maxPublicAds = screen?.public_ad_slots || 0;
    const maxInternalSlots = screen?.internal_slots || 0;
    const availableAdvertiserAds = advertiserAds.slice(0, maxPublicAds);
    const availableOwnerSlots = ownerSlots.slice(0, maxInternalSlots);
    const playlist = [];
    let advIdx = 0, ownerIdx = 0;
    while (advIdx < availableAdvertiserAds.length || ownerIdx < availableOwnerSlots.length) {
      if (advIdx < availableAdvertiserAds.length) playlist.push(availableAdvertiserAds[advIdx++]);
      if (ownerIdx < availableOwnerSlots.length) playlist.push(availableOwnerSlots[ownerIdx++]);
    }
    if (playlist.length === 0) {
      return [{ id: "default-beyondwalls", name: "BeyondWalls Default", creative_url: defaultContentUrl, creative_type: defaultContentType || "image", type: "default" }];
    }
    return playlist;
  };

  const allAds = buildPlaylist();
  const currentAd = allAds[currentAdIndex];

  // Progress bar
  useEffect(() => {
    if (!authenticated || allAds.length === 0 || isPaused) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }
    setAdStartTime(Date.now());
    setAdProgress(0);
    if (currentAd?.creative_type !== "video") {
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - (adStartTime || Date.now());
        setAdProgress(Math.min((elapsed / AD_DURATION) * 100, 100));
      }, 100);
    }
    return () => { if (progressIntervalRef.current) clearInterval(progressIntervalRef.current); };
  }, [authenticated, currentAdIndex, isPaused, allAds.length]);

  // Ad cycling
  useEffect(() => {
    if (!authenticated || allAds.length === 0 || isPaused || currentAd?.creative_type === "video") return;
    const timer = setTimeout(() => goToNextAd(), AD_DURATION);
    return () => clearTimeout(timer);
  }, [authenticated, allAds.length, currentAdIndex, isPaused]);

  // Playtime tracking
  useEffect(() => {
    if (!authenticated || isPaused) return;
    const timer = setInterval(() => setTotalPlaytime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [authenticated, isPaused]);

  // Uptime tracking
  useEffect(() => {
    if (!authenticated || isPaused) return;
    const timer = setInterval(() => setUptimeSeconds(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [authenticated, isPaused]);

  // Use refs to track latest values without causing heartbeat interval to restart
  const currentAdIndexRef = useRef(currentAdIndex);
  const allAdsLengthRef = useRef(allAds.length);
  const currentAdNameRef = useRef(currentAd?.name);
  const isPausedRef = useRef(isPaused);
  const totalPlaytimeRef = useRef(totalPlaytime);
  const adsPlayedRef = useRef(adsPlayed);
  const uptimeSecondsRef = useRef(uptimeSeconds);

  useEffect(() => { currentAdIndexRef.current = currentAdIndex; }, [currentAdIndex]);
  useEffect(() => { allAdsLengthRef.current = allAds.length; }, [allAds.length]);
  useEffect(() => { currentAdNameRef.current = currentAd?.name; }, [currentAd]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { totalPlaytimeRef.current = totalPlaytime; }, [totalPlaytime]);
  useEffect(() => { adsPlayedRef.current = adsPlayed; }, [adsPlayed]);
  useEffect(() => { uptimeSecondsRef.current = uptimeSeconds; }, [uptimeSeconds]);

  // Heartbeat — sets is_online: true every 15s, clears on unmount
  // CRITICAL: deps are ONLY [authenticated, screen?.id] so the interval is stable
  useEffect(() => {
    if (!authenticated || !screen?.id) return;

    const sendHeartbeat = async () => {
      try {
        await base44.entities.Screen.update(screen.id, {
          last_heartbeat: new Date().toISOString(),
          status: "active",
          is_online: true,
          player_active: !isPausedRef.current,
          current_ad_index: currentAdIndexRef.current,
          current_playlist_length: allAdsLengthRef.current,
          total_playtime: totalPlaytimeRef.current,
          ads_played_count: adsPlayedRef.current,
          current_session_id: sessionId,
          uptime_seconds: uptimeSecondsRef.current,
          current_content_name: currentAdNameRef.current || null,
          player_version: PLAYER_VERSION
        });
        setConnectionStatus("connected");
        setLastHeartbeat(new Date());
      } catch (e) {
        setLastHeartbeat(prev => {
          const timeSinceLastSuccess = prev ? Date.now() - prev.getTime() : 0;
          if (timeSinceLastSuccess > 30000) setConnectionStatus("reconnecting");
          return prev;
        });
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 15000);

    return () => {
      clearInterval(interval);
      // Mark offline on disconnect
      base44.entities.Screen.update(screen.id, {
        player_active: false,
        is_online: false,
        status: "inactive"
      }).catch(() => {});
    };
  }, [authenticated, screen?.id]); // stable deps — no restarts on every ad change

  // Network status
  useEffect(() => {
    const handleOnline = () => setConnectionStatus("connected");
    const handleOffline = () => setConnectionStatus("offline");
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => { window.removeEventListener("online", handleOnline); window.removeEventListener("offline", handleOffline); };
  }, []);

  const goToNextAd = useCallback(() => {
    setMediaError(null);
    setAnimationType(animations[Math.floor(Math.random() * animations.length)]);
    setTransitioning(true);
    setAdsPlayed(prev => prev + 1);
    setTimeout(() => {
      setCurrentAdIndex(prev => (prev + 1) % allAds.length);
      setAdStartTime(Date.now());
      setAdProgress(0);
      setTimeout(() => setTransitioning(false), 50);
    }, 400);
  }, [allAds.length]);

  const goToPrevAd = () => {
    setMediaError(null);
    setTransitioning(true);
    setTimeout(() => {
      setCurrentAdIndex(prev => prev === 0 ? allAds.length - 1 : prev - 1);
      setAdStartTime(Date.now());
      setAdProgress(0);
      setTimeout(() => setTransitioning(false), 50);
    }, 400);
  };

  const handleVideoEnded = () => {
    setMediaError(null);
    setAnimationType(animations[Math.floor(Math.random() * animations.length)]);
    setTransitioning(true);
    setAdsPlayed(prev => prev + 1);
    setTimeout(() => {
      setCurrentAdIndex(prev => (prev + 1) % allAds.length);
      setAdStartTime(Date.now());
      setAdProgress(0);
      setTimeout(() => setTransitioning(false), 50);
    }, 400);
  };

  const handleVideoProgress = () => {
    if (videoRef.current) {
      setAdProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  const handleMediaError = () => {
    setMediaError(`Failed to load: ${currentAd?.name}`);
    setTimeout(() => { if (allAds.length > 1) goToNextAd(); }, 3000);
  };

  const handleAuthenticate = async () => {
    setError("");
    setConnecting(true);
    try {
      const screens = await base44.entities.Screen.list();
      let foundScreen = null;
      if (authMode === "setup_code") {
        if (!setupCode) { setError("Please enter a setup code"); setConnecting(false); return; }
        foundScreen = screens.find(s => s.setup_code === setupCode.toUpperCase());
        if (!foundScreen) { setError("Invalid setup code."); setConnecting(false); return; }
      } else {
        if (!screenId) { setError("Please enter a screen ID"); setConnecting(false); return; }
        foundScreen = screens.find(s => s.device_id === screenId || s.id === screenId);
        if (!foundScreen) { setError("Screen not found."); setConnecting(false); return; }
        if (foundScreen.player_pin && foundScreen.player_pin !== pin) { setError("Invalid PIN."); setConnecting(false); return; }
      }
      setScreen(foundScreen);
      setAuthenticated(true);
      await markScreenOnline(foundScreen);
    } catch (e) {
      setError("Failed to connect. Please try again.");
    }
    setConnecting(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (autoStartMode && authenticated && containerRef.current && !document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    }
  }, [autoStartMode, authenticated]);

  const isKioskMode = autoStartMode && authenticated;
  const objectFitClass = screen?.display_mode === "stretch" ? "object-fill" :
                         screen?.display_mode === "fill" ? "object-cover" : "object-contain";

  // ─── Login Screen ───────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-white/10 backdrop-blur-xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
                <MonitorPlay className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">B.One Player</h1>
              <p className="text-white/60">Connect your screen to start displaying ads</p>
            </div>

            <div className="flex bg-white/10 rounded-lg p-1 mb-6">
              <button onClick={() => setAuthMode("setup_code")} className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${authMode === "setup_code" ? "bg-violet-600 text-white" : "text-white/60 hover:text-white"}`}>Setup Code</button>
              <button onClick={() => setAuthMode("screen_id")} className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${authMode === "screen_id" ? "bg-violet-600 text-white" : "text-white/60 hover:text-white"}`}>Screen ID</button>
            </div>

            <div className="space-y-4">
              {authMode === "setup_code" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Setup Code</label>
                  <Input placeholder="e.g., BW-ABCD1234" value={setupCode} onChange={(e) => setSetupCode(e.target.value.toUpperCase())} className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-14 text-xl text-center tracking-wider font-mono" />
                  <p className="text-xs text-white/40 text-center">Enter the setup code from your B.One dashboard</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Screen ID</label>
                    <Input placeholder="e.g., BW-CAF-001" value={screenId} onChange={(e) => setScreenId(e.target.value.toUpperCase())} className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 text-lg" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80 flex items-center gap-2"><Lock className="w-4 h-4" />PIN Code (if set)</label>
                    <Input type="password" placeholder="6-digit PIN" value={pin} onChange={(e) => setPin(e.target.value)} maxLength={6} className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 text-lg tracking-widest" />
                  </div>
                </>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <Button onClick={handleAuthenticate} disabled={connecting} className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-lg">
                {connecting ? <><RefreshCw className="w-5 h-5 mr-2 animate-spin" />Connecting...</> : <><Wifi className="w-5 h-5 mr-2" />Connect Screen</>}
              </Button>
            </div>

            <p className="text-center text-white/40 text-sm mt-6">
              {authMode === "setup_code" ? "Get your setup code from the B.One dashboard after screen approval" : "Find your Screen ID in the B.One dashboard"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Player Screen ──────────────────────────────────────────
  return (
    <div ref={containerRef} className="min-h-screen bg-black relative overflow-hidden">
      {/* Connection Status */}
      {(connectionStatus === "offline" || (connectionStatus === "reconnecting" && Date.now() - (lastHeartbeat?.getTime() || 0) > 30000)) && (
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-full flex items-center gap-2 ${connectionStatus === "offline" ? "bg-red-500" : "bg-amber-500"}`}>
          {connectionStatus === "offline" ? <WifiOff className="w-4 h-4 text-white" /> : <RefreshCw className="w-4 h-4 text-white animate-spin" />}
          <span className="text-white text-sm font-medium">{connectionStatus === "offline" ? "No Internet Connection" : "Reconnecting..."}</span>
        </div>
      )}

      {mediaError && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-full bg-red-500/90 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-white" />
          <span className="text-white text-sm">{mediaError}</span>
        </div>
      )}

      {/* Dashboard */}
      {showDashboard && !isFullscreen && !isKioskMode && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 via-black/70 to-transparent p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <MonitorPlay className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-lg">B.One</span>
                    <span className="text-violet-400 text-xs block -mt-1">Player</span>
                  </div>
                </div>
                <Badge className={`${connectionStatus === "connected" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : connectionStatus === "reconnecting" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}>
                  {connectionStatus === "connected" ? <><Wifi className="w-3 h-3 mr-1" />Connected</> : connectionStatus === "reconnecting" ? <><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Reconnecting</> : <><WifiOff className="w-3 h-3 mr-1" />Offline</>}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right text-white/60 text-sm">
                  <p className="font-medium text-white">{screen?.name}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowDashboard(false)} className="text-white/60 hover:text-white">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: Activity, label: "Current Ad", value: currentAd?.name || "No Ad", sub: currentAd?.type === "owner" ? "Owner Content" : "Advertiser", subColor: "text-violet-400" },
                { icon: Clock, label: "Playtime", value: formatTime(totalPlaytime), sub: `${adsPlayed} ads played`, subColor: "text-emerald-400" },
                { icon: Zap, label: "Queue Position", value: `${currentAdIndex + 1} / ${allAds.length}`, sub: `${allAds.length} total`, subColor: "text-blue-400" },
                { icon: CheckCircle2, label: "Last Sync", value: lastHeartbeat ? new Date(lastHeartbeat).toLocaleTimeString() : "--:--", sub: "Every 15s", subColor: "text-white/40" },
              ].map(({ icon: Icon, label, value, sub, subColor }) => (
                <div key={label} className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10">
                  <div className="flex items-center gap-2 text-white/60 text-xs mb-1"><Icon className="w-3 h-3" />{label}</div>
                  <p className="text-white font-medium truncate">{value}</p>
                  <p className={`text-xs ${subColor}`}>{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!showDashboard && !isFullscreen && !isKioskMode && (
        <Button variant="ghost" size="icon" onClick={() => setShowDashboard(true)} className="absolute top-4 right-4 z-50 text-white/40 hover:text-white bg-black/40 hover:bg-black/60">
          <Settings className="w-5 h-5" />
        </Button>
      )}

      <style>{`
        .ad-container { transition: all 0.4s ease-in-out; }
        .ad-container.transitioning.fade { opacity: 0; }
        .ad-container.transitioning.slideLeft { transform: translateX(-100%); opacity: 0; }
        .ad-container.transitioning.slideRight { transform: translateX(100%); opacity: 0; }
        .ad-container.transitioning.slideUp { transform: translateY(-100%); opacity: 0; }
        .ad-container.transitioning.slideDown { transform: translateY(100%); opacity: 0; }
        .ad-container.transitioning.zoom { transform: scale(0.5); opacity: 0; }
        .ad-container.transitioning.flip { transform: rotateY(90deg); opacity: 0; }
        .ad-container.transitioning.blur { filter: blur(20px); opacity: 0; }
      `}</style>

      {/* Ad Content */}
      <div className={`w-full h-screen flex items-center justify-center ad-container ${transitioning ? `transitioning ${animationType}` : ''}`}>
        {currentAd?.creative_url ? (
          currentAd.creative_type === "video" ? (
            <video ref={videoRef} key={currentAd.id} src={currentAd.creative_url} className={`w-full h-full ${objectFitClass}`} autoPlay muted={isMuted} playsInline onEnded={handleVideoEnded} onTimeUpdate={handleVideoProgress} onError={handleMediaError} />
          ) : (
            <img key={currentAd.id} src={currentAd.creative_url} alt={currentAd.name} className={`w-full h-full ${objectFitClass}`} onError={handleMediaError} />
          )
        ) : (
          <div className="text-center text-white">
            <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <MonitorPlay className="w-12 h-12 text-white/60" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Active Content</h2>
            <p className="text-white/60">Waiting for content to be scheduled...</p>
            <Button variant="ghost" className="mt-6 text-white/60" onClick={() => { refetchBookings(); refetchCampaigns(); }}>
              <RefreshCw className="w-4 h-4 mr-2" />Refresh
            </Button>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {!isFullscreen && allAds.length > 0 && (
        <div className="absolute bottom-24 left-4 right-4 z-50">
          <Progress value={adProgress} className="h-1 bg-white/20" />
        </div>
      )}

      {/* Controls */}
      {!isFullscreen && !isKioskMode && (
        <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/90 to-transparent p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              {allAds.slice(0, 10).map((ad, idx) => (
                <button key={idx} onClick={() => { setCurrentAdIndex(idx); setAdProgress(0); }} className={`h-2 rounded-full transition-all ${idx === currentAdIndex ? "bg-violet-500 w-8" : "bg-white/30 w-2 hover:bg-white/50"}`} title={ad.name} />
              ))}
              {allAds.length > 10 && <span className="text-white/40 text-xs ml-1">+{allAds.length - 10}</span>}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={goToPrevAd} className="text-white/60 hover:text-white hover:bg-white/10"><SkipBack className="w-5 h-5" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setIsPaused(!isPaused)} className="text-white/60 hover:text-white hover:bg-white/10">
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={goToNextAd} className="text-white/60 hover:text-white hover:bg-white/10"><SkipForward className="w-5 h-5" /></Button>
              <div className="w-px h-6 bg-white/20 mx-2" />
              <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)} className="text-white/60 hover:text-white hover:bg-white/10">
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white/60 hover:text-white hover:bg-white/10">
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Current Ad Info */}
      {!isFullscreen && !isKioskMode && currentAd && (
        <div className="absolute bottom-28 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2">
          <p className="text-white text-sm font-medium">{currentAd.name}</p>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-white/60">{currentAdIndex + 1} of {allAds.length}</span>
            <Badge variant="outline" className={`text-xs py-0 ${currentAd.type === "owner" ? "border-emerald-500/50 text-emerald-400" : "border-violet-500/50 text-violet-400"}`}>
              {currentAd.type === "owner" ? "Owner" : "Paid Ad"}
            </Badge>
          </div>
        </div>
      )}

      {/* Paused Overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="text-center">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Pause className="w-10 h-10 text-white" />
            </div>
            <p className="text-white text-xl font-bold">Paused</p>
            <Button onClick={() => setIsPaused(false)} className="mt-4 bg-violet-600 hover:bg-violet-700">
              <Play className="w-4 h-4 mr-2" />Resume Playback
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}