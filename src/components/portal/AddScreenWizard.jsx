import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tv, Box, Monitor, Globe, Flame, Copy, MessageCircle, ArrowLeft, Check, AlertCircle, Loader2, ListVideo, UtensilsCrossed, QrCode, SlidersHorizontal, PartyPopper } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { usePortal } from '@/lib/PortalContext';
import { Field } from '@/components/portal/ui';

const DEVICES = [
  { key: 'bone', name: 'B.One player', sub: 'Plug into HDMI · works offline', icon: Box, badge: 'Recommended',
    steps: ['Connect B.One to the TV\'s HDMI port', 'Plug in power — the screen lights up', 'A 6-letter code appears on the TV'] },
  { key: 'android_tv', name: 'Android TV', sub: 'Sony · TCL · Xiaomi · Google TV', icon: Tv,
    steps: ['Open the TV browser (or install "Fully Kiosk Browser")', 'Go to the player link below', 'A 6-letter code appears on the TV'] },
  { key: 'lg', name: 'LG webOS', sub: '2018 and newer', icon: Monitor,
    steps: ['Open the LG Web Browser', 'Go to the player link below', 'A 6-letter code appears on the TV'] },
  { key: 'samsung', name: 'Samsung', sub: 'Tizen 2017+', icon: Monitor,
    steps: ['Open Samsung Internet on the TV', 'Go to the player link below', 'A 6-letter code appears on the TV'] },
  { key: 'browser', name: 'Fire TV / any browser', sub: 'Fire Stick, PC, mini PC', icon: Globe,
    steps: ['Open a browser full screen', 'Go to the player link below', 'A 6-letter code appears on the screen'] },
];

const MODES = [
  { key: 'signage_ads', name: 'My content + ads', sub: 'Earn 70% from ads you approve', price: 'AED 15/mo' },
  { key: 'signage_only', name: 'Only my content', sub: 'No ads ever', price: 'AED 29/mo' },
  { key: 'ads_only', name: 'Only ads', sub: 'Free screen, you still earn', price: 'Free' },
];

