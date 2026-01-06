import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Shield,
  CheckCircle2,
  XCircle,
  MapPin,
  Search,
  Filter,
  Eye,
  Clock,
  AlertTriangle,
  FileText,
  Download,
  Loader2,
  Building2,
  MonitorPlay,
  User,
  Calendar,
  Ban,
  Map as MapIcon,
  List,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function MunicipalApproval() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [inspectorComments, setInspectorComments] = useState("");
  const [processing, setProcessing] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [viewMode, setViewMode] = useState("list");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl("MunicipalApproval"));
        return;
      }
      const userData = await base44.auth.me();
      
      // Security: Only municipal inspectors can access
      if (userData?.user_role !== "municipal_inspector") {
        window.location.href = createPageUrl("Dashboard");
        return;
      }
      
      setUser(userData);
      setAuthChecked(true);
    } catch (e) {
      base44.auth.redirectToLogin(createPageUrl("MunicipalApproval"));
    }
  };

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["municipal-bookings"],
    queryFn: () => base44.entities.AdSlotBooking.list("-created_date"),
    enabled: authChecked
  });

  const { data: screens = [] } = useQuery({
    queryKey: ["municipal-screens"],
    queryFn: () => base44.entities.Screen.list(),
    enabled: authChecked
  });

  const { data: venues = [] } = useQuery({
    queryKey: ["municipal-venues"],
    queryFn: () => base44.entities.Venue.list(),
    enabled: authChecked
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => base44.entities.AuditLog.list("-created_date", 50),
    enabled: authChecked
  });

  if (!authChecked) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  const createAuditLog = async (actionType, booking, details) => {
    await base44.entities.AuditLog.create({
      action_type: actionType,
      action_by_user_id: user.email,
      action_by_user_name: user.full_name,
      action_by_role: "municipal_inspector",
      booking_id: booking.id,
      screen_id: booking.screen_id,
      action_details: details
    });
  };

  const handleApprove = async (booking) => {
    setProcessing(true);
    try {
      await base44.entities.AdSlotBooking.update(booking.id, {
        municipal_approval_status: "approved",
        municipal_approved_by: user.email,
        municipal_approved_at: new Date().toISOString(),
        municipal_inspector_comments: inspectorComments,
        status: "active"
      });

      await createAuditLog("ad_municipal_approved", booking, {
        old_status: booking.municipal_approval_status,
        new_status: "approved",
        comments: inspectorComments
      });

      queryClient.invalidateQueries({ queryKey: ["municipal-bookings"] });
      toast.success("Ad approved and activated");
      setSelectedBooking(null);
      setInspectorComments("");
    } catch (error) {
      toast.error("Failed to approve ad");
    }
    setProcessing(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setProcessing(true);
    try {
      await base44.entities.AdSlotBooking.update(selectedBooking.id, {
        municipal_approval_status: "rejected",
        municipal_rejection_reason: rejectionReason,
        municipal_inspector_comments: inspectorComments,
        status: "cancelled"
      });

      await createAuditLog("ad_municipal_rejected", selectedBooking, {
        old_status: selectedBooking.municipal_approval_status,
        new_status: "rejected",
        reason: rejectionReason,
        comments: inspectorComments
      });

      queryClient.invalidateQueries({ queryKey: ["municipal-bookings"] });
      toast.success("Ad rejected");
      setShowRejectDialog(false);
      setSelectedBooking(null);
      setRejectionReason("");
      setInspectorComments("");
    } catch (error) {
      toast.error("Failed to reject ad");
    }
    setProcessing(false);
  };

  const handleRevoke = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a revocation reason");
      return;
    }

    setProcessing(true);
    try {
      await base44.entities.AdSlotBooking.update(selectedBooking.id, {
        municipal_approval_status: "revoked",
        municipal_revoked_by: user.email,
        municipal_revoked_at: new Date().toISOString(),
        municipal_rejection_reason: rejectionReason,
        status: "cancelled"
      });

      await createAuditLog("ad_revoked", selectedBooking, {
        old_status: selectedBooking.municipal_approval_status,
        new_status: "revoked",
        reason: rejectionReason
      });

      queryClient.invalidateQueries({ queryKey: ["municipal-bookings"] });
      toast.success("Ad revoked immediately");
      setShowRevokeDialog(false);
      setSelectedBooking(null);
      setRejectionReason("");
    } catch (error) {
      toast.error("Failed to revoke ad");
    }
    setProcessing(false);
  };

  const handleBulkApprove = async () => {
    if (selectedBookings.length === 0) return;
    setProcessing(true);
    try {
      await Promise.all(selectedBookings.map(id => {
        const booking = bookings.find(b => b.id === id);
        return Promise.all([
          base44.entities.AdSlotBooking.update(id, {
            municipal_approval_status: "approved",
            municipal_approved_by: user.email,
            municipal_approved_at: new Date().toISOString(),
            status: "active"
          }),
          createAuditLog("ad_municipal_approved", booking, {
            old_status: "pending",
            new_status: "approved",
            comments: "Bulk approval"
          })
        ]);
      }));

      queryClient.invalidateQueries({ queryKey: ["municipal-bookings"] });
      toast.success(`${selectedBookings.length} ads approved`);
      setSelectedBookings([]);
    } catch (error) {
      toast.error("Failed to approve some ads");
    }
    setProcessing(false);
  };

  const filteredBookings = bookings.filter(booking => {
    const screen = screens.find(s => s.id === booking.screen_id);
    const venue = venues.find(v => v.id === screen?.venue_id);
    
    const matchesSearch = booking.campaign_name?.toLowerCase().includes(search.toLowerCase()) ||
                         venue?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || booking.municipal_approval_status === statusFilter;
    const matchesZone = zoneFilter === "all" || venue?.area === zoneFilter;
    
    return matchesSearch && matchesStatus && matchesZone;
  });

  const pendingCount = bookings.filter(b => b.municipal_approval_status === "pending").length;
  const approvedCount = bookings.filter(b => b.municipal_approval_status === "approved").length;
  const rejectedCount = bookings.filter(b => b.municipal_approval_status === "rejected").length;

  const zones = [...new Set(venues.map(v => v.area).filter(Boolean))];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">Dubai Municipality Approval</h1>
            <p className="text-slate-500 text-sm sm:text-base">Review and monitor digital advertising content</p>
          </div>
        </div>
        {user?.municipal_inspector_zone && (
          <Badge className="bg-blue-100 text-blue-700 mt-2">
            <MapPin className="w-3 h-3 mr-1" />
            Zone: {user.municipal_inspector_zone}
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              <div>
                <p className="text-xl sm:text-2xl font-bold text-amber-700">{pendingCount}</p>
                <p className="text-xs sm:text-sm text-amber-600">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              <div>
                <p className="text-xl sm:text-2xl font-bold text-emerald-700">{approvedCount}</p>
                <p className="text-xs sm:text-sm text-emerald-600">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-red-50 border-rose-200">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" />
              <div>
                <p className="text-xl sm:text-2xl font-bold text-rose-700">{rejectedCount}</p>
                <p className="text-xs sm:text-sm text-rose-600">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              <div>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{bookings.filter(b => b.status === "active").length}</p>
                <p className="text-xs sm:text-sm text-slate-500">Live Now</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search campaigns or venues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-sm sm:text-base"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="revoked">Revoked</SelectItem>
          </SelectContent>
        </Select>
        <Select value={zoneFilter} onValueChange={setZoneFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Zones" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Zones</SelectItem>
            {zones.map(zone => (
              <SelectItem key={zone} value={zone}>{zone}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "map" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("map")}
          >
            <MapIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedBookings.length > 0 && (
        <Card className="mb-4 bg-blue-50 border-blue-200">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <span className="text-sm font-medium text-blue-700">{selectedBookings.length} selected</span>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={handleBulkApprove} disabled={processing}>
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Approve All
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedBookings([])}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={viewMode} onValueChange={setViewMode}>
        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto" />
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Shield className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No ads found</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredBookings.map((booking) => {
                    const screen = screens.find(s => s.id === booking.screen_id);
                    const venue = venues.find(v => v.id === screen?.venue_id);
                    const isSelected = selectedBookings.includes(booking.id);
                    
                    return (
                      <div key={booking.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start gap-3 sm:gap-4">
                          {booking.municipal_approval_status === "pending" && (
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedBookings([...selectedBookings, booking.id]);
                                } else {
                                  setSelectedBookings(selectedBookings.filter(id => id !== booking.id));
                                }
                              }}
                              className="mt-1"
                            />
                          )}
                          
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                            {booking.creative_type === "video" ? (
                              <video src={booking.creative_url} className="w-full h-full object-cover" />
                            ) : (
                              <img src={booking.creative_url} className="w-full h-full object-cover" alt="" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-slate-900 truncate">{booking.campaign_name}</h3>
                                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 mt-1">
                                  <span className="flex items-center gap-1">
                                    <MonitorPlay className="w-3 h-3" />
                                    {screen?.name}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Building2 className="w-3 h-3" />
                                    {venue?.name}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {venue?.city}, {venue?.area}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-500 mt-1">
                                  Advertiser: {booking.advertiser_id}
                                </p>
                              </div>
                              <Badge className={
                                booking.municipal_approval_status === "approved" ? "bg-emerald-100 text-emerald-700" :
                                booking.municipal_approval_status === "rejected" ? "bg-rose-100 text-rose-700" :
                                booking.municipal_approval_status === "revoked" ? "bg-red-100 text-red-700" :
                                "bg-amber-100 text-amber-700"
                              }>
                                {booking.municipal_approval_status}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedBooking(booking)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Review
                              </Button>
                              {booking.municipal_approval_status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      handleApprove(booking);
                                    }}
                                    disabled={processing}
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setShowRejectDialog(true);
                                    }}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              {booking.municipal_approval_status === "approved" && booking.status === "active" && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowRevokeDialog(true);
                                  }}
                                >
                                  <Ban className="w-4 h-4 mr-1" />
                                  Revoke
                                </Button>
                              )}
                            </div>
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

        <TabsContent value="map">
          <Card>
            <CardContent className="p-0">
              <div className="h-[600px] rounded-lg overflow-hidden">
                <MapContainer
                  center={[25.2048, 55.2708]}
                  zoom={11}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  {filteredBookings.map((booking) => {
                    const screen = screens.find(s => s.id === booking.screen_id);
                    const venue = venues.find(v => v.id === screen?.venue_id);
                    if (!venue?.latitude || !venue?.longitude) return null;

                    return (
                      <Marker
                        key={booking.id}
                        position={[venue.latitude, venue.longitude]}
                      >
                        <Popup>
                          <div className="p-2">
                            <p className="font-semibold text-sm">{booking.campaign_name}</p>
                            <p className="text-xs text-slate-500">{venue.name}</p>
                            <Badge className={
                              booking.municipal_approval_status === "approved" ? "bg-emerald-100 text-emerald-700 mt-2" :
                              "bg-amber-100 text-amber-700 mt-2"
                            }>
                              {booking.municipal_approval_status}
                            </Badge>
                            <Button
                              size="sm"
                              className="w-full mt-2"
                              onClick={() => setSelectedBooking(booking)}
                            >
                              Review
                            </Button>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={!!selectedBooking && !showRejectDialog && !showRevokeDialog} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Ad Review - {selectedBooking?.campaign_name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              {/* Creative Preview */}
              <div className="border rounded-xl overflow-hidden">
                {selectedBooking.creative_type === "video" ? (
                  <video src={selectedBooking.creative_url} className="w-full max-h-96 object-contain bg-slate-900" controls />
                ) : (
                  <img src={selectedBooking.creative_url} className="w-full max-h-96 object-contain bg-slate-100" alt="" />
                )}
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Advertiser</p>
                  <p className="font-medium">{selectedBooking.advertiser_id}</p>
                </div>
                <div>
                  <p className="text-slate-500">Screen Location</p>
                  <p className="font-medium">
                    {screens.find(s => s.id === selectedBooking.screen_id)?.name}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Venue</p>
                  <p className="font-medium">
                    {venues.find(v => v.id === screens.find(s => s.id === selectedBooking.screen_id)?.venue_id)?.name}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Duration</p>
                  <p className="font-medium">
                    {format(new Date(selectedBooking.start_date), "MMM d")} - {format(new Date(selectedBooking.end_date), "MMM d")}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Submission Date</p>
                  <p className="font-medium">
                    {selectedBooking.created_date && format(new Date(selectedBooking.created_date), "PPP")}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Current Status</p>
                  <Badge className={
                    selectedBooking.municipal_approval_status === "approved" ? "bg-emerald-100 text-emerald-700" :
                    selectedBooking.municipal_approval_status === "rejected" ? "bg-rose-100 text-rose-700" :
                    "bg-amber-100 text-amber-700"
                  }>
                    {selectedBooking.municipal_approval_status}
                  </Badge>
                </div>
              </div>

              {/* Audit Trail */}
              {auditLogs.filter(log => log.booking_id === selectedBooking.id).length > 0 && (
                <div className="border-t pt-4">
                  <p className="font-semibold text-slate-900 mb-2">Audit Trail</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {auditLogs
                      .filter(log => log.booking_id === selectedBooking.id)
                      .map((log, i) => (
                        <div key={i} className="text-xs bg-slate-50 rounded p-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium capitalize">{log.action_type.replace(/_/g, " ")}</span>
                            <span className="text-slate-500">
                              {log.created_date && format(new Date(log.created_date), "PPp")}
                            </span>
                          </div>
                          <p className="text-slate-600">By: {log.action_by_user_name || log.action_by_user_id}</p>
                          {log.action_details?.comments && (
                            <p className="text-slate-500 mt-1">"{log.action_details.comments}"</p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Inspector Comments */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">
                  Inspector Comments (Optional)
                </label>
                <Textarea
                  placeholder="Add comments or observations..."
                  value={inspectorComments}
                  onChange={(e) => setInspectorComments(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            {selectedBooking?.municipal_approval_status === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectDialog(true);
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => handleApprove(selectedBooking)}
                  disabled={processing}
                >
                  {processing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  Approve Ad
                </Button>
              </>
            )}
            {selectedBooking?.municipal_approval_status === "approved" && selectedBooking?.status === "active" && (
              <Button
                variant="destructive"
                onClick={() => setShowRevokeDialog(true)}
              >
                <Ban className="w-4 h-4 mr-2" />
                Revoke Ad
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Advertisement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-600">
              This ad will be rejected and the advertiser will be notified.
            </p>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">
                Rejection Reason *
              </label>
              <Textarea
                placeholder="Specify the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
            >
              {processing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Dialog */}
      <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Revoke Live Advertisement
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-medium">
                ⚠️ This will immediately remove the ad from all screens.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">
                Revocation Reason *
              </label>
              <Textarea
                placeholder="Specify the reason for immediate revocation..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRevokeDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevoke}
              disabled={processing || !rejectionReason.trim()}
            >
              {processing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Ban className="w-4 h-4 mr-2" />
              )}
              Revoke Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}