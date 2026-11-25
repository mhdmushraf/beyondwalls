import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { friendlyError } from '@/lib/states';
import { FieldError } from '@/components/states/StateViews';
import PublicFooter from '@/components/PublicFooter';

/**
 * Public account-deletion page (Google Play needs a web link; App Store needs in-app — the app calls the same function).
 * Signed in: delete now. Signed out: sign in first, then come back here.
 */
export default function DeleteAccount() {
  const { user, isLoadingAuth, logout } = useAuth();
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const run = async () => {
    if (confirm.trim().toUpperCase() !== 'DELETE') { setError('Type DELETE in capitals to confirm.'); return; }
    setBusy(true); setError('');
    try {
      await base44.functions.invoke('deleteAccount', { confirm: 'DELETE' });
      setDone(true);
      setTimeout(() => logout(false), 500);
    } catch (e) {
      const m = e?.response?.data?.error;
      if (m) setError(m); else { const f = friendlyError(e, 'delete your account'); setError(`${f.title}. ${f.fix || ''}`); }
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-bw-cream flex flex-col">
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bw-card w-full max-w-lg p-7">
          <span className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center"><Trash2 className="h-6 w-6 text-rose-600" /></span>
          <h1 className="mt-4 text-[24px] font-bold text-bw-navy">Delete your Beyond Walls account</h1>
          <div className="mt-3 space-y-2 text-[14px] text-bw-ink">
            <p><b>What we delete:</b> your login, name, email, phone notifications, and your access to every business on Beyond Walls.</p>
            <p><b>What we keep:</b> invoices and booking records the business must keep under UAE law (kept for 5 years, without your login). Screens, menus and media belong to the business and stay with its other team members.</p>
            <p>You can also delete your account in the Beyond Walls app: More → Delete account.</p>
          </div>

          {done ? (
            <div className="mt-6 rounded-2xl bg-emerald-50 p-4 flex gap-3"><Check className="h-5 w-5 text-emerald-600" /><p className="text-[14px] text-emerald-800">Your account is deleted. You've been signed out.</p></div>
          ) : isLoadingAuth ? (
            <div className="mt-6 h-12 rounded-xl bg-white animate-pulse" />
          ) : !user ? (
            <div className="mt-6 space-y-2">
              <p className="text-[13px] text-bw-muted">Sign in first so we know it's you, then you'll come back here.</p>
              <Link to="/login?next=/delete-account" className="bw-btn bw-btn-primary w-full">Sign in to continue</Link>
              <p className="text-[12px] text-bw-muted text-center">Can't sign in? WhatsApp us on +971 55 614 0067 from the number on the account and we'll delete it within 7 days.</p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              <p className="text-[13px] text-bw-muted">Signed in as <b className="text-bw-navy">{user.email}</b>. This can't be undone.</p>
              <label className="block">
                <span className="block text-[12px] font-semibold text-bw-ink mb-1.5">Type DELETE to confirm</span>
                <input className="bw-input" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" />
                <FieldError msg={error} />
              </label>
              <button type="button" className="bw-btn bw-btn-danger w-full" disabled={busy} onClick={run}>{busy ? 'Deleting…' : 'Delete my account permanently'}</button>
              <Link to="/app" className="bw-btn bw-btn-ghost w-full">Keep my account</Link>
            </div>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
