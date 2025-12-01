import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MonitorPlay,
  Lock,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  SkipForward,
  SkipBack,
  Play,
  Pause,
  Clock,
  Zap,
  Activity,
  Settings,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// Generate hardware fingerprint
const generateHardwareId = () => {
  const nav = window.navigator;
  const screen = window.screen;
  
  // Create fingerprint from available browser/device info
  const components = [
    nav.userAgent,
    screen.width + "x" + screen.height,
    screen.colorDepth,
    nav.language,
    nav.platform,
    new Date().getTimezoneOffset(),
    nav.hardwareConcurrency || 0,
    nav.deviceMemory || 0
  ];
  
  // Simple hash function
  const hash = components.join("|").split("").reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return "BONE-" + Math.abs(hash).toString(16).toUpperCase().padStart(8, "0");
};

// Generate session ID
const generateSessionId = () => {
  return "SES-" + Date.now().toString(36) + "-" + Math.random().toString(36).substr(2, 9);
};

export default function ScreenPlayer() {
  const queryClient = useQueryClient();
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
  const [hardwareId, setHardwareId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [sessionBlocked, setSessionBlocked] = useState(false);
  const [uptimeSeconds, setUptimeSeconds] = useState(0);
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const sessionCheckRef = useRef(null);

  const AD_DURATION = 8000;
  const animations = ["fade", "slideLeft", "slideRight", "slideUp", "slideDown", "zoom", "flip", "blur"];
  const PLAYER_VERSION = "2.1.0";

  const [autoStartMode, setAutoStartMode] = useState(false);

  const [urlParams, setUrlParams] = useState(null);

  // Initialize hardware ID on mount and parse URL params
  useEffect(() => {
    const hwId = generateHardwareId();
    setHardwareId(hwId);
    const sessId = generateSessionId();
    setSessionId(sessId);
    
    // Parse URL parameters
    const params = new URLSearchParams(window.location.search);
    setUrlParams({
      code: params.get("setup_code"),
      id: params.get("screen_id"),
      pin: params.get("pin"),
      autoStart: params.get("auto_start") === "true"
    });
  }, []);

  // Handle auto-login after hardware ID is ready
  useEffect(() => {
    if (!urlParams || !hardwareId || !sessionId) return;

    const { code, id, pin: pinParam, autoStart } = urlParams;

    if (autoStart) {
      setAutoStartMode(true);
    }

    if (code) {
      setSetupCode(code);
      setAuthMode("setup_code");
      if (autoStart) {
        handleAutoAuthenticate("setup_code", code, null);
      }
    } else if (id) {
      setScreenId(id);
      setAuthMode("screen_id");
      if (pinParam) {
        setPin(pinParam);
      }
      if (autoStart) {
        handleAutoAuthenticate("screen_id", id, pinParam);
      }
    }
  }, [urlParams, hardwareId, sessionId]);

  // Auto-authenticate function for URL parameter login with hardware validation
  const handleAutoAuthenticate = async (mode, idOrCode, pinCode) => {
    if (authenticated || connecting) return;
    
    setConnecting(true);
    try {
      const screens = await base44.entities.Screen.list();
      let foundScreen = null;

      if (mode === "setup_code") {
        foundScreen = screens.find(s => s.setup_code === idOrCode.toUpperCase());
      } else {
        foundScreen = screens.find(s => s.device_id === idOrCode || s.id === idOrCode);
        if (foundScreen?.player_pin && foundScreen.player_pin !== pinCode) {
          setError("Invalid PIN");
          setConnecting(false);
          return;
        }
      }

      if (foundScreen) {
        // Hardware validation
        if (foundScreen.hardware_id && foundScreen.hardware_id !== hardwareId) {
          setError("Unauthorized device. This screen is registered to a different B.One hardware.");
          setSessionBlocked(true);
          setConnecting(false);
          return;
        }

        // Register hardware if first time
        const updateData = { 
          status: "online", 
          player_active: true, 
          last_heartbeat: new Date().toISOString(),
          current_session_id: sessionId,
          session_started_at: new Date().toISOString(),
          uptime_seconds: 0
        };

        if (!foundScreen.hardware_id) {
          updateData.hardware_id = hardwareId;
          updateData.hardware_registered_at = new Date().toISOString();
        }
        
        // Report player version
        updateData.player_version = PLAYER_VERSION;

        setScreen(foundScreen);
        setAuthenticated(true);
        await base44.entities.Screen.update(foundScreen.id, updateData);
      } else {
        setError("Screen not found");
      }
    } catch (e) {
      setError("Auto-connect failed");
    }
    setConnecting(false);
  };

  // Fetch ad slot bookings
  const { data: bookings = [], refetch: refetchBookings } = useQuery({
    queryKey: ["player-bookings", screen?.id],
    queryFn: async () => {
      const allBookings = await base44.entities.AdSlotBooking.filter({ 
        screen_id: screen?.id, 
        status: "active" 
      });
      const today = new Date().toISOString().split('T')[0];
      return allBookings.filter(b => b.start_date <= today && b.end_date >= today);
    },
    enabled: authenticated && !!screen?.id,
    refetchInterval: 60000
  });

  // Fetch campaigns
  const { data: campaigns = [], refetch: refetchCampaigns } = useQuery({
    queryKey: ["player-campaigns", screen?.id],
    queryFn: async () => {
      const allCampaigns = await base44.entities.Campaign.filter({ status: "active" });
      return allCampaigns.filter(c => c.screen_ids?.includes(screen?.id));
    },
    enabled: authenticated && !!screen?.id,
    refetchInterval: 60000
  });

  // Fetch platform settings
  const { data: platformSettings = [] } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: () => base44.entities.PlatformSettings.list(),
    enabled: authenticated
  });

  // Check for remote commands (skip/replay from admin)
  const { data: screenData } = useQuery({
    queryKey: ["screen-commands", screen?.id],
    queryFn: () => base44.entities.Screen.filter({ id: screen?.id }),
    enabled: authenticated && !!screen?.id,
    refetchInterval: 5000 // Check every 5 seconds for commands
  });

  // Handle remote commands
  useEffect(() => {
    if (screenData?.[0]?.player_command) {
      const command = screenData[0].player_command;
      if (command === "skip") {
        goToNextAd();
      } else if (command === "replay") {
        replayCurrentAd();
      } else if (command === "pause") {
        setIsPaused(true);
      } else if (command === "resume") {
        setIsPaused(false);
      } else if (command === "refresh") {
        // Force content refresh
        refetchBookings();
        refetchCampaigns();
      } else if (command === "restart") {
        // Reload the page
        window.location.reload();
      }
      // Clear the command after processing
      base44.entities.Screen.update(screen.id, { player_command: null });
    }

    // Session validation - check if another device hijacked the session
    if (screenData?.[0]?.current_session_id && screenData[0].current_session_id !== sessionId && authenticated) {
      setSessionBlocked(true);
      setAuthenticated(false);
      setError("Session terminated. Another device has connected to this screen.");
    }
  }, [screenData]);

  const defaultContentUrl = platformSettings.find(s => s.setting_key === "default_screen_content_url")?.setting_value || "";
  const defaultContentType = platformSettings.find(s => s.setting_key === "default_screen_content_type")?.setting_value || "image";

  // Build owner slots
  const ownerSlots = [];
  if (screen?.owner_slot_1_url) {
    ownerSlots.push({ id: "owner-1", name: "Owner Slot 1", creative_url: screen.owner_slot_1_url, creative_type: screen.owner_slot_1_type || "image", type: "owner" });
  }
  if (screen?.owner_slot_2_url) {
    ownerSlots.push({ id: "owner-2", name: "Owner Slot 2", creative_url: screen.owner_slot_2_url, creative_type: screen.owner_slot_2_type || "image", type: "owner" });
  }
  if (screen?.owner_slot_3_url) {
    ownerSlots.push({ id: "owner-3", name: "Owner Slot 3", creative_url: screen.owner_slot_3_url, creative_type: screen.owner_slot_3_type || "image", type: "owner" });
  }

  // Build advertiser ads
  const advertiserAds = [
    ...bookings.map(b => ({ id: b.id, name: b.campaign_name || "Ad Slot", creative_url: b.creative_url, creative_type: b.creative_type, type: "booking" })),
    ...campaigns.map(c => ({ id: c.id, name: c.name, creative_url: c.creative_url, creative_type: c.creative_type, type: "campaign" }))
  ].filter(ad => ad.creative_url);

  // Build playlist
  const buildPlaylist = () => {
    const adCount = advertiserAds.length;
    const ownerCount = ownerSlots.length;
    if (adCount === 0 && ownerCount === 0) return [];
    if (adCount === 0) return [...ownerSlots];
    if (ownerCount === 0) return [...advertiserAds];

    const playlist = [];
    let adIndex = 0, ownerIndex = 0;
    if (adIndex < adCount) playlist.push(advertiserAds[adIndex++]);
    if (ownerIndex < ownerCount) playlist.push(ownerSlots[ownerIndex++]);
    if (adIndex < adCount) playlist.push(advertiserAds[adIndex++]);
    if (ownerIndex < ownerCount) playlist.push(ownerSlots[ownerIndex++]);
    if (adIndex < adCount) playlist.push(advertiserAds[adIndex++]);
    if (ownerIndex < ownerCount) playlist.push(ownerSlots[ownerIndex++]);
    if (adIndex < adCount) playlist.push(advertiserAds[adIndex++]);
    if (adIndex < adCount) playlist.push(advertiserAds[adIndex++]);
    return playlist;
  };

  const allAds = buildPlaylist();
  const currentAd = allAds[currentAdIndex];

  // Progress bar update
  useEffect(() => {
    if (!authenticated || allAds.length === 0 || isPaused) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    setAdStartTime(Date.now());
    setAdProgress(0);

    const isVideo = currentAd?.creative_type === "video";
    if (!isVideo) {
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - (adStartTime || Date.now());
        const progress = Math.min((elapsed / AD_DURATION) * 100, 100);
        setAdProgress(progress);
      }, 100);
    }

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [authenticated, currentAdIndex, isPaused, allAds.length]);

  // Ad cycling
  useEffect(() => {
    if (!authenticated || allAds.length === 0 || isPaused) return;
    const isVideo = currentAd?.creative_type === "video";
    if (isVideo) return;

    const timer = setTimeout(() => {
      goToNextAd();
    }, AD_DURATION);

    return () => clearTimeout(timer);
  }, [authenticated, allAds.length, currentAdIndex, isPaused]);

  // Playtime tracking
  useEffect(() => {
    if (!authenticated || isPaused) return;
    const timer = setInterval(() => {
      setTotalPlaytime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [authenticated, isPaused]);

  // Track content analytics
  const trackContentImpression = async (ad, completed = false, watchTime = 0) => {
    if (!screen?.id || !ad) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      // Find existing analytics for this content today
      const existingAnalytics = await base44.entities.ContentAnalytics.filter({
        screen_id: screen.id,
        content_id: ad.id,
        date: today
      });
      
      if (existingAnalytics.length > 0) {
        const existing = existingAnalytics[0];
        const newImpressions = (existing.impressions || 0) + 1;
        const newCompletions = (existing.completions || 0) + (completed ? 1 : 0);
        const newTotalWatchTime = (existing.total_watch_time || 0) + watchTime;
        await base44.entities.ContentAnalytics.update(existing.id, {
          impressions: newImpressions,
          completions: newCompletions,
          total_watch_time: newTotalWatchTime,
          avg_watch_time: newTotalWatchTime / newImpressions,
          completion_rate: (newCompletions / newImpressions) * 100,
          skips: (existing.skips || 0) + (completed ? 0 : 1)
        });
      } else {
        await base44.entities.ContentAnalytics.create({
          screen_id: screen.id,
          content_id: ad.id,
          content_type: ad.type === "owner" ? "owner_slot" : ad.type,
          content_name: ad.name,
          creative_url: ad.creative_url,
          media_type: ad.creative_type || "image",
          impressions: 1,
          completions: completed ? 1 : 0,
          total_watch_time: watchTime,
          avg_watch_time: watchTime,
          completion_rate: completed ? 100 : 0,
          skips: completed ? 0 : 1,
          date: today
        });
      }
    } catch (e) {
      console.log("Analytics tracking error:", e);
    }
  };

  const goToNextAd = useCallback(() => {
    // Track impression for current ad (not completed since it's being skipped/cycled)
    const watchTime = adStartTime ? (Date.now() - adStartTime) / 1000 : 0;
    const completed = watchTime >= (AD_DURATION / 1000) * 0.9; // 90% watch = completion
    trackContentImpression(currentAd, completed, watchTime);
    
    setMediaError(null);
    const randomAnim = animations[Math.floor(Math.random() * animations.length)];
    setAnimationType(randomAnim);
    setTransitioning(true);
    setAdsPlayed(prev => prev + 1);

    setTimeout(() => {
      setCurrentAdIndex(prev => (prev + 1) % allAds.length);
      setAdStartTime(Date.now());
      setAdProgress(0);
      setTimeout(() => setTransitioning(false), 50);
    }, 400);
  }, [allAds.length, currentAd, adStartTime]);

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

  const replayCurrentAd = () => {
    setMediaError(null);
    setAdStartTime(Date.now());
    setAdProgress(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const handleVideoEnded = () => {
    // Video completed fully
    const watchTime = videoRef.current?.duration || AD_DURATION / 1000;
    trackContentImpression(currentAd, true, watchTime);
    
    setMediaError(null);
    const randomAnim = animations[Math.floor(Math.random() * animations.length)];
    setAnimationType(randomAnim);
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
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setAdProgress(progress);
    }
  };

  const handleMediaError = (e) => {
    console.error("Media error:", e);
    setMediaError(`Failed to load: ${currentAd?.name}`);
    // Auto-skip to next ad after 3 seconds on error
    setTimeout(() => {
      if (allAds.length > 1) goToNextAd();
    }, 3000);
  };

  // Uptime tracking
  useEffect(() => {
    if (!authenticated || isPaused) return;
    const timer = setInterval(() => {
      setUptimeSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [authenticated, isPaused]);

  // Get network strength estimate
  const getNetworkStrength = () => {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) return "good";
    const effectiveType = conn.effectiveType;
    if (effectiveType === "4g") return "excellent";
    if (effectiveType === "3g") return "good";
    if (effectiveType === "2g") return "fair";
    return "poor";
  };

  // Send heartbeat with enhanced status
  useEffect(() => {
    if (!authenticated || !screen?.id) return;

    const sendHeartbeat = async () => {
      try {
        await base44.entities.Screen.update(screen.id, {
          last_heartbeat: new Date().toISOString(),
          status: "online",
          player_active: !isPaused,
          current_ad_index: currentAdIndex,
          total_playtime: totalPlaytime,
          ads_played_count: adsPlayed,
          current_session_id: sessionId,
          uptime_seconds: uptimeSeconds,
          network_strength: getNetworkStrength(),
          current_content_name: currentAd?.name || null,
          player_version: PLAYER_VERSION
        });
        setConnectionStatus("connected");
        setLastHeartbeat(new Date());
      } catch (e) {
        console.error("Heartbeat failed:", e);
        setConnectionStatus("reconnecting");
        // Retry after 5 seconds
        setTimeout(sendHeartbeat, 5000);
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 15000); // More frequent heartbeat for real-time monitoring

    return () => {
      clearInterval(interval);
      base44.entities.Screen.update(screen.id, { player_active: false }).catch(() => {});
    };
  }, [authenticated, screen?.id, currentAdIndex, totalPlaytime, adsPlayed, uptimeSeconds, isPaused, currentAd]);

  // Connection status monitoring
  useEffect(() => {
    const handleOnline = () => setConnectionStatus("connected");
    const handleOffline = () => setConnectionStatus("offline");
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleAuthenticate = async () => {
    setError("");
    setConnecting(true);

    try {
      const screens = await base44.entities.Screen.list();
      let foundScreen = null;

      if (authMode === "setup_code") {
        if (!setupCode) { setError("Please enter a setup code"); setConnecting(false); return; }
        foundScreen = screens.find(s => s.setup_code === setupCode.toUpperCase());
        if (!foundScreen) { setError("Invalid setup code. Please check and try again."); setConnecting(false); return; }
      } else {
        if (!screenId) { setError("Please enter a screen ID"); setConnecting(false); return; }
        foundScreen = screens.find(s => s.device_id === screenId || s.id === screenId);
        if (!foundScreen) { setError("Screen not found. Check your screen ID."); setConnecting(false); return; }
        if (foundScreen.player_pin && foundScreen.player_pin !== pin) { setError("Invalid PIN. Please try again."); setConnecting(false); return; }
      }

      // Hardware validation - check if already registered to different hardware
      if (foundScreen.hardware_id && foundScreen.hardware_id !== hardwareId) {
        setError("Unauthorized device. This screen is registered to a different B.One hardware.");
        setSessionBlocked(true);
        setConnecting(false);
        return;
      }

      // Prepare update data with session info
      const updateData = { 
        status: "online", 
        player_active: true, 
        last_heartbeat: new Date().toISOString(),
        current_session_id: sessionId,
        session_started_at: new Date().toISOString(),
        uptime_seconds: 0
      };

      // Register hardware if first time
      if (!foundScreen.hardware_id) {
        updateData.hardware_id = hardwareId;
        updateData.hardware_registered_at = new Date().toISOString();
      }
      
      // Report player version
      updateData.player_version = PLAYER_VERSION;

      setScreen(foundScreen);
      setAuthenticated(true);
      await base44.entities.Screen.update(foundScreen.id, updateData);
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

  // Auto-enter fullscreen in kiosk mode
  useEffect(() => {
    if (autoStartMode && authenticated && containerRef.current && !document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    }
  }, [autoStartMode, authenticated]);

  // Hide controls in kiosk/auto-start mode
  const isKioskMode = autoStartMode && authenticated;

  // Session blocked screen
  if (sessionBlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-rose-900 to-slate-900 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-white/10 backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-rose-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Session Blocked</h1>
            <p className="text-white/60 mb-4">{error || "This device is not authorized to access this screen."}</p>
            <div className="text-xs text-white/40 font-mono mb-6">
              Hardware ID: {hardwareId}
            </div>
            <Button onClick={() => window.location.reload()} className="w-full bg-rose-600 hover:bg-rose-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Login Screen
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
                  <p className="text-xs text-white/40 text-center">Enter the setup code provided by your admin</p>
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
                {connecting ? (<><RefreshCw className="w-5 h-5 mr-2 animate-spin" />Connecting...</>) : (<><Wifi className="w-5 h-5 mr-2" />Connect Screen</>)}
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

  // Player Screen
  return (
    <div ref={containerRef} className="min-h-screen bg-black relative overflow-hidden">
      {/* Connection Status Indicator */}
      {connectionStatus !== "connected" && (
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-full flex items-center gap-2 ${connectionStatus === "offline" ? "bg-red-500" : "bg-amber-500"}`}>
          {connectionStatus === "offline" ? <WifiOff className="w-4 h-4 text-white" /> : <RefreshCw className="w-4 h-4 text-white animate-spin" />}
          <span className="text-white text-sm font-medium">{connectionStatus === "offline" ? "No Internet Connection" : "Reconnecting..."}</span>
        </div>
      )}

      {/* Media Error Indicator */}
      {mediaError && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-full bg-red-500/90 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-white" />
          <span className="text-white text-sm">{mediaError}</span>
        </div>
      )}

      {/* Real-time Dashboard - hidden in kiosk mode */}
      {showDashboard && !isFullscreen && !isKioskMode && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 via-black/70 to-transparent p-4">
          <div className="max-w-7xl mx-auto">
            {/* Top Bar */}
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
                
                {/* Connection Status Badge */}
                <Badge className={`${connectionStatus === "connected" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : connectionStatus === "reconnecting" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}>
                  {connectionStatus === "connected" ? <><Wifi className="w-3 h-3 mr-1" />Connected</> : connectionStatus === "reconnecting" ? <><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Reconnecting</> : <><WifiOff className="w-3 h-3 mr-1" />Offline</>}
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right text-white/60 text-sm">
                  <p className="font-medium text-white">{screen?.name}</p>
                  <p className="text-xs">{screen?.device_id}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowDashboard(false)} className="text-white/60 hover:text-white">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10">
                <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                  <Activity className="w-3 h-3" />
                  Current Ad
                </div>
                <p className="text-white font-medium truncate">{currentAd?.name || "No Ad"}</p>
                <p className="text-violet-400 text-xs">{currentAd?.type === "owner" ? "Owner Content" : "Advertiser"}</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10">
                <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                  <Clock className="w-3 h-3" />
                  Playtime
                </div>
                <p className="text-white font-bold text-lg">{formatTime(totalPlaytime)}</p>
                <p className="text-emerald-400 text-xs">{adsPlayed} ads played</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10">
                <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                  <Zap className="w-3 h-3" />
                  Queue Position
                </div>
                <p className="text-white font-bold text-lg">{currentAdIndex + 1} / {allAds.length}</p>
                <p className="text-blue-400 text-xs">{allAds.length} total ads</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur rounded-xl p-3 border border-white/10">
                <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Last Sync
                </div>
                <p className="text-white font-medium">{lastHeartbeat ? new Date(lastHeartbeat).toLocaleTimeString() : "--:--"}</p>
                <p className="text-white/40 text-xs">Every 30s</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show Dashboard Button when hidden - not in kiosk mode */}
      {!showDashboard && !isFullscreen && !isKioskMode && (
        <Button variant="ghost" size="icon" onClick={() => setShowDashboard(true)} className="absolute top-4 right-4 z-50 text-white/40 hover:text-white bg-black/40 hover:bg-black/60">
          <Settings className="w-5 h-5" />
        </Button>
      )}

      {/* Animation Styles */}
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
        {allAds.length === 0 ? (
          defaultContentUrl ? (
            defaultContentType === "video" ? (
              <video src={defaultContentUrl} className="w-full h-full object-contain" autoPlay loop muted={isMuted} playsInline onError={handleMediaError} />
            ) : (
              <img src={defaultContentUrl} alt="Default Content" className="w-full h-full object-contain" onError={handleMediaError} />
            )
          ) : (
            <div className="text-center text-white">
              <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <MonitorPlay className="w-12 h-12 text-white/60" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No Active Campaigns</h2>
              <p className="text-white/60">Waiting for approved ads to be scheduled...</p>
              <Button variant="ghost" className="mt-6 text-white/60" onClick={() => { refetchBookings(); refetchCampaigns(); }}>
                <RefreshCw className="w-4 h-4 mr-2" />Refresh
              </Button>
            </div>
          )
        ) : currentAd?.creative_url ? (
          currentAd.creative_type === "video" ? (
            <video ref={videoRef} key={currentAd.id} src={currentAd.creative_url} className="w-full h-full object-contain" autoPlay={!isPaused} muted={isMuted} playsInline onEnded={handleVideoEnded} onTimeUpdate={handleVideoProgress} onError={handleMediaError} onLoadedMetadata={(e) => { if (e.target.duration > AD_DURATION / 1000) { setTimeout(() => { if (videoRef.current) goToNextAd(); }, AD_DURATION); } }} />
          ) : (
            <img key={currentAd.id} src={currentAd.creative_url} alt={currentAd.name} className="w-full h-full object-contain" onError={handleMediaError} />
          )
        ) : null}
      </div>

      {/* Progress Bar */}
      {!isFullscreen && allAds.length > 0 && (
        <div className="absolute bottom-24 left-4 right-4 z-50">
          <Progress value={adProgress} className="h-1 bg-white/20" />
        </div>
      )}

      {/* Controls - hidden in kiosk mode */}
      {!isFullscreen && !isKioskMode && (
        <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/90 to-transparent p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Ad Indicators */}
            <div className="flex items-center gap-2">
              {allAds.slice(0, 10).map((ad, idx) => (
                <button key={idx} onClick={() => { setCurrentAdIndex(idx); setAdProgress(0); }} className={`h-2 rounded-full transition-all ${idx === currentAdIndex ? "bg-violet-500 w-8" : "bg-white/30 w-2 hover:bg-white/50"}`} title={ad.name} />
              ))}
              {allAds.length > 10 && <span className="text-white/40 text-xs ml-1">+{allAds.length - 10}</span>}
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={goToPrevAd} className="text-white/60 hover:text-white hover:bg-white/10" title="Previous Ad">
                <SkipBack className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsPaused(!isPaused)} className="text-white/60 hover:text-white hover:bg-white/10" title={isPaused ? "Resume" : "Pause"}>
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={goToNextAd} className="text-white/60 hover:text-white hover:bg-white/10" title="Skip Ad">
                <SkipForward className="w-5 h-5" />
              </Button>
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

      {/* Campaign Info Overlay - hidden in kiosk mode */}
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