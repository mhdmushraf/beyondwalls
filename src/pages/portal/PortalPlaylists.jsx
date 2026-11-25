import { useEffect, useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, ListVideo, Loader2, Film, Image as ImageIcon, UtensilsCrossed, Clock, Save } from 'lucide-react';
import { toast } from 'sonner';
import { usePortal } from '@/lib/PortalContext';
import { useOrgEntity, uid } from '@/lib/useOrgEntity';
import { PageHeader, EmptyState, Toggle, Field, ScreenPicker } from '@/components/portal/ui';
import { ListSkeleton } from '@/components/portal/Skeletons';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function totalSeconds(items = []) {
  return items.reduce((s, i) => s + (Number(i.duration) || 0), 0);
}
function mmss(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function PortalPlaylists() {
  const { screens, venues } = usePortal();
  const { items: playlists, loading, create, update, remove } = useOrgEntity('Playlist', { sort: 'created_date' });
  const { items: media } = useOrgEntity('MediaAsset', { limit: 300 });
  const { items: menus } = useOrgEntity('MenuBoard');
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('media');

  useEffect(() => { if (!activeId && playlists.length) setActiveId(playlists[0].id); }, [playlists, activeId]);
  useEffect(() => {
    const p = playlists.find((x) => x.id === activeId);
    const copy = p ? JSON.parse(JSON.stringify(p)) : null;
    if (copy) copy.items = (copy.items || []).map((i) => ({ ...i, id: i.id || uid() }));
    setDraft(copy);
  }, [activeId, playlists.length]);

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const setItem = (id, patch) => setDraft((d) => ({ ...d, items: d.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));
  const move = (idx, dir) => setDraft((d) => {
    const items = [...(d.items || [])];
    const j = idx + dir;
    if (j < 0 || j >= items.length) return d;
    [items[idx], items[j]] = [items[j], items[idx]];
    return { ...d, items };
  });

  const addMedia = (a) => setDraft((d) => ({ ...d, items: [...(d.items || []), {
    id: uid(), kind: 'media', media_asset_id: a.id, name: a.name, url: a.file_url, type: a.file_type,
    duration: a.file_type === 'video' ? (a.duration_seconds || 15) : 10,
  }] }));
  const addMenu = (m) => setDraft((d) => ({ ...d, items: [...(d.items || []), {
    id: uid(), kind: 'menu', menu_board_id: m.id, name: m.name, duration: 20,
  }] }));

  const newPlaylist = async () => {
    const rec = await create({ name: 'Morning loop', items: [], screen_ids: [], days_of_week: [], start_time: '', end_time: '', is_active: true, priority: 0 });
    setActiveId(rec.id);
  };

  const save = async () => {
    setSaving(true);
    try {
      const { id, created_date, updated_date, created_by, created_by_id, org_id, org_member_user_ids, ...data } = draft; // eslint-disable-line no-unused-vars
      await update(activeId, data);
      toast.success(`Saved · plays on ${data.screen_ids?.length || 0} screens`);
    } catch (e) { toast.error('Could not save'); } finally { setSaving(false); }
  };

  if (loading) return <ListSkeleton rows={4} />;

  if (!playlists.length) {
    return (
      <div>
        <PageHeader title="Playlists & schedules" subtitle="What each screen plays, and when." />
        <EmptyState icon={ListVideo} title="Make your first playlist" body="Mix images, videos and menu boards, then choose screens and times."
          action={<button type="button" className="bw-btn bw-btn-primary" onClick={newPlaylist}><Plus className="h-4 w-4" />New playlist</button>} />
      </div>
    );
  }

  const sec = totalSeconds(draft?.items);

  return (
    <div>
      <PageHeader
        title="Playlists & schedules"
        subtitle="What each screen plays, and when · the newest matching playlist wins"
        actions={(
          <>
            <button type="button" className="bw-btn bw-btn-ghost" onClick={newPlaylist}><Plus className="h-4 w-4" />New playlist</button>
            <button type="button" className="bw-btn bw-btn-primary" onClick={save} disabled={saving || !draft}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save
            </button>
          </>
        )}
      />

      <div className="grid lg:grid-cols-[260px_1fr] gap-5">
        <div className="bw-card p-2 h-fit">
          {playlists.map((p) => (
            <button key={p.id} type="button" onClick={() => setActiveId(p.id)}
              className={`!min-h-0 w-full !justify-start text-start rounded-xl px-3 py-2.5 ${p.id === activeId ? 'bg-bw-lav' : 'hover:bg-bw-cream'}`}>
              <span className="block">
                <span className={`block text-[13px] font-semibold ${p.id === activeId ? 'text-bw-coral' : 'text-bw-navy'}`}>{p.name}</span>
                <span className="block text-[11px] text-bw-muted">
                  {(p.items || []).length} items · {mmss(totalSeconds(p.items))} · {(p.screen_ids || []).length} screens
                  {p.start_time ? ` · ${p.start_time}–${p.end_time || '24:00'}` : ''}
                </span>
              </span>
            </button>
          ))}
        </div>

        {draft && (
          <div className="grid xl:grid-cols-[1fr_340px] gap-5">
            <div className="space-y-5">
              <div className="bw-card p-5">
                <div className="flex items-center gap-3">
                  <input className="bw-input !text-[16px] font-bold" value={draft.name || ''} onChange={(e) => set({ name: e.target.value })} />
                  <span className="text-[12px] text-bw-muted whitespace-nowrap">{(draft.items || []).length} items · {mmss(sec)}</span>
                  <Toggle checked={draft.is_active !== false} onChange={(v) => set({ is_active: v })} />
                </div>

                <div className="mt-4 space-y-2">
                  {(draft.items || []).length === 0 && <p className="text-[13px] text-bw-muted py-6 text-center">Add media or a menu from the right →</p>}
                  {(draft.items || []).map((it, idx) => (
                    <div key={it.id} className="flex items-center gap-3 rounded-xl border border-bw-line p-2.5">
                      <div className="flex flex-col">
                        <button type="button" className="!min-h-0 !min-w-0 text-bw-muted hover:text-bw-navy" onClick={() => move(idx, -1)}><ArrowUp className="h-3.5 w-3.5" /></button>
                        <button type="button" className="!min-h-0 !min-w-0 text-bw-muted hover:text-bw-navy" onClick={() => move(idx, 1)}><ArrowDown className="h-3.5 w-3.5" /></button>
                      </div>
                      <span className="text-[11px] font-bold text-bw-muted w-5">{idx + 1}</span>
                      <div className="h-11 w-20 shrink-0 rounded-lg overflow-hidden bg-bw-navy flex items-center justify-center">
                        {it.kind === 'menu' ? <UtensilsCrossed className="h-5 w-5 text-amber-300" />
                          : it.type === 'video' ? <video src={it.url} muted preload="metadata" className="h-full w-full object-cover" />
                            : <img src={it.url} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-bw-navy truncate">{it.name}</p>
                        <p className="text-[11px] text-bw-muted">{it.kind === 'menu' ? 'Menu board · live prices' : it.type === 'video' ? 'Video' : 'Image'}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-bw-muted" />
                        <input type="number" min="3" max="600" className="bw-input !w-16 !py-1.5 !px-2 text-center" value={it.duration}
                          disabled={it.type === 'video' && it.kind === 'media'}
                          onChange={(e) => setItem(it.id, { duration: Number(e.target.value) || 5 })} />
                        <span className="text-[11px] text-bw-muted">s</span>
                      </div>
                      <button type="button" className="!min-h-0 !min-w-0 h-8 w-8 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center justify-center"
                        onClick={() => setDraft((d) => ({ ...d, items: d.items.filter((x) => x.id !== it.id) }))}><Trash2 className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bw-card p-5 space-y-4">
                <p className="text-[15px] font-bold text-bw-navy">Schedule</p>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((d, i) => {
                    const days = draft.days_of_week || [];
                    const on = days.length === 0 || days.includes(i);
                    return (
                      <button key={d} type="button"
                        onClick={() => {
                          const base = days.length === 0 ? [0, 1, 2, 3, 4, 5, 6] : days;
                          const next = base.includes(i) ? base.filter((x) => x !== i) : [...base, i].sort();
                          set({ days_of_week: next.length === 7 ? [] : next });
                        }}
                        className={`!min-h-0 rounded-lg px-3 py-1.5 text-[12px] font-semibold ${on ? 'bw-grad text-white' : 'bg-bw-cream text-bw-muted'}`}>{d}</button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <Field label="From" hint="Empty = all day"><input type="time" className="bw-input" value={draft.start_time || ''} onChange={(e) => set({ start_time: e.target.value })} /></Field>
                  <Field label="Until"><input type="time" className="bw-input" value={draft.end_time || ''} onChange={(e) => set({ end_time: e.target.value })} /></Field>
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-bw-ink mb-2">Plays on</p>
                  <ScreenPicker screens={screens} venues={venues} value={draft.screen_ids || []} onChange={(v) => set({ screen_ids: v })} />
                </div>
                <div className="flex justify-end">
                  <button type="button" className="bw-btn bw-btn-ghost !text-rose-600" onClick={async () => {
                    if (!window.confirm(`Delete ${draft.name}?`)) return;
                    await remove(activeId); setActiveId(null); toast.success('Playlist deleted');
                  }}><Trash2 className="h-4 w-4" />Delete playlist</button>
                </div>
              </div>
            </div>

            <div className="bw-card p-4 h-fit xl:sticky xl:top-20">
              <div className="inline-flex rounded-xl bg-[#EEEDF5] p-1 mb-3">
                {[['media', 'Media'], ['menus', 'Menus']].map(([k, l]) => (
                  <button key={k} type="button" onClick={() => setTab(k)}
                    className={`!min-h-0 rounded-lg px-4 py-1.5 text-[12px] font-semibold ${tab === k ? 'bg-white text-bw-navy shadow-sm' : 'text-bw-muted'}`}>{l}</button>
                ))}
              </div>
              <div className="max-h-[520px] overflow-y-auto space-y-2">
                {tab === 'media' ? (media.length ? media.map((a) => (
                  <button key={a.id} type="button" onClick={() => addMedia(a)}
                    className="!min-h-0 w-full !justify-start flex items-center gap-3 rounded-xl p-2 hover:bg-bw-cream text-start">
                    <span className="h-10 w-16 shrink-0 rounded-md overflow-hidden bg-bw-navy">
                      {a.file_type === 'video' ? <video src={a.file_url} muted preload="metadata" className="h-full w-full object-cover" /> : <img src={a.file_url} alt="" className="h-full w-full object-cover" />}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[12px] font-semibold text-bw-navy truncate">{a.name}</span>
                      <span className="block text-[11px] text-bw-muted">{a.file_type === 'video' ? <Film className="inline h-3 w-3" /> : <ImageIcon className="inline h-3 w-3" />} {a.file_type}</span>
                    </span>
                    <Plus className="h-4 w-4 text-bw-coral" />
                  </button>
                )) : <p className="text-[12px] text-bw-muted p-2">Upload media in the Media library first.</p>)
                  : (menus.length ? menus.map((m) => (
                    <button key={m.id} type="button" onClick={() => addMenu(m)}
                      className="!min-h-0 w-full !justify-start flex items-center gap-3 rounded-xl p-2 hover:bg-bw-cream text-start">
                      <span className="h-10 w-16 shrink-0 rounded-md bg-[#15112B] flex items-center justify-center"><UtensilsCrossed className="h-4 w-4 text-amber-300" /></span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[12px] font-semibold text-bw-navy truncate">{m.name}</span>
                        <span className="block text-[11px] text-bw-muted">{(m.items || []).length} items</span>
                      </span>
                      <Plus className="h-4 w-4 text-bw-coral" />
                    </button>
                  )) : <p className="text-[12px] text-bw-muted p-2">Create a menu in Menus & prices first.</p>)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
