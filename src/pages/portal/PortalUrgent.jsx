import React, { useState } from 'react';
import { Send, AlertTriangle, Loader2, Square, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { usePortal } from '@/lib/PortalContext';
import { useOrgEntity } from '@/lib/useOrgEntity';
import { timeAgo } from '@/lib/portalData';
import { PageHeader, Field, ScreenPicker } from '@/components/portal/ui';
import { ScaledCanvas } from '@/components/player/MenuBoardView';
import UrgentOverlay from '@/components/player/UrgentOverlay';

const QUICK = [
  ['Kitchen closed', 'المطبخ مغلق'],
  ['Back in 10 min', 'نعود خلال 10 دقائق'],
  ['Prayer break', 'استراحة صلاة'],
  ['Card machine down', 'جهاز البطاقات معطّل'],
  ['Closing early today', 'نغلق مبكرًا اليوم'],
  ['Lost child — please call staff', 'طفل تائه — يرجى الاتصال بالموظفين'],
];
const DURATIONS = [[15, '15 min'], [30, '30 min'], [60, '1 hour'], [120, '2 hours'], [240, '4 hours']];

export function isLive(m) {
  if (m.status === 'cancelled' || m.status === 'ended') return false;
  const now = Date.now();
  if (m.starts_at && new Date(m.starts_at).getTime() > now) return false;
  if (m.ends_at && new Date(m.ends_at).getTime() < now) return false;
  return true;
}

export default function PortalUrgent() {
  const { user } = useAuth();
  const { screens, venues } = usePortal();
  const { items, create, update } = useOrgEntity('UrgentMessage', { limit: 30 });
  const [form, setForm] = useState({ text_en: 'Kitchen closed', text_ar: 'المطبخ مغلق', subtext: '', style: 'urgent', minutes: 60, sound: 'chime_once' });
  const [targets, setTargets] = useState(() => screens.map((s) => s.id));
  const [busy, setBusy] = useState(false);
  const set = (p) => setForm((f) => ({ ...f, ...p }));

  const send = async () => {
    if (!form.text_en.trim()) { toast.error('Write a message'); return; }
    if (!targets.length) { toast.error('Pick at least one screen'); return; }
    setBusy(true);
    try {
      const now = new Date();
      await create({
        text_en: form.text_en.trim(), text_ar: form.text_ar.trim(), subtext: form.subtext.trim(), style: form.style,
        screen_ids: targets, starts_at: now.toISOString(), ends_at: new Date(now.getTime() + form.minutes * 60000).toISOString(),
        sound: form.sound, status: 'live', sent_by_name: user?.full_name || user?.email || '',
      });
      toast.success(`Showing on ${targets.length} screens within a minute`);
    } catch (e) { toast.error('Could not send'); } finally { setBusy(false); }
  };

  const live = items.filter(isLive);

  return (
    <div>
      <PageHeader
        title="Urgent message"
        subtitle="Takes over your screens · ends on its own"
        actions={(
          <button type="button" onClick={send} disabled={busy} className="bw-btn bw-btn-danger">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Show now on {targets.length} screens
          </button>
        )}
      />

      {live.length > 0 && (
        <div className="mb-5 space-y-2">
          {live.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3">
              <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" /></span>
              <p className="flex-1 text-[13px] font-semibold text-rose-700">LIVE · {m.text_en} · {(m.screen_ids || []).length} screens · ends {new Date(m.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <button type="button" className="bw-btn bw-btn-ghost !py-1.5" onClick={async () => { await update(m.id, { status: 'ended', ends_at: new Date().toISOString() }); toast.success('Ended'); }}>
                <Square className="h-3.5 w-3.5" />End now
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid xl:grid-cols-[1fr_520px] gap-5">
        <div className="bw-card p-5 space-y-4">
          <div>
            <p className="text-[13px] font-bold text-bw-navy mb-2">Quick messages</p>
            <div className="flex flex-wrap gap-2">
              {QUICK.map(([en, ar]) => (
                <button key={en} type="button" onClick={() => set({ text_en: en, text_ar: ar })}
                  className={`!min-h-0 bw-chip !text-[12px] !py-1.5 !px-3 ${form.text_en === en ? 'bg-bw-red text-white' : 'bg-bw-cream text-bw-ink'}`}>{en}</button>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Message (English)"><input className="bw-input" maxLength={60} value={form.text_en} onChange={(e) => set({ text_en: e.target.value })} /></Field>
            <Field label="Message (Arabic)"><input className="bw-input bw-ar text-right" dir="rtl" maxLength={60} value={form.text_ar} onChange={(e) => set({ text_ar: e.target.value })} /></Field>
          </div>
          <Field label="Small line (optional)"><input className="bw-input" maxLength={80} placeholder="Sorry for the wait — drinks & bakery still open" value={form.subtext} onChange={(e) => set({ subtext: e.target.value })} /></Field>
          <div>
            <p className="text-[13px] font-bold text-bw-navy mb-2">Style</p>
            <div className="flex gap-2">
              {[['urgent', 'Urgent', '#E5484D'], ['notice', 'Notice', '#F59E0B'], ['info', 'Info', '#5A2DED']].map(([k, l, c]) => (
                <button key={k} type="button" onClick={() => set({ style: k })}
                  className={`!min-h-0 flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-[13px] font-semibold ${form.style === k ? 'border-2' : 'border-bw-line'}`}
                  style={form.style === k ? { borderColor: c } : {}}>
                  <span className="h-3.5 w-3.5 rounded-full" style={{ background: c }} />{l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[13px] font-bold text-bw-navy mb-2">Show on</p>
            <ScreenPicker screens={screens} venues={venues} value={targets} onChange={setTargets} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Show for">
              <select className="bw-input" value={form.minutes} onChange={(e) => set({ minutes: Number(e.target.value) })}>
                {DURATIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </Field>
            <Field label="Sound">
              <select className="bw-input" value={form.sound} onChange={(e) => set({ sound: e.target.value })}>
                <option value="none">No sound</option><option value="chime_once">Chime once</option><option value="chime_repeat">Chime every minute</option>
              </select>
            </Field>
          </div>
          <p className="text-[12px] text-bw-muted flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" />Ads pause while the message shows; advertisers are credited back.</p>
        </div>

        <div className="space-y-5">
          <div className="bw-card p-4">
            <p className="text-[13px] font-bold text-bw-navy mb-3">Live preview</p>
            <div className="rounded-xl overflow-hidden border-[5px] border-bw-navy">
              <ScaledCanvas><UrgentOverlay message={form} inline /></ScaledCanvas>
            </div>
          </div>
          <div className="bw-card p-4">
            <p className="text-[13px] font-bold text-bw-navy mb-1">Recent</p>
            {items.filter((m) => !isLive(m)).slice(0, 6).map((m) => (
              <div key={m.id} className="flex items-center gap-3 py-2.5 border-t border-bw-line first:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-bw-navy truncate">{m.text_en}</p>
                  <p className="text-[11px] text-bw-muted">{timeAgo(m.created_date)} · {(m.screen_ids || []).length} screens · by {m.sent_by_name || '—'}</p>
                </div>
                <button type="button" className="bw-btn bw-btn-ghost !py-1.5" onClick={() => { set({ text_en: m.text_en, text_ar: m.text_ar || '', subtext: m.subtext || '', style: m.style || 'urgent' }); setTargets(m.screen_ids || []); }}>
                  <RotateCcw className="h-3.5 w-3.5" />Reuse
                </button>
              </div>
            ))}
            {!items.filter((m) => !isLive(m)).length && <p className="text-[12px] text-bw-muted py-3">No messages sent yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
