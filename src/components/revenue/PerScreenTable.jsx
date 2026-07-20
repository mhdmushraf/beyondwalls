import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ListSkeleton } from '@/components/workspace/Skeletons';
import EmptyState from '@/components/workspace/EmptyState';
import { formatAED, formatNumber } from '@/components/workspace/format';

export default function PerScreenTable({ orgId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        let allBookings = [];
        let skip = 0;
        const pageSize = 200;
        let hasMore = true;
        while (hasMore) {
          const batch = await base44.entities.AdBooking.filter(
            { org_id: orgId, status: { $in: ['active', 'completed'] } },
            '-created_date', pageSize, skip
          );
          allBookings = allBookings.concat(batch);
          hasMore = batch.length === pageSize;
          skip += batch.length;
        }

        const screenIds = [...new Set(allBookings.map((b) => b.screen_id).filter(Boolean))];
        const screens = screenIds.length > 0
          ? await base44.entities.Screen.filter({ id: { $in: screenIds } })
          : [];
        const screensById = {};
        screens.forEach((s) => { screensById[s.id] = s; });

        const byScreen = {};
        allBookings.forEach((b) => {
          if (!b.screen_id) return;
          if (!byScreen[b.screen_id]) {
            byScreen[b.screen_id] = { screen_id: b.screen_id, bookings: 0, impressions: 0, earnings: 0 };
          }
          byScreen[b.screen_id].bookings++;
          byScreen[b.screen_id].impressions += b.impressions || 0;
          byScreen[b.screen_id].earnings += b.venue_earnings || 0;
        });

        if (cancelled) return;
        setRows(
          Object.values(byScreen)
            .map((r) => ({ ...r, screen_name: screensById[r.screen_id]?.name || 'Unknown' }))
            .sort((a, b) => b.earnings - a.earnings)
        );
      } catch (e) {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [orgId]);

  if (loading) return <ListSkeleton />;
  if (rows.length === 0) return <EmptyState title="No screen data" message="No active or completed bookings yet." />;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <h2 className="font-medium text-slate-900">Per-screen breakdown</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
              <th className="p-3 font-medium">Screen</th>
              <th className="p-3 font-medium text-right">Bookings</th>
              <th className="p-3 font-medium text-right">Impressions</th>
              <th className="p-3 font-medium text-right">Earnings</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.screen_id} className="border-b border-slate-50">
                <td className="p-3 font-medium text-slate-900">{r.screen_name}</td>
                <td className="p-3 text-right text-slate-600">{r.bookings}</td>
                <td className="p-3 text-right text-slate-600">{formatNumber(r.impressions)}</td>
                <td className="p-3 text-right font-medium text-slate-900">{formatAED(r.earnings)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}