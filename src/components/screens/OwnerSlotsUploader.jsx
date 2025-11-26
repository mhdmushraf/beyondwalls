import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Upload,
  Loader2,
  Image,
  Video,
  X,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function OwnerSlotsUploader({ 
  slots, 
  onChange, 
  required = true 
}) {
  const [uploading, setUploading] = useState({ 1: false, 2: false, 3: false });

  const handleUpload = async (slotNumber, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      toast.error("Please upload an image or video file");
      return;
    }

    setUploading(prev => ({ ...prev, [slotNumber]: true }));
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      onChange({
        ...slots,
        [`owner_slot_${slotNumber}_url`]: file_url,
        [`owner_slot_${slotNumber}_type`]: isVideo ? "video" : "image"
      });
      
      toast.success(`Slot ${slotNumber} uploaded successfully!`);
    } catch (error) {
      toast.error("Failed to upload content");
    } finally {
      setUploading(prev => ({ ...prev, [slotNumber]: false }));
    }
  };

  const handleRemove = (slotNumber) => {
    onChange({
      ...slots,
      [`owner_slot_${slotNumber}_url`]: "",
      [`owner_slot_${slotNumber}_type`]: "image"
    });
  };

  const allSlotsUploaded = slots.owner_slot_1_url && slots.owner_slot_2_url && slots.owner_slot_3_url;

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="w-5 h-5 text-violet-600" />
          Owner Ad Slots {required && <span className="text-red-500">*</span>}
        </CardTitle>
        <CardDescription>
          Upload 3 images/videos for your own promotional content. These will rotate between paid advertiser slots.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Validation Message */}
        {required && !allSlotsUploaded && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">All 3 owner slots are required</p>
              <p className="text-amber-700 text-sm">
                You must upload content for all 3 owner slots before submitting your screen.
              </p>
            </div>
          </div>
        )}

        {/* Slot Uploaders */}
        <div className="grid gap-4">
          {[1, 2, 3].map((slotNumber) => {
            const url = slots[`owner_slot_${slotNumber}_url`];
            const type = slots[`owner_slot_${slotNumber}_type`] || "image";
            const isUploading = uploading[slotNumber];

            return (
              <div key={slotNumber} className="border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="flex items-center gap-2">
                    Owner Slot {slotNumber}
                    {required && <span className="text-red-500">*</span>}
                  </Label>
                  {url && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full flex items-center gap-1">
                        {type === "video" ? <Video className="w-3 h-3" /> : <Image className="w-3 h-3" />}
                        {type}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemove(slotNumber)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {url ? (
                  <div className="relative rounded-lg overflow-hidden bg-slate-900 aspect-video">
                    {type === "video" ? (
                      <video 
                        src={url} 
                        className="w-full h-full object-contain"
                        muted
                        controls
                      />
                    ) : (
                      <img 
                        src={url} 
                        alt={`Owner Slot ${slotNumber}`}
                        className="w-full h-full object-contain"
                      />
                    )}
                    <div className="absolute top-2 left-2 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Uploaded
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-violet-300 transition-colors">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => handleUpload(slotNumber, e)}
                      className="hidden"
                      id={`owner-slot-${slotNumber}`}
                      disabled={isUploading}
                    />
                    <label 
                      htmlFor={`owner-slot-${slotNumber}`}
                      className="cursor-pointer flex flex-col items-center"
                    >
                      {isUploading ? (
                        <Loader2 className="w-8 h-8 text-violet-600 animate-spin mb-2" />
                      ) : (
                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      )}
                      <p className="text-slate-600 text-sm font-medium">
                        {isUploading ? "Uploading..." : "Click to upload"}
                      </p>
                      <p className="text-slate-400 text-xs mt-1">
                        Image or Video
                      </p>
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Success indicator */}
        {allSlotsUploaded && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <p className="text-emerald-800 font-medium">All 3 owner slots are configured!</p>
          </div>
        )}

        {/* Info */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
          <p className="text-slate-600 text-sm">
            <strong>How it works:</strong> Your 3 owner slots will alternate with advertiser slots in this order: 
            Ad Slot 1 → Owner Slot 1 → Ad Slot 2 → Owner Slot 2 → Ad Slot 3 → Owner Slot 3 → Ad Slot 4 → Ad Slot 5 → (repeat)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}