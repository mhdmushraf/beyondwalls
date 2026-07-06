import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { ListSkeleton } from '@/components/workspace/Skeletons';
import EmptyState from '@/components/workspace/EmptyState';
import MarketplaceCard from '@/components/marketplace/MarketplaceCard';

const PAGE_SIZE = 20;

export default function Marketplace() {
  const [search, setSearch] = useState('');

  const { items, loading, loadingMore, hasMore, loadMore } = usePaginatedList(
    (skip) => base44.entities.Screen.filter(
      { monetization_mode: 'marketplace', status: 'active', approval_status: 'approved' },
      '-created_date',
      PAGE_SIZE,
      skip
    ),
    PAGE_SIZE
  );

  // Fetch venues for audience/location data (cached, one-time)
  const { data: venues = [] } = useQuery({
    queryKey: ['marketplace-venues'],
    queryFn: () => base44.entities.Venue.filter({ status: 'active' }, null, 100, 0),
    staleTime: 60000,
  });

  const venueMap = {};
  venues.forEach(v => { venueMap[v.id] = v; });

  const visibleScreens = items.filter(s => s.price_per_week > 0);
  const filtered = search
    ? visibleScreens.filter(s => {
        const v = venueMap[s.venue_id];
        const q = search.toLowerCase();
        return s.name?.toLowerCase().includes(q) ||
          s.location_description?.toLowerCase().includes(q) ||
          v?.name?.toLowerCase().includes(q) ||
          v?.city?.toLowerCase().includes(q) ||
          s.tags?.some(t => t.toLowerCase().includes(q));
      })
    : visibleScreens;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">Marketplace</h1>
        <p className="text-sm text-slate-500">Browse available advertising screens.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search by name, location, or tag…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-slate-100 rounded-xl animate-pulse h-64" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No screens found" message="Try adjusting your search or check back later." />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(screen => (
              <MarketplaceCard key={screen.id} screen={screen} venue={venueMap[screen.venue_id]} />
            ))}
          </div>
          {hasMore && !search && (
            <Button variant="outline" onClick={loadMore} disabled={loadingMore} className="w-full">
              {loadingMore ? 'Loading…' : 'Load more'}
            </Button>
          )}
        </>
      )}
    </div>
  );
}