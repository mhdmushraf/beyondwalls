import { useEffect, useState } from 'react';
import { Save, Building2, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { usePortal } from '@/lib/PortalContext';
import { uploadPublic } from '@/lib/portalData';
import { PageHeader, Field, Toggle } from '@/components/portal/ui';
import { PageSkeleton } from '@/components/portal/Skeletons';
import { useDraft, validate, rules, notifyError, notifySuccess, isOnline } from '@/lib/states';
import { DraftBanner, FieldError } from '@/components/states/StateViews';
import { toast } from 'sonner';

const pick = (o) => ({ name: o?.name || '', whatsapp: o?.whatsapp || '', billing_email: o?.billing_email || '', trn: o?.trn || '', logo_url: o?.logo_url || '', industry: o?.industry || '', auto_approve_creative: !!o?.auto_approve_creative });
const STATUS = { approved: ['Verified', 'bg-emerald-50 text-emerald-700'], pending: ['In review', 'bg-amber-50 text-amber-700'], rejected: ['Not approved', 'bg-rose-50 text-rose-600'], suspended: ['Suspended', 'bg-rose-50 text-rose-600'] };

/** Business settings: details printed on invoices, WhatsApp, and how ads are approved. */
export default function PortalSettings() {
  const { org, reload, loading } = usePortal();
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const saved = org ? pick(org) : undefined;
  useEffect(() => { if (org && !form) setForm(pick(org)); }, [org, form]);
  const { restored, discard, clear } = useDraft(org?.id ? `settings:${org.id}` : null, form, setForm, { enabled: !!form, saved });

  if (loading || !form) return <PageSkeleton />;
  const set = (p) => setForm((f) => ({ ...f, ...p }));
  const st = STATUS[org.status] || STATUS.pending;
  const keep = 100 - Number(org.commission_rate ?? 30);

  const save = async () => {
    const e = validate({ name: [rules.required('Business name'), rules.max('Business name', 80)], ...(form.whatsapp ? { whatsapp: [rules.phoneUAE('WhatsApp number')] } : {}) }, form);
    if (form.billing_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.billing_email)) e.billing_email = 'That email looks wrong — check for typos.';
    if (form.trn && !/^\d{15}$/.test(form.trn.replace(/\s/g, ''))) e.trn = `A UAE TRN has 15 digits. You typed ${form.trn.replace(/\D/g, '').length}.`;
    setErrors(e);
    if (Object.keys(e).length) { toast.error('Fix the highlighted fields first', { description: Object.values(e)[0] }); return; }
    if (!isOnline()) { toast.error("You're offline", { description: 'Your changes are kept on this device. Save again when you reconnect.' }); return; }
    setBusy(true);
    try {
      await base44.entities.Organization.update(org.id, { ...form, name: form.name.trim(), trn: form.trn.replace(/\s/g, '') });
      clear(); reload();
      notifySuccess('Business settings saved', 'New invoices use these details.');
    } catch (err) { notifyError(err, 'save your settings', save); } finally { setBusy(false); }
  };

  return (
    <div className="max-w-3xl">
      <PageHeader title="Business settings" subtitle="Details on your invoices, how we reach you, and how ads are approved"
        actions={<button type="button" className="bw-btn bw-btn-primary" disabled={busy} onClick={save}><Save className="h-4 w-4" />{busy ? 'Saving…' : 'Save'}</button>} />
      {restored && <DraftBanner restored onDiscard={discard} what="settings" />}
      <div className="space-y-5">
        <div className="bw-card p-5 space-y-4">
          <div className="flex items-center gap-4">
            <label className="h-16 w-16 rounded-2xl bg-bw-cream border border-bw-line overflow-hidden flex items-center justify-center cursor-pointer">
              {form.logo_url ? <img src={form.logo_url} alt="" className="h-full w-full object-cover" /> : <Building2 className="h-6 w-6 text-bw-muted" />}
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; if (f.size > 5 * 1048576) { toast.error('Logo is too big', { description: 'Use an image under 5 MB.' }); return; } try { set({ logo_url: await uploadPublic(f) }); } catch (err) { notifyError(err, 'upload the logo'); } }} />
            </label>
            <div className="flex-1">
              <p className="text-[16px] font-bold text-bw-navy">{org.name}</p>
              <p className="text-[12px] text-bw-muted capitalize">{org.type} account · <span className={`bw-chip ${st[1]}`}>{st[0]}</span></p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Business name (as on trade licence)"><input className="bw-input" value={form.name} onChange={(e) => set({ name: e.target.value })} /><FieldError msg={errors.name} /></Field>
            <Field label="Industry"><input className="bw-input" value={form.industry} onChange={(e) => set({ industry: e.target.value })} /></Field>
            <Field label="WhatsApp" hint="We message you here about installs and support"><input className="bw-input" inputMode="tel" placeholder="+971 50 123 4567" value={form.whatsapp} onChange={(e) => set({ whatsapp: e.target.value })} /><FieldError msg={errors.whatsapp} /></Field>
            <Field label="Billing email" hint="Invoices are sent here"><input className="bw-input" type="email" value={form.billing_email} onChange={(e) => set({ billing_email: e.target.value })} /><FieldError msg={errors.billing_email} /></Field>
            <Field label="TRN (optional)" hint="15 digits, printed on your invoices"><input className="bw-input font-mono" inputMode="numeric" value={form.trn} onChange={(e) => set({ trn: e.target.value })} /><FieldError msg={errors.trn} /></Field>
          </div>
        </div>

        <div className="bw-card p-5">
          <p className="text-[15px] font-bold text-bw-navy flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-bw-coral" />Ads on your screens</p>
          <div className="mt-3 flex items-start gap-3">
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-bw-navy">Approve advertisers' ads automatically</p>
              <p className="text-[12px] text-bw-muted">Off: you check every ad in Ad requests before it plays (recommended). On: ads play as soon as they're paid — Beyond Walls still blocks anything against UAE content rules.</p>
            </div>
            <Toggle checked={form.auto_approve_creative} onChange={(v) => set({ auto_approve_creative: v })} />
          </div>
          <p className="mt-4 text-[12px] text-bw-muted">Your share of marketplace ads: <b className="text-bw-navy">{keep}%</b>. To change your plan, message us from Help & support.</p>
        </div>

        <div className="bw-card p-5 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]"><p className="text-[14px] font-bold text-bw-navy">Delete my account</p><p className="text-[12px] text-bw-muted">Removes your login and personal details. The business and its records stay for your team.</p></div>
          <a href="/delete-account" className="bw-btn bw-btn-ghost !text-rose-600">Delete account</a>
        </div>
      </div>
    </div>
  );
}
