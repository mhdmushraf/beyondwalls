import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import {
  Search,
  Building2,
  MonitorPlay,
  MapPin,
  Phone,
  Mail,
  Loader2,
  Pencil,
  Save,
  ArrowLeft,
  Users,
  DollarSign,
  Eye,
  Trash2,
  ExternalLink,
  ChevronRight,
  Filter,
  MoreVertical,
  Ban,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function AdminVenueManager() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("venues");
  const [editingVenue, setEditingVenue] = useState(null);
  const [editingScreen, setEditingScreen] = useState(null);
  const [venueDetails, setVenueDetails] = useState(null);
  const [saving, setSaving] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  
  const [venueFilters, setVenueFilters] = useState({ city: "all", type: "all", status: "all" });
  const [screenFilters, setScreenFilters] = useState({ status: "all", city: "all" });
  const [suspendDialog, setSuspendDialog] = useState({ open: false, type: null, item: null });
  const [suspendReason, setSuspendReason] = useState("");

  // All hooks before conditional returns
  const { data: venues = [], isLoading: venuesLoading } = useQuery({
    queryKey: ["admin-managed-venues"],
    queryFn: () => base44.entities.Venue.list("-created_date"),
    enabled: authChecked
  });

  const { data: screens = [], isLoading: screensLoading } = useQuery({
    queryKey: ["admin-active-screens"],
    queryFn: () => base44.entities.Screen.list("-created_date"),
    enabled: authChecked
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["admin-all-bookings"],
    queryFn: () => base44.entities.AdSlotBooking.list(),
    enabled: authChecked
  });

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl("AdminVenueManager"));
        return;
      }
      const userData = await base44.auth.me();
      const isAdmin = userData?.user_role === "admin" || userData?.role === "admin";
      if (!isAdmin) {
        window.location.href = createPageUrl("Dashboard");
        return;
      }
      setAuthChecked(true);
    } catch (e) {
      base44.auth.redirectToLogin(createPageUrl("AdminVenueManager"));
    }
  };

  const cities = [...new Set(venues.map(v => v.city).filter(Boolean))];
  const venueTypes = [...new Set(venues.map(v => v.type).filter(Boolean))];

  const managedVenues = venues.filter(v => v.status === "approved" || v.status === "suspended");
  
  const filteredVenues = managedVenues.filter(venue => {
    const matchesSearch = venue.name?.toLowerCase().includes(search.toLowerCase()) ||
                         venue.city?.toLowerCase().includes(search.toLowerCase());
    const matchesCity = venueFilters.city === "all" || venue.city === venueFilters.city;
    const matchesType = venueFilters.type === "all" || venue.type === venueFilters.type;
    const matchesStatus = venueFilters.status === "all" || venue.status === venueFilters.status;
    return matchesSearch && matchesCity && matchesType && matchesStatus;
  });

  const activeScreens = screens.filter(s => ["online", "offline", "pending_setup", "suspended"].includes(s.status));
  
  const filteredScreens = activeScreens.filter(screen => {
    const venue = venues.find(v => v.id === screen.venue_id);
    const matchesSearch = screen.name?.toLowerCase().includes(search.toLowerCase()) ||
                         venue?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = screenFilters.status === "all" || screen.status === screenFilters.status;
    const matchesCity = screenFilters.city === "all" || venue?.city === screenFilters.city;
    return matchesSearch && matchesStatus && matchesCity;
  });

  const getVenueScreens = (venueId) => screens.filter(s => s.venue_id === venueId);
  const getScreenBookings = (screenId) => bookings.filter(b => b.screen_id === screenId);
  const getVenueBookings = (venueId) => {
    const venueScreenIds = getVenueScreens(venueId).map(s => s.id);
    return bookings.filter(b => venueScreenIds.includes(b.screen_id));
  };
  const getVenueRevenue = (venueId) => {
    return getVenueBookings(venueId)
      .filter(b => b.status === "active" || b.status === "completed")
      .reduce((sum, b) => sum + (b.venue_share || 0), 0);
  };

  const handleSaveVenue = async () => {
    if (!editingVenue) return;
    setSaving(true);
    try {
      await base44.entities.Venue.update(editingVenue.id, editingVenue);
      queryClient.invalidateQueries({ queryKey: ["admin-approved-venues"] });
      toast.success("Venue updated");
      setEditingVenue(null);
    } catch (e) {
      toast.error("Failed to update venue");
    }
    setSaving(false);
  };

  const handleSaveScreen = async () => {
    if (!editingScreen) return;
    setSaving(true);
    try {
      await base44.entities.Screen.update(editingScreen.id, editingScreen);
      queryClient.invalidateQueries({ queryKey: ["admin-active-screens"] });
      toast.success("Screen updated");
      setEditingScreen(null);
    } catch (e) {
      toast.error("Failed to update screen");
    }
    setSaving(false);
  };

  const handleSuspendVenue = async () => {
    if (!suspendDialog.item || !suspendReason.trim()) return;
    const venue = suspendDialog.item;
    setSaving(true);
    try {
      await base44.entities.Venue.update(venue.id, { 
        status: "suspended",
        suspension_reason: suspendReason,
        suspended_at: new Date().toISOString()
      });
      const venueScreens = getVenueScreens(venue.id);
      await Promise.all(venueScreens.map(s => base44.entities.Screen.update(s.id, { status: "suspended" })));
      
      // Send suspension email
      try {
        await base44.integrations.Core.SendEmail({
          to: venue.owner_id,
          subject: "⚠️ Venue Suspended | BeyondWalls",
          body: `
Your venue "${venue.name}" has been suspended.

Reason: ${suspendReason}

While suspended:
• You cannot add new screens
• Your screens will not display ads
• Advertisers cannot book your screens

To request reactivation, please log in to your dashboard and submit a request.

Contact us at info@beyondwalls.ae for assistance.

- BeyondWalls Team
          `.trim()
        });
      } catch (e) {}
      
      queryClient.invalidateQueries({ queryKey: ["admin-managed-venues"] });
      queryClient.invalidateQueries({ queryKey: ["admin-active-screens"] });
      toast.success("Venue suspended");
      setSuspendDialog({ open: false, type: null, item: null });
      setSuspendReason("");
    } catch (e) {
      toast.error("Failed to suspend venue");
    }
    setSaving(false);
  };

  const handleReactivateVenue = async (venue) => {
    setSaving(true);
    try {
      await base44.entities.Venue.update(venue.id, { 
        status: "approved",
        suspension_reason: null,
        suspended_at: null
      });
      
      // Send reactivation email
      try {
        await base44.integrations.Core.SendEmail({
          to: venue.owner_id,
          subject: "✅ Venue Reactivated | BeyondWalls",
          body: `
Great news! Your venue "${venue.name}" has been reactivated.

You can now:
• Add new screens
• Accept ad bookings
• Start earning again

Log in to your dashboard to get started.

- BeyondWalls Team
          `.trim()
        });
      } catch (e) {}
      
      queryClient.invalidateQueries({ queryKey: ["admin-managed-venues"] });
      toast.success("Venue reactivated");
    } catch (e) {
      toast.error("Failed to reactivate venue");
    }
    setSaving(false);
  };

  const handleSuspendScreen = async () => {
    if (!suspendDialog.item || !suspendReason.trim()) return;
    const screen = suspendDialog.item;
    setSaving(true);
    try {
      await base44.entities.Screen.update(screen.id, { 
        status: "suspended",
        suspension_reason: suspendReason,
        suspended_at: new Date().toISOString()
      });
      
      // Send suspension email
      try {
        await base44.integrations.Core.SendEmail({
          to: screen.owner_id,
          subject: "⚠️ Screen Suspended | BeyondWalls",
          body: `
Your screen "${screen.name}" has been suspended.

Reason: ${suspendReason}

While suspended:
• The screen will not display ads
• Advertisers cannot book this screen

To request reactivation, please log in to your dashboard and submit a request.

Contact us at info@beyondwalls.ae for assistance.

- BeyondWalls Team
          `.trim()
        });
      } catch (e) {}
      
      queryClient.invalidateQueries({ queryKey: ["admin-active-screens"] });
      toast.success("Screen suspended");
      setSuspendDialog({ open: false, type: null, item: null });
      setSuspendReason("");
    } catch (e) {
      toast.error("Failed to suspend screen");
    }
    setSaving(false);
  };

  const handleReactivateScreen = async (screen) => {
    setSaving(true);
    try {
      await base44.entities.Screen.update(screen.id, { 
        status: "online",
        suspension_reason: null,
        suspended_at: null
      });
      
      // Send reactivation email
      try {
        await base44.integrations.Core.SendEmail({
          to: screen.owner_id,
          subject: "✅ Screen Reactivated | BeyondWalls",
          body: `
Great news! Your screen "${screen.name}" has been reactivated and is now online.

Advertisers can now book your screen again.

Log in to your dashboard to manage your screen.

- BeyondWalls Team
          `.trim()
        });
      } catch (e) {}
      
      queryClient.invalidateQueries({ queryKey: ["admin-active-screens"] });
      toast.success("Screen reactivated");
    } catch (e) {
      toast.error("Failed to reactivate screen");
    }
    setSaving(false);
  };

  const handleToggleScreenStatus = async (screen) => {
    const newStatus = screen.status === "online" ? "offline" : "online";
    try {
      await base44.entities.Screen.update(screen.id, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ["admin-active-screens"] });
      toast.success(`Screen ${newStatus}`);
    } catch (e) {
      toast.error("Failed to update screen");
    }
  };

  const statusColors = {
    approved: "bg-emerald-100 text-emerald-700",
    online: "bg-emerald-100 text-emerald-700",
    offline: "bg-slate-100 text-slate-700",
    pending_setup: "bg-blue-100 text-blue-700",
    suspended: "bg-red-100 text-red-700"
  };

  if (!authChecked) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Checking permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to={createPageUrl("AdminVenues")}>
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Venue & Screen Manager</h1>
          <p className="text-slate-500 mt-1">Manage approved venues and active screens</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{managedVenues.filter(v => v.status === "approved").length}</p>
                <p className="text-sm text-slate-500">Active Venues</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Ban className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700">{managedVenues.filter(v => v.status === "suspended").length}</p>
                <p className="text-sm text-red-600">Suspended</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                <MonitorPlay className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{activeScreens.filter(s => s.status === "online").length}</p>
                <p className="text-sm text-slate-500">Online Screens</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{bookings.filter(b => b.status === "active").length}</p>
                <p className="text-sm text-slate-500">Active Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  AED {bookings.filter(b => b.status === "active" || b.status === "completed").reduce((sum, b) => sum + (b.total_cost || 0), 0).toLocaleString()}
                </p>
                <p className="text-sm text-slate-500">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input placeholder="Search venues or screens..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="venues" className="gap-2"><Building2 className="w-4 h-4" />Venues ({managedVenues.length})</TabsTrigger>
          <TabsTrigger value="screens" className="gap-2"><MonitorPlay className="w-4 h-4" />Screens ({activeScreens.length})</TabsTrigger>
        </TabsList>

        {/* Venues Tab */}
        <TabsContent value="venues">
          <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
            <Filter className="w-4 h-4 text-slate-500" />
            <Select value={venueFilters.status} onValueChange={(v) => setVenueFilters({...venueFilters, status: v})}>
              <SelectTrigger className="w-32 h-8 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={venueFilters.city} onValueChange={(v) => setVenueFilters({...venueFilters, city: v})}>
              <SelectTrigger className="w-32 h-8 text-sm"><SelectValue placeholder="City" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={venueFilters.type} onValueChange={(v) => setVenueFilters({...venueFilters, type: v})}>
              <SelectTrigger className="w-32 h-8 text-sm"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {venueTypes.map(type => <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {venuesLoading ? (
              <div className="p-8 text-center"><Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto" /></div>
            ) : filteredVenues.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-slate-500"><Building2 className="w-12 h-12 mx-auto mb-3 text-slate-300" /><p>No venues found</p></CardContent></Card>
            ) : (
              filteredVenues.map(venue => {
                const venueScreens = getVenueScreens(venue.id);
                const onlineCount = venueScreens.filter(s => s.status === "online").length;
                const revenue = getVenueRevenue(venue.id);
                const activeBookingsCount = getVenueBookings(venue.id).filter(b => b.status === "active").length;
                
                return (
                  <Card key={venue.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {venue.image_url ? (
                          <img src={venue.image_url} alt="" className="w-20 h-20 rounded-lg object-cover" />
                        ) : (
                          <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-10 h-10 text-slate-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg text-slate-900">{venue.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                <MapPin className="w-4 h-4" />{venue.city}, {venue.area}
                                <Badge variant="secondary" className="capitalize">{venue.type}</Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={statusColors[venue.status]}>{venue.status}</Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setVenueDetails(venue)}><Eye className="w-4 h-4 mr-2" />View Details</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setEditingVenue({...venue})}><Pencil className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {venue.status === "suspended" ? (
                                    <DropdownMenuItem className="text-emerald-600" onClick={() => handleReactivateVenue(venue)}>
                                      <CheckCircle2 className="w-4 h-4 mr-2" />Reactivate
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem className="text-red-600" onClick={() => setSuspendDialog({ open: true, type: "venue", item: venue })}>
                                      <Ban className="w-4 h-4 mr-2" />Suspend
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-4 mt-4">
                            <div className="text-center p-2 bg-slate-50 rounded-lg">
                              <p className="text-lg font-bold text-slate-900">{venueScreens.length}</p>
                              <p className="text-xs text-slate-500">Screens</p>
                            </div>
                            <div className="text-center p-2 bg-emerald-50 rounded-lg">
                              <p className="text-lg font-bold text-emerald-600">{onlineCount}</p>
                              <p className="text-xs text-slate-500">Online</p>
                            </div>
                            <div className="text-center p-2 bg-blue-50 rounded-lg">
                              <p className="text-lg font-bold text-blue-600">{activeBookingsCount}</p>
                              <p className="text-xs text-slate-500">Bookings</p>
                            </div>
                            <div className="text-center p-2 bg-amber-50 rounded-lg">
                              <p className="text-lg font-bold text-amber-600">AED {revenue.toLocaleString()}</p>
                              <p className="text-xs text-slate-500">Revenue</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">
                            <Mail className="w-4 h-4" />{venue.owner_id}
                            {venue.contact_phone && <><Phone className="w-4 h-4 ml-2" />{venue.contact_phone}</>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Screens Tab */}
        <TabsContent value="screens">
          <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
            <Filter className="w-4 h-4 text-slate-500" />
            <Select value={screenFilters.status} onValueChange={(v) => setScreenFilters({...screenFilters, status: v})}>
              <SelectTrigger className="w-32 h-8 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="pending_setup">Setup</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={screenFilters.city} onValueChange={(v) => setScreenFilters({...screenFilters, city: v})}>
              <SelectTrigger className="w-32 h-8 text-sm"><SelectValue placeholder="City" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              {screensLoading ? (
                <div className="p-8 text-center"><Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto" /></div>
              ) : filteredScreens.length === 0 ? (
                <div className="p-8 text-center text-slate-500"><MonitorPlay className="w-12 h-12 mx-auto mb-3 text-slate-300" /><p>No screens found</p></div>
              ) : (
                <div className="divide-y">
                  {filteredScreens.map(screen => {
                    const venue = venues.find(v => v.id === screen.venue_id);
                    const screenBookings = getScreenBookings(screen.id);
                    const activeCount = screenBookings.filter(b => b.status === "active").length;
                    
                    return (
                      <div key={screen.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${screen.status === "online" ? "bg-emerald-100" : "bg-slate-100"}`}>
                            <MonitorPlay className={`w-6 h-6 ${screen.status === "online" ? "text-emerald-600" : "text-slate-400"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-900">{screen.name}</h3>
                              <Badge className={statusColors[screen.status]}>{screen.status?.replace("_", " ")}</Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                              <span>{venue?.name}</span>
                              <span className="text-slate-300">•</span>
                              <span>{screen.size} {screen.orientation}</span>
                              <span className="text-slate-300">•</span>
                              <span>AED {screen.slot_price}/wk</span>
                              <span className="text-slate-300">•</span>
                              <span>{activeCount} active ads</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {screen.setup_code && (
                              <code className="px-2 py-1 bg-violet-50 text-violet-700 rounded text-sm font-mono">{screen.setup_code}</code>
                            )}
                            {screen.status === "suspended" ? (
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleReactivateScreen(screen)}>
                                <CheckCircle2 className="w-4 h-4 mr-1" />Reactivate
                              </Button>
                            ) : (
                              <>
                                <Button variant="outline" size="sm" onClick={() => handleToggleScreenStatus(screen)}>
                                  {screen.status === "online" ? "Set Offline" : "Set Online"}
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => setSuspendDialog({ open: true, type: "screen", item: screen })}>
                                  <Ban className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => setEditingScreen({...screen})}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Venue Details Dialog */}
      <Dialog open={!!venueDetails} onOpenChange={() => setVenueDetails(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Venue Details</DialogTitle></DialogHeader>
          {venueDetails && (
            <div className="space-y-6">
              {venueDetails.image_url && <img src={venueDetails.image_url} alt="" className="w-full h-48 object-cover rounded-xl" />}
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-slate-500">Name</Label><p className="font-medium">{venueDetails.name}</p></div>
                <div><Label className="text-slate-500">Type</Label><p className="font-medium capitalize">{venueDetails.type}</p></div>
                <div><Label className="text-slate-500">Location</Label><p className="font-medium">{venueDetails.city}, {venueDetails.area}</p></div>
                <div><Label className="text-slate-500">Address</Label><p className="font-medium">{venueDetails.address}</p></div>
                <div><Label className="text-slate-500">Owner</Label><p className="font-medium">{venueDetails.owner_id}</p></div>
                <div><Label className="text-slate-500">Footfall</Label><p className="font-medium">{venueDetails.avg_daily_footfall?.toLocaleString() || "—"}/day</p></div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Screens ({getVenueScreens(venueDetails.id).length})</h4>
                <div className="space-y-2">
                  {getVenueScreens(venueDetails.id).map(screen => (
                    <div key={screen.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <MonitorPlay className={`w-5 h-5 ${screen.status === "online" ? "text-emerald-600" : "text-slate-400"}`} />
                        <div>
                          <p className="font-medium">{screen.name}</p>
                          <p className="text-sm text-slate-500">{screen.size} • {screen.orientation}</p>
                        </div>
                      </div>
                      <Badge className={statusColors[screen.status]}>{screen.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Active Bookings ({getVenueBookings(venueDetails.id).filter(b => b.status === "active").length})</h4>
                <div className="space-y-2">
                  {getVenueBookings(venueDetails.id).filter(b => b.status === "active").slice(0, 5).map(booking => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium">{booking.campaign_name || "Campaign"}</p>
                        <p className="text-sm text-slate-500">{booking.advertiser_id}</p>
                      </div>
                      <p className="font-medium text-emerald-600">AED {booking.total_cost}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Venue Dialog */}
      <Dialog open={!!editingVenue} onOpenChange={() => setEditingVenue(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Venue</DialogTitle></DialogHeader>
          {editingVenue && (
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={editingVenue.name} onChange={(e) => setEditingVenue({...editingVenue, name: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>City</Label><Input value={editingVenue.city} onChange={(e) => setEditingVenue({...editingVenue, city: e.target.value})} /></div>
                <div><Label>Area</Label><Input value={editingVenue.area} onChange={(e) => setEditingVenue({...editingVenue, area: e.target.value})} /></div>
              </div>
              <div><Label>Address</Label><Input value={editingVenue.address} onChange={(e) => setEditingVenue({...editingVenue, address: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Contact Phone</Label><Input value={editingVenue.contact_phone} onChange={(e) => setEditingVenue({...editingVenue, contact_phone: e.target.value})} /></div>
                <div><Label>Daily Footfall</Label><Input type="number" value={editingVenue.avg_daily_footfall || ""} onChange={(e) => setEditingVenue({...editingVenue, avg_daily_footfall: parseInt(e.target.value) || 0})} /></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingVenue(null)}>Cancel</Button>
            <Button onClick={handleSaveVenue} disabled={saving} className="bg-violet-600 hover:bg-violet-700">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Screen Dialog */}
      <Dialog open={!!editingScreen} onOpenChange={() => setEditingScreen(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Screen</DialogTitle></DialogHeader>
          {editingScreen && (
            <div className="space-y-4">
              <div><Label>Name</Label><Input value={editingScreen.name} onChange={(e) => setEditingScreen({...editingScreen, name: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Size</Label>
                  <Select value={editingScreen.size} onValueChange={(v) => setEditingScreen({...editingScreen, size: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value='32"'>32"</SelectItem>
                      <SelectItem value='43"'>43"</SelectItem>
                      <SelectItem value='55"'>55"</SelectItem>
                      <SelectItem value='65"'>65"</SelectItem>
                      <SelectItem value='75"'>75"</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Orientation</Label>
                  <Select value={editingScreen.orientation} onValueChange={(v) => setEditingScreen({...editingScreen, orientation: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="landscape">Landscape</SelectItem>
                      <SelectItem value="portrait">Portrait</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Slot Price (AED/week)</Label><Input type="number" value={editingScreen.slot_price || ""} onChange={(e) => setEditingScreen({...editingScreen, slot_price: parseFloat(e.target.value) || 0})} /></div>
              <div>
                <Label>Status</Label>
                <Select value={editingScreen.status} onValueChange={(v) => setEditingScreen({...editingScreen, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingScreen(null)}>Cancel</Button>
            <Button onClick={handleSaveScreen} disabled={saving} className="bg-violet-600 hover:bg-violet-700">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={suspendDialog.open} onOpenChange={(open) => { if (!open) { setSuspendDialog({ open: false, type: null, item: null }); setSuspendReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Suspend {suspendDialog.type === "venue" ? "Venue" : "Screen"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                {suspendDialog.type === "venue" 
                  ? "Suspending this venue will also suspend all its screens. The owner will be notified via email."
                  : "Suspending this screen will prevent it from displaying ads. The owner will be notified via email."
                }
              </p>
            </div>
            <div>
              <Label>Suspension Reason *</Label>
              <Textarea 
                placeholder="Enter reason for suspension..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSuspendDialog({ open: false, type: null, item: null }); setSuspendReason(""); }}>Cancel</Button>
            <Button 
              variant="destructive"
              onClick={suspendDialog.type === "venue" ? handleSuspendVenue : handleSuspendScreen}
              disabled={saving || !suspendReason.trim()}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Ban className="w-4 h-4 mr-2" />}
              Suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}