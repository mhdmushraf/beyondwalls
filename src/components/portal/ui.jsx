import React from 'react';

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
      <div>
        <h1 className="text-xl md:text-[26px] font-bold text-bw-navy tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-[13px] text-bw-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-bw-line bg-white/70 p-10 text-center">
      {Icon && (
        <div className="mx-auto h-12 w-12 rounded-2xl bg-bw-lav flex items-center justify-center">
          <Icon className="h-6 w-6 text-bw-coral" />
        </div>
      )}
      <p className="mt-3 text-sm font-semibold text-bw-navy">{title}</p>
      {body && <p className="mt-1 text-[13px] text-bw-muted max-w-sm mx-auto">{body}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative !min-h-0 !min-w-0 h-6 w-10 shrink-0 rounded-full transition-colors ${checked ? 'bw-grad' : 'bg-bw-line'} ${disabled ? 'opacity-50' : ''}`}
    >
      <span className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all ${checked ? 'start-[19px]' : 'start-[3px]'}`} />
    </button>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="block text-[12px] font-semibold text-bw-ink mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-bw-muted mt-1">{hint}</span>}
    </label>
  );
}

export function ScreenPicker({ screens, venues, value = [], onChange }) {
  const byVenue = venues.map((venue) => ({ venue, list: screens.filter((s) => s.venue_id === venue.id) }))
    .filter((g) => g.list.length);
  const orphan = screens.filter((s) => !venues.some((v) => v.id === s.venue_id));
  if (orphan.length) byVenue.push({ venue: { id: '_', name: 'Other' }, list: orphan });
  const toggle = (id) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  if (!screens.length) return <p className="text-[13px] text-bw-muted">No screens yet — add one in Screens.</p>;
  return (
    <div className="space-y-2">
      {byVenue.map(({ venue, list }) => {
        const all = list.every((s) => value.includes(s.id));
        return (
          <div key={venue.id} className="rounded-xl border border-bw-line p-3">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-bw-navy">{venue.name} · {list.length} {list.length === 1 ? 'screen' : 'screens'}</p>
              <button type="button" className="!min-h-0 text-[12px] font-semibold text-bw-coral"
                onClick={() => onChange(all ? value.filter((x) => !list.some((s) => s.id === x)) : [...new Set([...value, ...list.map((s) => s.id)])])}>
                {all ? 'Clear' : 'Select all'}
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {list.map((s) => {
                const on = value.includes(s.id);
                return (
                  <button key={s.id} type="button" onClick={() => toggle(s.id)}
                    className={`!min-h-0 rounded-full px-3 py-1.5 text-[12px] font-semibold border ${on ? 'bg-bw-lav border-bw-violet text-bw-coral' : 'bg-white border-bw-line text-bw-ink'}`}>
                    <span className={`inline-block h-1.5 w-1.5 rounded-full me-1.5 ${s.is_online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
