import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Wifi, WifiOff, Pause, Play, Square, RotateCcw, Activity, Filter } from "lucide-react";

const EVENT_CONFIG = {
  online:     { icon: Wifi,      color: "text-emerald-400", bg: "bg-emerald-500/20 border-emerald-500/30", label: "Came Online" },
  offline:    { icon: WifiOff,   color: "text-red-400",     bg: "bg-red-500/20 border-red-500/30",         label: "Went Offline" },
  paused:     { icon: Pause,     color: "text-amber-400",   bg: "bg-amber-500/20 border-amber-500/30",     label: "Paused" },
  resumed:    { icon: Play,      color: "text-blue-400",    bg: "bg-blue-500/20 border-blue-500/30",       label: "Resumed" },
  stopped:    { icon: Square,    color: "text-red-400",     bg: "bg-red-500/20 border-red-500/30",         label: "Stopped" },
  restarted:  { icon: RotateCcw, color: "text-violet-400",  bg: "bg-violet-500/20 border-violet-500/30",   label: "Restarted" },
};

const FILTERS = [
  { label: "Today",    days: 0 },
  { label: "7 Days",   days: 7 },
  { label: "30 Days",  days: 30 },
  { label: "All Time", days: null },
];

function groupByDate(logs) {
  const groups = {};
  logs.forEach(log => {
    const date = new Date(log.timestamp).toLocaleDateString("en-AE", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    if (!groups[date]) groups[date] = [];
    groups[date].push(log);
  });
  return groups;
}

function calcUptime(logs) {
  // Calculate uptime from online/offline pairs
  let uptime = 0;
  let onlineAt = null;
  const sorted = [...logs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  for (const log of sorted) {
    if (log.event_type === "online") onlineAt = new Date(log.timestamp);
    else if (log.event_type === "offline" && onlineAt) {
      uptime += new Date(log.timestamp) - onlineAt;
      onlineAt = null;
    }
  }
  if (onlineAt) uptime += Date.now() - onlineAt;
  const hours = Math.floor(uptime / 3600000);
  const mins = Math.floor((uptime % 3600000) / 60000);
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

export default function ScreenActivityHistory({ screenId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(0); // index of FILTERS

  useEffect(() => {
    if (!screenId) return;
    base44.entities.ScreenActivityLog.filter({ screen_id: screenId })
      .then(data => {
        const sorted = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setLogs(sorted);
      })
      .finally(() => setLoading(false));
  }, [screenId]);

  const filteredLogs = logs.filter(log => {
    const days = FILTERS[filter].days;
    if (days === null) return true;
    if (days === 0) {
      const today = new Date().toDateString();
      return new Date(log.timestamp).toDateString() === today;
    }
    const cutoff = new Date(Date.now() - days * 86400000);
    return new Date(log.timestamp) >= cutoff;
  });

  const grouped = groupByDate(filteredLogs);
  const onlineCount = filteredLogs.filter(l => l.event_type === "online").length;
  const offlineCount = filteredLogs.filter(l => l.event_type === "offline").length;

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-semibold text-white">Player Activity History</span>
        </div>
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          {FILTERS.map((f, i) => (
            <button
              key={f.label}
              onClick={() => setFilter(i)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                filter === i
                  ? "bg-violet-600 text-white"
                  : "bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      {filteredLogs.length > 0 && (
        <div className="px-5 py-3 border-b border-slate-700 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-400">{onlineCount}</p>
            <p className="text-xs text-slate-400">Times Online</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-red-400">{offlineCount}</p>
            <p className="text-xs text-slate-400">Times Offline</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-violet-400">{calcUptime(filteredLogs)}</p>
            <p className="text-xs text-slate-400">Uptime</p>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="p-4 max-h-[500px] overflow-y-auto space-y-5">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && filteredLogs.length === 0 && (
          <div className="text-center py-10 text-slate-500">
            <Activity className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No activity recorded for this period</p>
            <p className="text-xs mt-1 text-slate-600">Events are logged automatically when the screen player connects or changes state.</p>
          </div>
        )}

        {!loading && Object.entries(grouped).map(([date, dateLogs]) => (
          <div key={date}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{date}</p>
            <div className="relative border-l-2 border-slate-700 ml-3 space-y-0">
              {dateLogs.map((log, i) => {
                const cfg = EVENT_CONFIG[log.event_type] || EVENT_CONFIG.online;
                const Icon = cfg.icon;
                return (
                  <div key={log.id || i} className="relative flex items-start gap-3 pl-5 pb-4">
                    {/* Dot on timeline */}
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border ${cfg.bg} flex items-center justify-center`}>
                      <Icon className={`w-2 h-2 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</span>
                        {log.session_id && (
                          <span className="text-xs text-slate-600 font-mono truncate max-w-[120px]">{log.session_id}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(log.timestamp).toLocaleTimeString("en-AE", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        {log.player_version && <span className="ml-2 text-slate-600">v{log.player_version}</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}