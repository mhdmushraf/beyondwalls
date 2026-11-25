import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Briefcase, Search, X, Archive, RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { usePortal } from '@/lib/PortalContext';
import { useOrgEntity } from '@/lib/useOrgEntity';
import { PageHeader, EmptyState, Field } from '@/components/portal/ui';
import { ListSkeleton } from '@/components/portal/Skeletons';
import { validate, rules, notifyError, notifySuccess, isOnline, useDraft } from '@/lib/states';
import { ErrorState, SlowHint, FieldError, DraftBanner } from '@/components/states/StateViews';

const aed = (n) => `AED ${Number(n || 0).toLocaleString('en-AE', { maximumFractionDigits: 2 })}`;
const BLANK = { name: '', industry: '', contact_name: '', contact_phone: '', contact_email: '', notes: '' };

/** Agency: the brands you manage. Book screens for a client from Book screens. */
export default function PortalClients() {
  const { org, preview } = usePortal();
  const campaigns = useOrgEntity('Campaign', { sort: '-created_date', limit: 300 });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const { restored, discard, clear } = useDraft(org?.id ? `client:${org.id}:${form?.id || 'new'}` : null, form, setForm, { enabled: !!form });

  const load = useCallback(async () => {
    if (!org?.id) return;
    if (preview === 'error') { setError({ response: { status: 500 } }); setLoading(false); return; }
    if (!isOnline()) { setLoading(false); return; }
    setError(null);
    try {
      const page = await base44.entities.Client.filter({ agency_org_id: org.id }, { sort: 'name', limit: 500 });
      setClients(page.items || page || []);
    } catch (e) { setError(e); } finally { setLoading(false); }
  }, [org?.id, preview]);
  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const m = {};
    campaigns.items.forEach((c) => {
      if (!c.client_id) return;
      const x = m[c.client_id] || { spend: 0, plays: 0, live: 0, count: 0 };
      x.count += 1;
      if (c.payment_status === 'paid') x.spend += Number(c.total_budget) || 0;
      x.plays += Number(c.total_plays) || 0;
      if (c.status === 'active') x.live += 1;
      m[c.client_id] = x;
    });
    return m;
  }, [campaigns.items]);

  const list = preview === 'empty' ? [] : clients;
  const shown = list.filter((c) => (showArchived ? c.status === 'archived' : c.status !== 'archived') && (!q || `${c.name} ${c.industry} ${c.contact_name}`.toLowerCase().includes(q.toLowerCase())));

  const save = async () => {
    const e = validate({
      name: [rules.required('Client name'), rules.max('Client name', 60)],
      ...(form.contact_phone ? { contact_phone: [rules.phoneUAE('Phone')] } : {}),
    }, form);
    if (form.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) e.contact_email = 'That email looks wrong — check for typos.';
    if (!form.id && clients.some((c) => c.name.trim().toLowerCase() === form.name.trim().toLowerCase())) e.name = `You already have a client called "${form.name.trim()}".`;
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      const data = { ...BLANK, ...form, name: form.name.trim() };
      delete data.id;
      if (form.id) await base44.entities.Client.update(form.id, data);
      else await base44.entities.Client.create({ ...data, agency_org_id: org.id, agency_org_member_user_ids: org.member_user_ids || [], status: 'active' });
      clear(); setForm(null); load();
      notifySuccess(form.id ? 'Client updated' : `${data.name} added`, 'Pick them under "Booking for" when you book screens.', { label: 'Book screens', onClick: () => { window.location.href = '/app/marketplace'; } });
    } catch (err) { notifyError(err, 'save the client', save); } finally { setBusy(false); }
  };

  const setStatus = async (c, status) => {
    try { await base44.entities.Client.update(c.id, { status }); load(); notifySuccess(status === 'archived' ? `${c.name} archived` : `${c.name} restored`); } catch (e) { notifyError(e, 'update the client'); }
  };

  if (loading) return <div><PageHeader title="Clients" /><SlowHint loading forced={preview === 'slow'} /><ListSkeleton rows={4} /></div>;
  if (error && !clients.length) return <div><PageHeader title="Clients" /><ErrorState error={error} action="load your clients" onRetry={load} /></div>;

  return (
    <div>
      <PageHeader title="Clients" subtitle="The brands your agency books screens for · spend and plays per client"
        actions={<button type="button" className="bw-btn bw-btn-primary" onClick={() => { setErrors({}); setForm({ ...BLANK }); }}><Plus className="h-4 w-4" />Add client</button>} />

      {list.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px]"><Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bw-muted" /><input className="bw-input !ps-9" placeholder="Search clients" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <button type="button" className="bw-btn bw-btn-ghost" onClick={() => setShowArchived((v) => !v)}>{showArchived ? 'Show active' : 'Show archived'}</button>
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState icon={Briefcase} title="Add your first client" body="Running ads for brands? Add each one here, then book screens on their behalf and report spend and plays per client."
          action={<button type="button" className="bw-btn bw-btn-primary" onClick={() => setForm({ ...BLANK })}><Plus className="h-4 w-4" />Add client</button>} />
      ) : shown.length === 0 ? (
        <EmptyState icon={Search} title={q ? `No clients match "${q}"` : showArchived ? 'No archived clients' : 'No active clients'} body="" action={<button type="button" className="bw-btn bw-btn-ghost" onClick={() => { setQ(''); setShowArchived(false); }}>Clear</button>} />
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {shown.map((c) => {
            const st = stats[c.id] || { spend: 0, plays: 0, live: 0, count: 0 };
            return (
              <div key={c.id} className="bw-card p-4">
                <div className="flex items-start gap-3">
                  <span className="h-11 w-11 rounded-xl bw-grad text-white font-bold flex items-center justify-center">{c.name.slice(0, 1).toUpperCase()}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-bw-navy truncate">{c.name}</p>
                    <p className="text-[12px] text-bw-muted truncate">{[c.industry, c.contact_name].filter(Boolean).join(' · ') || 'No contact yet'}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-bw-cream p-2"><p className="text-[11px] text-bw-muted">Paid spend</p><p className="text-[13px] font-bold text-bw-navy">{aed(st.spend)}</p></div>
                  <div className="rounded-xl bg-bw-cream p-2"><p className="text-[11px] text-bw-muted">Plays</p><p className="text-[13px] font-bold text-bw-navy">{st.plays.toLocaleString()}</p></div>
                  <div className="rounded-xl bg-bw-cream p-2"><p className="text-[11px] text-bw-muted">Running</p><p className="text-[13px] font-bold text-bw-navy">{st.live} / {st.count}</p></div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Link to={`/app/marketplace?client=${c.id}`} className="bw-btn bw-btn-primary flex-1 !py-1.5">Book screens</Link>
                  <button type="button" className="bw-btn bw-btn-ghost !py-1.5" onClick={() => { setErrors({}); setForm({ ...BLANK, ...c }); }}>Edit</button>
                  {c.status === 'archived'
                    ? <button type="button" title="Restore" className="bw-btn bw-btn-ghost !py-1.5" onClick={() => setStatus(c, 'active')}><RotateCcw className="h-4 w-4" /></button>
                    : <button type="button" title="Archive" className="bw-btn bw-btn-ghost !py-1.5" onClick={() => { if (window.confirm(`Archive ${c.name}? Their campaigns keep running.`)) setStatus(c, 'archived'); }}><Archive className="h-4 w-4" /></button>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {form && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setForm(null)}>
          <div className="bw-card w-full max-w-md p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><p className="text-[17px] font-bold text-bw-navy">{form.id ? 'Edit client' : 'Add client'}</p><button type="button" className="!min-h-0" onClick={() => setForm(null)}><X className="h-5 w-5" /></button></div>
            {restored && <DraftBanner restored onDiscard={() => { discard(); }} what="client" />}
            <Field label="Client / brand name"><input className="bw-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><FieldError msg={errors.name} /></Field>
            <Field label="Industry (optional)"><input className="bw-input" placeholder="e.g. Pharmacy, Real estate" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Contact name"><input className="bw-input" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} /></Field>
              <Field label="Phone"><input className="bw-input" inputMode="tel" placeholder="+971 50 123 4567" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} /><FieldError msg={errors.contact_phone} /></Field>
            </div>
            <Field label="Email"><input className="bw-input" type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} /><FieldError msg={errors.contact_email} /></Field>
            <Field label="Notes"><textarea rows={2} className="bw-input" maxLength={1000} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
            <button type="button" className="bw-btn bw-btn-primary w-full" disabled={busy} onClick={save}>{busy ? 'Saving…' : form.id ? 'Save' : 'Add client'}</button>
          </div>
        </div>
      )}
      {campaigns.error && !campaigns.items.length && <p className="mt-3 text-[12px] text-amber-700">Spend and plays couldn't load. <button type="button" className="!min-h-0 underline" onClick={campaigns.reload}>Try again</button></p>}
    </div>
  );
}
