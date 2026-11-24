import React from 'react';
import { Clock, ShieldX, ShieldAlert, MessageCircle, LogOut } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';

const SUPPORT_TEXT = 'Hello Beyond Walls, I need help with my business account.';

export default function StatusScreen({ org }) {
  const { t } = useI18n();
  const { logout } = useAuth();

  const status = org?.status || 'pending';
  const title = status === 'rejected'
    ? t('status.rejectedTitle')
    : status === 'suspended'
      ? t('status.suspendedTitle')
      : t('status.pendingTitle');
  const body = status === 'pending'
    ? t('status.pendingBody')
    : org?.rejection_reason || t('status.pendingBody');
  const Icon = status === 'rejected' ? ShieldX : status === 'suspended' ? ShieldAlert : Clock;
  const tone = status === 'pending' ? 'text-amber-500 bg-amber-50' : 'text-rose-500 bg-rose-50';

  const whatsapp = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${SUPPORT_TEXT} (${org?.name || ''})`,
  )}`;

  return (
    <div className="min-h-screen bg-bw-cream flex flex-col">
      <div className="h-16 border-b border-bw-line bg-white flex items-center px-6">
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg bg-bw-navy flex items-center justify-center">
            <span className="h-3 w-3 rounded-sm bg-bw-coral" />
          </span>
          <span className="font-semibold text-bw-navy">Beyond Walls</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-bw-line p-8 text-center shadow-sm">
          <div className={`mx-auto h-14 w-14 rounded-2xl flex items-center justify-center ${tone}`}>
            <Icon className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-xl font-semibold text-bw-navy">{title}</h1>
          <p className="mt-2 text-sm text-bw-muted leading-relaxed">{body}</p>

          <div className="mt-6 rounded-2xl bg-bw-cream border border-bw-line p-4 text-start">
            <p className="text-sm font-semibold text-bw-navy">{org?.name}</p>
            <p className="text-xs text-bw-muted mt-1">
              {[org?.emirate, org?.trade_license_number].filter(Boolean).join(' · ') || org?.type}
            </p>
          </div>

          <a
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white hover:brightness-95"
          >
            <MessageCircle className="h-4 w-4" />
            {t('status.whatsapp')}
          </a>

          <button
            type="button"
            onClick={() => logout(true)}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-bw-line px-4 py-3 text-sm font-semibold text-bw-muted hover:text-bw-navy"
          >
            <LogOut className="h-4 w-4" />
            {t('status.signOut')}
          </button>
        </div>
      </div>
    </div>
  );
}