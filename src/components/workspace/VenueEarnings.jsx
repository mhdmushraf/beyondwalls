import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Wallet, ArrowDownToLine, Clock, ArrowDownToLine as PayoutIcon } from 'lucide-react';
import moment from 'moment';
import KpiCard from './KpiCard';
import { ListSkeleton } from './Skeletons';
import EmptyState from './EmptyState';
import { usePaginatedList } from '@/hooks/usePaginatedList';
import { formatAED } from './format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

export default function VenueEarnings({ user, org }) {
  const [payout, setPayout] = useState(null);
  const [payoutLoading, setPayoutLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const eligible = payout?.eligible_payout ?? 0;

  const loadPayout = async () => {
    try {
      const res = await base44.functions.invoke('computeEligiblePayout', { org_id: org.id });
      setPayout(res.data);
    } catch {
      setPayout({ eligible_payout: 0, total_earnings: 0, total_paid_out: 0 });
    } finally {
      setPayoutLoading(false);
    }
  };

  useEffect(() => {
    loadPayout();
  }, [org.id]);

  const { items, loading, loadingMore, hasMore, loadMore, refresh } = usePaginatedList(
    (skip) =>
      base44.entities.PayoutRequest.filter(
        { venue_owner_email: user.email },
        '-created_date',
        PAGE_SIZE,
        skip
      ),
    PAGE_SIZE
  );

  const hasOutstanding = items.some((p) => ['pending', 'approved'].includes(p.status));

  const maskedIban = user?.iban
    ? `•••• ${String(user.iban).slice(-4)}`
    : '';

  const openDialog = () => {
    setAmount(eligible ? String(eligible) : '');
    setFormError('');
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setFormError('');
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setFormError('Enter a valid amount.');
      return;
    }
    if (numericAmount > eligible) {
      setFormError(`Amount cannot exceed your eligible balance (${formatAED(eligible)}).`);
      return;
    }
    setSubmitting(true);
    try {
      await base44.functions.invoke('requestPayout', { org_id: org.id, amount: numericAmount });
      toast.success('Payout request submitted.');
      setDialogOpen(false);
      await Promise.all([loadPayout(), refresh()]);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Could not submit the request.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const statusClass = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'approved': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <KpiCard
          icon={Wallet}
          label="Eligible for payout"
          value={formatAED(payout?.eligible_payout)}
          loading={payoutLoading}
        />
        <KpiCard
          icon={ArrowDownToLine}
          label="Total earned"
          value={formatAED(payout?.total_earnings)}
          loading={payoutLoading}
        />
        <KpiCard
          icon={Clock}
          label="Total paid out"
          value={formatAED(payout?.total_paid_out)}
          loading={payoutLoading}
        />
      </div>

      <div className="flex justify-end">
        <Button
          onClick={openDialog}
          disabled={payoutLoading || eligible <= 0 || hasOutstanding}
        >
          <PayoutIcon className="w-4 h-4 mr-2" />
          {hasOutstanding ? 'Request pending' : 'Request payout'}
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request a payout</DialogTitle>
            <DialogDescription>
              Eligible balance: {formatAED(eligible)}. The amount will be sent to your bank on file.
            </DialogDescription>
          </DialogHeader>

          {maskedIban ? (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-600">
                Destination IBAN: <span className="font-medium text-slate-900">{maskedIban}</span>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="payout-amount">Amount (AED)</Label>
                <Input
                  id="payout-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={submitting}
                />
              </div>
              {formError && (
                <p className="text-sm text-red-600">{formError}</p>
              )}
            </div>
          ) : (
            <div className="py-2">
              <p className="text-sm text-slate-600">
                No bank details on file. Add your IBAN in{' '}
                <span className="font-medium text-slate-900">Settings</span> before requesting a payout.
              </p>
              {formError && (
                <p className="text-sm text-red-600 mt-2">{formError}</p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !maskedIban}>
              {submitting ? 'Submitting…' : 'Submit request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div>
        <h2 className="font-heading font-semibold text-base sm:text-lg text-slate-900 mb-3">Payout history</h2>
        {loading ? (
          <ListSkeleton rows={4} />
        ) : items.length === 0 ? (
          <EmptyState
            title="No payouts yet"
            message="Your payout history will appear here once you request a withdrawal."
          />
        ) : (
          <div className="space-y-3">
            {items.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">{formatAED(p.amount)}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {moment(p.created_date).format('DD MMM YYYY')}
                      {p.bank_name ? ` · ${p.bank_name}` : ''}
                    </p>
                  </div>
                  <Badge className={statusClass(p.status)}>
                    {p.status}
                  </Badge>
                </div>
                {p.status === 'rejected' && p.admin_notes && (
                  <p className="text-xs text-red-600 mt-2 pt-2 border-t border-slate-100">
                    Reason: {p.admin_notes}
                  </p>
                )}
              </div>
            ))}
            {hasMore && (
              <Button variant="outline" onClick={loadMore} disabled={loadingMore} className="w-full">
                {loadingMore ? 'Loading…' : 'Load more'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}