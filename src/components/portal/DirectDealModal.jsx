import { useState } from 'react';
import { toast } from 'sonner';
import { X, Upload } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { usePortal } from '@/lib/PortalContext';
import { uploadPublic } from '@/lib/portalData';
import { Field } from '@/components/portal/ui';
import { useDraft, isOnline, notifyError, notifySuccess } from '@/lib/states';
import { FieldError, DraftBanner } from '@/components/states/StateViews';

const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai' }).format(new Date());
const BLANK = { screen_id: '', advertiser_name: '', campaign_name: '', start_date: '', weeks: 4, amount: '', creative_url: '', creative_type: 'image' };

/** Venue records an ad it sold itself. Beyond Walls plays + reports it and charges the direct-deal fee. */
export default function DirectDealModal({ onClose, onDone, feePct = 10 }) {
  const { screens, org } = usePortal();
  const adScreens = screens.filter((s) => (s.mode || 'signage_ads') !== 'signage_only');
  const [f, setF] = useState(() => ({ ...BLANK, start_date: today(), screen_id: adScreens[0]?.id || '' }));
  const { restored, discard, clear } = useDraft(org?.id ? `direct:${org.id}` : null, f, setF, { enabled: true });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const set = (p) => setF((x) => ({ ...x, ...p }));
  const fee = Math.round((Number(f.amount) || 0) * feePct) / 100;

  const onFile = async (file) => {
    if (!file) return;
    if (!/^(image|video)\//.test(file.type)) { setErrors((e) => ({ ...e, creative_url: 'Use an image or a video.' })); return; }
    if (file.size > 200 * 1048576) { setErrors((e) => ({ ...e, creative_url: 'Max 200 MB.' })); return; }
    setUploading(true);
    try { set({ creative_url: await uploadPublic(file), creative_type: file.type.startsWith('video') ? 'video' : 'image' }); setErrors((e) => ({ ...e, creative_url: null })); }
    catch (e) { notifyError(e, `upload ${file.name}`); } finally { setUploading(false); }
  };

  const save = async () => {
    const e = {};
    if (!f.screen_id) e.screen_id = 'Pick a screen.';
    if (!f.advertiser_name.trim()) e.advertiser_name = 'Who is the advertiser? e.g. "Al Noor Pharmacy".';
    if (!f.start_date || f.start_date < today()) e.start_date = 'Pick today or a later date.';
    if (!(Number(f.amount) > 0)) e.amount = 'Enter what they pay you, in AED.';
    if (!f.creative_url) e.creative_url = 'Upload the ad.';
    setErrors(e);
    if (Object.keys(e).length) return;
    if (!isOnline()) { toast.error("You're offline", { description: 'Your deal is saved on this device — save again when you reconnect.' }); return; }
    setBusy(true);
    try {
      await base44.functions.invoke('directDeal', { ...f, weeks: Number(f.weeks), amount: Number(f.amount) });
      clear();
      notifySuccess('Direct deal added', `It plays from ${f.start_date}. We'll invoice the ${feePct}% fee (AED ${fee}).`);
      onDone?.();
      onClose();
    } catch (err) {
      const m = err?.response?.data?.error; const fld = err?.response?.data?.field;
      if (m && fld) setErrors({ [fld]: m }); else if (m) toast.error("Couldn't add the deal", { description: m }); else notifyError(err, 'add the deal', save);
    } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bw-card w-full max-w-lg p-5 space-y-3 max-h-[92vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between"><p className="text-[17px] font-bold text-bw-navy">Add a direct deal</p><button type="button" className="!min-h-0" onClick={onClose}><X className="h-5 w-5" /></button></div>
        <p className="text-[12px] text-bw-muted">An advertiser you found yourself and who pays you directly. We play it, count plays, and invoice you a {feePct}% fee.</p>
        {restored && <DraftBanner restored onDiscard={discard} what="deal" />}
        {!adScreens.length ? <p className="text-[13px] text-amber-700">None of your screens show ads. Set a screen to "Signage + Ads" or "Ads only" first.</p> : (
          <Field label="Screen"><select className="bw-input" value={f.screen_id} onChange={(e) => set({ screen_id: e.target.value })}>{adScreens.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select><FieldError msg={errors.screen_id} /></Field>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Advertiser"><input className="bw-input" value={f.advertiser_name} onChange={(e) => set({ advertiser_name: e.target.value })} /><FieldError msg={errors.advertiser_name} /></Field>
          <Field label="Campaign (optional)"><input className="bw-input" value={f.campaign_name} onChange={(e) => set({ campaign_name: e.target.value })} /></Field>
          <Field label="Start date"><input type="date" min={today()} className="bw-input" value={f.start_date} onChange={(e) => set({ start_date: e.target.value })} /><FieldError msg={errors.start_date} /></Field>
          <Field label="Weeks"><select className="bw-input" value={f.weeks} onChange={(e) => set({ weeks: Number(e.target.value) })}>{[1, 2, 4, 8, 12, 26, 52].map((w) => <option key={w} value={w}>{w}</option>)}</select></Field>
          <Field label="They pay you (AED)" hint={Number(f.amount) > 0 ? `Our fee: AED ${fee}` : ''}><input type="number" min="1" className="bw-input" value={f.amount} onChange={(e) => set({ amount: e.target.value })} /><FieldError msg={errors.amount} /></Field>
        </div>
        <div>
          <label className="bw-btn bw-btn-ghost w-full cursor-pointer"><Upload className="h-4 w-4" />{uploading ? 'Uploading…' : f.creative_url ? 'Ad uploaded — change' : 'Upload the ad'}<input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} /></label>
          <FieldError msg={errors.creative_url} />
        </div>
        <button type="button" className="bw-btn bw-btn-primary w-full" disabled={busy || uploading || !adScreens.length} onClick={save}>{busy ? 'Saving…' : 'Add deal'}</button>
      </div>
    </div>
  );
}
