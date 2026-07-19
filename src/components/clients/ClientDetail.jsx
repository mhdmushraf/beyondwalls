import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { ListSkeleton } from '@/components/workspace/Skeletons';
import EmptyState from '@/components/workspace/EmptyState';
import { formatAED } from '@/components/workspace/format';
import { ChevronDown, ChevronRight } from 'lucide-react';
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

export default function ClientDetail({ client }) {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [screensById, setScreensById] = useState({});
  const [expandedCampaignId, setExpandedCampaignId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const campaigns = await base44.entities.Campaign.filter({ client_id: client.id }, '-created_date', 100, 0);
        if (cancelled) return;
        setCampaigns(campaigns);
        const campaignIds = campaigns.map(c => c.id);
        let bookings = [];
        if (campaignIds.length > 0) {
          bookings = await base44.entities.AdBooking.filter({ campaign_id: { $in: campaignIds } });
        }
        if (cancelled) return;
        setBookings(bookings);
        const screenIds = [...new Set(bookings.map(b => b.screen_id).filter(Boolean))];
        if (screenIds.length > 0) {
          const screens = await base44.entities.Screen.filter({ id: { $in: screenIds } });
          if (cancelled) return;
          const map = {};
          screens.forEach(s => { map[s.id] = s; });
          setScreensById(map);
        }
      } catch { /* silent */ } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [client.id]);

  if (loading) return <ListSkeleton rows={3} />;

  return (
    <div className="space-y-3">
      {bookings.length === 0 ? (
        <EmptyState title="No bookings" message="This client has no bookings yet." />
      ) : (
        <div className="space-y-2">
          {bookings.map((b) => {
            const campaign = campaigns.find(c => c.id === b.campaign_id);
            const screen = screensById[b.screen_id];
            return (
              <div key={b.id} className="bg-slate-50 rounded-lg border border-slate-100 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 truncate text-sm">{screen?.name || 'Unknown screen'}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {campaign?.name || 'Unknown campaign'} · {moment(b.start_date).format('DD MMM')} – {moment(b.end_date).format('DD MMM YYYY')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Badge className={STATUS_STYLES[b.status] || 'bg-slate-100 text-slate-600'}>{b.status?.replace(/_/g, ' ')}</Badge>
                    <Badge className={CREATIVE_STYLES[b.creative_status] || 'bg-slate-100 text-slate-600'}>{b.creative_status?.replace(/_/g, ' ')}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
                  <span>{b.slots_booked} slot(s)</span>
                  <span>{b.weeks} week(s)</span>
                  <span className="font-medium text-slate-700">{formatAED(b.total_amount)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}