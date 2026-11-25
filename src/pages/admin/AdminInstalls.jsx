import { useState } from 'react';
import { toast } from 'sonner';
import { MapPin, Phone, Calendar, User } from 'lucide-react';
import { useAdminList } from '@/components/admin/AdminLayout';
import { PageHeader, Field } from '@/components/portal/ui';
import { TableSkeleton } from '@/components/portal/Skeletons';

const COLS = [
  ['requested', 'Requested', 'bg-amber-50 text-amber-700'],
  ['scheduled', 'Scheduled', 'bg-sky-50 text-sky-700'],
  ['on_the_way', 'On the way', 'bg-violet-50 text-violet-700'],
  ['installed', 'Installed', 'bg-emerald-50 text-emerald-700'],
];

export default function AdminInstalls() {
  const jobs = useAdminList('InstallJob');
  const [edit, setEdit] = useState(null);

  const save = async () => {
    const { id, technician, scheduled_at, status, notes } = edit;
    await jobs.update(id, { technician, scheduled_at, status, notes });
    toast.success('Install updated');
    setEdit(null);
  };

  if (jobs.loading) return <TableSkeleton />;

  return (
    <div>
      <PageHeader title="Installs" subtitle="B.One orders and on-site setup visits requested by venues" />
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLS.map(([key, label, tone]) => {
          const list = jobs.items.filter((j) => j.status === key);
          return (
            <div key={key} className="rounded-2xl bg-[#EEEDF5] p-3">
              <p className="mb-2 flex items-center justify-between text-[13px] font-bold text-bw-navy">{label}<span className={`bw-chip ${tone}`}>{list.length}</span></p>
              <div className="space-y-2">
                {list.map((j) => (
                  <button key={j.id} type="button" onClick={() => setEdit({ ...j })} className="!min-h-0 !block w-full text-start bw-card p-3 hover:border-bw-violet">
                    <p className="text-[13px] font-bold text-bw-navy">{j.venue_name || j.org_name}</p>
                    <p className="text-[11px] text-bw-muted flex items-center gap-1"><MapPin className="h-3 w-3" />{j.address || j.emirate || '—'}</p>
                    <p className="text-[11px] text-bw-muted flex items-center gap-1"><Phone className="h-3 w-3" />{j.contact_name} {j.contact_phone}</p>
                    <p className="mt-1 text-[11px] text-bw-ink">{j.screens_count || 1} screens · {j.bone_units || 0} B.One · AED {j.amount_aed || 0}</p>
                    {j.scheduled_at && <p className="text-[11px] text-bw-coral flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(j.scheduled_at).toLocaleString()}</p>}
                    {j.technician && <p className="text-[11px] text-bw-muted flex items-center gap-1"><User className="h-3 w-3" />{j.technician}</p>}
                  </button>
                ))}
                {!list.length && <p className="text-[12px] text-bw-muted px-1 py-3">Nothing here.</p>}
              </div>
            </div>
          );
        })}
      </div>

      {edit && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setEdit(null)}>
          <div className="bw-card p-5 w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
            <p className="text-[17px] font-bold text-bw-navy">{edit.venue_name || edit.org_name}</p>
            <p className="text-[12px] text-bw-muted">{edit.notes}</p>
            <Field label="Status"><select className="bw-input" value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>{[...COLS, ['cancelled', 'Cancelled']].map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
            <Field label="Visit date & time"><input type="datetime-local" className="bw-input" value={edit.scheduled_at ? edit.scheduled_at.slice(0, 16) : ''} onChange={(e) => setEdit({ ...edit, scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : '' })} /></Field>
            <Field label="Technician"><input className="bw-input" value={edit.technician || ''} onChange={(e) => setEdit({ ...edit, technician: e.target.value })} /></Field>
            <div className="flex justify-end gap-2"><button type="button" className="bw-btn bw-btn-ghost" onClick={() => setEdit(null)}>Cancel</button><button type="button" className="bw-btn bw-btn-primary" onClick={save}>Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
