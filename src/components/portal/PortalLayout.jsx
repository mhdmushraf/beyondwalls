import { useEffect, useState } from 'react';
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Store, MonitorPlay, LogOut, Menu, X, Megaphone, Image as ImageIcon,
  UtensilsCrossed, ListVideo, Siren, MessagesSquare, Search, Bell, MessageCircle, MoreHorizontal, QrCode, Receipt, LifeBuoy, ShieldCheck,
, Megaphone, ShoppingBag, Inbox,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { PortalProvider, usePortal } from '@/lib/PortalContext';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import LanguageToggle from './LanguageToggle';
import BusinessSwitcher from './BusinessSwitcher';
import ModeToggle from './ModeToggle';
import StatusScreen from './StatusScreen';
import { OfflineBanner } from '@/components/states/StateViews';
import { SessionExpiredDialog, PreviewSwitcher } from '@/components/states/SessionAndPreview';

const MODE_KEY = 'bw_mode';

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-9 w-9 rounded-xl bw-grad flex items-center justify-center shadow-sm">
        <MonitorPlay className="h-4.5 w-4.5 text-white" style={{ width: 18, height: 18 }} />
      </span>
      <p className="text-[17px] font-bold text-bw-navy tracking-tight">BeyondWalls</p>
    </div>
  );
}

function useNavGroups(t) {
  return [
    {
      label: t('nav.group.overview', 'Overview'),
      items: [
        { to: '/app', label: t('nav.dashboard', 'Dashboard'), icon: LayoutDashboard, end: true },
        { to: '/app/venues', label: t('nav.venues', 'Venues'), icon: Store },
        { to: '/app/screens', label: t('nav.screens', 'Screens'), icon: MonitorPlay },
      ],
    },
    {
      label: t('nav.group.content', 'Content'),
      items: [
        { to: '/app/media', label: t('nav.media', 'Media library'), icon: ImageIcon },
        { to: '/app/menus', label: t('nav.menus', 'Menus & prices'), icon: UtensilsCrossed },
        { to: '/app/playlists', label: t('nav.playlists', 'Playlists & schedules'), icon: ListVideo },
        { to: '/app/qr', label: t('nav.qr', 'QR codes'), icon: QrCode },
        { to: '/app/urgent', label: t('nav.urgent', 'Urgent message'), icon: Siren },
      ],
    },
    {
      label: t('nav.group.marketplace', 'Marketplace'),
      items: [
        { to: '/app/ad-requests', label: t('nav.adRequests', 'Ad requests'), icon: Inbox },
        { to: '/app/marketplace', label: t('nav.bookScreens', 'Book screens'), icon: ShoppingBag },
        { to: '/app/campaigns', label: t('nav.campaigns', 'My campaigns'), icon: Megaphone },
      ],
    },
    {
      label: t('nav.group.team', 'Team'),
      items: [
        { to: '/app/chat', label: t('nav.chat', 'Team chat'), icon: MessagesSquare },
      ],
    },
    {
      label: t('nav.group.account', 'Account'),
      items: [
        { to: '/app/billing', label: t('nav.billing', 'Billing'), icon: Receipt },
        { to: '/app/support', label: t('nav.support', 'Help & support'), icon: LifeBuoy },
      ],
    },
  ];
}

