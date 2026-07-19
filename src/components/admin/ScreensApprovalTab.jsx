import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ListSkeleton } from '@/components/workspace/Skeletons';
import EmptyState from '@/components/workspace/EmptyState';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

export default function ScreensApprovalTab({ onActionComplete }) {
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [acting, setActing] = useState(false);

  const { items, loading, loadingMore, hasMore, loadMore, refresh } = usePaginatedList(
    (skip) => base44.entities.Screen.filter({ approval_status: 'pending' }, '-created_date', PAGE_SIZE, skip),
    PAGE_SIZE
  );

  const handleApprove = async (screen) => {
    setActing(true);
    try {
      await base44.entities.Screen.update(screen.id, { approval_status: 'approved', status: 'active' });
      toast.success('Screen approved');
      refresh();
      onActionComplete?.();
    } catch (e) {
      toast.error(e?.message || 'Failed to approve screen');
    } finally {
      setActing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('A reason is required');
      return;
    }
    setActing(true);
    try {
      await base44.entities.Screen.update(rejectTarget.id, {
        approval_status: 'rejected',
        rejection_reason: rejectReason,
      });
      toast.success('Screen rejected');
      setRejectTarget(null);
      setRejectReason('');
      refresh();
      onActionComplete?.();
    } catch (e) {
      toast.error(e?.message || 'Failed to reject screen');
    } finally {
      setActing(false);
    }
  };

  if (loading) return <ListSkeleton />;

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <EmptyState title="No pending screens" message="All screens have been reviewed." />
      ) : (
        <div className="space-y-3">
          {items.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900 truncate">{s.name}</p>
                <p className="text-xs text-slate-400 truncate">
                  {s.location_description || 'No location set'}{s.venue_id ? ` · Venue ${s.venue_id}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button size="sm" onClick={() => handleApprove(s)} disabled={acting}>
                  <Check className="w-4 h-4 mr-1" />Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setRejectTarget(s); setRejectReason(''); }} disabled={acting}>
                  <X className="w-4 h-4 mr-1" />Reject
                </Button>
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

      <Dialog open={!!rejectTarget} onOpenChange={(open) => { if (!open) { setRejectTarget(null); setRejectReason(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject screen</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Reason for rejection</Label>
            <Input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g. Screen photo does not match the venue" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectTarget(null); setRejectReason(''); }}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={acting}>
              {acting ? 'Rejecting…' : 'Reject screen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}