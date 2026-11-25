import { Printer } from 'lucide-react';

const fmt = (n) => Number(n || 0).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const d = (v) => (v ? new Date(v).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

/** Bilingual (English + Arabic) tax invoice — Arabic is required on UAE invoices. */
export default function InvoiceView({ invoice, settings = {}, onClose }) {
  if (!invoice) return null;
  const printIt = () => {
    const html = document.getElementById('bw-invoice')?.outerHTML || '';
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>${invoice.number}</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Readex+Pro:wght@400;600&display=swap" rel="stylesheet"><style>body{font-family:Inter,sans-serif;margin:32px;color:#111027}table{width:100%;border-collapse:collapse}td,th{padding:8px;border-bottom:1px solid #E7E5F0;font-size:13px;text-align:left}.ar{font-family:'Readex Pro',sans-serif;direction:rtl;text-align:right}</style></head><body>${html}</body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 600);
  };
  const paid = invoice.status === 'paid';
  return (
    <div>
      <div className="flex justify-end gap-2 mb-3">
        <button type="button" className="bw-btn bw-btn-ghost" onClick={printIt}><Printer className="h-4 w-4" />Print / PDF</button>
        {onClose && <button type="button" className="bw-btn bw-btn-ghost" onClick={onClose}>Close</button>}
      </div>
      <div id="bw-invoice" className="bw-card p-6 text-bw-navy">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: 22, fontWeight: 800 }}>BeyondWalls</p>
            <p style={{ fontSize: 12, color: '#6B6787' }}>{settings.company_name || 'Linkzone Global FZ-LLC'}<br />{settings.company_address || 'in5 Tech, Dubai Internet City, Dubai, UAE'}{settings.company_trn ? <><br />TRN {settings.company_trn}</> : null}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 20, fontWeight: 800 }}>Tax invoice</p>
            <p className="ar bw-ar" dir="rtl" style={{ fontSize: 16, fontWeight: 700 }}>فاتورة ضريبية</p>
            <p style={{ fontSize: 12, color: '#6B6787' }}>{invoice.number}<br />Issued {d(invoice.issued_at)} · Due {d(invoice.due_at)}</p>
            <span className="bw-chip" style={{ background: paid ? '#E8F7EE' : '#FFF4E0', color: paid ? '#16A34A' : '#B45309', marginTop: 6 }}>{paid ? 'Paid · مدفوعة' : 'Unpaid · غير مدفوعة'}</span>
          </div>
        </div>
        <div style={{ marginTop: 18, padding: 12, background: '#F6F5FB', borderRadius: 12, fontSize: 13 }}>
          <b>Bill to · <span className="bw-ar">إلى</span>:</b> {invoice.org_name}{invoice.org_trn ? ` · TRN ${invoice.org_trn}` : ''} · Period {invoice.period || '—'}
        </div>
        <table style={{ marginTop: 16, width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ fontSize: 11, color: '#6B6787', textTransform: 'uppercase' }}>
              <th style={{ textAlign: 'left', padding: 8 }}>Description · <span className="bw-ar">الوصف</span></th>
              <th style={{ textAlign: 'right', padding: 8 }}>Qty</th>
              <th style={{ textAlign: 'right', padding: 8 }}>Unit (AED)</th>
              <th style={{ textAlign: 'right', padding: 8 }}>Amount (AED)</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.lines || []).map((l, i) => (
              <tr key={i} style={{ borderTop: '1px solid #E7E5F0', fontSize: 13 }}>
                <td style={{ padding: 8 }}>{l.description}{l.description_ar ? <div className="bw-ar" style={{ color: '#6B6787', fontSize: 12 }}>{l.description_ar}</div> : null}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{l.qty}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{fmt(l.unit_price)}</td>
                <td style={{ padding: 8, textAlign: 'right' }}>{fmt(l.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: 12, marginLeft: 'auto', maxWidth: 300, fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>Subtotal · <span className="bw-ar">المجموع</span></span><b>{fmt(invoice.subtotal)}</b></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>VAT {invoice.vat_pct ?? 5}% · <span className="bw-ar">ضريبة</span></span><b>{fmt(invoice.vat)}</b></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #111027', fontSize: 16 }}><span><b>Total · <span className="bw-ar">الإجمالي</span></b></span><b>AED {fmt(invoice.total)}</b></div>
        </div>
      </div>
    </div>
  );
}
