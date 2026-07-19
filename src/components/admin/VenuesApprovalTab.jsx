import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ListSkeleton } from '@/components/workspace/Skeletons';
import EmptyState from '@/components/workspace/EmptyState';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

export default function VenuesApprovalTab({ onActionComplete }) {
  const [actingId, setActingId] = useState(null);

  const { items, loading, loadingMore, hasMore, loadMore, refresh } = usePaginatedList(
    (skip) => base44.entities.Venue.filter({ status: 'pending' }, '-created_date', PAGE_SIZE, skip),
    PAGE_SIZE
  );

  const handleApprove = async (venue) => {
    setActingId(venue.id);
    try {
      await base44.entities.Venue.update(venue.id, { status: 'active', approval_status: 'approved' });
      toast.success('Venue approved');
      refresh();
      onActionComplete?.();
    } catch (e) {
      toast.error(e?.message || 'Failed to approve venue');
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (venue) => {
    setActingId(venue.id);
    try {
      await base44.entities.Venue.update(venue.id, { status: 'inactive', approval_status: 'rejected' });
      toast.success('Venue rejected');
      refresh();
      onActionComplete?.();
    } catch (e) {
      toast.error(e?.message || 'Failed to reject venue');
    } finally {
      setActingId(null);
    }
  };

  if (loading) return <ListSkeleton />;

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <EmptyState title="No pending venues" message="All venues have been reviewed." />
      ) : (
        <div className="space-y-3">
          {items.map((v) => (
            <div key={v.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900 truncate">{v.name}</p>
                <p className="text-xs text-slate-400 truncate">
                  {v.venue_type?.replace(/_/g, ' ')} · {v.city || 'No city'} · {v.address || 'No address'}
                </p>
                {v.owner_email && <p className="text-xs text-slate-400 truncate">{v.owner_email}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button size="sm" onClick={() => handleApprove(v)} disabled={actingId === v.id}>
                  <Check className="w-4 h-4 mr-1" />Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleReject(v)} disabled={actingId === v.id}>
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
    </div>
  );
}