import { useState } from 'react';
import { toast } from 'sonner';
import { FilePlus2, Loader2, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAdminList } from '@/components/admin/AdminLayout';
import { PageHeader } from '@/components/portal/ui';
import { TableSkeleton } from '@/components/portal/Skeletons';
import InvoiceView from '@/components/billing/InvoiceView';

const thisMonth = () => new Date().toISOString().slice(0, 7);

export default function AdminBilling() {
  const invoices = useAdminList('Invoice', { sort: '-created_date', limit: 1000 });
  const settings = useAdminList('PlatformSettings', { limit: 1 });
  const [period, setPeriod] = useState(thisMonth());
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(null);
  const [view, setView] = useState(null);
  const [filter, setFilter] = useState('all');

  const run = async (dry) => {
    setBusy(true);
    try {
      const res = await base44.functions.invoke('generatePlanInvoices', { period, dry_run: dry });
      if (dry) setPreview(res.data);
      else { toast.success(`${res.data.created.length} invoices created for ${period}`); setPreview(null); invoices.reload(); }
    } catch (e) { toast.error(e?.response?.data?.error || 'Could not generate'); } finally { setBusy(false); }
  };

  const markPaid = async (inv) => {
    const ref = window.prompt('Payment reference (bank transfer / card)', '');
    if (ref === null) return;
    await invoices.update(inv.id, { status: 'paid', paid_at: new Date().toISOString(), payment_ref: ref });
    toast.success(`${inv.number} marked paid`);
  };

  if (invoices.loading) return <TableSkeleton />;
  const shown = invoices.items.filter((i) => filter === 'all' || i.status === filter);
  const sum = (st) => invoices.items.filter((i) => i.status === st).reduce((s, i) => s + (i.total || 0), 0);
  const s = settings.items[0] || {};

  return (
    <div className="space-y-5">
      <PageHeader title="Billing & invoices" subtitle={`Plans: AED ${s.price_signage_ads ?? 15} signage + ads · AED ${s.price_signage_only ?? 29} signage only · ads only free · VAT ${s.vat_pct ?? 5}%`} />
      <div className="grid md:grid-cols-3 gap-3">
        <div className="bw-card p-4"><p className="text-[12px] text-bw-muted">Unpaid</p><p className="text-[22px] font-bold text-bw-navy">AED {sum('issued').toLocaleString()}</p></div>
        <div className="bw-card p-4"><p className="text-[12px] text-bw-muted">Collected</p><p className="text-[22px] font-bold text-emerald-600">AED {sum('paid').toLocaleString()}</p></div>
        <div className="bw-card p-4">
          <p className="text-[12px] text-bw-muted mb-2">Monthly plan invoices</p>
          <div className="flex gap-2">
            <input type="month" className="bw-input !py-1.5" value={period} onChange={(e) => setPeriod(e.target.value)} />
            <button type="button" className="bw-btn bw-btn-ghost" disabled={busy} onClick={() => run(true)}>Preview</button>
          </div>
        </div>
      </div>

      {preview && (
        <div className="bw-card p-4">
          <p className="text-[14px] font-bold text-bw-navy">Preview · {preview.period}</p>
          {preview.created.length === 0 ? <p className="text-[13px] text-bw-muted mt-1">Nothing new to invoice.</p> : (
            <ul className="mt-2 text-[13px] space-y-1">{preview.created.map((c) => <li key={c.number}>{c.org} — {c.number} — <b>AED {c.total}</b></li>)}</ul>
          )}
          {preview.skipped.length > 0 && <p className="mt-2 text-[12px] text-bw-muted">Skipped: {preview.skipped.map((x) => `${x.org} (${x.reason})`).join(', ')}</p>}
          {preview.created.length > 0 && <button type="button" className="mt-3 bw-btn bw-btn-primary" disabled={busy} onClick={() => run(false)}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FilePlus2 className="h-4 w-4" />}Create {preview.created.length} invoices</button>}
        </div>
      )}

      <div className="flex gap-2">
        {[['all', 'All'], ['issued', 'Unpaid'], ['paid', 'Paid'], ['void', 'Void']].map(([k, l]) => (
          <button key={k} type="button" onClick={() => setFilter(k)} className={`!min-h-0 rounded-full px-4 py-1.5 text-[13px] font-semibold ${filter === k ? 'bg-bw-navy text-white' : 'bg-white border border-bw-line'}`}>{l}</button>
        ))}
      </div>
      <div className="bw-card overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead><tr className="text-[11px] uppercase text-bw-muted"><th className="p-3 text-start">Invoice</th><th className="p-3 text-start">Business</th><th className="p-3 text-start">Period</th><th className="p-3 text-end">Total</th><th className="p-3 text-start">Status</th><th className="p-3" /></tr></thead>
          <tbody className="divide-y divide-bw-line">
            {shown.map((i) => (
              <tr key={i.id} className="text-[13px]">
                <td className="p-3"><button type="button" className="!min-h-0 font-semibold text-bw-coral" onClick={() => setView(i)}>{i.number}</button></td>
                <td className="p-3 text-bw-navy">{i.org_name}</td>
                <td className="p-3">{i.period}</td>
                <td className="p-3 text-end font-semibold">AED {Number(i.total || 0).toFixed(2)}</td>
                <td className="p-3"><span className={`bw-chip ${i.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : i.status === 'void' ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-700'}`}>{i.status === 'issued' ? 'unpaid' : i.status}</span></td>
                <td className="p-3 text-end">{i.status === 'issued' && <button type="button" className="bw-btn bw-btn-ghost !py-1" onClick={() => markPaid(i)}><Check className="h-3.5 w-3.5" />Mark paid</button>}</td>
              </tr>
            ))}
            {!shown.length && <tr><td colSpan={6} className="p-6 text-center text-[13px] text-bw-muted">No invoices.</td></tr>}
          </tbody>
        </table>
      </div>

      {view && <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setView(null)}><div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-bw-cream rounded-3xl p-4" onClick={(e) => e.stopPropagation()}><InvoiceView invoice={view} settings={s} onClose={() => setView(null)} /></div></div>}
    </div>
  );
}
