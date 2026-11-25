import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Check, X, Megaphone, Wallet, Settings2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useOrgEntity } from '@/lib/useOrgEntity';
import { usePortal } from '@/lib/PortalContext';
import { PageHeader, EmptyState } from '@/components/portal/ui';
import { ListSkeleton } from '@/components/portal/Skeletons';
import { notifyError, notifySuccess } from '@/lib/states';
import { ErrorState, SlowHint, FieldError } from '@/components/states/StateViews';
import PayoutPanel from '@/components/portal/PayoutPanel';

const aed = (n) => `AED ${Number(n || 0).toLocaleString('en-AE', { maximumFractionDigits: 2 })}`;

export default function PortalAdRequests() {
  const { screens } = usePortal();
  const bookings = useOrgEntity('AdBooking', { sort: '-created_date', limit: 300 });
  const [tab, setTab] = useState('review');
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState('');
  const [reasonErr, setReasonErr] = useState('');
  const [busy, setBusy] = useState(null);

  const act = async (b, action) => {
    if (action === 'reject_creative' && reason.trim().length < 5) { setReasonErr('Tell the advertiser why in a few words, e.g. "Alcohol isn\'t allowed in our venue".'); return; }
    setBusy(b.id);
    try {
      await base44.functions.invoke('bookingAction', { action, booking_id: b.id, reason: reason.trim() });
      bookings.reload(); setRejecting(null); setReason(''); setReasonErr('');
      if (action === 'approve_creative') notifySuccess('Ad approved', b.status === 'active' ? 'It starts playing on your screen within a minute.' : 'It plays once the advertiser pays, from their start date.');
      else notifySuccess('Ad rejected', 'The advertiser sees your reason and is not charged for this screen.');
    } catch (e) { const m = e?.response?.data?.error; if (m) toast.error("Couldn't save that", { description: m }); else notifyError(e, 'save your decision'); } finally { setBusy(null); }
  };

  if (bookings.loading) return <div><PageHeader title="Ad requests" /><SlowHint loading forced={bookings.preview === 'slow'} /><ListSkeleton rows={3} /></div>;
  if (bookings.error && !bookings.items.length) return <div><PageHeader title="Ad requests" /><ErrorState error={bookings.error} action="load ad requests" onRetry={bookings.reload} /></div>;

  const all = bookings.items.filter((b) => b.status !== 'cancelled');
  const review = all.filter((b) => b.creative_status === 'pending_review');
  const live = all.filter((b) => b.creative_status === 'approved');
  const listed = screens.filter((s) => s.marketplace_enabled).length;
  const shown = tab === 'review' ? review : tab === 'approved' ? live : all;

  return (
    <div>
      <PageHeader title="Ad requests" subtitle="Advertisers who booked your screens · you keep your share of every booking" />
      <PayoutPanel refreshKey={bookings.items.length} />

      {listed === 0 && (
        <div className="mb-5 rounded-2xl bg-bw-lav p-4 flex flex-wrap items-center gap-3">
          <Settings2 className="h-5 w-5 text-bw-coral" />
          <p className="flex-1 min-w-[200px] text-[13px] text-bw-navy">None of your screens are open to advertisers yet. Open a screen, switch on <b>Marketplace</b> and set your weekly price.</p>
          <Link to="/app/screens" className="bw-btn bw-btn-primary !py-1.5">Go to screens</Link>
        </div>
      )}

      <div className="inline-flex rounded-xl bg-[#EEEDF5] p-1 mb-4">
        {[['review', `To review (${review.length})`], ['approved', `Approved (${live.length})`], ['all', 'All']].map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)} className={`!min-h-0 rounded-lg px-4 py-1.5 text-[13px] font-semibold ${tab === k ? 'bg-white shadow-sm' : 'text-bw-muted'}`}>{l}</button>
        ))}
      </div>

      {shown.length === 0 ? (
        <EmptyState icon={tab === 'review' ? Check : Megaphone}
          title={tab === 'review' ? 'Nothing to review' : all.length ? 'Nothing here yet' : 'No ad bookings yet'}
          body={tab === 'review' ? "New ads from advertisers show up here for you to approve. We'll notify you." : 'When an advertiser books one of your screens it appears here, with your earnings.'}
          action={tab !== 'all' && all.length ? <button type="button" className="bw-btn bw-btn-ghost" onClick={() => setTab('all')}>Show all</button> : null} />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {shown.map((b) => (
            <div key={b.id} className="bw-card overflow-hidden">
              <div className="aspect-video bg-bw-navy">
                {b.creative_type === 'video' ? <video src={b.creative_url} controls muted className="h-full w-full object-contain" /> : <img src={b.creative_url} alt="" className="h-full w-full object-contain" />}
              </div>
              <div className="p-4">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-bw-navy truncate">{b.advertiser_org_name || 'Advertiser'} · {b.campaign_name}</p>
                    <p className="text-[12px] text-bw-muted">{b.screen_name} · {b.start_date} → {b.end_date} ({b.weeks} wk)</p>
                  </div>
                  <span className="bw-chip bg-emerald-50 text-emerald-700 font-bold"><Wallet className="h-3 w-3" />{aed(b.venue_earnings)}</span>
                </div>
                <p className="mt-1 text-[11px] text-bw-muted">{b.status === 'pending_payment' ? 'Advertiser has not paid yet' : b.status === 'active' ? 'Paid' : b.status}{b.plays ? ` · ${b.plays} plays` : ''}</p>
                {b.creative_status === 'pending_review' && (rejecting === b.id ? (
                  <div className="mt-3 space-y-2">
                    <textarea rows={2} className="bw-input" placeholder="Why? The advertiser sees this." value={reason} onChange={(e) => setReason(e.target.value)} />
                    <FieldError msg={reasonErr} />
                    <div className="flex gap-2 justify-end">
                      <button type="button" className="bw-btn bw-btn-ghost !py-1.5" onClick={() => { setRejecting(null); setReasonErr(''); }}>Back</button>
                      <button type="button" className="bw-btn bw-btn-danger !py-1.5" disabled={busy === b.id} onClick={() => act(b, 'reject_creative')}>Reject ad</button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex gap-2">
                    <button type="button" className="bw-btn bw-btn-ghost flex-1" onClick={() => { setRejecting(b.id); setReason(''); }}><X className="h-4 w-4" />Reject</button>
                    <button type="button" className="bw-btn bw-btn-primary flex-1" disabled={busy === b.id} onClick={() => act(b, 'approve_creative')}><Check className="h-4 w-4" />{busy === b.id ? 'Saving…' : 'Approve'}</button>
                  </div>
                ))}
                {b.creative_status === 'rejected' && <p className="mt-2 text-[12px] text-rose-600">You rejected this: {b.creative_rejection_reason}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
