import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { WorkspaceSkeleton } from '@/components/workspace/Skeletons';
import WorkspaceHeader from '@/components/workspace/WorkspaceHeader';
import AdvertiserDashboard from '@/components/workspace/AdvertiserDashboard';
import VenueDashboard from '@/components/workspace/VenueDashboard';
import EnterpriseDashboard from '@/components/workspace/EnterpriseDashboard';
import AgencyDashboard from '@/components/workspace/AgencyDashboard';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const DASHBOARDS = {
  advertiser: AdvertiserDashboard,
  venue: VenueDashboard,
  enterprise: EnterpriseDashboard,
  agency: AgencyDashboard,
};

function NoOrgState({ message }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-14 h-14 bg-gradient-to-br from-[#6366f1] to-[#6366f1] rounded-xl flex items-center justify-center mx-auto mb-5">
          <Building2 className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">No organization found</h1>
        <p className="text-sm text-slate-500 mb-5">
          {message || 'Your account is not linked to an organization yet.'}
        </p>
        <Button onClick={() => navigate('/')}>Back to home</Button>
      </div>
    </div>
  );
}

export default function Workspace() {
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        if (!u) {
          setError('Not authenticated.');
          setLoading(false);
          return;
        }
        const memberships = await base44.entities.Membership.filter({ user_id: u.id }, null, 1, 0);
        const orgId = u.current_org_id || memberships[0]?.org_id;
        if (!orgId) {
          setError('Your account is not linked to an organization yet.');
          setLoading(false);
          return;
        }
        const o = await base44.entities.Organization.get(orgId);
        setUser(u);
        setOrg(o);
      } catch (e) {
        setError(e.message || 'Failed to load workspace.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <WorkspaceSkeleton />;
  if (error || !user || !org) return <NoOrgState message={error} />;

  const Dashboard = DASHBOARDS[org.type] || AdvertiserDashboard;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <WorkspaceHeader org={org} user={user} />
      <Dashboard user={user} org={org} />
    </div>
  );
}