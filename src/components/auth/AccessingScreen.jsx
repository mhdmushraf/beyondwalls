import { Check } from 'lucide-react';
import { BrandTile } from '@/components/Brand';

const STEPS = ['Account verified', 'Loading your venues & screens', 'Preparing your dashboard'];

// Shown right after sign-in (and while the portal boots after the reload): brand + progress + skeleton of the dashboard.
export default function AccessingScreen({ name, step = 1 }) {
  return (
    <div role="status" aria-label="Accessing your platform" className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden font-[Inter,system-ui,sans-serif]"
      style={{ background: 'radial-gradient(1100px 560px at 30% 20%,#2a1470 0%,rgba(42,20,112,0) 60%),linear-gradient(151deg,#140b3a 14%,#0d0a1f 54%,#2a0f6b 86%)' }}>
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '44px 44px' }} />

      <div className="relative z-10 grid w-full max-w-[1080px] items-center gap-10 px-6 lg:grid-cols-[380px_1fr]">
        <div>
          <BrandTile size={56} dark />
          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.16em] text-[#b9a6ff]">BeyondWalls</p>
          <h1 className="mt-2 text-[34px] font-bold leading-[1.1] tracking-[-0.8px] text-white">
            Accessing your<br />platform{name ? <span className="text-[#c4b5fd]">, {name.split(' ')[0]}</span> : null}
          </h1>
          <ul className="mt-7 space-y-3">
            {STEPS.map((label, i) => {
              const done = i < step;
              const current = i === step;
              return (
                <li key={label} className="flex items-center gap-3">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full ${done ? 'bg-emerald-400/15 text-emerald-300' : current ? 'bg-[#6f3ffd]/25 text-white ring-1 ring-[#8b6bff]' : 'bg-white/5 text-white/30'}`}>
                    {done ? <Check className="h-4 w-4" /> : <span className={`h-2 w-2 rounded-full ${current ? 'bg-[#c4b5fd] animate-pulse' : 'bg-white/30'}`} />}
                  </span>
                  <span className={`text-[14px] font-medium ${done ? 'text-white/80' : current ? 'text-white' : 'text-white/40'}`}>{label}</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-10 text-[12px] text-[#7d74b0]">A Linkzone Global company · Dubai Internet City</p>
        </div>

        {/* Skeleton of the dashboard that is about to open */}
        <div className="hidden lg:block rounded-[22px] bg-white/[0.06] p-4 ring-1 ring-white/10 backdrop-blur">
          <div className="flex gap-4">
            <div className="w-[170px] space-y-3 rounded-2xl bg-white/[0.04] p-4">
              <div className="bw-sk h-7 w-28 rounded-lg" />
              {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="bw-sk h-4 rounded-md" style={{ width: `${80 - i * 6}%` }} />)}
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <div className="bw-sk h-7 w-48 rounded-lg" />
                <div className="bw-sk h-9 w-28 rounded-xl" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="space-y-2.5 rounded-2xl bg-white/[0.05] p-4">
                    <div className="bw-sk h-3 w-16 rounded" />
                    <div className="bw-sk h-7 w-24 rounded-lg" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[0, 1].map((i) => (
                  <div key={i} className="space-y-3 rounded-2xl bg-white/[0.05] p-3">
                    <div className="bw-sk aspect-video w-full rounded-xl" />
                    <div className="bw-sk h-3.5 w-3/4 rounded" />
                    <div className="bw-sk h-3 w-1/2 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .bw-sk { background: linear-gradient(90deg, rgba(255,255,255,.06) 0%, rgba(255,255,255,.14) 50%, rgba(255,255,255,.06) 100%); background-size: 200% 100%; animation: bw-sk 1.4s ease-in-out infinite; }
        @keyframes bw-sk { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
        @media (prefers-reduced-motion: reduce) { .bw-sk { animation: none } }
      `}</style>
    </div>
  );
}
