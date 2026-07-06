import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { FileText, DollarSign, Calendar, Info } from 'lucide-react';
import KpiCard from './KpiCard';
import { ListSkeleton } from './Skeletons';
import EmptyState from './EmptyState';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { formatAED, formatNumber } from './format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import moment from 'moment';

const PAGE_SIZE = 10;

export default function EnterpriseFinance({ user, org }) {
  const [contract, setContract] = useState(null);
  const [contractLoading, setContractLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const contracts = await base44.entities.Contract.filter({ org_id: org.id }, '-created_date', 1, 0);
        setContract(contracts[0] || null);
      } catch {
        setContract(null);
      } finally {
        setContractLoading(false);
      }
    })();
  }, [org.id]);

  const { items, loading, loadingMore, hasMore, loadMore } = usePaginatedList(
    (skip) =>
      base44.entities.Transaction.filter(
        { org_id: org.id, type: 'platform_fee' },
        '-created_date',
        PAGE_SIZE,
        skip
      ),
    PAGE_SIZE
  );

  const cycleAmount = contract
    ? (contract.price_per_screen || 0) * (contract.screen_count || 0)
    : 0;

  const invoiceStatusClass = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <KpiCard
          icon={DollarSign}
          label="Per-screen fee"
          value={contract ? formatAED(contract.price_per_screen) : '—'}
          loading={contractLoading}
        />
        <KpiCard
          icon={FileText}
          label="Screens under contract"
          value={contract ? formatNumber(contract.screen_count) : '—'}
          loading={contractLoading}
        />
        <KpiCard
          icon={Calendar}
          label={`${contract?.billing_cycle === 'annual' ? 'Annual' : 'Monthly'} invoice`}
          value={contract ? formatAED(cycleAmount) : '—'}
          loading={contractLoading}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700">
          Invoices are sent from Beyond Walls via Wio. No card gateway is used for SaaS/enterprise billing.
        </p>
      </div>

      <div>
        <h2 className="font-heading font-semibold text-base sm:text-lg text-slate-900 mb-3">Invoices</h2>
        {loading ? (
          <ListSkeleton rows={4} />
        ) : items.length === 0 ? (
          <EmptyState
            title="No invoices yet"
            message="Invoices will appear here once your contract is active and billing cycles begin."
          />
        ) : (
          <div className="space-y-3">
            {items.map((inv) => (
              <div
                key={inv.id}
                className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{formatAED(inv.amount)}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {moment(inv.created_date).format('DD MMM YYYY')}
                    {inv.description ? ` · ${inv.description}` : ''}
                  </p>
                </div>
                <Badge className={invoiceStatusClass(inv.status)}>
                  {inv.status}
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