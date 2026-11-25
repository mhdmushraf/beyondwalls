import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18n';
import AuthShell from '@/components/auth/AuthShell';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

export default function Signup() {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState('details');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAuthenticated) window.location.href = '/onboarding';
  }, [isAuthenticated]);

  const startSignup = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await base44.auth.register({ email: email.trim(), password });
      setStep('verify');
    } catch (e) {
      setError('We could not create the account. Try a different email or a longer password.');
    } finally {
      setBusy(false);
    }
  };

  const verify = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await base44.auth.verifyOtp({ email: email.trim(), otpCode: otp.trim() });
      await base44.auth.loginViaEmailPassword(email.trim(), password);
      if (fullName.trim()) {
        try {
          await base44.auth.updateMe({ full_name: fullName.trim() });
        } catch (e) {
          // The profile name is managed by the platform; signup continues regardless.
        }
      }
      window.location.href = '/onboarding';
    } catch (e) {
      setError('That code did not work. Check your email and try again.');
      setBusy(false);
    }
  };

  const resend = async () => {
    try {
      await base44.auth.resendOtp(email.trim());
    } catch (e) {
      setError('We could not resend the code.');
    }
  };

  return (
    <AuthShell>
      {step === 'details' ? (
        <>
          <h2 className="text-2xl font-semibold text-bw-navy">{t('auth.signUp')}</h2>
          <p className="mt-1 text-sm text-bw-muted">{t('auth.haveAccount')}{' '}
            <Link to="/login" className="font-semibold text-bw-coral hover:underline">{t('auth.signIn')}</Link>
          </p>

          <form onSubmit={startSignup} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">{t('auth.fullName')}</Label>
              <Input id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
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
              {busy ? t('common.loading') : t('auth.signUp')}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-bw-line" />
            <span className="text-xs text-bw-muted">{t('auth.or')}</span>
            <span className="h-px flex-1 bg-bw-line" />
          </div>

          <button
            type="button"
            onClick={() => base44.auth.loginWithProvider('google', '/onboarding')}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-bw-line bg-white px-4 py-3 text-sm font-semibold text-bw-navy hover:bg-bw-cream"
          >
            {t('auth.google')}
          </button>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-semibold text-bw-navy">{t('auth.verifyTitle')}</h2>
          <p className="mt-1 text-sm text-bw-muted">
            {t('auth.verifyBody')} <span className="font-semibold text-bw-navy">{email}</span>
          </p>

          <form onSubmit={verify} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="otp">Code</Label>
              <Input
                id="otp"
                inputMode="numeric"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="text-center text-lg tracking-[0.4em]"
              />
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
              {busy ? t('common.loading') : t('auth.verify')}
            </button>
            <button
              type="button"
              onClick={resend}
              className="w-full text-center text-xs font-semibold text-bw-muted hover:text-bw-navy"
            >
              {t('auth.resend')}
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
}