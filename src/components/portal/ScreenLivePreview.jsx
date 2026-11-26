import { useEffect, useState } from 'react';
import { useSignedUrl } from '@/lib/portalData';

const STYLE = {
  urgent: 'linear-gradient(140deg,#d64545 0%,#9b1c1c 100%)',
  notice: 'linear-gradient(140deg,#f59e0b 0%,#b45309 100%)',
  info: 'linear-gradient(140deg,#6f3ffd 0%,#3a17b8 100%)',
};
const THEME = {
  night: { bg: 'linear-gradient(150deg,#140b3a,#0d0a1f)', ink: '#fff', sub: 'rgba(255,255,255,.65)', accent: '#c4b5fd' },
  coffee: { bg: 'linear-gradient(150deg,#3b2417,#1d120b)', ink: '#fdf6ec', sub: 'rgba(253,246,236,.7)', accent: '#f5c27a' },
  forest: { bg: 'linear-gradient(150deg,#0f3d2e,#08241b)', ink: '#ecfdf5', sub: 'rgba(236,253,245,.7)', accent: '#6ee7b7' },
  light: { bg: 'linear-gradient(150deg,#ffffff,#f3f1fb)', ink: '#111027', sub: '#6b6787', accent: '#5a2ded' },
};

const hhmm = () => new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', hour: '2-digit', minute: '2-digit' }).format(new Date());
const inWindow = (m) => {
  if (!m.show_from && !m.show_until) return true;
  const t = hhmm();
  return (!m.show_from || t >= m.show_from) && (!m.show_until || t < m.show_until);
};

/**
 * Renders what this screen is showing right now from the same data the player uses
 * (live urgent message > menu board on schedule > photo / current item).
 * Used when the player hasn't uploaded a real snapshot yet.
 */
export default function ScreenLivePreview({ screen, menus = [], urgent = [], isLive }) {
  const [, tick] = useState(0);
  useEffect(() => { const id = setInterval(() => tick((n) => n + 1), 15000); return () => clearInterval(id); }, []);
  const photo = useSignedUrl(screen.screen_image_url || screen.default_image_url);

  const live = urgent.find((m) => isLive(m) && (!(m.screen_ids || []).length || m.screen_ids.includes(screen.id)));
  if (live) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white" style={{ backgroundImage: STYLE[live.style] || STYLE.urgent }}>
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[28px] font-black" style={{ color: live.style === 'info' ? '#5a2ded' : live.style === 'notice' ? '#b45309' : '#c53030' }}>!</span>
        <p className="mt-5 text-[34px] md:text-[44px] font-extrabold leading-tight">{live.text_en}</p>
        {live.text_ar && <p className="mt-2 text-[26px] md:text-[32px] font-bold opacity-90" dir="rtl">{live.text_ar}</p>}
        {live.subtext && <p className="mt-3 text-[15px] opacity-85">{live.subtext}</p>}
        <span className="absolute bottom-4 right-4 rounded-full bg-black/25 px-3 py-1 text-[11px] font-semibold">Ads paused · {live.ends_at ? `ends ${new Date(live.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'until ended'}</span>
      </div>
    );
  }

  const menu = menus.find((m) => (m.screen_ids || []).includes(screen.id) && inWindow(m));
  if (menu) {
    const th = THEME[menu.theme] || THEME.night;
    const items = (menu.items || []).slice(0, 8);
    return (
      <div className="absolute inset-0 flex flex-col p-6 md:p-8" style={{ backgroundImage: th.bg, color: th.ink }}>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.2em]" style={{ color: th.accent }}>Menu</p>
            <p className="text-[28px] md:text-[34px] font-extrabold leading-none">{menu.name}</p>
          </div>
          {menu.name_ar && <p className="text-[24px] font-bold" dir="rtl" style={{ color: th.sub }}>{menu.name_ar}</p>}
        </div>
        <div className="mt-5 grid flex-1 content-start gap-x-8 gap-y-3 md:grid-cols-2">
          {items.map((it) => (
            <div key={it.id || it.name_en} className={`flex items-baseline gap-3 ${it.sold_out ? 'opacity-45' : ''}`}>
              <span className="text-[20px]">{it.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className={`block truncate text-[16px] md:text-[18px] font-bold ${it.sold_out ? 'line-through' : ''}`}>{it.name_en}</span>
                {it.name_ar && <span className="block truncate text-[12px]" dir="rtl" style={{ color: th.sub }}>{it.name_ar}</span>}
              </span>
              <span className="border-b border-dashed flex-1 max-w-[60px] opacity-30" style={{ borderColor: th.sub }} />
              <span className="text-end">
                {it.sold_out ? <span className="text-[12px] font-bold uppercase" style={{ color: th.accent }}>Sold out</span> : (
                  <>
                    {it.was_price > it.price && <span className="me-1.5 text-[12px] line-through" style={{ color: th.sub }}>{it.was_price}</span>}
                    <span className="text-[18px] font-extrabold" style={{ color: th.accent }}>{menu.currency || 'AED'} {it.price}</span>
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(140deg,#2a1470 0%,#140b3a 60%,#0d0a1f 100%)' }}>
      {photo && <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0a1f] via-transparent to-transparent" />
      <div className="absolute inset-x-6 bottom-6 text-white">
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#c4b5fd]">Now playing</p>
        <p className="text-[26px] font-extrabold">{screen.current_item || 'Your playlist'}</p>
      </div>
    </div>
  );
}
