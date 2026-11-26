import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MonitorPlay, AlertCircle, Lock, Eye, EyeOff, Tag, BellRing, CheckCircle2, ShieldCheck } from 'lucide-react';
import LanguageToggle from '@/components/portal/LanguageToggle';

const GRAD = 'linear-gradient(135deg, #6f3ffd 0%, #5a2ded 71%)';

// What the venue's screens are "doing" — cycles on the left panel to show the product, not a stock photo.
const SCENES = [
  {
    img: '/site/cafe.webp', label: 'Café · Dubai Marina',
    toast: { icon: Tag, title: 'Flat white  AED 18 → 16', sub: 'Updated on 3 screens · 2s ago' },
  },
  {
    img: '/site/v-restaurant.webp', label: 'Restaurant · JLT',
    toast: { icon: BellRing, title: 'Urgent: Back in 10 minutes', sub: 'Showing on every screen · ends 14:20' },
  },
  {
    img: '/site/v-gym.webp', label: 'Gym · Al Barsha',
    toast: { icon: CheckCircle2, title: 'Ad approved · Juice bar promo', sub: 'Plays from tomorrow · 6 slots' },
  },
];

function useScene(ms = 3800) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const id = setInterval(() => setI((n) => (n + 1) % SCENES.length), ms);
    return () => clearInterval(id);
  }, [ms]);
  return i;
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="flex items-center justify-center w-9 h-9 rounded-[11px] shadow-[0_6px_20px_rgba(111,63,253,0.45)]" style={{ backgroundImage: GRAD }}>
        <MonitorPlay className="w-5 h-5 text-white" />
      </span>
      <span className="leading-tight">
        <span className="block font-bold text-[18px] text-white">BeyondWalls</span>
        <span className="block text-[11px] font-medium text-[#a99ee6]">A Linkzone Global company</span>
      </span>
    </Link>
  );
}

