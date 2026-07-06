import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Wallet, Clock, MonitorPlay, CalendarCheck } from 'lucide-react';
import moment from 'moment';
import KpiCard from './KpiCard';
import VenueEarnings from './VenueEarnings';
import { ListSkeleton } from './Skeletons';
import EmptyState from './EmptyState';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { formatAED, formatNumber } from './format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const PAGE_SIZE = 20;

export default function VenueDashboard({ user, org }) {
  const [kpis, setKpis] = useState(null);
  const [kpisLoading, setKpisLoading] = useState(true);
  const [telemetryMap, setTelemetryMap] = useState({});

  useEffect(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    (async () => {
      try {
        const [screens, txns, payouts, bookings] = await Promise.all([
          base44.entities.Screen.filter({ org_id: org.id }, '-created_date', 100, 0),
          base44.entities.Transaction.filter(
            { user_email: user.email, type: 'earnings', created_date: { $gte: monthStart } },
            '-created_date', 100, 0
          ),
          base44.entities.PayoutRequest.filter(
            { venue_owner_email: user.email, status: 'pending' },
            '-created_date', 100, 0
          ),
          base44.entities.AdBooking.filter(
            { venue_owner_email: user.email, created_date: { $gte: weekStart } },
            '-created_date', 100, 0
          ),
        ]);
        const screenIds = screens.map(s => s.id);
        let telem = [];
        if (screenIds.length > 0) {
          telem = await base44.entities.ScreenTelemetry.filter({ screen_id: { $in: screenIds } });
        }
        const tMap = {};
        telem.forEach(t => { tMap[t.screen_id] = t; });
        setTelemetryMap(tMap);
        const online = screens.filter((s) => tMap[s.id]?.is_online).length;
        const earnings = txns.reduce((s, t) => s + (t.amount || 0), 0);
        const pendingPayout = payouts.reduce((s, p) => s + (p.amount || 0), 0);
        setKpis({ earnings, pendingPayout, online, total: screens.length, bookings: bookings.length });
      } catch {
        setKpis({ earnings: 0, pendingPayout: 0, online: 0, total: 0, bookings: 0 });
      } finally {
        setKpisLoading(false);
      }
    })();
  }, [user.email, org.id]);

  const { items, loading, loadingMore, hasMore, loadMore } = usePaginatedList(
    (skip) => base44.entities.Screen.filter({ org_id: org.id }, '-created_date', PAGE_SIZE, skip),
    PAGE_SIZE
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard icon={Wallet} label="Net earnings (mo)" value={formatAED(kpis?.earnings)} loading={kpisLoading} />
        <KpiCard icon={Clock} label="Pending payout" value={formatAED(kpis?.pendingPayout)} loading={kpisLoading} />
        <KpiCard
          icon={MonitorPlay}
          label="Screens online"
          value={kpis ? `${kpis.online} / ${kpis.total}` : '0 / 0'}
          loading={kpisLoading}
        />
        <KpiCard icon={CalendarCheck} label="Bookings (week)" value={formatNumber(kpis?.bookings)} loading={kpisLoading} />
      </div>

      <div>
        <h2 className="font-heading font-semibold text-base sm:text-lg text-slate-900 mb-3">My screens</h2>
        {loading ? (
          <ListSkeleton />
        ) : items.length === 0 ? (
          <EmptyState
            title="No screens yet"
            message="Add your first screen to start earning from ad slots."
          />
        ) : (
          <div className="space-y-3">
            {items.map((s) => {
              const telem = telemetryMap[s.id];
              const isOnline = telem?.is_online ?? false;
              return (
                <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 truncate">{s.name}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {s.location_description || moment(s.created_date).format('DD MMM YYYY')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-medium text-slate-600 hidden sm:inline">{formatAED(s.total_revenue)}</span>
                    <Badge className={isOnline ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}>
                      {isOnline ? 'Online' : 'Offline'}
                    </Badge>
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
      </div>

      <VenueEarnings user={user} org={org} />
    </div>
  );
}