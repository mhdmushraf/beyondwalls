import { validate, rules, notifyError, notifySuccess, isOnline } from '@/lib/states';
import { FieldError } from '@/components/states/StateViews';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, RotateCcw, Power, RefreshCw, MonitorPlay, Siren, ListVideo, UtensilsCrossed, QrCode, Save, Loader2, Camera } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { usePortal } from '@/lib/PortalContext';
import { useOrgEntity } from '@/lib/useOrgEntity';
import { useSignedUrl, uploadPublic, formatDateTime, timeAgo, SCREEN_MODES, PLAYER_TYPES } from '@/lib/portalData';
import { PageSkeleton } from '@/components/portal/Skeletons';
import { Toggle, Field } from '@/components/portal/ui';
import { screenState } from './PortalScreens';

function AssignList({ title, icon: Icon, items, screenId, onToggle, empty, to, sub }) {
  return (
    <div className="bw-card p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[14px] font-bold text-bw-navy flex items-center gap-2"><Icon className="h-4 w-4 text-bw-coral" />{title}</p>
        <Link to={to} className="text-[12px] font-semibold text-bw-coral">Manage</Link>
      </div>
      {items.length === 0 ? <p className="text-[12px] text-bw-muted py-2">{empty}</p> : items.map((it) => (
        <div key={it.id} className="flex items-center gap-3 py-2 border-t border-bw-line first:border-0">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-bw-navy truncate">{it.name || it.label}</p>
            <p className="text-[11px] text-bw-muted truncate">{sub(it)}</p>
          </div>
          <Toggle checked={(it.screen_ids || []).includes(screenId)} onChange={(v) => onToggle(it, v)} />
        </div>
      ))}
    </div>
  );
}