function PortalShell() {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const { loading, orgs, org, selectOrg, reload, screens, preview } = usePortal();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mode, setMode] = useState(() => {
    try { return localStorage.getItem(MODE_KEY) || 'screens'; } catch (e) { return 'screens'; }
  });

  useEffect(() => {
    try { localStorage.setItem(MODE_KEY, mode); } catch (e) { /* storage unavailable */ }
  }, [mode]);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const groups = useNavGroups(t);

  if (loading) {
    return (
      <div className="min-h-screen bg-bw-cream flex">
        <div className="hidden md:block w-64 bg-white border-r border-bw-line" />
        <div className="flex-1">
          <div className="h-16 bg-white border-b border-bw-line" />
          <div className="p-8 space-y-4">
            <div className="bw-shimmer h-7 w-52 rounded-lg" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((i) => <div key={i} className="bw-shimmer h-24 rounded-2xl" />)}
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => <div key={i} className="bw-shimmer h-56 rounded-2xl" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!orgs.length) return <Navigate to="/onboarding" replace />;
  if (org && org.status !== 'approved') return <StatusScreen org={org} />;

  const requestAdvertising = async () => {
    if (!org) return;
    await base44.entities.Organization.update(org.id, { advertiser_status: 'requested' });
    reload();
  };

  const offline = screens.filter((s) => s.paired_device_id && !s.is_online).length;

  const sidebar = (
    <div className="h-full flex flex-col bg-white border-e border-bw-line">
      <div className="h-16 flex items-center justify-between px-5">
        <BrandMark />
        <button type="button" onClick={() => setMobileOpen(false)} className="md:hidden text-bw-muted hover:text-bw-navy">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-3 pb-2">
        <div className="rounded-2xl border-2 border-bw-violet/30 p-2.5">
          <BusinessSwitcher orgs={orgs} org={org} onSelect={selectOrg} />
        </div>
        <div className="mt-3">
          <ModeToggle org={org} mode={mode} onMode={setMode} onRequest={requestAdvertising} />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {groups.map((group) => (
          <div key={group.label} className="mb-3">
            <p className="px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-wider text-bw-muted/80">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center justify-start gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors ${
                        isActive ? 'bg-bw-lav text-bw-coral font-semibold' : 'text-bw-ink hover:bg-bw-cream'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1">{item.label}</span>
                    {item.to === '/app/screens' && screens.length > 0 && (
                      <span className={`bw-chip ${offline ? 'bg-rose-100 text-rose-600' : 'bw-grad text-white'}`}>{screens.length}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 pb-4 pt-2 space-y-2">
        {user?.role === 'admin' && (
          <NavLink to="/admin" className="!justify-start flex items-center gap-3 rounded-xl bg-bw-navy px-3 py-2.5 text-[13px] font-semibold text-white">
            <ShieldCheck className="h-4 w-4" />Beyond Walls HQ
          </NavLink>
        )}
        <a
          href="https://wa.me/971556140067"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-start gap-3 rounded-2xl bg-emerald-50 px-3 py-3"
        >
          <MessageCircle className="h-4 w-4 text-emerald-600" />
          <span className="leading-tight">
            <span className="block text-[13px] font-semibold text-bw-navy">{t('nav.help', 'Need help?')}</span>
            <span className="block text-[11px] text-bw-muted">{t('nav.helpSub', 'WhatsApp support · 9am–9pm')}</span>
          </span>
        </a>
        <button
          type="button"
          onClick={() => logout(true)}
          className="flex w-full items-center justify-start gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-bw-muted hover:text-bw-navy hover:bg-bw-cream"
        >
          <LogOut className="h-4 w-4" />
          {t('nav.signOut', 'Sign out')}
        </button>
      </div>
    </div>
  );

  const initial = (user?.full_name || user?.email || '?').trim().charAt(0).toUpperCase();

  const tabs = [
    { to: '/app', label: t('nav.home', 'Home'), icon: LayoutDashboard, end: true },
    { to: '/app/screens', label: t('nav.screens', 'Screens'), icon: MonitorPlay },
    { to: '/app/playlists', label: t('nav.content', 'Content'), icon: ListVideo },
    { to: '/app/chat', label: t('nav.chatShort', 'Team'), icon: MessagesSquare },
  ];

  return (
    <div className="min-h-screen bg-bw-cream">
      <aside className="hidden md:flex md:flex-col fixed inset-y-0 start-0 w-64 z-40">{sidebar}</aside>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 start-0 w-72 shadow-xl">{sidebar}</div>
        </div>
      )}

      <div className="md:ps-64">
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur border-b border-bw-line flex items-center gap-3 px-4 md:px-8">
          <button type="button" onClick={() => setMobileOpen(true)} className="md:hidden text-bw-navy">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden md:flex items-center gap-2 rounded-xl bg-bw-cream px-3 py-2 w-80 text-bw-muted">
            <Search className="h-4 w-4" />
            <span className="text-[13px]">{t('nav.search', 'Search screens, media, venues…')}</span>
          </div>
          <div className="md:hidden flex-1"><BrandMark /></div>
          <div className="flex-1 hidden md:block" />
          <LanguageToggle />
          <button type="button" className="relative h-9 w-9 rounded-xl border border-bw-line bg-white flex items-center justify-center text-bw-navy">
            <Bell className="h-4 w-4" />
            {offline > 0 && <span className="absolute top-1.5 end-1.5 h-2 w-2 rounded-full bg-rose-500" />}
          </button>
          <div className="hidden md:flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white text-sm font-semibold flex items-center justify-center">{initial}</span>
            <div className="leading-tight">
              <p className="text-[13px] font-semibold text-bw-navy">{user?.full_name || user?.email}</p>
              <p className="text-[11px] text-bw-muted">{t('nav.owner', 'Owner')}</p>
            </div>
          </div>
        </header>

        <OfflineBanner />
        <SessionExpiredDialog forced={preview === 'expired'} />
        <PreviewSwitcher user={user} current={preview} />
        <main className="p-4 md:p-8 pb-28 md:pb-8 max-w-[1240px]">
          {mode === 'advertise' ? (
            <div className="bw-card p-10 text-center">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-bw-lav flex items-center justify-center">
                <Megaphone className="h-6 w-6 text-bw-coral" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-bw-navy">{t('mode.advertise')}</h2>
              <p className="mt-2 text-sm text-bw-muted max-w-md mx-auto">{t('mode.advertiseSoon')}</p>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>

      {/* Mobile tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-bw-line pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink key={tab.to} to={tab.to} end={tab.end}
                className={({ isActive }) => `flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold ${isActive ? 'text-bw-coral' : 'text-bw-muted'}`}>
                <Icon className="h-5 w-5" />
                {tab.label}
              </NavLink>
            );
          })}
          <button type="button" onClick={() => setMobileOpen(true)} className="flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold text-bw-muted">
            <MoreHorizontal className="h-5 w-5" />
            {t('nav.more', 'More')}
          </button>
        </div>
      </nav>
    </div>
  );
}

export default function PortalLayout() {
  const { user, isLoadingAuth, navigateToLogin } = useAuth();

  useEffect(() => {
    if (!isLoadingAuth && !user) navigateToLogin();
  }, [isLoadingAuth, user, navigateToLogin]);

  if (isLoadingAuth) {
    return <div className="min-h-screen bg-bw-cream" />;
  }
  if (!user) return <div className="min-h-screen bg-bw-cream" />;

  return (
    <PortalProvider>
      <PortalShell />
    </PortalProvider>
  );
}
