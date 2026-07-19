import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ChevronDown, ChevronRight, Archive, Users } from 'lucide-react';
import { WorkspaceSkeleton, ListSkeleton } from '@/components/workspace/Skeletons';
import EmptyState from '@/components/workspace/EmptyState';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { formatAED } from '@/components/workspace/format';
import AddClientDialog from '@/components/clients/AddClientDialog';
import ClientDetail from '@/components/clients/ClientDetail';
import { toast } from 'sonner';

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-amber-100 text-amber-700',
  archived: 'bg-slate-100 text-slate-500',
};

const PAGE_SIZE = 20;

export default function Clients() {
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [stats, setStats] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        const memberships = await base44.entities.Membership.filter({ user_id: u.id }, null, 1, 0);
        const orgId = u.current_org_id || memberships[0]?.org_id;
        if (orgId) {
          const o = await base44.entities.Organization.get(orgId);
          setOrg(o);
        }
        setUser(u);
      } catch { /* silent */ } finally {
        setLoading(false);
      }
    })();
  }, []);

  const { items, loading: listLoading, loadingMore, hasMore, loadMore, refresh } = usePaginatedList(
    (skip) => org
      ? base44.entities.Client.filter({ agency_org_id: org.id }, '-created_date', PAGE_SIZE, skip)
      : Promise.resolve([]),
    PAGE_SIZE
  );

  useEffect(() => {
    if (org?.id) refresh();
  }, [org?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Batch-fetch campaigns + bookings for all visible clients ($in)
  useEffect(() => {
    if (items.length === 0) { setStats({}); return; }
    let cancelled = false;
    (async () => {
      try {
        const clientIds = items.map(c => c.id);
        const campaigns = await base44.entities.Campaign.filter({ client_id: { $in: clientIds } }, null, 200, 0);
        if (cancelled) return;
        const campaignIds = campaigns.map(c => c.id);
        let bookings = [];
        if (campaignIds.length > 0) {
          bookings = await base44.entities.AdBooking.filter({ campaign_id: { $in: campaignIds } }, null, 500, 0);
        }
        if (cancelled) return;
        const map = {};
        items.forEach(client => {
          const clientCampaigns = campaigns.filter(c => c.client_id === client.id);
          const clientCampaignIds = new Set(clientCampaigns.map(c => c.id));
          const clientBookings = bookings.filter(b => clientCampaignIds.has(b.campaign_id));
          const spend = clientBookings
            .filter(b => b.status === 'active' || b.status === 'completed')
            .reduce((s, b) => s + (b.total_amount || 0), 0);
          map[client.id] = { campaignCount: clientCampaigns.length, managedSpend: spend };
        });
        setStats(map);
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [items]);

  const handleArchive = async (client) => {
    try {
      await base44.entities.Client.update(client.id, { status: 'archived' });
      toast.success('Client archived');
      refresh();
    } catch (e) {
      toast.error(e.message || 'Failed to archive');
    }
  };

  if (loading) return <WorkspaceSkeleton />;
  if (!user || !org) {
    return <div className="p-4 sm:p-6 lg:p-8"><EmptyState title="No organization" message="Your account is not linked to an organization yet." /></div>;
  }
  if (org.type !== 'agency') {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="w-12 h-12 text-slate-300 mb-3" />
          <h2 className="font-heading text-lg font-semibold text-slate-900">Not available for this account type</h2>
          <p className="text-sm text-slate-500 mt-1">Client management is only available for agency accounts.</p>
        </div>
      </div>
    );
  }

  const visibleItems = showArchived ? items : items.filter(c => c.status !== 'archived');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">Clients</h1>
          <p className="text-sm text-slate-500">Manage agency clients and their campaigns.</p>
        </div>
        <Button onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" /><span className="hidden sm:inline">Add client</span></Button>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
        <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="w-4 h-4 rounded" />
        Show archived
      </label>

      {listLoading && items.length === 0 ? (
        <ListSkeleton rows={4} />
      ) : visibleItems.length === 0 ? (
        <EmptyState title="No clients yet" message="Add your first client to start managing campaigns." />
      ) : (
        <div className="space-y-3">
          {visibleItems.map((client) => {
            const isExpanded = expandedId === client.id;
            const s = stats[client.id] || { campaignCount: 0, managedSpend: 0 };
            return (
              <div key={client.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : client.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{client.name}</p>
                      <p className="text-xs text-slate-400 truncate">
                        {client.contact_name || client.contact_email || 'No contact'}
                        {client.industry && ` · ${client.industry}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-slate-400">{s.campaignCount} campaign(s)</p>
                      <p className="text-sm font-medium text-slate-700">{formatAED(s.managedSpend)}</p>
                    </div>
                    <Badge className={STATUS_STYLES[client.status] || 'bg-slate-100 text-slate-500'}>{client.status}</Badge>
                    {client.status !== 'archived' && (
                      <span
                        role="button"
                        onClick={(e) => { e.stopPropagation(); handleArchive(client); }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                      >
                        <Archive className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-slate-100">
                    <ClientDetail client={client} />
                  </div>
                )}
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

      <AddClientDialog open={addOpen} onOpenChange={setAddOpen} org={org} onCreated={refresh} />
    </div>
  );
}