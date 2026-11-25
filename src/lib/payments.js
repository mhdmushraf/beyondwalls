import { base44 } from '@/api/base44Client';
import { isOnline, notifyError } from '@/lib/states';
import { toast } from 'sonner';

/** Opens Paymob's card checkout for an invoice. Returns false if it could not start. */
export async function payInvoiceByCard(invoiceId) {
  if (!isOnline()) { toast.error("You're offline", { description: 'Card payments need internet. Try again when you reconnect.' }); return false; }
  try {
    const res = await base44.functions.invoke('paymobCheckout', { invoice_id: invoiceId, origin: window.location.origin });
    if (res.data?.checkout_url) { window.location.href = res.data.checkout_url; return true; }
    toast.error("Couldn't open the payment page", { description: res.data?.error || 'Try again, or pay by bank transfer.' });
  } catch (e) {
    const msg = e?.response?.data?.error;
    if (msg) toast.error("Couldn't open the payment page", { description: msg });
    else notifyError(e, 'open the card payment page', () => payInvoiceByCard(invoiceId));
  }
  return false;
}

export const BANK = {
  name: 'Linkzone Global FZ-LLC',
  note: 'Bank details are on the invoice. Use the invoice number as the transfer reference.',
};
