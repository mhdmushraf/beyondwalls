import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { WorkspaceSkeleton } from '@/components/workspace/Skeletons';
import BillingSection from '@/components/workspace/BillingSection';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

function NoOrgState() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary rounded-xl flex items-center justify-center mx-auto mb-5">
          <Building2 className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">No organization found</h1>
        <p className="text-sm text-slate-500 mb-5">Your account is not linked to an organization yet.</p>
        <Button onClick={() => navigate('/')}>Back to home</Button>
      </div>
    </div>
  );
}

export default function Settings() {
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        if (!u) {
          setLoading(false);
          return;
        }
        const memberships = await base44.entities.Membership.filter({ user_id: u.id }, null, 1, 0);
        const orgId = u.current_org_id || memberships[0]?.org_id;
        if (!orgId) {
          setLoading(false);
          return;
        }
        const o = await base44.entities.Organization.get(orgId);
        setUser(u);
        setOrg(o);
      } catch {
        /* user not logged in */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <WorkspaceSkeleton />;
  if (!user || !org) return <NoOrgState />;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="font-heading font-bold text-lg sm:text-xl text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Manage your account and billing.</p>
      </div>
      <BillingSection user={user} org={org} />
    </div>
  );
}