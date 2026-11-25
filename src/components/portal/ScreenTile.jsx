import { Link } from 'react-router-dom';
import { MonitorPlay, WifiOff, Radio } from 'lucide-react';
import { useSignedUrl, timeAgo } from '@/lib/portalData';
import { useI18n } from '@/lib/i18n';

export default function ScreenTile({ screen, venueName }) {
  const { t, lang } = useI18n();
  const snapshot = useSignedUrl(screen.last_snapshot_url);

  const paired = Boolean(screen.paired_device_id);
  const online = Boolean(screen.is_online);
  const state = !paired ? 'unpaired' : online ? 'online' : 'offline';

  const stateStyles = {
    online: { dot: 'bg-emerald-500', label: t('screens.online'), text: 'text-emerald-600' },
    offline: { dot: 'bg-rose-500', label: t('screens.offline'), text: 'text-rose-600' },
    unpaired: { dot: 'bg-amber-400', label: t('screens.unpaired'), text: 'text-amber-600' },
  }[state];

  return (
    <Link
      to={`/app/screens/${screen.id}`}
      className="group block rounded-2xl border border-bw-line bg-white overflow-hidden hover:border-bw-navy/20 hover:shadow-sm transition-all"
    >
      <div className="relative aspect-video bg-bw-navy/95">
        {snapshot ? (
          <img src={snapshot} alt={screen.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-white/40">
            <MonitorPlay className="h-7 w-7" />
            <span className="text-[11px]">{t('screens.noSnapshot')}</span>
          </div>
        )}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur px-2.5 py-1 text-[11px] font-medium text-white">
          <span className={`h-1.5 w-1.5 rounded-full ${stateStyles.dot}`} />
          {stateStyles.label}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-bw-navy truncate">{screen.name}</p>
            <p className="text-[11px] text-bw-muted truncate">{venueName || screen.position_label || '—'}</p>
          </div>
          {online ? <Radio className="h-4 w-4 text-emerald-500 shrink-0" /> : <WifiOff className="h-4 w-4 text-bw-muted shrink-0" />}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 text-[11px]">
          <span className="text-bw-muted truncate">
            {t('dashboard.currentItem')}: <span className="text-bw-ink">{screen.current_item || '—'}</span>
          </span>
          <span className="text-bw-muted shrink-0">
            {screen.last_heartbeat ? timeAgo(screen.last_heartbeat, lang) : t('dashboard.never')}
          </span>
        </div>
      </div>
    </Link>
  );
}