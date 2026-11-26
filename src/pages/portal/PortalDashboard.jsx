import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MonitorPlay, Plus, Tag, Siren, UtensilsCrossed, ListVideo, QrCode, MessagesSquare, ChevronRight, WifiOff, Link2, ClipboardCheck, Store } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { usePortal } from '@/lib/PortalContext';
import { useOrgEntity } from '@/lib/useOrgEntity';
import { useSignedUrl } from '@/lib/portalData';
import ScreenTile from '@/components/portal/ScreenTile';
import SetupChecklist from '@/components/portal/SetupChecklist';
import AddScreenWizard from '@/components/portal/AddScreenWizard';
import { PageSkeleton } from '@/components/portal/Skeletons';
import { screenState } from './PortalScreens';
import { isLive } from './PortalUrgent';
import { ErrorState, SlowHint } from '@/components/states/StateViews';

function greeting() {
  const h = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', hour: 'numeric', hour12: false }).format(new Date()));
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function StoryRing({ screen, fallback }) {
  const snap = useSignedUrl(screen.last_snapshot_url || screen.screen_image_url || fallback);
  const st = screenState(screen);
  const ring = st === 'online' ? 'from-emerald-300 to-emerald-500' : st === 'offline' ? 'from-rose-400 to-pink-500' : 'from-amber-300 to-orange-400';
  return (
    <Link to={`/app/screens/${screen.id}`} className="group !flex !flex-col !justify-start items-center gap-2 w-[78px] shrink-0">
      <span className={`block rounded-full bg-gradient-to-br p-[3px] ${ring} transition group-hover:scale-105`}>
        <span className="block rounded-full bg-[#4c22d6] p-[3px]">
          <span className="flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-full bg-[#1b1147]">
            {snap ? <img src={snap} alt="" className="h-full w-full object-cover" /> : <MonitorPlay className="h-6 w-6 text-white/60" />}
          </span>
        </span>
      </span>
      <span className="w-full truncate text-center text-[12px] font-semibold text-white">{screen.name}</span>
    </Link>
  );
}

function monthEarnings(bookings) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const overlaps = (b, from, to) => {
    const s = b.start_date ? new Date(b.start_date) : null;
    const e = b.end_date ? new Date(b.end_date) : s;
    return s && e && s < to && e >= from;
  };
  const counted = bookings.filter((b) => ['active', 'completed'].includes(b.status));
  const sum = (list) => list.reduce((t, b) => t + (Number(b.venue_earnings) || 0), 0);
  const thisMonth = sum(counted.filter((b) => overlaps(b, start, new Date(now.getFullYear(), now.getMonth() + 1, 1))));
  const lastMonth = sum(counted.filter((b) => overlaps(b, prevStart, start)));
  const change = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null;
  return { thisMonth, change };
}

