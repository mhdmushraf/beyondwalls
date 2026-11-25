import { Link } from 'react-router-dom';
import { MonitorPlay, AlertCircle, Lock } from 'lucide-react';
import LanguageToggle from '@/components/portal/LanguageToggle';

const GRAD = 'linear-gradient(135deg, #6f3ffd 0%, #5a2ded 71%)';

// Figma "Auth / 01 Login": photo panel with quote on the left, form on #f6f5fa on the right.
export default function AuthShell({ children, quote, quoteBy }) {
  return (
    <div className="min-h-screen bg-[#f6f5fa] lg:grid lg:grid-cols-[minmax(0,700px)_1fr] font-[Inter,system-ui,sans-serif]">
      <div className="relative overflow-hidden px-6 py-6 lg:px-14 lg:py-12 flex flex-col lg:min-h-screen min-h-[220px]">
        <img src="/site/cafe.webp" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40 lg:to-black/20" />
        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-[10px]" style={{ backgroundImage: GRAD }}>
              <MonitorPlay className="w-[18px] h-[18px] text-white" />
            </span>
            <span className="font-bold text-[18px] text-white">BeyondWalls</span>
          </Link>
          <LanguageToggle tone="dark" />
        </div>
        <div className="flex-1" />
        <div className="relative z-10 mt-6 bg-[rgba(11,9,32,0.72)] backdrop-blur-sm rounded-[24px] p-5 lg:p-7 flex flex-col gap-2.5 max-w-[600px]">
          <p className="text-white text-[16px] lg:text-[20px] font-medium leading-snug">
            {quote || '“We changed our breakfast prices from the phone at 7am and every screen in both branches updated before we opened.”'}
          </p>
          <p className="text-[#cfc8f2] text-[13px] font-medium">{quoteBy || 'Example — how a café uses live prices'}</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-10 lg:px-[120px] lg:py-12">
        <div className="w-full max-w-[440px] flex flex-col gap-5">{children}</div>
      </div>
    </div>
  );
}

export function AuthTitle({ title, sub }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-bold text-[32px] tracking-[-0.8px] text-[#111027] leading-tight">{title}</h1>
      {sub && <p className="text-[15px] text-[#6b6787]">{sub}</p>}
    </div>
  );
}

export function AuthField({ id, label, ...props }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-2">
      <span className="text-[12px] font-semibold text-[#6b6787]">{label}</span>
      <input
        id={id}
        {...props}
        className={`w-full bg-white border-2 border-[#eceaf3] rounded-xl px-[14px] py-3 text-[15px] font-medium text-[#111027] placeholder:text-[#a39fb8] outline-none transition focus:border-[#6f3ffd] ${props.className || ''}`}
      />
    </label>
  );
}

export function AuthButton({ children, ...props }) {
  return (
    <button {...props} className="w-full flex items-center justify-center gap-2 rounded-xl px-5 py-[13px] text-[15px] font-semibold text-white transition hover:brightness-110 disabled:opacity-60" style={{ backgroundImage: GRAD }}>
      {children}
    </button>
  );
}

export function AuthError({ children }) {
  if (!children) return null;
  return (
    <div className="flex items-start gap-2 rounded-[10px] bg-rose-50 border border-rose-100 px-3 py-2.5 text-[13px] text-rose-600">
      <AlertCircle className="h-4 w-4 shrink-0 mt-px" />{children}
    </div>
  );
}

export function AuthNote({ children }) {
  return (
    <div className="flex items-center gap-2 rounded-[10px] bg-[#dcfce7] px-3 py-2.5 text-[12px] font-medium text-[#16a34a]">
      <Lock className="h-3.5 w-3.5 shrink-0" />{children}
    </div>
  );
}

export function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.4a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.6-5.2 3.6-8.8Z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.5 1.2-4 1.2a7 7 0 0 1-6.6-4.8H1.4v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.4 14.5a7.2 7.2 0 0 1 0-4.9V6.5H1.4a12 12 0 0 0 0 10.7l4-2.7Z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.5l4 3.1A7 7 0 0 1 12 4.8Z" />
    </svg>
  );
}

export function GoogleButton({ onClick, label }) {
  return (
    <>
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-[#e4e1ee]" />
        <span className="text-[12px] text-[#6b6787]">or</span>
        <span className="h-px flex-1 bg-[#e4e1ee]" />
      </div>
      <button type="button" onClick={onClick} className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-[#eceaf3] bg-white px-5 py-3 text-[15px] font-semibold text-[#111027] hover:border-[#c9bdfb]">
        <GoogleMark />{label}
      </button>
    </>
  );
}
