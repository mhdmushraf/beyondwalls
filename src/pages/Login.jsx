import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18n';
import AccessingScreen from '@/components/auth/AccessingScreen';
import AuthShell, { AuthTitle, AuthField, AuthButton, AuthError, AuthFooterLink } from '@/components/auth/AuthShell';

export default function Login() {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [access, setAccess] = useState(null); // { name, step }

  const qs = new URLSearchParams(window.location.search);
  const rawNext = qs.get('next') || qs.get('from_url') || qs.get('returnTo') || '/app';
  let next = '/app';
  try {
    const u = new URL(rawNext, window.location.origin);
    if (u.origin === window.location.origin && !/^\/(login|sign-in)/i.test(u.pathname)) next = u.pathname + u.search;
  } catch (e) { /* keep default */ }

  useEffect(() => {
    if (isAuthenticated) navigate(next, { replace: true });
  }, [isAuthenticated, next, navigate]);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await base44.auth.loginViaEmailPassword(email.trim(), password);
      setAccess({ name: res?.user?.full_name || '', step: 0 });
      setTimeout(() => setAccess((a) => (a ? { ...a, step: 1 } : a)), 850);
      setTimeout(() => setAccess((a) => (a ? { ...a, step: 2 } : a)), 1700);
      try { sessionStorage.setItem('bw_access', '1'); } catch (e) { /* ignore */ }
      setTimeout(() => window.location.replace(next), 2700);
    } catch (e) {
      setError("That email and password don't match. Check for typos, or reset your password.");
      setBusy(false);
    }
  };

  if (access) return <AccessingScreen name={access.name} step={access.step} />;

  return (
    <AuthShell>
      <AuthTitle eyebrow="Venue & advertiser portal" title={t('auth.welcomeBack', 'Welcome back')} sub={t('auth.signInSub', 'Sign in to manage your screens or campaigns.')} />
      <form onSubmit={submit} className="flex flex-col gap-4">
        <AuthField id="email" label={t('auth.email')} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@business.ae" />
        <AuthField
          id="password"
          label={t('auth.password')}
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          placeholder="Your password"
          aside={<Link to={`/forgot-password${email ? `?email=${encodeURIComponent(email.trim())}` : ''}`} className="text-[12px] font-semibold text-[#5a2ded] hover:underline">{t('auth.forgot', 'Forgot your password?')}</Link>}
        />
        <AuthError>{error}</AuthError>
        <AuthButton type="submit" disabled={busy}>
          {busy ? 'Signing in…' : <>{t('auth.signIn')}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></>}
        </AuthButton>
      </form>
      <AuthFooterLink text={t('auth.noAccount')} to="/signup" label={t('auth.signUp')} />
    </AuthShell>
  );
}
