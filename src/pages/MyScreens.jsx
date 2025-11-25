import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Search,
  MonitorPlay,
  Activity,
  Wifi,
  WifiOff,
  Settings,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function MyScreens() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {
      base44.auth.redirectToLogin();
    }
  };

  const { data: venues = [] } = useQuery({
    queryKey: ["my-venues", user?.email],
    queryFn: () => base44.entities.Venue.filter({ owner_id: user?.email }),
    enabled: !!user?.email
  });

  const { data: screens = [], isLoading } = useQuery({
    queryKey: ["my-screens", venues],
    queryFn: async () => {
      if (venues.length === 0) return [];
      const venueIds = venues.map(v => v.id);
      const allScreens = await base44.entities.Screen.list();
      return allScreens.filter(s => venueIds.includes(s.venue_id));
    },
    enabled: venues.length > 0
  });

  const filteredScreens = screens.filter(screen => {
    const venue = venues.find(v => v.id === screen.venue_id);
    const matchesSearch = screen.name?.toLowerCase().includes(search.toLowerCase()) ||
                         venue?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || screen.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    online: "bg-emerald-100 text-emerald-700 border-emerald-200",
    offline: "bg-slate-100 text-slate-700 border-slate-200",
    maintenance: "bg-amber-100 text-amber-700 border-amber-200",
    pending_setup: "bg-blue-100 text-blue-700 border-blue-200"
  };

  const statusCounts = {
    all: screens.length,
    online: screens.filter(s => s.status === "online").length,
    offline: screens.filter(s => s.status === "offline").length
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">My Screens</h1>
          <p className="text-slate-500 mt-1">Manage and monitor your screens</p>
        </div>
        <Link to={createPageUrl("AddScreen")}>
          <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25">
            <Plus className="w-4 h-4 mr-2" />
            Add Screen
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search screens..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="all" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
              All ({statusCounts.all})
            </TabsTrigger>
            <TabsTrigger value="online" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
              Online ({statusCounts.online})
            </TabsTrigger>
            <TabsTrigger value="offline" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
              Offline ({statusCounts.offline})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Screens Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredScreens.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MonitorPlay className="w-8 h-8 text-violet-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">
            {search || statusFilter !== "all" ? "No screens found" : "No screens yet"}
          </h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            {search || statusFilter !== "all" 
              ? "Try adjusting your search or filters"
              : venues.length === 0 
                ? "Add a venue first, then you can add screens"
                : "Add screens to your venues to start displaying ads"
            }
          </p>
          {!search && statusFilter === "all" && venues.length > 0 && (
            <Link to={createPageUrl("AddScreen")}>
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Screen
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScreens.map((screen) => {
            const venue = venues.find(v => v.id === screen.venue_id);
            
            return (
              <Card key={screen.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      screen.status === "online" ? "bg-emerald-100" : "bg-slate-100"
                    }`}>
                      <MonitorPlay className={`w-6 h-6 ${
                        screen.status === "online" ? "text-emerald-600" : "text-slate-400"
                      }`} />
                    </div>
                    <Badge className={`${statusColors[screen.status]} border`}>
                      {screen.status === "online" ? (
                        <><Wifi className="w-3 h-3 mr-1" /> Online</>
                      ) : screen.status === "offline" ? (
                        <><WifiOff className="w-3 h-3 mr-1" /> Offline</>
                      ) : (
                        screen.status?.replace("_", " ")
                      )}
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-slate-900 mb-1">{screen.name}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mb-4">
                    <Building2 className="w-4 h-4" />
                    {venue?.name || "Unknown Venue"}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500">Size</p>
                      <p className="font-semibold text-slate-900">{screen.size}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500">Orientation</p>
                      <p className="font-semibold text-slate-900 capitalize">{screen.orientation}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500">Rate</p>
                      <p className="font-semibold text-slate-900">AED {screen.hourly_rate}/hr</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500">Location</p>
                      <p className="font-semibold text-slate-900 truncate">{screen.location_in_venue || "—"}</p>
                    </div>
                  </div>

                  {screen.last_heartbeat && (
                    <p className="text-xs text-slate-400 mb-4">
                      Last seen: {format(new Date(screen.last_heartbeat), "MMM d, h:mm a")}
                    </p>
                  )}

                  <Button variant="outline" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Screen
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}