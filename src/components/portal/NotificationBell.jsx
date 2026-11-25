import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, WifiOff, Megaphone, Wallet, CreditCard, Check, X as XIcon, Info } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { timeAgo } from '@/lib/portalData';
import { isOnline } from '@/lib/states';

const ICON = {
  screen_offline: [WifiOff, 'bg-rose-50 text-rose-600'],
  ad_review: [Megaphone, 'bg-amber-50 text-amber-700'],
  new_booking: [Megaphone, 'bg-bw-lav text-bw-coral'],
  ad_approved: [Check, 'bg-emerald-50 text-emerald-600'],
  ad_rejected: [XIcon, 'bg-rose-50 text-rose-600'],
  payment_received: [CreditCard, 'bg-emerald-50 text-emerald-600'],
  payout_processed: [Wallet, 'bg-emerald-50 text-emerald-600'],
  payout_requested: [Wallet, 'bg-amber-50 text-amber-700'],
};

/** Bell in the top bar: the signed-in user's notifications, polled every 30 s. */
export default function NotificationBell({ user, extraDot = false }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const box = useRef(null);

  const load = useCallback(async () => {
    if (!user?.id || !isOnline()) return;
    try {
      const page = await base44.entities.Notification.filter({ recipient_user_id: user.id }, { sort: '-created_date', limit: 30 });
      setItems(page.items || page || []); setFailed(false);
    } catch (e) { setFailed(true); } finally { setLoaded(true); }
  }, [user?.id]);

  useEffect(() => { load(); const id = setInterval(load, 30000); return () => clearInterval(id); }, [load]);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const unread = items.filter((n) => !n.is_read);
  const markAll = async () => {
    setItems((l) => l.map((n) => ({ ...n, is_read: true })));
    for (const n of unread) base44.entities.Notification.update(n.id, { is_read: true }).catch(() => {});
  };
  const go = (n) => {
    setOpen(false);
    if (!n.is_read) { setItems((l) => l.map((x) => (x.id === n.id ? { ...x, is_read: true } : x))); base44.entities.Notification.update(n.id, { is_read: true }).catch(() => {}); }
    if (n.link) navigate(n.link);
  };

  return (
    <div className="relative" ref={box}>
      <button type="button" aria-label="Notifications" onClick={() => { setOpen((v) => !v); if (!open) load(); }} className="relative h-9 w-9 rounded-xl border border-bw-line bg-white flex items-center justify-center text-bw-navy">
        <Bell className="h-4 w-4" />
        {unread.length > 0 ? <span className="absolute -top-1 -end-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">{unread.length > 9 ? '9+' : unread.length}</span>
          : extraDot && <span className="absolute top-1.5 end-1.5 h-2 w-2 rounded-full bg-rose-500" />}
      </button>
      {open && (
        <div className="absolute end-0 mt-2 w-[340px] max-w-[calc(100vw-24px)] rounded-2xl border border-bw-line bg-white shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-bw-line">
            <p className="text-[14px] font-bold text-bw-navy">Notifications</p>
            {unread.length > 0 && <button type="button" className="!min-h-0 text-[12px] font-semibold text-bw-coral flex items-center gap-1" onClick={markAll}><CheckCheck className="h-3.5 w-3.5" />Mark all read</button>}
          </div>
          <div className="max-h-[420px] overflow-auto">
            {!loaded ? (
              <div className="p-4 space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-12 rounded-xl bg-bw-cream animate-pulse" />)}</div>
            ) : failed && !items.length ? (
              <div className="p-6 text-center"><p className="text-[13px] font-semibold text-bw-navy">Couldn't load notifications</p><button type="button" className="mt-2 bw-btn bw-btn-ghost !py-1.5" onClick={load}>Try again</button></div>
            ) : items.length === 0 ? (
              <div className="p-8 text-center"><Info className="mx-auto h-6 w-6 text-bw-muted" /><p className="mt-2 text-[13px] font-semibold text-bw-navy">You're all caught up</p><p className="text-[12px] text-bw-muted">Offline screens, new ad bookings and payments show up here.</p></div>
            ) : items.map((n) => {
              const [Icon, tone] = ICON[n.type] || [Info, 'bg-bw-cream text-bw-muted'];
              return (
                <button key={n.id} type="button" onClick={() => go(n)} className={`!min-h-0 !justify-start w-full text-start flex gap-3 px-4 py-3 border-b border-bw-line last:border-0 hover:bg-bw-cream ${n.is_read ? '' : 'bg-bw-lav/40'}`}>
                  <span className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center ${tone}`}><Icon className="h-4 w-4" /></span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] font-semibold text-bw-navy">{n.title}</span>
                    <span className="block text-[12px] text-bw-muted line-clamp-2">{n.message}</span>
                    <span className="block text-[11px] text-bw-muted mt-0.5">{timeAgo(n.created_date)}</span>
                  </span>
                  {!n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-bw-violet" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
