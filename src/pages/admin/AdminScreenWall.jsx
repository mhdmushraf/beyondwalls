import { useState } from 'react';
import { toast } from 'sonner';
import { MonitorPlay, RefreshCw, RotateCcw, Siren } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAdminList } from '@/components/admin/AdminLayout';
import { PageHeader } from '@/components/portal/ui';
import { TilesSkeleton } from '@/components/portal/Skeletons';
import { useSignedUrl, timeAgo } from '@/lib/portalData';

function Tile({ s, orgName, onCmd }) {
  const snap = useSignedUrl(s.last_snapshot_url);
  const st = !s.paired_device_id ? 'unpaired' : s.is_online ? 'online' : 'offline';
  const tone = { online: 'bg-emerald-500', offline: 'bg-rose-500', unpaired: 'bg-amber-400' }[st];
  return (
    <div className="bw-card overflow-hidden">
      <div className="relative aspect-video bg-bw-navy">
        {snap ? <img src={snap} alt="" className="h-full w-full object-cover" /> : <div className="h-full flex items-center justify-center text-white/30"><MonitorPlay className="h-6 w-6" /></div>}
        <span className="absolute top-2 start-2 bw-chip bg-black/60 text-white"><span className={`h-1.5 w-1.5 rounded-full ${tone}`} />{st}</span>
      </div>
      <div className="p-2.5">
        <p className="text-[12px] font-semibold text-bw-navy truncate">{s.name}</p>
        <p className="text-[10px] text-bw-muted truncate">{orgName} · {s.last_heartbeat ? timeAgo(s.last_heartbeat) : 'never'}</p>
        <p className="text-[10px] text-bw-muted truncate">{s.current_item || '—'}</p>
        {s.paired_device_id && (
          <div className="mt-1.5 flex gap-1">
            <button type="button" title="Reload" className="!min-h-0 h-7 flex-1 rounded-lg border border-bw-line text-bw-navy flex items-center justify-center" onClick={() => onCmd(s, 'refresh')}><RefreshCw className="h-3.5 w-3.5" /></button>
            <button type="button" title="Restart" className="!min-h-0 h-7 flex-1 rounded-lg border border-bw-line text-bw-navy flex items-center justify-center" onClick={() => onCmd(s, 'restart')}><RotateCcw className="h-3.5 w-3.5" /></button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminScreenWall() {
  const screens = useAdminList('Screen', { limit: 2000, poll: 30000 });
  const orgs = useAdminList('Organization');
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const orgName = (id) => orgs.items.find((o) => o.id === id)?.name || '—';
  const state = (s) => (!s.paired_device_id ? 'unpaired' : s.is_online ? 'online' : 'offline');
  const shown = screens.items.filter((s) => (filter === 'all' || state(s) === filter) && (!q || `${s.name} ${orgName(s.org_id)}`.toLowerCase().includes(q.toLowerCase())));
  const count = (k) => screens.items.filter((s) => k === 'all' || state(s) === k).length;
  const onCmd = async (s, action) => {
    await base44.entities.Screen.update(s.id, { player_command: `${action}:${Date.now()}` });
    toast.success(`${action} sent to ${s.name}`);
  };

  return (
    <div>
      <PageHeader title="Screen wall" subtitle="Every screen on the platform · refreshes every 30 seconds"
        actions={<span className="bw-chip bg-emerald-50 text-emerald-700 !text-[12px] !py-1.5"><Siren className="h-3.5 w-3.5" />{count('online')} live</span>} />
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {[['all', 'All'], ['online', 'Online'], ['offline', 'Offline'], ['unpaired', 'Not paired']].map(([k, l]) => (
          <button key={k} type="button" onClick={() => setFilter(k)} className={`!min-h-0 rounded-full px-4 py-1.5 text-[13px] font-semibold ${filter === k ? 'bg-bw-navy text-white' : 'bg-white border border-bw-line'}`}>{l} {count(k)}</button>
        ))}
        <input className="bw-input !w-64 ms-auto" placeholder="Search screen or business" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {screens.loading ? <TilesSkeleton count={8} /> : (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
          {shown.map((s) => <Tile key={s.id} s={s} orgName={orgName(s.org_id)} onCmd={onCmd} />)}
        </div>
      )}
    </div>
  );
}
