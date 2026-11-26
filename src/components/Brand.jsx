import { MonitorPlay } from 'lucide-react';

const GRAD = 'linear-gradient(135deg, #6f3ffd 0%, #5a2ded 71%)';

// The one Beyond Walls mark: purple tile, white monitor with play button.
export function BrandTile({ size = 36, dark = false }) {
  const icon = Math.round(size * 0.52);
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center shadow-[0_6px_18px_rgba(111,63,253,0.35)]"
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.3), backgroundImage: GRAD, outline: dark ? '1px solid rgba(255,255,255,0.12)' : 'none' }}
    >
      <MonitorPlay className="text-white" style={{ width: icon, height: icon }} />
    </span>
  );
}

export function BrandLogo({ size = 36, dark = false, endorsement = false }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <BrandTile size={size} dark={dark} />
      <span className="leading-tight">
        <span className={`block font-bold tracking-tight ${dark ? 'text-white' : 'text-[#111027]'}`} style={{ fontSize: Math.round(size * 0.48) }}>BeyondWalls</span>
        {endorsement && <span className={`block text-[11px] font-medium ${dark ? 'text-[#a99ee6]' : 'text-[#8a86a3]'}`}>A Linkzone Global company</span>}
      </span>
    </span>
  );
}

// Static brand background: soft colour fields + fine grid. No motion.
export function BrandBackdrop({ tone = 'light' }) {
  const light = tone === 'light';
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
      <div className={`absolute inset-0 ${light ? 'bg-[#f6f5fb]' : 'bg-[#0d0824]'}`} />
      <div className="absolute -top-40 -left-40 h-[560px] w-[560px] rounded-full blur-[120px]" style={{ background: light ? 'rgba(111,63,253,0.18)' : 'rgba(111,63,253,0.40)' }} />
      <div className="absolute top-1/3 -right-48 h-[520px] w-[520px] rounded-full blur-[130px]" style={{ background: light ? 'rgba(56,189,248,0.14)' : 'rgba(45,212,191,0.16)' }} />
      <div className="absolute -bottom-56 left-1/4 h-[480px] w-[480px] rounded-full blur-[130px]" style={{ background: light ? 'rgba(244,114,182,0.10)' : 'rgba(111,63,253,0.22)' }} />
      <div
        className="absolute inset-0"
        style={{
          opacity: light ? 0.55 : 0.08,
          backgroundImage: light
            ? 'radial-gradient(rgba(90,45,237,0.14) 1px, transparent 1px)'
            : 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: light ? '22px 22px' : '44px 44px',
          maskImage: 'radial-gradient(ellipse at 50% 30%, #000 40%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, #000 40%, transparent 85%)',
        }}
      />
    </div>
  );
}

export { GRAD as BRAND_GRAD };
