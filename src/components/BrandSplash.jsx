import { MonitorPlay } from 'lucide-react';
import AccessingScreen from '@/components/auth/AccessingScreen';

// In-app brand splash (auth check / route loading). Matches the static splash in index.html.
export default function BrandSplash() {
  if (typeof window !== 'undefined' && window.__bwAccess) return <AccessingScreen step={2} />;
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center font-[Inter,system-ui,sans-serif]" role="status" aria-label="Loading Beyond Walls"
      style={{ background: 'radial-gradient(1200px 600px at 50% 40%,#2a1470 0%,rgba(42,20,112,0) 60%),linear-gradient(151deg,#140b3a 14%,#0d0a1f 54%,#2a0f6b 86%)' }}>
      <span className="bw-splash-logo flex items-center justify-center w-24 h-24 rounded-[26px] shadow-[0_24px_70px_rgba(111,63,253,0.5)]" style={{ backgroundImage: 'linear-gradient(135deg,#7c4dff 0%,#5a2ded 75%)' }}>
        <MonitorPlay className="w-[50px] h-[50px] text-white" strokeWidth={1.9} />
      </span>
      <span className="mt-[22px] font-extrabold text-[34px] tracking-[-0.03em] text-white">BeyondWalls</span>
      <span className="mt-1.5 text-[15px] font-medium text-[#bdb6e3]">Your screen runs your shop. Then it pays you.</span>
      <span className="relative mt-7 h-1 w-[140px] rounded-full bg-white/10 overflow-hidden"><span className="bw-splash-bar absolute inset-y-0 w-2/5 rounded-full bg-gradient-to-r from-[#8b6bff] to-[#c4b5fd]" /></span>
      <span className="absolute bottom-10 inset-x-0 flex flex-col items-center gap-1.5">
        <span className="text-[17px] font-semibold text-white"><span className="font-medium text-[#a39bd0]">A</span> Linkzone Global <span className="font-medium text-[#a39bd0]">company</span></span>
        <span className="text-[11px] text-[#6f6896]">Dubai Internet City · UAE</span>
      </span>
    </div>
  );
}
