import React, { useState, useEffect } from 'react';
import SEOHead from "@/components/SEOHead";
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { WorkspaceSkeleton, ListSkeleton } from '@/components/workspace/Skeletons';
import NotAuthorised from '@/components/admin/NotAuthorised';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { Search } from 'lucide-react';
import moment from 'moment';

const PAGE_SIZE = 20;

export default function Users() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch (e) {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const { items, loading: listLoading, loadingMore, hasMore, loadMore, refresh } = usePaginatedList(
    (skip) => base44.entities.User.filter(
      search ? { email: { $regex: search, $options: 'i' } } : {},
      '-created_date', PAGE_SIZE, skip
    ),
    PAGE_SIZE
  );

  useEffect(() => {
    const timer = setTimeout(() => refresh(), 300);
    return () => clearTimeout(timer);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <WorkspaceSkeleton />;

  const isAdmin = user?.user_role === 'admin' || user?.role === 'admin';
  if (!isAdmin) return <NotAuthorised />;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <SEOHead noIndex title="Users | Beyond Walls" />
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">Users</h1>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email…"
            className="pl-9"
          />
        </div>
      </div>

      {listLoading && items.length === 0 ? (
        <ListSkeleton />
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <p className="text-sm text-slate-500">{search ? 'No users match your search.' : 'No users found.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((u) => (
            <div key={u.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 truncate">{u.full_name || u.email}</p>
                  <p className="text-xs text-slate-400 truncate">{u.email}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-slate-100 text-slate-600">{u.role || '—'}</Badge>
                  <Badge className="bg-violet-100 text-violet-700">{u.user_role || '—'}</Badge>
                  <Badge className="bg-blue-100 text-blue-700">{u.account_type || '—'}</Badge>
                  <Badge className={u.approval_status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                    {u.approval_status || '—'}
                  </Badge>
                  {!u.current_org_id && (
                    <Badge className="bg-red-100 text-red-700">No organisation</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                <span>{u.current_org_id ? `Org: ${u.current_org_id.slice(0, 8)}…` : 'No org linked'}</span>
                {u.created_date && <span>Joined {moment(u.created_date).format('DD MMM YYYY')}</span>}
              </div>
            </div>
          ))}
          {hasMore && (
            <Button variant="outline" onClick={loadMore} disabled={loadingMore} className="w-full">
              {loadingMore ? 'Loading…' : 'Load more'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}