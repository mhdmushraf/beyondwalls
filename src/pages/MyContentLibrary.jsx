import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, Trash2, Image as ImageIcon, Video, Plus, Search, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MyContentLibrary() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [search, setSearch] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const u = await base44.auth.me();
    setUser(u);
    const data = await base44.entities.MediaAsset.filter({ owner_email: u.email });
    setAssets(data.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    setLoading(false);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const fileType = file.type.startsWith("video") ? "video" : "image";
    await base44.entities.MediaAsset.create({
      owner_email: user.email,
      name: file.name.replace(/\.[^.]+$/, ""),
      file_url,
      file_type: fileType,
      file_size_kb: Math.round(file.size / 1024),
    });
    toast.success("Asset uploaded!");
    setUploading(false);
    loadData();
  };

  const handleDelete = async (asset) => {
    await base44.entities.MediaAsset.delete(asset.id);
    toast.success("Deleted");
    setAssets(prev => prev.filter(a => a.id !== asset.id));
  };

  const filtered = assets.filter(a => a.name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-900">Content Library</h1>
            <p className="text-xs text-slate-500">{assets.length} assets · reuse across all screens</p>
          </div>
          <div>
            <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            <Button disabled={uploading} className="bg-gradient-to-r from-violet-600 to-indigo-600" onClick={() => fileInputRef.current?.click()}>
              {uploading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Uploading...</> : <><Plus className="w-4 h-4 mr-2" />Upload Asset</>}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search assets..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No assets yet</p>
            <p className="text-slate-400 text-sm mt-1">Upload images and videos to reuse across all your screens</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filtered.map(asset => (
              <div key={asset.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm group">
                <div className="relative aspect-video bg-slate-900">
                  {asset.file_type === "video"
                    ? <video src={asset.file_url} className="w-full h-full object-cover" muted />
                    : <img src={asset.file_url} alt={asset.name} className="w-full h-full object-cover" />}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="icon" variant="ghost" className="text-white hover:text-red-400 w-8 h-8" onClick={() => handleDelete(asset)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <Badge className={`absolute top-2 left-2 text-xs ${asset.file_type === "video" ? "bg-blue-600" : "bg-violet-600"}`}>
                    {asset.file_type === "video" ? <Video className="w-3 h-3 mr-1" /> : <ImageIcon className="w-3 h-3 mr-1" />}
                    {asset.file_type}
                  </Badge>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-slate-800 truncate">{asset.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{asset.file_size_kb ? `${asset.file_size_kb} KB` : ""}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}