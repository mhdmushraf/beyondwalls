import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MonitorPlay,
  Upload,
  Save,
  Loader2,
  Image,
  Video,
  Trash2,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminDefaultContent() {
  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

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

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: () => base44.entities.PlatformSettings.list()
  });

  const defaultContentUrl = settings.find(s => s.setting_key === "default_screen_content_url")?.setting_value || "";
  const defaultContentType = settings.find(s => s.setting_key === "default_screen_content_type")?.setting_value || "image";

  const handleUpload = async (e) => {
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
      
      // Update or create the settings
      const existingUrl = settings.find(s => s.setting_key === "default_screen_content_url");
      const existingType = settings.find(s => s.setting_key === "default_screen_content_type");

      if (existingUrl) {
        await base44.entities.PlatformSettings.update(existingUrl.id, { setting_value: file_url });
      } else {
        await base44.entities.PlatformSettings.create({
          setting_key: "default_screen_content_url",
          setting_value: file_url,
          setting_type: "url",
          description: "Default content displayed on screens when no ads are running"
        });
      }

      if (existingType) {
        await base44.entities.PlatformSettings.update(existingType.id, { setting_value: isVideo ? "video" : "image" });
      } else {
        await base44.entities.PlatformSettings.create({
          setting_key: "default_screen_content_type",
          setting_value: isVideo ? "video" : "image",
          setting_type: "text",
          description: "Type of default content (image or video)"
        });
      }

      queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
      toast.success("Default content uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload content");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      const existingUrl = settings.find(s => s.setting_key === "default_screen_content_url");
      if (existingUrl) {
        await base44.entities.PlatformSettings.update(existingUrl.id, { setting_value: "" });
      }
      queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
      toast.success("Default content removed");
    } catch (error) {
      toast.error("Failed to remove content");
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Default Screen Content</h1>
        <p className="text-slate-500">Configure the default image/video shown on all screens when no ads are running</p>
      </div>

      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MonitorPlay className="w-5 h-5 text-violet-600" />
            Default Fallback Content
          </CardTitle>
          <CardDescription>
            This content will be displayed on all screens when there are no active ads to show
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Content Preview */}
          {defaultContentUrl && (
            <div className="space-y-3">
              <Label>Current Default Content</Label>
              <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video max-w-xl">
                {defaultContentType === "video" ? (
                  <video 
                    src={defaultContentUrl} 
                    className="w-full h-full object-contain"
                    controls
                    muted
                  />
                ) : (
                  <img 
                    src={defaultContentUrl} 
                    alt="Default content"
                    className="w-full h-full object-contain"
                  />
                )}
                <div className="absolute top-3 right-3">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleRemove}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
                <div className="absolute bottom-3 left-3">
                  <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
                    {defaultContentType === "video" ? (
                      <Video className="w-4 h-4 text-violet-400" />
                    ) : (
                      <Image className="w-4 h-4 text-violet-400" />
                    )}
                    <span className="text-white text-sm capitalize">{defaultContentType}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload Section */}
          <div className="space-y-3">
            <Label>{defaultContentUrl ? "Replace Content" : "Upload Default Content"}</Label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-violet-300 transition-colors">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleUpload}
                className="hidden"
                id="default-content-upload"
                disabled={uploading}
              />
              <label 
                htmlFor="default-content-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                {uploading ? (
                  <Loader2 className="w-12 h-12 text-violet-600 animate-spin mb-4" />
                ) : (
                  <Upload className="w-12 h-12 text-slate-400 mb-4" />
                )}
                <p className="text-slate-700 font-medium mb-1">
                  {uploading ? "Uploading..." : "Click to upload"}
                </p>
                <p className="text-slate-500 text-sm">
                  Supports images (JPG, PNG, GIF) and videos (MP4, WebM)
                </p>
              </label>
            </div>
          </div>

          {/* Info */}
          <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-violet-600 mt-0.5" />
              <div>
                <p className="font-medium text-violet-900">How it works</p>
                <p className="text-violet-700 text-sm mt-1">
                  When a screen has no active advertisements to display, this default content will automatically play. 
                  This ensures screens never show a blank or "No Content" message to viewers.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}