import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ListSkeleton } from '@/components/workspace/Skeletons';
import EmptyState from '@/components/workspace/EmptyState';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { formatAED } from '@/components/workspace/format';
import moment from 'moment';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

export default function BookingsApprovalTab({ onActionComplete }) {
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [providerReference, setProviderReference] = useState('');
  const [acting, setActing] = useState(false);
  const [confirmResult, setConfirmResult] = useState(null);
  const [screensById, setScreensById] = useState({});

  const { items, loading, loadingMore, hasMore, loadMore, refresh } = usePaginatedList(
    (skip) => base44.entities.AdBooking.filter({ status: 'pending_payment' }, '-created_date', PAGE_SIZE, skip),
    PAGE_SIZE
  );

  useEffect(() => {
    if (items.length === 0) { setScreensById({}); return; }
    let cancelled = false;
    (async () => {
      const screenIds = [...new Set(items.map((b) => b.screen_id).filter(Boolean))];
      if (screenIds.length === 0) return;
      const screens = await base44.entities.Screen.filter({ id: { $in: screenIds } });
      if (cancelled) return;
      const map = {};
      screens.forEach((s) => { map[s.id] = s; });
      setScreensById(map);
    })();
    return () => { cancelled = true; };
  }, [items]);

  const handleConfirm = async () => {
    if (!providerReference.trim()) {
      toast.error('A payment reference is required');
      return;
    }
    setActing(true);
    try {
      const res = await base44.functions.invoke('confirmBooking', {
        booking_id: confirmTarget.id,
        provider_reference: providerReference.trim(),
      });
      setConfirmResult(res.data);
      toast.success('Payment confirmed');
      refresh();
      onActionComplete?.();
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to confirm payment';
      toast.error(msg);
    } finally {
      setActing(false);
    }
  };

  const closeDialog = () => {
    setConfirmTarget(null);
    setProviderReference('');
    setConfirmResult(null);
  };

  if (loading) return <ListSkeleton />;

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <EmptyState title="No pending payments" message="No bookings are awaiting payment confirmation." />
      ) : (
        <div className="space-y-3">
          {items.map((b) => (
            <div key={b.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 truncate">{screensById[b.screen_id]?.name || 'Unknown screen'}</p>
                  <p className="text-xs text-slate-400 truncate">{b.advertiser_email}</p>
                </div>
                <Button size="sm" onClick={() => { setConfirmTarget(b); setProviderReference(''); setConfirmResult(null); }}>
                  Confirm payment
                </Button>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
                <span>{moment(b.start_date).format('DD MMM')} – {moment(b.end_date).format('DD MMM YYYY')}</span>
                <span>Total: <strong className="text-slate-700">{formatAED(b.total_amount)}</strong></span>
                <span>Fee: {formatAED(b.platform_fee)}</span>
                <span>Venue: {formatAED(b.venue_earnings)}</span>
              </div>
            </div>
          ))}
          {hasMore && (
            <Button variant="outline" onClick={loadMore} disabled={loadingMore} className="w-full">
              {loadingMore ? 'Loading…' : 'Load more'}
            </Button>
          )}
        </div>
      )}

      <Dialog open={!!confirmTarget} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                Confirming records the money as received and credits the venue. This creates a permanent ledger entry and moves the booking to active. This action cannot be undone.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Payment reference</Label>
              <Input
                value={providerReference}
                onChange={(e) => setProviderReference(e.target.value)}
                placeholder="e.g. tap_ts_01JZ…"
              />
              <p className="text-xs text-slate-400">Enter the reference from the payment gateway.</p>
            </div>
            {confirmResult && (
              <div className={`rounded-lg p-3 border ${confirmResult.already_confirmed ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
                <p className={`text-sm font-medium ${confirmResult.already_confirmed ? 'text-blue-800' : 'text-green-800'}`}>
                  {confirmResult.already_confirmed ? 'Already confirmed' : 'Payment confirmed'}
                </p>
                <div className="text-xs mt-1 space-y-0.5">
                  <p className="text-slate-600">Transaction: <span className="font-mono">{confirmResult.transaction_id}</span></p>
                  <p className="text-slate-600">Booking status: {confirmResult.status}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>{confirmResult ? 'Close' : 'Cancel'}</Button>
            {!confirmResult && (
              <Button onClick={handleConfirm} disabled={acting || !providerReference.trim()}>
                {acting ? 'Confirming…' : 'Confirm payment'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}