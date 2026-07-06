import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { ListSkeleton } from '@/components/workspace/Skeletons';
import EmptyState from '@/components/workspace/EmptyState';
import ScreenRow from '@/components/screens/ScreenRow';
import ScreenEditDialog from '@/components/screens/ScreenEditDialog';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

export default function MyScreens() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editScreen, setEditScreen] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        if (!u) { navigate('/'); return; }
        const memberships = await base44.entities.Membership.filter({ user_id: u.id }, null, 1, 0);
        const orgId = u.current_org_id || memberships[0]?.org_id;
        if (!orgId) { navigate('/'); return; }
        const o = await base44.entities.Organization.get(orgId);
        setUser(u);
        setOrg(o);
      } catch {
        navigate('/');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const { items, loading: listLoading, loadingMore, hasMore, loadMore, refresh } = usePaginatedList(
    (skip) => base44.entities.Screen.filter({ org_id: org?.id }, '-created_date', PAGE_SIZE, skip),
    PAGE_SIZE
  );

  // Poll for live status every 15s
  useEffect(() => {
    if (!org) return;
    const interval = setInterval(() => refresh(), 15000);
    return () => clearInterval(interval);
  }, [org, refresh]);

  const handleToggleMonetization = async (screen) => {
    const newMode = screen.monetization_mode === 'marketplace' ? 'self_serve' : 'marketplace';
    try {
      await base44.entities.Screen.update(screen.id, { monetization_mode: newMode });
      refresh();
    } catch {
      toast.error('Failed to update monetization mode');
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="h-8 w-48 bg-slate-100 rounded animate-pulse" />
        <ListSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">My Screens</h1>
          <p className="text-sm text-slate-500">Manage your displays and pairing.</p>
        </div>
        <Button onClick={() => navigate('/add-screen')}>
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add screen</span>
        </Button>
      </div>

      {listLoading ? (
        <ListSkeleton rows={4} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No screens yet"
          message="Add your first screen to start displaying content."
          actionLabel="Add screen"
          actionTo="/add-screen"
        />
      ) : (
        <div className="space-y-3">
          {items.map((screen) => (
            <ScreenRow
              key={screen.id}
              screen={screen}
              onEdit={() => setEditScreen(screen)}
              onToggleMonetization={() => handleToggleMonetization(screen)}
            />
          ))}
          {hasMore && (
            <Button variant="outline" onClick={loadMore} disabled={loadingMore} className="w-full">
              {loadingMore ? 'Loading…' : 'Load more'}
            </Button>
          )}
        </div>
      )}

      <ScreenEditDialog
        screen={editScreen}
        open={!!editScreen}
        onOpenChange={(open) => !open && setEditScreen(null)}
        onSaved={() => { setEditScreen(null); refresh(); }}
      />
    </div>
  );
}