import React from 'react';
import KpiCard from '@/components/workspace/KpiCard';
import { Wallet, ArrowDownToLine, CheckCircle2 } from 'lucide-react';
import { formatAED } from '@/components/workspace/format';

export default function RevenueKpis({ payoutData, loading }) {
  const totalEarnings = payoutData?.total_earnings || 0;
  const paidOut = payoutData?.total_paid_out || 0;
  const eligible = payoutData?.eligible_payout || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <KpiCard icon={Wallet} label="Total earnings" value={formatAED(totalEarnings)} loading={loading} />
      <KpiCard icon={ArrowDownToLine} label="Paid out" value={formatAED(paidOut)} loading={loading} />
      <KpiCard icon={CheckCircle2} label="Eligible for payout" value={formatAED(eligible)} loading={loading} />
    </div>
  );
}