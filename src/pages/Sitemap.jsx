import React from "react";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

const SITEMAP_PAGES = [
  { url: "/Home", priority: "1.0", changefreq: "daily" },
  { url: "/About", priority: "0.8", changefreq: "monthly" },
  { url: "/Services", priority: "0.9", changefreq: "weekly" },
  { url: "/Contact", priority: "0.7", changefreq: "monthly" },
  { url: "/Blog", priority: "0.8", changefreq: "daily" },
  { url: "/ScreenLocations", priority: "0.9", changefreq: "daily" },
  { url: "/HowItWorks", priority: "0.8", changefreq: "monthly" },
  { url: "/Register", priority: "0.9", changefreq: "monthly" },
  { url: "/Terms", priority: "0.3", changefreq: "yearly" },
  { url: "/Privacy", priority: "0.3", changefreq: "yearly" },
  { url: "/HelpCenter", priority: "0.6", changefreq: "weekly" }
];

export default function Sitemap() {
  const baseUrl = "https://www.beyondwalls.ae";
  const today = new Date().toISOString().split('T')[0];

  const generateXML = () => {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    SITEMAP_PAGES.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    });
    
    xml += '</urlset>';
    return xml;
  };

  const sitemapXML = generateXML();

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />
      
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Sitemap</h1>
          <p className="text-slate-600 mb-8">
            For Google Search Console, submit the following URLs manually or copy the XML below.
          </p>

          <div className="bg-slate-50 rounded-xl border p-6 mb-8">
            <h2 className="font-semibold text-lg mb-4">Public Pages</h2>
            <ul className="space-y-3">
              {SITEMAP_PAGES.map((page, idx) => (
                <li key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                  <a 
                    href={`${baseUrl}${page.url}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-violet-600 hover:underline"
                  >
                    {baseUrl}{page.url}
                  </a>
                  <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded">Priority: {page.priority}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl border overflow-hidden mb-8">
            <div className="bg-slate-100 px-4 py-3 flex items-center justify-between">
              <span className="font-mono text-sm font-medium">sitemap.xml</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(sitemapXML);
                  alert('Sitemap XML copied to clipboard!');
                }}
                className="text-sm text-violet-600 hover:text-violet-800 font-medium"
              >
                Copy XML
              </button>
            </div>
            <pre className="p-4 text-xs overflow-x-auto bg-slate-50 max-h-96">{sitemapXML}</pre>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <h3 className="font-semibold text-amber-800 mb-2">Google Search Console Instructions:</h3>
            <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
              <li>Go to Google Search Console</li>
              <li>Select your property (beyondwalls.ae)</li>
              <li>Go to "Sitemaps" in the left menu</li>
              <li>Add URLs individually via "URL Inspection" tool</li>
              <li>Or copy the XML above and host it on a separate server</li>
            </ol>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}