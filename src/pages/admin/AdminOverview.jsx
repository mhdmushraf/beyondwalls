import { Link } from 'react-router-dom';
import { ShieldCheck, MonitorPlay, WifiOff, LifeBuoy, Wrench, Receipt, Target, ChevronRight } from 'lucide-react';
import { useAdminList } from '@/components/admin/AdminLayout';
import { PageHeader } from '@/components/portal/ui';
import { StatCardsSkeleton } from '@/components/portal/Skeletons';
import { timeAgo } from '@/lib/portalData';

export default function AdminOverview() {
  const orgs = useAdminList('Organization');
  const venues = useAdminList('Venue');
  const screens = useAdminList('Screen', { limit: 2000, poll: 60000 });
  const tickets = useAdminList('SupportTicket');
  const installs = useAdminList('InstallJob');
  const invoices = useAdminList('Invoice', { limit: 1000 });
  const leads = useAdminList('Lead');

  if (orgs.loading || screens.loading) return <StatCardsSkeleton />;

  const pending = orgs.items.filter((o) => o.status === 'pending').length + venues.items.filter((v) => v.approval_status === 'pending').length + orgs.items.filter((o) => o.advertiser_status === 'requested').length;
  const paired = screens.items.filter((s) => s.paired_device_id);
  const online = paired.filter((s) => s.is_online).length;
  const offline = paired.filter((s) => !s.is_online);
  const openTickets = tickets.items.filter((t) => t.status !== 'resolved').length;
  const openInstalls = installs.items.filter((i) => ['requested', 'scheduled', 'on_the_way'].includes(i.status)).length;
  const unpaid = invoices.items.filter((i) => i.status === 'issued');
  const unpaidTotal = unpaid.reduce((s, i) => s + (i.total || 0), 0);
  const hotLeads = leads.items.filter((l) => ['demo', 'proposal'].includes(l.stage)).length;
  const orgName = (id) => orgs.items.find((o) => o.id === id)?.name || '';

  const cards = [
    ['/admin/approvals', ShieldCheck, 'Waiting approval', pending, 'text-amber-600 bg-amber-50'],
    ['/admin/screens', MonitorPlay, 'Screens online', `${online}/${paired.length}`, 'text-emerald-600 bg-emerald-50'],
    ['/admin/support', LifeBuoy, 'Open tickets', openTickets, 'text-rose-600 bg-rose-50'],
    ['/admin/installs', Wrench, 'Installs to do', openInstalls, 'text-sky-600 bg-sky-50'],
    ['/admin/billing', Receipt, 'Unpaid invoices', `AED ${Math.round(unpaidTotal).toLocaleString()}`, 'text-bw-coral bg-bw-lav'],
    ['/admin/leads', Target, 'Hot leads', hotLeads, 'text-violet-600 bg-violet-50'],
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Platform today" subtitle={`${orgs.items.length} businesses · ${venues.items.length} venues · ${screens.items.length} screens`} />
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {cards.map(([to, Icon, label, value, tone]) => (
          <Link key={to} to={to} className="!flex-col !items-start !justify-start bw-card p-4 hover:-translate-y-0.5 transition">
            <span className={`h-9 w-9 rounded-xl flex items-center justify-center ${tone}`}><Icon className="h-4 w-4" /></span>
            <span className="mt-3 text-[22px] font-bold text-bw-navy">{value}</span>
            <span className="text-[12px] text-bw-muted">{label}</span>
          </Link>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bw-card p-4">
          <div className="flex items-center justify-between mb-2"><p className="text-[15px] font-bold text-bw-navy">Offline screens</p><Link to="/admin/screens" className="text-[12px] font-semibold text-bw-coral">Screen wall</Link></div>
          {offline.length === 0 ? <p className="text-[13px] text-bw-muted">Every paired screen is online.</p> : offline.slice(0, 8).map((s) => (
            <div key={s.id} className="flex items-center gap-3 py-2 border-t border-bw-line first:border-0">
              <WifiOff className="h-4 w-4 text-rose-500" />
              <div className="flex-1 min-w-0"><p className="text-[13px] font-semibold text-bw-navy truncate">{s.name}</p><p className="text-[11px] text-bw-muted">{orgName(s.org_id)} · last seen {s.last_heartbeat ? timeAgo(s.last_heartbeat) : 'never'}</p></div>
            </div>
          ))}
        </div>
        <div className="bw-card p-4">
          <div className="flex items-center justify-between mb-2"><p className="text-[15px] font-bold text-bw-navy">Latest tickets</p><Link to="/admin/support" className="text-[12px] font-semibold text-bw-coral">All</Link></div>
          {tickets.items.length === 0 ? <p className="text-[13px] text-bw-muted">No tickets yet.</p> : tickets.items.slice(0, 8).map((t) => (
            <Link key={t.id} to="/admin/support" className="!justify-start flex items-center gap-3 py-2 border-t border-bw-line first:border-0">
              <span className={`h-2 w-2 rounded-full ${t.status === 'resolved' ? 'bg-emerald-500' : t.priority === 'urgent' || t.priority === 'high' ? 'bg-rose-500' : 'bg-amber-400'}`} />
              <span className="flex-1 min-w-0"><span className="block text-[13px] font-semibold text-bw-navy truncate">{t.subject}</span><span className="block text-[11px] text-bw-muted">{t.org_name} · {timeAgo(t.last_activity_at || t.created_date)}</span></span>
              <ChevronRight className="h-4 w-4 text-bw-muted" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
