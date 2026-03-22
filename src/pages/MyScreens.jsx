import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MonitorPlay, Wifi, WifiOff, Code, Image as ImageIcon, Settings } from "lucide-react";

export default function MyScreens() {
  const [screens, setScreens] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(u =>
      base44.entities.Screen.filter({ owner_email: u.email }, "-created_date").then(s => {
        setScreens(s); setLoading(false);
      })
    );
  }, []);

  const statusColor = {
    approved: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    rejected: "bg-red-100 text-red-700",
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">My Screens</h1>
          <Link to="/AddScreen">
            <Button className="bg-violet-600 hover:bg-violet-700">
              <Plus className="w-4 h-4 mr-2" /> Add Screen
            </Button>
          </Link>
        </div>
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {["all", "approved", "pending", "rejected"].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${filter === tab ? "bg-violet-600 text-white shadow" : "bg-white text-slate-600 border border-slate-200 hover:border-violet-300"}`}
            >
              {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {screens.filter(s => filter === "all" || s.approval_status === filter).length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center py-16">
              <MonitorPlay className="w-14 h-14 text-slate-200 mb-4" />
              <p className="text-slate-500 mb-4">No screens registered yet</p>
              <Link to="/AddScreen"><Button className="bg-violet-600 hover:bg-violet-700">Register Screen</Button></Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {screens.filter(s => filter === "all" || s.approval_status === filter).map(s => (
              <Link key={s.id} to={`/ScreenDetail/${s.id}`}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer hover:ring-2 hover:ring-violet-200">
                  {/* Thumbnail */}
                  {s.screen_image_url ? (
                    <img src={s.screen_image_url} alt={s.name} className="w-full h-36 object-cover rounded-t-xl" />
                  ) : (
                    <div className="w-full h-36 bg-slate-100 rounded-t-xl flex flex-col items-center justify-center gap-1">
                      <ImageIcon className="w-7 h-7 text-slate-300" />
                      <span className="text-xs text-slate-400">No photo</span>
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">{s.name}</h3>
                        <p className="text-xs text-slate-500">{s.width_px}×{s.height_px}px</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {s.is_online ? <Wifi className="w-4 h-4 text-emerald-500" /> : <WifiOff className="w-4 h-4 text-slate-400" />}
                        <Badge className={statusColor[s.approval_status] || "bg-slate-100 text-slate-600"}>
                          {s.approval_status}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-3">
                      <div className="bg-slate-50 rounded-lg p-2"><span className="text-slate-400">Slots:</span> {s.total_slots}</div>
                      <div className="bg-slate-50 rounded-lg p-2"><span className="text-slate-400">Duration:</span> {s.slot_duration}s</div>
                      <div className="bg-slate-50 rounded-lg p-2"><span className="text-slate-400">Price/wk:</span> AED {s.price_per_week}</div>
                      <div className="bg-slate-50 rounded-lg p-2"><span className="text-slate-400">Impressions:</span> {s.total_impressions?.toLocaleString() || 0}</div>
                    </div>
                    {s.approval_status === "approved" && s.setup_code && (
                      <div className="flex items-center gap-2 bg-violet-50 rounded-lg p-2">
                        <Code className="w-3.5 h-3.5 text-violet-600" />
                        <span className="text-xs text-violet-700 font-mono font-bold">Setup Code: {s.setup_code}</span>
                      </div>
                    )}
                    {s.approval_status === "approved" && (
                      <Link to={`/ManageScreenContent?id=${s.id}`} onClick={e => e.stopPropagation()}>
                        <Button size="sm" variant="outline" className="w-full mt-2 text-violet-700 border-violet-200 hover:bg-violet-50">
                          <Settings className="w-3.5 h-3.5 mr-1.5" /> Manage Internal Content
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}