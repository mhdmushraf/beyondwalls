import React, { useEffect } from "react";

export default function RobotsTxt() {
  useEffect(() => {
    // Generate robots.txt file
    const robotsTxt = `# BeyondWalls.ae - robots.txt
# Generated: ${new Date().toISOString()}

User-agent: *
Allow: /
Disallow: /Dashboard
Disallow: /AdminDashboard
Disallow: /Wallet
Disallow: /Settings
Disallow: /MyVenues
Disallow: /MyScreens
Disallow: /MyBookings
Disallow: /AddVenue
Disallow: /AddScreen
Disallow: /BookSlot
Disallow: /Admin*
Disallow: /Campaign*
Disallow: /Venue*
Disallow: /Screen*
Disallow: /Booking*
Disallow: /AR*
Disallow: /Auto*
Disallow: /Favorite*
Disallow: /Notification*
Disallow: /Complete*
Disallow: /Pending*
Disallow: /Advertiser*
Disallow: /Analytics*
Disallow: /Local*
Disallow: /Manage*
Disallow: /Programmatic*
Disallow: /AI*

# Allow important public pages
Allow: /Home
Allow: /About
Allow: /Services
Allow: /Contact
Allow: /Blog
Allow: /ScreenLocations
Allow: /HowItWorks
Allow: /Register
Allow: /Terms
Allow: /Privacy
Allow: /HelpCenter
Allow: /Connect
Allow: /ARPremium
Allow: /Sitemap
Allow: /DOOH*
Allow: /Digital*
Allow: /AdPlatform*
Allow: /Venue*UAE
Allow: /BeyondWalls*
Allow: /Cafe*
Allow: /Gym*
Allow: /Mall*
Allow: /Hotel*
Allow: /Coworking*

# Sitemaps
Sitemap: https://www.beyondwalls.ae/sitemap.xml

# Crawl-delay for bots
Crawl-delay: 1

# Specific bot rules
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Googlebot-Image
Allow: /

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Slurp
Crawl-delay: 1

User-agent: DuckDuckBot
Allow: /
Crawl-delay: 1

User-agent: Baiduspider
Crawl-delay: 5

User-agent: YandexBot
Crawl-delay: 1

# Block bad bots
User-agent: AhrefsBot
Crawl-delay: 10

User-agent: SemrushBot
Crawl-delay: 10
`;

    // Create downloadable robots.txt file
    const blob = new Blob([robotsTxt], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="text-center max-w-2xl">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">robots.txt Generated</h1>
        <p className="text-lg text-slate-600 mb-8">
          Your robots.txt file has been generated and should download automatically.
        </p>
        <div className="bg-slate-50 rounded-xl p-6 mb-6 text-left">
          <h2 className="font-semibold text-slate-900 mb-3">📋 Implementation Steps:</h2>
          <ol className="space-y-2 text-slate-600">
            <li>1. Upload robots.txt to your website root directory (same level as index.html)</li>
            <li>2. Verify it's accessible at: <code className="bg-slate-200 px-2 py-1 rounded text-sm">https://www.beyondwalls.ae/robots.txt</code></li>
            <li>3. Test using Google's robots.txt Tester in Search Console</li>
          </ol>
        </div>
        <div className="bg-violet-50 rounded-xl p-6 border border-violet-200">
          <h3 className="font-semibold text-violet-900 mb-2">🤖 What's Included:</h3>
          <ul className="text-sm text-violet-700 space-y-1 text-left">
            <li>✅ Public pages allowed for all search engines</li>
            <li>✅ Private dashboard pages blocked from indexing</li>
            <li>✅ Sitemap reference included</li>
            <li>✅ Bot-specific crawl rules configured</li>
          </ul>
        </div>
      </div>
    </div>
  );
}