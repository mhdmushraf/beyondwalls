import { Clock, ShieldX, ShieldAlert, LogOut, Check, Building2, FileCheck2, Rocket } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/AuthContext';
import { BrandLogo, BrandBackdrop } from '@/components/Brand';
import LanguageToggle from '@/components/portal/LanguageToggle';

const SUPPORT_TEXT = 'Hello Beyond Walls, I need help with my business account.';
const WA_NUMBER = '971545469496';

function WaIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3M12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8M20.5 3.5A11.8 11.8 0 0 0 1.9 17.7L.2 24l6.4-1.7A11.8 11.8 0 0 0 24 12c0-3.2-1.2-6.2-3.5-8.5" />
    </svg>
  );
}

export default function StatusScreen({ org, otherOrgs = [], onSwitch }) {
  const { t } = useI18n();
  const { logout } = useAuth();

  const status = org?.status || 'pending';
  const pending = status === 'pending';
  const title = status === 'rejected'
    ? t('status.rejectedTitle')
    : status === 'suspended'
      ? t('status.suspendedTitle')
      : t('status.pendingTitle');
  const body = pending ? t('status.pendingBody') : org?.rejection_reason || t('status.pendingBody');
  const Icon = status === 'rejected' ? ShieldX : status === 'suspended' ? ShieldAlert : Clock;

  const whatsapp = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`${SUPPORT_TEXT} (${org?.name || ''})`)}`;

  const steps = [
    { icon: Building2, label: 'Business submitted', state: 'done' },
    { icon: FileCheck2, label: 'Trade licence review', state: pending ? 'current' : 'blocked' },
    { icon: Rocket, label: 'Account live', state: 'todo' },
  ];

  return (
    <div className="relative min-h-screen flex flex-col font-[Inter,system-ui,sans-serif]">
      <BrandBackdrop />

      <header className="relative z-10 h-[72px] flex items-center justify-between px-5 md:px-10">
        <BrandLogo size={36} endorsement />
        <LanguageToggle />
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-5 pb-12">
        <div className="w-full max-w-[540px]">
          <div className="rounded-[28px] bg-white/80 backdrop-blur-xl ring-1 ring-[#e7e3f3] shadow-[0_24px_60px_-20px_rgba(55,30,140,0.25)] overflow-hidden">
            {/* Top band */}
            <div className="relative px-8 pt-8 pb-7 bg-[#0d0824] text-white overflow-hidden">
              <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[#6f3ffd]/50 blur-[70px]" />
              <div className="absolute right-6 top-6 h-24 w-40 rounded-xl border border-white/10 bg-white/5" />
              <div className="absolute right-10 top-10 h-16 w-32 rounded-lg border border-white/10 bg-white/5" />
              <div className={`relative h-12 w-12 rounded-2xl flex items-center justify-center ${pending ? 'bg-amber-400/15 text-amber-300' : 'bg-rose-400/15 text-rose-300'}`}>
                <Icon className="h-6 w-6" />
              </div>
              <p className="relative mt-5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#b9a6ff]">{pending ? 'Almost there' : 'Action needed'}</p>
              <h1 className="relative mt-1.5 text-[26px] font-bold leading-tight tracking-[-0.5px]">{title}</h1>
              <p className="relative mt-2 text-[14px] leading-relaxed text-[#c9c2ea] max-w-[400px]">{body}</p>
            </div>

            <div className="px-8 py-7">
              {/* Progress */}
              <ol className="grid grid-cols-3 gap-2">
                {steps.map((s, i) => {
                  const StepIcon = s.icon;
                  const done = s.state === 'done';
                  const current = s.state === 'current';
                  const blocked = s.state === 'blocked';
                  return (
                    <li key={s.label} className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center ${done ? 'bw-grad text-white' : current ? 'bg-amber-50 text-amber-500 ring-2 ring-amber-200' : blocked ? 'bg-rose-50 text-rose-500 ring-2 ring-rose-200' : 'bg-[#f3f1f9] text-[#a39fb8]'}`}>
                          {done ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                        </span>
                        {i < steps.length - 1 && <span className={`h-[2px] flex-1 rounded-full ${done ? 'bg-[#6f3ffd]' : 'bg-[#ebe8f4]'}`} />}
                      </div>
                      <span className={`text-[12px] font-semibold leading-snug ${done || current || blocked ? 'text-[#111027]' : 'text-[#a39fb8]'}`}>{s.label}</span>
                    </li>
                  );
                })}
              </ol>

              {/* Business card */}
              <div className="mt-6 flex items-center gap-4 rounded-2xl bg-[#f7f5fd] ring-1 ring-[#ece8f7] p-4">
                <span className="h-11 w-11 shrink-0 rounded-xl bg-white ring-1 ring-[#e7e3f3] flex items-center justify-center text-[16px] font-bold text-[#5a2ded]">
                  {(org?.name || 'B').trim().charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold text-[#111027]">{org?.name}</p>
                  <p className="truncate text-[12px] text-[#6b6787] mt-0.5">
                    {[org?.emirate, org?.trade_license_number && `Licence ${org.trade_license_number}`].filter(Boolean).join(' · ') || org?.type}
                  </p>
                </div>
                <span className={`ms-auto shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${pending ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>{pending ? 'In review' : status === 'rejected' ? 'Rejected' : 'Suspended'}</span>
              </div>

              {pending && <p className="mt-4 text-[13px] text-[#6b6787]">Most businesses are approved within one working day. We'll email you the moment you're live.</p>}

              {otherOrgs.length > 0 && onSwitch && (
                <div className="mt-5">
                  <p className="text-[12px] text-[#6b6787] mb-2">You also belong to these approved businesses:</p>
                  {otherOrgs.map((o) => (
                    <button key={o.id} type="button" onClick={() => onSwitch(o.id)} className="mt-2 w-full rounded-xl ring-1 ring-[#e7e3f3] bg-white px-4 py-3 text-start text-sm font-semibold text-[#111027] hover:ring-[#c9bdfb]">Open {o.name}</button>
                  ))}
                </div>
              )}

              <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
                <a href={whatsapp} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 text-[14px] font-semibold text-white shadow-[0_10px_22px_-10px_rgba(37,211,102,0.7)] hover:brightness-95">
                  <WaIcon className="h-[18px] w-[18px]" />
                  {t('status.whatsapp')}
                </a>
                <button type="button" onClick={() => logout(true)} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white ring-1 ring-[#e7e3f3] px-5 text-[14px] font-semibold text-[#6b6787] hover:text-[#111027]">
                  <LogOut className="h-4 w-4" />
                  {t('status.signOut')}
                </button>
              </div>
            </div>
          </div>
          <p className="mt-5 text-center text-[12px] text-[#8a86a3]">Linkzone Global FZ-LLC · Dubai Internet City · UAE</p>
        </div>
      </main>
    </div>
  );
}
