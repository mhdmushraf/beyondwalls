import React from "react";
import { SITEMAP_PAGES } from "@/components/SEOHead";

// This component displays sitemap content for reference
// The actual sitemap.xml should be generated server-side or statically

export const generateSitemapXML = () => {
  const baseUrl = "https://beyondwalls.ae";
  const today = new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n';
  xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n';
  xml += '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n';
  xml += '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n';

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

export const generateRobotsTxt = () => {
  return `# robots.txt for BeyondWalls
# https://beyondwalls.ae

User-agent: *
Allow: /

# Disallow admin and private pages
Disallow: /admin*
Disallow: /dashboard*
Disallow: /settings*
Disallow: /wallet*
Disallow: /my-*
Disallow: /screen-player*
Disallow: /pending-approval*
Disallow: /complete-profile*

# Allow important public pages
Allow: /
Allow: /about
Allow: /services
Allow: /contact
Allow: /blog
Allow: /blog/*
Allow: /screen-locations
Allow: /how-it-works
Allow: /register
Allow: /terms
Allow: /privacy
Allow: /help

# Sitemap location
Sitemap: https://beyondwalls.ae/sitemap.xml

# Crawl-delay for politeness
Crawl-delay: 1

# Google specific
User-agent: Googlebot
Allow: /
Disallow: /admin*
Disallow: /dashboard*

# Bing specific
User-agent: Bingbot
Allow: /
Disallow: /admin*
Disallow: /dashboard*
`;
};

export const generateManifest = () => {
  return {
    name: "BeyondWalls - Digital Advertising Platform",
    short_name: "BeyondWalls",
    description: "UAE's #1 Digital Out-of-Home Advertising Platform",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#8B5CF6",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "maskable any"
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable any"
      }
    ],
    categories: ["business", "productivity"],
    lang: "en-AE",
    dir: "ltr",
    scope: "/",
    prefer_related_applications: false
  };
};

export default function SitemapGenerator() {
  const [copied, setCopied] = React.useState(null);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const sitemapXML = generateSitemapXML();
  const robotsTxt = generateRobotsTxt();
  const manifestJson = JSON.stringify(generateManifest(), null, 2);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">SEO Configuration Files</h1>
      <p className="text-slate-600">Copy these files and add them to your server's public directory.</p>

      {/* Sitemap.xml */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-slate-100 px-4 py-2 flex items-center justify-between">
          <span className="font-mono text-sm">sitemap.xml</span>
          <button 
            onClick={() => copyToClipboard(sitemapXML, 'sitemap')}
            className="text-sm text-violet-600 hover:text-violet-800"
          >
            {copied === 'sitemap' ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
        <pre className="p-4 text-xs overflow-x-auto bg-slate-50 max-h-64">{sitemapXML}</pre>
      </div>

      {/* robots.txt */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-slate-100 px-4 py-2 flex items-center justify-between">
          <span className="font-mono text-sm">robots.txt</span>
          <button 
            onClick={() => copyToClipboard(robotsTxt, 'robots')}
            className="text-sm text-violet-600 hover:text-violet-800"
          >
            {copied === 'robots' ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
        <pre className="p-4 text-xs overflow-x-auto bg-slate-50 max-h-64">{robotsTxt}</pre>
      </div>

      {/* manifest.json */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-slate-100 px-4 py-2 flex items-center justify-between">
          <span className="font-mono text-sm">manifest.json</span>
          <button 
            onClick={() => copyToClipboard(manifestJson, 'manifest')}
            className="text-sm text-violet-600 hover:text-violet-800"
          >
            {copied === 'manifest' ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
        <pre className="p-4 text-xs overflow-x-auto bg-slate-50 max-h-64">{manifestJson}</pre>
      </div>

      {/* Favicon HTML */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-slate-100 px-4 py-2 flex items-center justify-between">
          <span className="font-mono text-sm">Favicon HTML (add to &lt;head&gt;)</span>
          <button 
            onClick={() => copyToClipboard(`<!-- Favicon -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.json">
<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#8B5CF6">
<meta name="msapplication-TileColor" content="#8B5CF6">
<meta name="theme-color" content="#8B5CF6">`, 'favicon')}
            className="text-sm text-violet-600 hover:text-violet-800"
          >
            {copied === 'favicon' ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
        <pre className="p-4 text-xs overflow-x-auto bg-slate-50">{`<!-- Favicon -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.json">
<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#8B5CF6">
<meta name="msapplication-TileColor" content="#8B5CF6">
<meta name="theme-color" content="#8B5CF6">`}</pre>
      </div>
    </div>
  );
}