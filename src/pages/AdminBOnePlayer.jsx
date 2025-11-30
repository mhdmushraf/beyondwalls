import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import {
  MonitorPlay,
  Wifi,
  WifiOff,
  RefreshCw,
  Play,
  Pause,
  SkipForward,
  Power,
  Activity,
  Clock,
  Cpu,
  Signal,
  Eye,
  Search,
  Filter,
  MoreVertical,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  BarChart3,
  Zap,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

// Screen Preview Component
function ScreenPreviewContent({ screen, bookings }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Get active content for this screen
  const screenBookings = bookings.filter(b => b.screen_id === screen.id);
  
  const allContent = [
    ...(screen.owner_slot_1_url ? [{ url: screen.owner_slot_1_url, type: screen.owner_slot_1_type || "image", name: "Owner Slot 1" }] : []),
    ...(screen.owner_slot_2_url ? [{ url: screen.owner_slot_2_url, type: screen.owner_slot_2_type || "image", name: "Owner Slot 2" }] : []),
    ...(screen.owner_slot_3_url ? [{ url: screen.owner_slot_3_url, type: screen.owner_slot_3_type || "image", name: "Owner Slot 3" }] : []),
    ...screenBookings.map(b => ({ url: b.creative_url, type: b.creative_type || "image", name: b.campaign_name || "Ad" }))
  ].filter(c => c.url);

  useEffect(() => {
    if (allContent.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % allContent.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [allContent.length]);

  if (allContent.length === 0) {
    return (
      <div className="text-center">
        <MonitorPlay className="w-12 h-12 text-slate-600 mx-auto mb-2" />
        <p className="text-slate-500 text-sm">No active content</p>
      </div>
    );
  }

  const current = allContent[currentIndex];
  
  return (
    <div className="w-full h-full relative">
      {current.type === "video" ? (
        <video 
          src={current.url} 
          className="w-full h-full object-contain" 
          autoPlay 
          muted 
          loop
        />
      ) : (
        <img 
          src={current.url} 
          alt={current.name}
          className="w-full h-full object-contain"
        />
      )}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
        <Badge className="bg-black/60 text-white text-xs">
          {current.name}
        </Badge>
        {allContent.length > 1 && (
          <div className="flex gap-1">
            {allContent.map((_, i) => (
              <div 
                key={i} 
                className={`w-1.5 h-1.5 rounded-full ${i === currentIndex ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminBOnePlayer() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl("AdminBOnePlayer"));
        return;
      }
      const userData = await base44.auth.me();
      const isAdmin = userData?.user_role === "admin" || userData?.role === "admin";
      if (!isAdmin) {
        window.location.href = createPageUrl("Dashboard");
        return;
      }
      setUser(userData);
    } catch (e) {
      base44.auth.redirectToLogin(createPageUrl("AdminBOnePlayer"));
    }
  };

  const { data: screens = [], isLoading, refetch } = useQuery({
    queryKey: ["bone-players"],
    queryFn: () => base44.entities.Screen.list("-last_heartbeat"),
    refetchInterval: 10000 // Refresh every 10 seconds for real-time monitoring
  });

  const { data: venues = [] } = useQuery({
    queryKey: ["all-venues"],
    queryFn: () => base44.entities.Venue.list()
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["active-bookings"],
    queryFn: () => base44.entities.AdSlotBooking.filter({ status: "active" })
  });

  // Calculate stats
  const onlineScreens = screens.filter(s => {
    if (!s.last_heartbeat) return false;
    const lastHB = new Date(s.last_heartbeat);
    const now = new Date();
    return (now - lastHB) < 60000; // Online if heartbeat within 60 seconds
  });
  
  const playingScreens = screens.filter(s => s.player_active);
  const offlineScreens = screens.filter(s => {
    if (!s.last_heartbeat) return true;
    const lastHB = new Date(s.last_heartbeat);
    const now = new Date();
    return (now - lastHB) >= 60000;
  });
  const registeredDevices = screens.filter(s => s.hardware_id);

  // Filter screens
  const filteredScreens = screens.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.device_id?.toLowerCase().includes(search.toLowerCase()) ||
      s.hardware_id?.toLowerCase().includes(search.toLowerCase());
    
    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "online") {
      if (!s.last_heartbeat) return false;
      const lastHB = new Date(s.last_heartbeat);
      return matchesSearch && (new Date() - lastHB) < 60000;
    }
    if (statusFilter === "offline") {
      if (!s.last_heartbeat) return matchesSearch;
      const lastHB = new Date(s.last_heartbeat);
      return matchesSearch && (new Date() - lastHB) >= 60000;
    }
    if (statusFilter === "playing") return matchesSearch && s.player_active;
    return matchesSearch;
  });

  const getScreenStatus = (screen) => {
    if (!screen.last_heartbeat) return "offline";
    const lastHB = new Date(screen.last_heartbeat);
    const diff = new Date() - lastHB;
    if (diff < 60000) return screen.player_active ? "playing" : "online";
    return "offline";
  };

  const getVenueName = (venueId) => {
    const venue = venues.find(v => v.id === venueId);
    return venue?.name || "Unknown";
  };

  const sendCommand = async (screenId, command) => {
    setActionLoading(screenId + command);
    try {
      await base44.entities.Screen.update(screenId, { player_command: command });
      toast.success(`Command "${command}" sent successfully`);
      refetch();
    } catch (error) {
      toast.error("Failed to send command");
    }
    setActionLoading(null);
  };

  const formatUptime = (seconds) => {
    if (!seconds) return "N/A";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 24) {
      const days = Math.floor(hrs / 24);
      return `${days}d ${hrs % 24}h`;
    }
    return `${hrs}h ${mins}m`;
  };

  const getNetworkBadge = (strength) => {
    const colors = {
      excellent: "bg-emerald-100 text-emerald-700",
      good: "bg-green-100 text-green-700",
      fair: "bg-amber-100 text-amber-700",
      poor: "bg-rose-100 text-rose-700"
    };
    return colors[strength] || "bg-slate-100 text-slate-700";
  };

  if (!user) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <MonitorPlay className="w-5 h-5 text-white" />
            </div>
            B.One Player Management
          </h1>
          <p className="text-slate-500 mt-1">Real-time monitoring and control of all B.One devices</p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                <Wifi className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-emerald-700">Online</p>
                <p className="text-3xl font-bold text-emerald-800">{onlineScreens.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-violet-500 rounded-xl flex items-center justify-center">
                <Play className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-violet-700">Playing</p>
                <p className="text-3xl font-bold text-violet-800">{playingScreens.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center">
                <WifiOff className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-rose-700">Offline</p>
                <p className="text-3xl font-bold text-rose-800">{offlineScreens.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-700">Registered</p>
                <p className="text-3xl font-bold text-blue-800">{registeredDevices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name, device ID, or hardware ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">All ({screens.length})</TabsTrigger>
            <TabsTrigger value="online">Online ({onlineScreens.length})</TabsTrigger>
            <TabsTrigger value="playing">Playing ({playingScreens.length})</TabsTrigger>
            <TabsTrigger value="offline">Offline ({offlineScreens.length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Screens Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-500">Loading B.One devices...</p>
        </div>
      ) : filteredScreens.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MonitorPlay className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2">No devices found</h3>
            <p className="text-slate-500">No B.One players match your search criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredScreens.map((screen) => {
            const status = getScreenStatus(screen);
            const isOnline = status === "online" || status === "playing";
            
            return (
              <Card 
                key={screen.id} 
                className={`relative overflow-hidden transition-all hover:shadow-lg ${
                  status === "playing" ? "ring-2 ring-violet-500" : ""
                }`}
              >
                {/* Status Indicator */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  status === "playing" ? "bg-violet-500" :
                  status === "online" ? "bg-emerald-500" : "bg-slate-300"
                }`} />

                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        status === "playing" ? "bg-violet-100" :
                        status === "online" ? "bg-emerald-100" : "bg-slate-100"
                      }`}>
                        <MonitorPlay className={`w-5 h-5 ${
                          status === "playing" ? "text-violet-600" :
                          status === "online" ? "text-emerald-600" : "text-slate-400"
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{screen.name}</h3>
                        <p className="text-xs text-slate-500">{screen.device_id || "No ID"}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelectedScreen(screen); setShowDetails(true); }}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => sendCommand(screen.id, "refresh")}
                          disabled={!isOnline}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Force Content Refresh
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => sendCommand(screen.id, screen.player_active ? "pause" : "resume")}
                          disabled={!isOnline}
                        >
                          {screen.player_active ? (
                            <><Pause className="w-4 h-4 mr-2" />Pause Playback</>
                          ) : (
                            <><Play className="w-4 h-4 mr-2" />Resume Playback</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => sendCommand(screen.id, "skip")}
                          disabled={!isOnline}
                        >
                          <SkipForward className="w-4 h-4 mr-2" />
                          Skip Current Ad
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => sendCommand(screen.id, "restart")}
                          disabled={!isOnline}
                          className="text-amber-600"
                        >
                          <Power className="w-4 h-4 mr-2" />
                          Remote Restart
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={`${
                      status === "playing" ? "bg-violet-100 text-violet-700" :
                      status === "online" ? "bg-emerald-100 text-emerald-700" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {status === "playing" && <Play className="w-3 h-3 mr-1" />}
                      {status === "online" && <Wifi className="w-3 h-3 mr-1" />}
                      {status === "offline" && <WifiOff className="w-3 h-3 mr-1" />}
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                    {screen.hardware_id && (
                      <Badge variant="outline" className="text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Registered
                      </Badge>
                    )}
                    {screen.network_strength && (
                      <Badge className={getNetworkBadge(screen.network_strength)}>
                        <Signal className="w-3 h-3 mr-1" />
                        {screen.network_strength}
                      </Badge>
                    )}
                  </div>

                  {/* Current Content */}
                  {screen.current_content_name && isOnline && (
                    <div className="bg-slate-50 rounded-lg p-2 mb-3">
                      <p className="text-xs text-slate-500">Now Playing</p>
                      <p className="text-sm font-medium text-slate-900 truncate">{screen.current_content_name}</p>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-xs text-slate-500">Uptime</p>
                      <p className="text-sm font-semibold">{formatUptime(screen.uptime_seconds)}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-xs text-slate-500">Ads Played</p>
                      <p className="text-sm font-semibold">{screen.ads_played_count || 0}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2">
                      <p className="text-xs text-slate-500">Last Seen</p>
                      <p className="text-sm font-semibold">
                        {screen.last_heartbeat 
                          ? formatDistanceToNow(new Date(screen.last_heartbeat), { addSuffix: false })
                          : "Never"
                        }
                      </p>
                    </div>
                  </div>

                  {/* Hardware ID */}
                  {screen.hardware_id && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        Hardware ID
                      </p>
                      <p className="text-xs font-mono text-slate-600 truncate">{screen.hardware_id}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MonitorPlay className="w-5 h-5" />
              {selectedScreen?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedScreen && (
            <div className="space-y-6">
              {/* Live Preview */}
              <div className="border rounded-xl overflow-hidden bg-black">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getScreenStatus(selectedScreen) === "playing" ? "bg-emerald-500 animate-pulse" : "bg-slate-500"}`} />
                    <span className="text-xs text-slate-400">Live Preview</span>
                  </div>
                  {getScreenStatus(selectedScreen) === "playing" && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
                      <Play className="w-3 h-3 mr-1" />
                      Playing
                    </Badge>
                  )}
                </div>
                <div className="aspect-video bg-slate-950 flex items-center justify-center relative">
                  {getScreenStatus(selectedScreen) === "offline" ? (
                    <div className="text-center">
                      <WifiOff className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm">Screen Offline</p>
                    </div>
                  ) : (
                    <ScreenPreviewContent screen={selectedScreen} bookings={bookings} />
                  )}
                </div>
              </div>

              {/* Status Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {getScreenStatus(selectedScreen) === "playing" ? (
                      <Badge className="bg-violet-100 text-violet-700">
                        <Play className="w-3 h-3 mr-1" />Playing
                      </Badge>
                    ) : getScreenStatus(selectedScreen) === "online" ? (
                      <Badge className="bg-emerald-100 text-emerald-700">
                        <Wifi className="w-3 h-3 mr-1" />Online
                      </Badge>
                    ) : (
                      <Badge className="bg-slate-100 text-slate-600">
                        <WifiOff className="w-3 h-3 mr-1" />Offline
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">Venue</p>
                  <p className="font-medium">{getVenueName(selectedScreen.venue_id)}</p>
                </div>
              </div>

              {/* Device Info */}
              <div className="border rounded-xl p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  Device Information
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500">Device ID</p>
                    <p className="font-mono">{selectedScreen.device_id || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Device Type</p>
                    <p>{selectedScreen.device_type || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Hardware ID</p>
                    <p className="font-mono text-xs">{selectedScreen.hardware_id || "Not registered"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Player Version</p>
                    <p>{selectedScreen.player_version || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="border rounded-xl p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Performance Analytics
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-violet-50 rounded-lg">
                    <p className="text-2xl font-bold text-violet-600">{formatUptime(selectedScreen.uptime_seconds)}</p>
                    <p className="text-xs text-slate-500">Total Uptime</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <p className="text-2xl font-bold text-emerald-600">{selectedScreen.ads_played_count || 0}</p>
                    <p className="text-xs text-slate-500">Ads Played</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedScreen.total_playtime ? Math.round(selectedScreen.total_playtime / 60) : 0}
                    </p>
                    <p className="text-xs text-slate-500">Minutes Played</p>
                  </div>
                </div>
              </div>

              {/* Session Info */}
              <div className="border rounded-xl p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Session Information
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500">Session ID</p>
                    <p className="font-mono text-xs">{selectedScreen.current_session_id || "No active session"}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Session Started</p>
                    <p>{selectedScreen.session_started_at 
                      ? format(new Date(selectedScreen.session_started_at), "PPp")
                      : "N/A"
                    }</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Last Heartbeat</p>
                    <p>{selectedScreen.last_heartbeat 
                      ? format(new Date(selectedScreen.last_heartbeat), "PPp")
                      : "Never"
                    }</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Last Content Refresh</p>
                    <p>{selectedScreen.last_content_refresh 
                      ? format(new Date(selectedScreen.last_content_refresh), "PPp")
                      : "N/A"
                    }</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Close
            </Button>
            {selectedScreen && getScreenStatus(selectedScreen) !== "offline" && (
              <Button 
                onClick={() => sendCommand(selectedScreen.id, "refresh")}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Force Refresh
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}