import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus, MonitorPlay, Wifi, WifiOff, Code, Image as ImageIcon,
  Settings, Search, X, MapPin, Building2, Filter
} from "lucide-react";

export default function MyScreens() {
  const [screens, setScreens] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [venueFilter, setVenueFilter] = useState("all");
  const [onlineFilter, setOnlineFilter] = useState("all");

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      const [s, v] = await Promise.all([
        base44.entities.Screen.filter({ owner_email: u.email }, "-created_date"),
        base44.entities.Venue.filter({ owner_email: u.email }),
      ]);
      setScreens(s);
      setVenues(v);
      setLoading(false);
    });
  }, []);

  const statusColor = {
    approved: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    rejected: "bg-red-100 text-red-700",
  };

  const getVenueName = (venueId) => venues.find(v => v.id === venueId)?.name || "Unknown Venue";
  const getVenueCity = (venueId) => venues.find(v => v.id === venueId)?.city || "";

  const filteredScreens = useMemo(() => {
    return screens.filter(s => {
      const matchSearch = !search ||
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.location_description?.toLowerCase().includes(search.toLowerCase()) ||
        getVenueName(s.venue_id)?.toLowerCase().includes(search.toLowerCase()) ||
        getVenueCity(s.venue_id)?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "all" || s.approval_status === statusFilter;
      const matchVenue = venueFilter === "all" || s.venue_id === venueFilter;
      const matchOnline = onlineFilter === "all" ||
        (onlineFilter === "online" && s.is_online) ||
        (onlineFilter === "offline" && !s.is_online);

      return matchSearch && matchStatus && matchVenue && matchOnline;
    });
  }, [screens, search, statusFilter, venueFilter, onlineFilter, venues]);

  const hasActiveFilters = search || statusFilter !== "all" || venueFilter !== "all" || onlineFilter !== "all";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setVenueFilter("all");
    setOnlineFilter("all");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">My Screens</h1>
            <p className="text-sm text-slate-500 mt-0.5">{screens.length} screen{screens.length !== 1 ? "s" : ""} registered</p>
          </div>
          <Link to="/AddScreen">
            <Button className="bg-violet-600 hover:bg-violet-700">
              <Plus className="w-4 h-4 mr-2" /> Add Screen
            </Button>
          </Link>
        </div>

        {/* Filters Card */}
        <Card className="border-0 shadow-sm mb-5">
          <CardContent className="p-4">
            <div className="flex flex-col gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by screen name, location, venue or city..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 bg-slate-50 border-slate-200"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter Pills Row */}
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Filter className="w-3.5 h-3.5" /> Filters:
                </div>

                {/* Approval Status */}
                <div className="flex gap-1.5 flex-wrap">
                  {["all", "approved", "pending", "rejected"].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setStatusFilter(tab)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all capitalize ${
                        statusFilter === tab
                          ? "bg-violet-600 text-white shadow-sm"
                          : "bg-white text-slate-600 border border-slate-200 hover:border-violet-300"
                      }`}
                    >
                      {tab === "all" ? "All Status" : tab}
                    </button>
                  ))}
                </div>

                <div className="w-px h-4 bg-slate-200 hidden sm:block" />

                {/* Online Status */}
                <div className="flex gap-1.5">
                  {[
                    { key: "all", label: "All" },
                    { key: "online", label: "🟢 Online" },
                    { key: "offline", label: "⚫ Offline" },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setOnlineFilter(opt.key)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        onlineFilter === opt.key
                          ? "bg-slate-800 text-white shadow-sm"
                          : "bg-white text-slate-600 border border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="w-px h-4 bg-slate-200 hidden sm:block" />

                {/* Venue Filter */}
                {venues.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap items-center">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {[{ id: "all", name: "All Venues" }, ...venues].map(v => (
                      <button
                        key={v.id}
                        onClick={() => setVenueFilter(v.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          venueFilter === v.id
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"
                        }`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                )}

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="ml-auto flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    <X className="w-3.5 h-3.5" /> Clear all
                  </button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results count */}
        {hasActiveFilters && (
          <p className="text-sm text-slate-500 mb-3">
            Showing <span className="font-semibold text-slate-800">{filteredScreens.length}</span> of {screens.length} screens
          </p>
        )}

        {/* Screens Grid */}
        {filteredScreens.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center py-16">
              <MonitorPlay className="w-14 h-14 text-slate-200 mb-4" />
              <p className="text-slate-500 mb-2">
                {hasActiveFilters ? "No screens match your filters" : "No screens registered yet"}
              </p>
              {hasActiveFilters
                ? <button onClick={clearFilters} className="text-violet-600 text-sm font-medium hover:underline">Clear filters</button>
                : <Link to="/AddScreen"><Button className="bg-violet-600 hover:bg-violet-700 mt-2">Register Screen</Button></Link>
              }
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScreens.map(s => (
              <Link key={s.id} to={`/ScreenDetail/${s.id}`}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer hover:ring-2 hover:ring-violet-200 h-full">
                  {s.screen_image_url ? (
                    <img src={s.screen_image_url} alt={s.name} className="w-full h-36 object-cover rounded-t-xl" />
                  ) : (
                    <div className="w-full h-36 bg-slate-100 rounded-t-xl flex flex-col items-center justify-center gap-1">
                      <ImageIcon className="w-7 h-7 text-slate-300" />
                      <span className="text-xs text-slate-400">No photo</span>
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-slate-900 truncate">{s.name}</h3>
                        <p className="text-xs text-slate-500">{s.width_px}×{s.height_px}px</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        {s.is_online
                          ? <Wifi className="w-4 h-4 text-emerald-500" />
                          : <WifiOff className="w-4 h-4 text-slate-400" />}
                        <Badge className={statusColor[s.approval_status] || "bg-slate-100 text-slate-600"}>
                          {s.approval_status}
                        </Badge>
                      </div>
                    </div>

                    {/* Venue & Location */}
                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                      <Building2 className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{getVenueName(s.venue_id)}</span>
                      {getVenueCity(s.venue_id) && (
                        <>
                          <span className="text-slate-300">·</span>
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span>{getVenueCity(s.venue_id)}</span>
                        </>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-3">
                      <div className="bg-slate-50 rounded-lg p-2"><span className="text-slate-400">Slots:</span> {s.total_slots}</div>
                      <div className="bg-slate-50 rounded-lg p-2"><span className="text-slate-400">Duration:</span> {s.slot_duration}s</div>
                      <div className="bg-slate-50 rounded-lg p-2"><span className="text-slate-400">Price/wk:</span> AED {s.price_per_week}</div>
                      <div className="bg-slate-50 rounded-lg p-2"><span className="text-slate-400">Plays:</span> {s.total_impressions?.toLocaleString() || 0}</div>
                    </div>

                    {s.approval_status === "approved" && s.setup_code && (
                      <div className="flex items-center gap-2 bg-violet-50 rounded-lg p-2 mb-2">
                        <Code className="w-3.5 h-3.5 text-violet-600 flex-shrink-0" />
                        <span className="text-xs text-violet-700 font-mono font-bold truncate">Code: {s.setup_code}</span>
                      </div>
                    )}

                    {s.approval_status === "approved" && (
                      <Link to={`/ManageScreenContent?id=${s.id}`} onClick={e => e.stopPropagation()}>
                        <Button size="sm" variant="outline" className="w-full text-violet-700 border-violet-200 hover:bg-violet-50">
                          <Settings className="w-3.5 h-3.5 mr-1.5" /> Manage Content
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