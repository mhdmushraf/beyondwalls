import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, CalendarDays, Clock, X, Building2, Copy } from 'lucide-react';

export const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const TIME_PRESETS = [
  { id: 'all', label: 'All day', from: '', until: '' },
  { id: 'morning', label: 'Morning', hint: '06–12', from: '06:00', until: '12:00' },
  { id: 'lunch', label: 'Lunch', hint: '12–15', from: '12:00', until: '15:00' },
  { id: 'evening', label: 'Evening', hint: '17–24', from: '17:00', until: '24:00' },
  { id: 'custom', label: 'Custom' },
];
export const DEFAULT_SCHED = { preset: 'all', from: '', until: '', days: [0, 1, 2, 3, 4, 5, 6] };

export const addDaysISO = (iso, n) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
export const daysBetween = (a, b) => (a && b ? Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000) + 1 : 0);
const pretty = (iso) => (iso ? new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }) : '—');

export function schedSummary(sc) {
  const s = sc || DEFAULT_SCHED;
  const t = !s.from && !s.until ? 'All day' : `${s.from || '00:00'}–${s.until || '24:00'}`;
  const d = !s.days || s.days.length === 7 ? 'every day' : s.days.length ? s.days.map((x) => DAY_NAMES[x]).join(', ') : 'no days';
  return `${t} · ${d}`;
}

