import { useEffect, useState } from 'react';
import { WifiOff, CloudUpload, History, AlertTriangle, RotateCcw, Hourglass, MessageCircle } from 'lucide-react';
import { useOnline, useOutboxCount, friendlyError } from '@/lib/states';

/** Sticky strip: offline / pending changes. */
export function OfflineBanner() {
  const online = useOnline();
  const pending = useOutboxCount();
  if (online && !pending) return null;
  return (
    <div className={`sticky top-16 z-20 flex items-center gap-2 px-4 md:px-8 py-2 text-[13px] font-semibold ${online ? 'bg-bw-lav text-bw-coral' : 'bg-amber-50 text-amber-800 border-b border-amber-200'}`}>
      {online ? <CloudUpload className="h-4 w-4 animate-pulse" /> : <WifiOff className="h-4 w-4" />}
      {online
        ? `Sending ${pending} saved ${pending === 1 ? 'change' : 'changes'}…`
        : `You're offline · what's on screen still works${pending ? ` · ${pending} ${pending === 1 ? 'change is' : 'changes are'} saved and will send when you're back` : ' · changes you make are saved on this device'}`}
    </div>
  );
}

/** Shown when a typed draft was brought back after refresh / session expiry. */
export function DraftBanner({ restored, onDiscard, what = 'changes' }) {
  if (!restored) return null;
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-bw-violet/30 bg-bw-lav px-4 py-3">
      <History className="h-4 w-4 text-bw-coral" />
      <p className="flex-1 text-[13px] font-semibold text-bw-navy">We brought back your unsaved {what}. Save to keep them.</p>
      <button type="button" className="!min-h-0 text-[12px] font-semibold text-bw-muted hover:text-bw-navy" onClick={onDiscard}>Discard</button>
    </div>
  );
}

/** Message right under a field. */
export function FieldError({ msg }) {
  if (!msg) return null;
  return <p role="alert" className="mt-1 flex items-center gap-1 text-[12px] font-medium text-rose-600"><AlertTriangle className="h-3 w-3 shrink-0" />{msg}</p>;
}

/** Full-card error with what happened, the fix, Retry and a second way out. */
export function ErrorState({ error, action = 'load this', onRetry }) {
  const { title, fix } = friendlyError(error, action);
  return (
    <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center">
      <div className="mx-auto h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center"><AlertTriangle className="h-6 w-6 text-rose-500" /></div>
      <p className="mt-3 text-[15px] font-bold text-bw-navy">{title}</p>
      <p className="mt-1 text-[13px] text-bw-muted max-w-md mx-auto">{fix}</p>
      <div className="mt-4 flex justify-center gap-2">
        {onRetry && <button type="button" className="bw-btn bw-btn-primary" onClick={onRetry}><RotateCcw className="h-4 w-4" />Try again</button>}
        <a className="bw-btn bw-btn-ghost" href="https://wa.me/971545469496" target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4 text-emerald-600" />Message support</a>
      </div>
    </div>
  );
}

/** After `after` ms of loading, tell the user it's the connection, not a freeze. */
export function SlowHint({ loading, after = 6000, forced = false }) {
  const [slow, setSlow] = useState(forced);
  useEffect(() => {
    if (forced) { setSlow(true); return undefined; }
    if (!loading) { setSlow(false); return undefined; }
    const id = setTimeout(() => setSlow(true), after);
    return () => clearTimeout(id);
  }, [loading, after, forced]);
  if (!slow || (!loading && !forced)) return null;
  return (
    <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-[13px] font-medium text-amber-800">
      <Hourglass className="h-4 w-4" />Slow connection — still loading. Your last saved content keeps playing on the screens.
    </div>
  );
}

/** Real progress for multi-file work: “Uploading 2 of 3 · photo.jpg”. */
export function ProgressStrip({ done, total, label }) {
  if (!total) return null;
  const pct = Math.round((done / total) * 100);
  return (
    <div className="mb-4 rounded-2xl bg-white border border-bw-line p-3">
      <div className="flex items-center justify-between text-[13px]"><span className="font-semibold text-bw-navy">{label || 'Uploading'} {Math.min(done + 1, total)} of {total}</span><span className="text-bw-muted">{pct}%</span></div>
      <div className="mt-2 h-2 rounded-full bg-bw-cream overflow-hidden"><div className="h-full bw-grad transition-all" style={{ width: `${Math.max(pct, 6)}%` }} /></div>
    </div>
  );
}
