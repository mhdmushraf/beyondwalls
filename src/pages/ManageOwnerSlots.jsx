import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { differenceInDays } from "date-fns";
import {
  ArrowLeft,
  MonitorPlay,
  Upload,
  Loader2,
  X,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ManageOwnerSlots() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [uploading, setUploading] = useState({ 1: false, 2: false, 3: false });
  const [saving, setSaving] = useState(false);
  const [slots, setSlots] = useState({
    slot1_url: "",
    slot1_type: "image",
    slot2_url: "",
    slot2_type: "image",
    slot3_url: "",
    slot3_type: "image"
  });

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

  const { data: screens = [], refetch } = useQuery({
    queryKey: ["my-screens-for-slots", user?.email],
    queryFn: () => base44.entities.Screen.filter({ owner_id: user?.email }),
    enabled: !!user?.email
  });

  useEffect(() => {
    if (selectedScreen) {
      setSlots({
        slot1_url: selectedScreen.owner_slot_1_url || "",
        slot1_type: selectedScreen.owner_slot_1_type || "image",
        slot2_url: selectedScreen.owner_slot_2_url || "",
        slot2_type: selectedScreen.owner_slot_2_type || "image",
        slot3_url: selectedScreen.owner_slot_3_url || "",
        slot3_type: selectedScreen.owner_slot_3_type || "image"
      });
    }
  }, [selectedScreen]);

  const canUpdateSlots = () => {
    if (!selectedScreen?.owner_slots_last_updated) return true;
    const lastUpdate = new Date(selectedScreen.owner_slots_last_updated);
    const daysSinceUpdate = differenceInDays(new Date(), lastUpdate);
    return daysSinceUpdate >= 7;
  };

  const daysUntilUpdate = () => {
    if (!selectedScreen?.owner_slots_last_updated) return 0;
    const lastUpdate = new Date(selectedScreen.owner_slots_last_updated);
    const daysSinceUpdate = differenceInDays(new Date(), lastUpdate);
    return Math.max(0, 7 - daysSinceUpdate);
  };

  const handleFileUpload = async (slotNum, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      toast.error("Please upload an image or video");
      return;
    }

    setUploading({ ...uploading, [slotNum]: true });
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setSlots({
        ...slots,
        [`slot${slotNum}_url`]: file_url,
        [`slot${slotNum}_type`]: isVideo ? "video" : "image"
      });
      toast.success(`Slot ${slotNum} creative uploaded`);
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading({ ...uploading, [slotNum]: false });
    }
  };

  const handleSave = async () => {
    if (!canUpdateSlots()) {
      toast.error(`You can update slots again in ${daysUntilUpdate()} days`);
      return;
    }

    setSaving(true);
    try {
      await base44.entities.Screen.update(selectedScreen.id, {
        owner_slot_1_url: slots.slot1_url,
        owner_slot_1_type: slots.slot1_type,
        owner_slot_2_url: slots.slot2_url,
        owner_slot_2_type: slots.slot2_type,
        owner_slot_3_url: slots.slot3_url,
        owner_slot_3_type: slots.slot3_type,
        owner_slots_last_updated: new Date().toISOString()
      });

      refetch();
      toast.success("Owner slots updated successfully!");
    } catch (error) {
      toast.error("Failed to update slots");
    } finally {
      setSaving(false);
    }
  };

  const SlotUploader = ({ slotNum }) => {
    const url = slots[`slot${slotNum}_url`];
    const type = slots[`slot${slotNum}_type`];

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Slot {slotNum}</CardTitle>
            <Badge variant="secondary">Owner Slot</Badge>
          </div>
          <CardDescription>
            Your free advertising slot - show menu, promotions, etc.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {url ? (
            <div className="relative">
              {type === "video" ? (
                <video src={url} className="w-full aspect-video rounded-lg object-cover" controls />
              ) : (
                <img src={url} className="w-full aspect-video rounded-lg object-cover" alt={`Slot ${slotNum}`} />
              )}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => setSlots({ ...slots, [`slot${slotNum}_url`]: "" })}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <label className="block cursor-pointer">
              <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                uploading[slotNum] ? "border-violet-300 bg-violet-50" : "border-slate-200 hover:border-violet-300"
              }`}>
                {uploading[slotNum] ? (
                  <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-600">Upload image or video</p>
                    <p className="text-xs text-slate-400 mt-1">15 seconds max for video</p>
                  </>
                )}
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*,video/*" 
                onChange={(e) => handleFileUpload(slotNum, e)} 
              />
            </label>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Manage Your Ad Slots</h1>
          <p className="text-slate-500">Update your 3 free advertising slots (weekly)</p>
        </div>
      </div>

      {/* Screen Selector */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <MonitorPlay className="w-6 h-6 text-violet-600" />
            <div className="flex-1">
              <Select 
                value={selectedScreen?.id || ""} 
                onValueChange={(id) => setSelectedScreen(screens.find(s => s.id === id))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a screen to manage" />
                </SelectTrigger>
                <SelectContent>
                  {screens.map((screen) => (
                    <SelectItem key={screen.id} value={screen.id}>
                      {screen.name} - {screen.size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedScreen && (
        <>
          {/* Update Status */}
          <Card className={`mb-6 ${canUpdateSlots() ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {canUpdateSlots() ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <p className="text-emerald-800">You can update your slots now</p>
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5 text-amber-600" />
                    <p className="text-amber-800">
                      You can update your slots again in <strong>{daysUntilUpdate()} days</strong>
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mb-6 border-violet-200 bg-violet-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-violet-600 mt-0.5" />
                <div>
                  <p className="font-medium text-violet-800">Your Free Ad Slots</p>
                  <p className="text-sm text-violet-700 mt-1">
                    As a screen owner, you get 3 free slots to advertise your business. 
                    Show your menu, promotions, or any content you want. These slots can be 
                    updated once per week.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Slot Uploaders */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <SlotUploader slotNum={1} />
            <SlotUploader slotNum={2} />
            <SlotUploader slotNum={3} />
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving || !canUpdateSlots()}
              className="bg-gradient-to-r from-violet-600 to-indigo-600"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {screens.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <MonitorPlay className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">You don't have any screens yet</p>
            <Button className="mt-4" onClick={() => navigate(createPageUrl("AddScreen"))}>
              Add Your First Screen
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}