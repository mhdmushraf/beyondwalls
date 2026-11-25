import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, X, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { payInvoiceByCard } from '@/lib/payments';
import { PageSkeleton } from '@/components/portal/Skeletons';

/** Paymob sends the customer back here. We verify the result on the server before showing "paid". */
export default function PortalPayReturn() {
  const [params] = useSearchParams();
  const invoiceId = params.get('invoice');
  const [state, setState] = useState({ status: 'checking' });

  useEffect(() => {
    const all = Object.fromEntries(params.entries());
    let tries = 0;
    let alive = true;
    const run = async () => {
      try {
        const res = await base44.functions.invoke('paymobWebhook', { mode: 'return', invoice_id: invoiceId, params: all });
        if (!alive) return;
        const s = res.data?.status;
        if (s === 'paid' || s === 'failed') { setState(res.data); return; }
        // Not verified yet — the server callback may still be on its way; check the invoice itself.
        if (invoiceId) {
          const inv = await base44.entities.Invoice.get(invoiceId).catch(() => null);
          if (inv?.status === 'paid') { setState({ status: 'paid', invoice_number: inv.number }); return; }
        }
        tries += 1;
        if (tries < 5) setTimeout(run, 3000); else setState({ status: 'pending' });
      } catch (e) {
        if (alive) setState({ status: 'pending' });
      }
    };
    run();
    return () => { alive = false; };
  }, []); // eslint-disable-line

  if (state.status === 'checking') return <div><p className="text-[13px] text-bw-muted mb-3">Confirming your payment with the bank…</p><PageSkeleton /></div>;

  const view = {
    paid: [Check, 'bg-emerald-50 text-emerald-600', 'Payment received', `Invoice ${state.invoice_number || ''} is paid. Your ads go live on their start date once each venue approves them.`],
    failed: [X, 'bg-rose-50 text-rose-600', "Payment didn't go through", `${state.message ? `${state.message}. ` : ''}No money was taken. Try another card, or pay by bank transfer.`],
    pending: [Clock, 'bg-amber-50 text-amber-700', "We're still confirming your payment", "This can take a few minutes. You don't need to pay again — we'll update My campaigns as soon as the bank confirms."],
  }[state.status] || [Clock, 'bg-amber-50 text-amber-700', 'Checking…', ''];
  const [Icon, tone, title, body] = view;

  return (
    <div className="max-w-lg mx-auto bw-card p-7 text-center">
      <span className={`mx-auto h-14 w-14 rounded-2xl flex items-center justify-center ${tone}`}><Icon className="h-7 w-7" /></span>
      <h1 className="mt-4 text-[22px] font-bold text-bw-navy">{title}</h1>
      <p className="mt-2 text-[13px] text-bw-muted">{body}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {state.status === 'failed' && invoiceId && <button type="button" className="bw-btn bw-btn-primary" onClick={() => payInvoiceByCard(invoiceId)}>Try again</button>}
        <Link to="/app/campaigns" className="bw-btn bw-btn-ghost">Open My campaigns</Link>
      </div>
    </div>
  );
}
