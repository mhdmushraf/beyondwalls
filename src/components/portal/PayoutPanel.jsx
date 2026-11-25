import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Wallet, Banknote, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { usePortal } from '@/lib/PortalContext';
import { Field } from '@/components/portal/ui';
import { StatCardsSkeleton } from '@/components/portal/Skeletons';
import { isOnline, notifyError, notifySuccess, useDraft } from '@/lib/states';
import { ErrorState, FieldError, DraftBanner } from '@/components/states/StateViews';

const aed = (n) => `AED ${Number(n || 0).toLocaleString('en-AE', { maximumFractionDigits: 2 })}`;
const PST = { pending: ['Requested', 'bg-amber-50 text-amber-700'], approved: ['Approved', 'bg-bw-lav text-bw-coral'], paid: ['Paid', 'bg-emerald-50 text-emerald-700'], rejected: ['Needs attention', 'bg-rose-50 text-rose-600'] };

/** Venue earnings from the marketplace, and the payout request form. */
export default function PayoutPanel({ refreshKey = 0 }) {
  const { org, preview } = usePortal();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [bank, setBank] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const { restored, discard, clear } = useDraft(org?.id ? `payout:${org.id}` : null, bank, setBank, { enabled: open });

  const load = async () => {
    if (!org?.id) return;
    if (preview === 'error') { setError({ response: { status: 500 } }); return; }
    setError(null);
    try {
      const res = await base44.functions.invoke('venuePayout', { action: 'summary', org_id: org.id });
      setData(res.data);
    } catch (e) { setError(e); }
  };
  // eslint-disable-next-line
  useEffect(() => { if (isOnline()) load(); }, [org?.id, refreshKey]);

  const request = async () => {
    const e = {};
    if (!String(bank.account_holder_name || '').trim()) e.account_holder_name = 'Account holder name is required — it must match the bank account.';
    if (!String(bank.bank_name || '').trim()) e.bank_name = 'Bank name is required, e.g. Emirates NBD.';
    const iban = String(bank.iban || '').replace(/\s+/g, '').toUpperCase();
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) e.iban = "That IBAN doesn't look right. UAE IBANs start with AE and have 23 characters.";
    else if (iban.startsWith('AE') && iban.length !== 23) e.iban = `UAE IBANs have 23 characters — you typed ${iban.length}.`;
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      const res = await base44.functions.invoke('venuePayout', { action: 'request', org_id: org.id, ...bank, iban });
      clear(); setOpen(false);
      notifySuccess(`Payout of ${aed(res.data?.payout?.amount)} requested`, 'We send payouts every week. You get a notification when it is sent.');
      load();
    } catch (err) {
      const m = err?.response?.data?.error; const f = err?.response?.data?.field;
      if (m && f) setErrors({ [f]: m }); else if (m) toast.error("Couldn't request the payout", { description: m }); else notifyError(err, 'request the payout', request);
    } finally { setBusy(false); }
  };

  if (error) return <div className="mb-5"><ErrorState error={error} action="load your earnings" onRetry={load} /></div>;
  if (!data) return <div className="mb-5"><StatCardsSkeleton count={3} /></div>;

  const can = data.available >= data.min_payout && !data.in_progress;

  return (
    <div className="mb-5 space-y-3">
      <div className="grid sm:grid-cols-4 gap-3">
        <div className="bw-card p-4 sm:col-span-2 flex items-center gap-4">
          <span className="h-11 w-11 rounded-xl bg-emerald-50 flex items-center justify-center"><Wallet className="h-5 w-5 text-emerald-600" /></span>
          <div className="flex-1">
            <p className="text-[12px] text-bw-muted">Ready to pay out</p>
            <p className="text-[24px] font-bold text-bw-navy">{aed(data.available)}</p>
            <p className="text-[11px] text-bw-muted">{data.in_progress ? `${aed(data.in_progress)} on its way to your bank` : data.available < data.min_payout ? `Payouts from ${aed(data.min_payout)} · money is ready once a booking's dates finish` : `${data.available_count} finished bookings`}</p>
          </div>
          <button type="button" className="bw-btn bw-btn-primary" disabled={!can} onClick={() => { setBank((b) => b || data.last_bank); setErrors({}); setOpen(true); }}><Banknote className="h-4 w-4" />Request payout</button>
        </div>
        <div className="bw-card p-4"><p className="text-[12px] text-bw-muted">Running now</p><p className="text-[20px] font-bold text-bw-navy">{aed(data.running)}</p><p className="text-[11px] text-bw-muted">Ready when the dates end</p></div>
        <div className="bw-card p-4"><p className="text-[12px] text-bw-muted">Paid out so far</p><p className="text-[20px] font-bold text-bw-navy">{aed(data.paid_out)}</p><p className="text-[11px] text-bw-muted">{aed(data.waiting)} waiting for advertiser payment</p></div>
      </div>

      {data.payouts.length > 0 && (
        <div className="bw-card p-3">
          <p className="text-[13px] font-bold text-bw-navy px-1 mb-1">Payouts</p>
          {data.payouts.slice(0, 5).map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-2 px-1 py-2 border-t border-bw-line first:border-0 text-[13px]">
              <span className="font-semibold text-bw-navy w-28">{aed(p.amount)}</span>
              <span className={`bw-chip ${PST[p.status]?.[1]}`}>{PST[p.status]?.[0]}</span>
              <span className="text-bw-muted">{new Date(p.created_date).toLocaleDateString()} · to …{p.iban_last4}{p.reference_id ? ` · ref ${p.reference_id}` : ''}</span>
              {p.status === 'rejected' && <span className="w-full text-[12px] text-rose-600">{p.admin_notes}</span>}
            </div>
          ))}
        </div>
      )}

      {open && bank && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bw-card w-full max-w-md p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><p className="text-[17px] font-bold text-bw-navy">Request {aed(data.available)}</p><button type="button" className="!min-h-0" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button></div>
            {restored && <DraftBanner restored onDiscard={discard} what="bank details" />}
            <Field label="Account holder name"><input className="bw-input" value={bank.account_holder_name} onChange={(e) => setBank({ ...bank, account_holder_name: e.target.value })} /><FieldError msg={errors.account_holder_name} /></Field>
            <Field label="Bank"><input className="bw-input" placeholder="e.g. Emirates NBD" value={bank.bank_name} onChange={(e) => setBank({ ...bank, bank_name: e.target.value })} /><FieldError msg={errors.bank_name} /></Field>
            <Field label="IBAN"><input className="bw-input font-mono" placeholder="AE07 0331 2345 6789 0123 456" value={bank.iban} onChange={(e) => setBank({ ...bank, iban: e.target.value.toUpperCase() })} /><FieldError msg={errors.iban} /></Field>
            <Field label="SWIFT (optional)"><input className="bw-input font-mono" value={bank.swift_code} onChange={(e) => setBank({ ...bank, swift_code: e.target.value.toUpperCase() })} /></Field>
            <p className="text-[11px] text-bw-muted">We pay out weekly by bank transfer. Check the details carefully — money sent to a wrong IBAN is hard to get back.</p>
            <button type="button" className="bw-btn bw-btn-primary w-full" disabled={busy} onClick={request}>{busy ? 'Sending request…' : `Request ${aed(data.available)}`}</button>
          </div>
        </div>
      )}
    </div>
  );
}
