import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  MonitorPlay,
  Activity,
  Wifi,
  WifiOff,
  Settings,
  Building2,
  Play,
  Copy,
  ExternalLink,
  Lock,
  QrCode,
  Clock,
  Loader2,
  RefreshCw,
  Upload,
  LayoutGrid,
  List,
  Tag,
  Wrench,
  Power,
  AlertTriangle,
  Sliders
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import LiveScreenPreview from "@/components/previews/LiveScreenPreview";
import ScreenTagManager, { getTagColor } from "@/components/screens/ScreenTagManager";
import ScreenStatusControl from "@/components/screens/ScreenStatusControl";

export default function MyScreens() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupBy, setGroupBy] = useState("none"); // none, venue, status
  const [viewMode, setViewMode] = useState("grid"); // grid, list
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [showPlayerDialog, setShowPlayerDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [tagFilter, setTagFilter] = useState(null);

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

  const { data: allBookings = [] } = useQuery({
    queryKey: ["screen-bookings-for-preview"],
    queryFn: () => base44.entities.AdSlotBooking.filter({ status: "active" }),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl("MyScreens"));
        return;
      }
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {
      base44.auth.redirectToLogin(createPageUrl("MyScreens"));
    }
  };

  // Get all active ads for a screen
  const getScreenSlots = (screen) => {
    const slots = [];
    
    // Add owner slots
    if (screen?.owner_slot_1_url) slots.push({ url: screen.owner_slot_1_url, type: screen.owner_slot_1_type || "image", name: "Owner Ad 1" });
    if (screen?.owner_slot_2_url) slots.push({ url: screen.owner_slot_2_url, type: screen.owner_slot_2_type || "image", name: "Owner Ad 2" });
    if (screen?.owner_slot_3_url) slots.push({ url: screen.owner_slot_3_url, type: screen.owner_slot_3_type || "image", name: "Owner Ad 3" });
    
    // Add booked ads
    const screenBookings = allBookings.filter(b => b.screen_id === screen.id);
    screenBookings.forEach(b => {
      if (b.creative_url) {
        slots.push({ url: b.creative_url, type: b.creative_type || "image", name: b.campaign_name || "Ad" });
      }
    });
    
    return slots;
  };

  // Get all unique tags across screens
  const allTags = useMemo(() => {
    const tags = new Set();
    screens.forEach(s => (s.tags || []).forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [screens]);

  const filteredScreens = screens.filter(screen => {
    const venue = venues.find(v => v.id === screen.venue_id);
    const matchesSearch = screen.name?.toLowerCase().includes(search.toLowerCase()) ||
                         venue?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || screen.status === statusFilter;
    const matchesTag = !tagFilter || (screen.tags || []).includes(tagFilter);
    return matchesSearch && matchesStatus && matchesTag;
  });

  const statusColors = {
    online: "bg-emerald-100 text-emerald-700 border-emerald-200",
    offline: "bg-rose-100 text-rose-700 border-rose-200",
    maintenance: "bg-amber-100 text-amber-700 border-amber-200",
    pending_setup: "bg-blue-100 text-blue-700 border-blue-200",
    pending_approval: "bg-amber-100 text-amber-700 border-amber-200"
  };

  const statusIndicators = {
    online: "bg-emerald-500",
    offline: "bg-rose-500",
    maintenance: "bg-amber-500",
    pending_setup: "bg-blue-500",
    pending_approval: "bg-amber-500"
  };

  const statusCounts = {
    all: screens.length,
    online: screens.filter(s => s.status === "online").length,
    offline: screens.filter(s => s.status === "offline").length,
    maintenance: screens.filter(s => s.status === "maintenance").length
  };

  // Group screens by venue, status, or tag
  const groupedScreens = () => {
    if (groupBy === "venue") {
      const groups = {};
      filteredScreens.forEach(screen => {
        const venue = venues.find(v => v.id === screen.venue_id);
        const venueName = venue?.name || "Unknown Venue";
        if (!groups[venueName]) groups[venueName] = [];
        groups[venueName].push(screen);
      });
      return groups;
    } else if (groupBy === "status") {
      const groups = {};
      filteredScreens.forEach(screen => {
        const status = screen.status || "unknown";
        if (!groups[status]) groups[status] = [];
        groups[status].push(screen);
      });
      return groups;
    } else if (groupBy === "tag") {
      const groups = { "Untagged": [] };
      allTags.forEach(tag => groups[tag] = []);
      filteredScreens.forEach(screen => {
        if (!screen.tags || screen.tags.length === 0) {
          groups["Untagged"].push(screen);
        } else {
          screen.tags.forEach(tag => {
            if (!groups[tag]) groups[tag] = [];
            groups[tag].push(screen);
          });
        }
      });
      // Remove empty groups
      Object.keys(groups).forEach(key => {
        if (groups[key].length === 0) delete groups[key];
      });
      return groups;
    }
    return { all: filteredScreens };
  };

  // Tag management handlers
  const handleUpdateTags = async (screenId, tags) => {
    await base44.entities.Screen.update(screenId, { tags });
    queryClient.invalidateQueries({ queryKey: ["my-screens"] });
  };

  const handleUpdateStatus = async (screenId, status) => {
    await base44.entities.Screen.update(screenId, { status });
    queryClient.invalidateQueries({ queryKey: ["my-screens"] });
  };

  // Remote actions
  const handleRemoteAction = async (screenId, action) => {
    setActionLoading(screenId);
    try {
      const screen = screens.find(s => s.id === screenId);
      if (action === "restart") {
        await base44.entities.Screen.update(screenId, {
          last_heartbeat: new Date().toISOString(),
          status: "online"
        });
        toast.success("Restart signal sent to screen");
      } else if (action === "maintenance") {
        await base44.entities.Screen.update(screenId, {
          status: screen.status === "maintenance" ? "online" : "maintenance"
        });
        toast.success(screen.status === "maintenance" ? "Screen back online" : "Screen set to maintenance");
      } else if (action === "refresh") {
        await base44.entities.Screen.update(screenId, {
          owner_slots_last_updated: new Date().toISOString()
        });
        toast.success("Content refresh triggered");
      }
      queryClient.invalidateQueries({ queryKey: ["my-screens"] });
    } catch (e) {
      toast.error("Action failed");
    }
    setActionLoading(null);
  };

  if (!user) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading screens...</p>
        </div>
      </div>
    );
  }

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

      {/* Status Summary */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("all")}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-slate-400" />
            <div>
              <p className="text-2xl font-bold">{statusCounts.all}</p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("online")}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <p className="text-2xl font-bold text-emerald-600">{statusCounts.online}</p>
              <p className="text-xs text-slate-500">Online</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("offline")}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <div>
              <p className="text-2xl font-bold text-rose-600">{statusCounts.offline}</p>
              <p className="text-xs text-slate-500">Offline</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("maintenance")}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div>
              <p className="text-2xl font-bold text-amber-600">{statusCounts.maintenance}</p>
              <p className="text-xs text-slate-500">Maintenance</p>
            </div>
          </CardContent>
        </Card>
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
        <div className="flex gap-2 flex-wrap">
          <Tabs value={groupBy} onValueChange={setGroupBy}>
            <TabsList className="bg-white border border-slate-200">
              <TabsTrigger value="none" className="text-xs">No Group</TabsTrigger>
              <TabsTrigger value="venue" className="text-xs">By Venue</TabsTrigger>
              <TabsTrigger value="status" className="text-xs">By Status</TabsTrigger>
              <TabsTrigger value="tag" className="text-xs">By Tag</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-none"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-none"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge 
            variant={tagFilter === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setTagFilter(null)}
          >
            All Tags
          </Badge>
          {allTags.map(tag => {
            const color = getTagColor(tag);
            return (
              <Badge
                key={tag}
                className={`cursor-pointer ${tagFilter === tag ? `${color.bg} ${color.text}` : "bg-slate-100 text-slate-600"}`}
                onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            );
          })}
        </div>
      )}

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
        <div className="space-y-6">
          {Object.entries(groupedScreens()).map(([groupName, groupScreens]) => (
            <div key={groupName}>
              {groupBy !== "none" && (
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2 capitalize">
                  {groupBy === "venue" && <Building2 className="w-5 h-5 text-violet-600" />}
                  {groupBy === "status" && <div className={`w-3 h-3 rounded-full ${statusIndicators[groupName] || 'bg-slate-400'}`} />}
                  {groupBy === "tag" && <Tag className="w-5 h-5 text-violet-600" />}
                  {groupName.replace("_", " ")} ({groupScreens.length})
                </h3>
              )}
              
              <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-3"}>
                {groupScreens.map((screen) => {
                  const venue = venues.find(v => v.id === screen.venue_id);
                  const screenSlots = getScreenSlots(screen);
                  
                  if (viewMode === "list") {
                    return (
                      <Card key={screen.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            {/* Status Indicator */}
                            <div className="relative">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                screen.status === "online" ? "bg-emerald-100" : 
                                screen.status === "offline" ? "bg-rose-100" : "bg-amber-100"
                              }`}>
                                <MonitorPlay className={`w-6 h-6 ${
                                  screen.status === "online" ? "text-emerald-600" : 
                                  screen.status === "offline" ? "text-rose-600" : "text-amber-600"
                                }`} />
                              </div>
                              <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${statusIndicators[screen.status]} ${screen.status === "online" ? "animate-pulse" : ""}`} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 truncate">{screen.name}</h3>
                              <p className="text-sm text-slate-500">{venue?.name} • {screen.size} • {screen.orientation}</p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => { setSelectedScreen(screen); setShowStatusDialog(true); }}
                                title="Screen Control"
                              >
                                <Sliders className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => { setSelectedScreen(screen); setShowTagDialog(true); }}
                                title="Manage Tags"
                              >
                                <Tag className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setSelectedScreen(screen); setShowPlayerDialog(true); }}
                              >
                                <Play className="w-4 h-4 mr-1" />
                                Player
                              </Button>
                              <Link to={createPageUrl("ManageOwnerSlots") + `?screen_id=${screen.id}`}>
                                <Button variant="outline" size="icon" className="h-8 w-8">
                                  <Settings className="w-4 h-4" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }
                  
                  return (
                    <Card key={screen.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        {/* Live Preview */}
                        <div className="mb-4 relative">
                          {screenSlots.length > 0 ? (
                            <LiveScreenPreview slots={screenSlots} size="small" />
                          ) : (
                            <div className="h-32 bg-slate-900 rounded-lg flex items-center justify-center">
                              <div className="text-center text-slate-500">
                                <MonitorPlay className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-xs">No ads configured</p>
                              </div>
                            </div>
                          )}
                          {/* Real-time status indicator */}
                          <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${statusIndicators[screen.status]} ${screen.status === "online" ? "animate-pulse" : ""}`} />
                        </div>

                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            screen.status === "online" ? "bg-emerald-100" : 
                            screen.status === "offline" ? "bg-rose-100" : "bg-amber-100"
                          }`}>
                            <MonitorPlay className={`w-6 h-6 ${
                              screen.status === "online" ? "text-emerald-600" : 
                              screen.status === "offline" ? "text-rose-600" : "text-amber-600"
                            }`} />
                          </div>
                          <Badge className={`${statusColors[screen.status]} border`}>
                            {screen.status === "online" ? (
                              <><Wifi className="w-3 h-3 mr-1" /> Online</>
                            ) : screen.status === "offline" ? (
                              <><WifiOff className="w-3 h-3 mr-1" /> Offline</>
                            ) : screen.status === "maintenance" ? (
                              <><Wrench className="w-3 h-3 mr-1" /> Maintenance</>
                            ) : screen.status === "pending_approval" ? (
                              <><Clock className="w-3 h-3 mr-1" /> Pending</>
                            ) : screen.status === "pending_setup" ? (
                              <><QrCode className="w-3 h-3 mr-1" /> Setup</>
                            ) : (
                              screen.status?.replace("_", " ")
                            )}
                          </Badge>
                        </div>

                        <h3 className="font-semibold text-slate-900 mb-1">{screen.name}</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1 mb-2">
                          <Building2 className="w-4 h-4" />
                          {venue?.name || "Unknown Venue"}
                        </p>
                        {/* Screen Tags */}
                        {(screen.tags || []).length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {screen.tags.slice(0, 3).map(tag => {
                              const color = getTagColor(tag);
                              return (
                                <Badge key={tag} className={`${color.bg} ${color.text} text-xs px-1.5 py-0`}>
                                  {tag}
                                </Badge>
                              );
                            })}
                            {screen.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs px-1.5 py-0">
                                +{screen.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

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
                            <p className="font-semibold text-slate-900">AED {screen.slot_price}/wk</p>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs text-slate-500">Slots</p>
                            <p className="font-semibold text-slate-900">{screen.available_slots || 5} available</p>
                          </div>
                        </div>

                        {screen.last_heartbeat && (
                          <p className="text-xs text-slate-400 mb-4">
                            Last seen: {format(new Date(screen.last_heartbeat), "MMM d, h:mm a")}
                          </p>
                        )}

                        {/* Remote Actions */}
                        <div className="flex gap-1 mb-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 text-xs"
                            onClick={() => handleRemoteAction(screen.id, "refresh")}
                            disabled={actionLoading === screen.id}
                          >
                            {actionLoading === screen.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-1" />}
                            Refresh
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 text-xs"
                            onClick={() => handleRemoteAction(screen.id, "restart")}
                            disabled={actionLoading === screen.id}
                          >
                            <Power className="w-3 h-3 mr-1" />
                            Restart
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className={`flex-1 h-8 text-xs ${screen.status === "maintenance" ? "bg-amber-50" : ""}`}
                            onClick={() => handleRemoteAction(screen.id, "maintenance")}
                          >
                            <Wrench className="w-3 h-3 mr-1" />
                            {screen.status === "maintenance" ? "Online" : "Maint."}
                          </Button>
                        </div>

                        <div className="flex gap-2">
                          {screen.status === "pending_approval" ? (
                            <Button variant="outline" className="flex-1" disabled>
                              <Clock className="w-4 h-4 mr-2" />
                              Awaiting Approval
                            </Button>
                          ) : (
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => { setSelectedScreen(screen); setShowPlayerDialog(true); }}
                            >
                              {screen.setup_code ? (
                                <><QrCode className="w-4 h-4 mr-2" />Setup Code</>
                              ) : (
                                <><Play className="w-4 h-4 mr-2" />Launch Player</>
                              )}
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => { setSelectedScreen(screen); setShowTagDialog(true); }}
                            title="Manage Tags"
                          >
                            <Tag className="w-4 h-4" />
                          </Button>
                          <Link to={createPageUrl("ManageOwnerSlots") + `?screen_id=${screen.id}`}>
                            <Button variant="outline" size="icon">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tag Manager Dialog */}
      <ScreenTagManager
        screens={screens}
        allTags={allTags}
        onUpdateTags={handleUpdateTags}
        onCreateTag={(tag) => {/* Tag created automatically */}}
        selectedScreen={selectedScreen}
        open={showTagDialog}
        onOpenChange={setShowTagDialog}
      />

      {/* Status Control Dialog */}
      <ScreenStatusControl
        screen={selectedScreen}
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        onUpdateStatus={handleUpdateStatus}
        onRemoteAction={handleRemoteAction}
      />

      {/* Player Launch Dialog */}
      <Dialog open={showPlayerDialog} onOpenChange={setShowPlayerDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MonitorPlay className="w-5 h-5 text-violet-600" />
              Launch Screen Player
            </DialogTitle>
            <DialogDescription>
              Open this on your TV or display to start showing ads
            </DialogDescription>
          </DialogHeader>
          
          {selectedScreen && (
            <div className="space-y-4 py-4">
              {/* Setup Code - Primary method after approval */}
              {selectedScreen.setup_code && (
                <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl p-5 border border-violet-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-violet-600" />
                      <Label className="text-violet-700 font-semibold">Setup Code</Label>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedScreen.setup_code);
                        toast.success("Setup code copied!");
                      }}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-3xl font-mono font-bold text-violet-900 tracking-wider text-center py-2">
                    {selectedScreen.setup_code}
                  </p>
                  <p className="text-xs text-violet-600 text-center mt-2">
                    Use this code in the BeyondWalls Player to connect your screen
                  </p>
                </div>
              )}

              {/* Screen ID fallback */}
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-slate-500">Screen ID</Label>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedScreen.device_id || selectedScreen.id);
                      toast.success("Copied to clipboard");
                    }}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
                <p className="text-xl font-mono font-bold text-slate-900 tracking-wider">
                  {selectedScreen.device_id || selectedScreen.id.slice(-8).toUpperCase()}
                </p>
              </div>

              {selectedScreen.player_pin && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4 text-amber-600" />
                    <Label className="text-amber-700">PIN Protected</Label>
                  </div>
                  <p className="text-lg font-mono font-bold text-amber-900 tracking-widest">
                    {selectedScreen.player_pin}
                  </p>
                </div>
              )}

              <div className="bg-violet-50 rounded-xl p-4 border border-violet-200">
                <p className="text-sm text-violet-700 mb-3">
                  <strong>How to connect:</strong>
                </p>
                <ol className="text-sm text-violet-600 space-y-2">
                  <li>1. Open the Player URL on your TV browser</li>
                  <li>2. Enter the <strong>Setup Code</strong> shown above</li>
                  <li>3. Click "Connect Screen" - your screen will go online automatically!</li>
                </ol>
              </div>

              <Button 
                className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600"
                onClick={() => {
                  const playerUrl = selectedScreen.setup_code 
                    ? `${window.location.origin}${createPageUrl("ScreenPlayer")}?setup_code=${selectedScreen.setup_code}`
                    : `${window.location.origin}${createPageUrl("ScreenPlayer")}?screen_id=${selectedScreen.device_id || selectedScreen.id}`;
                  window.open(playerUrl, "_blank");
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Player in New Tab
              </Button>

              <Button 
                variant="outline"
                className="w-full"
                onClick={() => {
                  const playerUrl = selectedScreen.setup_code 
                    ? `${window.location.origin}${createPageUrl("ScreenPlayer")}?setup_code=${selectedScreen.setup_code}`
                    : `${window.location.origin}${createPageUrl("ScreenPlayer")}`;
                  navigator.clipboard.writeText(playerUrl);
                  toast.success("Player URL copied!");
                }}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Player URL
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}