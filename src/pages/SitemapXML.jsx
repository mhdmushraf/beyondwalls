import React, { useEffect } from "react";

const baseUrl = "https://beyondwalls.ae";
const today = new Date().toISOString().split('T')[0];

const pages = [
  { loc: `${baseUrl}/`, priority: "1.0", changefreq: "daily", lastmod: today },
  { loc: `${baseUrl}/About`, priority: "0.8", changefreq: "monthly", lastmod: today },
  { loc: `${baseUrl}/Services`, priority: "0.9", changefreq: "weekly", lastmod: today },
  { loc: `${baseUrl}/Contact`, priority: "0.7", changefreq: "monthly", lastmod: today },
  { loc: `${baseUrl}/Blog`, priority: "0.8", changefreq: "daily", lastmod: today },
  { loc: `${baseUrl}/ScreenLocations`, priority: "0.9", changefreq: "daily", lastmod: today },
  { loc: `${baseUrl}/HowItWorks`, priority: "0.8", changefreq: "monthly", lastmod: today },
  { loc: `${baseUrl}/Register`, priority: "0.9", changefreq: "monthly", lastmod: today },
  { loc: `${baseUrl}/Terms`, priority: "0.3", changefreq: "yearly", lastmod: today },
  { loc: `${baseUrl}/Privacy`, priority: "0.3", changefreq: "yearly", lastmod: today },
  { loc: `${baseUrl}/HelpCenter`, priority: "0.6", changefreq: "weekly", lastmod: today },
  { loc: `${baseUrl}/Connect`, priority: "0.6", changefreq: "monthly", lastmod: today },
  { loc: `${baseUrl}/plans`, priority: "0.9", changefreq: "monthly", lastmod: today },

  // SEO Landing Pages
  { loc: `${baseUrl}/DOOHAdvertisingDubai`, priority: "0.9", changefreq: "weekly", lastmod: today },
  { loc: `${baseUrl}/DigitalSignageUAE`, priority: "0.9", changefreq: "weekly", lastmod: today },
  { loc: `${baseUrl}/AdPlatformDubai`, priority: "0.8", changefreq: "weekly", lastmod: today },
  { loc: `${baseUrl}/VenueAdvertisingUAE`, priority: "0.8", changefreq: "weekly", lastmod: today },
  { loc: `${baseUrl}/BeyondWallsUAEvsUSA`, priority: "0.7", changefreq: "monthly", lastmod: today },
  { loc: `${baseUrl}/DOOHDubaiMarina`, priority: "0.8", changefreq: "weekly", lastmod: today },
  { loc: `${baseUrl}/DOOHDowntownDubai`, priority: "0.8", changefreq: "weekly", lastmod: today },
  { loc: `${baseUrl}/DOOHDIFC`, priority: "0.8", changefreq: "weekly", lastmod: today },
  { loc: `${baseUrl}/DOOHAbuDhabi`, priority: "0.8", changefreq: "weekly", lastmod: today },
  { loc: `${baseUrl}/DOOHSharjah`, priority: "0.8", changefreq: "weekly", lastmod: today },
  { loc: `${baseUrl}/DOOHJBRDubai`, priority: "0.8", changefreq: "weekly", lastmod: today },
  { loc: `${baseUrl}/DOOHBusinessBay`, priority: "0.8", changefreq: "weekly", lastmod: today },
  { loc: `${baseUrl}/DOOHDubaiMall`, priority: "0.8", changefreq: "weekly", lastmod: today },
  { loc: `${baseUrl}/CafeAdvertisingDubai`, priority: "0.8", changefreq: "weekly", lastmod: today },
  { loc: `${baseUrl}/GymAdvertisingDubai`, priority: "0.8", changefreq: "weekly", lastmod: today },
  { loc: `${baseUrl}/MallAdvertisingUAE`, priority: "0.8", changefreq: "weekly", lastmod: today },
  { loc: `${baseUrl}/HotelAdvertisingDubai`, priority: "0.8", changefreq: "weekly", lastmod: today },
  { loc: `${baseUrl}/CoworkingAdvertisingDubai`, priority: "0.8", changefreq: "weekly", lastmod: today },
  { loc: `${baseUrl}/DigitalBillboardDubai`, priority: "0.8", changefreq: "weekly", lastmod: today },
  { loc: `${baseUrl}/ScreenAdvertisingUAE`, priority: "0.8", changefreq: "weekly", lastmod: today },
  { loc: `${baseUrl}/DOOHDubaiShoppingFestival`, priority: "0.7", changefreq: "weekly", lastmod: today },
  { loc: `${baseUrl}/DOOHUAENationalDay`, priority: "0.7", changefreq: "weekly", lastmod: today },
  { loc: `${baseUrl}/DOOHRamadanAdvertising`, priority: "0.7", changefreq: "weekly", lastmod: today },
  { loc: `${baseUrl}/DOOHDubaiSummerSurprises`, priority: "0.7", changefreq: "weekly", lastmod: today },
  { loc: `${baseUrl}/DOOHExpoCity`, priority: "0.7", changefreq: "weekly", lastmod: today },
  { loc: `${baseUrl}/DOOHEidAdvertising`, priority: "0.7", changefreq: "weekly", lastmod: today }
];

export default function SitemapXML() {
  useEffect(() => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    // Create downloadable XML file
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="text-center max-w-2xl">
        <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Sitemap XML Generated</h1>
        <p className="text-lg text-slate-600 mb-8">
          Your sitemap.xml file has been generated and should download automatically.
        </p>
        <div className="bg-slate-50 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-slate-900 mb-3">📋 Next Steps:</h2>
          <ol className="text-left space-y-2 text-slate-600">
            <li>1. Upload sitemap.xml to your website root directory</li>
            <li>2. Submit to Google Search Console at search.google.com/search-console</li>
            <li>3. Add to robots.txt: <code className="bg-slate-200 px-2 py-1 rounded text-sm">Sitemap: https://beyondwalls.ae/sitemap.xml</code></li>
          </ol>
        </div>
        <div className="text-sm text-slate-500">
          <p className="mb-2">📍 <strong>All {pages.length} pages</strong> included in sitemap</p>
          <p>🔄 Update this sitemap weekly or when adding new pages</p>
        </div>
      </div>
    </div>
  );
}