export default function PortalDashboard() {
  const { user } = useAuth();
  const { org, venues, screens, loadingData, dataError, reload, preview } = usePortal();
  const urgent = useOrgEntity('UrgentMessage', { limit: 20 });
  const chat = useOrgEntity('TeamMessage', { limit: 100 });
  const qr = useOrgEntity('QRCode');
  const bookings = useOrgEntity('AdBooking', { limit: 200 });
  const menuBoards = useOrgEntity('MenuBoard', { limit: 50 });
  const [addOpen, setAddOpen] = useState(false);

  if ((loadingData || preview === 'loading') && !screens.length && !venues.length) return <div><SlowHint loading forced={preview === 'slow'} /><PageSkeleton /></div>;
  if (dataError && !screens.length && !venues.length) return <ErrorState error={dataError} action="load your dashboard" onRetry={reload} />;

  const online = screens.filter((s) => screenState(s) === 'online').length;
  const liveMsgs = urgent.items.filter(isLive);
  const pendingOk = chat.items.filter((m) => m.kind === 'approval' && m.approval_status === 'pending');
  const scans = qr.items.reduce((s, q) => s + (q.scans || 0), 0);
  const rawName = (user?.full_name || '').trim();
  const first = rawName && !/[+@]/.test(rawName) ? rawName.split(' ')[0] : '';
  const earn = monthEarnings(bookings.items);
  const pendingAds = bookings.items.filter((b) => b.creative_status === 'pending_review' && b.status !== 'cancelled').length;
  const venueImg = venues.find((v) => v.image_url)?.image_url;

  const needs = [
    ...screens.filter((s) => screenState(s) === 'offline').map((s) => ({ id: `o${s.id}`, icon: WifiOff, tone: 'text-rose-600 bg-rose-50', title: `${s.name} is offline`, sub: 'Check power and Wi-Fi', to: `/app/screens/${s.id}` })),
    ...screens.filter((s) => screenState(s) === 'unpaired').map((s) => ({ id: `u${s.id}`, icon: Link2, tone: 'text-amber-700 bg-amber-50', title: `${s.name} isn't paired`, sub: `Type code ${s.pairing_code || ''} on the TV`, to: `/app/screens/${s.id}` })),
    ...pendingOk.map((m) => ({ id: `a${m.id}`, icon: ClipboardCheck, tone: 'text-bw-coral bg-bw-lav', title: m.approval_title || 'Approval needed', sub: `${m.sender_name} is waiting for your OK`, to: '/app/chat' })),
    ...venues.filter((v) => v.approval_status === 'pending').map((v) => ({ id: `v${v.id}`, icon: Store, tone: 'text-amber-700 bg-amber-50', title: `${v.name} is in review`, sub: 'Usually under 24 hours', to: '/app/venues' })),
  ];

  const actions = [
    ['/app/menus', UtensilsCrossed, 'Menu editor', 'bg-emerald-50 text-emerald-600'],
    ['/app/urgent', Siren, 'Message', 'bg-rose-50 text-rose-600'],
    ['/app/playlists', ListVideo, 'Playlists', 'bg-bw-lav text-bw-coral'],
    ['/app/menus', Tag, 'Prices', 'bg-violet-50 text-violet-600'],
    ['/app/qr', QrCode, 'QR codes', 'bg-sky-50 text-sky-600'],
    ['/app/chat', MessagesSquare, 'Team chat', 'bg-amber-50 text-amber-600'],
  ];

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-[30px] p-6 md:p-8 text-white shadow-[0_30px_70px_-30px_rgba(60,20,180,0.6)]" style={{ backgroundImage: 'linear-gradient(140deg,#6f3ffd 0%,#4c22d6 45%,#2e1594 100%)' }}>
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -left-20 -bottom-28 h-64 w-64 rounded-full bg-white/[0.06]" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[15px] text-white/80">{greeting()}{first ? `, ${first}` : ''}</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <p className="text-[38px] md:text-[46px] font-extrabold leading-none tracking-[-1.5px]">AED {earn.thisMonth.toLocaleString('en-AE', { maximumFractionDigits: 0 })}</p>
              {earn.change !== null && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[13px] font-bold text-[#5a2ded]">{earn.change >= 0 ? '▲' : '▼'} {Math.abs(earn.change)}%</span>
              )}
            </div>
            <p className="mt-2 text-[14px] text-white/80">earned from ad bookings this month · <span className="font-semibold text-white">{online} of {screens.length} screens live</span></p>
          </div>

          <div className="flex items-stretch gap-2.5">
            <Link to="/app/ad-requests" className="!flex !flex-col !items-start min-w-[112px] rounded-2xl bg-white/12 px-4 py-3 ring-1 ring-white/15 backdrop-blur hover:bg-white/20" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <span className="text-[24px] font-bold leading-none">{pendingAds}</span>
              <span className="mt-1.5 text-[12px] text-white/80">ads to review</span>
            </Link>
            <Link to="/app/chat" className="!flex !flex-col !items-start min-w-[112px] rounded-2xl px-4 py-3 ring-1 ring-white/15 hover:bg-white/20" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <span className="text-[24px] font-bold leading-none">{pendingOk.length}</span>
              <span className="mt-1.5 text-[12px] text-white/80">team requests</span>
            </Link>
            <Link to="/app/urgent" className="!flex !flex-col !items-start min-w-[112px] rounded-2xl px-4 py-3 ring-1 ring-white/15 hover:bg-white/20" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <span className="text-[24px] font-bold leading-none">{liveMsgs.length}</span>
              <span className="mt-1.5 text-[12px] text-white/80">live messages</span>
            </Link>
          </div>
        </div>

        {screens.length > 0 && (
          <div className="relative mt-7">
            <p className="mb-3 text-[14px] font-semibold text-white/85">Your screens</p>
            <div className="flex gap-4 overflow-x-auto pb-1">
              {screens.slice(0, 12).map((s) => <StoryRing key={s.id} screen={s} fallback={venues.find((v) => v.id === s.venue_id)?.image_url || venueImg} />)}
              <button type="button" onClick={() => setAddOpen(true)} className="!flex !flex-col !justify-start items-center gap-2 w-[78px] shrink-0">
                <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-dashed border-white/50 hover:border-white"><Plus className="h-6 w-6" /></span>
                <span className="text-[12px] font-semibold text-white/90">Add</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {liveMsgs.length > 0 && (
        <Link to="/app/urgent" className="!justify-start flex items-center gap-3 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3">
          <Siren className="h-4 w-4 text-rose-600" />
          <span className="flex-1 text-[13px] font-semibold text-rose-700">Live now: {liveMsgs[0].text_en} on {(liveMsgs[0].screen_ids || []).length} screens</span>
          <ChevronRight className="h-4 w-4 text-rose-400" />
        </Link>
      )}

      <div className="grid lg:grid-cols-[1fr_340px] gap-5">
        <div className="space-y-5">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {actions.map(([to, Icon, label, tone]) => (
              <Link key={label} to={to} className="!flex-col !justify-center gap-2 bw-card p-3.5 hover:-translate-y-0.5 transition">
                <span className={`h-10 w-10 rounded-xl flex items-center justify-center ${tone}`}><Icon className="h-5 w-5" /></span>
                <span className="text-[12px] font-semibold text-bw-navy text-center">{label}</span>
              </Link>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-bold text-bw-navy">Your screens</h2>
              <Link to="/app/screens" className="text-[12px] font-semibold text-bw-coral">See all</Link>
            </div>
            {screens.length === 0 ? (
              <div className="bw-card p-8 text-center">
                <MonitorPlay className="h-8 w-8 mx-auto text-bw-coral" />
                <p className="mt-2 text-[14px] font-semibold text-bw-navy">Pair your first TV</p>
                <button type="button" className="mt-3 bw-btn bw-btn-primary" onClick={() => setAddOpen(true)} disabled={!venues.length}><Plus className="h-4 w-4" />Add screen</button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {screens.slice(0, 4).map((s) => <ScreenTile key={s.id} screen={s} venueName={venues.find((v) => v.id === s.venue_id)?.name} fallbackImage={venues.find((v) => v.id === s.venue_id)?.image_url} menus={menuBoards.items} urgent={urgent.items} />)}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="bw-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-bold text-bw-navy">Needs you</p>
              <span className="bw-chip bg-amber-50 text-amber-700">{needs.length}</span>
            </div>
            {needs.length === 0 ? <p className="mt-3 text-[13px] text-bw-muted">All good — nothing needs you right now.</p> : (
              <div className="mt-2 space-y-1">
                {needs.slice(0, 6).map((n) => {
                  const Icon = n.icon;
                  return (
                    <Link key={n.id} to={n.to} className="!justify-start flex items-center gap-3 rounded-xl p-2 hover:bg-bw-cream">
                      <span className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center ${n.tone}`}><Icon className="h-4 w-4" /></span>
                      <span className="flex-1 min-w-0"><span className="block text-[13px] font-semibold text-bw-navy truncate">{n.title}</span><span className="block text-[11px] text-bw-muted truncate">{n.sub}</span></span>
                      <ChevronRight className="h-4 w-4 text-bw-muted" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
          <SetupChecklist org={org} venues={venues} screens={screens} />
        </div>
      </div>

      <AddScreenWizard open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
