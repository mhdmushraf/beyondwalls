import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, QrCode, Trash2, Copy, ExternalLink, Save } from 'lucide-react';
import { toast } from 'sonner';
import { usePortal } from '@/lib/PortalContext';
import { useOrgEntity } from '@/lib/useOrgEntity';
import { PageHeader, EmptyState, Toggle, Field, ScreenPicker } from '@/components/portal/ui';
import { ListSkeleton } from '@/components/portal/Skeletons';
import { useDraft, validate, rules, notifyError, notifySuccess } from '@/lib/states';
import { DraftBanner, FieldError, ErrorState, SlowHint } from '@/components/states/StateViews';

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    notifySuccess('Link copied', 'Paste it in WhatsApp or Instagram to test it.');
  } catch (e) {
    window.prompt('Your browser blocked copying. Select the link and copy it yourself:', text);
  }
}

const KINDS = [
  ['offer', 'Offer'], ['menu', 'Menu'], ['google_review', 'Google review'], ['instagram', 'Instagram'], ['whatsapp', 'WhatsApp'], ['website', 'Website'],
];
const POS = [['bottom_right', 'Bottom right'], ['bottom_left', 'Bottom left'], ['top_right', 'Top right'], ['top_left', 'Top left']];

export function qrLink(id, screenId) {
  return `${window.location.origin}/q/${id}${screenId ? `?s=${screenId}` : ''}`;
}

export default function PortalQR() {
  const { screens, venues } = usePortal();
  const { items, loading, error, reload, create, update, remove, preview } = useOrgEntity('QRCode', { sort: 'created_date' });
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [base, setBase] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => { if (!activeId && items.length) setActiveId(items[0].id); }, [items, activeId]);
  useEffect(() => {
    const q = items.find((x) => x.id === activeId);
    setDraft(q ? { ...q } : null);
    setBase(q ? { ...q } : null);
    setErrors({});
  }, [activeId, items.length]);
  const { restored, discard, clear } = useDraft(activeId ? `qr:${activeId}` : null, draft, setDraft, { saved: base, enabled: !!base && !!draft });

  const set = (p) => setDraft((d) => ({ ...d, ...p }));
  const add = async () => {
    try {
      const rec = await create({ label: '10% off breakfast', target_url: 'https://', kind: 'offer', position: 'bottom_right', screen_ids: [], is_active: true, scans: 0 });
      setActiveId(rec.id);
      notifySuccess('QR created', 'Add the link customers should land on, then Save.');
    } catch (e) { notifyError(e, 'create the QR', add); }
  };
  const save = async () => {
    const errs = validate({ label: [rules.required('The text next to the code'), rules.max('The text', 40)], target_url: [rules.url('The link')] }, draft);
    setErrors(errs);
    if (Object.keys(errs).length) { toast.error('Fix the highlighted fields first', { description: Object.values(errs)[0] }); return; }
    const { label, target_url, kind, position, screen_ids, is_active } = draft;
    try {
      await update(activeId, { label, target_url: target_url.trim(), kind, position, screen_ids, is_active });
      clear();
      setBase(draft);
      notifySuccess(`Saved · shows on ${screen_ids?.length || 0} screens`, screen_ids?.length ? 'Scan it with your phone camera to test.' : 'Pick screens under "Show on" so customers can see it.');
    } catch (e) { notifyError(e, 'save the QR', save); }
  };

  if (loading) return <div><SlowHint loading forced={preview === 'slow'} /><ListSkeleton rows={3} /></div>;
  if (error && !items.length) return <div><PageHeader title="QR codes" /><ErrorState error={error} action="load your QR codes" onRetry={reload} /></div>;
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
      {restored && <DraftBanner restored onDiscard={discard} what="QR changes" />}
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
                <Field label="Text next to the code"><input className="bw-input" maxLength={40} value={draft.label || ''} onChange={(e) => set({ label: e.target.value })} /><FieldError msg={errors.label} /></Field>
                <Field label="Type">
                  <select className="bw-input" value={draft.kind || 'offer'} onChange={(e) => set({ kind: e.target.value })}>{KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                </Field>
              </div>
              <Field label="Link" hint="Where the customer lands after scanning"><input className="bw-input" value={draft.target_url || ''} onChange={(e) => set({ target_url: e.target.value })} /><FieldError msg={errors.target_url} /></Field>
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
                <button type="button" className="bw-btn bw-btn-ghost !text-rose-600" onClick={async () => { if (!window.confirm('Delete this QR? Printed or shown codes will stop working.')) return; try { await remove(activeId); clear(); setActiveId(null); notifySuccess('QR deleted', 'It disappears from your screens within a minute.'); } catch (e) { notifyError(e, 'delete the QR'); } }}><Trash2 className="h-4 w-4" />Delete</button>
              </div>
            </div>
            <div className="bw-card p-5 h-fit text-center">
              <div className="inline-block rounded-2xl bg-white p-3 border border-bw-line"><QRCodeSVG value={qrLink(draft.id)} size={180} /></div>
              <p className="mt-3 text-[15px] font-bold text-bw-navy">{draft.label}</p>
              <p className="text-[32px] font-extrabold text-bw-coral">{draft.scans || 0}</p>
              <p className="text-[12px] text-bw-muted -mt-1">scans{draft.last_scan_at ? ` · last ${new Date(draft.last_scan_at).toLocaleString()}` : ''}</p>
              <div className="mt-3 flex gap-2 justify-center">
                <button type="button" className="bw-btn bw-btn-ghost !py-1.5" onClick={() => copyText(qrLink(draft.id))}><Copy className="h-3.5 w-3.5" />Copy link</button>
                <a className="bw-btn bw-btn-ghost !py-1.5" href={qrLink(draft.id)} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" />Test</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
