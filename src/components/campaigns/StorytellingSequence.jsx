import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Upload,
  Film,
  Image as ImageIcon,
  Clock,
  Calendar,
  Zap
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function StorytellingSequence({ campaignData, onChange }) {
  const [assets, setAssets] = useState(campaignData?.creative_assets || []);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const updatedAssets = [...assets];
      updatedAssets[index] = {
        ...updatedAssets[index],
        url: file_url,
        type: file.type.startsWith('video') ? 'video' : 'image'
      };
      
      setAssets(updatedAssets);
      onChange({ creative_assets: updatedAssets });
      toast.success("Creative uploaded!");
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const addAsset = () => {
    const newAsset = {
      url: "",
      type: "image",
      sequence: assets.length + 1,
      trigger: "sequence"
    };
    const updated = [...assets, newAsset];
    setAssets(updated);
    onChange({ creative_assets: updated });
  };

  const removeAsset = (index) => {
    const updated = assets.filter((_, i) => i !== index);
    // Renumber sequences
    updated.forEach((asset, i) => asset.sequence = i + 1);
    setAssets(updated);
    onChange({ creative_assets: updated });
  };

  const updateAsset = (index, field, value) => {
    const updated = [...assets];
    updated[index] = { ...updated[index], [field]: value };
    setAssets(updated);
    onChange({ creative_assets: updated });
  };

  const triggerOptions = [
    { value: "sequence", label: "Sequential", icon: Film },
    { value: "time", label: "Time-Based", icon: Clock },
    { value: "date", label: "Date-Based", icon: Calendar },
    { value: "performance", label: "Performance", icon: Zap }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Film className="w-5 h-5 text-violet-600" />
          Dynamic Campaign Storytelling
        </CardTitle>
        <CardDescription>
          Upload multiple creatives that tell a story over time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {assets.length === 0 ? (
          <div className="p-8 border-2 border-dashed border-slate-300 rounded-lg text-center">
            <Film className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 mb-4">No creative sequence yet</p>
            <Button onClick={addAsset} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add First Creative
            </Button>
          </div>
        ) : (
          <>
            {assets.map((asset, index) => (
              <div key={index} className="p-4 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-violet-100 text-violet-700">
                    Creative {asset.sequence}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAsset(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Upload */}
                <div>
                  <Label className="text-sm">Upload Creative</Label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => handleFileUpload(e, index)}
                      disabled={uploading}
                      className="flex-1"
                    />
                    {asset.url && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        ✓ Uploaded
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Preview */}
                {asset.url && (
                  <div className="relative w-full h-32 bg-slate-100 rounded-lg overflow-hidden">
                    {asset.type === 'video' ? (
                      <video src={asset.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={asset.url} alt={`Creative ${index + 1}`} className="w-full h-full object-cover" />
                    )}
                  </div>
                )}

                {/* Trigger */}
                <div>
                  <Label className="text-sm">When to Display</Label>
                  <select
                    value={asset.trigger}
                    onChange={(e) => updateAsset(index, 'trigger', e.target.value)}
                    className="w-full mt-2 p-2 border rounded-lg text-sm"
                  >
                    {triggerOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    {asset.trigger === "sequence" && "Plays in order after previous creative"}
                    {asset.trigger === "time" && "Shows at specific times of day"}
                    {asset.trigger === "date" && "Appears on specific dates or during events"}
                    {asset.trigger === "performance" && "Triggered by campaign performance metrics"}
                  </p>
                </div>
              </div>
            ))}

            <Button onClick={addAsset} variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Another Creative to Sequence
            </Button>
          </>
        )}

        {assets.length > 1 && (
          <div className="p-3 bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-lg">
            <p className="text-sm text-violet-800">
              <strong>{assets.length} creatives</strong> in storytelling sequence. 
              Your campaign will tell a compelling story over time.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}