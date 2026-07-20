import React, { useState, useEffect } from 'react';
import SEOHead from "@/components/SEOHead";
import { base44 } from '@/api/base44Client';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WorkspaceSkeleton, ListSkeleton } from '@/components/workspace/Skeletons';
import EmptyState from '@/components/workspace/EmptyState';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { formatAED } from '@/components/workspace/format';
import moment from 'moment';

const STATUS_STYLES = {
  pending_payment: 'bg-amber-100 text-amber-700',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-blue-100 text-blue-700',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-700',
};
const CREATIVE_STYLES = {
  pending_review: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const PAGE_SIZE = 20;

export default function Bookings() {
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screensById, setScreensById] = useState({});
  const [campaignsById, setCampaignsById] = useState({});
  const [showCheckoutBanner, setShowCheckoutBanner] = useState(false);

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
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'manual_success') {
      setShowCheckoutBanner(true);
    }
  }, []);

  const { items, loading: listLoading, loadingMore, hasMore, loadMore, refresh } = usePaginatedList(
    (skip) => user
      ? base44.entities.AdBooking.filter({ advertiser_email: user.email }, '-created_date', PAGE_SIZE, skip)
      : Promise.resolve([]),
    PAGE_SIZE
  );

  useEffect(() => {
    if (user?.email) refresh();
  }, [user?.email]); // eslint-disable-line react-hooks/exhaustive-deps

  // Batch-fetch screens and campaigns for the current page
  useEffect(() => {
    if (items.length === 0) {
      setScreensById({});
      setCampaignsById({});
      return;
    }
    let cancelled = false;
    (async () => {
      const screenIds = [...new Set(items.map((b) => b.screen_id).filter(Boolean))];
      const campaignIds = [...new Set(items.map((b) => b.campaign_id).filter(Boolean))];
      const [screens, campaigns] = await Promise.all([
        screenIds.length > 0
          ? base44.entities.Screen.filter({ id: { $in: screenIds } })
          : Promise.resolve([]),
        campaignIds.length > 0
          ? base44.entities.Campaign.filter({ id: { $in: campaignIds } })
          : Promise.resolve([]),
      ]);
      if (cancelled) return;
      const sMap = {};
      screens.forEach((s) => { sMap[s.id] = s; });
      setScreensById(sMap);
      const cMap = {};
      campaigns.forEach((c) => { cMap[c.id] = c; });
      setCampaignsById(cMap);
    })();
    return () => { cancelled = true; };
  }, [items]);

  if (loading) return <WorkspaceSkeleton />;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <SEOHead noIndex title="Bookings | Beyond Walls" />
      <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">Bookings</h1>

      {showCheckoutBanner && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Payment recorded. Your booking will go live once we confirm it — usually within one business day.
          </p>
        </div>
      )}

      {listLoading && items.length === 0 ? (
        <ListSkeleton />
      ) : items.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          message="Browse available screens and book your first ad slot."
          actionLabel="Browse screens"
          actionTo="/marketplace"
        />
      ) : (
        <div className="space-y-3">
          {items.map((b) => {
            const screen = screensById[b.screen_id];
            const campaign = campaignsById[b.campaign_id];
            return (
              <div key={b.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 truncate">
                      {screen?.name || 'Unknown screen'}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {campaign?.name || 'Unknown campaign'} · {moment(b.start_date).format('DD MMM')} – {moment(b.end_date).format('DD MMM YYYY')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={STATUS_STYLES[b.status] || 'bg-slate-100 text-slate-600'}>
                      {b.status?.replace(/_/g, ' ')}
                    </Badge>
                    <Badge className={CREATIVE_STYLES[b.creative_status] || 'bg-slate-100 text-slate-600'}>
                      {b.creative_status?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                  <span>{b.slots_booked} slot(s)</span>
                  <span>{b.weeks} week(s)</span>
                  <span className="font-medium text-slate-700">{formatAED(b.total_amount)}</span>
                </div>
                {b.creative_status === 'rejected' && b.creative_rejection_reason && (
                  <p className="text-xs text-red-600 mt-2 bg-red-50 rounded-lg p-2">
                    Rejected: {b.creative_rejection_reason}
                  </p>
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
    </div>
  );
}