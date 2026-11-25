import { useState } from 'react';
import { toast } from 'sonner';
import { Check, Pause, Play, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAdminList } from '@/components/admin/AdminLayout';
import { ErrorState, SlowHint } from '@/components/states/StateViews';
import { PageHeader, EmptyState } from '@/components/portal/ui';
import { TableSkeleton } from '@/components/portal/Skeletons';
import { notifyError, notifySuccess } from '@/lib/states';

const aed = (n) => `AED ${Number(n || 0).toLocaleString('en-AE', { maximumFractionDigits: 2 })}`;

export default function AdminMarketplace() {
  const campaigns = useAdminList('Campaign', { sort: '-created_date', limit: 500 });
  const bookings = useAdminList('AdBooking', { sort: '-created_date', limit: 2000 });
  const invoices = useAdminList('Invoice', { sort: '-created_date', limit: 1000, query: { kind: 'marketplace' } });
  const [tab, setTab] = useState('unpaid');
  const [busy, setBusy] = useState(null);

  const run = async (key, payload, ok) => {
    setBusy(key);
    try {
      await base44.functions.invoke('bookingAction', payload);
      campaigns.reload(); bookings.reload(); invoices.reload();
      notifySuccess(ok);
    } catch (e) { const m = e?.response?.data?.error; if (m) toast.error("Couldn't do that", { description: m }); else notifyError(e, 'save that'); } finally { setBusy(null); }
  };

  if (campaigns.loading || bookings.loading) return <div><PageHeader title="Marketplace" /><SlowHint loading forced={campaigns.preview === 'slow'} /><TableSkeleton /></div>;
  if (campaigns.error && !campaigns.items.length) return <ErrorState error={campaigns.error} action="load the marketplace" onRetry={() => { campaigns.reload(); bookings.reload(); }} />;

  const invById = new Map(invoices.items.map((i) => [i.id, i]));
  const live = bookings.items.filter((b) => b.status !== 'cancelled');
  const paidGross = live.filter((b) => b.status === 'active' || b.status === 'completed').reduce((a, b) => a + (b.total_amount || 0), 0);
  const fees = live.filter((b) => b.status === 'active' || b.status === 'completed').reduce((a, b) => a + (b.platform_fee || 0), 0);
  const unpaid = campaigns.items.filter((c) => c.payment_status !== 'paid' && c.status !== 'cancelled');
  const review = live.filter((b) => b.creative_status === 'pending_review');
  const refunds = campaigns.items.filter((c) => /Refund or rebook due/.test(c.admin_notes || ''));

  return (
    <div>
      <PageHeader title="Marketplace" subtitle="Advertiser bookings, payments and ad reviews" />
      <div className="grid sm:grid-cols-4 gap-3 mb-5">
        {[['Paid bookings', aed(paidGross)], ['Beyond Walls fees', aed(fees)], ['Waiting for payment', unpaid.length], ['Ads to review', review.length]].map(([l, v]) => (
          <div key={l} className="bw-card p-4"><p className="text-[12px] text-bw-muted">{l}</p><p className="text-[22px] font-bold text-bw-navy">{v}</p></div>
        ))}
      </div>
      <div className="inline-flex rounded-xl bg-[#EEEDF5] p-1 mb-4">
        {[['unpaid', `Unpaid (${unpaid.length})`], ['review', `Ad review (${review.length})`], ['bookings', 'All bookings'], ['refunds', `Refunds (${refunds.length})`]].map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)} className={`!min-h-0 rounded-lg px-4 py-1.5 text-[13px] font-semibold ${tab === k ? 'bg-white shadow-sm' : 'text-bw-muted'}`}>{l}</button>
        ))}
      </div>

      {tab === 'unpaid' && (unpaid.length === 0 ? <EmptyState icon={Check} title="No unpaid campaigns" body="Card payments through Paymob mark themselves paid. Bank transfers you confirm here." /> : (
        <div className="bw-card overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="text-start text-bw-muted text-[12px]"><th className="p-3 text-start">Campaign</th><th className="p-3 text-start">Advertiser</th><th className="p-3 text-start">Invoice</th><th className="p-3 text-end">Total</th><th className="p-3" /></tr></thead>
            <tbody>
              {unpaid.map((c) => {
                const inv = invById.get(c.invoice_id);
                return (
                  <tr key={c.id} className="border-t border-bw-line">
                    <td className="p-3"><p className="font-semibold text-bw-navy">{c.name}</p><p className="text-[11px] text-bw-muted">{(c.selected_screens || []).length} screens · {c.start_date} · booked {new Date(c.created_date).toLocaleDateString()}</p></td>
                    <td className="p-3">{c.org_name || c.advertiser_email}</td>
                    <td className="p-3">{inv?.number || '—'}{inv?.payment_ref?.startsWith('paymob:') && <span className="block text-[11px] text-bw-muted">Card checkout opened</span>}</td>
                    <td className="p-3 text-end font-semibold">{aed(c.total_budget)}</td>
                    <td className="p-3 text-end whitespace-nowrap">
                      {inv && inv.status === 'issued' && <button type="button" className="bw-btn bw-btn-primary !py-1.5" disabled={busy === c.id} onClick={() => {
                        const ref = window.prompt(`Bank transfer received for ${inv.number} (${aed(inv.total)})? Enter the bank reference:`);
                        if (ref !== null) run(c.id, { action: 'mark_paid', invoice_id: inv.id, payment_ref: ref || 'bank transfer' }, `${inv.number} marked paid — ads go live`);
                      }}>Mark paid</button>}
                      <button type="button" className="bw-btn bw-btn-ghost !py-1.5 ms-1" disabled={busy === c.id} onClick={() => { if (window.confirm(`Cancel ${c.name}?`)) run(c.id, { action: 'cancel_campaign', campaign_id: c.id }, 'Campaign cancelled'); }}><X className="h-4 w-4" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}

      {tab === 'review' && (review.length === 0 ? <EmptyState icon={Check} title="No ads waiting" body="Venues review ads themselves; you can step in here if one waits too long." /> : (
        <div className="grid md:grid-cols-3 gap-4">
          {review.map((b) => (
            <div key={b.id} className="bw-card overflow-hidden">
              <div className="aspect-video bg-bw-navy">{b.creative_type === 'video' ? <video src={b.creative_url} controls muted className="h-full w-full object-contain" /> : <img src={b.creative_url} alt="" className="h-full w-full object-contain" />}</div>
              <div className="p-3">
                <p className="text-[13px] font-bold text-bw-navy truncate">{b.advertiser_org_name} → {b.venue_name}</p>
                <p className="text-[11px] text-bw-muted">Waiting since {new Date(b.created_date).toLocaleDateString()}</p>
                <div className="mt-2 flex gap-2">
                  <button type="button" className="bw-btn bw-btn-ghost flex-1 !py-1.5" disabled={busy === b.id} onClick={() => { const r = window.prompt('Why is this ad rejected? The advertiser sees this.'); if (r) run(b.id, { action: 'reject_creative', booking_id: b.id, reason: r }, 'Ad rejected'); }}>Reject</button>
                  <button type="button" className="bw-btn bw-btn-primary flex-1 !py-1.5" disabled={busy === b.id} onClick={() => run(b.id, { action: 'approve_creative', booking_id: b.id }, 'Ad approved')}>Approve</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {tab === 'bookings' && (bookings.items.length === 0 ? <EmptyState icon={Check} title="No bookings yet" body="Bookings appear here when advertisers book screens." /> : (
        <div className="bw-card overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead><tr className="text-bw-muted text-[12px]"><th className="p-3 text-start">Advertiser → venue</th><th className="p-3 text-start">Dates</th><th className="p-3 text-start">Status</th><th className="p-3 text-end">Total / venue</th><th className="p-3" /></tr></thead>
            <tbody>
              {bookings.items.map((b) => (
                <tr key={b.id} className="border-t border-bw-line">
                  <td className="p-3"><p className="font-semibold text-bw-navy">{b.advertiser_org_name} → {b.venue_name}</p><p className="text-[11px] text-bw-muted">{b.campaign_name} · {b.screen_name}</p></td>
                  <td className="p-3">{b.start_date} → {b.end_date}</td>
                  <td className="p-3"><span className="bw-chip bg-bw-cream">{b.status}</span> <span className="bw-chip bg-bw-cream">{b.creative_status}</span></td>
                  <td className="p-3 text-end">{aed(b.total_amount)}<span className="block text-[11px] text-bw-muted">venue {aed(b.venue_earnings)}</span></td>
                  <td className="p-3 text-end">
                    {b.status === 'active' && <button type="button" title="Pause" className="bw-btn bw-btn-ghost !py-1.5" onClick={() => run(b.id, { action: 'pause', booking_id: b.id }, 'Booking paused')}><Pause className="h-4 w-4" /></button>}
                    {b.status === 'paused' && b.creative_status === 'approved' && <button type="button" title="Resume" className="bw-btn bw-btn-ghost !py-1.5" onClick={() => run(b.id, { action: 'resume', booking_id: b.id }, 'Booking resumed')}><Play className="h-4 w-4" /></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {tab === 'refunds' && (refunds.length === 0 ? <EmptyState icon={Check} title="No refunds due" body="If a venue rejects an ad after payment, the amount to refund or rebook shows here." /> : (
        <div className="space-y-2">
          {refunds.map((c) => (
            <div key={c.id} className="bw-card p-4"><p className="font-semibold text-bw-navy">{c.name} · {c.org_name}</p><p className="text-[12px] text-bw-muted whitespace-pre-line">{c.admin_notes}</p></div>
          ))}
        </div>
      ))}
    </div>
  );
}
