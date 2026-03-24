import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft, Wifi, WifiOff, Play, Pause, RotateCcw, RefreshCw,
  MonitorPlay, Building2, Activity, Square, Eye
} from "lucide-react";

function isOnline(screen) {
  return screen.last_heartbeat && (new Date() - new Date(screen.last_heartbeat)) < 60000;
}

export default function ScreensOverview() {
  const navigate = useNavigate();
  const [screens, setScreens] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commandLoading, setCommandLoading] = useState(null);
  const pollRef = useRef(null);

  useEffect(() => {
    loadData();
    pollRef.current = setInterval(loadData, 5000);
    return () => clearInterval(pollRef.current);
  }, []);

  const loadData = async () => {
    const u = await base44.auth.me();
    const [s, v] = await Promise.all([
      base44.entities.Screen.filter({ owner_email: u.email }),
      base44.entities.Venue.filter({ owner_email: u.email }),
    ]);
    setScreens(s);
    setVenues(v);
    setLoading(false);
  };

  const sendCommand = async (screenIds, command, label) => {
    setCommandLoading(command + screenIds.join(","));
    await Promise.all(screenIds.map(id => base44.entities.Screen.update(id, { player_command: command })));
    toast.success(`"${label}" sent to ${screenIds.length} screen(s)`);
    setCommandLoading(null);
  };

  const sendBulkForVenue = async (venueId, command, label) => {
    const ids = screens.filter(s => s.venue_id === venueId).map(s => s.id);
    if (!ids.length) return;
    await sendCommand(ids, command, label);
  };

  const sendGlobalBulk = async (command, label) => {
    const ids = screens.map(s => s.id);
    await sendCommand(ids, command, label);
  };

  const venueMap = Object.fromEntries(venues.map(v => [v.id, v]));
  const grouped = venues.map(v => ({
    venue: v,
    screens: screens.filter(s => s.venue_id === v.id),
  }));
  const unassigned = screens.filter(s => !s.venue_id);

  const onlineCount = screens.filter(isOnline).length;
  const playingCount = screens.filter(s => s.player_active).length;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-900">All Screens Overview</h1>
            <p className="text-xs text-slate-500">{onlineCount}/{screens.length} online · {playingCount} playing · auto-refreshes every 5s</p>
          </div>
          <Button size="sm" variant="ghost" onClick={loadData} className="text-slate-500"><RefreshCw className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Global Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Screens", value: screens.length, color: "text-slate-700", bg: "bg-white" },
            { label: "Online Now", value: onlineCount, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Currently Playing", value: playingCount, color: "text-violet-600", bg: "bg-violet-50" },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl border border-slate-200 p-4 text-center shadow-sm`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Global Bulk Controls */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Global Controls — All Screens</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => sendGlobalBulk("resume", "Play All")} disabled={!!commandLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Play className="w-3.5 h-3.5 mr-1.5" /> Play All
            </Button>
            <Button size="sm" onClick={() => sendGlobalBulk("pause", "Pause All")} disabled={!!commandLoading} variant="outline" className="border-amber-400 text-amber-600 hover:bg-amber-50">
              <Pause className="w-3.5 h-3.5 mr-1.5" /> Pause All
            </Button>
            <Button size="sm" onClick={() => sendGlobalBulk("restart_playlist", "Restart All")} disabled={!!commandLoading} variant="outline" className="border-blue-400 text-blue-600 hover:bg-blue-50">
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Restart All
            </Button>
            <Button size="sm" onClick={() => sendGlobalBulk("stop_playback", "Stop All")} disabled={!!commandLoading} variant="outline" className="border-red-400 text-red-500 hover:bg-red-50">
              <Square className="w-3.5 h-3.5 mr-1.5" /> Stop All
            </Button>
          </div>
        </div>

        {/* Per-Venue Groups */}
        {grouped.map(({ venue, screens: vs }) => (
          <div key={venue.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Venue Header */}
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-violet-500" />
                <span className="font-semibold text-slate-800 text-sm">{venue.name}</span>
                <span className="text-xs text-slate-400">{venue.city}</span>
                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{vs.length} screen(s)</span>
              </div>
              <div className="flex gap-1.5">
                <Button size="sm" variant="ghost" onClick={() => sendBulkForVenue(venue.id, "resume", "Play All")} disabled={!!commandLoading} className="text-emerald-600 hover:bg-emerald-50 text-xs h-7 px-2">
                  <Play className="w-3 h-3 mr-1" /> Play
                </Button>
                <Button size="sm" variant="ghost" onClick={() => sendBulkForVenue(venue.id, "pause", "Pause All")} disabled={!!commandLoading} className="text-amber-600 hover:bg-amber-50 text-xs h-7 px-2">
                  <Pause className="w-3 h-3 mr-1" /> Pause
                </Button>
                <Button size="sm" variant="ghost" onClick={() => sendBulkForVenue(venue.id, "restart_playlist", "Restart All")} disabled={!!commandLoading} className="text-blue-600 hover:bg-blue-50 text-xs h-7 px-2">
                  <RotateCcw className="w-3 h-3 mr-1" /> Restart
                </Button>
              </div>
            </div>

            {/* Screens */}
            <div className="divide-y divide-slate-100">
              {vs.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-4">No screens in this venue</p>
              ) : vs.map(screen => {
                const online = isOnline(screen);
                return (
                  <div key={screen.id} className="px-4 py-3 flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${online ? "bg-emerald-400" : "bg-slate-300"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{screen.name}</p>
                      <p className="text-xs text-slate-400 truncate">
                        {online
                          ? screen.player_active
                            ? <span className="text-emerald-600">▶ Playing: {screen.current_content_name || "content"}</span>
                            : <span className="text-amber-500">⏸ Paused</span>
                          : screen.last_heartbeat
                            ? `Last seen: ${new Date(screen.last_heartbeat).toLocaleTimeString()}`
                            : "Never connected"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {online
                        ? <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">Online</Badge>
                        : <Badge className="bg-slate-100 text-slate-500 border-0 text-xs">Offline</Badge>}
                      <Button size="icon" variant="ghost" onClick={() => navigate(`/LiveScreenMonitorPage?id=${screen.id}`)} className="w-7 h-7 text-slate-400 hover:text-violet-600">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => sendCommand([screen.id], "resume", "Play")} disabled={!!commandLoading} className="w-7 h-7 text-slate-400 hover:text-emerald-600">
                        <Play className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => sendCommand([screen.id], "pause", "Pause")} disabled={!!commandLoading} className="w-7 h-7 text-slate-400 hover:text-amber-600">
                        <Pause className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Unassigned screens */}
        {unassigned.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <span className="font-semibold text-slate-600 text-sm">Unassigned Screens</span>
            </div>
            <div className="divide-y divide-slate-100">
              {unassigned.map(screen => {
                const online = isOnline(screen);
                return (
                  <div key={screen.id} className="px-4 py-3 flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${online ? "bg-emerald-400" : "bg-slate-300"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{screen.name}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/LiveScreenMonitorPage?id=${screen.id}`)} className="text-violet-600 text-xs">
                      <Eye className="w-3.5 h-3.5 mr-1" /> Monitor
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}