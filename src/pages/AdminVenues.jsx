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
  Clock,
  Users,
  Eye,
  Image as ImageIcon
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import DocumentPreview from "@/components/DocumentPreview";

export default function AdminVenues() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("venues");
  const [selectedItem, setSelectedItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [processing, setProcessing] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  // All hooks must be called before any conditional returns
  const { data: venues = [], isLoading: venuesLoading } = useQuery({
    queryKey: ["admin-pending-venues"],
    queryFn: () => base44.entities.Venue.list("-created_date"),
    enabled: authChecked
  });

  const { data: screens = [], isLoading: screensLoading } = useQuery({
    queryKey: ["admin-pending-screens"],
    queryFn: () => base44.entities.Screen.list("-created_date"),
    enabled: authChecked
  });

  const { data: allVenues = [] } = useQuery({
    queryKey: ["all-venues-lookup"],
    queryFn: () => base44.entities.Venue.list(),
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

  const pendingVenues = venues.filter(v => v.status === "pending");
  const pendingScreens = screens.filter(s => s.status === "pending_approval");

  const filteredVenues = venues.filter(venue => {
    const matchesSearch = venue.name?.toLowerCase().includes(search.toLowerCase()) ||
                         venue.city?.toLowerCase().includes(search.toLowerCase()) ||
                         venue.owner_id?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const filteredScreens = screens.filter(screen => {
    const venue = allVenues.find(v => v.id === screen.venue_id);
    const matchesSearch = screen.name?.toLowerCase().includes(search.toLowerCase()) ||
                         venue?.name?.toLowerCase().includes(search.toLowerCase()) ||
                         screen.owner_id?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const generateSetupCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'BW-';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleApproveVenue = async (venue) => {
    setProcessing(venue.id);
    try {
      await base44.entities.Venue.update(venue.id, { 
        status: "approved",
        approved_at: new Date().toISOString()
      });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-venues"] });
      toast.success("Venue approved successfully");
      setSelectedItem(null);
    } catch (e) {
      toast.error("Failed to approve venue");
    }
    setProcessing(null);
  };

  const handleApproveScreen = async (screen) => {
    setProcessing(screen.id);
    try {
      const setupCode = generateSetupCode();
      await base44.entities.Screen.update(screen.id, {
        status: "pending_setup",
        setup_code: setupCode,
        setup_code_generated_at: new Date().toISOString(),
        approved_at: new Date().toISOString()
      });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-screens"] });
      toast.success(`Screen approved! Setup code: ${setupCode}`);
      setSelectedItem(null);
    } catch (e) {
      toast.error("Failed to approve screen");
    }
    setProcessing(null);
  };

  const handleReject = async () => {
    if (!selectedItem) return;
    setProcessing(selectedItem.id);
    try {
      if (activeTab === "venues") {
        await base44.entities.Venue.update(selectedItem.id, { 
          status: "rejected",
          rejection_reason: rejectionReason
        });
        queryClient.invalidateQueries({ queryKey: ["admin-pending-venues"] });
      } else {
        await base44.entities.Screen.update(selectedItem.id, { 
          status: "rejected",
          rejection_reason: rejectionReason
        });
        queryClient.invalidateQueries({ queryKey: ["admin-pending-screens"] });
      }
      toast.success("Rejected successfully");
      setShowRejectDialog(false);
      setSelectedItem(null);
      setRejectionReason("");
    } catch (e) {
      toast.error("Failed to reject");
    }
    setProcessing(null);
  };

  const statusColors = {
    pending: "bg-amber-100 text-amber-700",
    pending_approval: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    pending_setup: "bg-blue-100 text-blue-700",
    online: "bg-emerald-100 text-emerald-700",
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
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Approval Center</h1>
        <p className="text-slate-500 mt-1">Review and approve venue and screen registrations</p>
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
                <p className="text-2xl font-bold text-amber-700">{pendingVenues.length}</p>
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
                <p className="text-2xl font-bold text-blue-700">{pendingScreens.length}</p>
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
        <TabsList className="mb-6">
          <TabsTrigger value="venues" className="gap-2">
            <Building2 className="w-4 h-4" />
            Venues
            {pendingVenues.length > 0 && (
              <Badge className="bg-amber-500 text-white ml-1">{pendingVenues.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="screens" className="gap-2">
            <MonitorPlay className="w-4 h-4" />
            Screens
            {pendingScreens.length > 0 && (
              <Badge className="bg-amber-500 text-white ml-1">{pendingScreens.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Venues Tab */}
        <TabsContent value="venues">
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
                  {filteredVenues.map((venue) => (
                    <div key={venue.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-4">
                        {venue.image_url ? (
                          <img src={venue.image_url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                        ) : (
                          <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-slate-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-slate-900">{venue.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                <MapPin className="w-4 h-4" />
                                {venue.city}, {venue.area}
                                <span className="text-slate-300">•</span>
                                <Badge variant="secondary" className="capitalize">{venue.type}</Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {venue.owner_id}
                                </span>
                                {venue.contact_phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {venue.contact_phone}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={statusColors[venue.status]}>{venue.status}</Badge>
                            </div>
                          </div>
                          
                          {/* Documents */}
                          <div className="flex items-center gap-2 mt-3">
                            {venue.trade_license_url && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setPreviewDoc({ url: venue.trade_license_url, name: "Trade License" })}
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                Trade License
                              </Button>
                            )}
                            {venue.image_url && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setPreviewDoc({ url: venue.image_url, name: "Venue Photo" })}
                              >
                                <ImageIcon className="w-4 h-4 mr-1" />
                                Photo
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedItem(venue)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Details
                            </Button>
                          </div>

                          {/* Actions for pending */}
                          {venue.status === "pending" && (
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => handleApproveVenue(venue)}
                                disabled={processing === venue.id}
                              >
                                {processing === venue.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                )}
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  setSelectedItem(venue);
                                  setShowRejectDialog(true);
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Screens Tab */}
        <TabsContent value="screens">
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
                  {filteredScreens.map((screen) => {
                    const venue = allVenues.find(v => v.id === screen.venue_id);
                    return (
                      <div key={screen.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                            <MonitorPlay className="w-8 h-8 text-slate-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="font-semibold text-slate-900">{screen.name}</h3>
                                <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                  <Building2 className="w-4 h-4" />
                                  {venue?.name || "Unknown Venue"}
                                  <span className="text-slate-300">•</span>
                                  {venue?.city}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 mt-2">
                                  <Badge variant="outline">{screen.size}</Badge>
                                  <Badge variant="outline" className="capitalize">{screen.orientation}</Badge>
                                  <Badge variant="outline">{screen.device_type}</Badge>
                                  <span className="text-slate-400">•</span>
                                  <span>AED {screen.slot_price}/week</span>
                                </div>
                                <p className="text-sm text-slate-500 mt-1">
                                  Owner: {screen.owner_id}
                                </p>
                              </div>
                              <Badge className={statusColors[screen.status]}>
                                {screen.status?.replace("_", " ")}
                              </Badge>
                            </div>

                            {/* Owner Slot Previews */}
                            {(screen.owner_slot_1_url || screen.owner_slot_2_url || screen.owner_slot_3_url) && (
                              <div className="flex items-center gap-2 mt-3">
                                <span className="text-xs text-slate-500">Owner Ads:</span>
                                {[screen.owner_slot_1_url, screen.owner_slot_2_url, screen.owner_slot_3_url]
                                  .filter(Boolean)
                                  .map((url, i) => (
                                    <button
                                      key={i}
                                      onClick={() => setPreviewDoc({ url, name: `Owner Slot ${i + 1}` })}
                                      className="w-10 h-10 rounded border overflow-hidden hover:ring-2 ring-violet-500"
                                    >
                                      <img src={url} alt="" className="w-full h-full object-cover" />
                                    </button>
                                  ))}
                              </div>
                            )}

                            {/* Actions for pending */}
                            {screen.status === "pending_approval" && (
                              <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                                <Button
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                  onClick={() => handleApproveScreen(screen)}
                                  disabled={processing === screen.id}
                                >
                                  {processing === screen.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                  ) : (
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                  )}
                                  Approve & Generate Code
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedItem(screen);
                                    setShowRejectDialog(true);
                                  }}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}

                            {/* Show setup code if available */}
                            {screen.setup_code && (
                              <div className="mt-3 p-2 bg-violet-50 rounded-lg inline-flex items-center gap-2">
                                <span className="text-sm text-violet-600">Setup Code:</span>
                                <code className="font-mono font-bold text-violet-700">{screen.setup_code}</code>
                              </div>
                            )}
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
      <Dialog open={!!selectedItem && !showRejectDialog} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {activeTab === "venues" ? "Venue Details" : "Screen Details"}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && activeTab === "venues" && (
            <div className="space-y-4">
              {selectedItem.image_url && (
                <img 
                  src={selectedItem.image_url} 
                  alt={selectedItem.name}
                  className="w-full h-48 object-cover rounded-xl"
                />
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-500">Venue Name</Label>
                  <p className="font-medium">{selectedItem.name}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Type</Label>
                  <p className="font-medium capitalize">{selectedItem.type}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Location</Label>
                  <p className="font-medium">{selectedItem.city}, {selectedItem.area}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Address</Label>
                  <p className="font-medium">{selectedItem.address}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Contact Person</Label>
                  <p className="font-medium">{selectedItem.contact_name}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Contact Phone</Label>
                  <p className="font-medium">{selectedItem.contact_phone}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Contact Email</Label>
                  <p className="font-medium">{selectedItem.contact_email}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Owner</Label>
                  <p className="font-medium">{selectedItem.owner_id}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Operating Hours</Label>
                  <p className="font-medium">{selectedItem.operating_hours || "—"}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Daily Footfall</Label>
                  <p className="font-medium">{selectedItem.avg_daily_footfall?.toLocaleString() || "—"}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Submitted</Label>
                  <p className="font-medium">
                    {selectedItem.created_date ? format(new Date(selectedItem.created_date), "PPP") : "—"}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-500">Status</Label>
                  <Badge className={statusColors[selectedItem.status]}>{selectedItem.status}</Badge>
                </div>
              </div>
              
              {/* Documents Section */}
              <div className="border-t pt-4">
                <Label className="text-slate-500 mb-2 block">Documents</Label>
                <div className="flex gap-2">
                  {selectedItem.trade_license_url ? (
                    <a 
                      href={selectedItem.trade_license_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-violet-600" />
                      <span className="text-sm">Trade License</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <p className="text-sm text-slate-400">No documents uploaded</p>
                  )}
                </div>
              </div>

              {selectedItem.status === "pending" && (
                <DialogFooter>
                  <Button 
                    variant="outline"
                    onClick={() => setShowRejectDialog(true)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleApproveVenue(selectedItem)}
                    disabled={processing === selectedItem.id}
                  >
                    {processing === selectedItem.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Approve
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {activeTab === "venues" ? "Venue" : "Screen"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-slate-500">
              Please provide a reason for rejection. This will be shared with the owner.
            </p>
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRejectDialog(false);
              setRejectionReason("");
            }}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
            >
              {processing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewDoc?.name}</DialogTitle>
          </DialogHeader>
          {previewDoc && (
            <div className="space-y-4">
              {previewDoc.url.toLowerCase().includes('.pdf') ? (
                <iframe 
                  src={previewDoc.url} 
                  className="w-full h-[500px] rounded-lg border"
                  title={previewDoc.name}
                />
              ) : (
                <img 
                  src={previewDoc.url} 
                  alt={previewDoc.name}
                  className="w-full max-h-[500px] object-contain rounded-lg"
                />
              )}
              <div className="flex justify-end">
                <a 
                  href={previewDoc.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}