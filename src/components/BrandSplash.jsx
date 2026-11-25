import { MonitorPlay } from 'lucide-react';

// Full-screen brand splash shown while the app boots or a route loads. Same look as the
// static splash in index.html, so there is no white flash and no spinner.
export default function BrandSplash() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5" style={{ background: 'linear-gradient(151deg,#140b3a 14%,#0d0a1f 54%,#2a0f6b 86%)' }} role="status" aria-label="Loading Beyond Walls">
      <span className="bw-splash-logo flex items-center justify-center w-16 h-16 rounded-[18px] shadow-[0_20px_60px_rgba(111,63,253,0.55)]" style={{ backgroundImage: 'linear-gradient(135deg,#6f3ffd 0%,#5a2ded 71%)' }}>
        <MonitorPlay className="w-8 h-8 text-white" />
      </span>
      <span className="font-bold text-[20px] text-white tracking-tight">BeyondWalls</span>
      <span className="relative h-1 w-28 rounded-full bg-white/10 overflow-hidden"><span className="bw-splash-bar absolute inset-y-0 w-1/3 rounded-full bg-[#8b6bff]" /></span>
    </div>
  );
}
