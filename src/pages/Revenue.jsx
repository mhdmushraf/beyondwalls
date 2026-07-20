import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { WorkspaceSkeleton } from '@/components/workspace/Skeletons';
import EmptyState from '@/components/workspace/EmptyState';
import RevenueKpis from '@/components/revenue/RevenueKpis';
import EarningsChart from '@/components/revenue/EarningsChart';
import PerScreenTable from '@/components/revenue/PerScreenTable';
import LedgerTable from '@/components/revenue/LedgerTable';

export default function Revenue() {
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payoutData, setPayoutData] = useState({ total_earnings: 0, total_paid_out: 0, eligible_payout: 0 });
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        const memberships = await base44.entities.Membership.filter({ user_id: u.id }, null, 1, 0);
        const orgId = u.current_org_id || memberships[0]?.org_id;
        if (orgId) {
          const o = await base44.entities.Organization.get(orgId);
          setOrg(o);
        }
        setUser(u);
      } catch (e) {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!org?.id) return;
    let cancelled = false;
    (async () => {
      setDataLoading(true);
      try {
        const res = await base44.functions.invoke('computeEligiblePayout', { org_id: org.id });
        if (!cancelled) setPayoutData({
          total_earnings: res.data?.total_earnings || 0,
          total_paid_out: res.data?.total_paid_out || 0,
          eligible_payout: res.data?.eligible_payout || 0,
        });
      } catch (e) {
        // silent
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [org?.id]);

  if (loading) return <WorkspaceSkeleton />;
  if (!user || !org) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <EmptyState title="No organization" message="Your account is not linked to an organization yet." />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">Revenue</h1>
      <RevenueKpis payoutData={payoutData} loading={dataLoading} />
      <EarningsChart orgId={org.id} />
      <PerScreenTable orgId={org.id} />
      <LedgerTable orgId={org.id} />
    </div>
  );
}