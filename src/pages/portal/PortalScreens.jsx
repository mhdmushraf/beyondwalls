import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MonitorPlay, Store } from 'lucide-react';
import { usePortal } from '@/lib/PortalContext';
import AddScreenWizard from '@/components/portal/AddScreenWizard';
import ScreenTile from '@/components/portal/ScreenTile';
import { TilesSkeleton } from '@/components/portal/Skeletons';
import { PageHeader, EmptyState } from '@/components/portal/ui';

export function screenState(s) {
  if (!s.paired_device_id) return 'unpaired';
  return s.is_online ? 'online' : 'offline';
}

export default function PortalScreens() {
  const { venues, screens, loadingData } = usePortal();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  const counts = {
    all: screens.length,
    online: screens.filter((s) => screenState(s) === 'online').length,
    offline: screens.filter((s) => screenState(s) === 'offline').length,
    unpaired: screens.filter((s) => screenState(s) === 'unpaired').length,
  };
  const shown = screens.filter((s) => filter === 'all' || screenState(s) === filter);
  const groups = venues.map((v) => ({ venue: v, list: shown.filter((s) => s.venue_id === v.id) })).filter((g) => g.list.length);

  return (
    <div>
      <PageHeader title="Screens" subtitle={`${counts.online} of ${counts.all} online right now`}
        actions={<button type="button" className="bw-btn bw-btn-primary" onClick={() => setOpen(true)} disabled={!venues.length}><Plus className="h-4 w-4" />Add screen</button>} />

      {loadingData && !screens.length ? <TilesSkeleton count={6} /> : !venues.length ? (
        <EmptyState icon={Store} title="Add your venue first" body="Screens belong to a venue (branch). Add one, then pair your TVs."
          action={<Link to="/app/venues" className="bw-btn bw-btn-primary"><Plus className="h-4 w-4" />Add venue</Link>} />
      ) : !screens.length ? (
        <EmptyState icon={MonitorPlay} title="Pair your first TV" body="B.One, Android TV, LG, Samsung or any browser — it takes about 2 minutes."
          action={<button type="button" className="bw-btn bw-btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Add screen</button>} />
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-5">
            {[['all', 'All'], ['online', 'Online'], ['offline', 'Offline'], ['unpaired', 'Not paired']].map(([k, l]) => (
              <button key={k} type="button" onClick={() => setFilter(k)}
                className={`!min-h-0 rounded-full px-4 py-1.5 text-[13px] font-semibold ${filter === k ? 'bg-bw-navy text-white' : 'bg-white border border-bw-line text-bw-ink'}`}>
                {l} {counts[k]}
              </button>
            ))}
          </div>
          {groups.length === 0 && <p className="text-[13px] text-bw-muted">No screens in this filter.</p>}
          <div className="space-y-7">
            {groups.map(({ venue, list }) => (
              <div key={venue.id}>
                <p className="mb-3 text-[14px] font-bold text-bw-navy">{venue.name} <span className="font-medium text-bw-muted">· {list.length} {list.length === 1 ? 'screen' : 'screens'}</span></p>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {list.map((s) => <ScreenTile key={s.id} screen={s} venueName={s.position_label || venue.name} />)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <AddScreenWizard open={open} onOpenChange={setOpen} />
    </div>
  );
}
