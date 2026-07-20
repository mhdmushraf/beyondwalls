import React, { useState, useEffect } from 'react';
import SEOHead from "@/components/SEOHead";
import { base44 } from '@/api/base44Client';
import { WorkspaceSkeleton } from '@/components/workspace/Skeletons';
import WorkspaceHeader from '@/components/workspace/WorkspaceHeader';
import AdvertiserDashboard from '@/components/workspace/AdvertiserDashboard';
import VenueDashboard from '@/components/workspace/VenueDashboard';
import EnterpriseDashboard from '@/components/workspace/EnterpriseDashboard';
import AgencyDashboard from '@/components/workspace/AgencyDashboard';
import {
  Building2,
  Megaphone,
  Briefcase,
  Users,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const DASHBOARDS = {
  advertiser: AdvertiserDashboard,
  venue: VenueDashboard,
  enterprise: EnterpriseDashboard,
  agency: AgencyDashboard,
};

// Same options + copy as Register.jsx step 1
const ACCOUNT_TYPES = [
  { key: 'advertiser', label: 'Advertiser', subtitle: 'Run ads on screens', icon: Megaphone },
  { key: 'venue', label: 'Venue owner', subtitle: 'Earn from your screens', icon: Building2 },
  { key: 'enterprise', label: 'Enterprise', subtitle: 'Manage many screens', icon: Briefcase },
  { key: 'agency', label: 'Agency', subtitle: 'Manage clients', icon: Users },
];

function NoOrgState({ message, deadEnd, user, onRecovered }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('recovering'); // 'recovering' | 'picker' | 'provisioning'
  const [error, setError] = useState(null);

  // Attempt auto-recovery on mount (skip for genuine errors / dead-end mode)
  useEffect(() => {
    if (deadEnd) return;
    let cancelled = false;
    (async () => {
      // Determine account_type: sessionStorage retry → user.account_type → null
      let account_type = null;
      try {
        const retry = sessionStorage.getItem('bw_provision_retry');
        if (retry) {
          const parsed = JSON.parse(retry);
          if (parsed?.account_type) account_type = parsed.account_type;
        }
      } catch {
        /* malformed key — ignore */
      }
      if (!account_type && user?.account_type) {
        account_type = user.account_type;
      }

      if (!account_type) {
        if (!cancelled) setPhase('picker');
        return;
      }

      try {
        await base44.functions.invoke('provisionOrg', { account_type });
        if (cancelled) return;
        sessionStorage.removeItem('bw_provision_retry');
        onRecovered();
      } catch (e) {
        if (cancelled) return;
        setError(
          e?.response?.data?.error ||
            e?.data?.error ||
            e?.message ||
            'Could not create your organization.'
        );
        setPhase('picker');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePick = async (account_type) => {
    setPhase('provisioning');
    setError(null);
    try {
      await base44.functions.invoke('provisionOrg', { account_type });
      sessionStorage.removeItem('bw_provision_retry');
      onRecovered();
    } catch (e) {
      setError(
        e?.response?.data?.error ||
          e?.data?.error ||
          e?.message ||
          'Could not create your organization.'
      );
      setPhase('picker');
    }
  };

  // Dead-end mode (genuine error — auth failure, fetch failure)
  if (deadEnd) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary rounded-xl flex items-center justify-center mx-auto mb-5">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h1>
          <p className="text-sm text-slate-500 mb-5">
            {message || 'Your account is not linked to an organization yet.'}
          </p>
          <Button onClick={() => navigate('/')}>Back to home</Button>
        </div>
      </div>
    );
  }

  // Auto-recovery in progress
  if (phase === 'recovering') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Setting up your workspace…</p>
        </div>
      </div>
    );
  }

  // Segment picker
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary rounded-xl flex items-center justify-center mx-auto mb-5">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Create your account</h1>
          <p className="text-sm text-slate-500">How will you use Beyond Walls?</p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          {ACCOUNT_TYPES.map(({ key, label, subtitle, icon: Icon }) => (
            <button
              key={key}
              type="button"
              disabled={phase === 'provisioning'}
              onClick={() => handlePick(key)}
              className={`relative p-4 rounded-xl border-2 text-left transition-all min-h-[110px] ${
                phase === 'provisioning'
                  ? 'border-[#E3E6F1] bg-[#F7F8FC] opacity-50 cursor-not-allowed'
                  : 'border-[#E3E6F1] bg-[#F7F8FC] hover:border-slate-300'
              }`}
            >
              <Icon className="w-6 h-6 mb-3 text-slate-400" />
              <p className="font-semibold text-slate-900 text-sm">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-400 mb-5 leading-relaxed text-center">
          Enterprise &amp; agencies: 0% commission on a per-screen plan. Venue owners join free
          and keep 100%.
        </p>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </button>
      </div>
    </div>
  );
}

export default function Workspace() {
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadWorkspace = async () => {
    setLoading(true);
    setError(null);
    try {
      const u = await base44.auth.me();
      if (!u) {
        setError('Not authenticated.');
        return;
      }
      const memberships = await base44.entities.Membership.filter(
        { user_id: u.id },
        null,
        1,
        0
      );
      const orgId = u.current_org_id || memberships[0]?.org_id;
      if (!orgId) {
        // No org — NoOrgState will attempt recovery or show the segment picker
        setUser(u);
        setOrg(null);
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
  };

  useEffect(() => {
    loadWorkspace();
  }, []);

  if (loading) return <WorkspaceSkeleton />;
  if (error) return <NoOrgState message={error} deadEnd />;
  if (!user || !org) return <NoOrgState user={user} onRecovered={loadWorkspace} />;

  const Dashboard = DASHBOARDS[org.type] || AdvertiserDashboard;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <SEOHead noIndex title="Workspace | Beyond Walls" />
      <WorkspaceHeader org={org} user={user} />
      <Dashboard user={user} org={org} />
    </div>
  );
}