import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MonitorPlay, ChevronRight, Store } from 'lucide-react';
import { usePortal } from '@/lib/PortalContext';
import { useI18n } from '@/lib/i18n';
import AddScreenDialog from '@/components/portal/AddScreenDialog';
import { TableSkeleton } from '@/components/portal/Skeletons';
import { SCREEN_MODES, PLAYER_TYPES } from '@/lib/portalData';

function StatusLight({ screen, t }) {
  const paired = Boolean(screen.paired_device_id);
  const online = Boolean(screen.is_online);
  const state = !paired ? 'unpaired' : online ? 'online' : 'offline';
  const map = {
    online: { dot: 'bg-emerald-500', text: 'text-emerald-600', label: t('screens.online') },
    offline: { dot: 'bg-rose-500', text: 'text-rose-600', label: t('screens.offline') },
    unpaired: { dot: 'bg-amber-400', text: 'text-amber-600', label: t('screens.unpaired') },
  }[state];

  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${map.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${map.dot}`} />
      {map.label}
    </span>
  );
}

export default function PortalScreens() {
  const { t } = useI18n();
  const { venues, screens, loadingData } = usePortal();
  const [addVenue, setAddVenue] = useState(null);

  const modeLabel = (value) => SCREEN_MODES.find((mode) => mode.value === value)?.label || '—';
  const playerLabel = (value) => PLAYER_TYPES.find((player) => player.value === value)?.label || '—';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-bw-navy">{t('screens.title')}</h1>
        <p className="mt-1 text-sm text-bw-muted">{t('screens.subtitle')}</p>
      </div>

      {loadingData && !screens.length ? (
        <TableSkeleton />
      ) : venues.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-bw-line bg-white/60 p-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-bw-cream flex items-center justify-center">
            <Store className="h-6 w-6 text-bw-navy" />
          </div>
          <p className="mt-3 text-sm text-bw-muted">{t('screens.noVenues')}</p>
          <Link
            to="/app/venues"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-bw-navy px-4 py-2.5 text-xs font-semibold text-white hover:bg-bw-navy/90"
          >
            <Plus className="h-4 w-4" />
            {t('venues.add')}
          </Link>
        </div>
      ) : (
        venues.map((venue) => {
          const venueScreens = screens.filter((screen) => screen.venue_id === venue.id);
          const approved = venue.approval_status === 'approved';

          return (
            <div key={venue.id} className="rounded-2xl border border-bw-line bg-white overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-bw-line">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-bw-navy truncate">{venue.name}</p>
                  <p className="text-[11px] text-bw-muted">
                    {venue.city} · {venueScreens.length} {t('venues.screens')}
                    {!approved && <span className="text-amber-600"> · {t('venues.pending')}</span>}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddVenue(venue)}
                  disabled={!approved}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-bw-navy px-3 py-2 text-xs font-semibold text-white hover:bg-bw-navy/90 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t('screens.add')}
                </button>
              </div>

              {venueScreens.length === 0 ? (
                <p className="px-5 py-6 text-xs text-bw-muted">{t('screens.empty')}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-start">
                    <thead>
                      <tr className="text-[11px] uppercase tracking-wide text-bw-muted">
                        <th className="px-5 py-2.5 text-start font-medium">{t('screens.detail')}</th>
                        <th className="px-3 py-2.5 text-start font-medium">{t('screens.online')}</th>
                        <th className="px-3 py-2.5 text-start font-medium">{t('screens.mode')}</th>
                        <th className="px-3 py-2.5 text-start font-medium">{t('screens.player')}</th>
                        <th className="px-3 py-2.5 text-start font-medium">{t('screens.playing')}</th>
                        <th className="px-5 py-2.5" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-bw-line">
                      {venueScreens.map((screen) => (
                        <tr key={screen.id} className="hover:bg-bw-cream/60">
                          <td className="px-5 py-3">
                            <Link to={`/app/screens/${screen.id}`} className="block">
                              <span className="block text-xs font-semibold text-bw-navy">{screen.name}</span>
                              <span className="block text-[11px] text-bw-muted">{screen.position_label || '—'}</span>
                            </Link>
                          </td>
                          <td className="px-3 py-3"><StatusLight screen={screen} t={t} /></td>
                          <td className="px-3 py-3 text-[11px] text-bw-ink">{modeLabel(screen.mode)}</td>
                          <td className="px-3 py-3 text-[11px] text-bw-ink">{playerLabel(screen.player_type)}</td>
                          <td className="px-3 py-3 text-[11px] text-bw-muted max-w-[180px] truncate">{screen.current_item || '—'}</td>
                          <td className="px-5 py-3 text-end">
                            <Link to={`/app/screens/${screen.id}`} className="inline-flex items-center text-bw-muted hover:text-bw-navy">
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })
      )}

      {venues.length > 0 && screens.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-bw-muted">
          <MonitorPlay className="h-4 w-4" />
          {t('screens.empty')}
        </div>
      )}

      <AddScreenDialog
        open={Boolean(addVenue)}
        venue={addVenue}
        onOpenChange={(next) => { if (!next) setAddVenue(null); }}
      />
    </div>
  );
}