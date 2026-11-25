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

function greeting() {
  const h = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', hour: 'numeric', hour12: false }).format(new Date()));
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function StoryRing({ screen }) {
  const snap = useSignedUrl(screen.last_snapshot_url || screen.screen_image_url);
  const st = screenState(screen);
  const ring = st === 'online' ? 'from-emerald-400 to-emerald-600' : st === 'offline' ? 'from-rose-400 to-rose-600' : 'from-amber-300 to-amber-500';
  return (
    <Link to={`/app/screens/${screen.id}`} className="!flex-col !justify-start items-center gap-1.5 w-[72px] shrink-0">
      <span className={`p-[3px] rounded-full bg-gradient-to-br ${ring}`}>
        <span className="block h-[62px] w-[62px] rounded-full border-[3px] border-white overflow-hidden bg-bw-navy">
          {snap ? <img src={snap} alt="" className="h-full w-full object-cover" /> : <MonitorPlay className="h-6 w-6 text-white/50 m-[16px]" />}
        </span>
      </span>
      <span className="text-[11px] font-semibold text-white/90 truncate w-full text-center">{screen.name}</span>
    </Link>
  );
}

export default function PortalDashboard() {
  const { user } = useAuth();
  const { org, venues, screens, loadingData } = usePortal();
  const urgent = useOrgEntity('UrgentMessage', { limit: 20 });
  const chat = useOrgEntity('TeamMessage', { limit: 100 });
  const qr = useOrgEntity('QRCode');
  const [addOpen, setAddOpen] = useState(false);

  if (loadingData && !screens.length && !venues.length) return <PageSkeleton />;

  const online = screens.filter((s) => screenState(s) === 'online').length;
  const liveMsgs = urgent.items.filter(isLive);
  const pendingOk = chat.items.filter((m) => m.kind === 'approval' && m.approval_status === 'pending');
  const scans = qr.items.reduce((s, q) => s + (q.scans || 0), 0);
  const first = (user?.full_name || '').split(' ')[0];

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
      <div className="rounded-[28px] bw-grad p-5 md:p-7 text-white relative overflow-hidden">
        <div className="absolute -top-16 -end-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-white/80 text-[14px]">{greeting()}{first ? `, ${first}` : ''}</p>
            <h1 className="text-[28px] md:text-[34px] font-bold leading-tight">{online} of {screens.length} screens live</h1>
            <p className="text-white/70 text-[13px]">{org?.name} · {venues.length} {venues.length === 1 ? 'venue' : 'venues'}</p>
          </div>
          <div className="flex gap-3">
            {[[liveMsgs.length, 'live messages'], [scans, 'QR scans'], [pendingOk.length, 'waiting']].map(([v, l]) => (
              <div key={l} className="rounded-2xl bg-white/15 px-4 py-2.5 text-center"><p className="text-[22px] font-bold">{v}</p><p className="text-[11px] text-white/80">{l}</p></div>
            ))}
          </div>
        </div>
        {screens.length > 0 && (
          <div className="relative mt-5 flex gap-3 overflow-x-auto pb-1">
            {screens.slice(0, 12).map((s) => <StoryRing key={s.id} screen={s} />)}
            <button type="button" onClick={() => setAddOpen(true)} className="!flex-col !justify-start items-center gap-1.5 w-[72px] shrink-0">
              <span className="h-[68px] w-[68px] rounded-full border-2 border-dashed border-white/60 flex items-center justify-center"><Plus className="h-6 w-6" /></span>
              <span className="text-[11px] font-semibold text-white/90">Add</span>
            </button>
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
                {screens.slice(0, 4).map((s) => <ScreenTile key={s.id} screen={s} venueName={venues.find((v) => v.id === s.venue_id)?.name} />)}
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
