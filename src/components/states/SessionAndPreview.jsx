import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LockKeyhole, Eye } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { PREVIEW_STATES } from '@/lib/states';

/** Session expired: explain, keep their work (drafts are on the device), sign in, come back here. */
export function SessionExpiredDialog({ forced = false }) {
  const { navigateToLogin } = useAuth();
  const [open, setOpen] = useState(forced);
  useEffect(() => {
    const on = () => setOpen(true);
    window.addEventListener('bw:session-expired', on);
    return () => window.removeEventListener('bw:session-expired', on);
  }, []);
  useEffect(() => { if (forced) setOpen(true); }, [forced]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
      <div className="bw-card p-6 max-w-sm text-center">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-bw-lav flex items-center justify-center"><LockKeyhole className="h-6 w-6 text-bw-coral" /></div>
        <p className="mt-3 text-[17px] font-bold text-bw-navy">Your session expired</p>
        <p className="mt-1 text-[13px] text-bw-muted">For your security we signed you out. Everything you typed is saved on this device — sign in and you'll land right back here.</p>
        <button type="button" className="mt-4 bw-btn bw-btn-primary w-full" onClick={() => navigateToLogin()}>Sign in again</button>
        {forced && <button type="button" className="mt-2 !min-h-0 text-[12px] text-bw-muted" onClick={() => setOpen(false)}>Close preview</button>}
      </div>
    </div>
  );
}

/** Admin-only chip to preview every state on the current page. */
export function PreviewSwitcher({ user, current }) {
  const location = useLocation();
  const navigate = useNavigate();
  if (!user || user.role !== 'admin') return null;
  const go = (s) => {
    const p = new URLSearchParams(location.search);
    if (s) p.set('state', s); else p.delete('state');
    navigate({ pathname: location.pathname, search: p.toString() ? `?${p}` : '' }, { replace: true });
    if (s === 'offline' || current === 'offline') setTimeout(() => window.location.reload(), 50);
  };
  return (
    <div className="fixed bottom-24 md:bottom-4 end-4 z-50 flex items-center gap-1 rounded-full bg-bw-navy/95 p-1 shadow-xl">
      <span className="flex items-center gap-1 ps-2 pe-1 text-[11px] font-semibold text-white/70"><Eye className="h-3.5 w-3.5" />State</span>
      {[null, ...PREVIEW_STATES].map((s) => (
        <button key={s || 'live'} type="button" onClick={() => go(s)}
          className={`!min-h-0 !min-w-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${current === s || (!current && !s) ? 'bg-white text-bw-navy' : 'text-white/80 hover:text-white'}`}>
          {s || 'live'}
        </button>
      ))}
    </div>
  );
}
