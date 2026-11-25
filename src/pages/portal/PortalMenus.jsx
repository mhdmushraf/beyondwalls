import { useEffect, useMemo, useState } from 'react';
import { Plus, Send, Trash2, ArrowUp, ArrowDown, UtensilsCrossed, Loader2, Copy, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { usePortal } from '@/lib/PortalContext';
import { useOrgEntity, uid } from '@/lib/useOrgEntity';
import { uploadPublic } from '@/lib/portalData';
import { PageHeader, EmptyState, Toggle, Field, ScreenPicker } from '@/components/portal/ui';
import MenuBoardView, { MENU_THEMES } from '@/components/player/MenuBoardView';
import { ListSkeleton } from '@/components/portal/Skeletons';
import { useNavigate } from 'react-router-dom';
import { useDraft, validate, rules, notifyError, notifySuccess } from '@/lib/states';
import { DraftBanner, FieldError, ErrorState, SlowHint } from '@/components/states/StateViews';

const LAYOUTS = [
  { key: 'photo_left', label: 'Photo + list' },
  { key: 'list', label: 'List' },
  { key: 'two_column', label: 'Two columns' },
  { key: 'photo_top', label: 'Photo on top' },
];
const TAGS = ['NEW', 'Popular', 'Vegan', 'Spicy'];

function blankBoard() {
  return {
    name: 'Breakfast', name_ar: 'الفطور', layout: 'photo_left', theme: 'night', currency: 'AED',
    items: [
      { id: uid(), name_en: 'Avocado toast', name_ar: 'توست أفوكادو', price: 32, tags: ['NEW'], emoji: '🥑', sold_out: false },
      { id: uid(), name_en: 'Eggs Benedict', name_ar: 'بيض بنديكت', price: 38, tags: [], emoji: '🍳', sold_out: false },
    ],
    screen_ids: [], show_from: '', show_until: '',
  };
}

export default function PortalMenus() {
  const { screens, venues } = usePortal();
  const { items: boards, loading, error, reload, create, update, remove, preview } = useOrgEntity('MenuBoard', { sort: 'created_date' });
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!activeId && boards.length) setActiveId(boards[0].id);
  }, [boards, activeId]);

  useEffect(() => {
    const b = boards.find((x) => x.id === activeId);
    setDraft(b ? JSON.parse(JSON.stringify(b)) : null);
    setEditingId(b?.items?.[0]?.id || null);
  }, [activeId, boards.length]);

  const activeBoard = boards.find((x) => x.id === activeId);
  const { restored, discard, clear } = useDraft(activeId ? `menu:${activeId}` : null, draft, setDraft, { saved: activeBoard, enabled: !!activeBoard && !!draft });

  const dirty = useMemo(() => {
    const b = boards.find((x) => x.id === activeId);
    return b && draft && JSON.stringify(b) !== JSON.stringify({ ...b, ...draft });
  }, [boards, activeId, draft]);

  const check = (d) => {
    const errs = validate({ name: [rules.required('Menu name'), rules.max('Menu name', 40)] }, d);
    for (const item of d.items || []) {
      const e = validate({ name_en: [rules.required('Item name'), rules.max('Item name', 40)], price: [rules.price('Price')] }, item);
      if (Object.keys(e).length) { errs[`item:${item.id}`] = e; if (!errs.firstItem) errs.firstItem = item.id; }
    }
    return errs;
  };

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const setItem = (id, patch) => setDraft((d) => ({ ...d, items: d.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));
  const move = (idx, dir) => setDraft((d) => {
    const items = [...d.items];
    const j = idx + dir;
    if (j < 0 || j >= items.length) return d;
    [items[idx], items[j]] = [items[j], items[idx]];
    return { ...d, items };
  });

  const newBoard = async () => {
    try {
      const rec = await create(blankBoard());
      setActiveId(rec.id);
      notifySuccess('Menu created', 'Edit the items, pick your screens, then Publish.');
    } catch (e) { notifyError(e, 'create the menu', newBoard); }
  };

  const save = async (publish) => {
    if (!draft) return;
    const errs = check(draft);
    setErrors(errs);
    if (Object.keys(errs).length) {
      if (errs.firstItem) setEditingId(errs.firstItem);
      toast.error('Fix the highlighted fields first', { description: errs.name || 'One of your items needs a name or a valid price.' });
      return;
    }
    if (publish && !(draft.screen_ids || []).length) {
      toast.error('Pick at least one screen', { description: 'Under "Show on screens", tick where this menu should appear.' });
      return;
    }
    setSaving(true);
    try {
      const { id, created_date, updated_date, created_by, created_by_id, org_id, org_member_user_ids, ...data } = draft; // eslint-disable-line no-unused-vars
      await update(activeId, { ...data, ...(publish ? { published_at: new Date().toISOString() } : {}) });
      clear();
      if (publish) notifySuccess(`Published to ${draft.screen_ids?.length || 0} screens`, 'Screens update within a minute.', { label: 'View screens', onClick: () => navigate('/app/screens') });
      else notifySuccess('Saved', 'Not on screens yet — tap Publish when ready.');
    } catch (e) {
      notifyError(e, publish ? 'publish the menu' : 'save the menu', () => save(publish));
    } finally {
      setSaving(false);
    }
  };

  const onPhoto = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error(`${file.name} isn't an image`, { description: 'Use a JPG, PNG or WebP photo.' }); return; }
    if (file.size > 10 * 1048576) { toast.error('Photo is too big', { description: 'Use a photo under 10 MB.' }); return; }
    setUploading(true);
    try { set({ photo_url: await uploadPublic(file) }); } catch (e) { notifyError(e, 'upload the photo', () => onPhoto(file)); } finally { setUploading(false); }
  };

  const editing = draft?.items?.find((i) => i.id === editingId);

  if (loading) return <div><SlowHint loading forced={preview === 'slow'} /><ListSkeleton rows={4} /></div>;
  if (error && !boards.length) return <div><PageHeader title="Menus & prices" /><ErrorState error={error} action="load your menus" onRetry={reload} /></div>;

  if (!boards.length) {
    return (
      <div>
        <PageHeader title="Menus & prices" subtitle="Live menu boards in English and Arabic — change a price once, every screen updates." />
        <EmptyState icon={UtensilsCrossed} title="Create your first menu board" body="We'll start you with a sample breakfast menu you can edit."
          action={<button type="button" className="bw-btn bw-btn-primary" onClick={newBoard}><Plus className="h-4 w-4" />New menu</button>} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Menu editor${draft ? ` — ${draft.name}` : ''}`}
        subtitle={`Edit once · updates ${draft?.screen_ids?.length || 0} screens instantly`}
        actions={(
          <>
            <select className="bw-input !w-auto !py-2" value={activeId || ''} onChange={(e) => setActiveId(e.target.value)}>
              {boards.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <button type="button" className="bw-btn bw-btn-ghost" onClick={newBoard}><Plus className="h-4 w-4" />New</button>
            <button type="button" className="bw-btn bw-btn-ghost" onClick={async () => {
              const { id, created_date, updated_date, created_by, created_by_id, ...rest } = draft; // eslint-disable-line no-unused-vars
              try { const rec = await create({ ...rest, name: `${draft.name} copy`, published_at: '' }); setActiveId(rec.id); notifySuccess('Menu duplicated', 'Not on any screen until you publish it.'); } catch (e) { notifyError(e, 'duplicate the menu'); }
            }}><Copy className="h-4 w-4" />Duplicate</button>
            <button type="button" className="bw-btn bw-btn-ghost" disabled={saving || !dirty} onClick={() => save(false)}>Save</button>
            <button type="button" className="bw-btn bw-btn-primary" disabled={saving} onClick={() => save(true)}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Publish
            </button>
          </>
        )}
      />

      {restored && <DraftBanner restored onDiscard={discard} what="menu changes" />}
      {draft && (
        <div className="grid xl:grid-cols-[1fr_440px] gap-5">
          <div className="space-y-5">
            <div className="bw-card p-4">
              <div className="rounded-xl overflow-hidden border-[5px] border-bw-navy">
                <MenuBoardView board={draft} highlightId={editingId} />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-bold text-bw-navy me-1">Layout</span>
                {LAYOUTS.map((l) => (
                  <button key={l.key} type="button" onClick={() => set({ layout: l.key })}
                    className={`!min-h-0 rounded-lg px-3 py-1.5 text-[12px] font-semibold border ${draft.layout === l.key ? 'border-bw-violet bg-bw-lav text-bw-coral' : 'border-bw-line text-bw-ink'}`}>{l.label}</button>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-bold text-bw-navy me-1">Theme</span>
                {Object.entries(MENU_THEMES).map(([k, th]) => (
                  <button key={k} type="button" onClick={() => set({ theme: k })} title={k}
                    className={`!min-h-0 !min-w-0 h-8 w-11 rounded-lg border-2 flex items-center justify-center ${draft.theme === k ? 'border-bw-violet' : 'border-bw-line'}`} style={{ background: th.bg }}>
                    <span className="h-3 w-3 rounded-full" style={{ background: th.price }} />
                  </button>
                ))}
                <label className="bw-btn bw-btn-ghost !py-1.5 cursor-pointer">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                  {draft.photo_url ? 'Change photo' : 'Add photo'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0])} />
                </label>
              </div>
            </div>

            <div className="bw-card p-5 grid md:grid-cols-2 gap-4">
              <Field label="Menu name (English)"><input className="bw-input" value={draft.name || ''} onChange={(e) => set({ name: e.target.value })} aria-invalid={!!errors.name} /><FieldError msg={errors.name} /></Field>
              <Field label="Menu name (Arabic)"><input className="bw-input bw-ar text-right" dir="rtl" value={draft.name_ar || ''} onChange={(e) => set({ name_ar: e.target.value })} /></Field>
              <Field label="Show from" hint="Leave empty to show all day"><input type="time" className="bw-input" value={draft.show_from || ''} onChange={(e) => set({ show_from: e.target.value })} /></Field>
              <Field label="Show until"><input type="time" className="bw-input" value={draft.show_until || ''} onChange={(e) => set({ show_until: e.target.value })} /></Field>
              <div className="md:col-span-2">
                <p className="text-[12px] font-semibold text-bw-ink mb-2">Show on screens</p>
                <ScreenPicker screens={screens} venues={venues} value={draft.screen_ids || []} onChange={(v) => set({ screen_ids: v })} />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button type="button" className="bw-btn bw-btn-ghost !text-rose-600" onClick={async () => {
                  if (!window.confirm(`Delete ${draft.name}?`)) return;
                  try { await remove(activeId); clear(); setActiveId(null); notifySuccess('Menu deleted', 'Screens showing it go back to their playlist.'); } catch (e) { notifyError(e, 'delete the menu'); }
                }}><Trash2 className="h-4 w-4" />Delete menu</button>
              </div>
            </div>
          </div>

          <div className="bw-card p-4 h-fit">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[15px] font-bold text-bw-navy">Items</p>
              <button type="button" className="bw-btn bw-btn-ghost !py-1.5" onClick={() => {
                const item = { id: uid(), name_en: 'New item', name_ar: '', price: 0, tags: [], emoji: '', sold_out: false };
                setDraft((d) => ({ ...d, items: [...(d.items || []), item] })); setEditingId(item.id);
              }}><Plus className="h-4 w-4" />Add item</button>
            </div>
            <div className="space-y-1">
              {(draft.items || []).map((item, idx) => (
                <div key={item.id} onClick={() => setEditingId(item.id)}
                  className={`flex items-center gap-2 rounded-xl p-2 cursor-pointer ${editingId === item.id ? 'bg-bw-lav' : 'hover:bg-bw-cream'}`}>
                  <div className="flex flex-col">
                    <button type="button" className="!min-h-0 !min-w-0 text-bw-muted hover:text-bw-navy" onClick={(e) => { e.stopPropagation(); move(idx, -1); }}><ArrowUp className="h-3.5 w-3.5" /></button>
                    <button type="button" className="!min-h-0 !min-w-0 text-bw-muted hover:text-bw-navy" onClick={(e) => { e.stopPropagation(); move(idx, 1); }}><ArrowDown className="h-3.5 w-3.5" /></button>
                  </div>
                  <span className="h-10 w-10 shrink-0 rounded-lg bg-bw-cream flex items-center justify-center text-xl">{item.emoji || '🍽️'}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-semibold truncate ${item.sold_out ? 'text-bw-muted line-through' : 'text-bw-navy'}`}>{item.name_en}</p>
                    <p className="text-[11px] text-bw-muted bw-ar truncate">{item.name_ar}</p>
                  </div>
                  {errors[`item:${item.id}`] && <span className="h-2 w-2 rounded-full bg-rose-500" title="Needs fixing" />}
                  <span className="rounded-lg bg-white px-2 py-1 text-[12px] font-bold text-bw-coral">{draft.currency || 'AED'} {item.price}</span>
                  <div onClick={(e) => e.stopPropagation()}><Toggle checked={!item.sold_out} onChange={(v) => setItem(item.id, { sold_out: !v })} /></div>
                </div>
              ))}
            </div>

            {editing && (
              <div className="mt-4 rounded-2xl bg-bw-cream p-4 space-y-3">
                <p className="text-[13px] font-bold text-bw-navy">Editing · {editing.name_en}</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="English"><input className="bw-input" value={editing.name_en || ''} onChange={(e) => setItem(editing.id, { name_en: e.target.value })} /><FieldError msg={errors[`item:${editing.id}`]?.name_en} /></Field>
                  <Field label="Arabic"><input className="bw-input bw-ar text-right" dir="rtl" value={editing.name_ar || ''} onChange={(e) => setItem(editing.id, { name_ar: e.target.value })} /></Field>
                  <Field label={`Price (${draft.currency || 'AED'})`}><input type="number" min="0" step="0.5" className="bw-input" value={editing.price ?? ''} onChange={(e) => setItem(editing.id, { price: e.target.value === '' ? '' : Number(e.target.value) })} /><FieldError msg={errors[`item:${editing.id}`]?.price} /></Field>
                  <Field label="Was (optional)"><input type="number" min="0" step="0.5" className="bw-input" value={editing.was_price ?? ''} onChange={(e) => setItem(editing.id, { was_price: e.target.value === '' ? undefined : Number(e.target.value) })} /></Field>
                  <Field label="Emoji"><input className="bw-input" maxLength={4} value={editing.emoji || ''} onChange={(e) => setItem(editing.id, { emoji: e.target.value })} /></Field>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map((t) => {
                    const on = (editing.tags || []).includes(t);
                    return (
                      <button key={t} type="button" onClick={() => setItem(editing.id, { tags: on ? editing.tags.filter((x) => x !== t) : [...(editing.tags || []), t] })}
                        className={`!min-h-0 bw-chip ${on ? 'bw-grad text-white' : 'bg-white text-bw-muted border border-bw-line'}`}>{t}</button>
                    );
                  })}
                </div>
                <button type="button" className="bw-btn bw-btn-ghost !text-rose-600 w-full" onClick={() => {
                  setDraft((d) => ({ ...d, items: d.items.filter((i) => i.id !== editing.id) })); setEditingId(null);
                }}><Trash2 className="h-4 w-4" />Remove item</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
