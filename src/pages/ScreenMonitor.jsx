import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  MonitorPlay, Wifi, WifiOff, Search, RefreshCw, AlertTriangle,
  Activity, CheckCircle2, Clock, Building2, Signal, Bell, BellOff
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const REFRESH_INTERVAL = 30000; // 30 seconds
const OFFLINE_THRESHOLD_MINUTES = 5;

function getScreenStatus(screen) {
  if (screen.approval_status !== "approved") return "unregistered";
  if (!screen.last_heartbeat) return "offline";
  const lastSeen = new Date(screen.last_heartbeat);
  const minutesAgo = (Date.now() - lastSeen.getTime()) / 60000;
  if (minutesAgo > OFFLINE_THRESHOLD_MINUTES) return "offline";
  if (screen.is_online) return "online";
  return "idle";
}

function StatusBadge({ status }) {
  const config = {
    online: { label: "Online", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    offline: { label: "Offline", className: "bg-red-100 text-red-700 border-red-200" },
    idle: { label: "Idle", className: "bg-amber-100 text-amber-700 border-amber-200" },
    unregistered: { label: "Pending", className: "bg-slate-100 text-slate-600 border-slate-200" },
  };
  const c = config[status] || config.unregistered;
  return <Badge className={`border ${c.className}`}>{c.label}</Badge>;
}

function StatusDot({ status }) {
  const colors = {
    online: "bg-emerald-500",
    offline: "bg-red-500",
    idle: "bg-amber-400",
    unregistered: "bg-slate-300",
  };
  const animate = status === "online" ? "animate-pulse" : "";
  return (
    <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors[status] || colors.unregistered} ${animate}`} />
  );
}

export default function ScreenMonitor() {
  const [screens, setScreens] = useState([]);
  const [venues, setVenues] = useState({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const prevScreensRef = useRef([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    const [screenList, venueList] = await Promise.all([
      base44.entities.Screen.list("-last_heartbeat"),
      base44.entities.Venue.list(),
    ]);

    // Build venue map
    const venueMap = {};
    venueList.forEach(v => { venueMap[v.id] = v; });
    setVenues(venueMap);

    // Check for newly offline screens (alert logic)
    if (alertsEnabled && prevScreensRef.current.length > 0) {
      const newAlerts = [];
      screenList.forEach(screen => {
        const prev = prevScreensRef.current.find(s => s.id === screen.id);
        const prevStatus = prev ? getScreenStatus(prev) : null;
        const currStatus = getScreenStatus(screen);
        if (prevStatus === "online" && currStatus === "offline") {
          newAlerts.push({ id: screen.id, name: screen.name, time: new Date() });
          toast({
            title: "⚠️ Screen Went Offline",
            description: `"${screen.name}" is no longer reachable.`,
            variant: "destructive",
          });
        }
      });
      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev].slice(0, 20));
      }
    }

    const approvedScreens = screenList.filter(s => s.approval_status === "approved");
    prevScreensRef.current = approvedScreens;
    setScreens(approvedScreens);
    setLastRefresh(new Date());
    setLoading(false);
    setRefreshing(false);
  };

  const handleManualRefresh = () => loadData(true);

  const dismissAlert = (id) => setAlerts(prev => prev.filter(a => a.id !== id));

  const allStatuses = screens.map(getScreenStatus);
  const stats = {
    total: screens.length,
    online: allStatuses.filter(s => s === "online").length,
    offline: allStatuses.filter(s => s === "offline").length,
    idle: allStatuses.filter(s => s === "idle").length,
  };

  const filtered = screens.filter(s => {
    const venue = venues[s.venue_id];
    const searchLower = search.toLowerCase();
    const matchSearch =
      s.name?.toLowerCase().includes(searchLower) ||
      s.owner_email?.toLowerCase().includes(searchLower) ||
      venue?.name?.toLowerCase().includes(searchLower);
    const status = getScreenStatus(s);
    const matchFilter = filter === "all" || filter === status;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-7 h-7 text-violet-600" />
              Live Screen Monitor
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Auto-refreshes every 30s · {lastRefresh ? `Last updated ${formatDistanceToNow(lastRefresh, { addSuffix: true })}` : "Loading..."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAlertsEnabled(p => !p)}
              className={alertsEnabled ? "border-violet-200 text-violet-700" : ""}
            >
              {alertsEnabled ? <Bell className="w-4 h-4 mr-1" /> : <BellOff className="w-4 h-4 mr-1" />}
              Alerts {alertsEnabled ? "On" : "Off"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleManualRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Screens", value: stats.total, icon: MonitorPlay, color: "text-slate-600", bg: "bg-slate-100" },
            { label: "Online", value: stats.online, icon: Wifi, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Offline", value: stats.offline, icon: WifiOff, color: "text-red-600", bg: "bg-red-50" },
            { label: "Idle", value: stats.idle, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Connectivity Alerts */}
        {alerts.length > 0 && (
          <Card className="border-red-200 bg-red-50 border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="font-semibold text-red-700 text-sm">Connectivity Alerts</span>
                <span className="text-xs text-red-500 ml-auto">{alerts.length} alert{alerts.length > 1 ? "s" : ""}</span>
              </div>
              <div className="space-y-2">
                {alerts.map(a => (
                  <div key={`${a.id}-${a.time}`} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <WifiOff className="w-3.5 h-3.5 text-red-500" />
                      <span className="font-medium text-slate-800">{a.name}</span>
                      <span className="text-slate-400 text-xs">went offline {formatDistanceToNow(a.time, { addSuffix: true })}</span>
                    </div>
                    <button onClick={() => dismissAlert(a.id)} className="text-slate-400 hover:text-slate-600 text-xs px-1">✕</button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input className="pl-9" placeholder="Search by screen, owner, or venue..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { key: "all", label: "All" },
              { key: "online", label: "🟢 Online" },
              { key: "offline", label: "🔴 Offline" },
              { key: "idle", label: "🟡 Idle" },
            ].map(({ key, label }) => (
              <Button key={key} size="sm" variant={filter === key ? "default" : "outline"}
                onClick={() => setFilter(key)}
                className={filter === key ? "bg-violet-600 hover:bg-violet-700" : ""}>
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Screen Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <MonitorPlay className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No screens match your filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(screen => {
              const status = getScreenStatus(screen);
              const venue = venues[screen.venue_id];
              const lastSeen = screen.last_heartbeat ? new Date(screen.last_heartbeat) : null;
              return (
                <Card key={screen.id} onClick={() => navigate(`/LiveScreenMonitorPage?id=${screen.id}`)} className={`cursor-pointer border-0 shadow-sm transition-all hover:shadow-md ${status === "offline" ? "ring-1 ring-red-200" : status === "online" ? "ring-1 ring-emerald-200" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <StatusDot status={status} />
                        <p className="font-semibold text-slate-900 text-sm truncate">{screen.name}</p>
                      </div>
                      <StatusBadge status={status} />
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-500">
                      {venue && (
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{venue.name} · {venue.city}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Signal className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{screen.width_px}×{screen.height_px}px · {screen.slot_duration}s slots</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>
                          {lastSeen
                            ? `Last seen ${formatDistanceToNow(lastSeen, { addSuffix: true })}`
                            : "Never connected"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono">{screen.setup_code}</span>
                      <div className="flex items-center gap-1 text-slate-500">
                        {status === "online" ? (
                          <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Playing</>
                        ) : status === "offline" ? (
                          <><WifiOff className="w-3.5 h-3.5 text-red-400" /> No signal</>
                        ) : status === "idle" ? (
                          <><Clock className="w-3.5 h-3.5 text-amber-400" /> Standby</>
                        ) : (
                          <><MonitorPlay className="w-3.5 h-3.5 text-slate-300" /> Pending</>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}