import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, AlertCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function GooglePlayGeneratorDialog({ logoUrl, onClose }) {
  const [primaryColor, setPrimaryColor] = useState("#8B5CF6");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError("");
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      setUploadedImage(uploadResult.file_url);
    } catch (err) {
      setError("Failed to upload image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateGooglePlayFiles = async () => {
    if (!primaryColor) {
      setError("Please select a brand primary color");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Call backend function to generate Google Play files
      // This would need a backend function: generateGooglePlayFiles
      const result = await base44.functions.invoke("generateGooglePlayFiles", {
        logoUrl: uploadedImage || logoUrl,
        primaryColor,
      });

      if (result.data.success) {
        // Download the generated files
        const link = document.createElement("a");
        link.href = result.data.downloadUrl;
        link.download = "google-play-files.zip";
        link.click();

        onClose();
      } else {
        setError(result.data.error || "Failed to generate files");
      }
    } catch (err) {
      setError(err.message || "Failed to generate Google Play files");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Generate Google Play Files
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          Configure your app logo to generate the AAB bundle.
        </p>

        <div className="space-y-4">
          {/* App Logo Preview */}
          <div>
            <Label className="text-sm font-semibold">App Logo</Label>
            <div className="mt-2 w-full h-32 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
              {uploadedImage || logoUrl ? (
                <img
                  src={uploadedImage || logoUrl}
                  alt="App Logo"
                  className="h-24 w-24 object-contain"
                />
              ) : (
                <div className="text-center">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs text-slate-500">Click to upload logo</p>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleImageUpload}
              className="mt-2 w-full text-sm"
              disabled={loading}
            />
            <p className="text-xs text-slate-500 mt-2">
              ✓ PNG with solid background color works best
            </p>
          </div>

          {/* Brand Primary Color */}
          <div>
            <Label className="text-sm font-semibold mb-2 block">
              Brand Primary Color
            </Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-14 rounded-lg cursor-pointer border-2 border-slate-200"
              />
              <Input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#8B5CF6"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              This color will be used for the app icon background
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={generateGooglePlayFiles}
              disabled={loading || !primaryColor}
              className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Files"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}