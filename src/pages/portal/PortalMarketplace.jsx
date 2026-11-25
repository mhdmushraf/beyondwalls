import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MapPin, Users, MonitorPlay, Search, ShoppingCart, X, Upload, Check, Wifi, WifiOff, Megaphone, Building2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { usePortal } from '@/lib/PortalContext';
import { uploadPublic, EMIRATES, VENUE_TYPES } from '@/lib/portalData';
import { PageHeader, EmptyState, Field } from '@/components/portal/ui';
import { TilesSkeleton } from '@/components/portal/Skeletons';
import { useDraft, isOnline, notifyError, notifySuccess } from '@/lib/states';
import { DraftBanner, FieldError, ErrorState, SlowHint, ProgressStrip } from '@/components/states/StateViews';

const MAX_MB = 200;
const aed = (n) => `AED ${Number(n || 0).toLocaleString('en-AE', { maximumFractionDigits: 2 })}`;
const fmtK = (n) => (n >= 1000 ? `${Math.round(n / 100) / 10}k` : String(n || 0));
const todayDubai = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai' }).format(new Date());
const BLANK = { name: '', goal: 'brand_awareness', start_date: '', weeks: 2, screen_ids: [], creative_url: '', creative_type: 'image', creative_name: '' };

export default function PortalMarketplace() {
  const navigate = useNavigate();
  const { org, preview } = usePortal();
  const [form, setForm] = useState(() => ({ ...BLANK, start_date: todayDubai() }));
  const { restored, discard, clear } = useDraft(org?.id ? `book:${org.id}` : null, form, setForm, { enabled: !!org?.id });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');
  const [emirate, setEmirate] = useState('all');
  const [vtype, setVtype] = useState('all');
  const [cartOpen, setCartOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [done, setDone] = useState(null);
  const fileRef = useRef(null);
  const set = (p) => setForm((f) => ({ ...f, ...p }));

  const load = async () => {
    if (preview === 'error') { setError({ response: { status: 500 } }); setLoading(false); return; }
    if (preview === 'loading') return;
    setLoading(true); setError(null);
    try {
      const res = await base44.functions.invoke('marketplaceScreens', { start_date: form.start_date, weeks: form.weeks });
      setData(res.data);
    } catch (e) { setError(e); } finally { setLoading(false); }
  };
  // eslint-disable-next-line
  useEffect(() => { if (isOnline()) load(); else setLoading(false); }, [form.start_date, form.weeks]);

  const screens = preview === 'empty' ? [] : (data?.screens || []);
  const shown = useMemo(() => screens.filter((s) => {
    if (emirate !== 'all' && s.venue.emirate !== emirate) return false;
    if (vtype !== 'all' && s.venue.venue_type !== vtype) return false;
    if (q && !`${s.venue.name} ${s.name} ${s.venue.area}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [screens, emirate, vtype, q]);

  const picked = screens.filter((s) => form.screen_ids.includes(s.id));
  const missing = form.screen_ids.filter((id) => data && !screens.some((s) => s.id === id));
  const subtotal = picked.reduce((a, s) => a + s.price_per_week * form.weeks, 0);
  const vatPct = data?.vat_pct || 0;
  const vat = Math.round(subtotal * vatPct) / 100;
  const reach = picked.reduce((a, s) => a + (s.venue.weekly_footfall || 0) * form.weeks, 0);
  const toggle = (id) => set({ screen_ids: form.screen_ids.includes(id) ? form.screen_ids.filter((x) => x !== id) : [...form.screen_ids, id] });

  const onFile = async (file) => {
    if (!file) return;
    if (!isOnline()) { toast.error("You're offline — uploads need internet", { description: 'Try again when you reconnect.' }); return; }
    if (!/^(image|video)\//.test(file.type)) { setErrors((e) => ({ ...e, creative_url: `${file.name} isn't an image or video. Use JPG, PNG, MP4 or MOV.` })); return; }
    if (file.size > MAX_MB * 1048576) { setErrors((e) => ({ ...e, creative_url: `${file.name} is ${Math.round(file.size / 1048576)} MB — the limit is ${MAX_MB} MB.` })); return; }
    setUploading(1);
    try {
      const url = await uploadPublic(file);
      set({ creative_url: url, creative_type: file.type.startsWith('video') ? 'video' : 'image', creative_name: file.name });
      setErrors((e) => ({ ...e, creative_url: null }));
    } catch (e) { notifyError(e, `upload ${file.name}`, () => onFile(file)); } finally { setUploading(0); }
  };

  const check = () => {
    const e = {};
    if (!org?.id) e.org = 'Pick your business first (top bar).';
    if (!form.name.trim()) e.name = 'Give your campaign a name, like "Ramadan iftar offer".';
    else if (form.name.length > 60) e.name = `Campaign name is too long — ${form.name.length} of 60 characters.`;
    if (!form.start_date) e.start_date = 'Pick a start date.';
    else if (form.start_date < todayDubai()) e.start_date = "The start date can't be in the past.";
    if (!(form.weeks >= 1 && form.weeks <= 12)) e.weeks = 'Book between 1 and 12 weeks.';
    if (!picked.length) e.screen_ids = 'Pick at least one screen from the list.';
    else if (picked.some((s) => s.slots_free <= 0)) e.screen_ids = `${picked.filter((s) => s.slots_free <= 0).map((s) => s.venue.name).join(', ')} is full for these dates — remove it or change dates.`;
    if (!form.creative_url) e.creative_url = 'Upload your ad — an image or a video up to 200 MB.';
    return e;
  };

  const book = async () => {
    const e = check();
    setErrors(e);
    if (Object.keys(e).length) { toast.error('Fix the highlighted fields first', { description: Object.values(e)[0] }); return; }
    if (!isOnline()) { toast.error("You're offline", { description: 'Your booking is saved on this device. Book again when you reconnect.' }); return; }
    setBusy(true);
    try {
      const res = await base44.functions.invoke('marketplaceBook', {
        org_id: org.id, name: form.name.trim(), goal: form.goal, start_date: form.start_date, weeks: Number(form.weeks),
        screen_ids: picked.map((s) => s.id), creative_url: form.creative_url, creative_type: form.creative_type,
      });
      clear();
      setDone(res.data);
      setForm({ ...BLANK, start_date: todayDubai() });
      setCartOpen(false);
      notifySuccess('Booking received', 'Pay the invoice by bank transfer — your ad starts once payment and the venue approve it.');
    } catch (err) {
      const msg = err?.response?.data?.error;
      const field = err?.response?.data?.field;
      if (msg && field) { setErrors({ [field]: msg }); toast.error('Booking not sent', { description: msg }); if (err.response.status === 409) load(); } else notifyError(err, 'send your booking', book);
    } finally { setBusy(false); }
  };

  if (done) {
    const inv = done.invoice || {};
    return (
      <div className="max-w-xl mx-auto bw-card p-7 text-center">
        <span className="mx-auto h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center"><Check className="h-7 w-7 text-emerald-600" /></span>
        <h1 className="mt-4 text-[22px] font-bold text-bw-navy">Booking received</h1>
        <p className="mt-1 text-[13px] text-bw-muted">{done.bookings?.length || 0} screens · {done.campaign?.weeks} weeks from {done.campaign?.start_date}</p>
        <div className="mt-5 rounded-2xl bg-bw-cream p-4 text-start space-y-1.5 text-[13px]">
          <p className="font-bold text-bw-navy">What happens next</p>
          <p>1. Pay invoice <b>{inv.number}</b> — <b>{aed(inv.total)}</b> — by bank transfer. Put the invoice number in the reference.</p>
          <p>2. Each venue checks your ad (usually same day). If one says no, it's removed from the invoice.</p>
          <p>3. Once paid and approved, your ad plays from the start date. You'll see plays in My campaigns.</p>
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button type="button" className="bw-btn bw-btn-primary" onClick={() => navigate('/app/campaigns')}>Open My campaigns</button>
          <button type="button" className="bw-btn bw-btn-ghost" onClick={() => setDone(null)}>Book more screens</button>
        </div>
      </div>
    );
  }

  const cart = (
    <div className="space-y-4">
      <Field label="Campaign name"><input className="bw-input" maxLength={60} placeholder="e.g. Weekend brunch offer" value={form.name} onChange={(e) => set({ name: e.target.value })} /><FieldError msg={errors.name} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start date"><input type="date" min={todayDubai()} className="bw-input" value={form.start_date} onChange={(e) => set({ start_date: e.target.value })} /><FieldError msg={errors.start_date} /></Field>
        <Field label="How long">
          <select className="bw-input" value={form.weeks} onChange={(e) => set({ weeks: Number(e.target.value) })}>
            {[1, 2, 3, 4, 6, 8, 12].map((w) => <option key={w} value={w}>{w} {w === 1 ? 'week' : 'weeks'}</option>)}
          </select>
          <FieldError msg={errors.weeks} />
        </Field>
      </div>
      <div>
        <p className="text-[12px] font-semibold text-bw-ink mb-1.5">Your ad</p>
        {form.creative_url ? (
          <div className="flex items-center gap-3 rounded-xl border border-bw-line p-2">
            <div className="h-14 w-24 rounded-lg overflow-hidden bg-bw-navy shrink-0">
              {form.creative_type === 'video' ? <video src={form.creative_url} muted className="h-full w-full object-cover" /> : <img src={form.creative_url} alt="" className="h-full w-full object-cover" />}
            </div>
            <p className="flex-1 min-w-0 text-[12px] font-semibold text-bw-navy truncate">{form.creative_name || 'Ad uploaded'}</p>
            <button type="button" className="bw-btn bw-btn-ghost !py-1.5" onClick={() => fileRef.current?.click()}>Change</button>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} className="!flex-col w-full rounded-xl border-2 border-dashed border-bw-line p-5 text-center hover:border-bw-violet">
            <Upload className="h-5 w-5 text-bw-coral" />
            <span className="mt-1 text-[13px] font-semibold text-bw-navy">{uploading ? 'Uploading…' : 'Upload image or video'}</span>
            <span className="text-[11px] text-bw-muted">Landscape 1920×1080 looks best · up to {MAX_MB} MB</span>
          </button>
        )}
        {uploading > 0 && <div className="mt-2"><ProgressStrip done={0} total={1} label="Uploading your ad ·" /></div>}
        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ''; }} />
        <FieldError msg={errors.creative_url} />
      </div>
      <div>
        <p className="text-[12px] font-semibold text-bw-ink mb-1.5">Screens ({picked.length})</p>
        {!picked.length && <p className="text-[12px] text-bw-muted">Tap "Add" on any screen to put it here.</p>}
        <div className="space-y-1.5 max-h-56 overflow-auto">
          {picked.map((s) => (
            <div key={s.id} className="flex items-center gap-2 rounded-xl bg-bw-cream px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-bw-navy truncate">{s.venue.name}</p>
                <p className="text-[11px] text-bw-muted truncate">{s.name} · {aed(s.price_per_week)}/wk{s.slots_free <= 0 ? ' · full for these dates' : ''}</p>
              </div>
              <button type="button" className="!min-h-0 !min-w-0 h-7 w-7 rounded-lg text-bw-muted hover:text-rose-600 flex items-center justify-center" onClick={() => toggle(s.id)} title="Remove"><X className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
        {missing.length > 0 && <p className="mt-1 text-[11px] text-amber-700">{missing.length} saved screen{missing.length > 1 ? 's are' : ' is'} no longer available and won't be booked.</p>}
        <FieldError msg={errors.screen_ids} />
      </div>
      <div className="rounded-xl border border-bw-line p-3 text-[13px] space-y-1">
        <div className="flex justify-between"><span className="text-bw-muted">{picked.length} screens × {form.weeks} wk</span><span>{aed(subtotal)}</span></div>
        {vatPct > 0 && <div className="flex justify-between"><span className="text-bw-muted">VAT {vatPct}%</span><span>{aed(vat)}</span></div>}
        <div className="flex justify-between font-bold text-bw-navy text-[15px] pt-1 border-t border-bw-line"><span>Total</span><span>{aed(subtotal + vat)}</span></div>
        {reach > 0 && <p className="text-[11px] text-bw-muted">About {fmtK(reach)} venue visits over your dates (venue estimates).</p>}
      </div>
      <FieldError msg={errors.org} />
      <button type="button" className="bw-btn bw-btn-primary w-full" disabled={busy || uploading > 0} onClick={book}>{busy ? 'Sending booking…' : `Book ${picked.length || ''} screens · ${aed(subtotal + vat)}`}</button>
      <p className="text-[11px] text-bw-muted text-center">Pay by bank transfer after booking. Nothing plays until it's paid and each venue approves your ad.</p>
    </div>
  );

  return (
    <div>
      <PageHeader title="Book screens" subtitle={data ? `${screens.length} venue screens across the UAE · prices per week, ${data.start_date} → ${data.end_date}` : 'Put your ad on screens in cafés, gyms, clinics and more'}
        actions={<button type="button" className="bw-btn bw-btn-primary lg:hidden" onClick={() => setCartOpen(true)}><ShoppingCart className="h-4 w-4" />Booking ({picked.length})</button>} />
      {restored && <DraftBanner restored onDiscard={discard} what="booking" />}
      <SlowHint loading={loading} forced={preview === 'slow'} />

      <div className="grid lg:grid-cols-[1fr_360px] gap-5">
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bw-muted" />
              <input className="bw-input !ps-9" placeholder="Search venue or area" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <select className="bw-input !w-auto" value={emirate} onChange={(e) => setEmirate(e.target.value)}><option value="all">All emirates</option>{EMIRATES.map((x) => <option key={x}>{x}</option>)}</select>
            <select className="bw-input !w-auto capitalize" value={vtype} onChange={(e) => setVtype(e.target.value)}><option value="all">All venue types</option>{VENUE_TYPES.map((x) => <option key={x} value={x}>{x}</option>)}</select>
          </div>

          {loading || preview === 'loading' ? <TilesSkeleton count={6} />
            : error ? <ErrorState error={error} action="load screens" onRetry={load} />
              : !isOnline() && !data ? <EmptyState icon={WifiOff} title="You're offline" body="Screen prices and free slots need internet. Your booking draft is safe on this device." />
                : screens.length === 0 ? <EmptyState icon={Megaphone} title="No screens open for booking yet" body="Venues are joining every week. Leave your details and we'll WhatsApp you when screens in your area open." action={<a className="bw-btn bw-btn-primary" href="https://wa.me/971556140067?text=Hi%2C%20I%27d%20like%20to%20advertise%20on%20Beyond%20Walls%20screens" target="_blank" rel="noreferrer">WhatsApp us</a>} />
                  : shown.length === 0 || preview === 'noresults' ? <EmptyState icon={Search} title={q ? `No screens match "${q}"` : 'No screens match these filters'} body="Try another emirate or venue type." action={<button type="button" className="bw-btn bw-btn-ghost" onClick={() => { setQ(''); setEmirate('all'); setVtype('all'); }}>Clear filters</button>} />
                    : (
                      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {shown.map((s) => {
                          const on = form.screen_ids.includes(s.id);
                          const full = s.slots_free <= 0;
                          return (
                            <div key={s.id} className={`bw-card overflow-hidden ${on ? 'ring-2 ring-bw-violet' : ''}`}>
                              <div className="relative aspect-video bg-bw-navy">
                                {s.photo_url ? <img src={s.photo_url} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center"><Building2 className="h-8 w-8 text-white/30" /></div>}
                                <span className={`absolute top-2 start-2 bw-chip ${s.is_online ? 'bg-emerald-500 text-white' : 'bg-white/90 text-bw-muted'}`}>{s.is_online ? <><Wifi className="h-3 w-3" />Live</> : 'Offline now'}</span>
                                <span className="absolute bottom-2 end-2 bw-chip bg-white text-bw-navy font-bold">{aed(s.price_per_week)}/wk</span>
                              </div>
                              <div className="p-3.5">
                                <p className="text-[14px] font-bold text-bw-navy truncate">{s.venue.name}</p>
                                <p className="text-[12px] text-bw-muted flex items-center gap-1 truncate"><MapPin className="h-3 w-3" />{[s.venue.area, s.venue.emirate].filter(Boolean).join(', ') || '—'} · <span className="capitalize">{s.venue.venue_type || 'venue'}</span></p>
                                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                                  <span className="bw-chip bg-bw-cream text-bw-ink"><MonitorPlay className="h-3 w-3" />{s.name}</span>
                                  {s.venue.weekly_footfall > 0 && <span className="bw-chip bg-bw-cream text-bw-ink"><Users className="h-3 w-3" />{fmtK(s.venue.weekly_footfall)}/wk</span>}
                                  <span className={`bw-chip ${full ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'}`}>{full ? 'Full' : `${s.slots_free} of ${s.slots} slots free`}</span>
                                </div>
                                <button type="button" disabled={full && !on} onClick={() => toggle(s.id)} className={`mt-3 w-full bw-btn ${on ? 'bw-btn-ghost' : 'bw-btn-primary'}`}>
                                  {on ? <><Check className="h-4 w-4" />Added</> : full ? 'Full for these dates' : 'Add'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
        </div>

        <aside className="hidden lg:block">
          <div className="bw-card p-5 sticky top-20">
            <p className="text-[15px] font-bold text-bw-navy mb-3">Your booking</p>
            {cart}
          </div>
        </aside>
      </div>

      {cartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setCartOpen(false)}>
          <div className="w-full max-h-[90vh] overflow-auto rounded-t-3xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3"><p className="text-[16px] font-bold text-bw-navy">Your booking</p><button type="button" className="!min-h-0" onClick={() => setCartOpen(false)}><X className="h-5 w-5" /></button></div>
            {cart}
          </div>
        </div>
      )}
    </div>
  );
}
