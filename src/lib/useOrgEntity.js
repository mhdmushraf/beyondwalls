import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { usePortal } from '@/lib/PortalContext';
import { isOnline, queueWrite, readPreviewState } from '@/lib/states';

const cacheKey = (entity, orgId, q) => `bw_cache:${entity}:${orgId}:${q}`;

/**
 * Loads records of one entity for the current business and gives
 * create/update/remove helpers that keep org scoping + RLS fields set.
 *
 * States handled here so every page gets them:
 * - offline: last loaded list is kept (and cached on the device); writes go to the outbox
 * - error: `error` is set and `reload` retries
 * - preview: admins can force ?state=empty|loading|error|slow
 */
export function useOrgEntity(entityName, { sort = '-created_date', limit = 200, query = null, poll = 0 } = {}) {
  const { org, orgId, user } = usePortal();
  const preview = readPreviewState(user);
  const queryKey = JSON.stringify(query || {});
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(cacheKey(entityName, orgId, queryKey)) || '[]'); } catch (e) { return []; }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let alive = true;
    if (!orgId) { setItems([]); setLoading(false); return () => { alive = false; }; }
    if (!isOnline()) { setLoading(false); return () => { alive = false; }; }
    (async () => {
      const page = await base44.entities[entityName].filter({ org_id: orgId, ...(query || {}) }, { sort, limit });
      if (!alive) return;
      const list = page.items || page || [];
      setItems(list);
      setError(null);
      setLoading(false);
      try { localStorage.setItem(cacheKey(entityName, orgId, queryKey), JSON.stringify(list.slice(0, 200))); } catch (e) { /* storage full */ }
    })().catch((e) => { if (alive) { setError(e); setLoading(false); } });
    return () => { alive = false; };
    // eslint-disable-next-line
  }, [entityName, orgId, tick, sort, limit, queryKey]);

  useEffect(() => {
    if (!poll) return undefined;
    const id = setInterval(() => { if (isOnline()) reload(); }, poll);
    return () => clearInterval(id);
  }, [poll, reload]);

  useEffect(() => {
    const back = () => reload();
    window.addEventListener('online', back);
    return () => window.removeEventListener('online', back);
  }, [reload]);

  const create = useCallback(async (data) => {
    const full = { ...data, org_id: orgId, org_member_user_ids: org?.member_user_ids || [] };
    if (!isOnline()) {
      queueWrite({ op: 'create', entity: entityName, data: full });
      const temp = { ...full, id: `local-${Date.now()}`, created_date: new Date().toISOString(), _pending: true };
      setItems((list) => [temp, ...list]);
      return temp;
    }
    const record = await base44.entities[entityName].create(full);
    setItems((list) => [record, ...list]);
    return record;
  }, [entityName, orgId, org]);

  const update = useCallback(async (id, data) => {
    setItems((list) => list.map((item) => (item.id === id ? { ...item, ...data } : item)));
    if (!isOnline()) {
      queueWrite({ op: 'update', entity: entityName, id, data });
      return { id, ...data, _pending: true };
    }
    const record = await base44.entities[entityName].update(id, data);
    setItems((list) => list.map((item) => (item.id === id ? { ...item, ...data, ...(record || {}) } : item)));
    return record;
  }, [entityName]);

  const remove = useCallback(async (id) => {
    if (!isOnline()) throw Object.assign(new Error('offline'), { status: 0 });
    await base44.entities[entityName].delete(id);
    setItems((list) => list.filter((item) => item.id !== id));
  }, [entityName]);

  // Preview switch (admins only)
  if (preview === 'empty') return { items: [], setItems, loading: false, error: null, reload, create, update, remove, preview };
  if (preview === 'loading') return { items: [], setItems, loading: true, error: null, reload, create, update, remove, preview };
  if (preview === 'error') return { items: [], setItems, loading: false, error: { status: 500 }, reload, create, update, remove, preview };

  return { items, setItems, loading: loading && !items.length, error: items.length ? null : error, reload, create, update, remove, preview };
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}