export default function PortalScreenDetail() {
  const { screenId } = useParams();
  const { screens, venues, loadingData, reload } = usePortal();
  const screen = screens.find((s) => s.id === screenId);
  const venue = venues.find((v) => v.id === screen?.venue_id);
  const snapshot = useSignedUrl(screen?.last_snapshot_url);
  const playlists = useOrgEntity('Playlist', { sort: 'created_date' });
  const menus = useOrgEntity('MenuBoard', { sort: 'created_date' });
  const qrs = useOrgEntity('QRCode', { sort: 'created_date' });
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [blanked, setBlanked] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (screen && !form) {
      setForm({ name: screen.name || '', position_label: screen.position_label || '', orientation: screen.orientation || 'landscape', mode: screen.mode || 'signage_ads', screen_image_url: screen.screen_image_url || '' });
      setBlanked((screen.player_command || '').startsWith('blank'));
    }
  }, [screen, form]);

  useEffect(() => { const id = setInterval(reload, 30000); return () => clearInterval(id); }, [reload]);

  if (loadingData && !screen) return <PageSkeleton />;
  if (!screen) {
    return (
      <div className="bw-card p-10 text-center">
        <p className="text-[16px] font-bold text-bw-navy">We can't find this screen</p>
        <p className="mt-1 text-sm text-bw-muted">It may have been removed, or it belongs to another business. Pick it again from your screens list.</p>
        <Link to="/app/screens" className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold text-bw-coral"><ArrowLeft className="h-4 w-4" />Screens</Link>
      </div>
    );
  }

  const state = screenState(screen);
  const cmd = async (action, msg) => {
    if (!isOnline()) { toast.error("You're offline", { description: 'Remote controls need internet. Try again when you reconnect.' }); return; }
    try {
      await base44.entities.Screen.update(screen.id, { player_command: `${action}:${Date.now()}` });
      notifySuccess(msg || 'Sent to the TV', state === 'online' ? 'It picks it up within 15 seconds.' : 'The TV is offline — it runs this as soon as it reconnects.');
    } catch (e) { notifyError(e, 'send that to the TV', () => cmd(action, msg)); }
  };
  const toggleAssign = (hook) => async (it, on) => {
    const ids = new Set(it.screen_ids || []);
    if (on) ids.add(screen.id); else ids.delete(screen.id);
    try { await hook.update(it.id, { screen_ids: [...ids] }); } catch (e) { notifyError(e, on ? `add ${it.name || it.label}` : `remove ${it.name || it.label}`); }
  };
  const save = async () => {
    const errs = validate({ name: [rules.required('Screen name'), rules.max('Screen name', 40)], position_label: [rules.max('Position', 40)] }, form);
    setErrors(errs);
    if (Object.keys(errs).length) { toast.error('Fix the highlighted fields first', { description: Object.values(errs)[0] }); return; }
    setBusy(true);
    try { await base44.entities.Screen.update(screen.id, form); reload(); notifySuccess('Screen saved', 'Changes show on the TV within a minute.'); } catch (e) { notifyError(e, 'save the screen', save); } finally { setBusy(false); }
  };

  const chip = { online: ['bg-emerald-50 text-emerald-700', 'Online'], offline: ['bg-rose-50 text-rose-600', 'Offline'], unpaired: ['bg-amber-50 text-amber-700', 'Not paired'] }[state];

  return (
    <div className="space-y-5">
      <div>
        <Link to="/app/screens" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-bw-muted hover:text-bw-navy"><ArrowLeft className="h-3.5 w-3.5" />Screens</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-[26px] font-bold text-bw-navy">{screen.name}</h1>
          <span className={`bw-chip ${chip[0]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{chip[1]}</span>
          <span className="bw-chip bg-bw-lav text-bw-coral">{SCREEN_MODES.find((m) => m.value === screen.mode)?.label}</span>
        </div>
        <p className="mt-1 text-[13px] text-bw-muted">{venue?.name || '—'} · {screen.position_label || '—'} · {PLAYER_TYPES.find((p) => p.value === screen.player_type)?.label || 'Player'}</p>
      </div>

      <div className="grid xl:grid-cols-[1fr_380px] gap-5">
        <div className="space-y-5">
          <div className="bw-card overflow-hidden">
            <div className="relative aspect-video bg-bw-navy">
              {snapshot ? <img src={snapshot} alt="" className="h-full w-full object-contain" />
                : <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-white/40"><MonitorPlay className="h-9 w-9" /><span className="text-[12px]">A live snapshot appears here every 5 minutes</span></div>}
              <span className="absolute top-3 start-3 bw-chip bg-black/60 text-white">Live view</span>
            </div>
            <div className="grid grid-cols-3 gap-3 p-4">
              <div><p className="text-[11px] text-bw-muted">Now playing</p><p className="text-[13px] font-semibold text-bw-navy truncate">{screen.current_item || '—'}</p></div>
              <div><p className="text-[11px] text-bw-muted">Last check-in</p><p className="text-[13px] font-semibold text-bw-navy">{screen.last_heartbeat ? timeAgo(screen.last_heartbeat) : 'never'}</p></div>
              <div><p className="text-[11px] text-bw-muted">Uptime</p><p className="text-[13px] font-semibold text-bw-navy">{screen.uptime_seconds ? `${Math.round(screen.uptime_seconds / 3600)} h` : '—'}</p></div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <AssignList title="Playlists" icon={ListVideo} items={playlists.items} screenId={screen.id} onToggle={toggleAssign(playlists)} to="/app/playlists"
              empty="No playlists yet." sub={(p) => `${(p.items || []).length} items${p.start_time ? ` · ${p.start_time}–${p.end_time || '24:00'}` : ' · all day'}`} />
            <AssignList title="Menus" icon={UtensilsCrossed} items={menus.items} screenId={screen.id} onToggle={toggleAssign(menus)} to="/app/menus"
              empty="No menus yet." sub={(m) => `${(m.items || []).length} items`} />
            <AssignList title="QR overlay" icon={QrCode} items={qrs.items} screenId={screen.id} onToggle={toggleAssign(qrs)} to="/app/qr"
              empty="No QR codes yet." sub={(q) => `${q.scans || 0} scans`} />
          </div>
        </div>

        <div className="space-y-5">
          <div className="bw-card p-4">
            <p className="text-[14px] font-bold text-bw-navy mb-3">Controls</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" className="bw-btn bw-btn-ghost" onClick={() => cmd('refresh', 'Content refreshing')}><RefreshCw className="h-4 w-4" />Reload</button>
              <button type="button" className="bw-btn bw-btn-ghost" onClick={() => cmd('restart', 'Restarting player')}><RotateCcw className="h-4 w-4" />Restart</button>
              <button type="button" className={`bw-btn ${blanked ? 'bw-btn-primary' : 'bw-btn-ghost'}`} onClick={() => { cmd(blanked ? 'unblank' : 'blank', blanked ? 'Screen on' : 'Screen off'); setBlanked(!blanked); }}><Power className="h-4 w-4" />{blanked ? 'Turn on' : 'Screen off'}</button>
              <Link to="/app/urgent" className="bw-btn bw-btn-danger"><Siren className="h-4 w-4" />Urgent</Link>
            </div>
          </div>

          {!screen.paired_device_id && (
            <div className="bw-card p-4">
              <p className="text-[14px] font-bold text-bw-navy">Pair this screen</p>
              <p className="text-[12px] text-bw-muted">Open {window.location.origin}/player on the TV and type:</p>
              <div className="mt-2 flex gap-1.5">{(screen.pairing_code || '------').split('').map((c, i) => <span key={i} className="h-10 w-9 rounded-lg bw-grad text-white text-[16px] font-bold flex items-center justify-center">{c}</span>)}</div>
            </div>
          )}

          {form && (
            <div className="bw-card p-4 space-y-3">
              <p className="text-[14px] font-bold text-bw-navy">Settings</p>
              <Field label="Name"><input className="bw-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><FieldError msg={errors.name} /></Field>
              <Field label="Where is it?"><input className="bw-input" value={form.position_label} onChange={(e) => setForm({ ...form, position_label: e.target.value })} /><FieldError msg={errors.position_label} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Orientation"><select className="bw-input" value={form.orientation} onChange={(e) => setForm({ ...form, orientation: e.target.value })}><option value="landscape">Landscape</option><option value="portrait">Portrait</option></select></Field>
                <Field label="Mode"><select className="bw-input" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })}>{SCREEN_MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}</select></Field>
              </div>
              <div className="flex items-center gap-3">
                {form.screen_image_url ? <img src={form.screen_image_url} alt="" className="h-12 w-16 rounded-lg object-cover" /> : <span className="h-12 w-16 rounded-lg bg-bw-cream flex items-center justify-center"><Camera className="h-4 w-4 text-bw-muted" /></span>}
                <label className="bw-btn bw-btn-ghost !py-1.5 cursor-pointer">Photo of the screen<input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setForm({ ...form, screen_image_url: await uploadPublic(f) }); }} /></label>
              </div>
              <button type="button" className="bw-btn bw-btn-primary w-full" onClick={save} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save</button>
              {screen.paired_at && <p className="text-[11px] text-bw-muted">Paired {formatDateTime(screen.paired_at)} · device {String(screen.paired_device_id).slice(0, 8)}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
