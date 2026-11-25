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
  const [open, setOpen] = useState(() => { try { return localStorage.getItem('bw_state_tool') === '1'; } catch (e) { return false; } });
  const setOpenSaved = (v) => { setOpen(v); try { localStorage.setItem('bw_state_tool', v ? '1' : '0'); } catch (e) { /* ignore */ } };
  if (!user || user.role !== 'admin') return null;
  const go = (s) => {
    const p = new URLSearchParams(location.search);
    if (s) p.set('state', s); else p.delete('state');
    navigate({ pathname: location.pathname, search: p.toString() ? `?${p}` : '' }, { replace: true });
    if (s === 'offline' || current === 'offline') setTimeout(() => window.location.reload(), 50);
  };
  if (!open && !current) {
    return (
      <button type="button" title="Admin tool: preview empty, loading, error, offline… states on this page" onClick={() => setOpenSaved(true)}
        className="!min-h-0 !min-w-0 fixed bottom-24 md:bottom-4 end-4 z-50 flex items-center gap-1.5 rounded-full bg-bw-navy/90 px-3 py-1.5 text-[11px] font-semibold text-white/80 shadow-lg hover:text-white">
        <Eye className="h-3.5 w-3.5" />Test states
      </button>
    );
  }
  return (
    <div className="fixed bottom-24 md:bottom-4 end-4 z-50 flex flex-wrap items-center gap-1 rounded-full bg-bw-navy/95 p-1 shadow-xl max-w-[calc(100vw-2rem)]">
      <span className="flex items-center gap-1 ps-2 pe-1 text-[11px] font-semibold text-white/70" title="Admin only — shows how this page looks in each state. Customers never see this."><Eye className="h-3.5 w-3.5" />Preview state</span>
      {[null, ...PREVIEW_STATES].map((s) => (
        <button key={s || 'live'} type="button" onClick={() => go(s)}
          className={`!min-h-0 !min-w-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${current === s || (!current && !s) ? 'bg-white text-bw-navy' : 'text-white/80 hover:text-white'}`}>
          {s || 'live'}
        </button>
      ))}
      <button type="button" title="Hide" onClick={() => { go(null); setOpenSaved(false); }} className="!min-h-0 !min-w-0 rounded-full px-2 py-1 text-[11px] text-white/60 hover:text-white">✕</button>
    </div>
  );
}
          className={`!min-h-0 !min-w-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${current === s || (!current && !s) ? 'bg-white text-bw-navy' : 'text-white/80 hover:text-white'}`}>
          {s || 'live'}
        </button>
      ))}
    </div>
  );
}
