import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, LifeBuoy, MessageCircle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { usePortal } from '@/lib/PortalContext';
import { useOrgEntity } from '@/lib/useOrgEntity';
import { timeAgo } from '@/lib/portalData';
import { PageHeader, EmptyState, Field } from '@/components/portal/ui';
import TicketThread from '@/components/support/TicketThread';

const CATS = [['screen_offline', 'A screen is offline'], ['pairing', 'Pairing a TV'], ['content', 'Content / playlists'], ['billing', 'Billing'], ['account', 'My account'], ['other', 'Something else']];
const ST = { open: ['Open', 'bg-amber-50 text-amber-700'], waiting_customer: ['Replied', 'bg-bw-lav text-bw-coral'], resolved: ['Resolved', 'bg-emerald-50 text-emerald-700'] };

export default function PortalSupport() {
  const { user } = useAuth();
  const { org, screens } = usePortal();
  const tickets = useOrgEntity('SupportTicket', { sort: '-updated_date', poll: 20000 });
  const [activeId, setActiveId] = useState(null);
  const [form, setForm] = useState(null);
  const active = tickets.items.find((t) => t.id === activeId);

  const createTicket = async () => {
    if (!form.subject.trim() || !form.text.trim()) { toast.error('Add a subject and a message'); return; }
    const now = new Date().toISOString();
    const rec = await tickets.create({
      org_name: org?.name, requester_name: user?.full_name || '', requester_email: user?.email || '', subject: form.subject.trim(), category: form.category,
      priority: form.category === 'screen_offline' ? 'high' : 'normal', status: 'open', screen_id: form.screen_id || '',
      messages: [{ by: user?.full_name || user?.email, from_team: false, text: form.text.trim(), at: now }], last_activity_at: now,
    });
    setForm(null); setActiveId(rec.id);
    toast.success('Sent — we usually reply within a few hours');
  };
  const reply = async (text) => {
    const messages = [...(active.messages || []), { by: user?.full_name || user?.email, from_team: false, text, at: new Date().toISOString() }];
    await tickets.update(active.id, { messages, status: 'open', last_activity_at: new Date().toISOString() });
  };

  return (
    <div>
      <PageHeader title="Help & support" subtitle="Message the Beyond Walls team · 9am–9pm every day"
        actions={<>
          <a className="bw-btn bw-btn-ghost" href="https://wa.me/971556140067" target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4 text-emerald-600" />WhatsApp</a>
          <button type="button" className="bw-btn bw-btn-primary" onClick={() => setForm({ subject: '', category: 'other', screen_id: '', text: '' })}><Plus className="h-4 w-4" />New request</button>
        </>} />
      {tickets.items.length === 0 && !form ? (
        <EmptyState icon={LifeBuoy} title="No requests yet" body="If a screen goes offline or something looks wrong, send us a request and we'll sort it." action={<button type="button" className="bw-btn bw-btn-primary" onClick={() => setForm({ subject: '', category: 'other', screen_id: '', text: '' })}><Plus className="h-4 w-4" />New request</button>} />
      ) : (
        <div className="grid lg:grid-cols-[340px_1fr] gap-5">
          <div className="bw-card p-2 h-fit">
            {tickets.items.map((t) => (
              <button key={t.id} type="button" onClick={() => { setActiveId(t.id); setForm(null); }} className={`!min-h-0 !block w-full text-start rounded-xl p-3 ${t.id === activeId ? 'bg-bw-lav' : 'hover:bg-bw-cream'}`}>
                <span className={`bw-chip ${ST[t.status]?.[1]}`}>{ST[t.status]?.[0]}</span>
                <p className="mt-1 text-[13px] font-semibold text-bw-navy truncate">{t.subject}</p>
                <p className="text-[11px] text-bw-muted">{timeAgo(t.last_activity_at || t.created_date)}</p>
              </button>
            ))}
          </div>
          {form ? (
            <div className="bw-card p-5 space-y-3">
              <p className="text-[17px] font-bold text-bw-navy">New request</p>
              <Field label="What's it about?"><select className="bw-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
              {['screen_offline', 'pairing', 'content'].includes(form.category) && screens.length > 0 && (
                <Field label="Which screen?"><select className="bw-input" value={form.screen_id} onChange={(e) => setForm({ ...form, screen_id: e.target.value })}><option value="">—</option>{screens.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
              )}
              <Field label="Subject"><input className="bw-input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Field>
              <Field label="Message"><textarea rows={5} className="bw-input" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} /></Field>
              <div className="flex justify-end gap-2"><button type="button" className="bw-btn bw-btn-ghost" onClick={() => setForm(null)}>Cancel</button><button type="button" className="bw-btn bw-btn-primary" onClick={createTicket}>Send</button></div>
            </div>
          ) : active ? (
            <div className="bw-card p-5">
              <p className="text-[17px] font-bold text-bw-navy mb-3">{active.subject}</p>
              <TicketThread ticket={active} onReply={reply} fromTeam={false} />
            </div>
          ) : <div className="bw-card p-10 text-center text-[13px] text-bw-muted">Pick a request</div>}
        </div>
      )}
    </div>
  );
}
