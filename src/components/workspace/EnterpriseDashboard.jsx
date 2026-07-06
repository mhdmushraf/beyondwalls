import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { MonitorPlay, DollarSign, CreditCard, Megaphone } from 'lucide-react';
import KpiCard from './KpiCard';
import EnterpriseFinance from './EnterpriseFinance';
import { ListSkeleton } from './Skeletons';
import EmptyState from './EmptyState';
import { formatAED, formatNumber } from './format';

export default function EnterpriseDashboard({ user, org }) {
  const [kpis, setKpis] = useState(null);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [screens, campaigns] = await Promise.all([
          base44.entities.Screen.filter({ org_id: org.id }, null, 100, 0),
          base44.entities.Campaign.filter({ advertiser_email: user.email }, null, 100, 0),
        ]);
        const online = screens.filter((s) => s.is_online).length;
        const revenueKept = screens.reduce((s, sc) => s + (sc.total_revenue || 0), 0);
        const internalCampaigns = campaigns.filter((c) => c.status === 'active').length;
        setKpis({
          online,
          total: screens.length,
          revenueKept,
          subscription: org.commercial_plan === 'saas' ? 'SaaS' : '—',
          internalCampaigns,
        });
        const bySite = {};
        screens.forEach((s) => {
          const key = s.venue_id || 'unassigned';
          if (!bySite[key]) {
            bySite[key] = { id: key, name: s.location_description || s.name || 'Unnamed site', total: 0, online: 0 };
          }
          bySite[key].total++;
          if (s.is_online) bySite[key].online++;
        });
        setSites(Object.values(bySite));
      } catch {
        setKpis({ online: 0, total: 0, revenueKept: 0, subscription: '—', internalCampaigns: 0 });
        setSites([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user.email, org.id]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard
          icon={MonitorPlay}
          label="Screens online"
          value={kpis ? `${kpis.online} / ${kpis.total}` : '0 / 0'}
          loading={loading}
        />
        <KpiCard icon={DollarSign} label="Revenue kept" value={formatAED(kpis?.revenueKept)} loading={loading} />
        <KpiCard icon={CreditCard} label="Monthly subscription" value={kpis?.subscription ?? '—'} loading={loading} />
        <KpiCard icon={Megaphone} label="Internal campaigns" value={formatNumber(kpis?.internalCampaigns)} loading={loading} />
      </div>

      <div>
        <h2 className="font-heading font-semibold text-base sm:text-lg text-slate-900 mb-3">Per-site screen summary</h2>
        {loading ? (
          <ListSkeleton />
        ) : sites.length === 0 ? (
          <EmptyState title="No screens yet" message="Add screens to your sites to see a per-location summary." />
        ) : (
          <div className="space-y-3">
            {sites.map((site) => (
              <div
                key={site.id}
                className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 truncate">{site.name}</p>
                  <p className="text-xs text-slate-400">{site.total} screen{site.total !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-medium text-slate-600">
                    {site.online} / {site.total} online
                  </span>
                  <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${site.total ? (site.online / site.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EnterpriseFinance user={user} org={org} />
    </div>
  );
}