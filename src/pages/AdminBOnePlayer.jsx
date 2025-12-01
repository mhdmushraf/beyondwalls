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
  Shield,
  Bell,
  Download,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
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

const LATEST_PLAYER_VERSION = "2.1.0";

export default function AdminBOnePlayer() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [activeTab, setActiveTab] = useState("devices");
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [alertSettings, setAlertSettings] = useState({
    poor_network_threshold_minutes: 30,
    offline_threshold_minutes: 60,
    email_notifications: true,
    in_app_notifications: true,
    notification_emails: ["info@beyondwalls.ae"]
  });

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

  const { data: networkAlerts = [], refetch: refetchAlerts } = useQuery({
    queryKey: ["network-alerts"],
    queryFn: () => base44.entities.NetworkAlert.filter({ status: "active" }, "-created_date"),
    refetchInterval: 30000
  });

  const { data: contentAnalytics = [] } = useQuery({
    queryKey: ["content-analytics"],
    queryFn: () => base44.entities.ContentAnalytics.list("-impressions", 100)
  });

  const { data: savedAlertSettings = [] } = useQuery({
    queryKey: ["alert-settings"],
    queryFn: () => base44.entities.AlertSettings.filter({ setting_type: "global" })
  });

  // Load saved settings
  useEffect(() => {
    if (savedAlertSettings.length > 0) {
      const settings = savedAlertSettings[0];
      setAlertSettings({
        poor_network_threshold_minutes: settings.poor_network_threshold_minutes || 30,
        offline_threshold_minutes: settings.offline_threshold_minutes || 60,
        email_notifications: settings.email_notifications ?? true,
        in_app_notifications: settings.in_app_notifications ?? true,
        notification_emails: settings.notification_emails || ["info@beyondwalls.ae"]
      });
    }
  }, [savedAlertSettings]);

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
  const poorNetworkScreens = screens.filter(s => s.network_strength === "poor");
  const outdatedVersionScreens = screens.filter(s => s.player_version && s.player_version !== LATEST_PLAYER_VERSION);

  // Check and create alerts for poor network
  useEffect(() => {
    const checkNetworkAlerts = async () => {
      for (const screen of poorNetworkScreens) {
        const existingAlert = networkAlerts.find(a => a.screen_id === screen.id && a.alert_type === "poor_network" && a.status === "active");
        if (!existingAlert) {
          await base44.entities.NetworkAlert.create({
            screen_id: screen.id,
            screen_name: screen.name,
            alert_type: "poor_network",
            severity: "warning",
            message: `Network strength dropped to poor on ${screen.name}`,
            network_strength: screen.network_strength,
            status: "active"
          });
          refetchAlerts();
        }
      }
    };
    if (poorNetworkScreens.length > 0) {
      checkNetworkAlerts();
    }
  }, [poorNetworkScreens.length]);

  const acknowledgeAlert = async (alertId) => {
    try {
      await base44.entities.NetworkAlert.update(alertId, { 
        status: "acknowledged",
        acknowledged_by: user?.email
      });
      toast.success("Alert acknowledged");
      refetchAlerts();
    } catch (error) {
      toast.error("Failed to acknowledge alert");
    }
  };

  const resolveAlert = async (alertId) => {
    try {
      await base44.entities.NetworkAlert.update(alertId, { 
        status: "resolved",
        resolved_at: new Date().toISOString()
      });
      toast.success("Alert resolved");
      refetchAlerts();
    } catch (error) {
      toast.error("Failed to resolve alert");
    }
  };

  const isVersionOutdated = (version) => {
    if (!version) return false;
    return version !== LATEST_PLAYER_VERSION;
  };

  // Bulk update command
  const sendBulkCommand = async (command, screenIds = null) => {
    const targetIds = screenIds || selectedDevices;
    if (targetIds.length === 0) {
      toast.error("No devices selected");
      return;
    }
    
    setBulkActionLoading(true);
    try {
      for (const screenId of targetIds) {
        await base44.entities.Screen.update(screenId, { player_command: command });
      }
      toast.success(`Command "${command}" sent to ${targetIds.length} device(s)`);
      setSelectedDevices([]);
      refetch();
    } catch (error) {
      toast.error("Failed to send command");
    }
    setBulkActionLoading(false);
  };

  // Remote update all outdated devices
  const updateAllOutdatedDevices = async () => {
    const outdatedIds = outdatedVersionScreens.map(s => s.id);
    if (outdatedIds.length === 0) {
      toast.info("All devices are up to date");
      return;
    }
    await sendBulkCommand("restart", outdatedIds);
    toast.success(`Update triggered for ${outdatedIds.length} device(s). They will update to v${LATEST_PLAYER_VERSION} on restart.`);
  };

  // Refresh content on all online devices
  const refreshAllContent = async () => {
    const onlineIds = onlineScreens.map(s => s.id);
    if (onlineIds.length === 0) {
      toast.error("No online devices");
      return;
    }
    await sendBulkCommand("refresh", onlineIds);
  };

  // Save alert settings
  const saveAlertSettings = async () => {
    try {
      if (savedAlertSettings.length > 0) {
        await base44.entities.AlertSettings.update(savedAlertSettings[0].id, {
          ...alertSettings,
          setting_type: "global"
        });
      } else {
        await base44.entities.AlertSettings.create({
          ...alertSettings,
          setting_type: "global",
          created_by: user?.email
        });
      }
      toast.success("Alert settings saved");
      queryClient.invalidateQueries({ queryKey: ["alert-settings"] });
      setShowSettingsDialog(false);
    } catch (error) {
      toast.error("Failed to save settings");
    }
  };

  // Check for extended alerts and create in-app notifications
  useEffect(() => {
    const checkExtendedAlerts = async () => {
      if (!alertSettings.in_app_notifications) return;
      
      const now = new Date();
      
      // Check offline devices
      for (const screen of screens) {
        if (!screen.last_heartbeat) continue;
        const lastHB = new Date(screen.last_heartbeat);
        const minutesOffline = (now - lastHB) / 60000;
        
        if (minutesOffline >= alertSettings.offline_threshold_minutes) {
          // Check if we already have an active alert for this
          const existingAlert = networkAlerts.find(
            a => a.screen_id === screen.id && a.alert_type === "offline" && a.status === "active"
          );
          
          if (!existingAlert) {
            // Create alert
            await base44.entities.NetworkAlert.create({
              screen_id: screen.id,
              screen_name: screen.name,
              alert_type: "offline",
              severity: "critical",
              message: `Device has been offline for ${Math.round(minutesOffline)} minutes`,
              duration_minutes: Math.round(minutesOffline),
              status: "active"
            });
            
            // Create admin notification for in-app alerts
            if (alertSettings.in_app_notifications) {
              await base44.entities.AdminNotification.create({
                type: "new_screen",
                title: `Device Offline Alert: ${screen.name}`,
                message: `Device ${screen.name} has been offline for ${Math.round(minutesOffline)} minutes. Last seen: ${format(lastHB, "PPp")}`,
                reference_id: screen.id,
                reference_type: "Screen",
                status: "unread"
              });
            }
            
            refetchAlerts();
          }
        }
      }
    };
    
    if (screens.length > 0 && user) {
      checkExtendedAlerts();
    }
  }, [screens, alertSettings, user]);

  const toggleDeviceSelection = (screenId) => {
    setSelectedDevices(prev => 
      prev.includes(screenId) 
        ? prev.filter(id => id !== screenId)
        : [...prev, screenId]
    );
  };

  const selectAllDevices = () => {
    if (selectedDevices.length === filteredScreens.length) {
      setSelectedDevices([]);
    } else {
      setSelectedDevices(filteredScreens.map(s => s.id));
    }
  };

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
        <div className="flex gap-2">
          <Button onClick={() => setShowSettingsDialog(true)} variant="outline">
            <Bell className="w-4 h-4 mr-2" />
            Alert Settings
          </Button>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <Wifi className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-emerald-700">Online</p>
                <p className="text-2xl font-bold text-emerald-800">{onlineScreens.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-500 rounded-xl flex items-center justify-center">
                <Play className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-violet-700">Playing</p>
                <p className="text-2xl font-bold text-violet-800">{playingScreens.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center">
                <WifiOff className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-rose-700">Offline</p>
                <p className="text-2xl font-bold text-rose-800">{offlineScreens.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-blue-700">Registered</p>
                <p className="text-2xl font-bold text-blue-800">{registeredDevices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${poorNetworkScreens.length > 0 ? "from-amber-50 to-amber-100 border-amber-200" : "from-slate-50 to-slate-100 border-slate-200"}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${poorNetworkScreens.length > 0 ? "bg-amber-500" : "bg-slate-400"} rounded-xl flex items-center justify-center`}>
                <Signal className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-xs ${poorNetworkScreens.length > 0 ? "text-amber-700" : "text-slate-600"}`}>Poor Network</p>
                <p className={`text-2xl font-bold ${poorNetworkScreens.length > 0 ? "text-amber-800" : "text-slate-700"}`}>{poorNetworkScreens.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${outdatedVersionScreens.length > 0 ? "from-orange-50 to-orange-100 border-orange-200" : "from-slate-50 to-slate-100 border-slate-200"}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${outdatedVersionScreens.length > 0 ? "bg-orange-500" : "bg-slate-400"} rounded-xl flex items-center justify-center`}>
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className={`text-xs ${outdatedVersionScreens.length > 0 ? "text-orange-700" : "text-slate-600"}`}>Outdated</p>
                <p className={`text-2xl font-bold ${outdatedVersionScreens.length > 0 ? "text-orange-800" : "text-slate-700"}`}>{outdatedVersionScreens.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {networkAlerts.length > 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-amber-800">Active Alerts ({networkAlerts.length})</h3>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {networkAlerts.slice(0, 5).map(alert => (
                <div key={alert.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${alert.severity === "critical" ? "text-rose-500" : "text-amber-500"}`} />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{alert.screen_name}</p>
                      <p className="text-xs text-slate-500">{alert.message}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => acknowledgeAlert(alert.id)} className="h-7 text-xs">
                      Acknowledge
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => resolveAlert(alert.id)} className="h-7 text-xs text-emerald-600">
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="analytics">Content Analytics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts History</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "devices" && (
        <>
      {/* Bulk Actions */}
      {selectedDevices.length > 0 && (
        <Card className="mb-4 bg-violet-50 border-violet-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-violet-600" />
                <span className="font-medium text-violet-800">{selectedDevices.length} device(s) selected</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => sendBulkCommand("refresh")}
                  disabled={bulkActionLoading}
                  className="border-violet-300"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Refresh Content
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => sendBulkCommand("restart")}
                  disabled={bulkActionLoading}
                  className="border-violet-300"
                >
                  <Power className="w-4 h-4 mr-1" />
                  Restart
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setSelectedDevices([])}
                  className="border-violet-300"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={refreshAllContent}
          disabled={onlineScreens.length === 0}
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh All Online ({onlineScreens.length})
        </Button>
        {outdatedVersionScreens.length > 0 && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={updateAllOutdatedDevices}
            className="border-orange-300 text-orange-700"
          >
            <Download className="w-4 h-4 mr-1" />
            Update All Outdated ({outdatedVersionScreens.length})
          </Button>
        )}
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
        <div className="flex items-center gap-4">
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="all">All ({screens.length})</TabsTrigger>
              <TabsTrigger value="online">Online ({onlineScreens.length})</TabsTrigger>
              <TabsTrigger value="playing">Playing ({playingScreens.length})</TabsTrigger>
              <TabsTrigger value="offline">Offline ({offlineScreens.length})</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={selectAllDevices}
          >
            {selectedDevices.length === filteredScreens.length ? "Deselect All" : "Select All"}
          </Button>
        </div>
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
                className={`relative overflow-hidden transition-all hover:shadow-lg cursor-pointer ${
                  status === "playing" ? "ring-2 ring-violet-500" : ""
                } ${selectedDevices.includes(screen.id) ? "ring-2 ring-blue-500 bg-blue-50" : ""}`}
                onClick={() => toggleDeviceSelection(screen.id)}
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
                    {screen.player_version && isVersionOutdated(screen.player_version) && (
                      <Badge className="bg-orange-100 text-orange-700">
                        <Download className="w-3 h-3 mr-1" />
                        v{screen.player_version}
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

                  {/* Hardware ID & Version */}
                  <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2">
                    {screen.hardware_id && (
                      <div>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Cpu className="w-3 h-3" />
                          Hardware ID
                        </p>
                        <p className="text-xs font-mono text-slate-600 truncate">{screen.hardware_id}</p>
                      </div>
                    )}
                    {screen.player_version && (
                      <div>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          Version
                        </p>
                        <p className={`text-xs font-mono ${isVersionOutdated(screen.player_version) ? "text-orange-600" : "text-emerald-600"}`}>
                          v{screen.player_version}
                          {isVersionOutdated(screen.player_version) && " (outdated)"}
                        </p>
                      </div>
                    )}
                  </div>
                  </CardContent>
                  </Card>
                  );
                  })}
                  </div>
                  )}
                  </>
                  )}

                  {/* Content Analytics Tab */}
                  {activeTab === "analytics" && (
                  <Card>
                  <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Content Performance Analytics
                  </CardTitle>
                  </CardHeader>
                  <CardContent>
                  {contentAnalytics.length === 0 ? (
                  <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No analytics data yet</p>
                  <p className="text-sm text-slate-400">Analytics will appear as content plays on screens</p>
                  </div>
                  ) : (
                  <div className="overflow-x-auto">
                  <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left p-3 font-medium text-slate-600">Content</th>
                      <th className="text-left p-3 font-medium text-slate-600">Screen</th>
                      <th className="text-center p-3 font-medium text-slate-600">Impressions</th>
                      <th className="text-center p-3 font-medium text-slate-600">Completions</th>
                      <th className="text-center p-3 font-medium text-slate-600">Completion Rate</th>
                      <th className="text-center p-3 font-medium text-slate-600">Avg Watch Time</th>
                      <th className="text-center p-3 font-medium text-slate-600">Skips</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contentAnalytics.map((analytics) => {
                      const screen = screens.find(s => s.id === analytics.screen_id);
                      return (
                        <tr key={analytics.id} className="border-b hover:bg-slate-50">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              {analytics.creative_url && (
                                <img src={analytics.creative_url} className="w-10 h-10 rounded object-cover" alt="" />
                              )}
                              <div>
                                <p className="font-medium text-slate-900">{analytics.content_name || "Unknown"}</p>
                                <Badge variant="outline" className="text-xs">
                                  {analytics.content_type}
                                </Badge>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-slate-600">{screen?.name || "Unknown"}</td>
                          <td className="p-3 text-center font-semibold">{analytics.impressions?.toLocaleString() || 0}</td>
                          <td className="p-3 text-center">{analytics.completions?.toLocaleString() || 0}</td>
                          <td className="p-3 text-center">
                            <Badge className={analytics.completion_rate >= 80 ? "bg-emerald-100 text-emerald-700" : analytics.completion_rate >= 50 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}>
                              {analytics.completion_rate?.toFixed(1) || 0}%
                            </Badge>
                          </td>
                          <td className="p-3 text-center">{analytics.avg_watch_time?.toFixed(1) || 0}s</td>
                          <td className="p-3 text-center text-slate-500">{analytics.skips || 0}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  </table>
                  </div>
                  )}
                  </CardContent>
                  </Card>
                  )}

                  {/* Alerts History Tab */}
                  {activeTab === "alerts" && (
                  <Card>
                  <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Network & Version Alerts History
                  </CardTitle>
                  </CardHeader>
                  <CardContent>
                  <NetworkAlertsTable alerts={networkAlerts} onAcknowledge={acknowledgeAlert} onResolve={resolveAlert} />
                  </CardContent>
                  </Card>
                  )}

      {/* Network Alerts Table Component */}
      {(() => {
        const NetworkAlertsTable = ({ alerts, onAcknowledge, onResolve }) => {
          const allAlerts = alerts || [];
          if (allAlerts.length === 0) {
            return (
              <div className="text-center py-12">
                <CheckCircle2 className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                <p className="text-slate-500">No alerts to display</p>
              </div>
            );
          }
          return (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="text-left p-3 font-medium text-slate-600">Screen</th>
                    <th className="text-left p-3 font-medium text-slate-600">Alert Type</th>
                    <th className="text-left p-3 font-medium text-slate-600">Message</th>
                    <th className="text-center p-3 font-medium text-slate-600">Severity</th>
                    <th className="text-center p-3 font-medium text-slate-600">Status</th>
                    <th className="text-left p-3 font-medium text-slate-600">Created</th>
                    <th className="text-right p-3 font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allAlerts.map((alert) => (
                    <tr key={alert.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-medium">{alert.screen_name}</td>
                      <td className="p-3">
                        <Badge variant="outline">
                          {alert.alert_type === "poor_network" && <Signal className="w-3 h-3 mr-1" />}
                          {alert.alert_type === "offline" && <WifiOff className="w-3 h-3 mr-1" />}
                          {alert.alert_type === "version_outdated" && <Download className="w-3 h-3 mr-1" />}
                          {alert.alert_type?.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="p-3 text-slate-600 max-w-xs truncate">{alert.message}</td>
                      <td className="p-3 text-center">
                        <Badge className={alert.severity === "critical" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}>
                          {alert.severity}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge className={
                          alert.status === "active" ? "bg-rose-100 text-rose-700" :
                          alert.status === "acknowledged" ? "bg-amber-100 text-amber-700" :
                          "bg-emerald-100 text-emerald-700"
                        }>
                          {alert.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-slate-500">
                        {alert.created_date ? formatDistanceToNow(new Date(alert.created_date), { addSuffix: true }) : "Unknown"}
                      </td>
                      <td className="p-3 text-right">
                        {alert.status === "active" && (
                          <div className="flex gap-1 justify-end">
                            <Button size="sm" variant="ghost" onClick={() => onAcknowledge(alert.id)} className="h-7 text-xs">
                              Acknowledge
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => onResolve(alert.id)} className="h-7 text-xs text-emerald-600">
                              Resolve
                            </Button>
                          </div>
                        )}
                        {alert.status === "acknowledged" && (
                          <Button size="sm" variant="ghost" onClick={() => onResolve(alert.id)} className="h-7 text-xs text-emerald-600">
                            Resolve
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        };
        return null;
      })()}

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
                    <p className={isVersionOutdated(selectedScreen.player_version) ? "text-orange-600" : ""}>
                      {selectedScreen.player_version || "N/A"}
                      {selectedScreen.player_version && isVersionOutdated(selectedScreen.player_version) && (
                        <Badge className="ml-2 bg-orange-100 text-orange-700 text-xs">
                          Update Available (v{LATEST_PLAYER_VERSION})
                        </Badge>
                      )}
                    </p>
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

          {/* Alert Settings Dialog */}
          <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Alert Settings
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Poor Network Alert Threshold</label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  value={alertSettings.poor_network_threshold_minutes}
                  onChange={(e) => setAlertSettings({...alertSettings, poor_network_threshold_minutes: parseInt(e.target.value) || 30})}
                  className="w-24"
                />
                <span className="text-sm text-slate-500">minutes of poor network</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Offline Alert Threshold</label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  value={alertSettings.offline_threshold_minutes}
                  onChange={(e) => setAlertSettings({...alertSettings, offline_threshold_minutes: parseInt(e.target.value) || 60})}
                  className="w-24"
                />
                <span className="text-sm text-slate-500">minutes offline</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <label className="text-sm font-medium mb-2 block">Notification Methods</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alertSettings.in_app_notifications}
                    onChange={(e) => setAlertSettings({...alertSettings, in_app_notifications: e.target.checked})}
                    className="rounded"
                  />
                  <span className="text-sm">In-app notifications (Admin Dashboard)</span>
                </label>
              </div>
              <p className="text-xs text-slate-500 mt-2">Alerts will appear in the admin notification center</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveAlertSettings} className="bg-violet-600 hover:bg-violet-700">
              Save Settings
            </Button>
          </DialogFooter>
          </DialogContent>
          </Dialog>
          </div>
          );
          }