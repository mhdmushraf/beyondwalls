import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FlaskConical,
  Upload,
  Loader2,
  Trash2,
  Trophy,
  BarChart3,
  Eye,
  TrendingUp,
  Plus,
  X,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function ABTestManager({ bookingId, advertiserId }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCreative, setNewCreative] = useState({
    name: "",
    creative_url: "",
    creative_type: "image",
    variant: "A"
  });

  const { data: creatives = [], isLoading } = useQuery({
    queryKey: ["creatives", bookingId],
    queryFn: () => base44.entities.Creative.filter({ booking_id: bookingId }),
    enabled: !!bookingId
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) {
      toast.error("Please upload an image or video");
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setNewCreative({
        ...newCreative,
        creative_url: file_url,
        creative_type: isVideo ? "video" : "image"
      });
      toast.success("File uploaded");
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleAddCreative = async () => {
    if (!newCreative.name || !newCreative.creative_url) {
      toast.error("Please fill in all fields");
      return;
    }

    const usedVariants = creatives.map(c => c.variant);
    const nextVariant = ["A", "B", "C"].find(v => !usedVariants.includes(v)) || "A";

    try {
      await base44.entities.Creative.create({
        ...newCreative,
        variant: nextVariant,
        booking_id: bookingId,
        advertiser_id: advertiserId,
        weight: Math.floor(100 / (creatives.length + 1))
      });

      // Rebalance weights
      const newWeight = Math.floor(100 / (creatives.length + 1));
      for (const creative of creatives) {
        await base44.entities.Creative.update(creative.id, { weight: newWeight });
      }

      queryClient.invalidateQueries({ queryKey: ["creatives", bookingId] });
      setShowAddDialog(false);
      setNewCreative({ name: "", creative_url: "", creative_type: "image", variant: "A" });
      toast.success("Creative added to A/B test");
    } catch (error) {
      toast.error("Failed to add creative");
    }
  };

  const handleDeleteCreative = async (id) => {
    try {
      await base44.entities.Creative.delete(id);
      queryClient.invalidateQueries({ queryKey: ["creatives", bookingId] });
      toast.success("Creative removed");
    } catch (error) {
      toast.error("Failed to remove");
    }
  };

  const handleSetWinner = async (id) => {
    try {
      // Reset all winners
      for (const c of creatives) {
        await base44.entities.Creative.update(c.id, { 
          is_winner: c.id === id,
          weight: c.id === id ? 100 : 0,
          is_active: c.id === id
        });
      }
      queryClient.invalidateQueries({ queryKey: ["creatives", bookingId] });
      toast.success("Winner selected! Other variants paused.");
    } catch (error) {
      toast.error("Failed to set winner");
    }
  };

  const handleUpdateWeight = async (id, weight) => {
    try {
      await base44.entities.Creative.update(id, { weight });
      queryClient.invalidateQueries({ queryKey: ["creatives", bookingId] });
    } catch (error) {
      toast.error("Failed to update weight");
    }
  };

  const totalImpressions = creatives.reduce((sum, c) => sum + (c.impressions || 0), 0);
  const bestPerformer = creatives.length > 0 
    ? creatives.reduce((best, c) => (c.engagement_rate > (best.engagement_rate || 0) ? c : best))
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-violet-600" />
            A/B Test Creatives
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={creatives.length >= 3}>
                <Plus className="w-4 h-4 mr-1" />
                Add Variant
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Creative Variant</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Creative Name</Label>
                  <Input
                    placeholder="e.g., Version with CTA button"
                    value={newCreative.name}
                    onChange={(e) => setNewCreative({ ...newCreative, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Upload Creative</Label>
                  {newCreative.creative_url ? (
                    <div className="relative mt-2">
                      {newCreative.creative_type === "video" ? (
                        <video src={newCreative.creative_url} className="w-full h-40 object-cover rounded-lg" controls />
                      ) : (
                        <img src={newCreative.creative_url} className="w-full h-40 object-cover rounded-lg" alt="" />
                      )}
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => setNewCreative({ ...newCreative, creative_url: "" })}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="block mt-2">
                      <div className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
                        uploading ? "border-violet-300 bg-violet-50" : "border-slate-200 hover:border-violet-300"
                      }`}>
                        {uploading ? (
                          <Loader2 className="w-6 h-6 text-violet-600 animate-spin mx-auto" />
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-600">Click to upload</p>
                          </>
                        )}
                      </div>
                      <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
                    </label>
                  )}
                </div>
                <Button onClick={handleAddCreative} className="w-full">
                  Add to A/B Test
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {creatives.length === 0 ? (
          <div className="text-center py-8">
            <FlaskConical className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 mb-2">No A/B test variants yet</p>
            <p className="text-sm text-slate-400">Add multiple creatives to test which performs best</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-slate-900">{creatives.length}</p>
                <p className="text-xs text-slate-500">Variants</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-slate-900">{totalImpressions.toLocaleString()}</p>
                <p className="text-xs text-slate-500">Total Impressions</p>
              </div>
              <div className="bg-violet-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-violet-600">
                  {bestPerformer?.variant || "-"}
                </p>
                <p className="text-xs text-slate-500">Best Performer</p>
              </div>
            </div>

            {/* Creative Variants */}
            {creatives.map((creative) => (
              <div 
                key={creative.id} 
                className={`border rounded-xl p-4 ${
                  creative.is_winner ? "border-emerald-500 bg-emerald-50" : "border-slate-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                    {creative.creative_type === "video" ? (
                      <video src={creative.creative_url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={creative.creative_url} className="w-full h-full object-cover" alt="" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={creative.is_winner ? "default" : "secondary"}>
                        Variant {creative.variant}
                      </Badge>
                      {creative.is_winner && (
                        <Badge className="bg-emerald-500">
                          <Trophy className="w-3 h-3 mr-1" />
                          Winner
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium text-slate-900 truncate">{creative.name}</p>
                    
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="text-center">
                        <p className="text-sm font-semibold">{creative.impressions?.toLocaleString() || 0}</p>
                        <p className="text-xs text-slate-500">Impressions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold">{creative.views?.toLocaleString() || 0}</p>
                        <p className="text-xs text-slate-500">Views</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-violet-600">{creative.engagement_rate || 0}%</p>
                        <p className="text-xs text-slate-500">Engagement</p>
                      </div>
                    </div>

                    {!creative.is_winner && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                          <span>Traffic Split</span>
                          <span>{creative.weight}%</span>
                        </div>
                        <Slider
                          value={[creative.weight]}
                          onValueChange={(v) => handleUpdateWeight(creative.id, v[0])}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {!creative.is_winner && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSetWinner(creative.id)}
                      >
                        <Trophy className="w-3 h-3 mr-1" />
                        Set Winner
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                      onClick={() => handleDeleteCreative(creative.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}