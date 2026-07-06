import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Wallet, ArrowDownToLine, Clock } from 'lucide-react';
import moment from 'moment';
import KpiCard from './KpiCard';
import { ListSkeleton } from './Skeletons';
import EmptyState from './EmptyState';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { formatAED } from './format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PAGE_SIZE = 10;

export default function VenueEarnings({ user, org }) {
  const [payout, setPayout] = useState(null);
  const [payoutLoading, setPayoutLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke('computeEligiblePayout', { org_id: org.id });
        setPayout(res.data);
      } catch {
        setPayout({ eligible_payout: 0, total_earnings: 0, total_paid_out: 0 });
      } finally {
        setPayoutLoading(false);
      }
    })();
  }, [org.id]);

  const { items, loading, loadingMore, hasMore, loadMore } = usePaginatedList(
    (skip) =>
      base44.entities.PayoutRequest.filter(
        { venue_owner_email: user.email },
        '-created_date',
        PAGE_SIZE,
        skip
      ),
    PAGE_SIZE
  );

  const statusClass = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'approved': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <KpiCard
          icon={Wallet}
          label="Eligible for payout"
          value={formatAED(payout?.eligible_payout)}
          loading={payoutLoading}
        />
        <KpiCard
          icon={ArrowDownToLine}
          label="Total earned"
          value={formatAED(payout?.total_earnings)}
          loading={payoutLoading}
        />
        <KpiCard
          icon={Clock}
          label="Total paid out"
          value={formatAED(payout?.total_paid_out)}
          loading={payoutLoading}
        />
      </div>

      <div>
        <h2 className="font-heading font-semibold text-base sm:text-lg text-slate-900 mb-3">Payout history</h2>
        {loading ? (
          <ListSkeleton rows={4} />
        ) : items.length === 0 ? (
          <EmptyState
            title="No payouts yet"
            message="Your payout history will appear here once you request a withdrawal."
          />
        ) : (
          <div className="space-y-3">
            {items.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{formatAED(p.amount)}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {moment(p.created_date).format('DD MMM YYYY')}
                    {p.bank_name ? ` · ${p.bank_name}` : ''}
                  </p>
                </div>
                <Badge className={statusClass(p.status)}>
                  {p.status}
                </Badge>
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
    </div>
  );
}