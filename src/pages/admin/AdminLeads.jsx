import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Phone, MessageCircle } from 'lucide-react';
import { useAdminList } from '@/components/admin/AdminLayout';
import { ErrorState, SlowHint } from '@/components/states/StateViews';
import { PageHeader, Field } from '@/components/portal/ui';
import { TableSkeleton } from '@/components/portal/Skeletons';

const STAGES = [['new', 'New'], ['contacted', 'Contacted'], ['demo', 'Demo'], ['proposal', 'Proposal'], ['won', 'Won'], ['lost', 'Lost']];
const blank = { name: '', company: '', phone: '', email: '', type: 'venue', source: 'whatsapp', stage: 'new', screens_estimate: '', value_aed: '', next_step: '', notes: '', emirate: 'Dubai' };

export default function AdminLeads() {
  const leads = useAdminList('Lead', { sort: '-updated_date' });
  const [edit, setEdit] = useState(null);
  const [type, setType] = useState('all');

  const save = async () => {
    if (!edit.name.trim()) { toast.error('Name is required'); return; }
    const data = { ...edit, screens_estimate: edit.screens_estimate === '' ? undefined : Number(edit.screens_estimate), value_aed: edit.value_aed === '' ? undefined : Number(edit.value_aed) };
    if (edit.id) { const { id, created_date, updated_date, created_by, created_by_id, ...rest } = data; await leads.update(id, rest); } else await leads.create(data); // eslint-disable-line no-unused-vars
    toast.success('Lead saved');
    setEdit(null);
  };

  if (leads.loading) return <div><SlowHint loading forced={leads.preview === 'slow'} /><TableSkeleton /></div>;
  if (leads.error && !leads.items.length) return <ErrorState error={leads.error} action="load leads" onRetry={leads.reload} />;
  const shown = leads.items.filter((l) => type === 'all' || l.type === type);
  const pipeline = shown.filter((l) => !['won', 'lost'].includes(l.stage)).reduce((s, l) => s + (l.value_aed || 0), 0);

  return (
    <div>
      <PageHeader title="Leads" subtitle={`${shown.length} leads · AED ${pipeline.toLocaleString()} open pipeline`}
        actions={<button type="button" className="bw-btn bw-btn-primary" onClick={() => setEdit({ ...blank })}><Plus className="h-4 w-4" />Add lead</button>} />
      <div className="flex gap-2 mb-4">
        {[['all', 'All'], ['venue', 'Venues'], ['advertiser', 'Advertisers'], ['agency', 'Agencies']].map(([k, l]) => (
          <button key={k} type="button" onClick={() => setType(k)} className={`!min-h-0 rounded-full px-4 py-1.5 text-[13px] font-semibold ${type === k ? 'bg-bw-navy text-white' : 'bg-white border border-bw-line'}`}>{l}</button>
        ))}
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {STAGES.map(([key, label]) => {
          const list = shown.filter((l) => l.stage === key);
          return (
            <div key={key} className="w-64 shrink-0 rounded-2xl bg-[#EEEDF5] p-3">
              <p className="mb-2 text-[13px] font-bold text-bw-navy">{label} · {list.length}</p>
              <div className="space-y-2">
                {list.map((l) => (
                  <div key={l.id} className="bw-card p-3">
                    <button type="button" className="!min-h-0 !block text-start w-full" onClick={() => setEdit({ ...blank, ...l, screens_estimate: l.screens_estimate ?? '', value_aed: l.value_aed ?? '' })}>
                      <p className="text-[13px] font-bold text-bw-navy">{l.company || l.name}</p>
                      <p className="text-[11px] text-bw-muted">{l.name} · {l.type} · {l.source}</p>
                      {(l.screens_estimate || l.value_aed) && <p className="text-[11px] text-bw-ink">{l.screens_estimate ? `${l.screens_estimate} screens` : ''}{l.value_aed ? ` · AED ${l.value_aed}` : ''}</p>}
                      {l.next_step && <p className="text-[11px] text-bw-coral">Next: {l.next_step}</p>}
                    </button>
                    <div className="mt-2 flex gap-1">
                      {l.phone && <a className="!min-h-0 bw-chip bg-emerald-50 text-emerald-700" href={`https://wa.me/${String(l.phone).replace(/\D/g, '')}`} target="_blank" rel="noreferrer"><MessageCircle className="h-3 w-3" />WhatsApp</a>}
                      {l.phone && <a className="!min-h-0 bw-chip bg-bw-cream text-bw-ink" href={`tel:${l.phone}`}><Phone className="h-3 w-3" />Call</a>}
                      <select className="ms-auto text-[11px] bg-transparent" value={l.stage} onChange={(e) => leads.update(l.id, { stage: e.target.value })}>{STAGES.map(([k, s]) => <option key={k} value={k}>{s}</option>)}</select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {edit && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setEdit(null)}>
          <div className="bw-card p-5 w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-3" onClick={(e) => e.stopPropagation()}>
            <p className="text-[17px] font-bold text-bw-navy">{edit.id ? 'Edit lead' : 'New lead'}</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Contact name"><input className="bw-input" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
              <Field label="Company"><input className="bw-input" value={edit.company} onChange={(e) => setEdit({ ...edit, company: e.target.value })} /></Field>
              <Field label="Phone / WhatsApp"><input className="bw-input" value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} /></Field>
              <Field label="Email"><input className="bw-input" value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} /></Field>
              <Field label="Type"><select className="bw-input" value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value })}>{['venue', 'advertiser', 'agency', 'investor', 'other'].map((x) => <option key={x}>{x}</option>)}</select></Field>
              <Field label="Source"><select className="bw-input" value={edit.source} onChange={(e) => setEdit({ ...edit, source: e.target.value })}>{['website', 'whatsapp', 'referral', 'walk_in', 'event', 'outbound', 'other'].map((x) => <option key={x}>{x}</option>)}</select></Field>
              <Field label="Screens (estimate)"><input type="number" className="bw-input" value={edit.screens_estimate} onChange={(e) => setEdit({ ...edit, screens_estimate: e.target.value })} /></Field>
              <Field label="Value (AED / month)"><input type="number" className="bw-input" value={edit.value_aed} onChange={(e) => setEdit({ ...edit, value_aed: e.target.value })} /></Field>
            </div>
            <Field label="Stage"><select className="bw-input" value={edit.stage} onChange={(e) => setEdit({ ...edit, stage: e.target.value })}>{STAGES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
            <Field label="Next step"><input className="bw-input" value={edit.next_step} onChange={(e) => setEdit({ ...edit, next_step: e.target.value })} /></Field>
            <Field label="Notes"><textarea rows={3} className="bw-input" value={edit.notes} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} /></Field>
            <div className="flex justify-between">
              {edit.id ? <button type="button" className="bw-btn bw-btn-ghost !text-rose-600" onClick={async () => { if (window.confirm('Delete lead?')) { await leads.remove(edit.id); setEdit(null); } }}>Delete</button> : <span />}
              <div className="flex gap-2"><button type="button" className="bw-btn bw-btn-ghost" onClick={() => setEdit(null)}>Cancel</button><button type="button" className="bw-btn bw-btn-primary" onClick={save}>Save</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
