import { useEffect } from 'react';
import { Check, Lock, MonitorPlay } from 'lucide-react';

const STEPS = [
  { label: 'Verifying your account', done: 'Account verified' },
  { label: 'Connecting your venues & screens', done: 'Venues & screens connected' },
  { label: 'Preparing your dashboard', done: 'Dashboard ready' },
];

// Post sign-in handover: orbiting logo, progress, and a skeleton of the portal opening behind it.
export default function AccessingScreen({ name, step = 1 }) {
  const first = name && !/[+@]/.test(name) ? name.trim().split(' ')[0] : '';
  const pct = Math.min(100, Math.round(((step + 1) / STEPS.length) * 100) - (step < STEPS.length - 1 ? 8 : 0));

  useEffect(() => () => { document.documentElement.style.background = ''; }, []);

  return (
    <div role="status" aria-live="polite" aria-label="Accessing your platform" className="fixed inset-0 z-[120] overflow-hidden font-[Inter,system-ui,sans-serif] text-white"
      style={{ background: 'radial-gradient(900px 520px at 50% 30%,#3a1c9a 0%,rgba(58,28,154,0) 60%),linear-gradient(160deg,#140b3a 0%,#0d0a1f 55%,#1d0d55 100%)' }}>
      <style>{`
        @keyframes bwa-spin { to { transform: rotate(360deg) } }
        @keyframes bwa-spin-r { to { transform: rotate(-360deg) } }
        @keyframes bwa-sk { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
        @keyframes bwa-rise { from { opacity: 0; transform: translateY(18px) } to { opacity: 1; transform: none } }
        @keyframes bwa-glow { 0%,100% { box-shadow: 0 0 0 0 rgba(139,107,255,.45), 0 24px 70px rgba(111,63,253,.55) } 50% { box-shadow: 0 0 0 18px rgba(139,107,255,0), 0 24px 90px rgba(111,63,253,.8) } }
        .bwa-orbit { animation: bwa-spin 9s linear infinite }
        .bwa-orbit-r { animation: bwa-spin-r 14s linear infinite }
        .bwa-tile { animation: bwa-glow 2.6s ease-in-out infinite }
        .bwa-rise { animation: bwa-rise .7s cubic-bezier(.2,.8,.2,1) both }
        .bwa-sk { background: linear-gradient(90deg, rgba(255,255,255,.05) 0%, rgba(255,255,255,.13) 50%, rgba(255,255,255,.05) 100%); background-size: 200% 100%; animation: bwa-sk 1.4s ease-in-out infinite }
        @media (prefers-reduced-motion: reduce) { .bwa-orbit, .bwa-orbit-r, .bwa-tile, .bwa-sk, .bwa-rise { animation: none } }
      `}</style>

      <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6">
        {/* Orbit */}
        <div className="relative h-[200px] w-[200px]">
          <div className="bwa-orbit absolute inset-0 rounded-full border border-dashed border-white/20">
            <span className="absolute -top-[7px] left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,.9)]" />
            <span className="absolute bottom-[18%] -left-[6px] flex h-6 w-9 items-center justify-center rounded-md bg-white/10 ring-1 ring-white/20"><MonitorPlay className="h-3.5 w-3.5 text-white/80" /></span>
          </div>
          <div className="bwa-orbit-r absolute inset-[28px] rounded-full border border-white/10">
            <span className="absolute -right-[5px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-[#c4b5fd] shadow-[0_0_12px_rgba(196,181,253,.9)]" />
            <span className="absolute -top-[10px] left-[20%] flex h-5 w-7 items-center justify-center rounded bg-white/10 ring-1 ring-white/20"><MonitorPlay className="h-3 w-3 text-white/70" /></span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bwa-tile flex h-[84px] w-[84px] items-center justify-center rounded-[24px]" style={{ backgroundImage: 'linear-gradient(135deg,#7c4dff 0%,#5a2ded 75%)' }}>
              <MonitorPlay className="h-[44px] w-[44px] text-white" strokeWidth={1.9} />
            </span>
          </div>
        </div>

        <p className="bwa-rise mt-8 text-[11px] font-bold uppercase tracking-[0.2em] text-[#b9a6ff]">BeyondWalls{first ? ` · Welcome, ${first}` : ''}</p>
        <h1 className="bwa-rise mt-2 text-center text-[34px] md:text-[42px] font-bold leading-tight tracking-[-1px]" style={{ animationDelay: '.08s' }}>
          Accessing your <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg,#c4b5fd,#7dd3fc)' }}>platform</span>
        </h1>
        <p className="bwa-rise mt-2 text-[15px] text-[#c9c2ea]" style={{ animationDelay: '.16s' }}>{STEPS[Math.min(step, STEPS.length - 1)].label}…</p>

        {/* Progress */}
        <div className="bwa-rise mt-6 w-full max-w-[420px]" style={{ animationDelay: '.24s' }}>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-[#8b6bff] via-[#a78bfa] to-[#7dd3fc] transition-[width] duration-700 ease-out" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {STEPS.map((s, i) => {
              const done = i < step;
              const current = i === step;
              return (
                <div key={s.label} className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-[11px] font-semibold transition ${done ? 'bg-emerald-400/10 text-emerald-200' : current ? 'bg-white/10 text-white ring-1 ring-[#8b6bff]/60' : 'bg-white/[0.04] text-white/40'}`}>
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${done ? 'bg-emerald-400/20' : current ? 'bg-[#6f3ffd]/40' : 'bg-white/5'}`}>
                    {done ? <Check className="h-3 w-3" /> : <span className={`h-1.5 w-1.5 rounded-full ${current ? 'bg-white animate-pulse' : 'bg-white/30'}`} />}
                  </span>
                  <span className="leading-tight">{done ? s.done : s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Portal opening behind */}
        <div className="bwa-rise mt-10 hidden w-full max-w-[760px] md:block" style={{ animationDelay: '.35s' }}>
          <div className="overflow-hidden rounded-[18px] bg-white/[0.05] ring-1 ring-white/10 backdrop-blur">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" /><span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
              <span className="ml-3 flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1 text-[11px] text-white/60"><Lock className="h-3 w-3" />beyondwalls.linkzoneglobal.com/app</span>
            </div>
            <div className="flex gap-4 p-4">
              <div className="w-[140px] space-y-2.5">
                {[70, 85, 60, 78, 55].map((w, i) => <div key={i} className="bwa-sk h-3.5 rounded-md" style={{ width: `${w}%` }} />)}
              </div>
              <div className="flex-1 space-y-3">
                <div className="rounded-2xl p-4" style={{ backgroundImage: 'linear-gradient(140deg,rgba(111,63,253,.55),rgba(46,21,148,.55))' }}>
                  <div className="bwa-sk h-3 w-24 rounded" />
                  <div className="bwa-sk mt-2.5 h-7 w-40 rounded-lg" />
                  <div className="mt-4 flex gap-3">{[0, 1, 2, 3].map((i) => <div key={i} className="bwa-sk h-10 w-10 rounded-full" />)}</div>
                </div>
                <div className="grid grid-cols-3 gap-3">{[0, 1, 2].map((i) => <div key={i} className="bwa-sk h-14 rounded-xl" />)}</div>
              </div>
            </div>
          </div>
        </div>

        <p className="absolute bottom-8 text-[12px] text-[#7d74b0]">A Linkzone Global company · Encrypted connection</p>
      </div>
    </div>
  );
}
