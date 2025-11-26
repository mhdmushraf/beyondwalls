import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Play,
  Pause,
  Pencil,
  Upload,
  Loader2,
  X,
  Calendar,
  Save,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function CampaignControls({ booking, screen, venue, onUpdate }) {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editData, setEditData] = useState({
    campaign_name: booking?.campaign_name || "",
    end_date: booking?.end_date || "",
    creative_url: booking?.creative_url || "",
    creative_type: booking?.creative_type || "image"
  });

  const isPaused = booking?.status === "paused";
  const isActive = booking?.status === "active";

  const handlePauseResume = async () => {
    setProcessing(true);
    try {
      const newStatus = isPaused ? "active" : "paused";
      await base44.entities.AdSlotBooking.update(booking.id, { status: newStatus });
      
      // Notify venue owner
      if (screen?.owner_id) {
        await base44.integrations.Core.SendEmail({
          to: screen.owner_id,
          subject: `Campaign ${isPaused ? "Resumed" : "Paused"}: ${booking.campaign_name} | BeyondWalls`,
          body: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        BEYONDWALLS
   Campaign Status Update
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The following campaign on your screen has been ${isPaused ? "RESUMED" : "PAUSED"}:

📺 Screen: ${screen.name}
🏢 Venue: ${venue?.name || "N/A"}
📢 Campaign: ${booking.campaign_name}
📅 Duration: ${booking.start_date} - ${booking.end_date}

Status: ${isPaused ? "▶️ ACTIVE" : "⏸️ PAUSED"}

${isPaused 
  ? "The ad will now resume playing on your screen."
  : "The ad will temporarily stop playing on your screen. Your earnings are not affected during the pause."}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BeyondWalls - Advertise Beyond Boundaries
          `.trim()
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["booking", booking.id] });
      toast.success(`Campaign ${isPaused ? "resumed" : "paused"} successfully`);
      setShowPauseDialog(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error("Failed to update campaign status");
    }
    setProcessing(false);
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
        ...editData,
        creative_url: file_url,
        creative_type: isVideo ? "video" : "image"
      });
      toast.success("Creative uploaded");
    } catch (error) {
      toast.error("Failed to upload file");
    }
    setUploading(false);
  };

  const handleSaveChanges = async () => {
    setProcessing(true);
    try {
      const changes = [];
      if (editData.campaign_name !== booking.campaign_name) changes.push("Campaign name");
      if (editData.end_date !== booking.end_date) changes.push("End date");
      if (editData.creative_url !== booking.creative_url) changes.push("Creative");

      await base44.entities.AdSlotBooking.update(booking.id, {
        campaign_name: editData.campaign_name,
        end_date: editData.end_date,
        creative_url: editData.creative_url,
        creative_type: editData.creative_type,
        last_edited: new Date().toISOString()
      });

      // Notify venue owner of changes
      if (screen?.owner_id && changes.length > 0) {
        await base44.integrations.Core.SendEmail({
          to: screen.owner_id,
          subject: `Campaign Updated: ${booking.campaign_name} | BeyondWalls`,
          body: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        BEYONDWALLS
   Campaign Update Notice
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

An advertiser has made changes to a campaign running on your screen.

📺 Screen: ${screen.name}
🏢 Venue: ${venue?.name || "N/A"}
📢 Campaign: ${editData.campaign_name}

🔄 CHANGES MADE:
${changes.map(c => `• ${c}`).join("\n")}

Updated Details:
• Campaign Name: ${editData.campaign_name}
• End Date: ${editData.end_date}
• Creative: ${editData.creative_url !== booking.creative_url ? "New creative uploaded" : "Unchanged"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BeyondWalls - Advertise Beyond Boundaries
          `.trim()
        });
      }

      queryClient.invalidateQueries({ queryKey: ["booking", booking.id] });
      toast.success("Campaign updated successfully");
      setShowEditDialog(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error("Failed to update campaign");
    }
    setProcessing(false);
  };

  if (!booking) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          Campaign Controls
          <Badge variant={isActive ? "default" : isPaused ? "secondary" : "outline"}>
            {booking.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          {(isActive || isPaused) && (
            <Button
              variant={isPaused ? "default" : "outline"}
              className={isPaused ? "bg-emerald-600 hover:bg-emerald-700" : ""}
              onClick={() => setShowPauseDialog(true)}
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Resume Campaign
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause Campaign
                </>
              )}
            </Button>
          )}
          
          {(isActive || isPaused) && (
            <Button variant="outline" onClick={() => setShowEditDialog(true)}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit Campaign
            </Button>
          )}
        </div>

        {isPaused && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Campaign Paused</p>
              <p className="text-sm text-amber-700">Your ad is not currently displaying. Resume anytime to continue.</p>
            </div>
          </div>
        )}
      </CardContent>

      {/* Pause/Resume Confirmation Dialog */}
      <AlertDialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isPaused ? "Resume Campaign?" : "Pause Campaign?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isPaused 
                ? "Your ad will start displaying on screens again immediately."
                : "Your ad will temporarily stop displaying. The venue owner will be notified. You can resume anytime."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePauseResume}
              disabled={processing}
              className={isPaused ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              {processing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : isPaused ? (
                <Play className="w-4 h-4 mr-2" />
              ) : (
                <Pause className="w-4 h-4 mr-2" />
              )}
              {isPaused ? "Resume" : "Pause"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Campaign Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Campaign Name</Label>
              <Input
                value={editData.campaign_name}
                onChange={(e) => setEditData({ ...editData, campaign_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={editData.end_date}
                min={booking.start_date}
                onChange={(e) => setEditData({ ...editData, end_date: e.target.value })}
              />
              <p className="text-xs text-slate-500">
                Extending the campaign may require additional payment
              </p>
            </div>

            <div className="space-y-2">
              <Label>Creative</Label>
              <div className="border rounded-lg p-4">
                {editData.creative_url ? (
                  <div className="relative">
                    {editData.creative_type === "video" ? (
                      <video src={editData.creative_url} className="w-full h-40 object-cover rounded" controls />
                    ) : (
                      <img src={editData.creative_url} className="w-full h-40 object-cover rounded" alt="" />
                    )}
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => setEditData({ ...editData, creative_url: "", creative_type: "image" })}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-violet-300 transition-colors">
                      {uploading ? (
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-violet-600" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto text-slate-400" />
                          <p className="text-slate-500 mt-2">Upload new creative</p>
                        </>
                      )}
                    </div>
                    <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
                  </label>
                )}
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The venue owner will be notified of any changes you make to the campaign.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSaveChanges}
              disabled={processing}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {processing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}