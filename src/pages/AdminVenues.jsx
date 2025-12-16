import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Search,
  CheckCircle2,
  XCircle,
  Building2,
  MonitorPlay,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  FileText,
  Loader2,
  Eye,
  Image as ImageIcon,
  Filter,
  SortAsc,
  SortDesc,
  CheckSquare,
  Square,
  MoreHorizontal,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function AdminVenues() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("venues");
  const [selectedItem, setSelectedItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  
  // Bulk selection
  const [selectedVenueIds, setSelectedVenueIds] = useState([]);
  const [selectedScreenIds, setSelectedScreenIds] = useState([]);
  
  // Filtering
  const [venueFilters, setVenueFilters] = useState({
    status: "pending",
    city: "all",
    type: "all",
    sortBy: "created_date",
    sortOrder: "desc"
  });
  const [screenFilters, setScreenFilters] = useState({
    status: "pending_approval",
    city: "all",
    size: "all",
    sortBy: "created_date",
    sortOrder: "desc"
  });

  // All hooks before conditional returns
  const { data: venues = [], isLoading: venuesLoading } = useQuery({
    queryKey: ["admin-all-venues"],
    queryFn: () => base44.entities.Venue.list("-created_date"),
    enabled: authChecked
  });

  const { data: screens = [], isLoading: screensLoading } = useQuery({
    queryKey: ["admin-all-screens"],
    queryFn: () => base44.entities.Screen.list("-created_date"),
    enabled: authChecked
  });

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl("AdminVenues"));
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
      base44.auth.redirectToLogin(createPageUrl("AdminVenues"));
    }
  };

  // Get unique values for filters
  const cities = [...new Set(venues.map(v => v.city).filter(Boolean))];
  const venueTypes = [...new Set(venues.map(v => v.type).filter(Boolean))];
  const screenSizes = [...new Set(screens.map(s => s.size).filter(Boolean))];

  // Filter and sort venues
  const filteredVenues = venues
    .filter(venue => {
      const matchesSearch = venue.name?.toLowerCase().includes(search.toLowerCase()) ||
                           venue.city?.toLowerCase().includes(search.toLowerCase()) ||
                           venue.owner_id?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = venueFilters.status === "all" || venue.status === venueFilters.status;
      const matchesCity = venueFilters.city === "all" || venue.city === venueFilters.city;
      const matchesType = venueFilters.type === "all" || venue.type === venueFilters.type;
      return matchesSearch && matchesStatus && matchesCity && matchesType;
    })
    .sort((a, b) => {
      const order = venueFilters.sortOrder === "asc" ? 1 : -1;
      if (venueFilters.sortBy === "name") return order * (a.name || "").localeCompare(b.name || "");
      if (venueFilters.sortBy === "city") return order * (a.city || "").localeCompare(b.city || "");
      return order * (new Date(b.created_date) - new Date(a.created_date));
    });

  // Filter and sort screens
  const filteredScreens = screens
    .filter(screen => {
      const venue = venues.find(v => v.id === screen.venue_id);
      const matchesSearch = screen.name?.toLowerCase().includes(search.toLowerCase()) ||
                           venue?.name?.toLowerCase().includes(search.toLowerCase()) ||
                           screen.owner_id?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = screenFilters.status === "all" || screen.status === screenFilters.status;
      const matchesCity = screenFilters.city === "all" || venue?.city === screenFilters.city;
      const matchesSize = screenFilters.size === "all" || screen.size === screenFilters.size;
      return matchesSearch && matchesStatus && matchesCity && matchesSize;
    })
    .sort((a, b) => {
      const order = screenFilters.sortOrder === "asc" ? 1 : -1;
      if (screenFilters.sortBy === "name") return order * (a.name || "").localeCompare(b.name || "");
      if (screenFilters.sortBy === "price") return order * ((a.slot_price || 0) - (b.slot_price || 0));
      return order * (new Date(b.created_date) - new Date(a.created_date));
    });

  const pendingVenuesCount = venues.filter(v => v.status === "pending").length;
  const pendingScreensCount = screens.filter(s => s.status === "pending_approval").length;

  const generateSetupCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'BW-';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Bulk actions
  const handleBulkApproveVenues = async () => {
    if (selectedVenueIds.length === 0) return;
    setProcessing(true);
    try {
      const selectedVenues = venues.filter(v => selectedVenueIds.includes(v.id));
      await Promise.all(selectedVenueIds.map(id => 
        base44.entities.Venue.update(id, { 
          status: "approved",
          approved_at: new Date().toISOString()
        })
      ));
      
      // Send approval emails
      await Promise.all(selectedVenues.map(venue => 
        base44.integrations.Core.SendEmail({
          to: venue.owner_id,
          subject: "✅ Venue Approved! | BeyondWalls",
          body: `Your venue "${venue.name}" has been approved! Log in to add screens and start earning. - BeyondWalls Team`
        }).catch(() => {})
      ));
      
      queryClient.invalidateQueries({ queryKey: ["admin-all-venues"] });
      toast.success(`${selectedVenueIds.length} venues approved`);
      setSelectedVenueIds([]);
    } catch (e) {
      toast.error("Failed to approve some venues");
    }
    setProcessing(false);
  };

  const handleBulkRejectVenues = async () => {
    if (selectedVenueIds.length === 0 || !rejectionReason.trim()) return;
    setProcessing(true);
    try {
      await Promise.all(selectedVenueIds.map(id => 
        base44.entities.Venue.update(id, { 
          status: "rejected",
          rejection_reason: rejectionReason
        })
      ));
      queryClient.invalidateQueries({ queryKey: ["admin-all-venues"] });
      toast.success(`${selectedVenueIds.length} venues rejected`);
      setSelectedVenueIds([]);
      setShowRejectDialog(false);
      setRejectionReason("");
    } catch (e) {
      toast.error("Failed to reject some venues");
    }
    setProcessing(false);
  };

  const handleBulkApproveScreens = async () => {
    if (selectedScreenIds.length === 0) return;
    setProcessing(true);
    try {
      const selectedScreensData = screens.filter(s => selectedScreenIds.includes(s.id));
      const screenUpdates = selectedScreensData.map(screen => {
        const setupCode = generateSetupCode();
        return { screen, setupCode };
      });
      
      await Promise.all(screenUpdates.map(({ screen, setupCode }) => 
        base44.entities.Screen.update(screen.id, {
          status: "pending_setup",
          setup_code: setupCode,
          setup_code_generated_at: new Date().toISOString(),
          approved_at: new Date().toISOString()
        })
      ));
      
      // Send approval emails with setup codes
      await Promise.all(screenUpdates.map(({ screen, setupCode }) => 
        base44.integrations.Core.SendEmail({
          to: screen.owner_id,
          subject: "✅ Screen Approved! Setup Code: " + setupCode + " | BeyondWalls",
          body: `Your screen "${screen.name}" has been approved! Your setup code is: ${setupCode}. Use this code in the BeyondWalls Player to connect your screen. - BeyondWalls Team`
        }).catch(() => {})
      ));
      
      queryClient.invalidateQueries({ queryKey: ["admin-all-screens"] });
      toast.success(`${selectedScreenIds.length} screens approved`);
      setSelectedScreenIds([]);
    } catch (e) {
      toast.error("Failed to approve some screens");
    }
    setProcessing(false);
  };

  const handleBulkRejectScreens = async () => {
    if (selectedScreenIds.length === 0 || !rejectionReason.trim()) return;
    setProcessing(true);
    try {
      await Promise.all(selectedScreenIds.map(id => 
        base44.entities.Screen.update(id, { 
          status: "rejected",
          rejection_reason: rejectionReason
        })
      ));
      queryClient.invalidateQueries({ queryKey: ["admin-all-screens"] });
      toast.success(`${selectedScreenIds.length} screens rejected`);
      setSelectedScreenIds([]);
      setShowRejectDialog(false);
      setRejectionReason("");
    } catch (e) {
      toast.error("Failed to reject some screens");
    }
    setProcessing(false);
  };

  // Single item actions
  const handleApproveVenue = async (venue) => {
    setProcessing(true);
    try {
      await base44.entities.Venue.update(venue.id, { 
        status: "approved",
        approved_at: new Date().toISOString()
      });
      
      // Send approval email
      try {
        await base44.integrations.Core.SendEmail({
          to: venue.owner_id,
          subject: "✅ Venue Approved! | BeyondWalls",
          body: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        BEYONDWALLS
   Digital Out-of-Home Advertising
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Great news! Your venue has been approved!

📋 VENUE DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 Venue: ${venue.name}
📍 Location: ${venue.city}, ${venue.area || ""}
🏷️ Type: ${venue.type}

✅ STATUS: APPROVED
━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 NEXT STEPS:
1. Add screens to your venue
2. Upload your own promotional content
3. Start earning from advertisers!

Log in to your dashboard to get started:
www.beyondwalls.ae

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BeyondWalls - Advertise Beyond Boundaries
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          `.trim()
        });
      } catch (emailErr) {
        console.log("Email failed");
      }
      
      queryClient.invalidateQueries({ queryKey: ["admin-all-venues"] });
      toast.success("Venue approved");
      setSelectedItem(null);
    } catch (e) {
      toast.error("Failed to approve venue");
    }
    setProcessing(false);
  };

  const handleApproveScreen = async (screen) => {
    setProcessing(true);
    try {
      const setupCode = generateSetupCode();
      await base44.entities.Screen.update(screen.id, {
        status: "pending_setup",
        setup_code: setupCode,
        setup_code_generated_at: new Date().toISOString(),
        approved_at: new Date().toISOString()
      });
      
      // Send approval email with setup code
      const venue = venues.find(v => v.id === screen.venue_id);
      try {
        await base44.integrations.Core.SendEmail({
          to: screen.owner_id,
          subject: "✅ Screen Approved! Your Setup Code | BeyondWalls",
          body: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        BEYONDWALLS
   Digital Out-of-Home Advertising
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Great news! Your screen has been approved!

📋 SCREEN DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━
📺 Screen: ${screen.name}
📍 Venue: ${venue?.name || "N/A"}
📐 Size: ${screen.size} (${screen.orientation})

✅ STATUS: APPROVED
━━━━━━━━━━━━━━━━━━━━━━━━━

🔑 YOUR SETUP CODE:
━━━━━━━━━━━━━━━━━━━━━━━━━
${setupCode}
━━━━━━━━━━━━━━━━━━━━━━━━━

📱 HOW TO CONNECT:
1. Open the BeyondWalls Player on your screen
2. Enter the setup code above
3. Your screen will go live automatically!

Need help? Contact us at info@beyondwalls.ae

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BeyondWalls - Advertise Beyond Boundaries
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          `.trim()
        });
      } catch (emailErr) {
        console.log("Email failed");
      }
      
      queryClient.invalidateQueries({ queryKey: ["admin-all-screens"] });
      toast.success(`Screen approved! Setup code: ${setupCode}`);
      setSelectedItem(null);
    } catch (e) {
      toast.error("Failed to approve screen");
    }
    setProcessing(false);
  };

  const handleRejectSingle = async () => {
    if (!selectedItem || !rejectionReason.trim()) return;
    setProcessing(true);
    try {
      if (activeTab === "venues") {
        await base44.entities.Venue.update(selectedItem.id, { 
          status: "rejected",
          rejection_reason: rejectionReason
        });
        queryClient.invalidateQueries({ queryKey: ["admin-all-venues"] });
      } else {
        await base44.entities.Screen.update(selectedItem.id, { 
          status: "rejected",
          rejection_reason: rejectionReason
        });
        queryClient.invalidateQueries({ queryKey: ["admin-all-screens"] });
      }
      toast.success("Rejected successfully");
      setShowRejectDialog(false);
      setSelectedItem(null);
      setRejectionReason("");
    } catch (e) {
      toast.error("Failed to reject");
    }
    setProcessing(false);
  };

  const toggleVenueSelection = (id) => {
    setSelectedVenueIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleScreenSelection = (id) => {
    setSelectedScreenIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAllVenues = () => {
    const pendingIds = filteredVenues.filter(v => v.status === "pending").map(v => v.id);
    setSelectedVenueIds(prev => prev.length === pendingIds.length ? [] : pendingIds);
  };

  const selectAllScreens = () => {
    const pendingIds = filteredScreens.filter(s => s.status === "pending_approval").map(s => s.id);
    setSelectedScreenIds(prev => prev.length === pendingIds.length ? [] : pendingIds);
  };

  const statusColors = {
    pending: "bg-amber-100 text-amber-700",
    pending_approval: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    pending_setup: "bg-blue-100 text-blue-700",
    online: "bg-emerald-100 text-emerald-700",
    offline: "bg-slate-100 text-slate-700",
    rejected: "bg-red-100 text-red-700"
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Approval Center</h1>
          <p className="text-slate-500 mt-1">Review and approve venue and screen registrations</p>
        </div>
        <Link to={createPageUrl("AdminVenueManager")}>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Manage Approved
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">{pendingVenuesCount}</p>
                <p className="text-sm text-amber-600">Pending Venues</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MonitorPlay className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">{pendingScreensCount}</p>
                <p className="text-sm text-blue-600">Pending Screens</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{venues.filter(v => v.status === "approved").length}</p>
                <p className="text-sm text-slate-500">Approved Venues</p>
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
                <p className="text-2xl font-bold text-slate-900">{screens.filter(s => s.status === "online").length}</p>
                <p className="text-sm text-slate-500">Online Screens</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          placeholder="Search by name, location, or owner..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="venues" className="gap-2">
            <Building2 className="w-4 h-4" />
            Venues
            {pendingVenuesCount > 0 && (
              <Badge className="bg-amber-500 text-white ml-1">{pendingVenuesCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="screens" className="gap-2">
            <MonitorPlay className="w-4 h-4" />
            Screens
            {pendingScreensCount > 0 && (
              <Badge className="bg-amber-500 text-white ml-1">{pendingScreensCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Venues Tab */}
        <TabsContent value="venues">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
            <Filter className="w-4 h-4 text-slate-500" />
            <Select value={venueFilters.status} onValueChange={(v) => setVenueFilters({...venueFilters, status: v})}>
              <SelectTrigger className="w-32 h-8 text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={venueFilters.city} onValueChange={(v) => setVenueFilters({...venueFilters, city: v})}>
              <SelectTrigger className="w-32 h-8 text-sm">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={venueFilters.type} onValueChange={(v) => setVenueFilters({...venueFilters, type: v})}>
              <SelectTrigger className="w-32 h-8 text-sm">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {venueTypes.map(type => (
                  <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1 ml-auto">
              <Select value={venueFilters.sortBy} onValueChange={(v) => setVenueFilters({...venueFilters, sortBy: v})}>
                <SelectTrigger className="w-28 h-8 text-sm">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_date">Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="city">City</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setVenueFilters({...venueFilters, sortOrder: venueFilters.sortOrder === "asc" ? "desc" : "asc"})}
              >
                {venueFilters.sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedVenueIds.length > 0 && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-violet-50 border border-violet-200 rounded-lg">
              <span className="text-sm font-medium text-violet-700">{selectedVenueIds.length} selected</span>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleBulkApproveVenues} disabled={processing}>
                {processing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                Approve All
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setShowRejectDialog(true)}>
                <XCircle className="w-4 h-4 mr-1" />
                Reject All
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedVenueIds([])}>Clear</Button>
            </div>
          )}

          <Card>
            <CardContent className="p-0">
              {venuesLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto" />
                </div>
              ) : filteredVenues.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No venues found</p>
                </div>
              ) : (
                <div className="divide-y">
                  {/* Select All Header */}
                  {filteredVenues.some(v => v.status === "pending") && (
                    <div className="p-3 bg-slate-50 flex items-center gap-3">
                      <Checkbox 
                        checked={selectedVenueIds.length === filteredVenues.filter(v => v.status === "pending").length && selectedVenueIds.length > 0}
                        onCheckedChange={selectAllVenues}
                      />
                      <span className="text-sm text-slate-600">Select all pending</span>
                    </div>
                  )}
                  {filteredVenues.map((venue) => (
                    <VenueRow
                      key={venue.id}
                      venue={venue}
                      isSelected={selectedVenueIds.includes(venue.id)}
                      onToggleSelect={() => toggleVenueSelection(venue.id)}
                      onView={() => setSelectedItem(venue)}
                      onApprove={() => handleApproveVenue(venue)}
                      onReject={() => { setSelectedItem(venue); setShowRejectDialog(true); }}
                      onPreviewDoc={setPreviewDoc}
                      processing={processing}
                      statusColors={statusColors}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Screens Tab */}
        <TabsContent value="screens">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg">
            <Filter className="w-4 h-4 text-slate-500" />
            <Select value={screenFilters.status} onValueChange={(v) => setScreenFilters({...screenFilters, status: v})}>
              <SelectTrigger className="w-36 h-8 text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending_approval">Pending</SelectItem>
                <SelectItem value="pending_setup">Setup</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={screenFilters.city} onValueChange={(v) => setScreenFilters({...screenFilters, city: v})}>
              <SelectTrigger className="w-32 h-8 text-sm">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={screenFilters.size} onValueChange={(v) => setScreenFilters({...screenFilters, size: v})}>
              <SelectTrigger className="w-28 h-8 text-sm">
                <SelectValue placeholder="Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sizes</SelectItem>
                {screenSizes.map(size => (
                  <SelectItem key={size} value={size}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1 ml-auto">
              <Select value={screenFilters.sortBy} onValueChange={(v) => setScreenFilters({...screenFilters, sortBy: v})}>
                <SelectTrigger className="w-28 h-8 text-sm">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_date">Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setScreenFilters({...screenFilters, sortOrder: screenFilters.sortOrder === "asc" ? "desc" : "asc"})}
              >
                {screenFilters.sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedScreenIds.length > 0 && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-violet-50 border border-violet-200 rounded-lg">
              <span className="text-sm font-medium text-violet-700">{selectedScreenIds.length} selected</span>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleBulkApproveScreens} disabled={processing}>
                {processing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle2 className="w-4 h-4 mr-1" />}
                Approve All
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setShowRejectDialog(true)}>
                <XCircle className="w-4 h-4 mr-1" />
                Reject All
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedScreenIds([])}>Clear</Button>
            </div>
          )}

          <Card>
            <CardContent className="p-0">
              {screensLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto" />
                </div>
              ) : filteredScreens.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <MonitorPlay className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No screens found</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredScreens.some(s => s.status === "pending_approval") && (
                    <div className="p-3 bg-slate-50 flex items-center gap-3">
                      <Checkbox 
                        checked={selectedScreenIds.length === filteredScreens.filter(s => s.status === "pending_approval").length && selectedScreenIds.length > 0}
                        onCheckedChange={selectAllScreens}
                      />
                      <span className="text-sm text-slate-600">Select all pending</span>
                    </div>
                  )}
                  {filteredScreens.map((screen) => {
                    const venue = venues.find(v => v.id === screen.venue_id);
                    return (
                      <ScreenRow
                        key={screen.id}
                        screen={screen}
                        venue={venue}
                        isSelected={selectedScreenIds.includes(screen.id)}
                        onToggleSelect={() => toggleScreenSelection(screen.id)}
                        onApprove={() => handleApproveScreen(screen)}
                        onReject={() => { setSelectedItem(screen); setShowRejectDialog(true); }}
                        onPreviewDoc={setPreviewDoc}
                        processing={processing}
                        statusColors={statusColors}
                      />
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Venue Details Dialog */}
      <Dialog open={!!selectedItem && !showRejectDialog} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Venue Details</DialogTitle>
          </DialogHeader>
          {selectedItem && activeTab === "venues" && (
            <div className="space-y-4">
              {selectedItem.image_url && (
                <img src={selectedItem.image_url} alt={selectedItem.name} className="w-full h-48 object-cover rounded-xl" />
              )}
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-slate-500">Venue Name</Label><p className="font-medium">{selectedItem.name}</p></div>
                <div><Label className="text-slate-500">Type</Label><p className="font-medium capitalize">{selectedItem.type}</p></div>
                <div><Label className="text-slate-500">Location</Label><p className="font-medium">{selectedItem.city}, {selectedItem.area}</p></div>
                <div><Label className="text-slate-500">Address</Label><p className="font-medium">{selectedItem.address}</p></div>
                <div><Label className="text-slate-500">Contact Person</Label><p className="font-medium">{selectedItem.contact_name}</p></div>
                <div><Label className="text-slate-500">Contact Phone</Label><p className="font-medium">{selectedItem.contact_phone}</p></div>
                <div><Label className="text-slate-500">Owner</Label><p className="font-medium">{selectedItem.owner_id}</p></div>
                <div><Label className="text-slate-500">Status</Label><Badge className={statusColors[selectedItem.status]}>{selectedItem.status}</Badge></div>
              </div>
              {selectedItem.trade_license_url && (
                <div className="border-t pt-4">
                  <Label className="text-slate-500 mb-2 block">Documents</Label>
                  <a href={selectedItem.trade_license_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-violet-600 hover:underline">
                    <FileText className="w-4 h-4" />Trade License<ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              {selectedItem.status === "pending" && (
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowRejectDialog(true)}><XCircle className="w-4 h-4 mr-2" />Reject</Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleApproveVenue(selectedItem)} disabled={processing}>
                    {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}Approve
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={() => { setShowRejectDialog(false); setRejectionReason(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Reject {selectedVenueIds.length > 0 || selectedScreenIds.length > 0 ? "Selected Items" : activeTab === "venues" ? "Venue" : "Screen"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-500">Please provide a reason for rejection.</p>
            <Textarea placeholder="Enter rejection reason..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={4} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowRejectDialog(false); setRejectionReason(""); }}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={selectedVenueIds.length > 0 ? handleBulkRejectVenues : selectedScreenIds.length > 0 ? handleBulkRejectScreens : handleRejectSingle}
              disabled={processing || !rejectionReason.trim()}
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{previewDoc?.name}</DialogTitle></DialogHeader>
          {previewDoc && (
            <div className="space-y-4">
              {previewDoc.url.toLowerCase().includes('.pdf') ? (
                <iframe src={previewDoc.url} className="w-full h-[500px] rounded-lg border" title={previewDoc.name} />
              ) : (
                <img src={previewDoc.url} alt={previewDoc.name} className="w-full max-h-[500px] object-contain rounded-lg" />
              )}
              <div className="flex justify-end">
                <a href={previewDoc.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline"><ExternalLink className="w-4 h-4 mr-2" />Open in New Tab</Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VenueRow({ venue, isSelected, onToggleSelect, onView, onApprove, onReject, onPreviewDoc, processing, statusColors }) {
  return (
    <div className="p-4 hover:bg-slate-50 transition-colors">
      <div className="flex items-start gap-4">
        {venue.status === "pending" && (
          <Checkbox checked={isSelected} onCheckedChange={onToggleSelect} className="mt-1" />
        )}
        {venue.image_url ? (
          <img src={venue.image_url} alt="" className="w-14 h-14 rounded-lg object-cover" />
        ) : (
          <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-7 h-7 text-slate-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-900">{venue.name}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                <MapPin className="w-4 h-4" />{venue.city}, {venue.area}
                <Badge variant="secondary" className="capitalize">{venue.type}</Badge>
              </div>
              <p className="text-sm text-slate-500 mt-1">{venue.owner_id}</p>
            </div>
            <Badge className={statusColors[venue.status]}>{venue.status}</Badge>
          </div>
          <div className="flex items-center gap-2 mt-3">
            {venue.trade_license_url && (
              <Button variant="outline" size="sm" onClick={() => onPreviewDoc({ url: venue.trade_license_url, name: "Trade License" })}>
                <FileText className="w-4 h-4 mr-1" />License
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onView}><Eye className="w-4 h-4 mr-1" />Details</Button>
            {venue.status === "pending" && (
              <>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={onApprove} disabled={processing}>
                  <CheckCircle2 className="w-4 h-4 mr-1" />Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={onReject}><XCircle className="w-4 h-4 mr-1" />Reject</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScreenRow({ screen, venue, isSelected, onToggleSelect, onApprove, onReject, onPreviewDoc, processing, statusColors }) {
  return (
    <div className="p-4 hover:bg-slate-50 transition-colors">
      <div className="flex items-start gap-4">
        {screen.status === "pending_approval" && (
          <Checkbox checked={isSelected} onCheckedChange={onToggleSelect} className="mt-1" />
        )}
        <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center">
          <MonitorPlay className="w-7 h-7 text-slate-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-slate-900">{screen.name}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                <Building2 className="w-4 h-4" />{venue?.name || "Unknown"} • {venue?.city}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm mt-1">
                <Badge variant="outline">{screen.size}</Badge>
                <Badge variant="outline" className="capitalize">{screen.orientation}</Badge>
                <span className="text-slate-500">AED {screen.slot_price}/wk</span>
              </div>
            </div>
            <Badge className={statusColors[screen.status]}>{screen.status?.replace("_", " ")}</Badge>
          </div>
          {(screen.owner_slot_1_url || screen.owner_slot_2_url || screen.owner_slot_3_url) && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-slate-500">Ads:</span>
              {[screen.owner_slot_1_url, screen.owner_slot_2_url, screen.owner_slot_3_url].filter(Boolean).map((url, i) => (
                <button key={i} onClick={() => onPreviewDoc({ url, name: `Slot ${i + 1}` })} className="w-8 h-8 rounded border overflow-hidden hover:ring-2 ring-violet-500">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {screen.status === "pending_approval" && (
            <div className="flex items-center gap-2 mt-3">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={onApprove} disabled={processing}>
                <CheckCircle2 className="w-4 h-4 mr-1" />Approve
              </Button>
              <Button size="sm" variant="destructive" onClick={onReject}><XCircle className="w-4 h-4 mr-1" />Reject</Button>
            </div>
          )}
          {screen.setup_code && (
            <div className="mt-2 p-2 bg-violet-50 rounded-lg inline-flex items-center gap-2">
              <span className="text-sm text-violet-600">Setup Code:</span>
              <code className="font-mono font-bold text-violet-700">{screen.setup_code}</code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}