import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ChevronDown, ChevronRight, Building2, MonitorPlay, Wifi, WifiOff } from 'lucide-react';
import { WorkspaceSkeleton } from '@/components/workspace/Skeletons';
import EmptyState from '@/components/workspace/EmptyState';
import AddSiteDialog from '@/components/network/AddSiteDialog';
import BulkAddScreensDialog from '@/components/network/BulkAddScreensDialog';

export default function Network() {
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sites, setSites] = useState([]);
  const [allScreens, setAllScreens] = useState([]);
  const [telemetryMap, setTelemetryMap] = useState({});
  const [expandedSiteId, setExpandedSiteId] = useState(null);
  const [addSiteOpen, setAddSiteOpen] = useState(false);
  const [bulkSite, setBulkSite] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        const orgId = u?.current_org_id;
        if (!orgId) { setLoading(false); return; }
        const o = await base44.entities.Organization.get(orgId);
        setOrg(o);
      } catch { /* silent */ } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadData = useCallback(async () => {
    if (!org?.id) return;
    try {
      const [siteList, screens] = await Promise.all([
        base44.entities.Site.filter({ org_id: org.id }, '-created_date', 100, 0),
        base44.entities.Screen.filter({ org_id: org.id }, '-created_date', 200, 0),
      ]);
      setSites(siteList);
      setAllScreens(screens);
      const screenIds = screens.map(s => s.id);
      if (screenIds.length > 0) {
        const telem = await base44.entities.ScreenTelemetry.filter({ screen_id: { $in: screenIds } });
        const map = {};
        telem.forEach(t => { map[t.screen_id] = t; });
        setTelemetryMap(map);
      }
    } catch { /* silent */ }
  }, [org?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <WorkspaceSkeleton />;
  if (!org) return <div className="p-4 sm:p-6 lg:p-8"><EmptyState title="No organization" message="Your account is not linked to an organization." /></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">Network</h1>
          <p className="text-sm text-slate-500">Manage sites and screens across your enterprise.</p>
        </div>
        <Button onClick={() => setAddSiteOpen(true)}><Plus className="w-4 h-4" /><span className="hidden sm:inline">Add site</span></Button>
      </div>

      {sites.length === 0 ? (
        <div className="space-y-4">
          <EmptyState title="No sites yet" message="Add a site to start grouping screens by location." />
          <div className="text-center">
            <Button onClick={() => setAddSiteOpen(true)}><Plus className="w-4 h-4" />Add site</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sites.map(site => {
            const screens = allScreens.filter(s => s.site_id === site.id);
            const online = screens.filter(s => telemetryMap[s.id]?.is_online).length;
            const isExpanded = expandedSiteId === site.id;
            return (
              <div key={site.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <button onClick={() => setExpandedSiteId(isExpanded ? null : site.id)} className="w-full flex items-center justify-between p-4 hover:bg-slate-50">
                  <div className="flex items-center gap-3 min-w-0">
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                    <Building2 className="w-5 h-5 text-slate-400" />
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">{site.name}</p>
                      <p className="text-xs text-slate-400 truncate">{[site.city, site.emirate].filter(Boolean).join(', ') || 'No address'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className="bg-green-100 text-green-700"><Wifi className="w-3 h-3 mr-1" />{online}</Badge>
                    <Badge className="bg-slate-100 text-slate-500"><WifiOff className="w-3 h-3 mr-1" />{screens.length - online}</Badge>
                    <Badge className="bg-violet-100 text-violet-700"><MonitorPlay className="w-3 h-3 mr-1" />{screens.length}</Badge>
                  </div>
                </button>
                {isExpanded && (
                  <div className="border-t border-slate-100 p-4 space-y-3">
                    {screens.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-4">No screens at this site yet.</p>
                    ) : (
                      screens.map(s => {
                        const isOnline = telemetryMap[s.id]?.is_online;
                        return (
                          <div key={s.id} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">{s.name}</p>
                              <p className="text-xs text-slate-400 truncate">{s.location_description || s.setup_code}</p>
                            </div>
                            <Badge className={isOnline ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}>
                              {isOnline ? 'Online' : 'Offline'}
                            </Badge>
                          </div>
                        );
                      })
                    )}
                    <Button variant="outline" size="sm" className="w-full" onClick={() => setBulkSite(site)}>
                      <Plus className="w-4 h-4 mr-1" />Bulk add screens
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AddSiteDialog open={addSiteOpen} onOpenChange={setAddSiteOpen} org={org} onCreated={loadData} />
      {bulkSite && (
        <BulkAddScreensDialog open={!!bulkSite} onOpenChange={(o) => !o && setBulkSite(null)} org={org} site={bulkSite} onCreated={loadData} />
      )}
    </div>
  );
}