function ScreenWall() {
  const active = useScene();
  const scene = SCENES[active];
  const Icon = scene.toast.icon;
  return (
    <div className="relative w-full max-w-[560px] mx-auto">
      <div className="relative rounded-[18px] bg-[#05030f] p-[10px] shadow-[0_30px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/10">
        <div className="relative aspect-video overflow-hidden rounded-[10px] bg-[#140b3a]">
          {SCENES.map((s, i) => (
            <img
              key={s.img}
              src={s.img}
              alt=""
              fetchPriority={i === 0 ? 'high' : 'low'}
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ease-out ${i === active ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" /></span>
            LIVE
          </div>
          <div className="absolute bottom-3 left-3 text-[12px] font-semibold text-white/90">{scene.label}</div>
        </div>
        <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-white/10" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {SCENES.map((s, i) => (
          <div key={s.label} className={`rounded-[10px] bg-[#05030f] p-[5px] ring-1 transition ${i === active ? 'ring-[#8b6bff]' : 'ring-white/10'}`}>
            <div className="relative aspect-video overflow-hidden rounded-[6px]">
              <img src={s.img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </div>
          </div>
        ))}
      </div>

      <div key={active} className="bw-toast absolute -right-2 xl:-right-8 top-[42%] w-[250px] rounded-2xl bg-white/95 p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundImage: GRAD }}>
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-[#111027] leading-snug">{scene.toast.title}</p>
            <p className="mt-0.5 text-[11px] font-medium text-[#6b6787]">{scene.toast.sub}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Left: a live "screen wall" showing what the app does. Right: the form.
export default function AuthShell({ children, headline, sub }) {
  return (
    <div className="min-h-screen bg-[#f6f5fa] lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] font-[Inter,system-ui,sans-serif]">
      <style>{`
        @keyframes bw-toast-in { 0% { opacity: 0; transform: translateY(14px) scale(.96) } 100% { opacity: 1; transform: none } }
        .bw-toast { animation: bw-toast-in .55s cubic-bezier(.2,.8,.2,1) both }
        @keyframes bw-drift { 0%,100% { transform: translate(0,0) } 50% { transform: translate(30px,-20px) } }
        @media (prefers-reduced-motion: reduce) { .bw-toast, .bw-orb { animation: none !important } }
      `}</style>

      <aside className="relative overflow-hidden bg-[#0d0824] px-6 py-6 lg:px-14 lg:py-10 flex flex-col lg:min-h-screen">
        <div className="bw-orb pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-[#6f3ffd]/35 blur-[110px]" style={{ animation: 'bw-drift 14s ease-in-out infinite' }} />
        <div className="bw-orb pointer-events-none absolute -bottom-40 right-0 h-[380px] w-[380px] rounded-full bg-[#2dd4bf]/15 blur-[120px]" style={{ animation: 'bw-drift 18s ease-in-out infinite reverse' }} />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '44px 44px' }} />

        <div className="relative z-10 flex items-center justify-between">
          <Brand />
          <LanguageToggle tone="dark" />
        </div>

        <div className="relative z-10 hidden lg:flex flex-1 flex-col justify-center gap-10 py-10">
          <div className="max-w-[520px]">
            <h2 className="text-[40px] font-bold leading-[1.08] tracking-[-1.2px] text-white">
              {headline || <>Every screen.<br /><span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg,#b9a6ff,#7dd3fc)' }}>One tap away.</span></>}
            </h2>
            <p className="mt-3 text-[16px] text-[#b8b0e0]">{sub || 'Change prices, push urgent messages and approve ads on every TV in your venue — live, from your phone.'}</p>
          </div>
          <ScreenWall />
        </div>

        <p className="relative z-10 mt-4 hidden lg:block text-[12px] text-[#7d74b0]">Dubai Internet City · UAE</p>
      </aside>

      <main className="relative flex items-center justify-center overflow-hidden px-5 py-10 lg:px-16 lg:py-12">
        {/* Right-side decoration: soft brand light, dot grid, and a faint screen outline */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -right-24 h-[420px] w-[420px] rounded-full bg-[#6f3ffd]/15 blur-[110px]" />
          <div className="absolute -bottom-40 -left-20 h-[380px] w-[380px] rounded-full bg-[#38bdf8]/10 blur-[110px]" />
          <div className="absolute inset-0" style={{ opacity: 0.6, backgroundImage: 'radial-gradient(rgba(90,45,237,0.13) 1px, transparent 1px)', backgroundSize: '22px 22px', maskImage: 'radial-gradient(ellipse at 50% 45%, #000 30%, transparent 78%)', WebkitMaskImage: 'radial-gradient(ellipse at 50% 45%, #000 30%, transparent 78%)' }} />
          <div className="absolute right-10 top-10 hidden xl:block h-24 w-40 rounded-2xl border border-[#6f3ffd]/15 bg-white/40" />
          <div className="absolute right-16 top-16 hidden xl:block h-24 w-40 rounded-2xl border border-[#6f3ffd]/10" />
          <div className="absolute bottom-12 left-12 hidden xl:flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-[#5a2ded] ring-1 ring-[#e7e3f3] backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Screens across the UAE, live
          </div>
        </div>
        <div className="relative w-full max-w-[460px] flex flex-col gap-6 rounded-[28px] bg-white/75 p-7 sm:p-9 ring-1 ring-[#e7e3f3] shadow-[0_30px_70px_-30px_rgba(55,30,140,0.35)] backdrop-blur-xl">
          {children}
          <div className="flex items-center justify-center gap-1.5 pt-2 text-[12px] text-[#8a86a3]">
            <ShieldCheck className="h-3.5 w-3.5" /> Encrypted sign-in · Linkzone Global FZ-LLC
          </div>
        </div>
      </main>
    </div>
  );
}

export function AuthTitle({ title, sub, eyebrow }) {
  return (
    <div className="flex flex-col gap-2">
      {eyebrow && <span className="w-fit rounded-full bg-[#ece6ff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#5a2ded]">{eyebrow}</span>}
      <h1 className="font-bold text-[34px] tracking-[-0.9px] text-[#111027] leading-tight">{title}</h1>
      {sub && <p className="text-[15px] text-[#6b6787]">{sub}</p>}
    </div>
  );
}

export function AuthField({ id, label, aside, type = 'text', ...props }) {
  const [show, setShow] = useState(false);
  const isPw = type === 'password';
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-[12px] font-semibold text-[#6b6787]">{label}</label>
        {aside}
      </div>
      <div className="relative">
        <input
          id={id}
          type={isPw && show ? 'text' : type}
          {...props}
          className={`w-full h-[52px] bg-white border-2 border-[#eceaf3] rounded-[14px] px-4 ${isPw ? 'pr-12' : ''} text-[15px] font-medium text-[#111027] placeholder:text-[#a39fb8] outline-none transition shadow-[0_1px_2px_rgba(17,16,39,0.04)] focus:border-[#6f3ffd] focus:shadow-[0_0_0_4px_rgba(111,63,253,0.12)] ${props.className || ''}`}
        />
        {isPw && (
          <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#8a86a3] hover:bg-[#f3f0fd] hover:text-[#5a2ded]">
            {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
          </button>
        )}
      </div>
    </div>
  );
}

export function AuthButton({ children, ...props }) {
  return (
    <button {...props} className="group w-full h-[52px] flex items-center justify-center gap-2 rounded-[14px] px-5 text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(90,45,237,0.32)] transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60" style={{ backgroundImage: GRAD }}>
      {children}
    </button>
  );
}

export function AuthError({ children }) {
  if (!children) return null;
  return (
    <div role="alert" className="flex items-start gap-2 rounded-[12px] bg-rose-50 border border-rose-100 px-3 py-2.5 text-[13px] text-rose-600">
      <AlertCircle className="h-4 w-4 shrink-0 mt-px" />{children}
    </div>
  );
}

export function AuthSuccess({ children }) {
  if (!children) return null;
  return (
    <div role="status" className="flex items-start gap-2 rounded-[12px] bg-emerald-50 border border-emerald-100 px-3 py-2.5 text-[13px] text-emerald-700">
      <CheckCircle2 className="h-4 w-4 shrink-0 mt-px" />{children}
    </div>
  );
}

export function AuthNote({ children }) {
  return (
    <div className="flex items-center gap-2 rounded-[12px] bg-[#f1edff] px-3 py-2.5 text-[12px] font-medium text-[#5a2ded]">
      <Lock className="h-3.5 w-3.5 shrink-0" />{children}
    </div>
  );
}

export function AuthFooterLink({ text, to, label }) {
  return (
    <p className="text-center text-[14px] font-medium text-[#6b6787]">{text}{' '}
      <Link to={to} className="font-semibold text-[#5a2ded] hover:underline">{label}</Link>
    </p>
  );
}
