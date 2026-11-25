import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin, Store, MonitorPlay } from 'lucide-react';
import { usePortal } from '@/lib/PortalContext';
import { useI18n } from '@/lib/i18n';
import AddVenueDialog from '@/components/portal/AddVenueDialog';
import { ListSkeleton } from '@/components/portal/Skeletons';
import { ErrorState, SlowHint } from '@/components/states/StateViews';

const STATUS_STYLES = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  rejected: 'bg-rose-50 text-rose-700 border-rose-100',
};

export default function PortalVenues() {
  const { t } = useI18n();
  const { venues, screens, loadingData, dataError, reload, preview } = usePortal();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const screenCount = (venueId) => screens.filter((screen) => screen.venue_id === venueId).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-bw-navy">{t('venues.title')}</h1>
          <p className="mt-1 text-sm text-bw-muted">{t('venues.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={() => { setEditing(null); setOpen(true); }}
          className="inline-flex items-center gap-2 rounded-xl bg-bw-coral px-4 py-2.5 text-sm font-semibold text-white hover:bg-bw-coral/90 shrink-0"
        >
          <Plus className="h-4 w-4" />
          {t('venues.add')}
        </button>
      </div>

      <SlowHint loading={loadingData} forced={preview === 'slow'} />
      {loadingData && !venues.length ? (
        <ListSkeleton rows={3} />
      ) : dataError && !venues.length ? (
        <ErrorState error={dataError} action="load your venues" onRetry={reload} />
      ) : venues.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-bw-line bg-white/60 p-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-bw-cream flex items-center justify-center">
            <Store className="h-6 w-6 text-bw-navy" />
          </div>
          <p className="mt-3 text-sm text-bw-muted">{t('venues.empty')}</p>
          <button
            type="button"
            onClick={() => { setEditing(null); setOpen(true); }}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-bw-navy px-4 py-2.5 text-xs font-semibold text-white hover:bg-bw-navy/90"
          >
            <Plus className="h-4 w-4" />
            {t('venues.add')}
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {venues.map((venue) => {
            const photo = venue.photo_urls?.[0] || venue.image_url;
            const status = venue.approval_status || 'pending';
            return (
              <div key={venue.id} className="rounded-2xl border border-bw-line bg-white overflow-hidden">
                <div className="relative aspect-[16/9] bg-bw-cream">
                  {photo ? (
                    <img src={photo} alt={venue.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Store className="h-7 w-7 text-bw-navy/20" />
                    </div>
                  )}
                  <span className={`absolute top-3 left-3 rounded-full border px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
                    {t(`venues.${status}`)}
                  </span>
                </div>

                <div className="p-4">
                  <div className="flex items-start gap-2">
                    {venue.logo_url ? (
                      <img src={venue.logo_url} alt="" className="h-8 w-8 rounded-lg object-cover border border-bw-line" />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-bw-navy truncate">{venue.name}</p>
                      <p className="text-[11px] text-bw-muted capitalize">{venue.venue_type}</p>
                    </div>
                  </div>

                  {status === 'rejected' && venue.rejection_reason && <p className="mt-2 rounded-lg bg-rose-50 px-2 py-1.5 text-[11px] text-rose-700">Not approved: {venue.rejection_reason} — fix the details, then tap Help & support so we review it again.</p>}
                  {status === 'pending' && <p className="mt-2 text-[11px] text-amber-700">In review — usually under 24 hours.</p>}
                  <p className="mt-3 flex items-start gap-1.5 text-[11px] text-bw-muted">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{[venue.address, venue.city].filter(Boolean).join(', ')}</span>
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-bw-line pt-3">
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-bw-muted">
                      <MonitorPlay className="h-3.5 w-3.5" />
                      {screenCount(venue.id)} {t('venues.screens')}
                    </span>
                    <span className="flex gap-3">
                      <button type="button" className="!min-h-0 text-[11px] font-semibold text-bw-navy hover:underline" onClick={() => { setEditing(venue); setOpen(true); }}>Edit</button>
                      <Link to="/app/screens" className="text-[11px] font-semibold text-bw-coral hover:underline">{t('nav.screens')}</Link>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddVenueDialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }} venue={editing} />
    </div>
  );
}