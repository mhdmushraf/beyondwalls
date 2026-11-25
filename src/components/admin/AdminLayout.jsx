import { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, MonitorPlay, Wrench, LifeBuoy, Target, Receipt, Settings, LogOut, Store, Menu, X, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { readPreviewState, applyPreviewState, isOnline, notifyError } from '@/lib/states';
import { OfflineBanner } from '@/components/states/StateViews';
import { SessionExpiredDialog, PreviewSwitcher } from '@/components/states/SessionAndPreview';

const readCache = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
const writeCache = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* full */ } };

/** Admin-wide list loader (admins can read every business through RLS). Cached for offline, with error + preview states. */
export function useAdminList(entityName, { sort = '-created_date', limit = 500, poll = 0, query = null } = {}) {
  const { user } = useAuth();
  const preview = readPreviewState(user);
  const qk = JSON.stringify(query || {});
  const cacheKey = `bw_cache:admin:${entityName}:${sort}:${qk}`;
  const [items, setItems] = useState(() => readCache(cacheKey) || []);
  const [loading, setLoading] = useState(() => !readCache(cacheKey));
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  useEffect(() => {
    let alive = true;
    if (!isOnline()) { setLoading(false); return () => { alive = false; }; }
    const run = query ? base44.entities[entityName].filter(query, { sort, limit }) : base44.entities[entityName].list({ sort, limit });
    run.then((page) => {
      if (!alive) return;
      const list = page.items || page || [];
      setItems(list); setError(null); setLoading(false);
      if (list.length <= 300) writeCache(cacheKey, list);
    }).catch((e) => {
      if (!alive) return;
      setError(e); setLoading(false);
      if (e?.response?.status === 401) window.dispatchEvent(new Event('bw:session-expired'));
    });
    return () => { alive = false; };
  }, [entityName, sort, limit, tick, qk]); // eslint-disable-line
  useEffect(() => {
    window.addEventListener('online', reload);
    return () => window.removeEventListener('online', reload);
  }, [reload]);
  useEffect(() => {
    if (!poll) return undefined;
    const id = setInterval(reload, poll);
    return () => clearInterval(id);
  }, [poll, reload]);
  // Mutations show a friendly error (with Try again) and rethrow so callers skip their success toast.
  const guard = (action, fn) => async (...args) => {
    try { return await fn(...args); } catch (e) {
      notifyError(e, action, () => guard(action, fn)(...args).catch(() => {}));
      throw e;
    }
  };
  const update = useCallback(guard('save the change', async (id, data) => {
    await base44.entities[entityName].update(id, data);
    setItems((l) => l.map((i) => (i.id === id ? { ...i, ...data } : i)));
  }), [entityName]); // eslint-disable-line
  const create = useCallback(guard('create it', async (data) => {
    const rec = await base44.entities[entityName].create(data);
    setItems((l) => [rec, ...l]);
    return rec;
  }), [entityName]); // eslint-disable-line
  const remove = useCallback(guard('delete it', async (id) => {
    await base44.entities[entityName].delete(id);
    setItems((l) => l.filter((i) => i.id !== id));
  }), [entityName]); // eslint-disable-line
  if (preview === 'empty') return { items: [], loading: false, error: null, reload, update, create, remove, preview };
  if (preview === 'loading') return { items: [], loading: true, error: null, reload, update, create, remove, preview };
  if (preview === 'error') return { items: [], loading: false, error: { response: { status: 500 } }, reload, update, create, remove, preview };
  return { items, loading, error, reload, update, create, remove, preview };
}

const NAV = [
  ['/admin', LayoutDashboard, 'Overview', true],
  ['/admin/approvals', ShieldCheck, 'Approvals'],
  ['/admin/screens', MonitorPlay, 'Screen wall'],
  ['/admin/installs', Wrench, 'Installs'],
  ['/admin/support', LifeBuoy, 'Users & support'],
  ['/admin/leads', Target, 'Leads'],
  ['/admin/marketplace', Store, 'Marketplace'],
  ['/admin/billing', Receipt, 'Billing & invoices'],
  ['/admin/settings', Settings, 'Prices & shares'],
];

export default function AdminLayout() {
  const { user, isLoadingAuth, navigateToLogin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const preview = readPreviewState(user);
  useEffect(() => { applyPreviewState(preview); }, [preview]);

  useEffect(() => { if (!isLoadingAuth && !user) navigateToLogin(); }, [isLoadingAuth, user, navigateToLogin]);
  if (isLoadingAuth || !user) return <div className="min-h-screen bg-bw-cream" />;
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-bw-cream flex items-center justify-center p-6">
        <div className="bw-card p-8 text-center max-w-md">
          <ShieldCheck className="mx-auto h-8 w-8 text-bw-muted" />
          <p className="mt-3 text-sm text-bw-navy">This area is for the Beyond Walls team.</p>
          <Link to="/app" className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold text-bw-coral"><ArrowLeft className="h-4 w-4" />Back to portal</Link>
        </div>
      </div>
    );
  }

  const side = (
    <div className="h-full flex flex-col bg-bw-navy text-white">
      <div className="h-16 flex items-center justify-between px-5">
        <div className="flex items-center gap-2.5">
          <span className="h-9 w-9 rounded-xl bw-grad flex items-center justify-center"><MonitorPlay className="h-[18px] w-[18px]" /></span>
          <div className="leading-tight"><p className="text-[15px] font-bold">BeyondWalls</p><p className="text-[11px] text-white/50">HQ · Admin</p></div>
        </div>
        <button type="button" className="md:hidden !min-h-0 text-white/60" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {NAV.map(([to, Icon, label, end]) => (
          <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
            className={({ isActive }) => `!justify-start flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium ${isActive ? 'bg-white/12 bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
            <Icon className="h-4 w-4" />{label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-white/10">
        <Link to="/app" className="!justify-start flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-white/60 hover:text-white"><ArrowLeft className="h-4 w-4" />Venue portal</Link>
        <button type="button" onClick={() => logout(true)} className="!justify-start flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-white/60 hover:text-white"><LogOut className="h-4 w-4" />Sign out</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bw-cream">
      <aside className="hidden md:block fixed inset-y-0 start-0 w-60 z-40">{side}</aside>
      {open && <div className="md:hidden fixed inset-0 z-50"><div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} /><div className="absolute inset-y-0 start-0 w-64">{side}</div></div>}
      <div className="md:ps-60">
        <header className="md:hidden h-14 bg-white border-b border-bw-line flex items-center gap-3 px-4">
          <button type="button" className="!min-h-0" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
          <p className="font-bold text-bw-navy">Beyond Walls HQ</p>
        </header>
        <OfflineBanner />
        <SessionExpiredDialog forced={preview === 'expired'} />
        <PreviewSwitcher user={user} current={preview} />
        <main className="p-4 md:p-8 max-w-[1300px]"><Outlet /></main>
      </div>
    </div>
  );
}
