import { ChevronDown, Bell, MoreHorizontal, TrendingUp, Check, X } from 'lucide-react';

const SCREENS = [
  { label: 'Counter', img: '/site/cafe.webp', ring: 'from-emerald-400 to-emerald-500' },
  { label: 'Window', img: '/site/v-cowork.webp', ring: 'from-amber-300 to-rose-400' },
  { label: 'Menu', img: '/site/market.webp', ring: 'from-emerald-400 to-emerald-500' },
  { label: 'Tables', img: '/site/bone.webp', ring: 'from-emerald-400 to-emerald-500' },
  { label: 'Marina', img: '/site/mall.webp', ring: 'from-rose-400 to-pink-500' },
];

// The owner-home card from the mobile app design: business pill, earnings, trend line, screens as rings.
export function EarningsCard({ greeting = 'Good morning', compact = false }) {
  return (
    <div className="relative overflow-hidden rounded-[30px] p-6 text-white shadow-[0_30px_70px_-25px_rgba(60,20,180,0.65)]"
      style={{ backgroundImage: 'linear-gradient(140deg,#6f3ffd 0%,#4c22d6 45%,#2e1594 100%)' }}>
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -left-16 bottom-[-90px] h-56 w-56 rounded-full bg-white/[0.06]" />

      <div className="relative flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5 rounded-full bg-white/15 py-1.5 pl-1.5 pr-3 backdrop-blur">
          <img src="/site/cafe.webp" alt="" className="h-9 w-9 rounded-full object-cover" />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[14px] font-bold">Bean &amp; Co.</p>
            <p className="truncate text-[11px] text-white/75">3 venues · 6 screens</p>
          </div>
          <ChevronDown className="h-4 w-4 text-white/80" />
        </div>
        <div className="flex gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15"><MoreHorizontal className="h-4 w-4" /></span>
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/15"><Bell className="h-4 w-4" /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-400" /></span>
        </div>
      </div>

      <div className="relative mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-[14px] text-white/80">{greeting}</p>
          <div className="mt-1 flex items-center gap-2.5">
            <p className="text-[34px] font-extrabold leading-none tracking-[-1px]">AED 1,742</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[12px] font-bold text-[#5a2ded]"><TrendingUp className="h-3 w-3" />22%</span>
          </div>
          <p className="mt-1.5 text-[13px] text-white/80">earned this month</p>
        </div>
        <svg viewBox="0 0 120 50" className="h-12 w-28 shrink-0" fill="none" aria-hidden="true">
          <polyline points="2,44 22,38 40,40 58,26 76,30 96,14 116,6" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="116" cy="6" r="3.5" fill="#fff" />
        </svg>
      </div>

      {!compact && (
        <div className="relative mt-5">
          <p className="text-[13px] font-semibold text-white/85">Your screens</p>
          <div className="mt-3 flex gap-3">
            {SCREENS.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1.5">
                <span className={`rounded-full bg-gradient-to-br p-[3px] ${s.ring}`}>
                  <span className="block rounded-full bg-[#4c22d6] p-[2px]">
                    <img src={s.img} alt="" loading="lazy" className="h-12 w-12 rounded-full object-cover" />
                  </span>
                </span>
                <span className="text-[11px] font-semibold">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <span className="absolute bottom-3 right-4 text-[10px] font-medium text-white/40">Example venue</span>
    </div>
  );
}

export function AdRequestCard() {
  return (
    <div className="w-[270px] rounded-[22px] bg-white p-3.5 text-[#111027] shadow-[0_24px_50px_-18px_rgba(17,16,39,0.45)] ring-1 ring-black/5">
      <div className="flex items-center gap-3">
        <img src="/site/v-gym.webp" alt="" className="h-12 w-12 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#5a2ded]">New ad request</p>
          <p className="truncate text-[13px] font-bold">FitZone Gym · 4 weeks</p>
          <p className="text-[11px] text-[#6b6787]">You earn <span className="font-bold text-emerald-600">AED 277</span></p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <span className="inline-flex h-8 items-center justify-center gap-1 rounded-lg bg-[#f3f1f9] text-[12px] font-semibold text-[#6b6787]"><X className="h-3.5 w-3.5" />Reject</span>
        <span className="inline-flex h-8 items-center justify-center gap-1 rounded-lg text-[12px] font-semibold text-white" style={{ backgroundImage: 'linear-gradient(135deg,#6f3ffd,#5a2ded)' }}><Check className="h-3.5 w-3.5" />Approve</span>
      </div>
    </div>
  );
}

export function LiveChip({ text = '6 screens online' }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12px] font-bold text-[#111027] shadow-[0_12px_30px_-12px_rgba(17,16,39,0.45)] ring-1 ring-black/5">
      <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>
      {text}
    </span>
  );
}

// Composed stack: earnings card with an ad request card and a live chip floating on it.
export default function ShowcaseStack({ greeting }) {
  return (
    <div className="relative mx-auto w-full max-w-[460px] pb-16">
      <EarningsCard greeting={greeting} />
      <div className="absolute -bottom-2 -right-3 sm:-right-8"><AdRequestCard /></div>
      <div className="absolute -left-3 -top-4 sm:-left-6"><LiveChip /></div>
    </div>
  );
}
