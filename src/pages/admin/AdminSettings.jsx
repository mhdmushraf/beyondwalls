import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { useAdminList } from '@/components/admin/AdminLayout';
import { ErrorState, SlowHint } from '@/components/states/StateViews';
import { PageHeader, Field, Toggle } from '@/components/portal/ui';
import { TableSkeleton } from '@/components/portal/Skeletons';

const NUM = [
  ['Revenue shares', [['venue_share_pct', 'Venue share on marketplace ads (%)'], ['direct_deal_fee_pct', 'Direct deal fee (%)'], ['connect_agency_share_pct', 'Connect — agency keeps (%)']]],
  ['Screen plans (AED / screen / month)', [['price_signage_ads', 'Signage + Ads'], ['price_signage_only', 'Signage only'], ['price_ads_only', 'Ads only']]],
  ['Hardware & tax', [['bone_price', 'B.One player (AED)'], ['vat_pct', 'VAT (%)']]],
];

export default function AdminSettings() {
  const list = useAdminList('PlatformSettings', { limit: 5 });
  const [form, setForm] = useState(null);
  useEffect(() => { if (!form && list.items[0]) setForm({ ...list.items[0] }); }, [list.items, form]);
  if (list.loading) return <div><SlowHint loading forced={list.preview === 'slow'} /><TableSkeleton /></div>;
  if (list.error && !list.items.length) return <ErrorState error={list.error} action="load prices & shares" onRetry={list.reload} />;
  if (!form) return <div className="bw-card p-8 text-center"><p className="text-[16px] font-bold text-bw-navy">No price settings yet</p><p className="mt-1 text-[13px] text-bw-muted">Create the default settings (70% venue share, AED 15 / 29 / 0 plans, B.One AED 449), then edit them.</p><button type="button" className="bw-btn bw-btn-primary mt-4" onClick={async () => { const rec = await list.create({ key: 'main', venue_share_pct: 70, partner_splits: [60, 50], direct_fee_pct: 10, agency_share_pct: 85, price_signage_ads: 15, price_signage_only: 29, price_ads_only: 0, bone_price: 449, vat_pct: 0 }); setForm({ ...rec }); }}>Create default settings</button></div>;

  const save = async () => {
    const data = {};
    NUM.forEach(([, f]) => f.forEach(([k]) => { data[k] = Number(form[k]); }));
    Object.assign(data, {
      partner_share_options: String(form.partner_share_options || '').split(',').map((x) => Number(x.trim())).filter(Boolean),
      founding_pricing: !!form.founding_pricing, company_name: form.company_name, company_trn: form.company_trn || '', company_address: form.company_address, invoice_prefix: form.invoice_prefix || 'BW',
    });
    await list.update(form.id, data);
    toast.success('Prices & shares saved — new bookings and invoices use them');
  };
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="max-w-4xl">
      <PageHeader title="Prices & shares" subtitle="Changes apply to new bookings and invoices — existing ones keep the rate they were made with"
        actions={<button type="button" className="bw-btn bw-btn-primary" onClick={save}><Save className="h-4 w-4" />Save</button>} />
      <div className="space-y-5">
        {NUM.map(([title, fields]) => (
          <div key={title} className="bw-card p-5">
            <p className="text-[15px] font-bold text-bw-navy mb-3">{title}</p>
            <div className="grid md:grid-cols-3 gap-3">
              {fields.map(([k, l]) => <Field key={k} label={l}><input type="number" className="bw-input" value={form[k] ?? ''} onChange={(e) => set(k, e.target.value)} /></Field>)}
            </div>
            {title === 'Revenue shares' && (
              <div className="mt-3 grid md:grid-cols-2 gap-3 items-end">
                <Field label="Partner venue shares (free hardware), comma separated" hint="e.g. 60, 50 → venue keeps 60% or 50%"><input className="bw-input" value={Array.isArray(form.partner_share_options) ? form.partner_share_options.join(', ') : form.partner_share_options || ''} onChange={(e) => set('partner_share_options', e.target.value)} /></Field>
                <p className="text-[12px] text-bw-muted pb-2">Beyond Walls keeps {100 - Number(form.venue_share_pct || 0)}% of marketplace ads and {100 - Number(form.connect_agency_share_pct || 0)}% of Connect bookings.</p>
              </div>
            )}
            {title.startsWith('Screen plans') && <div className="mt-3 flex items-center gap-3"><Toggle checked={!!form.founding_pricing} onChange={(v) => set('founding_pricing', v)} /><span className="text-[13px] font-semibold text-bw-navy">Show as founding prices</span></div>}
          </div>
        ))}
        <div className="bw-card p-5">
          <p className="text-[15px] font-bold text-bw-navy mb-3">Invoice details</p>
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Company name"><input className="bw-input" value={form.company_name || ''} onChange={(e) => set('company_name', e.target.value)} /></Field>
            <Field label="TRN (VAT number)" hint="Leave empty until VAT registered"><input className="bw-input" value={form.company_trn || ''} onChange={(e) => set('company_trn', e.target.value)} /></Field>
            <Field label="Address"><input className="bw-input" value={form.company_address || ''} onChange={(e) => set('company_address', e.target.value)} /></Field>
            <Field label="Invoice prefix"><input className="bw-input" value={form.invoice_prefix || ''} onChange={(e) => set('invoice_prefix', e.target.value)} /></Field>
          </div>
        </div>
      </div>
    </div>
  );
}
