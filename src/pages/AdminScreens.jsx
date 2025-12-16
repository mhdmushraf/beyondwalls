import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, differenceInMinutes } from "date-fns";
import {
  Search,
  MonitorPlay,
  Wifi,
  WifiOff,
  Building2,
  Activity,
  CheckCircle2,
  XCircle,
  QrCode,
  Copy,
  Loader2,
  Pencil,
  Eye,
  X,
  Upload,
  Save,
  LayoutGrid,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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
import { toast } from "sonner";
import LiveScreenPreview from "@/components/previews/LiveScreenPreview";

export default function AdminScreens() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [approving, setApproving] = useState(null);
  const [showSetupCode, setShowSetupCode] = useState(null);
  const [editScreen, setEditScreen] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [previewScreen, setPreviewScreen] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl("AdminScreens"));
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
      base44.auth.redirectToLogin(createPageUrl("AdminScreens"));
    }
  };

  const { data: screens = [], isLoading } = useQuery({
    queryKey: ["admin-screens"],
    queryFn: () => base44.entities.Screen.list("-created_date"),
    enabled: authChecked
  });

  const { data: venues = [] } = useQuery({
    queryKey: ["admin-venues-lookup"],
    queryFn: () => base44.entities.Venue.list(),
    enabled: authChecked
  });

  const { data: allBookings = [] } = useQuery({
    queryKey: ["admin-screen-bookings"],
    queryFn: () => base44.entities.AdSlotBooking.filter({ status: "active" }),
    enabled: authChecked
  });

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

  const generateSetupCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'BW-';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleApprove = async (screen) => {
    setApproving(screen.id);
    try {
      const setupCode = generateSetupCode();
      await base44.entities.Screen.update(screen.id, {
        status: "pending_setup",
        setup_code: setupCode,
        setup_code_generated_at: new Date().toISOString(),
        approved_at: new Date().toISOString()
      });
      queryClient.invalidateQueries({ queryKey: ["admin-screens"] });
      toast.success("Screen approved! Setup code generated.");
      setShowSetupCode({ ...screen, setup_code: setupCode });
    } catch (e) {
      toast.error("Failed to approve screen");
    }
    setApproving(null);
  };

  const handleReject = async (screen) => {
    if (!confirm("Are you sure you want to reject this screen?")) return;
    setApproving(screen.id);
    try {
      await base44.entities.Screen.delete(screen.id);
      queryClient.invalidateQueries({ queryKey: ["admin-screens"] });
      toast.success("Screen rejected and removed");
    } catch (e) {
      toast.error("Failed to reject screen");
    }
    setApproving(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleEditScreen = (screen) => {
    setEditScreen(screen);
    setEditData({
      name: screen.name || "",
      slot_price: screen.slot_price || 0,
      size: screen.size || "",
      orientation: screen.orientation || "",
      resolution: screen.resolution || "FHD",
      status: screen.status || "",
      owner_slot_1_url: screen.owner_slot_1_url || "",
      owner_slot_1_type: screen.owner_slot_1_type || "image",
      owner_slot_2_url: screen.owner_slot_2_url || "",
      owner_slot_2_type: screen.owner_slot_2_type || "image",
      owner_slot_3_url: screen.owner_slot_3_url || "",
      owner_slot_3_type: screen.owner_slot_3_type || "image",
    });
  };

  const handleSaveScreen = async () => {
    setSaving(true);
    try {
      await base44.entities.Screen.update(editScreen.id, editData);
      queryClient.invalidateQueries({ queryKey: ["admin-screens"] });
      toast.success("Screen updated successfully");
      setEditScreen(null);
    } catch (e) {
      toast.error("Failed to update screen");
    }
    setSaving(false);
  };

  const handleOwnerSlotUpload = async (slotNumber, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      toast.error("Please upload an image or video file");
      return;
    }

    setUploading(slotNumber);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setEditData({
        ...editData,
        [`owner_slot_${slotNumber}_url`]: file_url,
        [`owner_slot_${slotNumber}_type`]: isVideo ? "video" : "image"
      });
      toast.success("File uploaded");
    } catch (error) {
      toast.error("Failed to upload file");
    }
    setUploading(null);
  };

  const getScreenSlots = (screen) => {
    const slots = [];
    if (screen?.owner_slot_1_url) slots.push({ url: screen.owner_slot_1_url, type: screen.owner_slot_1_type || "image", name: "Owner Ad 1" });
    if (screen?.owner_slot_2_url) slots.push({ url: screen.owner_slot_2_url, type: screen.owner_slot_2_type || "image", name: "Owner Ad 2" });
    if (screen?.owner_slot_3_url) slots.push({ url: screen.owner_slot_3_url, type: screen.owner_slot_3_type || "image", name: "Owner Ad 3" });
    const screenBookings = allBookings.filter(b => b.screen_id === screen.id);
    screenBookings.forEach(b => {
      if (b.creative_url) slots.push({ url: b.creative_url, type: b.creative_type || "image", name: b.campaign_name || "Ad" });
    });
    return slots;
  };

  const filteredScreens = screens.filter(screen => {
    const venue = venues.find(v => v.id === screen.venue_id);
    const matchesSearch = screen.name?.toLowerCase().includes(search.toLowerCase()) ||
                         venue?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || screen.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const onlineCount = screens.filter(s => s.status === "online").length;
  const offlineCount = screens.filter(s => s.status === "offline").length;

  const statusColors = {
    online: "bg-emerald-100 text-emerald-700",
    offline: "bg-slate-100 text-slate-700",
    maintenance: "bg-amber-100 text-amber-700",
    pending_setup: "bg-blue-100 text-blue-700",
    pending_approval: "bg-amber-100 text-amber-700"
  };

  const pendingCount = screens.filter(s => s.status === "pending_approval").length;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Screen Management</h1>
        <p className="text-slate-500 mt-1">Monitor and manage all screens on the network</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Online</p>
                <p className="text-3xl font-bold">{onlineCount}</p>
              </div>
              <Wifi className="w-8 h-8 text-emerald-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Offline</p>
                <p className="text-3xl font-bold text-slate-900">{offlineCount}</p>
              </div>
              <WifiOff className="w-8 h-8 text-slate-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Total Screens</p>
                <p className="text-3xl font-bold text-slate-900">{screens.length}</p>
              </div>
              <MonitorPlay className="w-8 h-8 text-slate-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-slate-500 text-sm mb-2">Network Health</p>
            <Progress value={screens.length > 0 ? (onlineCount / screens.length) * 100 : 0} className="h-2 mb-2" />
            <p className="text-sm font-medium">
              {screens.length > 0 ? Math.round((onlineCount / screens.length) * 100) : 0}% Online
            </p>
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
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending_approval" className="relative">
              Pending
              {pendingCount > 0 && (
                <span className="ml-1 bg-amber-500 text-white text-xs rounded-full px-1.5">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="online">Online</TabsTrigger>
            <TabsTrigger value="offline">Offline</TabsTrigger>
            <TabsTrigger value="pending_setup">Setup</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Screens Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-slate-600">Screen</th>
                  <th className="text-left p-4 font-medium text-slate-600">Device ID</th>
                  <th className="text-left p-4 font-medium text-slate-600">PIN</th>
                  <th className="text-left p-4 font-medium text-slate-600">Venue</th>
                  <th className="text-left p-4 font-medium text-slate-600">Specs</th>
                  <th className="text-left p-4 font-medium text-slate-600">Rate</th>
                  <th className="text-left p-4 font-medium text-slate-600">Status</th>
                  <th className="text-left p-4 font-medium text-slate-600">Last Seen</th>
                  <th className="text-left p-4 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500">Loading...</td>
                  </tr>
                ) : filteredScreens.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500">No screens found</td>
                  </tr>
                ) : (
                  filteredScreens.map((screen) => {
                    const venue = venues.find(v => v.id === screen.venue_id);
                    const now = new Date();
                    const lastHeartbeat = screen.last_heartbeat ? new Date(screen.last_heartbeat) : null;
                    const minutesSinceHeartbeat = lastHeartbeat ? differenceInMinutes(now, lastHeartbeat) : Infinity;
                    const isOfflineWarning = screen.status === "online" && minutesSinceHeartbeat > 5;
                    
                    return (
                      <tr key={screen.id} className={`border-b hover:bg-slate-50 ${isOfflineWarning ? 'bg-red-50' : ''}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`relative w-10 h-10 rounded-lg flex items-center justify-center ${
                              screen.status === "online" && !isOfflineWarning ? "bg-emerald-100" : 
                              isOfflineWarning ? "bg-red-100" : "bg-slate-100"
                            }`}>
                              <MonitorPlay className={`w-5 h-5 ${
                                screen.status === "online" && !isOfflineWarning ? "text-emerald-600" : 
                                isOfflineWarning ? "text-red-600" : "text-slate-400"
                              }`} />
                              {isOfflineWarning && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-slate-900">{screen.name}</p>
                                {isOfflineWarning && (
                                  <Badge className="bg-red-100 text-red-700 text-xs">
                                    Offline {minutesSinceHeartbeat}m
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-500">{screen.device_type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {screen.device_id ? (
                            <div className="flex items-center gap-1">
                              <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono text-slate-700">
                                {screen.device_id}
                              </code>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(screen.device_id)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="p-4">
                          {screen.player_pin ? (
                            <div className="flex items-center gap-1">
                              <code className="text-xs bg-violet-100 px-2 py-1 rounded font-mono text-violet-700">
                                {screen.player_pin}
                              </code>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(screen.player_pin)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-slate-900">{venue?.name || "—"}</p>
                          <p className="text-xs text-slate-500">{venue?.city}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-slate-900">{screen.size} • {screen.orientation}</p>
                          <p className="text-xs text-slate-500">{screen.resolution}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-slate-900">AED {screen.hourly_rate}/hr</p>
                        </td>
                        <td className="p-4">
                          <Badge className={statusColors[screen.status]}>
                            {screen.status === "online" ? (
                              <><Activity className="w-3 h-3 mr-1 animate-pulse" /> Online</>
                            ) : (
                              screen.status?.replace("_", " ")
                            )}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-slate-500">
                            {screen.last_heartbeat 
                              ? format(new Date(screen.last_heartbeat), "MMM d, h:mm a")
                              : "Never"
                            }
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {screen.status === "online" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPreviewScreen(screen)}
                                className="text-violet-600"
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                            )}
                            <Link to={createPageUrl(`AdminScreenSlots?id=${screen.id}`)}>
                              <Button size="sm" variant="outline">
                                <LayoutGrid className="w-4 h-4 mr-1" />
                                Slots
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditScreen(screen)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            {screen.status === "pending_approval" ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(screen)}
                                  disabled={approving === screen.id}
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                  {approving === screen.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(screen)}
                                  disabled={approving === screen.id}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            ) : screen.setup_code ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowSetupCode(screen)}
                              >
                                <QrCode className="w-4 h-4 mr-1" />
                                Code
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Setup Code Dialog */}
      <Dialog open={!!showSetupCode} onOpenChange={() => setShowSetupCode(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Screen Setup Code</DialogTitle>
          </DialogHeader>
          {showSetupCode && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-2">{showSetupCode.name}</p>
                <div className="bg-slate-100 rounded-xl p-6">
                  <p className="text-3xl font-mono font-bold tracking-wider text-slate-900">
                    {showSetupCode.setup_code}
                  </p>
                </div>
              </div>

              {/* QR Code Placeholder - displays the setup URL */}
              <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl p-4 text-center">
                <div className="w-32 h-32 bg-white rounded-lg mx-auto mb-3 flex items-center justify-center border-2 border-dashed border-violet-200">
                  <QrCode className="w-16 h-16 text-violet-300" />
                </div>
                <p className="text-xs text-slate-500">
                  Scan QR or enter code in BeyondWalls Player
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => copyToClipboard(showSetupCode.setup_code)}
                  className="w-full"
                  variant="outline"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Setup Code
                </Button>
                <Button
                  onClick={() => copyToClipboard(`${window.location.origin}/ScreenPlayer?setup_code=${showSetupCode.setup_code}`)}
                  className="w-full bg-violet-600 hover:bg-violet-700"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Player URL
                </Button>
              </div>

              <p className="text-xs text-slate-500 text-center">
                The venue owner can use this code to set up their screen player. 
                Once connected, the screen will automatically go online.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Edit Screen Dialog */}
      <Dialog open={!!editScreen} onOpenChange={() => setEditScreen(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Screen</DialogTitle>
          </DialogHeader>
          
          {editScreen && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Screen Name</Label>
                  <Input
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slot Price (AED/week)</Label>
                  <Input
                    type="number"
                    value={editData.slot_price}
                    onChange={(e) => setEditData({ ...editData, slot_price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Size</Label>
                  <Select value={editData.size} onValueChange={(v) => setEditData({ ...editData, size: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='32"'>32"</SelectItem>
                      <SelectItem value='43"'>43"</SelectItem>
                      <SelectItem value='55"'>55"</SelectItem>
                      <SelectItem value='65"'>65"</SelectItem>
                      <SelectItem value='75"'>75"</SelectItem>
                      <SelectItem value='85+"'>85+"</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Orientation</Label>
                  <Select value={editData.orientation} onValueChange={(v) => setEditData({ ...editData, orientation: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={editData.status} onValueChange={(v) => setEditData({ ...editData, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="pending_setup">Pending Setup</SelectItem>
                      <SelectItem value="pending_approval">Pending Approval</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Owner Ad Slots */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-slate-900 mb-4">Owner Ad Slots (Reserved)</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((slot) => (
                    <div key={slot} className="space-y-2">
                      <Label>Slot {slot}</Label>
                      <div className="border rounded-lg p-3 space-y-2">
                        {editData[`owner_slot_${slot}_url`] ? (
                          <div className="relative">
                            {editData[`owner_slot_${slot}_type`] === "video" ? (
                              <video 
                                src={editData[`owner_slot_${slot}_url`]} 
                                className="w-full h-24 object-cover rounded"
                                controls
                              />
                            ) : (
                              <img 
                                src={editData[`owner_slot_${slot}_url`]} 
                                className="w-full h-24 object-cover rounded"
                                alt={`Slot ${slot}`}
                              />
                            )}
                            <Button
                              size="icon"
                              variant="destructive"
                              className="absolute top-1 right-1 w-6 h-6"
                              onClick={() => setEditData({
                                ...editData,
                                [`owner_slot_${slot}_url`]: "",
                                [`owner_slot_${slot}_type`]: "image"
                              })}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <label className="block">
                            <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-violet-300 transition-colors">
                              {uploading === slot ? (
                                <Loader2 className="w-6 h-6 animate-spin mx-auto text-violet-600" />
                              ) : (
                                <>
                                  <Upload className="w-6 h-6 mx-auto text-slate-400" />
                                  <p className="text-xs text-slate-500 mt-1">Upload</p>
                                </>
                              )}
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*,video/*"
                              onChange={(e) => handleOwnerSlotUpload(slot, e)}
                              disabled={uploading === slot}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditScreen(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveScreen}
              disabled={saving}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Live Preview Dialog */}
      <Dialog open={!!previewScreen} onOpenChange={() => setPreviewScreen(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-violet-600" />
              Live Preview: {previewScreen?.name}
            </DialogTitle>
          </DialogHeader>
          {previewScreen && (
            <div className="space-y-4">
              <LiveScreenPreview 
                slots={getScreenSlots(previewScreen)} 
                size="large" 
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Screen</p>
                  <p className="font-medium">{previewScreen.name}</p>
                </div>
                <div>
                  <p className="text-slate-500">Status</p>
                  <Badge className={previewScreen.status === "online" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100"}>
                    {previewScreen.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-slate-500">Active Ads</p>
                  <p className="font-medium">{getScreenSlots(previewScreen).length} slots playing</p>
                </div>
                <div>
                  <p className="text-slate-500">Device ID</p>
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded">{previewScreen.device_id}</code>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}