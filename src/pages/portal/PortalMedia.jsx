import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Film, Trash2, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { useOrgEntity } from '@/lib/useOrgEntity';
import { uploadPublic } from '@/lib/portalData';
import { PageHeader, EmptyState } from '@/components/portal/ui';
import { TilesSkeleton } from '@/components/portal/Skeletons';

const MAX_MB = 200;

function readMeta(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    if (file.type.startsWith('video')) {
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.onloadedmetadata = () => { resolve({ width_px: v.videoWidth, height_px: v.videoHeight, duration_seconds: Math.round(v.duration) }); URL.revokeObjectURL(url); };
      v.onerror = () => resolve({});
      v.src = url;
    } else {
      const img = new Image();
      img.onload = () => { resolve({ width_px: img.naturalWidth, height_px: img.naturalHeight }); URL.revokeObjectURL(url); };
      img.onerror = () => resolve({});
      img.src = url;
    }
  });
}

export default function PortalMedia() {
  const { user } = useAuth();
  const { items, loading, create, remove } = useOrgEntity('MediaAsset', { limit: 300 });
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(0);
  const input = useRef(null);

  const onFiles = async (files) => {
    const list = Array.from(files || []);
    for (const file of list) {
      if (!/^(image|video)\//.test(file.type)) { toast.error(`${file.name}: only images and videos`); continue; }
      if (file.size > MAX_MB * 1024 * 1024) { toast.error(`${file.name}: max ${MAX_MB} MB`); continue; }
      setBusy((b) => b + 1);
      try {
        const meta = await readMeta(file);
        const url = await uploadPublic(file);
        await create({
          name: file.name.replace(/\.[^.]+$/, ''),
          file_url: url,
          file_type: file.type.startsWith('video') ? 'video' : 'image',
          file_size_kb: Math.round(file.size / 1024),
          owner_email: user?.email || '',
          ...meta,
        });
        toast.success(`${file.name} uploaded`);
      } catch (e) {
        toast.error(`${file.name}: upload failed`);
      } finally {
        setBusy((b) => b - 1);
      }
    }
  };

  const shown = items.filter((a) => (filter === 'all' || a.file_type === filter) && (!q || a.name?.toLowerCase().includes(q.toLowerCase())));

  return (
    <div>
      <PageHeader
        title="Media library"
        subtitle="Images and videos for your screens · landscape 1920×1080 works best"
        actions={(
          <>
            <input ref={input} type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => { onFiles(e.target.files); e.target.value = ''; }} />
            <button type="button" className="bw-btn bw-btn-primary" onClick={() => input.current?.click()}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {busy ? `Uploading ${busy}…` : 'Upload'}
            </button>
          </>
        )}
      />

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
        <div className="inline-flex rounded-xl bg-[#EEEDF5] p-1">
          {[['all', 'All'], ['image', 'Images'], ['video', 'Videos']].map(([k, l]) => (
            <button key={k} type="button" onClick={() => setFilter(k)}
              className={`!min-h-0 rounded-lg px-4 py-1.5 text-[13px] font-semibold ${filter === k ? 'bg-white text-bw-navy shadow-sm' : 'text-bw-muted'}`}>{l}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-bw-line bg-white px-3 md:w-72">
          <Search className="h-4 w-4 text-bw-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search media" className="flex-1 bg-transparent py-2 text-[13px] outline-none" />
        </div>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}
      >
        {loading ? <TilesSkeleton count={6} /> : shown.length === 0 ? (
          <EmptyState icon={ImageIcon} title={items.length ? 'Nothing matches' : 'Drop images or videos here'}
            body="They'll be ready to add to playlists and menus."
            action={<button type="button" className="bw-btn bw-btn-primary" onClick={() => input.current?.click()}><Upload className="h-4 w-4" />Upload</button>} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {shown.map((a) => (
              <div key={a.id} className="bw-card overflow-hidden group">
                <div className="relative aspect-video bg-bw-navy">
                  {a.file_type === 'video'
                    ? <video src={a.file_url} muted preload="metadata" className="h-full w-full object-cover" />
                    : <img src={a.file_url} alt="" className="h-full w-full object-cover" loading="lazy" />}
                  <span className="absolute top-2 start-2 bw-chip bg-black/60 text-white">
                    {a.file_type === 'video' ? <Film className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                    {a.file_type === 'video' ? `${a.duration_seconds || '?'} s` : 'Image'}
                  </span>
                  <button type="button" title="Delete"
                    onClick={async () => { if (window.confirm(`Delete ${a.name}?`)) { await remove(a.id); toast.success('Deleted'); } }}
                    className="!min-h-0 !min-w-0 absolute top-2 end-2 h-8 w-8 rounded-lg bg-white/90 text-rose-600 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-3">
                  <p className="text-[13px] font-semibold text-bw-navy truncate">{a.name}</p>
                  <p className="text-[11px] text-bw-muted">
                    {a.width_px ? `${a.width_px}×${a.height_px}` : ''}{a.width_px && a.height_px ? (a.width_px >= a.height_px ? ' · landscape' : ' · portrait') : ''}
                    {a.file_size_kb ? ` · ${a.file_size_kb > 1024 ? `${(a.file_size_kb / 1024).toFixed(1)} MB` : `${a.file_size_kb} KB`}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
