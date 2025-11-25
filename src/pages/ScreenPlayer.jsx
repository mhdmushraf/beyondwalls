import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  MonitorPlay,
  Lock,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Maximize,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function ScreenPlayer() {
  const [screenId, setScreenId] = useState("");
  const [setupCode, setSetupCode] = useState("");
  const [authMode, setAuthMode] = useState("setup_code"); // "setup_code" or "screen_id"
  const [pin, setPin] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [screen, setScreen] = useState(null);
  const [error, setError] = useState("");
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  // Get setup code or screen ID from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("setup_code");
    const id = urlParams.get("screen_id");
    if (code) {
      setSetupCode(code);
      setAuthMode("setup_code");
    } else if (id) {
      setScreenId(id);
      setAuthMode("screen_id");
    }
  }, []);

  // Fetch ad slot bookings for this screen (only approved/active ones)
  const { data: bookings = [], refetch: refetchBookings } = useQuery({
    queryKey: ["player-bookings", screen?.id],
    queryFn: async () => {
      const allBookings = await base44.entities.AdSlotBooking.filter({ 
        screen_id: screen?.id, 
        status: "active" 
      });
      // Filter to only show bookings within their date range
      const today = new Date().toISOString().split('T')[0];
      return allBookings.filter(b => b.start_date <= today && b.end_date >= today);
    },
    enabled: authenticated && !!screen?.id,
    refetchInterval: 60000 // Refresh every minute
  });

  // Fetch campaigns for this screen (legacy support)
  const { data: campaigns = [], refetch: refetchCampaigns } = useQuery({
    queryKey: ["player-campaigns", screen?.id],
    queryFn: async () => {
      const allCampaigns = await base44.entities.Campaign.filter({ status: "active" });
      return allCampaigns.filter(c => c.screen_ids?.includes(screen?.id));
    },
    enabled: authenticated && !!screen?.id,
    refetchInterval: 60000 // Refresh every minute
  });

  // Combine bookings and campaigns for display
  const allAds = [
    ...bookings.map(b => ({ 
      id: b.id, 
      name: b.campaign_name || "Ad Slot", 
      creative_url: b.creative_url, 
      creative_type: b.creative_type,
      type: "booking"
    })),
    ...campaigns.map(c => ({ 
      id: c.id, 
      name: c.name, 
      creative_url: c.creative_url, 
      creative_type: c.creative_type,
      type: "campaign"
    }))
  ].filter(ad => ad.creative_url);

  // Cycle through ads
  useEffect(() => {
    if (!authenticated || allAds.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentAdIndex(prev => (prev + 1) % allAds.length);
    }, 15000); // 15 seconds per ad

    return () => clearInterval(interval);
  }, [authenticated, allAds.length]);

  // Send heartbeat
  useEffect(() => {
    if (!authenticated || !screen?.id) return;

    const sendHeartbeat = async () => {
      try {
        await base44.entities.Screen.update(screen.id, {
          last_heartbeat: new Date().toISOString(),
          status: "online",
          player_active: true
        });
      } catch (e) {
        console.error("Heartbeat failed:", e);
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30000); // Every 30 seconds

    return () => {
      clearInterval(interval);
      // Mark as offline when leaving
      base44.entities.Screen.update(screen.id, { player_active: false });
    };
  }, [authenticated, screen?.id]);

  const handleAuthenticate = async () => {
    setError("");
    setConnecting(true);

    try {
      const screens = await base44.entities.Screen.list();
      let foundScreen = null;

      if (authMode === "setup_code") {
        if (!setupCode) {
          setError("Please enter a setup code");
          setConnecting(false);
          return;
        }
        foundScreen = screens.find(s => s.setup_code === setupCode.toUpperCase());
        if (!foundScreen) {
          setError("Invalid setup code. Please check and try again.");
          setConnecting(false);
          return;
        }
      } else {
        if (!screenId) {
          setError("Please enter a screen ID");
          setConnecting(false);
          return;
        }
        foundScreen = screens.find(s => 
          s.device_id === screenId || s.id === screenId
        );
        if (!foundScreen) {
          setError("Screen not found. Check your screen ID.");
          setConnecting(false);
          return;
        }
        if (foundScreen.player_pin && foundScreen.player_pin !== pin) {
          setError("Invalid PIN. Please try again.");
          setConnecting(false);
          return;
        }
      }

      setScreen(foundScreen);
      setAuthenticated(true);

      // Update screen status to online
      await base44.entities.Screen.update(foundScreen.id, {
        status: "online",
        player_active: true,
        last_heartbeat: new Date().toISOString()
      });

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

  const currentAd = allAds[currentAdIndex];

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
              <h1 className="text-2xl font-bold text-white mb-2">BeyondWalls Player</h1>
              <p className="text-white/60">Connect your screen to start displaying ads</p>
            </div>

            {/* Auth Mode Toggle */}
            <div className="flex bg-white/10 rounded-lg p-1 mb-6">
              <button
                onClick={() => setAuthMode("setup_code")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  authMode === "setup_code" 
                    ? "bg-violet-600 text-white" 
                    : "text-white/60 hover:text-white"
                }`}
              >
                Setup Code
              </button>
              <button
                onClick={() => setAuthMode("screen_id")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  authMode === "screen_id" 
                    ? "bg-violet-600 text-white" 
                    : "text-white/60 hover:text-white"
                }`}
              >
                Screen ID
              </button>
            </div>

            <div className="space-y-4">
              {authMode === "setup_code" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Setup Code</label>
                  <Input
                    placeholder="e.g., BW-ABCD1234"
                    value={setupCode}
                    onChange={(e) => setSetupCode(e.target.value.toUpperCase())}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-14 text-xl text-center tracking-wider font-mono"
                  />
                  <p className="text-xs text-white/40 text-center">
                    Enter the setup code provided by your admin
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Screen ID</label>
                    <Input
                      placeholder="e.g., BW-CAF-001"
                      value={screenId}
                      onChange={(e) => setScreenId(e.target.value.toUpperCase())}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      PIN Code (if set)
                    </label>
                    <Input
                      type="password"
                      placeholder="6-digit PIN"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      maxLength={6}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 text-lg tracking-widest"
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <Button 
                onClick={handleAuthenticate}
                disabled={connecting}
                className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-lg"
              >
                {connecting ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wifi className="w-5 h-5 mr-2" />
                    Connect Screen
                  </>
                )}
              </Button>
            </div>

            <p className="text-center text-white/40 text-sm mt-6">
              {authMode === "setup_code" 
                ? "Get your setup code from the BeyondWalls dashboard after screen approval"
                : "Find your Screen ID in the BeyondWalls dashboard"
              }
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Player Screen
  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-black relative overflow-hidden"
    >
      {/* Status Bar */}
      {!isFullscreen && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                  <MonitorPlay className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white">BeyondWalls</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <Wifi className="w-4 h-4" />
                <span className="text-sm">Connected</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-white/60 text-sm">
              <span>{screen?.name}</span>
              <span className="text-white/40">|</span>
              <span>{screen?.device_id}</span>
            </div>
          </div>
        </div>
      )}

      {/* Ad Content */}
      <div className="w-full h-screen flex items-center justify-center">
        {allAds.length === 0 ? (
          <div className="text-center text-white">
            <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <MonitorPlay className="w-12 h-12 text-white/60" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Active Campaigns</h2>
            <p className="text-white/60">Waiting for approved ads to be scheduled...</p>
            <Button 
              variant="ghost" 
              className="mt-6 text-white/60"
              onClick={() => { refetchBookings(); refetchCampaigns(); }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        ) : currentAd?.creative_url ? (
          currentAd.creative_type === "video" ? (
            <video
              ref={videoRef}
              src={currentAd.creative_url}
              className="w-full h-full object-contain"
              autoPlay
              loop
              muted={isMuted}
              playsInline
            />
          ) : (
            <img
              src={currentAd.creative_url}
              alt={currentAd.name}
              className="w-full h-full object-contain"
            />
          )
        ) : null}
      </div>

      {/* Controls */}
      {!isFullscreen && (
        <div className="absolute bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              {allAds.map((_, idx) => (
                <div 
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentAdIndex ? "bg-violet-500 w-6" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleFullscreen}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <Maximize className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Info Overlay */}
      {!isFullscreen && currentAd && (
        <div className="absolute bottom-16 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2">
          <p className="text-white text-sm font-medium">{currentAd.name}</p>
          <p className="text-white/60 text-xs">
            {currentAdIndex + 1} of {allAds.length}
          </p>
        </div>
      )}
    </div>
  );
}