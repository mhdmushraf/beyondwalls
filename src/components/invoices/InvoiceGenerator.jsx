import React from "react";
import { format } from "date-fns";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function generateInvoiceHTML(type, data) {
  const { booking, screen, venue, user, invoiceNumber } = data;
  const totalCost = booking.total_cost || 0;
  const venueShare = totalCost * 0.7;
  const platformShare = totalCost * 0.3;
  
  const isAdvertiser = type === "advertiser";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${isAdvertiser ? "Invoice" : "Earnings Statement"} - ${invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; line-height: 1.6; }
    .invoice { max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #8b5cf6; padding-bottom: 20px; }
    .logo { display: flex; align-items: center; gap: 12px; }
    .logo-icon { width: 50px; height: 50px; background: linear-gradient(135deg, #8b5cf6, #6366f1); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; }
    .logo-text { font-size: 28px; font-weight: bold; background: linear-gradient(90deg, #8b5cf6, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .invoice-title { text-align: right; }
    .invoice-title h1 { font-size: 32px; color: #8b5cf6; margin-bottom: 5px; }
    .invoice-title p { color: #64748b; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 14px; color: #8b5cf6; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; font-weight: 600; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
    .info-box { background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #8b5cf6; }
    .info-box h3 { font-size: 16px; margin-bottom: 10px; color: #1e293b; }
    .info-box p { color: #64748b; font-size: 14px; }
    .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .table th { background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; padding: 15px; text-align: left; font-weight: 600; }
    .table td { padding: 15px; border-bottom: 1px solid #e2e8f0; }
    .table tr:hover { background: #f8fafc; }
    .totals { margin-top: 30px; background: #f8fafc; padding: 25px; border-radius: 12px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .total-row.final { border-top: 2px solid #8b5cf6; margin-top: 10px; padding-top: 15px; font-size: 20px; font-weight: bold; color: #8b5cf6; }
    .footer { margin-top: 50px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-pending { background: #fef3c7; color: #92400e; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div class="logo">
        <div class="logo-icon">📺</div>
        <div>
          <div class="logo-text">BeyondWalls</div>
          <p style="color: #64748b; font-size: 12px;">Digital Out-of-Home Advertising</p>
        </div>
      </div>
      <div class="invoice-title">
        <h1>${isAdvertiser ? "INVOICE" : "EARNINGS STATEMENT"}</h1>
        <p><strong>${invoiceNumber}</strong></p>
        <p>Date: ${format(new Date(), "MMMM d, yyyy")}</p>
      </div>
    </div>

    <div class="info-grid section">
      <div class="info-box">
        <div class="section-title">From</div>
        <h3>BeyondWalls FZ-LLC</h3>
        <p>Dubai Media City<br>Dubai, UAE<br>TRN: 100XXXXXXX<br>info@linkzoneglobal.com</p>
      </div>
      <div class="info-box">
        <div class="section-title">${isAdvertiser ? "Bill To" : "Earnings For"}</div>
        <h3>${user?.full_name || user?.email}</h3>
        <p>${user?.email}<br>${user?.company_name || ""}</p>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Campaign Details</div>
      <table class="table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Screen</th>
            <th>Duration</th>
            <th style="text-align: right;">${isAdvertiser ? "Amount" : "Earnings"}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${booking.campaign_name}</strong><br>
              <span style="color: #64748b; font-size: 12px;">Slot #${booking.slot_number} • ${booking.creative_type}</span>
            </td>
            <td>
              ${screen?.name || "N/A"}<br>
              <span style="color: #64748b; font-size: 12px;">${venue?.name || ""} - ${venue?.city || ""}</span>
            </td>
            <td>
              ${booking.start_date}<br>
              to ${booking.end_date}<br>
              <span style="color: #64748b; font-size: 12px;">${booking.weeks_booked} week(s)</span>
            </td>
            <td style="text-align: right; font-weight: 600;">
              AED ${isAdvertiser ? totalCost.toLocaleString() : venueShare.toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="totals">
      ${isAdvertiser ? `
        <div class="total-row">
          <span>Subtotal</span>
          <span>AED ${totalCost.toLocaleString()}</span>
        </div>
        <div class="total-row">
          <span>Platform Fee (Included)</span>
          <span>AED 0.00</span>
        </div>
        <div class="total-row">
          <span>VAT (5%)</span>
          <span>AED ${(totalCost * 0.05).toLocaleString()}</span>
        </div>
        <div class="total-row final">
          <span>Total Amount</span>
          <span>AED ${(totalCost * 1.05).toLocaleString()}</span>
        </div>
      ` : `
        <div class="total-row">
          <span>Campaign Revenue</span>
          <span>AED ${totalCost.toLocaleString()}</span>
        </div>
        <div class="total-row">
          <span>Your Share (70%)</span>
          <span style="color: #16a34a; font-weight: 600;">AED ${venueShare.toLocaleString()}</span>
        </div>
        <div class="total-row">
          <span>Platform Commission (30%)</span>
          <span>AED ${platformShare.toLocaleString()}</span>
        </div>
        <div class="total-row final">
          <span>Net Earnings</span>
          <span>AED ${venueShare.toLocaleString()}</span>
        </div>
      `}
    </div>

    <div style="margin-top: 30px; padding: 20px; background: ${isAdvertiser ? "#f0fdf4" : "#eff6ff"}; border-radius: 12px;">
      <p style="font-size: 14px; color: ${isAdvertiser ? "#166534" : "#1e40af"};">
        ${isAdvertiser 
          ? "✅ Payment has been deducted from your BeyondWalls wallet. Thank you for advertising with us!" 
          : "💰 This amount has been credited to your BeyondWalls wallet. You can withdraw anytime from your dashboard."}
      </p>
    </div>

    <div class="footer">
      <p><strong>BeyondWalls</strong> - Advertise Beyond Boundaries</p>
      <p>beyondwalls.ae • info@linkzoneglobal.com • +971 55 614 0067</p>
      <p style="margin-top: 10px;">This is a computer-generated document. No signature required.</p>
    </div>
  </div>
</body>
</html>
  `;
}

export function downloadInvoice(type, data) {
  const html = generateInvoiceHTML(type, data);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `${type === "advertiser" ? "Invoice" : "Earnings"}_${data.invoiceNumber}.html`;
  link.click();
  
  URL.revokeObjectURL(url);
}

export default function InvoiceDownloadButton({ type, booking, screen, venue, user }) {
  const invoiceNumber = `BW-${type === "advertiser" ? "INV" : "ERN"}-${booking.id?.slice(-8).toUpperCase() || "00000000"}`;
  
  const handleDownload = () => {
    downloadInvoice(type, { booking, screen, venue, user, invoiceNumber });
  };

  return (
    <Button variant="outline" size="sm" onClick={handleDownload}>
      <Download className="w-4 h-4 mr-1" />
      {type === "advertiser" ? "Invoice" : "Earnings"}
    </Button>
  );
}