import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { usePortal } from '@/lib/PortalContext';

/**
 * Loads records of one entity for the current business and gives
 * create/update/remove helpers that keep org scoping + RLS fields set.
 */
export function useOrgEntity(entityName, { sort = '-created_date', limit = 200, query = null, poll = 0 } = {}) {
  const { org, orgId } = usePortal();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  const queryKey = JSON.stringify(query || {});

  useEffect(() => {
    let alive = true;
    if (!orgId) { setItems([]); setLoading(false); return () => { alive = false; }; }
    (async () => {
      const page = await base44.entities[entityName].filter({ org_id: orgId, ...(query || {}) }, { sort, limit });
      if (!alive) return;
      setItems(page.items || page || []);
      setLoading(false);
    })().catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [entityName, orgId, tick, sort, limit, queryKey]);

  useEffect(() => {
    if (!poll) return undefined;
    const id = setInterval(reload, poll);
    return () => clearInterval(id);
  }, [poll, reload]);

  const create = useCallback(async (data) => {
    const record = await base44.entities[entityName].create({
      ...data,
      org_id: orgId,
      org_member_user_ids: org?.member_user_ids || [],
    });
    setItems((list) => [record, ...list]);
    return record;
  }, [entityName, orgId, org]);

  const update = useCallback(async (id, data) => {
    const record = await base44.entities[entityName].update(id, data);
    setItems((list) => list.map((item) => (item.id === id ? { ...item, ...data, ...(record || {}) } : item)));
    return record;
  }, [entityName]);

  const remove = useCallback(async (id) => {
    await base44.entities[entityName].delete(id);
    setItems((list) => list.filter((item) => item.id !== id));
  }, [entityName]);

  return { items, setItems, loading, reload, create, update, remove };
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}
