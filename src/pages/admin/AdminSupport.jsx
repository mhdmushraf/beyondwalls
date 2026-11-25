import { useState } from 'react';
import { toast } from 'sonner';
import { MessageCircle, Mail } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useAdminList } from '@/components/admin/AdminLayout';
import TicketThread from '@/components/support/TicketThread';
import { PageHeader } from '@/components/portal/ui';
import { ListSkeleton } from '@/components/portal/Skeletons';
import { timeAgo } from '@/lib/portalData';

const STATUS = { open: ['Open', 'bg-amber-50 text-amber-700'], waiting_customer: ['Waiting on customer', 'bg-sky-50 text-sky-700'], resolved: ['Resolved', 'bg-emerald-50 text-emerald-700'] };

export default function AdminSupport() {
  const { user } = useAuth();
  const tickets = useAdminList('SupportTicket', { sort: '-updated_date', poll: 20000 });
  const orgs = useAdminList('Organization');
  const [tab, setTab] = useState('tickets');
  const [filter, setFilter] = useState('open');
  const [activeId, setActiveId] = useState(null);
  const active = tickets.items.find((t) => t.id === activeId);
  const shown = tickets.items.filter((t) => filter === 'all' || (filter === 'open' ? t.status !== 'resolved' : t.status === filter));

  const reply = async (text) => {
    const messages = [...(active.messages || []), { by: user?.full_name || 'Beyond Walls', from_team: true, text, at: new Date().toISOString() }];
    await tickets.update(active.id, { messages, status: 'waiting_customer', last_activity_at: new Date().toISOString() });
  };

  return (
    <div>
      <PageHeader title="Users & support" subtitle="Tickets from venues and advertisers, and every business on the platform" />
      <div className="inline-flex rounded-xl bg-[#EEEDF5] p-1 mb-5">
        {[['tickets', 'Tickets'], ['businesses', 'Businesses']].map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)} className={`!min-h-0 rounded-lg px-4 py-1.5 text-[13px] font-semibold ${tab === k ? 'bg-white shadow-sm' : 'text-bw-muted'}`}>{l}</button>
        ))}
      </div>

      {tab === 'tickets' ? (tickets.loading ? <ListSkeleton /> : (
        <div className="grid lg:grid-cols-[380px_1fr] gap-5">
          <div className="bw-card p-2 h-fit">
            <div className="flex gap-1 p-1 mb-1">
              {[['open', 'Open'], ['resolved', 'Resolved'], ['all', 'All']].map(([k, l]) => (
                <button key={k} type="button" onClick={() => setFilter(k)} className={`!min-h-0 rounded-lg px-3 py-1 text-[12px] font-semibold ${filter === k ? 'bg-bw-navy text-white' : 'text-bw-muted'}`}>{l}</button>
              ))}
            </div>
            {shown.length === 0 && <p className="p-3 text-[13px] text-bw-muted">No tickets.</p>}
            {shown.map((t) => (
              <button key={t.id} type="button" onClick={() => setActiveId(t.id)} className={`!min-h-0 !block w-full text-start rounded-xl p-3 ${t.id === activeId ? 'bg-bw-lav' : 'hover:bg-bw-cream'}`}>
                <div className="flex items-center gap-2"><span className={`bw-chip ${STATUS[t.status]?.[1]}`}>{STATUS[t.status]?.[0]}</span>{['high', 'urgent'].includes(t.priority) && <span className="bw-chip bg-rose-50 text-rose-600">{t.priority}</span>}</div>
                <p className="mt-1 text-[13px] font-semibold text-bw-navy truncate">{t.subject}</p>
                <p className="text-[11px] text-bw-muted">{t.org_name} · {t.category?.replace('_', ' ')} · {timeAgo(t.last_activity_at || t.created_date)}</p>
              </button>
            ))}
          </div>
          {active ? (
            <div className="bw-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-[18px] font-bold text-bw-navy">{active.subject}</p>
                  <p className="text-[12px] text-bw-muted">{active.org_name} · {active.requester_name} · {active.requester_email}</p>
                </div>
                <div className="flex gap-2">
                  {active.requester_email && <a className="bw-btn bw-btn-ghost !py-1.5" href={`mailto:${active.requester_email}?subject=${encodeURIComponent(active.subject)}`}><Mail className="h-4 w-4" />Email</a>}
                  <select className="bw-input !w-auto !py-1.5" value={active.status} onChange={async (e) => { await tickets.update(active.id, { status: e.target.value, last_activity_at: new Date().toISOString() }); toast.success('Status updated'); }}>
                    {Object.entries(STATUS).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                </div>
              </div>
              <TicketThread ticket={active} onReply={reply} fromTeam />
            </div>
          ) : <div className="bw-card p-10 text-center text-[13px] text-bw-muted"><MessageCircle className="mx-auto h-6 w-6 mb-2" />Pick a ticket</div>}
        </div>
      )) : (
        <div className="bw-card overflow-x-auto">
          <table className="w-full min-w-[720px] text-start">
            <thead><tr className="text-[11px] uppercase text-bw-muted"><th className="p-3 text-start">Business</th><th className="p-3 text-start">Type</th><th className="p-3 text-start">Status</th><th className="p-3 text-start">Screens</th><th className="p-3 text-start">WhatsApp</th><th className="p-3 text-start">Joined</th></tr></thead>
            <tbody className="divide-y divide-bw-line">
              {orgs.items.map((o) => (
                <tr key={o.id} className="text-[13px]">
                  <td className="p-3 font-semibold text-bw-navy">{o.name}</td>
                  <td className="p-3 capitalize">{o.type}</td>
                  <td className="p-3"><span className={`bw-chip ${o.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : o.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-600'}`}>{o.status}</span></td>
                  <td className="p-3">{o.screen_count || 0}</td>
                  <td className="p-3">{o.whatsapp ? <a className="text-emerald-600 font-semibold" href={`https://wa.me/${String(o.whatsapp).replace(/\D/g, '')}`} target="_blank" rel="noreferrer">{o.whatsapp}</a> : '—'}</td>
                  <td className="p-3 text-bw-muted">{new Date(o.created_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
