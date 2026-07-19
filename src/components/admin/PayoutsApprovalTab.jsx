import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ListSkeleton } from '@/components/workspace/Skeletons';
import EmptyState from '@/components/workspace/EmptyState';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { formatAED } from '@/components/workspace/format';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

function maskIban(iban) {
  if (!iban) return '—';
  const clean = iban.replace(/\s/g, '');
  return `•••• ${clean.slice(-4)}`;
}

export default function PayoutsApprovalTab({ onActionComplete }) {
  const [rejectTarget, setRejectTarget] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [acting, setActing] = useState(false);
  const [markingId, setMarkingId] = useState(null);

  const { items, loading, loadingMore, hasMore, loadMore, refresh } = usePaginatedList(
    (skip) => base44.entities.PayoutRequest.filter({ status: { $in: ['pending', 'approved'] } }, '-created_date', PAGE_SIZE, skip),
    PAGE_SIZE
  );

  const handleMarkPaid = async (pr) => {
    setMarkingId(pr.id);
    try {
      const res = await base44.functions.invoke('markPayoutPaid', { payout_request_id: pr.id });
      if (res.data?.already_paid) {
        toast.info('This payout was already marked as paid.');
      } else {
        toast.success('Payout marked as paid');
      }
      refresh();
      onActionComplete?.();
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to mark payout as paid';
      toast.error(msg);
    } finally {
      setMarkingId(null);
    }
  };

  const handleReject = async () => {
    if (!adminNotes.trim()) {
      toast.error('Admin notes are required');
      return;
    }
    setActing(true);
    try {
      await base44.functions.invoke('rejectPayout', {
        payout_request_id: rejectTarget.id,
        admin_notes: adminNotes,
      });
      toast.success('Payout request rejected');
      setRejectTarget(null);
      setAdminNotes('');
      refresh();
      onActionComplete?.();
    } catch (e) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to reject payout';
      toast.error(msg);
    } finally {
      setActing(false);
    }
  };

  if (loading) return <ListSkeleton />;

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <EmptyState title="No pending payouts" message="No payout requests awaiting action." />
      ) : (
        <div className="space-y-3">
          {items.map((pr) => (
            <div key={pr.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 truncate">{pr.venue_owner_email}</p>
                  <p className="text-xs text-slate-400">
                    IBAN {maskIban(pr.iban)} · Eligible at request: {formatAED(pr.eligible_snapshot)}
                  </p>
                </div>
                <Badge className={pr.status === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}>
                  {pr.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-3 mt-3">
                <span className="text-lg font-bold text-slate-900">{formatAED(pr.amount)}</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleMarkPaid(pr)}
                    disabled={markingId === pr.id}
                  >
                    {markingId === pr.id ? 'Processing…' : 'Mark paid'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setRejectTarget(pr); setAdminNotes(''); }}
                    disabled={markingId === pr.id}
                  >
                    Reject
                  </Button>
                </div>
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

      <Dialog open={!!rejectTarget} onOpenChange={(open) => { if (!open) { setRejectTarget(null); setAdminNotes(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject payout request</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Admin notes (required)</Label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Explain why this payout is being rejected…"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectTarget(null); setAdminNotes(''); }}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={acting}>
              {acting ? 'Rejecting…' : 'Reject payout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}