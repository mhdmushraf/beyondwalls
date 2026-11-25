import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18n';
import AuthShell from '@/components/auth/AuthShell';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.4a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.6-5.2 3.6-8.8Z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.5 1.2-4 1.2a7 7 0 0 1-6.6-4.8H1.4v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.4 14.5a7.2 7.2 0 0 1 0-4.9V6.5H1.4a12 12 0 0 0 0 10.7l4-2.7Z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.5l4 3.1A7 7 0 0 1 12 4.8Z" />
    </svg>
  );
}

export default function Login() {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const next = new URLSearchParams(window.location.search).get('next') || '/app';

  useEffect(() => {
    if (isAuthenticated) navigate(next, { replace: true });
  }, [isAuthenticated, next, navigate]);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await base44.auth.loginViaEmailPassword(email.trim(), password);
      window.location.href = next;
    } catch (e) {
      setError('Email or password is incorrect.');
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <h2 className="text-2xl font-semibold text-bw-navy">{t('auth.signIn')}</h2>
      <p className="mt-1 text-sm text-bw-muted">{t('auth.noAccount')}{' '}
        <Link to="/signup" className="font-semibold text-bw-coral hover:underline">{t('auth.signUp')}</Link>
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">{t('auth.password')}</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-100 px-3 py-2 text-xs text-rose-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-bw-coral px-4 py-3 text-sm font-semibold text-white hover:bg-bw-coral/90 disabled:opacity-60"
        >
          {busy ? t('common.loading') : t('auth.signIn')}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-bw-line" />
        <span className="text-xs text-bw-muted">{t('auth.or')}</span>
        <span className="h-px flex-1 bg-bw-line" />
      </div>

      <button
        type="button"
        onClick={() => base44.auth.loginWithProvider('google', next)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-bw-line bg-white px-4 py-3 text-sm font-semibold text-bw-navy hover:bg-bw-cream"
      >
        <GoogleMark />
        {t('auth.google')}
      </button>
    </AuthShell>
  );
}