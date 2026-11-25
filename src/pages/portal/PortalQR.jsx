import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, QrCode, Trash2, Copy, ExternalLink, Save } from 'lucide-react';
import { toast } from 'sonner';
import { usePortal } from '@/lib/PortalContext';
import { useOrgEntity } from '@/lib/useOrgEntity';
import { PageHeader, EmptyState, Toggle, Field, ScreenPicker } from '@/components/portal/ui';
import { ListSkeleton } from '@/components/portal/Skeletons';

const KINDS = [
  ['offer', 'Offer'], ['menu', 'Menu'], ['google_review', 'Google review'], ['instagram', 'Instagram'], ['whatsapp', 'WhatsApp'], ['website', 'Website'],
];
const POS = [['bottom_right', 'Bottom right'], ['bottom_left', 'Bottom left'], ['top_right', 'Top right'], ['top_left', 'Top left']];

export function qrLink(id, screenId) {
  return `${window.location.origin}/q/${id}${screenId ? `?s=${screenId}` : ''}`;
}

export default function PortalQR() {
  const { screens, venues } = usePortal();
  const { items, loading, create, update, remove } = useOrgEntity('QRCode', { sort: 'created_date' });
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState(null);

  useEffect(() => { if (!activeId && items.length) setActiveId(items[0].id); }, [items, activeId]);
  useEffect(() => {
    const q = items.find((x) => x.id === activeId);
    setDraft(q ? { ...q } : null);
  }, [activeId, items.length]);

  const set = (p) => setDraft((d) => ({ ...d, ...p }));
  const add = async () => {
    const rec = await create({ label: '10% off breakfast', target_url: 'https://', kind: 'offer', position: 'bottom_right', screen_ids: [], is_active: true, scans: 0 });
    setActiveId(rec.id);
  };
  const save = async () => {
    if (!/^https?:\/\/.+\..+/i.test(draft.target_url || '')) { toast.error('Enter a full link, e.g. https://beancoffee.ae/menu'); return; }
    const { label, target_url, kind, position, screen_ids, is_active } = draft;
    await update(activeId, { label, target_url, kind, position, screen_ids, is_active });
    toast.success(`Saved · shows on ${screen_ids?.length || 0} screens`);
  };

  if (loading) return <ListSkeleton rows={3} />;
  if (!items.length) {
    return (
      <div>
        <PageHeader title="QR codes" subtitle="Put a scannable offer on your screens and count every scan." />
        <EmptyState icon={QrCode} title="Add your first QR" body="Link to an offer, your menu, Google reviews or Instagram."
          action={<button type="button" className="bw-btn bw-btn-primary" onClick={add}><Plus className="h-4 w-4" />New QR</button>} />
      </div>
    );
  }

  const total = items.reduce((s, q) => s + (q.scans || 0), 0);

  return (
    <div>
      <PageHeader title="QR codes" subtitle={`${total} scans in total · each scan is counted, then the visitor is sent to your link`}
        actions={<><button type="button" className="bw-btn bw-btn-ghost" onClick={add}><Plus className="h-4 w-4" />New QR</button><button type="button" className="bw-btn bw-btn-primary" onClick={save} disabled={!draft}><Save className="h-4 w-4" />Save</button></>} />
      <div className="grid lg:grid-cols-[300px_1fr] gap-5">
        <div className="bw-card p-2 h-fit">
          {items.map((q) => (
            <button key={q.id} type="button" onClick={() => setActiveId(q.id)}
              className={`!min-h-0 w-full !justify-start flex items-center gap-3 rounded-xl px-3 py-2.5 text-start ${q.id === activeId ? 'bg-bw-lav' : 'hover:bg-bw-cream'}`}>
              <span className="h-10 w-10 rounded-lg bg-white border border-bw-line flex items-center justify-center"><QRCodeSVG value={qrLink(q.id)} size={30} /></span>
              <span className="flex-1 min-w-0">
                <span className="block text-[13px] font-semibold text-bw-navy truncate">{q.label || 'QR'}</span>
                <span className="block text-[11px] text-bw-muted">{q.scans || 0} scans · {(q.screen_ids || []).length} screens</span>
              </span>
              {q.is_active === false && <span className="bw-chip bg-bw-cream text-bw-muted">Off</span>}
            </button>
          ))}
        </div>
        {draft && (
          <div className="grid xl:grid-cols-[1fr_300px] gap-5">
            <div className="bw-card p-5 space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                <Field label="Text next to the code"><input className="bw-input" maxLength={40} value={draft.label || ''} onChange={(e) => set({ label: e.target.value })} /></Field>
                <Field label="Type">
                  <select className="bw-input" value={draft.kind || 'offer'} onChange={(e) => set({ kind: e.target.value })}>{KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                </Field>
              </div>
              <Field label="Link" hint="Where the customer lands after scanning"><input className="bw-input" value={draft.target_url || ''} onChange={(e) => set({ target_url: e.target.value })} /></Field>
              <div className="grid md:grid-cols-2 gap-3 items-end">
                <Field label="Corner on screen">
                  <select className="bw-input" value={draft.position || 'bottom_right'} onChange={(e) => set({ position: e.target.value })}>{POS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                </Field>
                <div className="flex items-center gap-3 pb-2"><Toggle checked={draft.is_active !== false} onChange={(v) => set({ is_active: v })} /><span className="text-[13px] font-semibold text-bw-navy">Show on screens</span></div>
              </div>
              <div>
                <p className="text-[12px] font-semibold text-bw-ink mb-2">Show on</p>
                <ScreenPicker screens={screens} venues={venues} value={draft.screen_ids || []} onChange={(v) => set({ screen_ids: v })} />
              </div>
              <div className="flex justify-end">
                <button type="button" className="bw-btn bw-btn-ghost !text-rose-600" onClick={async () => { if (window.confirm('Delete this QR?')) { await remove(activeId); setActiveId(null); } }}><Trash2 className="h-4 w-4" />Delete</button>
              </div>
            </div>
            <div className="bw-card p-5 h-fit text-center">
              <div className="inline-block rounded-2xl bg-white p-3 border border-bw-line"><QRCodeSVG value={qrLink(draft.id)} size={180} /></div>
              <p className="mt-3 text-[15px] font-bold text-bw-navy">{draft.label}</p>
              <p className="text-[32px] font-extrabold text-bw-coral">{draft.scans || 0}</p>
              <p className="text-[12px] text-bw-muted -mt-1">scans{draft.last_scan_at ? ` · last ${new Date(draft.last_scan_at).toLocaleString()}` : ''}</p>
              <div className="mt-3 flex gap-2 justify-center">
                <button type="button" className="bw-btn bw-btn-ghost !py-1.5" onClick={() => { navigator.clipboard?.writeText(qrLink(draft.id)); toast.success('Link copied'); }}><Copy className="h-3.5 w-3.5" />Copy link</button>
                <a className="bw-btn bw-btn-ghost !py-1.5" href={qrLink(draft.id)} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" />Test</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
