import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MonitorPlay, DollarSign, Plus, ArrowRight, Wifi, WifiOff, TrendingUp, Library, LayoutGrid, Play, Pause, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function VenueOwnerDashboard() {
  const [user, setUser] = useState(null);
  const [venues, setVenues] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const u = await base44.auth.me();
    setUser(u);
    const v = await base44.entities.Venue.filter({ owner_email: u.email });
    const s = await base44.entities.Screen.filter({ owner_email: u.email });
    setVenues(v);
    setScreens(s);
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" /></div>;

  const activeScreens = screens.filter(s => s.status === "active").length;
  const onlineScreens = screens.filter(s => s.last_heartbeat && (new Date() - new Date(s.last_heartbeat)) < 60000).length;
  const totalEarned = user?.total_earned || 0;

  const sendBulkCommand = async (command, label) => {
    const ids = screens.map(s => s.id);
    await Promise.all(ids.map(id => base44.entities.Screen.update(id, { player_command: command })));
    toast.success(`"${label}" sent to all screens`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Venue Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage your venues and screens</p>
          </div>
          <Link to="/AddVenue">
            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" /> Add Venue
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Venues", value: venues.length, icon: Building2, color: "text-violet-600", bg: "bg-violet-50" },
            { label: "Active Screens", value: activeScreens, icon: MonitorPlay, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Online Now", value: onlineScreens, icon: Wifi, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Total Earned (AED)", value: totalEarned.toLocaleString(), icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50" },
          ].map((stat, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center mb-2`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link to="/ScreensOverview">
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 hover:border-violet-300 hover:shadow-sm transition-all cursor-pointer">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <LayoutGrid className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-800">Screens Overview</p>
                <p className="text-xs text-slate-500">Live status of all screens</p>
              </div>
            </div>
          </Link>
          <Link to="/MyContentLibrary">
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 hover:border-violet-300 hover:shadow-sm transition-all cursor-pointer">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Library className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-800">Content Library</p>
                <p className="text-xs text-slate-500">Manage all media assets</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Bulk Screen Controls */}
        {screens.length > 0 && (
          <Card className="border-0 shadow-sm mb-6">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Quick Controls — All Screens</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => sendBulkCommand("resume", "Play All")} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <Play className="w-3.5 h-3.5 mr-1.5" /> Play All
                </Button>
                <Button size="sm" variant="outline" onClick={() => sendBulkCommand("pause", "Pause All")} className="border-amber-400 text-amber-600 hover:bg-amber-50">
                  <Pause className="w-3.5 h-3.5 mr-1.5" /> Pause All
                </Button>
                <Button size="sm" variant="outline" onClick={() => sendBulkCommand("restart_playlist", "Restart All")} className="border-blue-400 text-blue-600 hover:bg-blue-50">
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Restart All
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Earnings Card */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white mb-6">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Wallet Balance</p>
                <p className="text-3xl font-bold">AED {(user?.wallet_balance || 0).toLocaleString()}</p>
                <p className="text-white/70 text-sm mt-1">Earnings: AED {totalEarned.toLocaleString()}</p>
              </div>
              <Link to="/VenueEarnings">
                <Button size="sm" className="bg-white/20 hover:bg-white/30 border-0 text-white">
                  Request Payout
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* My Venues */}
        <Card className="border-0 shadow-sm mb-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">My Venues</CardTitle>
            <Link to="/MyVenues">
              <Button variant="ghost" size="sm" className="text-violet-600 text-xs">
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {venues.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 mb-3">No venues yet</p>
                <Link to="/AddVenue">
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-700">Add Your First Venue</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {venues.slice(0, 3).map(v => (
                  <Link key={v.id} to={`/VenueDetail?id=${v.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-violet-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-violet-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-900">{v.name}</p>
                          <p className="text-xs text-slate-500 capitalize">{v.venue_type} · {v.city}</p>
                        </div>
                      </div>
                      <Badge className={v.approval_status === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                        {v.approval_status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Screens */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">My Screens</CardTitle>
            <Link to="/MyScreens">
              <Button variant="ghost" size="sm" className="text-violet-600 text-xs">
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {screens.length === 0 ? (
              <div className="text-center py-6">
                <MonitorPlay className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500">No screens yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {screens.slice(0, 3).map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                        <MonitorPlay className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-900">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.width_px}x{s.height_px} · {s.slot_duration}s slots</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {s.is_online ? <Wifi className="w-4 h-4 text-emerald-500" /> : <WifiOff className="w-4 h-4 text-slate-400" />}
                      <Badge className={s.approval_status === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"} >
                        {s.approval_status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}