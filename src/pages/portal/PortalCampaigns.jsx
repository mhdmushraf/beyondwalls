import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Megaphone, CreditCard, FileText, Plus, XCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useOrgEntity } from '@/lib/useOrgEntity';
import { PageHeader, EmptyState } from '@/components/portal/ui';
import { ListSkeleton } from '@/components/portal/Skeletons';
import { notifyError, notifySuccess } from '@/lib/states';
import { ErrorState, SlowHint } from '@/components/states/StateViews';
import { payInvoiceByCard } from '@/lib/payments';
import InvoiceView from '@/components/billing/InvoiceView';
import { usePlatformSettings } from './PortalBilling';

const aed = (n) => `AED ${Number(n || 0).toLocaleString('en-AE', { maximumFractionDigits: 2 })}`;
const CST = {
  pending_approval: ['Waiting for payment', 'bg-amber-50 text-amber-700'],
  active: ['Running', 'bg-emerald-50 text-emerald-700'],
  completed: ['Finished', 'bg-bw-cream text-bw-muted'],
  cancelled: ['Cancelled', 'bg-bw-cream text-bw-muted'],
  paused: ['Paused', 'bg-amber-50 text-amber-700'],
};
const BST = {
  pending_review: ['Venue reviewing', 'bg-amber-50 text-amber-700'],
  approved: ['Approved', 'bg-emerald-50 text-emerald-700'],
  rejected: ['Rejected', 'bg-rose-50 text-rose-600'],
};

export default function PortalCampaigns() {
  const settings = usePlatformSettings();
  const campaigns = useOrgEntity('Campaign', { sort: '-created_date', limit: 100 });
  const invoices = useOrgEntity('Invoice', { sort: '-created_date', query: { kind: 'marketplace' } });
  const [bookings, setBookings] = useState({});
  const [open, setOpen] = useState(null);
  const [view, setView] = useState(null);
  const [paying, setPaying] = useState(null);

  const expand = async (c) => {
    setOpen(open === c.id ? null : c.id);
    if (bookings[c.id]) return;
    try {
      const page = await base44.entities.AdBooking.filter({ campaign_id: c.id }, { limit: 100 });
      setBookings((b) => ({ ...b, [c.id]: page.items || page || [] }));
    } catch (e) { notifyError(e, 'load the screens for this campaign', () => expand(c)); }
  };

  const cancel = async (c) => {
    if (!window.confirm(`Cancel "${c.name}"? The invoice is cancelled and the screens are released.`)) return;
    try {
      await base44.functions.invoke('bookingAction', { action: 'cancel_campaign', campaign_id: c.id });
      campaigns.reload(); invoices.reload();
      notifySuccess('Campaign cancelled', 'Nothing was charged.');
    } catch (e) { const m = e?.response?.data?.error; if (m) toast.error("Couldn't cancel", { description: m }); else notifyError(e, 'cancel the campaign'); }
  };

  const pay = async (invId) => { setPaying(invId); await payInvoiceByCard(invId); setPaying(null); };

  if (campaigns.loading) return <div><PageHeader title="My campaigns" /><SlowHint loading forced={campaigns.preview === 'slow'} /><ListSkeleton rows={3} /></div>;
  if (campaigns.error && !campaigns.items.length) return <div><PageHeader title="My campaigns" /><ErrorState error={campaigns.error} action="load your campaigns" onRetry={campaigns.reload} /></div>;

  const invById = new Map(invoices.items.map((i) => [i.id, i]));

  return (
    <div>
      <PageHeader title="My campaigns" subtitle="Your ads on venue screens — payment, venue approval and plays"
        actions={<Link to="/app/marketplace" className="bw-btn bw-btn-primary"><Plus className="h-4 w-4" />Book screens</Link>} />
      {campaigns.items.length === 0 ? (
        <EmptyState icon={Megaphone} title="No campaigns yet" body="Pick screens in cafés, gyms and clinics, upload your ad, and pay by card or bank transfer. You'll track everything here."
          action={<Link to="/app/marketplace" className="bw-btn bw-btn-primary"><Plus className="h-4 w-4" />Book screens</Link>} />
      ) : (
        <div className="space-y-3">
          {campaigns.items.map((c) => {
            const inv = invById.get(c.invoice_id);
            const st = CST[c.status] || [c.status, 'bg-bw-cream text-bw-muted'];
            const unpaid = c.payment_status !== 'paid' && c.status !== 'cancelled' && inv?.status === 'issued';
            const list = bookings[c.id] || [];
            return (
              <div key={c.id} className="bw-card p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="h-14 w-24 rounded-lg overflow-hidden bg-bw-navy shrink-0">
                    {c.creative_type === 'video' ? <video src={c.creative_urls?.[0]} muted className="h-full w-full object-cover" /> : <img src={c.creative_urls?.[0]} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-[180px]">
                    <p className="text-[15px] font-bold text-bw-navy">{c.name}</p>
                    <p className="text-[12px] text-bw-muted">{(c.selected_screens || []).length} screens · {c.weeks} wk · {c.start_date} → {c.end_date} · {aed(c.total_budget)}</p>
                  </div>
                  <span className={`bw-chip ${st[1]}`}>{st[0]}</span>
                  {unpaid && <button type="button" className="bw-btn bw-btn-primary !py-1.5" disabled={paying === inv.id} onClick={() => pay(inv.id)}><CreditCard className="h-4 w-4" />{paying === inv.id ? 'Opening…' : `Pay ${aed(inv.total)}`}</button>}
                  {inv && <button type="button" className="bw-btn bw-btn-ghost !py-1.5" onClick={() => setView(inv)}><FileText className="h-4 w-4" />Invoice</button>}
                  <button type="button" className="bw-btn bw-btn-ghost !py-1.5" onClick={() => expand(c)}>{open === c.id ? 'Hide screens' : 'Screens'}</button>
                </div>
                {unpaid && <p className="mt-2 text-[12px] text-amber-700">Pay by card now, or bank transfer with reference <b>{inv.number}</b>. Unpaid bookings release their screens after 3 days.</p>}
                {open === c.id && (
                  <div className="mt-3 border-t border-bw-line pt-3 space-y-2">
                    {!bookings[c.id] ? <ListSkeleton rows={2} /> : list.length === 0 ? <p className="text-[12px] text-bw-muted">No screens on this campaign.</p> : list.map((b) => {
                      const cs = BST[b.creative_status] || ['—', 'bg-bw-cream'];
                      return (
                        <div key={b.id} className="flex flex-wrap items-center gap-2 text-[13px]">
                          <span className="flex-1 min-w-[160px] font-semibold text-bw-navy">{b.venue_name} <span className="font-normal text-bw-muted">· {b.screen_name}</span></span>
                          <span className={`bw-chip ${cs[1]}`}>{cs[0]}</span>
                          {b.status === 'cancelled' && <span className="bw-chip bg-bw-cream text-bw-muted">Removed</span>}
                          <span className="text-bw-muted">{b.plays || 0} plays</span>
                          {b.creative_status === 'rejected' && <p className="w-full text-[12px] text-rose-600">Reason: {b.creative_rejection_reason}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
                {c.status === 'pending_approval' && c.payment_status !== 'paid' && (
                  <div className="mt-2 flex justify-end"><button type="button" className="!min-h-0 text-[12px] font-semibold text-bw-muted hover:text-rose-600 flex items-center gap-1" onClick={() => cancel(c)}><XCircle className="h-3.5 w-3.5" />Cancel campaign</button></div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {view && <InvoiceView invoice={view} settings={settings} onClose={() => setView(null)} />}
    </div>
  );
}
