import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Box, Wrench, Loader2, Receipt } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { usePortal } from '@/lib/PortalContext';
import { useOrgEntity } from '@/lib/useOrgEntity';
import { PageHeader, Field } from '@/components/portal/ui';
import InvoiceView from '@/components/billing/InvoiceView';
import { validate, rules, notifyError, notifySuccess } from '@/lib/states';
import { FieldError } from '@/components/states/StateViews';

export function usePlatformSettings() {
  const [s, setS] = useState({});
  useEffect(() => {
    base44.entities.PlatformSettings.filter({ key: 'main' }, { limit: 1 }).then((p) => setS((p.items || p || [])[0] || {})).catch(() => {});
  }, []);
  return s;
}

export default function PortalBilling() {
  const { user } = useAuth();
  const { org, screens, venues } = usePortal();
  const settings = usePlatformSettings();
  const invoices = useOrgEntity('Invoice', { sort: '-created_date' });
  const installs = useOrgEntity('InstallJob');
  const [view, setView] = useState(null);
  const [order, setOrder] = useState(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  const price = { signage_ads: settings.price_signage_ads ?? 15, signage_only: settings.price_signage_only ?? 29, ads_only: settings.price_ads_only ?? 0 };
  const rows = [['signage_ads', 'Signage + Ads'], ['signage_only', 'Signage only'], ['ads_only', 'Ads only']].map(([k, l]) => {
    const qty = screens.filter((s) => (s.mode || 'signage_ads') === k).length;
    return { k, l, qty, unit: price[k], amount: qty * price[k] };
  }).filter((r) => r.qty);
  const monthly = rows.reduce((s, r) => s + r.amount, 0);
  const bone = settings.bone_price ?? 449;
  const unpaid = invoices.items.filter((i) => i.status === 'issued');

  const submitOrder = async () => {
    const errs = validate({ venue_id: [rules.required('Venue')], contact_name: [rules.required('Contact name')], contact_phone: [rules.phoneUAE('WhatsApp number')] }, order);
    if (!(Number(order.screens_count) >= 1)) errs.screens_count = 'Set up at least 1 screen.';
    if (Number(order.bone_units) < 0) errs.bone_units = "Players can't be below 0.";
    if (order.preferred_date && order.preferred_date < new Date().toISOString().slice(0, 10)) errs.preferred_date = 'Pick today or a later day.';
    setErrors(errs);
    if (Object.keys(errs).length) { toast.error('Fix the highlighted fields first', { description: Object.values(errs)[0] }); return; }
    setBusy(true);
    try {
      const venue = venues.find((v) => v.id === order.venue_id);
      await installs.create({
        org_name: org?.name, venue_id: order.venue_id, venue_name: venue?.name || '', address: venue?.address || '', emirate: venue?.emirate || venue?.city || '',
        contact_name: order.contact_name, contact_phone: order.contact_phone, screens_count: Number(order.screens_count) || 1,
        bone_units: Number(order.bone_units) || 0, amount_aed: (Number(order.bone_units) || 0) * bone, preferred_date: order.preferred_date, notes: order.notes, status: 'requested',
      });
      notifySuccess('Request sent', "We'll confirm the visit time on WhatsApp, usually the same day.");
      setOrder(null); setErrors({});
    } catch (e) { notifyError(e, 'send the install request', submitOrder); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Billing" subtitle="Your screen plans, invoices and B.One orders"
        actions={<button type="button" className="bw-btn bw-btn-primary" onClick={() => setOrder({ venue_id: venues[0]?.id || '', contact_name: user?.full_name || '', contact_phone: org?.whatsapp || '', screens_count: 1, bone_units: 1, preferred_date: '', notes: '' })}><Box className="h-4 w-4" />Order B.One / installer</button>} />

      <div className="grid lg:grid-cols-[1fr_360px] gap-5">
        <div className="bw-card p-5">
          <p className="text-[15px] font-bold text-bw-navy">This month</p>
          <div className="mt-3 divide-y divide-bw-line">
            {rows.length === 0 && <p className="text-[13px] text-bw-muted py-2">No screens yet — nothing to pay.</p>}
            {rows.map((r) => (
              <div key={r.k} className="flex items-center justify-between py-2.5 text-[14px]">
                <span className="text-bw-navy">{r.l} <span className="text-bw-muted">· {r.qty} × AED {r.unit}</span></span>
                <b className="text-bw-navy">AED {r.amount}</b>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between border-t-2 border-bw-navy pt-3"><span className="text-[14px] font-bold">Monthly total <span className="text-bw-muted font-medium">(+VAT)</span></span><span className="text-[22px] font-extrabold text-bw-coral">AED {monthly}</span></div>
          {settings.founding_pricing && <p className="mt-2 text-[12px] text-emerald-600 font-semibold">Founding prices — locked for early venues.</p>}
        </div>
        <div className="bw-card p-5">
          <p className="text-[15px] font-bold text-bw-navy">Installs & orders</p>
          {installs.items.length === 0 ? <p className="mt-2 text-[13px] text-bw-muted">No orders yet. B.One is AED {bone} one-off, works offline, plugs into any TV.</p> : installs.items.slice(0, 5).map((j) => (
            <div key={j.id} className="flex items-center gap-3 py-2 border-t border-bw-line first:border-0 mt-1">
              <Wrench className="h-4 w-4 text-bw-coral" />
              <div className="flex-1"><p className="text-[13px] font-semibold text-bw-navy">{j.venue_name} · {j.bone_units || 0} B.One</p><p className="text-[11px] text-bw-muted">{j.scheduled_at ? new Date(j.scheduled_at).toLocaleString() : 'Waiting for a date'}</p></div>
              <span className="bw-chip bg-bw-lav text-bw-coral">{j.status.replace(/_/g, ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bw-card p-5">
        <div className="flex items-center justify-between"><p className="text-[15px] font-bold text-bw-navy">Invoices</p>{unpaid.length > 0 && <span className="bw-chip bg-amber-50 text-amber-700">{unpaid.length} unpaid</span>}</div>
        {invoices.items.length === 0 ? <p className="mt-2 text-[13px] text-bw-muted">Your invoices (English + Arabic) appear here every month.</p> : (
          <div className="mt-2 divide-y divide-bw-line">
            {invoices.items.map((i) => (
              <button key={i.id} type="button" onClick={() => setView(i)} className="!min-h-0 !justify-start w-full flex items-center gap-3 py-3 text-start">
                <Receipt className="h-4 w-4 text-bw-muted" />
                <span className="flex-1"><span className="block text-[13px] font-semibold text-bw-navy">{i.number}</span><span className="block text-[11px] text-bw-muted">{i.period} · due {i.due_at ? new Date(i.due_at).toLocaleDateString() : '—'}</span></span>
                <span className="text-[14px] font-bold text-bw-navy">AED {Number(i.total || 0).toFixed(2)}</span>
                <span className={`bw-chip ${i.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{i.status === 'paid' ? 'Paid' : 'Unpaid'}</span>
              </button>
            ))}
          </div>
        )}
        <p className="mt-3 text-[12px] text-bw-muted">Pay by bank transfer for now — card payment comes with the marketplace. Questions? WhatsApp us.</p>
      </div>

      {view && <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setView(null)}><div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-bw-cream rounded-3xl p-4" onClick={(e) => e.stopPropagation()}><InvoiceView invoice={view} settings={settings} onClose={() => setView(null)} /></div></div>}

      {order && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setOrder(null)}>
          <div className="bw-card p-5 w-full max-w-md space-y-3" onClick={(e) => e.stopPropagation()}>
            <p className="text-[17px] font-bold text-bw-navy">Order B.One / book an installer</p>
            <Field label="Venue"><select className="bw-input" value={order.venue_id} onChange={(e) => setOrder({ ...order, venue_id: e.target.value })}>{venues.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}</select></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Screens to set up"><input type="number" min="1" className="bw-input" value={order.screens_count} onChange={(e) => setOrder({ ...order, screens_count: e.target.value })} /><FieldError msg={errors.screens_count} /></Field>
              <Field label={`B.One players (AED ${bone} each)`}><input type="number" min="0" className="bw-input" value={order.bone_units} onChange={(e) => setOrder({ ...order, bone_units: e.target.value })} /><FieldError msg={errors.bone_units} /></Field>
              <Field label="Contact name"><input className="bw-input" value={order.contact_name} onChange={(e) => setOrder({ ...order, contact_name: e.target.value })} /><FieldError msg={errors.contact_name} /></Field>
              <Field label="WhatsApp"><input className="bw-input" inputMode="tel" placeholder="+971 50 123 4567" value={order.contact_phone} onChange={(e) => setOrder({ ...order, contact_phone: e.target.value })} /><FieldError msg={errors.contact_phone} /></Field>
            </div>
            <Field label="Preferred day"><input type="date" className="bw-input" value={order.preferred_date} onChange={(e) => setOrder({ ...order, preferred_date: e.target.value })} /><FieldError msg={errors.preferred_date} /></Field>
            <Field label="Notes"><textarea rows={2} className="bw-input" placeholder="TV models, mounting, Wi-Fi…" value={order.notes} onChange={(e) => setOrder({ ...order, notes: e.target.value })} /></Field>
            <p className="text-[13px] font-semibold text-bw-navy">Hardware total: AED {(Number(order.bone_units) || 0) * bone} <span className="text-bw-muted font-medium">(+VAT, invoiced after install)</span></p>
            <div className="flex justify-end gap-2"><button type="button" className="bw-btn bw-btn-ghost" onClick={() => setOrder(null)}>Cancel</button><button type="button" className="bw-btn bw-btn-primary" disabled={busy} onClick={submitOrder}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Send request</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
