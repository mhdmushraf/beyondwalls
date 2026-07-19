import React from 'react';
import KpiCard from '@/components/workspace/KpiCard';
import { DollarSign, BarChart3, Wallet, Activity, CheckCircle2 } from 'lucide-react';
import { formatAED } from '@/components/workspace/format';

export default function RevenueKpis({ transactions, eligible, loading }) {
  const earnings = transactions
    .filter((t) => t.type === 'earnings')
    .reduce((s, t) => s + (t.amount || 0), 0);
  const platformFee = transactions
    .filter((t) => t.type === 'platform_fee')
    .reduce((s, t) => s + (t.amount || 0), 0);
  const paidOut = transactions
    .filter((t) => t.type === 'payout')
    .reduce((s, t) => s + (t.amount || 0), 0);

  const grossBooked = earnings + platformFee;
  const netEarnings = earnings;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      <KpiCard icon={DollarSign} label="Gross booked" value={formatAED(grossBooked)} loading={loading} />
      <KpiCard icon={BarChart3} label="Commission" value={formatAED(platformFee)} loading={loading} />
      <KpiCard icon={Wallet} label="Net earnings" value={formatAED(netEarnings)} loading={loading} />
      <KpiCard icon={Activity} label="Paid out" value={formatAED(paidOut)} loading={loading} />
      <KpiCard icon={CheckCircle2} label="Eligible" value={formatAED(eligible)} loading={loading} />
    </div>
  );
}