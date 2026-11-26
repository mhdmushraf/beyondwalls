import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import AuthShell, { AuthTitle, AuthField, AuthButton, AuthError, AuthSuccess, AuthFooterLink } from '@/components/auth/AuthShell';

export default function ResetPassword() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token') || params.get('reset_token') || params.get('resetToken') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (password.length < 8) return setError('Use at least 8 characters.');
    if (password !== confirm) return setError("The two passwords don't match.");
    setBusy(true);
    try {
      await base44.auth.resetPassword({ resetToken: token, newPassword: password });
      setDone(true);
    } catch (e) {
      setError('This reset link has expired or was already used. Request a new one.');
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <AuthShell>
        <AuthTitle title="Reset link missing" sub="Open the link from your reset email, or request a new one." />
        <Link to="/forgot-password" className="font-semibold text-[#5a2ded] hover:underline">Request a new link</Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <AuthTitle eyebrow="New password" title="Set a new password" sub="Choose something you haven't used here before." />
      {done ? (
        <>
          <AuthSuccess>Password updated. You can sign in now.</AuthSuccess>
          <Link to="/login"><AuthButton type="button">Go to sign in<ArrowRight className="h-4 w-4" /></AuthButton></Link>
        </>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <AuthField id="password" label="New password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="At least 8 characters" />
          <AuthField id="confirm" label="Confirm password" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" placeholder="Type it again" />
          <AuthError>{error}</AuthError>
          <AuthButton type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save password'}</AuthButton>
        </form>
      )}
      <AuthFooterLink text="Changed your mind?" to="/login" label="Back to sign in" />
    </AuthShell>
  );
}
