import { useState } from 'react';
import { ArrowRight, MailCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AuthShell, { AuthTitle, AuthField, AuthButton, AuthError, AuthFooterLink } from '@/components/auth/AuthShell';

export default function ForgotPassword() {
  const [email, setEmail] = useState(new URLSearchParams(window.location.search).get('email') || '');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await base44.auth.resetPasswordRequest(email.trim());
      setSent(true);
    } catch (e) {
      setError('We could not send the reset email. Check the address and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell headline={<>Locked out?<br /><span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg,#b9a6ff,#7dd3fc)' }}>Your screens keep playing.</span></>} sub="Reset your password in a minute. Nothing on your TVs stops while you do.">
      {sent ? (
        <>
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ece6ff] text-[#5a2ded]"><MailCheck className="h-7 w-7" /></span>
          <AuthTitle title="Check your inbox" sub={<>If an account exists for <span className="font-semibold text-[#111027]">{email}</span>, we've sent a link to set a new password. It can take a minute — check spam too.</>} />
          <button type="button" onClick={() => setSent(false)} className="text-left text-[13px] font-semibold text-[#5a2ded] hover:underline">Use a different email</button>
        </>
      ) : (
        <>
          <AuthTitle eyebrow="Reset password" title="Forgot your password?" sub="Enter the email you sign in with and we'll send you a reset link." />
          <form onSubmit={submit} className="flex flex-col gap-4">
            <AuthField id="email" label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@business.ae" />
            <AuthError>{error}</AuthError>
            <AuthButton type="submit" disabled={busy}>{busy ? 'Sending…' : <>Send reset link<ArrowRight className="h-4 w-4" /></>}</AuthButton>
          </form>
        </>
      )}
      <AuthFooterLink text="Remembered it?" to="/login" label="Back to sign in" />
    </AuthShell>
  );
}
