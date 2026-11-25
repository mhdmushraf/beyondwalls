import { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, MonitorPlay, Wrench, LifeBuoy, Target, Receipt, Settings, LogOut, Menu, X, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

/** Admin-wide list loader (admins can read every business through RLS). */
export function useAdminList(entityName, { sort = '-created_date', limit = 500, poll = 0, query = null } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  const qk = JSON.stringify(query || {});
  useEffect(() => {
    let alive = true;
    const run = query ? base44.entities[entityName].filter(query, { sort, limit }) : base44.entities[entityName].list({ sort, limit });
    run.then((page) => { if (alive) { setItems(page.items || page || []); setLoading(false); } })
      .catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [entityName, sort, limit, tick, qk]); // eslint-disable-line
  useEffect(() => {
    if (!poll) return undefined;
    const id = setInterval(reload, poll);
    return () => clearInterval(id);
  }, [poll, reload]);
  const update = useCallback(async (id, data) => {
    await base44.entities[entityName].update(id, data);
    setItems((l) => l.map((i) => (i.id === id ? { ...i, ...data } : i)));
  }, [entityName]);
  const create = useCallback(async (data) => {
    const rec = await base44.entities[entityName].create(data);
    setItems((l) => [rec, ...l]);
    return rec;
  }, [entityName]);
  const remove = useCallback(async (id) => {
    await base44.entities[entityName].delete(id);
    setItems((l) => l.filter((i) => i.id !== id));
  }, [entityName]);
  return { items, loading, reload, update, create, remove };
}

const NAV = [
  ['/admin', LayoutDashboard, 'Overview', true],
  ['/admin/approvals', ShieldCheck, 'Approvals'],
  ['/admin/screens', MonitorPlay, 'Screen wall'],
  ['/admin/installs', Wrench, 'Installs'],
  ['/admin/support', LifeBuoy, 'Users & support'],
  ['/admin/leads', Target, 'Leads'],
  ['/admin/billing', Receipt, 'Billing & invoices'],
  ['/admin/settings', Settings, 'Prices & shares'],
];

export default function AdminLayout() {
  const { user, isLoadingAuth, navigateToLogin, logout } = useAuth();
  const [open, setOpen] = useState(false);

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
        <main className="p-4 md:p-8 max-w-[1300px]"><Outlet /></main>
      </div>
    </div>
  );
}
