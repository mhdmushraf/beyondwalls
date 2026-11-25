import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18n';
import AuthShell, { AuthTitle, AuthField, AuthButton, AuthError, GoogleButton } from '@/components/auth/AuthShell';

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
      <AuthTitle title={t('auth.welcomeBack', 'Welcome back')} sub={t('auth.signInSub', 'Sign in to manage your screens or campaigns.')} />
      <form onSubmit={submit} className="flex flex-col gap-4">
        <AuthField id="email" label={t('auth.email')} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@business.ae" />
        <AuthField id="password" label={t('auth.password')} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="••••••••" />
        <AuthError>{error}</AuthError>
        <AuthButton type="submit" disabled={busy}>{busy ? 'Signing in…' : t('auth.signIn')}</AuthButton>
      </form>
      <GoogleButton onClick={() => base44.auth.loginWithProvider('google', next)} label={t('auth.google')} />
      <p className="text-[14px] font-medium text-[#6b6787]">{t('auth.noAccount')}{' '}
        <Link to="/signup" className="font-semibold text-[#5a2ded] hover:underline">{t('auth.signUp')}</Link>
      </p>
    </AuthShell>
  );
}
