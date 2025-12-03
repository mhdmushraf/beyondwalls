import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

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
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Sitemap</h1>
        <p className="text-slate-600 mb-6">
          For Google Search Console, submit the following URLs manually or copy the XML below:
        </p>

        <div className="bg-white rounded-lg border p-6 mb-6">
          <h2 className="font-semibold mb-4">Public Pages</h2>
          <ul className="space-y-2">
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
                <span className="text-xs text-slate-500">Priority: {page.priority}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="bg-slate-100 px-4 py-3 flex items-center justify-between">
            <span className="font-mono text-sm">sitemap.xml</span>
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

        <div className="mt-6 p-4 bg-violet-50 border border-violet-200 rounded-lg">
          <h3 className="font-semibold text-violet-800 mb-2">Download for Cloudflare Pages:</h3>
          <p className="text-sm text-violet-700 mb-4">Click below to download the sitemap.xml file, then upload it to Cloudflare Pages.</p>
          <Button 
            onClick={() => {
              const blob = new Blob([sitemapXML], { type: 'application/xml' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'sitemap.xml';
              link.click();
              URL.revokeObjectURL(url);
            }}
            className="bg-gradient-to-r from-violet-600 to-indigo-600"
          >
            <Download className="w-4 h-4 mr-2" />
            Download sitemap.xml
          </Button>
        </div>

        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h3 className="font-semibold text-amber-800 mb-2">Google Search Console Instructions:</h3>
          <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
            <li>Download the sitemap.xml above</li>
            <li>Upload to Cloudflare Pages (Direct Upload)</li>
            <li>Your URL will be: https://your-project.pages.dev/sitemap.xml</li>
            <li>Submit that URL to Google Search Console → Sitemaps</li>
          </ol>
        </div>
      </div>
    </div>
  );
}