import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { LayoutDashboard, Store, MonitorPlay, LogOut, Menu, X, Megaphone } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { PortalProvider, usePortal } from '@/lib/PortalContext';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import LanguageToggle from './LanguageToggle';
import BusinessSwitcher from './BusinessSwitcher';
import ModeToggle from './ModeToggle';
import StatusScreen from './StatusScreen';

const MODE_KEY = 'bw_mode';

function BrandMark() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-9 w-9 rounded-xl bg-bw-coral flex items-center justify-center">
        <span className="h-3.5 w-3.5 rounded-sm bg-white" />
      </span>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-white">Beyond Walls</p>
        <p className="text-[11px] text-white/50">Portal</p>
      </div>
    </div>
  );
}

function PortalShell() {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const { loading, orgs, org, selectOrg, reload } = usePortal();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mode, setMode] = useState(() => {
    try { return localStorage.getItem(MODE_KEY) || 'screens'; } catch (e) { return 'screens'; }
  });

  useEffect(() => {
    try { localStorage.setItem(MODE_KEY, mode); } catch (e) { /* storage unavailable */ }
  }, [mode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bw-cream flex">
        <div className="hidden md:block w-64 bg-bw-navy" />
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

  const navItems = [
    { to: '/app', label: t('nav.dashboard'), icon: LayoutDashboard, end: true },
    { to: '/app/venues', label: t('nav.venues'), icon: Store, end: false },
    { to: '/app/screens', label: t('nav.screens'), icon: MonitorPlay, end: false },
  ];

  const requestAdvertising = async () => {
    if (!org) return;
    await base44.entities.Organization.update(org.id, { advertiser_status: 'requested' });
    reload();
  };

  const sidebar = (
    <div className="h-full flex flex-col bg-bw-navy">
      <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
        <BrandMark />
        <button type="button" onClick={() => setMobileOpen(false)} className="md:hidden text-white/60 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`h-4 w-4 ${isActive ? 'text-bw-coral' : ''}`} />
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-3 pb-4 pt-2 border-t border-white/10">
        <div className="px-3 py-2">
          <p className="text-sm text-white/80 truncate">{user?.full_name || user?.email}</p>
          <p className="text-[11px] text-white/40 truncate">{org?.name}</p>
        </div>
        <button
          type="button"
          onClick={() => logout(true)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5"
        >
          <LogOut className="h-4 w-4" />
          {t('nav.signOut')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bw-cream">
      <aside className="hidden md:flex md:flex-col fixed inset-y-0 left-0 w-64 z-40">{sidebar}</aside>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72">{sidebar}</div>
        </div>
      )}

      <div className="md:pl-64">
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-bw-line flex items-center gap-3 px-4 md:px-8">
          <button type="button" onClick={() => setMobileOpen(true)} className="md:hidden text-bw-navy">
            <Menu className="h-5 w-5" />
          </button>

          <BusinessSwitcher orgs={orgs} org={org} onSelect={selectOrg} />

          <div className="flex-1" />

          <ModeToggle org={org} mode={mode} onMode={setMode} onRequest={requestAdvertising} />
          <LanguageToggle />
        </header>

        <main className="p-4 md:p-8 max-w-7xl">
          {mode === 'advertise' ? (
            <div className="rounded-3xl border border-bw-line bg-white p-10 text-center">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-bw-cream flex items-center justify-center">
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