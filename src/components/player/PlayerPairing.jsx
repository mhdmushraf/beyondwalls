import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { BrandTile } from '@/components/Brand';

export default function PlayerPairing({ code, onSubmit, busy, error }) {
  const { t } = useI18n();
  const [entered, setEntered] = useState('');

  const chars = (code || '------').split('');

  return (
    <div className="fixed inset-0 bg-bw-navy text-white flex flex-col items-center justify-center px-6 overflow-auto">
      <div className="absolute inset-0 bg-gradient-to-br from-bw-navy via-bw-navy to-bw-coral/40" />

      <div className="relative z-10 w-full max-w-xl text-center">
        <div className="mx-auto flex items-center gap-2.5 justify-center">
          <BrandTile size={36} dark />
          <span className="text-[16px] font-bold tracking-tight">BeyondWalls</span>
        </div>

        <h1 className="mt-8 text-2xl md:text-3xl font-semibold">{t('player.enterCodeTitle')}</h1>
        <p className="mt-2 text-sm text-white/60 max-w-md mx-auto">{t('player.enterCodeBody')}</p>

        <div className="mt-8 flex items-center justify-center gap-2 md:gap-3">
          {chars.map((char, index) => (
            <span
              key={index}
              className="h-16 w-12 md:h-20 md:w-16 rounded-2xl bg-white/10 backdrop-blur border border-white/15 text-2xl md:text-3xl font-semibold flex items-center justify-center tracking-tight"
            >
              {char}
            </span>
          ))}
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] text-white/70">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {t('player.waiting')}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (entered.length === 6) onSubmit(entered);
          }}
          className="mt-10 max-w-xs mx-auto text-start"
        >
          <label htmlFor="player-code" className="block text-[11px] uppercase tracking-wide text-white/40">
            {t('player.haveCode')}
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="player-code"
              value={entered}
              onChange={(event) => setEntered(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
              placeholder="ABC123"
              className="flex-1 rounded-xl bg-white/10 border border-white/15 px-3 py-2.5 text-center text-sm font-semibold tracking-[0.3em] text-white placeholder:text-white/25 focus:outline-none focus:border-bw-coral"
            />
            <button
              type="submit"
              disabled={busy || entered.length !== 6}
              className="rounded-xl bg-bw-coral px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            >
              {busy ? '…' : '→'}
            </button>
          </div>
          {error && <p className="mt-2 text-[11px] text-rose-300">{error}</p>}
        </form>
      </div>
    </div>
  );
}