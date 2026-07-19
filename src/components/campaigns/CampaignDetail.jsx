import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
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

export default function CampaignDetail({ campaign }) {
  const [bookings, setBookings] = useState([]);
  const [screensById, setScreensById] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const result = await base44.entities.AdBooking.filter(
          { campaign_id: campaign.id }, '-created_date', 50, 0
        );
        if (cancelled) return;
        setBookings(result);
        const screenIds = [...new Set(result.map((b) => b.screen_id).filter(Boolean))];
        if (screenIds.length > 0) {
          const screens = await base44.entities.Screen.filter({ id: { $in: screenIds } });
          if (cancelled) return;
          const map = {};
          screens.forEach((s) => { map[s.id] = s; });
          setScreensById(map);
        }
      } catch (e) {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [campaign.id]);

  if (loading) return <div className="py-4 text-sm text-slate-400">Loading bookings…</div>;
  if (bookings.length === 0) {
    return <div className="py-4 text-sm text-slate-400">No bookings for this campaign yet.</div>;
  }

  return (
    <div className="space-y-2 py-2">
      {bookings.map((b) => (
        <div key={b.id} className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {screensById[b.screen_id]?.name || 'Unknown screen'}
            </p>
            <p className="text-xs text-slate-400">
              {moment(b.start_date).format('DD MMM')} – {moment(b.end_date).format('DD MMM YYYY')} · {formatAED(b.total_amount)}
            </p>
          </div>
          <Badge className={STATUS_STYLES[b.status] || 'bg-slate-100 text-slate-600'}>
            {b.status?.replace(/_/g, ' ')}
          </Badge>
          <Badge className={CREATIVE_STYLES[b.creative_status] || 'bg-slate-100 text-slate-600'}>
            {b.creative_status?.replace(/_/g, ' ')}
          </Badge>
        </div>
      ))}
    </div>
  );
}