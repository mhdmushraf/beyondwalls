import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18n';
import AuthShell, { AuthTitle, AuthField, AuthButton, AuthError, AuthNote, GoogleButton } from '@/components/auth/AuthShell';

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
    <AuthShell quote="“Two screens on the Signage + Ads plan. Ads booked on the map covered the fee in the first month.”" quoteBy="Example — how a venue earns from spare slots">
      {step === 'details' ? (
        <>
          <AuthTitle title={t('auth.createTitle', 'Create your account')} sub={t('auth.createSub', 'List your screens free, or start advertising across the UAE.')} />
          <form onSubmit={startSignup} className="flex flex-col gap-4">
            <AuthField id="name" label={t('auth.fullName')} required value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" placeholder="Your name" />
            <AuthField id="email" label={t('auth.email')} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@business.ae" />
            <AuthField id="password" label={t('auth.password')} type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="At least 6 characters" />
            <AuthError>{error}</AuthError>
            <AuthButton type="submit" disabled={busy}>{busy ? 'Creating account…' : t('auth.signUp')}</AuthButton>
          </form>
          <AuthNote>We email you a 6-digit code to confirm it's you.</AuthNote>
          <GoogleButton onClick={() => base44.auth.loginWithProvider('google', '/onboarding')} label={t('auth.google')} />
          <p className="text-[14px] font-medium text-[#6b6787]">{t('auth.haveAccount')}{' '}
            <Link to="/login" className="font-semibold text-[#5a2ded] hover:underline">{t('auth.signIn')}</Link>
          </p>
        </>
      ) : (
        <>
          <AuthTitle title={t('auth.verifyTitle')} sub={<>{t('auth.verifyBody')} <span className="font-semibold text-[#111027]">{email}</span></>} />
          <form onSubmit={verify} className="flex flex-col gap-4">
            <AuthField id="otp" label="6-digit code" inputMode="numeric" maxLength={6} required value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} className="text-center text-[22px] tracking-[0.5em]" placeholder="••••••" autoComplete="one-time-code" />
            <AuthError>{error}</AuthError>
            <AuthButton type="submit" disabled={busy}>{busy ? 'Checking…' : t('auth.verify')}</AuthButton>
            <button type="button" onClick={resend} className="text-[13px] font-semibold text-[#6b6787] hover:text-[#5a2ded]">{t('auth.resend')}</button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
