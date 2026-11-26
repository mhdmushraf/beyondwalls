import { Link } from 'react-router-dom';
import { WifiOff, Radio } from 'lucide-react';
import { useSignedUrl, timeAgo } from '@/lib/portalData';
import { useI18n } from '@/lib/i18n';
import ScreenLivePreview from '@/components/portal/ScreenLivePreview';
import { isLive } from '@/pages/portal/PortalUrgent';

export default function ScreenTile({ screen, venueName, fallbackImage, menus, urgent }) {
  const { t, lang } = useI18n();
  const snapshot = useSignedUrl(screen.last_snapshot_url);
  const photo = useSignedUrl(!screen.last_snapshot_url ? (screen.screen_image_url || fallbackImage) : null);

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
      className="group block rounded-[22px] border border-[#ebe8f4] bg-white overflow-hidden shadow-[0_14px_34px_-22px_rgba(55,30,140,0.35)] hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-22px_rgba(55,30,140,0.45)] transition-all"
    >
      <div className="relative aspect-video bg-bw-navy/95">
        {snapshot ? (
          <img src={snapshot} alt={screen.name} className="h-full w-full object-cover" />
        ) : (
          menus || urgent ? (
            <div className="relative h-full w-full overflow-hidden">
              <div className="absolute inset-0 origin-top-left scale-[0.5] w-[200%] h-[200%]"><ScreenLivePreview screen={{ ...screen, screen_image_url: screen.screen_image_url || fallbackImage }} menus={menus || []} urgent={urgent || []} isLive={isLive} /></div>
            </div>
          ) : (
          <div className="relative h-full w-full overflow-hidden" style={{ backgroundImage: 'linear-gradient(140deg,#2a1470 0%,#140b3a 60%,#0d0a1f 100%)' }}>
            {photo && <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0a1f] via-[#0d0a1f]/40 to-transparent" />
            <div className="absolute inset-x-4 bottom-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#c4b5fd]">{online ? 'Now playing' : 'Last played'}</p>
              <p className="mt-0.5 truncate text-[18px] font-bold text-white">{screen.current_item || screen.name}</p>
            </div>
          </div>
          )
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