export default function AddScreenWizard({ open, onOpenChange, venue: fixedVenue }) {
  const { venues, reload } = usePortal();
  const approved = venues.filter((v) => v.approval_status === 'approved');
  const [step, setStep] = useState(1);
  const [device, setDevice] = useState('bone');
  const [venueId, setVenueId] = useState('');
  const [code, setCode] = useState('');
  const [form, setForm] = useState({ name: '', position_label: '', orientation: 'landscape', mode: 'signage_ads' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [screen, setScreen] = useState(null);
  const [created, setCreated] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(1); setCode(''); setError(''); setScreen(null); setCreated(''); setCopied(false);
      setForm({ name: '', position_label: '', orientation: 'landscape', mode: 'signage_ads' });
      setVenueId(fixedVenue?.id || approved[0]?.id || '');
    }
  }, [open]); // eslint-disable-line

  const venue = venues.find((v) => v.id === venueId);
  const playerLink = `${window.location.origin}/player`;
  const dev = DEVICES.find((d) => d.key === device);
  const set = (p) => setForm((f) => ({ ...f, ...p }));

  const payload = () => ({
    venue_id: venueId, name: form.name.trim(), position_label: form.position_label.trim(),
    orientation: form.orientation, mode: form.mode, player_type: device,
  });

  const pair = async () => {
    setBusy(true); setError('');
    try {
      const res = await base44.functions.invoke('claimPlayerCode', { ...payload(), code: code.trim().toUpperCase() });
      if (res.data?.screen) { setScreen(res.data.screen); reload(); setStep(4); } else setError(res.data?.error || 'That code could not be paired.');
    } catch (e) { setError(e?.response?.data?.error || 'That code could not be paired. Check the letters on the TV.'); } finally { setBusy(false); }
  };
  const generate = async () => {
    setBusy(true); setError('');
    try {
      const res = await base44.functions.invoke('createScreenCode', payload());
      if (res.data?.code) { setCreated(res.data.code); setScreen(res.data.screen); reload(); setStep(4); } else setError(res.data?.error || 'Could not create the screen.');
    } catch (e) { setError(e?.response?.data?.error || 'Could not create the screen.'); } finally { setBusy(false); }
  };

  const Head = ({ title, sub }) => (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        {[1, 2, 3, 4].map((n) => <span key={n} className={`h-1.5 flex-1 rounded-full ${n <= step ? 'bw-grad' : 'bg-bw-line'}`} />)}
      </div>
      <h2 className="text-[22px] font-bold text-bw-navy leading-tight">{title}</h2>
      {sub && <p className="mt-1 text-[13px] text-bw-muted">{sub}</p>}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl">
        {step === 1 && (
          <div>
            <Head title="What will play your content?" sub="Pick what's connected to this TV" />
            {!fixedVenue && approved.length > 1 && (
              <div className="mb-4"><Field label="Venue">
                <select className="bw-input" value={venueId} onChange={(e) => setVenueId(e.target.value)}>{approved.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}</select>
              </Field></div>
            )}
            {!approved.length && <p className="mb-4 rounded-xl bg-amber-50 p-3 text-[13px] text-amber-700">Your venue is still waiting for approval — you can add screens as soon as it's approved.</p>}
            <div className="grid sm:grid-cols-2 gap-3">
              {DEVICES.map((d) => {
                const Icon = d.icon;
                const on = device === d.key;
                return (
                  <button key={d.key} type="button" onClick={() => setDevice(d.key)}
                    className={`!min-h-0 !justify-start text-start flex items-center gap-3 rounded-2xl border p-3.5 ${on ? 'border-2 border-bw-violet bg-bw-lav' : 'border-bw-line bg-white'}`}>
                    <span className={`h-11 w-11 shrink-0 rounded-xl flex items-center justify-center ${on ? 'bw-grad text-white' : 'bg-bw-lav text-bw-coral'}`}><Icon className="h-5 w-5" /></span>
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-2"><span className="text-[14px] font-bold text-bw-navy">{d.name}</span>{d.badge && <span className="bw-chip bg-emerald-50 text-emerald-700">{d.badge}</span>}</span>
                      <span className="block text-[12px] text-bw-muted">{d.sub}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <a href="https://wa.me/971556140067?text=Hi%2C%20I%20need%20help%20choosing%20a%20player%20for%20my%20TV" target="_blank" rel="noreferrer" className="text-[13px] font-semibold text-emerald-600 flex items-center gap-1.5"><MessageCircle className="h-4 w-4" />Not sure? Ask us on WhatsApp</a>
              <button type="button" className="bw-btn bw-btn-primary" disabled={!venueId} onClick={() => setStep(2)}>Continue</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <Head title={`Set up your ${dev.name}`} sub="Takes about 2 minutes" />
            <ol className="space-y-3">
              {dev.steps.map((s, i) => (
                <li key={s} className="flex items-center gap-3 rounded-2xl border border-bw-line p-3.5">
                  <span className="h-8 w-8 shrink-0 rounded-full bw-grad text-white text-[13px] font-bold flex items-center justify-center">{i + 1}</span>
                  <span className="text-[14px] font-semibold text-bw-navy">{s}</span>
                </li>
              ))}
            </ol>
            <div className="mt-4 rounded-2xl bg-bw-cream p-4">
              <p className="text-[12px] font-semibold text-bw-muted">Player link — open this on the TV</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <code className="flex-1 min-w-[200px] rounded-xl bg-white border border-bw-line px-3 py-2.5 text-[14px] font-semibold text-bw-coral">{playerLink}</code>
                <button type="button" className="bw-btn bw-btn-ghost" onClick={() => { navigator.clipboard?.writeText(playerLink); setCopied(true); }}>{copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}{copied ? 'Copied' : 'Copy'}</button>
                <a className="bw-btn bw-btn-ghost" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`Open this on the TV to set up the Beyond Walls screen: ${playerLink}`)}`}><MessageCircle className="h-4 w-4 text-emerald-600" />Send to installer</a>
              </div>
            </div>
            <div className="mt-5 flex justify-between">
              <button type="button" className="bw-btn bw-btn-ghost" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4" />Back</button>
              <button type="button" className="bw-btn bw-btn-primary" onClick={() => setStep(3)}>I see the code</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <Head title="Type the code from your TV" sub={venue ? `Adding to ${venue.name}` : ''} />
            <input autoFocus maxLength={6} value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder="K7Q4M2" className="bw-input !text-center !text-[30px] !font-bold tracking-[0.5em] uppercase" />
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <Field label="Screen name"><input className="bw-input" placeholder="Window" value={form.name} onChange={(e) => set({ name: e.target.value })} /></Field>
              <Field label="Where is it?"><input className="bw-input" placeholder="Street-facing window" value={form.position_label} onChange={(e) => set({ position_label: e.target.value })} /></Field>
            </div>
            <div className="mt-3 inline-flex rounded-xl bg-[#EEEDF5] p-1">
              {[['landscape', 'Landscape'], ['portrait', 'Portrait']].map(([k, l]) => (
                <button key={k} type="button" onClick={() => set({ orientation: k })} className={`!min-h-0 rounded-lg px-4 py-1.5 text-[13px] font-semibold ${form.orientation === k ? 'bg-white shadow-sm text-bw-navy' : 'text-bw-muted'}`}>{l}</button>
              ))}
            </div>
            <p className="mt-4 mb-2 text-[13px] font-bold text-bw-navy">What should it do?</p>
            <div className="space-y-2">
              {MODES.map((m) => (
                <button key={m.key} type="button" onClick={() => set({ mode: m.key })}
                  className={`!min-h-0 w-full !justify-start text-start flex items-center gap-3 rounded-2xl border p-3 ${form.mode === m.key ? 'border-2 border-bw-violet bg-bw-lav' : 'border-bw-line'}`}>
                  <span className={`h-4 w-4 rounded-full border-2 ${form.mode === m.key ? 'border-bw-violet bg-bw-violet' : 'border-bw-line'}`} />
                  <span className="flex-1"><span className="block text-[14px] font-bold text-bw-navy">{m.name}</span><span className="block text-[12px] text-bw-muted">{m.sub}</span></span>
                  <span className="text-[13px] font-bold text-bw-coral">{m.price}</span>
                </button>
              ))}
            </div>
            {error && <div className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 px-3 py-2 text-[13px] text-rose-600"><AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />{error}</div>}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
              <button type="button" className="bw-btn bw-btn-ghost" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4" />Back</button>
              <div className="flex gap-2">
                <button type="button" className="bw-btn bw-btn-ghost" disabled={busy} onClick={generate} title="For TVs that can't show a code — we give you a code to type on the TV instead">TV can't show a code?</button>
                <button type="button" className="bw-btn bw-btn-primary" disabled={busy || code.length !== 6} onClick={pair}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Pair screen</button>
              </div>
            </div>
          </div>
        )}

        {step === 4 && screen && (
          <div className="text-center">
            <Head title={created ? 'Type this code on the TV' : `${screen.name} is live!`} sub={created ? 'Open the player link on the TV and enter this code.' : `It starts playing within a minute at ${venue?.name || 'your venue'}.`} />
            {created ? (
              <div className="flex justify-center gap-2 my-4">{created.split('').map((c, i) => <span key={i} className="h-14 w-11 rounded-xl bw-grad text-white text-2xl font-bold flex items-center justify-center">{c}</span>)}</div>
            ) : (
              <div className="mx-auto my-4 h-20 w-20 rounded-3xl bg-emerald-50 flex items-center justify-center"><PartyPopper className="h-10 w-10 text-emerald-600" /></div>
            )}
            <p className="text-[13px] font-bold text-bw-navy mb-2 text-start">What next?</p>
            <div className="grid sm:grid-cols-2 gap-2 text-start">
              {[
                ['/app/playlists', ListVideo, 'Give it a playlist'],
                ['/app/menus', UtensilsCrossed, 'Show a live menu'],
                ['/app/qr', QrCode, 'Add a QR overlay'],
                [`/app/screens/${screen.id}`, SlidersHorizontal, 'Open screen controls'],
              ].map(([to, Icon, label]) => (
                <Link key={to} to={to} onClick={() => onOpenChange(false)} className="!justify-start flex items-center gap-3 rounded-2xl border border-bw-line p-3 hover:bg-bw-cream">
                  <span className="h-9 w-9 rounded-xl bg-bw-lav flex items-center justify-center"><Icon className="h-4 w-4 text-bw-coral" /></span>
                  <span className="text-[13px] font-semibold text-bw-navy">{label}</span>
                </Link>
              ))}
            </div>
            <button type="button" className="mt-5 bw-btn bw-btn-primary" onClick={() => onOpenChange(false)}>Done</button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
