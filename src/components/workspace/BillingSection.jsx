import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { CreditCard, MonitorPlay, DollarSign, ArrowUpDown } from 'lucide-react';
import KpiCard from './KpiCard';
import { formatAED, formatNumber } from './format';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function BillingSection({ user, org }) {
  const [subscription, setSubscription] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [subs, contracts] = await Promise.all([
          base44.entities.Subscription.filter({ org_id: org.id }, null, 1, 0),
          base44.entities.Contract.filter({ org_id: org.id }, null, 1, 0),
        ]);
        setSubscription(subs[0] || null);
        setContract(contracts[0] || null);
      } catch {
        setSubscription(null);
        setContract(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [org.id]);

  const isSaas = org.commercial_plan === 'saas';
  const planLabel = isSaas ? 'SaaS · 0% commission' : 'Revenue-share · 30% commission';
  const screenQuantity = subscription?.screen_quantity ?? 0;
  const pricePerScreen = contract?.price_per_screen ?? 0;
  const monthlyTotal = isSaas ? screenQuantity * pricePerScreen : 0;

  const handleTogglePlan = async () => {
    const newPlan = isSaas ? 'revenue_share' : 'saas';
    const verb = isSaas ? 'downgrade to Revenue Share' : 'upgrade to SaaS';
    setUpdating(true);
    try {
      const res = await base44.functions.invoke('manageSubscription', {
        action: 'update_plan',
        org_id: org.id,
        new_plan: newPlan,
      });
      const data = res.data;
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }
      toast.success(`Plan updated to ${newPlan === 'saas' ? 'SaaS' : 'Revenue Share'}`);
      window.location.reload();
    } catch (e) {
      toast.error(e.message || `Failed to ${verb}`);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-semibold text-base sm:text-lg text-slate-900 mb-1">Billing</h2>
        <p className="text-sm text-slate-500">Manage your subscription plan and screen billing.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <KpiCard
          icon={CreditCard}
          label="Current plan"
          value={loading ? '…' : planLabel}
        />
        <KpiCard
          icon={MonitorPlay}
          label="Screens billed"
          value={loading ? '…' : formatNumber(screenQuantity)}
        />
        <KpiCard
          icon={DollarSign}
          label="Monthly total"
          value={loading ? '…' : formatAED(monthlyTotal)}
          sublabel={isSaas && pricePerScreen ? `${formatAED(pricePerScreen)} / screen` : undefined}
        />
      </div>

      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-medium text-slate-900">
              {isSaas ? 'SaaS Plan' : 'Revenue-Share Plan'}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {isSaas
                ? `Pay ${formatAED(pricePerScreen)} per screen per month. 0% commission on marketplace earnings.`
                : 'Free to join. 30% commission on marketplace earnings. No monthly fee.'}
            </p>
          </div>
          <Button
            variant={isSaas ? 'outline' : 'default'}
            onClick={handleTogglePlan}
            disabled={updating || loading}
            className="flex-shrink-0"
          >
            <ArrowUpDown className="w-4 h-4" />
            {updating ? 'Updating…' : isSaas ? 'Downgrade to Revenue Share' : 'Upgrade to SaaS'}
          </Button>
        </div>
      </Card>
    </div>
  );
}