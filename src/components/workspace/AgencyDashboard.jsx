import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, Megaphone, TrendingUp, Clock } from 'lucide-react';
import KpiCard from './KpiCard';
import { ListSkeleton } from './Skeletons';
import EmptyState from './EmptyState';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { formatAED, formatNumber } from './format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import moment from 'moment';

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-amber-100 text-amber-700',
  archived: 'bg-slate-100 text-slate-500',
};

const PAGE_SIZE = 20;

export default function AgencyDashboard({ user, org }) {
  const [kpis, setKpis] = useState(null);
  const [kpisLoading, setKpisLoading] = useState(true);
  const [clientBreakdown, setClientBreakdown] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [campaigns, clients] = await Promise.all([
          base44.entities.Campaign.filter({ org_id: org.id }, '-created_date', 200, 0),
          base44.entities.Client.filter({ agency_org_id: org.id }, '-created_date', 100, 0),
        ]);

        const campaignIds = campaigns.map(c => c.id);
        let bookings = [];
        if (campaignIds.length > 0) {
          bookings = await base44.entities.AdBooking.filter({ campaign_id: { $in: campaignIds } }, null, 500, 0);
        }

        const activeClients = clients.filter(c => c.status === 'active').length;
        const campaignsLive = campaigns.filter(c => c.status === 'active').length;
        const managedSpend = bookings
          .filter(b => b.status === 'active' || b.status === 'completed')
          .reduce((s, b) => s + (b.total_amount || 0), 0);
        const pendingApprovals = bookings.filter(b => b.creative_status === 'pending_review').length;

        setKpis({ clients: activeClients, campaignsLive, managedSpend, pendingApprovals });

        const breakdown = clients.map(client => {
          const clientCampaigns = campaigns.filter(c => c.client_id === client.id);
          const clientCampaignIds = new Set(clientCampaigns.map(c => c.id));
          const clientBookings = bookings.filter(b => clientCampaignIds.has(b.campaign_id));
          const spend = clientBookings
            .filter(b => b.status === 'active' || b.status === 'completed')
            .reduce((s, b) => s + (b.total_amount || 0), 0);
          const pending = clientBookings.filter(b => b.creative_status === 'pending_review').length;
          return {
            id: client.id,
            name: client.name,
            status: client.status,
            campaignCount: clientCampaigns.length,
            managedSpend: spend,
            pendingApprovals: pending,
          };
        });
        setClientBreakdown(breakdown);
      } catch {
        setKpis({ clients: 0, campaignsLive: 0, managedSpend: 0, pendingApprovals: 0 });
        setClientBreakdown([]);
      } finally {
        setKpisLoading(false);
      }
    })();
  }, [org.id]);

  const { items, loading, loadingMore, hasMore, loadMore } = usePaginatedList(
    (skip) => base44.entities.Campaign.filter({ org_id: org.id }, '-created_date', PAGE_SIZE, skip),
    PAGE_SIZE
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <KpiCard icon={Users} label="Active clients" value={formatNumber(kpis?.clients)} loading={kpisLoading} />
        <KpiCard icon={Megaphone} label="Campaigns live" value={formatNumber(kpis?.campaignsLive)} loading={kpisLoading} />
        <KpiCard icon={TrendingUp} label="Managed spend" value={formatAED(kpis?.managedSpend)} loading={kpisLoading} />
        <KpiCard icon={Clock} label="Pending approvals" value={formatNumber(kpis?.pendingApprovals)} loading={kpisLoading} />
      </div>

      {clientBreakdown.length > 0 && (
        <div>
          <h2 className="font-heading font-semibold text-base sm:text-lg text-slate-900 mb-3">Per-client breakdown</h2>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 border-b border-slate-200 bg-slate-50">
                  <th className="p-3 font-medium">Client</th>
                  <th className="p-3 font-medium text-right">Campaigns</th>
                  <th className="p-3 font-medium text-right">Managed spend</th>
                  <th className="p-3 font-medium text-right">Pending</th>
                </tr>
              </thead>
              <tbody>
                {clientBreakdown.map(c => (
                  <tr key={c.id} className="border-b border-slate-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 truncate">{c.name}</span>
                        <Badge className={STATUS_STYLES[c.status] || 'bg-slate-100 text-slate-500'}>{c.status}</Badge>
                      </div>
                    </td>
                    <td className="p-3 text-right text-slate-600">{c.campaignCount}</td>
                    <td className="p-3 text-right font-medium text-slate-700">{formatAED(c.managedSpend)}</td>
                    <td className="p-3 text-right text-slate-600">{c.pendingApprovals}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <h2 className="font-heading font-semibold text-base sm:text-lg text-slate-900 mb-3">Client campaigns</h2>
        {loading ? (
          <ListSkeleton />
        ) : items.length === 0 ? (
          <EmptyState title="No campaigns yet" message="Create your first client campaign to get started." />
        ) : (
          <div className="space-y-3">
            {items.map((c) => (
              <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 truncate">{c.name}</p>
                  <p className="text-xs text-slate-400">{moment(c.created_date).format('DD MMM YYYY')}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-medium text-slate-600 hidden sm:inline">{formatAED(c.total_budget)}</span>
                  <Badge className={STATUS_STYLES[c.status] || 'bg-slate-100 text-slate-500'}>{c.status}</Badge>
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