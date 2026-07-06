import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Megaphone, TrendingUp, Eye, QrCode } from 'lucide-react';
import moment from 'moment';
import KpiCard from './KpiCard';
import { ListSkeleton } from './Skeletons';
import EmptyState from './EmptyState';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { formatAED, formatNumber } from './format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PAGE_SIZE = 20;

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  approved: 'bg-green-100 text-green-700',
  draft: 'bg-slate-100 text-slate-500',
  paused: 'bg-amber-100 text-amber-700',
  pending_approval: 'bg-amber-100 text-amber-700',
  completed: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function AdvertiserDashboard({ user, org }) {
  const [kpis, setKpis] = useState(null);
  const [kpisLoading, setKpisLoading] = useState(true);

  useEffect(() => {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    (async () => {
      try {
        const [campaigns, txns] = await Promise.all([
          base44.entities.Campaign.filter({ advertiser_email: user.email }, '-created_date', 100, 0),
          base44.entities.Transaction.filter(
            { user_email: user.email, type: 'campaign_payment', created_date: { $gte: monthStart } },
            '-created_date', 100, 0
          ),
        ]);
        const activeCount = campaigns.filter((c) => c.status === 'active').length;
        const impressions = campaigns.reduce((s, c) => s + (c.total_impressions || 0), 0);
        const spend = txns.reduce((s, t) => s + (t.amount || 0), 0);
        setKpis({ activeCount, spend, impressions, qrScans: 0 });
      } catch {
        setKpis({ activeCount: 0, spend: 0, impressions: 0, qrScans: 0 });
      } finally {
        setKpisLoading(false);
      }
    })();
  }, [user.email]);

  const { items, loading, loadingMore, hasMore, loadMore } = usePaginatedList(
    (skip) => base44.entities.Campaign.filter({ advertiser_email: user.email }, '-created_date', PAGE_SIZE, skip),
    PAGE_SIZE
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard icon={Megaphone} label="Active campaigns" value={kpis?.activeCount ?? 0} loading={kpisLoading} />
        <KpiCard icon={TrendingUp} label="Spend this month" value={formatAED(kpis?.spend)} loading={kpisLoading} />
        <KpiCard icon={Eye} label="Impressions" value={formatNumber(kpis?.impressions)} loading={kpisLoading} />
        <KpiCard icon={QrCode} label="QR scans" value={formatNumber(kpis?.qrScans)} loading={kpisLoading} />
      </div>

      <div>
        <h2 className="font-heading font-semibold text-base sm:text-lg text-slate-900 mb-3">My campaigns</h2>
        {loading ? (
          <ListSkeleton />
        ) : items.length === 0 ? (
          <EmptyState
            title="No campaigns yet"
            message="Browse the marketplace to book your first screen campaign."
            actionLabel="Browse marketplace"
            actionTo="/ScreensOverview"
          />
        ) : (
          <div className="space-y-3">
            {items.map((c) => (
              <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 truncate">{c.name}</p>
                  <p className="text-xs text-slate-400">{moment(c.created_date).format('DD MMM YYYY')}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-medium text-slate-600 hidden sm:inline">{formatAED(c.spent_budget)}</span>
                  <Badge className={STATUS_COLORS[c.status] || 'bg-slate-100 text-slate-500'}>{c.status}</Badge>
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
    </div>
  );
}