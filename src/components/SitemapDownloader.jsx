import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function SitemapDownloader() {
  const downloadSitemap = () => {
    const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://beyondwalls.ae/Home</loc>
    <priority>1.0</priority>
    <changefreq>daily</changefreq>
  </url>
  <url>
    <loc>https://beyondwalls.ae/About</loc>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
  </url>
  <url>
    <loc>https://beyondwalls.ae/Services</loc>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
  </url>
  <url>
    <loc>https://beyondwalls.ae/Contact</loc>
    <priority>0.7</priority>
    <changefreq>monthly</changefreq>
  </url>
  <url>
    <loc>https://beyondwalls.ae/Blog</loc>
    <priority>0.8</priority>
    <changefreq>daily</changefreq>
  </url>
  <url>
    <loc>https://beyondwalls.ae/ScreenLocations</loc>
    <priority>0.9</priority>
    <changefreq>weekly</changefreq>
  </url>
  <url>
    <loc>https://beyondwalls.ae/HowItWorks</loc>
    <priority>0.8</priority>
    <changefreq>monthly</changefreq>
  </url>
  <url>
    <loc>https://beyondwalls.ae/Register</loc>
    <priority>0.9</priority>
    <changefreq>monthly</changefreq>
  </url>
  <url>
    <loc>https://beyondwalls.ae/HelpCenter</loc>
    <priority>0.6</priority>
    <changefreq>monthly</changefreq>
  </url>
  <url>
    <loc>https://beyondwalls.ae/Terms</loc>
    <priority>0.5</priority>
    <changefreq>monthly</changefreq>
  </url>
  <url>
    <loc>https://beyondwalls.ae/Privacy</loc>
    <priority>0.5</priority>
    <changefreq>monthly</changefreq>
  </url>
  <url>
    <loc>https://beyondwalls.ae/ARPremium</loc>
    <priority>0.7</priority>
    <changefreq>weekly</changefreq>
  </url>
</urlset>`;

    const blob = new Blob([sitemapXML], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap.xml';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button onClick={downloadSitemap} className="bg-gradient-to-r from-violet-600 to-indigo-600">
      <Download className="w-4 h-4 mr-2" />
      Download sitemap.xml
    </Button>
  );
}