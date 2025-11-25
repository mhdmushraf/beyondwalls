import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowLeft,
  MonitorPlay,
  User,
  Building2,
  Pencil,
  Trash2,
  Upload,
  Loader2,
  Save,
  X,
  Play,
  Image
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdminScreenSlots() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [screenId, setScreenId] = useState(null);
  const [editSlot, setEditSlot] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    if (id) setScreenId(id);
  }, []);

  const { data: screen } = useQuery({
    queryKey: ["screen", screenId],
    queryFn: async () => {
      const screens = await base44.entities.Screen.filter({ id: screenId });
      return screens[0];
    },
    enabled: !!screenId
  });

  const { data: venue } = useQuery({
    queryKey: ["venue", screen?.venue_id],
    queryFn: async () => {
      const venues = await base44.entities.Venue.filter({ id: screen?.venue_id });
      return venues[0];
    },
    enabled: !!screen?.venue_id
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["screen-bookings", screenId],
    queryFn: () => base44.entities.AdSlotBooking.filter({ screen_id: screenId }),
    enabled: !!screenId
  });

  const { data: users = [] } = useQuery({
    queryKey: ["all-users"],
    queryFn: () => base44.entities.User.list()
  });

  const activeBookings = bookings.filter(b => b.status === "active");

  const getAdvertiserName = (email) => {
    const user = users.find(u => u.email === email);
    return user?.full_name || email;
  };

  const handleEditOwnerSlot = (slotNumber) => {
    setEditSlot({ type: "owner", number: slotNumber });
    setEditData({
      url: screen?.[`owner_slot_${slotNumber}_url`] || "",
      type: screen?.[`owner_slot_${slotNumber}_type`] || "image"
    });
  };

  const handleEditAdvertiserSlot = (booking) => {
    setEditSlot({ type: "advertiser", booking });
    setEditData({
      url: booking.creative_url || "",
      type: booking.creative_type || "image"
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      toast.error("Please upload an image or video file");
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setEditData({
        url: file_url,
        type: isVideo ? "video" : "image"
      });
      toast.success("File uploaded");
    } catch (error) {
      toast.error("Failed to upload file");
    }
    setUploading(false);
  };

  const handleSaveSlot = async () => {
    setSaving(true);
    try {
      if (editSlot.type === "owner") {
        await base44.entities.Screen.update(screen.id, {
          [`owner_slot_${editSlot.number}_url`]: editData.url,
          [`owner_slot_${editSlot.number}_type`]: editData.type,
          owner_slots_last_updated: new Date().toISOString()
        });
        queryClient.invalidateQueries({ queryKey: ["screen", screenId] });
        toast.success("Owner slot updated");
      } else {
        await base44.entities.AdSlotBooking.update(editSlot.booking.id, {
          creative_url: editData.url,
          creative_type: editData.type
        });
        queryClient.invalidateQueries({ queryKey: ["screen-bookings", screenId] });
        toast.success("Advertiser slot updated");
      }
      setEditSlot(null);
    } catch (error) {
      toast.error("Failed to update slot");
    }
    setSaving(false);
  };

  const handleDeleteOwnerSlot = async (slotNumber) => {
    if (!confirm("Remove this owner ad?")) return;
    try {
      await base44.entities.Screen.update(screen.id, {
        [`owner_slot_${slotNumber}_url`]: "",
        [`owner_slot_${slotNumber}_type`]: "image"
      });
      queryClient.invalidateQueries({ queryKey: ["screen", screenId] });
      toast.success("Slot cleared");
    } catch (error) {
      toast.error("Failed to clear slot");
    }
  };

  const handleCancelBooking = async (booking) => {
    if (!confirm("Cancel this booking? The advertiser will be refunded.")) return;
    try {
      await base44.entities.AdSlotBooking.update(booking.id, { status: "cancelled" });
      
      // Refund advertiser
      const advertiserUsers = await base44.entities.User.filter({ email: booking.advertiser_id });
      if (advertiserUsers.length > 0) {
        const advertiser = advertiserUsers[0];
        await base44.entities.User.update(advertiser.id, {
          wallet_balance: (advertiser.wallet_balance || 0) + booking.total_cost
        });
        await base44.entities.Transaction.create({
          user_id: booking.advertiser_id,
          type: "refund",
          amount: booking.total_cost,
          balance_after: (advertiser.wallet_balance || 0) + booking.total_cost,
          reference_id: booking.id,
          description: `Refund for cancelled booking on ${screen?.name}`,
          status: "completed"
        });
      }

      queryClient.invalidateQueries({ queryKey: ["screen-bookings", screenId] });
      toast.success("Booking cancelled and refunded");
    } catch (error) {
      toast.error("Failed to cancel booking");
    }
  };

  if (!screen) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl("AdminScreens"))}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">{screen.name}</h1>
          <p className="text-slate-500">{venue?.name} • {venue?.city}</p>
        </div>
        <Badge variant={screen.status === "online" ? "default" : "secondary"}>
          {screen.status}
        </Badge>
      </div>

      {/* Screen Info */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Size</p>
              <p className="font-medium">{screen.size} • {screen.orientation}</p>
            </div>
            <div>
              <p className="text-slate-500">Slot Price</p>
              <p className="font-medium">AED {screen.slot_price}/week</p>
            </div>
            <div>
              <p className="text-slate-500">Owner</p>
              <p className="font-medium">{getAdvertiserName(screen.owner_id)}</p>
            </div>
            <div>
              <p className="text-slate-500">Total Slots</p>
              <p className="font-medium">{screen.total_slots || 8} (Owner: {screen.owner_slots || 3}, Paid: {screen.available_slots || 5})</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="owner">
        <TabsList className="mb-6">
          <TabsTrigger value="owner" className="gap-2">
            <Building2 className="w-4 h-4" />
            Owner Slots ({screen.owner_slots || 3})
          </TabsTrigger>
          <TabsTrigger value="advertiser" className="gap-2">
            <User className="w-4 h-4" />
            Advertiser Slots ({activeBookings.length})
          </TabsTrigger>
        </TabsList>

        {/* Owner Slots */}
        <TabsContent value="owner">
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map((slot) => {
              const url = screen[`owner_slot_${slot}_url`];
              const type = screen[`owner_slot_${slot}_type`] || "image";
              
              return (
                <Card key={slot}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>Owner Slot {slot}</span>
                      <Badge variant="outline">Reserved</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden mb-3">
                      {url ? (
                        type === "video" ? (
                          <video src={url} className="w-full h-full object-cover" controls />
                        ) : (
                          <img src={url} className="w-full h-full object-cover" alt={`Slot ${slot}`} />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="w-8 h-8 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEditOwnerSlot(slot)}>
                        <Pencil className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      {url && (
                        <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => handleDeleteOwnerSlot(slot)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Advertiser Slots */}
        <TabsContent value="advertiser">
          {activeBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No active advertiser bookings</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>Slot #{booking.slot_number}</span>
                      <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden mb-3">
                      {booking.creative_url ? (
                        booking.creative_type === "video" ? (
                          <video src={booking.creative_url} className="w-full h-full object-cover" controls />
                        ) : (
                          <img src={booking.creative_url} className="w-full h-full object-cover" alt="" />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="w-8 h-8 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 text-sm mb-3">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Campaign</span>
                        <span className="font-medium truncate ml-2">{booking.campaign_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Advertiser</span>
                        <span className="font-medium">{getAdvertiserName(booking.advertiser_id)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Duration</span>
                        <span className="font-medium">{booking.start_date} - {booking.end_date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Cost</span>
                        <span className="font-medium text-violet-600">AED {booking.total_cost}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEditAdvertiserSlot(booking)}>
                        <Pencil className="w-4 h-4 mr-1" />
                        Edit Creative
                      </Button>
                      <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => handleCancelBooking(booking)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Slot Dialog */}
      <Dialog open={!!editSlot} onOpenChange={() => setEditSlot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editSlot?.type === "owner" 
                ? `Edit Owner Slot ${editSlot?.number}` 
                : `Edit Advertiser Slot #${editSlot?.booking?.slot_number}`
              }
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {editData.url ? (
              <div className="relative">
                <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden">
                  {editData.type === "video" ? (
                    <video src={editData.url} className="w-full h-full object-cover" controls />
                  ) : (
                    <img src={editData.url} className="w-full h-full object-cover" alt="" />
                  )}
                </div>
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() => setEditData({ url: "", type: "image" })}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label className="block">
                <div className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-violet-300 transition-colors">
                  {uploading ? (
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-violet-600" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto text-slate-400" />
                      <p className="text-slate-500 mt-2">Upload image or video</p>
                    </>
                  )}
                </div>
                <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
              </label>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSlot(null)}>Cancel</Button>
            <Button onClick={handleSaveSlot} disabled={saving} className="bg-violet-600 hover:bg-violet-700">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}