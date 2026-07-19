import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Check, X, Image as ImageIcon } from 'lucide-react';
import moment from 'moment';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ListSkeleton } from './Skeletons';
import EmptyState from './EmptyState';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { formatAED } from './format';

const PAGE_SIZE = 20;

export default function CreativeReviewQueue({ org, onPendingCount }) {
  const [campaignsById, setCampaignsById] = useState({});
  const [screensById, setScreensById] = useState({});
  const [rejecting, setRejecting] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(null);
  const [error, setError] = useState('');

  const { items, loading, loadingMore, hasMore, loadMore, refresh } = usePaginatedList(
    (skip) => base44.entities.AdBooking.filter(
      { org_id: org.id, creative_status: 'pending_review' },
      '-created_date', PAGE_SIZE, skip
    ),
    PAGE_SIZE
  );

  useEffect(() => {
    onPendingCount?.(items.length);
  }, [items.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Batch-fetch parent campaigns + screens for the current page
  useEffect(() => {
    if (items.length === 0) {
      setCampaignsById({});
      setScreensById({});
      return;
    }
    let cancelled = false;
    (async () => {
      const campaignIds = [...new Set(items.map((b) => b.campaign_id).filter(Boolean))];
      const screenIds = [...new Set(items.map((b) => b.screen_id).filter(Boolean))];
      const [campaigns, screens] = await Promise.all([
        campaignIds.length > 0
          ? base44.entities.Campaign.filter({ id: { $in: campaignIds } })
          : Promise.resolve([]),
        screenIds.length > 0
          ? base44.entities.Screen.filter({ id: { $in: screenIds } })
          : Promise.resolve([]),
      ]);
      if (cancelled) return;
      const cMap = {};
      campaigns.forEach((c) => { cMap[c.id] = c; });
      setCampaignsById(cMap);
      const sMap = {};
      screens.forEach((s) => { sMap[s.id] = s; });
      setScreensById(sMap);
    })();
    return () => { cancelled = true; };
  }, [items]);

  const invokeReview = async (bookingId, decision, reason) => {
    setSubmitting(bookingId);
    setError('');
    try {
      const res = await base44.functions.invoke('reviewCreative', {
        booking_id: bookingId,
        decision,
        rejection_reason: reason || undefined,
      });
      if (res?.status >= 400) {
        setError(res?.data?.error || 'Request failed');
        return;
      }
      await refresh();
    } catch (e) {
      setError(e?.response?.data?.error || e?.data?.error || e?.message || 'Request failed');
    } finally {
      setSubmitting(null);
    }
  };

  const renderPreview = (campaign) => {
    const url = campaign?.creative_urls?.[0];
    if (!url) {
      return (
        <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
          <ImageIcon className="w-6 h-6 text-slate-300" />
        </div>
      );
    }
    if (campaign?.creative_type === 'video') {
      return <video src={url} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" muted />;
    }
    return <img src={url} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />;
  };

  return (
    <div>
      <h2 className="font-heading font-semibold text-base sm:text-lg text-slate-900 mb-3">Creative review</h2>
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      {loading ? (
        <ListSkeleton />
      ) : items.length === 0 ? (
        <EmptyState
          title="No creatives to review"
          message="New bookings will appear here for your approval before they go live."
        />
      ) : (
        <div className="space-y-3">
          {items.map((b) => {
            const campaign = campaignsById[b.campaign_id];
            const screen = screensById[b.screen_id];
            return (
              <div key={b.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
                {renderPreview(campaign)}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 truncate">{campaign?.name || 'Ad Slot'}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {screen?.name || 'Unknown screen'} · {moment(b.start_date).format('DD MMM')} – {moment(b.end_date).format('DD MMM YYYY')}
                  </p>
                  <p className="text-sm font-medium text-slate-600">{formatAED(b.total_amount)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline" onClick={() => invokeReview(b.id, 'approved')} disabled={submitting === b.id}>
                    <Check className="w-4 h-4 mr-1" />Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => { setRejecting(b.id); setRejectReason(''); setError(''); }}
                    disabled={submitting === b.id}
                  >
                    <X className="w-4 h-4 mr-1" />Reject
                  </Button>
                </div>
              </div>
            );
          })}
          {hasMore && (
            <Button variant="outline" onClick={loadMore} disabled={loadingMore} className="w-full">
              {loadingMore ? 'Loading…' : 'Load more'}
            </Button>
          )}
        </div>
      )}

      <Dialog open={!!rejecting} onOpenChange={(open) => { if (!open) { setRejecting(null); setRejectReason(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject creative</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">Provide a reason — the advertiser will need it to replace the creative.</p>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Logo is blurry, please upload a higher resolution version."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejecting(null); setRejectReason(''); }}>
              Cancel
            </Button>
            <Button
              onClick={() => rejecting && invokeReview(rejecting, 'rejected', rejectReason.trim())}
              disabled={!rejectReason.trim() || submitting === rejecting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {submitting === rejecting ? 'Submitting…' : 'Reject creative'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}