import React from 'react';
import { Link } from 'react-router-dom';
import { MonitorPlay, WifiOff, Wifi, AlertCircle, Plus } from 'lucide-react';
import { usePortal } from '@/lib/PortalContext';
import { useI18n } from '@/lib/i18n';
import ScreenTile from '@/components/portal/ScreenTile';
import SetupChecklist from '@/components/portal/SetupChecklist';
import { PageSkeleton } from '@/components/portal/Skeletons';

function StatCard({ label, value, icon: Icon, tone }) {
  return (
    <div className="rounded-2xl border border-bw-line bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-bw-muted">{label}</p>
        <Icon className={`h-4 w-4 ${tone}`} />
      </div>
      <p className="mt-2 text-2xl font-semibold text-bw-navy">{value}</p>
    </div>
  );
}

export default function PortalDashboard() {
  const { t } = useI18n();
  const { org, venues, screens, loadingData } = usePortal();

  if (loadingData && !screens.length && !venues.length) return <PageSkeleton />;

  const online = screens.filter((screen) => screen.is_online).length;
  const unpaired = screens.filter((screen) => !screen.paired_device_id).length;
  const offline = screens.filter((screen) => screen.paired_device_id && !screen.is_online).length;

  const venueName = (venueId) => venues.find((venue) => venue.id === venueId)?.name || '';

  const alerts = [
    ...screens
      .filter((screen) => screen.paired_device_id && !screen.is_online)
      .map((screen) => ({ id: `off-${screen.id}`, text: `${screen.name} · ${t('screens.offline')}`, to: `/app/screens/${screen.id}`, tone: 'rose' })),
    ...screens
      .filter((screen) => !screen.paired_device_id)
      .map((screen) => ({ id: `unp-${screen.id}`, text: `${screen.name} · ${t('screens.unpaired')}`, to: `/app/screens/${screen.id}`, tone: 'amber' })),
    ...venues
      .filter((venue) => venue.approval_status === 'pending')
      .map((venue) => ({ id: `pen-${venue.id}`, text: `${venue.name} · ${t('venues.pending')}`, to: '/app/venues', tone: 'amber' })),
  ].slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-bw-navy">{t('dashboard.title')}</h1>
        <p className="mt-1 text-sm text-bw-muted">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('dashboard.online')} value={online} icon={Wifi} tone="text-emerald-500" />
        <StatCard label={t('dashboard.offline')} value={offline} icon={WifiOff} tone="text-rose-500" />
        <StatCard label={t('dashboard.unpaired')} value={unpaired} icon={MonitorPlay} tone="text-amber-500" />
        <StatCard label={t('dashboard.venues')} value={venues.length} icon={MonitorPlay} tone="text-bw-navy" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-bw-line bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-bw-navy">{t('dashboard.alerts')}</h2>
            <AlertCircle className="h-4 w-4 text-bw-muted" />
          </div>

          {alerts.length === 0 ? (
            <p className="mt-6 text-xs text-bw-muted">{t('dashboard.noAlerts')}</p>
          ) : (
            <ul className="mt-4 divide-y divide-bw-line">
              {alerts.map((alert) => (
                <li key={alert.id}>
                  <Link to={alert.to} className="flex items-center gap-3 py-2.5 group">
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${alert.tone === 'rose' ? 'bg-rose-500' : 'bg-amber-400'}`} />
                    <span className="flex-1 text-xs text-bw-ink truncate group-hover:text-bw-navy">{alert.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <SetupChecklist org={org} venues={venues} screens={screens} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-bw-navy">{t('dashboard.liveScreens')}</h2>
          <Link to="/app/screens" className="text-xs font-semibold text-bw-coral hover:underline">
            {t('nav.screens')}
          </Link>
        </div>

        {screens.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-bw-line bg-white/60 p-10 text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-bw-cream flex items-center justify-center">
              <MonitorPlay className="h-6 w-6 text-bw-navy" />
            </div>
            <p className="mt-3 text-sm text-bw-muted">{t('dashboard.noScreens')}</p>
            <Link
              to="/app/venues"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-bw-navy px-4 py-2.5 text-xs font-semibold text-white hover:bg-bw-navy/90"
            >
              <Plus className="h-4 w-4" />
              {t('venues.add')}
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {screens.map((screen) => (
              <ScreenTile key={screen.id} screen={screen} venueName={venueName(screen.venue_id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}