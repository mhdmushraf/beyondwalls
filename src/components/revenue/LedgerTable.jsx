import React from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ListSkeleton } from '@/components/workspace/Skeletons';
import EmptyState from '@/components/workspace/EmptyState';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { formatAED } from '@/components/workspace/format';
import moment from 'moment';

const PAGE_SIZE = 20;

const TYPE_STYLES = {
  earnings: 'bg-green-100 text-green-700',
  platform_fee: 'bg-amber-100 text-amber-700',
  payout: 'bg-blue-100 text-blue-700',
  booking_payment: 'bg-violet-100 text-violet-700',
  topup: 'bg-slate-100 text-slate-600',
  refund: 'bg-red-100 text-red-700',
  campaign_payment: 'bg-violet-100 text-violet-700',
};

export default function LedgerTable({ orgId }) {
  const { items, loading, loadingMore, hasMore, loadMore } = usePaginatedList(
    (skip) => base44.entities.Transaction.filter({ org_id: orgId, type: { $nin: ['platform_fee', 'booking_payment'] } }, '-created_date', PAGE_SIZE, skip),
    PAGE_SIZE
  );

  if (loading && items.length === 0) return <ListSkeleton />;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <h2 className="font-medium text-slate-900">Ledger</h2>
      </div>
      {items.length === 0 ? (
        <EmptyState title="No transactions" message="No ledger entries yet." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Type</th>
                <th className="p-3 font-medium text-right">Amount</th>
                <th className="p-3 font-medium">Description</th>
                <th className="p-3 font-medium">Reference</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b border-slate-50">
                  <td className="p-3 text-slate-600 whitespace-nowrap">
                    {t.created_date ? moment(t.created_date).format('DD MMM YYYY') : '—'}
                  </td>
                  <td className="p-3">
                    <Badge className={TYPE_STYLES[t.type] || 'bg-slate-100 text-slate-600'}>
                      {t.type?.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="p-3 text-right font-medium text-slate-900">{formatAED(t.amount)}</td>
                  <td className="p-3 text-slate-600 max-w-xs truncate">{t.description || '—'}</td>
                  <td className="p-3 text-slate-400 font-mono text-xs">
                    {t.reference_id ? t.reference_id.slice(0, 12) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {hasMore && (
        <div className="p-3 border-t border-slate-100">
          <Button variant="outline" onClick={loadMore} disabled={loadingMore} className="w-full">
            {loadingMore ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}