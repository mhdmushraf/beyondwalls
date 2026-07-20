import React, { useState, useEffect } from 'react';
import SEOHead from "@/components/SEOHead";
import { base44 } from '@/api/base44Client';
import { Plus, ChevronDown, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WorkspaceSkeleton, ListSkeleton } from '@/components/workspace/Skeletons';
import EmptyState from '@/components/workspace/EmptyState';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { formatAED } from '@/components/workspace/format';
import moment from 'moment';
import CampaignFormDialog from '@/components/campaigns/CampaignFormDialog';
import CampaignDetail from '@/components/campaigns/CampaignDetail';

const STATUS_STYLES = {
  draft: 'bg-slate-100 text-slate-600',
  pending_approval: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-blue-100 text-blue-700',
  completed: 'bg-slate-100 text-slate-600',
  rejected: 'bg-red-100 text-red-700',
};

const PAGE_SIZE = 20;

export default function Campaigns() {
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [clientsById, setClientsById] = useState({});
  const isAgency = org?.type === 'agency';

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
      } catch (e) {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const { items, loading: listLoading, loadingMore, hasMore, loadMore, refresh } = usePaginatedList(
    (skip) => org
      ? base44.entities.Campaign.filter({ org_id: org.id }, '-created_date', PAGE_SIZE, skip)
      : Promise.resolve([]),
    PAGE_SIZE
  );

  useEffect(() => {
    if (org?.id) refresh();
  }, [org?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Batch-fetch client names for agency orgs
  useEffect(() => {
    if (!isAgency || items.length === 0) { setClientsById({}); return; }
    let cancelled = false;
    (async () => {
      const clientIds = [...new Set(items.map((c) => c.client_id).filter(Boolean))];
      if (clientIds.length === 0) return;
      try {
        const clients = await base44.entities.Client.filter({ id: { $in: clientIds } });
        if (cancelled) return;
        const map = {};
        clients.forEach((cl) => { map[cl.id] = cl; });
        setClientsById(map);
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [items, isAgency]);

  if (loading) return <WorkspaceSkeleton />;
  if (!user || !org) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <EmptyState title="No organization" message="Your account is not linked to an organization yet." />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <SEOHead noIndex title="Campaigns | Beyond Walls" />
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">Campaigns</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-1" />New campaign
        </Button>
      </div>

      {listLoading && items.length === 0 ? (
        <ListSkeleton />
      ) : items.length === 0 ? (
        <EmptyState title="No campaigns yet" message="Create your first campaign to start advertising." />
      ) : (
        <div className="space-y-3">
          {items.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {c.creative_urls?.[0]
                    ? (c.creative_type === 'video'
                      ? <video src={c.creative_urls[0]} className="w-full h-full object-cover" muted />
                      : <img src={c.creative_urls[0]} alt="" className="w-full h-full object-cover" />)
                    : <ImageIcon className="w-5 h-5 text-slate-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{c.name}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {isAgency && c.client_id && clientsById[c.client_id]?.name ? `${clientsById[c.client_id].name} · ` : ''}
                    {c.goal?.replace(/_/g, ' ')} · {formatAED(c.total_budget)} · {formatAED(c.spent_budget)} spent
                    {c.start_date && ` · ${moment(c.start_date).format('DD MMM')} – ${moment(c.end_date).format('DD MMM YYYY')}`}
                  </p>
                </div>
                {c.creative_urls?.length > 1 && (
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full hidden sm:inline">
                    {c.creative_urls.length} creatives
                  </span>
                )}
                <Badge className={STATUS_STYLES[c.status] || 'bg-slate-100 text-slate-600'}>
                  {c.status?.replace(/_/g, ' ')}
                </Badge>
                {expandedId === c.id
                  ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />}
              </button>
              {expandedId === c.id && (
                <div className="px-4 pb-4 border-t border-slate-100">
                  <CampaignDetail campaign={c} />
                </div>
              )}
            </div>
          ))}
          {hasMore && (
            <Button variant="outline" onClick={loadMore} disabled={loadingMore} className="w-full">
              {loadingMore ? 'Loading…' : 'Load more'}
            </Button>
          )}
        </div>
      )}

      <CampaignFormDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        org={org}
        user={user}
        onCreated={() => refresh()}
      />
    </div>
  );
}