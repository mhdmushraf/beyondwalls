import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { readPreviewState, applyPreviewState } from '@/lib/states';

const readCache = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
const writeCache = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* full */ } };

const PortalContext = createContext(null);
const ORG_KEY = 'bw_org_id';

export function PortalProvider({ children }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [memberships, setMemberships] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [orgId, setOrgId] = useState(null);
  const [venues, setVenues] = useState([]);
  const [screens, setScreens] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [dataError, setDataError] = useState(null);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) {
      setLoading(false);
      return () => { cancelled = true; };
    }
    // Offline: start from the last business list seen on this device.
    const cached = readCache(`bw_cache:orgs:${user.id}`);
    if (cached && !navigator.onLine) {
      setMemberships(cached.memberships || []);
      setOrgs(cached.orgs || []);
      setOrgId((prev) => prev || localStorage.getItem(ORG_KEY) || cached.orgs?.[0]?.id || null);
      setLoading(false);
      return () => { cancelled = true; };
    }
    (async () => {
      const page = await base44.entities.Membership.filter({ user_id: user.id }, { limit: 50 });
      const list = page.items || [];
      const orgIds = [...new Set(list.map((m) => m.org_id).filter(Boolean))];
      let orgList = [];
      if (orgIds.length) {
        const orgPage = await base44.entities.Organization.filter({ id: { $in: orgIds } }, { limit: 50 });
        orgList = orgPage.items || [];
      }
      if (cancelled) return;
      setMemberships(list);
      setOrgs(orgList);
      writeCache(`bw_cache:orgs:${user.id}`, { memberships: list, orgs: orgList });
      let stored = null;
      try { stored = localStorage.getItem(ORG_KEY); } catch (e) { stored = null; }
      setOrgId((prev) => {
        const wanted = prev || stored;
        if (wanted && orgList.some((o) => o.id === wanted)) return wanted;
        return orgList[0]?.id || null;
      });
      setLoading(false);
    })().catch(() => {
      if (cancelled) return;
      if (cached) { setMemberships(cached.memberships || []); setOrgs(cached.orgs || []); setOrgId((prev) => prev || cached.orgs?.[0]?.id || null); }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [user?.id, reloadKey]);

  useEffect(() => {
    let cancelled = false;
    if (!orgId) {
      setVenues([]);
      setScreens([]);
      return () => { cancelled = true; };
    }
    const key = `bw_cache:org:${orgId}`;
    const cached = readCache(key);
    if (cached) { setVenues(cached.venues || []); setScreens(cached.screens || []); }
    setLoadingData(!cached);
    setDataError(null);
    if (!navigator.onLine) { setLoadingData(false); return () => { cancelled = true; }; }
    (async () => {
      const [venuePage, screenPage] = await Promise.all([
        base44.entities.Venue.filter({ org_id: orgId }, { sort: '-created_date', limit: 100 }),
        base44.entities.Screen.filter({ org_id: orgId }, { sort: '-created_date', limit: 200 }),
      ]);
      if (cancelled) return;
      setVenues(venuePage.items || []);
      setScreens(screenPage.items || []);
      setLoadingData(false);
      writeCache(key, { venues: venuePage.items || [], screens: screenPage.items || [] });
    })().catch((e) => {
      if (cancelled) return;
      setLoadingData(false);
      if (!cached) setDataError(e);
      if (e?.response?.status === 401) window.dispatchEvent(new Event('bw:session-expired'));
    });
    return () => { cancelled = true; };
  }, [orgId, reloadKey]);

  const selectOrg = useCallback(async (id) => {
    setOrgId(id);
    try { localStorage.setItem(ORG_KEY, id); } catch (e) { /* storage unavailable */ }
    const membership = memberships.find((m) => m.org_id === id);
    if (membership) {
      try {
        await base44.entities.Membership.update(membership.id, { current_org: true });
      } catch (e) {
        // The switcher still works from local state.
      }
    }
  }, [memberships]);

  const org = useMemo(() => orgs.find((o) => o.id === orgId) || null, [orgs, orgId]);
  const membership = useMemo(
    () => memberships.find((m) => m.org_id === orgId) || null,
    [memberships, orgId],
  );

  const preview = readPreviewState(user);
  useEffect(() => { applyPreviewState(preview); }, [preview]);
  useEffect(() => {
    const back = () => setReloadKey((k) => k + 1);
    window.addEventListener('online', back);
    return () => window.removeEventListener('online', back);
  }, []);
  const emptyPreview = preview === 'empty';

  const value = {
    preview,
    user,
    loading,
    loadingData,
    dataError: preview === 'error' ? { response: { status: 500 } } : dataError,
    memberships,
    orgs,
    org,
    membership,
    orgId,
    venues: emptyPreview ? [] : venues,
    screens: emptyPreview ? [] : screens,
    selectOrg,
    reload,
  };

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export function usePortal() {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error('usePortal must be used inside PortalProvider');
  return ctx;
}