/** Styled dropdown — replaces native <select>. options: [{ value, label, hint? }] */
export function Select({ value, onChange, options, placeholder = 'Select…', className = '', compact = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const off = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', off);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', off); document.removeEventListener('keydown', esc); };
  }, [open]);
  const cur = options.find((o) => String(o.value) === String(value));
  return (
    <div ref={ref} className={`relative ${className}`}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open}
        className={`w-full flex items-center gap-2 rounded-xl border bg-white text-start transition ${open ? 'border-bw-violet ring-4 ring-bw-violet/15' : 'border-bw-line hover:border-bw-violet/50'} ${compact ? 'px-3 py-2 text-[13px]' : 'px-3.5 py-2.5 text-[14px]'}`}>
        <span className={`flex-1 min-w-0 truncate capitalize ${cur ? 'text-bw-navy font-medium' : 'text-bw-muted'}`}>{cur ? cur.label : placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-bw-muted transition ${open ? 'rotate-180 text-bw-violet' : ''}`} />
      </button>
      {open && (
        <ul role="listbox" className="absolute z-40 mt-1.5 w-full min-w-[200px] max-h-64 overflow-auto rounded-xl bg-white p-1.5 shadow-[0_18px_40px_-12px_rgba(17,16,39,0.35)] ring-1 ring-black/5">
          {options.map((o) => {
            const on = String(o.value) === String(value);
            return (
              <li key={String(o.value)}>
                <button type="button" role="option" aria-selected={on} onClick={() => { onChange(o.value); setOpen(false); }}
                  className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-start text-[13px] capitalize ${on ? 'bg-bw-violet/10 text-bw-violet font-semibold' : 'text-bw-ink hover:bg-bw-cream'}`}>
                  <span className="flex-1 min-w-0 truncate">{o.label}</span>
                  {o.hint && <span className="text-[11px] text-bw-muted normal-case">{o.hint}</span>}
                  {on && <Check className="h-4 w-4 shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Start + end date with quick-length chips. */
export function DateRange({ start, end, min, onChange, error }) {
  const days = daysBetween(start, end);
  const quick = [
    { label: '1 week', d: 7 }, { label: '2 weeks', d: 14 }, { label: '4 weeks', d: 28 }, { label: '8 weeks', d: 56 },
  ];
  const isQuick = quick.some((q) => q.d === days);
  return (
    <div className="rounded-2xl border border-bw-line bg-white p-3">
      <div className="flex items-center gap-2 mb-2">
        <CalendarDays className="h-4 w-4 text-bw-violet" />
        <p className="text-[12px] font-semibold text-bw-ink flex-1">When should it run?</p>
        <span className="bw-chip bg-bw-violet/10 text-bw-violet font-bold">{days > 0 ? `${days} day${days > 1 ? 's' : ''}` : '—'}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {quick.map((q) => (
          <button key={q.d} type="button" onClick={() => onChange({ start_date: start, end_date: addDaysISO(start, q.d - 1) })}
            className={`!min-h-0 rounded-full px-3 py-1.5 text-[12px] font-semibold transition ${days === q.d ? 'bg-bw-navy text-white' : 'bg-bw-cream text-bw-navy hover:bg-bw-violet/10'}`}>{q.label}</button>
        ))}
        <span className={`rounded-full px-3 py-1.5 text-[12px] font-semibold ${!isQuick && days > 0 ? 'bg-bw-navy text-white' : 'bg-bw-cream text-bw-muted'}`}>Custom dates</span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <label className="block">
          <span className="block text-[10px] font-bold uppercase tracking-wide text-bw-muted mb-1">Starts</span>
          <input type="date" min={min} value={start} className="bw-input !py-2 text-[13px]"
            onChange={(e) => { const s = e.target.value; if (!s) return; const keep = Math.max(days, 1); onChange({ start_date: s, end_date: end && end >= s ? end : addDaysISO(s, keep - 1) }); }} />
        </label>
        <span className="mt-5 text-bw-muted">→</span>
        <label className="block">
          <span className="block text-[10px] font-bold uppercase tracking-wide text-bw-muted mb-1">Ends</span>
          <input type="date" min={start} max={start ? addDaysISO(start, 83) : undefined} value={end} className="bw-input !py-2 text-[13px]"
            onChange={(e) => e.target.value && onChange({ start_date: start, end_date: e.target.value })} />
        </label>
      </div>
      <p className="mt-2 text-[11px] text-bw-muted">{pretty(start)} → {pretty(end)} · up to 12 weeks · priced per day</p>
      {error && <p className="mt-1 text-[12px] text-rose-600">{error}</p>}
    </div>
  );
}

/** One selected screen: photo, price, line total and its own play times. */
export function ScreenScheduleCard({ s, sched, days, onChange, onRemove, onApplyAll, showApplyAll, aed }) {
  const sc = sched || DEFAULT_SCHED;
  const perDay = s.price_per_week / 7;
  const line = Math.round(perDay * days * 100) / 100;
  const setPreset = (p) => {
    const def = TIME_PRESETS.find((x) => x.id === p);
    if (p === 'custom') onChange({ ...sc, preset: 'custom', from: sc.from || '09:00', until: sc.until || '18:00' });
    else onChange({ ...sc, preset: p, from: def.from, until: def.until });
  };
  const toggleDay = (d) => {
    const has = sc.days.includes(d);
    const next = has ? sc.days.filter((x) => x !== d) : [...sc.days, d].sort();
    onChange({ ...sc, days: next });
  };
  const full = s.slots_free <= 0;
  return (
    <div className={`rounded-2xl border bg-white overflow-hidden ${full ? 'border-amber-300' : 'border-bw-line'}`}>
      <div className="flex gap-3 p-2.5">
        <div className="relative h-16 w-24 shrink-0 rounded-xl overflow-hidden bg-bw-navy">
          {s.photo_url ? <img src={s.photo_url} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center"><Building2 className="h-6 w-6 text-white/30" /></div>}
          <span className="absolute bottom-1 start-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">{s.orientation === 'portrait' ? 'Portrait' : 'Landscape'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-bw-navy truncate">{s.venue.name}</p>
              <p className="text-[11px] text-bw-muted truncate">{s.name} · {s.venue.area || s.venue.emirate}</p>
            </div>
            <button type="button" className="!min-h-0 !min-w-0 h-7 w-7 -me-1 rounded-lg text-bw-muted hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center" onClick={onRemove} title="Remove"><X className="h-4 w-4" /></button>
          </div>
          <div className="mt-1.5 flex items-end justify-between gap-2">
            <p className="text-[11px] text-bw-muted leading-tight">{aed(s.price_per_week)}/wk<br />{aed(Math.round(perDay * 100) / 100)}/day × {days}</p>
            <p className="text-[15px] font-extrabold text-bw-navy">{aed(line)}</p>
          </div>
        </div>
      </div>
      {full && <p className="px-3 pb-2 text-[11px] font-semibold text-amber-700">Full for these dates — change dates or remove it.</p>}
      <div className="border-t border-bw-line bg-bw-cream/60 px-2.5 py-2.5 space-y-2">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-bw-violet" />
          <span className="text-[11px] font-bold text-bw-ink flex-1">Play times</span>
          <span className="text-[10px] text-bw-muted">Dubai time</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {TIME_PRESETS.map((p) => (
            <button key={p.id} type="button" onClick={() => setPreset(p.id)}
              className={`!min-h-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${sc.preset === p.id ? 'bg-bw-violet text-white shadow-sm' : 'bg-white text-bw-navy ring-1 ring-bw-line hover:ring-bw-violet/50'}`}>
              {p.label}{p.hint && <span className={`ms-1 ${sc.preset === p.id ? 'text-white/75' : 'text-bw-muted'}`}>{p.hint}</span>}
            </button>
          ))}
        </div>
        {sc.preset === 'custom' && (
          <div className="flex items-center gap-2">
            <input type="time" step="900" value={sc.from} onChange={(e) => onChange({ ...sc, from: e.target.value })} className="bw-input !py-1.5 text-[13px]" aria-label="Play from" />
            <span className="text-[12px] text-bw-muted">to</span>
            <input type="time" step="900" value={sc.until === '24:00' ? '23:59' : sc.until} onChange={(e) => onChange({ ...sc, until: e.target.value })} className="bw-input !py-1.5 text-[13px]" aria-label="Play until" />
          </div>
        )}
        <div className="flex items-center gap-1">
          {DAY_LETTERS.map((l, d) => {
            const on = sc.days.includes(d);
            return (
              <button key={d} type="button" onClick={() => toggleDay(d)} title={DAY_NAMES[d]} aria-pressed={on}
                className={`!min-h-0 !min-w-0 h-7 w-7 rounded-full text-[11px] font-bold transition ${on ? 'bg-bw-navy text-white' : 'bg-white text-bw-muted ring-1 ring-bw-line'}`}>{l}</button>
            );
          })}
          {showApplyAll && (
            <button type="button" onClick={onApplyAll} className="!min-h-0 ms-auto inline-flex items-center gap-1 text-[11px] font-semibold text-bw-violet hover:underline"><Copy className="h-3 w-3" />Use for all</button>
          )}
        </div>
        {!sc.days.length && <p className="text-[11px] text-rose-600">Pick at least one day.</p>}
        {sc.preset === 'custom' && sc.from && sc.until && sc.from === sc.until && <p className="text-[11px] text-rose-600">Start and end time can't be the same.</p>}
      </div>
    </div>
  );
}
