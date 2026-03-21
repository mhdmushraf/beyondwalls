import React, { useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ImagePlus, X, Loader2 } from "lucide-react";

const MAX_PHOTOS = 3;

export default function VenuePhotoUploader({ photos, onChange }) {
  const inputRef = useRef();
  const [uploading, setUploading] = React.useState(false);

  const handleFiles = async (files) => {
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) return;
    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    const urls = [];
    for (const file of toUpload) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      urls.push(file_url);
    }
    onChange([...photos, ...urls]);
    setUploading(false);
  };

  const removePhoto = (idx) => {
    onChange(photos.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {photos.map((url, i) => (
          <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
            <img src={url} alt={`Venue photo ${i + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(i)}
              className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}

        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-video rounded-lg border-2 border-dashed border-slate-300 hover:border-violet-400 hover:bg-violet-50 flex flex-col items-center justify-center gap-1 transition-all text-slate-400 hover:text-violet-500"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ImagePlus className="w-5 h-5" />
                <span className="text-xs font-medium">Add Photo</span>
              </>
            )}
          </button>
        )}
      </div>

      <p className="text-xs text-slate-400">Upload up to {MAX_PHOTOS} photos · JPG, PNG · Max 5MB each</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  );
}