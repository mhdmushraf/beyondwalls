import React from "react";

// SEO configuration for all pages
export const PAGE_SEO = {
  home: {
    title: "DOOH Advertising Dubai | Beyond Walls — Digital Out-of-Home Marketplace",
    description: "Book digital out-of-home advertising across Dubai and the UAE. Beyond Walls connects advertisers with premium venue screens — transparent pricing, instant booking.",
    keywords: "digital advertising dubai, DOOH advertising UAE, digital billboard advertising, screen advertising dubai, outdoor advertising uae, digital signage advertising, advertising company dubai, best advertising agency uae",
    canonical: "https://www.beyondwalls.ae",
    ogImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=630&fit=crop&q=80"
  },
  about: {
    title: "About BeyondWalls - UAE's Leading DOOH Advertising Platform | Our Story",
    description: "Learn about BeyondWalls, UAE's first self-serve Digital Out-of-Home advertising marketplace. Founded in Dubai, we're transforming how businesses advertise on digital screens.",
    keywords: "about beyondwalls, dooh company dubai, digital advertising startup uae, advertising technology dubai",
    canonical: "https://www.beyondwalls.ae/About"
  },
  services: {
    title: "DOOH Advertising Services in Dubai & UAE | Beyond Walls",
    description: "Full-service digital out-of-home advertising in the UAE — venue sourcing, campaign booking, content scheduling and live performance monitoring.",
    keywords: "dooh services dubai, digital screen advertising, venue advertising uae, performance score advertising, campaign bundles dubai, gamification advertising, sustainability dooh, local business advertising uae, scan and win advertising, interactive advertising dubai",
    canonical: "https://www.beyondwalls.ae/Services"
  },
  contact: {
    title: "Contact BeyondWalls | Dubai Digital Advertising Experts | Get in Touch",
    description: "Contact BeyondWalls for digital advertising solutions in UAE. Located in in5 Tech, Dubai Internet City. Phone: +971 55 614 0067. Email: hello@beyondwalls.ae",
    keywords: "contact beyondwalls, advertising agency contact dubai, dooh advertising inquiry",
    canonical: "https://www.beyondwalls.ae/Contact"
  },
  blog: {
    title: "BeyondWalls Blog | Digital Advertising Insights & Tips | DOOH News UAE",
    description: "Latest insights on digital out-of-home advertising, marketing tips, case studies, and industry news from BeyondWalls - UAE's leading DOOH platform.",
    keywords: "digital advertising blog, dooh news, advertising tips dubai, marketing insights uae",
    canonical: "https://www.beyondwalls.ae/Blog"
  },
  screenLocations: {
    title: "Digital Screen Locations UAE | Find Advertising Screens Near You | BeyondWalls",
    description: "Browse 500+ digital advertising screens across Dubai, Abu Dhabi, Sharjah. Filter by venue type, location, and price. Book your ad space today.",
    keywords: "screen locations dubai, digital billboards uae, advertising screens near me, dooh locations",
    canonical: "https://www.beyondwalls.ae/ScreenLocations"
  },
  howItWorks: {
    title: "How BeyondWalls Works | Book Digital Ads in 4 Easy Steps | DOOH Guide",
    description: "Learn how to advertise on digital screens with BeyondWalls. Choose screens, upload creative, set budget, go live in 30 minutes. Simple self-serve platform.",
    keywords: "how to advertise digitally, dooh advertising guide, digital billboard booking, screen advertising how to",
    canonical: "https://www.beyondwalls.ae/HowItWorks"
  },
  register: {
    title: "Sign Up | Start Advertising on Digital Screens | BeyondWalls UAE",
    description: "Create your free BeyondWalls account. Start advertising on 500+ digital screens across UAE or monetize your venue screens. No setup fees.",
    keywords: "sign up beyondwalls, register advertising account, dooh platform signup",
    canonical: "https://www.beyondwalls.ae/Register"
  },
  terms: {
    title: "Terms of Service | BeyondWalls UAE",
    description: "Read BeyondWalls Terms of Service. Understand your rights and obligations when using our digital advertising platform.",
    canonical: "https://www.beyondwalls.ae/Terms"
  },
  privacy: {
    title: "Privacy Policy | BeyondWalls UAE",
    description: "BeyondWalls Privacy Policy. Learn how we collect, use, and protect your personal information on our DOOH advertising platform.",
    canonical: "https://www.beyondwalls.ae/Privacy"
  },
  helpCenter: {
    title: "Help Center | FAQs & Support | BeyondWalls",
    description: "Get help with BeyondWalls. FAQs, tutorials, and support for advertisers and venue owners using our digital advertising platform.",
    canonical: "https://www.beyondwalls.ae/HelpCenter"
  }
};

// Sitemap data for generation
// Primary navigation pages for Google Sitelinks
export const PRIMARY_SITELINKS = [
  { name: "About Us", url: "/About", description: "Learn about BeyondWalls - UAE's leading DOOH advertising platform" },
  { name: "Services", url: "/Services", description: "Digital advertising services for businesses and venue owners" },
  { name: "Contact", url: "/Contact", description: "Get in touch with our team in Dubai" },
  { name: "How It Works", url: "/HowItWorks", description: "Launch your campaign in 4 easy steps" },
  { name: "Screen Locations", url: "/ScreenLocations", description: "Browse 500+ digital screens across UAE" },
  { name: "Register", url: "/Register", description: "Start advertising today - Free signup" }
];

export const SITEMAP_PAGES = [
  { url: "/", priority: "1.0", changefreq: "daily" },
  { url: "/About", priority: "0.8", changefreq: "monthly" },
  { url: "/Services", priority: "0.9", changefreq: "weekly" },
  { url: "/Contact", priority: "0.7", changefreq: "monthly" },
  { url: "/Blog", priority: "0.8", changefreq: "daily" },
  { url: "/ScreenLocations", priority: "0.9", changefreq: "daily" },
  { url: "/HowItWorks", priority: "0.8", changefreq: "monthly" },
  { url: "/Register", priority: "0.9", changefreq: "monthly" },
  { url: "/Terms", priority: "0.3", changefreq: "yearly" },
  { url: "/Privacy", priority: "0.3", changefreq: "yearly" },
  { url: "/HelpCenter", priority: "0.6", changefreq: "weekly" },
  { url: "/ARPremium", priority: "0.7", changefreq: "weekly" },
  { url: "/Connect", priority: "0.6", changefreq: "monthly" },
  { url: "/Sitemap", priority: "0.3", changefreq: "monthly" },
  // SEO Landing Pages
  { url: "/DOOHAdvertisingDubai", priority: "0.9", changefreq: "weekly" },
  { url: "/DigitalSignageUAE", priority: "0.9", changefreq: "weekly" },
  { url: "/AdPlatformDubai", priority: "0.8", changefreq: "weekly" },
  { url: "/VenueAdvertisingUAE", priority: "0.8", changefreq: "weekly" },
  { url: "/BeyondWallsUAEvsUSA", priority: "0.7", changefreq: "monthly" },
  { url: "/CafeScreenAdvertisingDubai", priority: "0.8", changefreq: "weekly" },
  { url: "/GymScreenAdvertisingDubai", priority: "0.8", changefreq: "weekly" },
  { url: "/CoworkingSpaceAdvertisingDubai", priority: "0.8", changefreq: "weekly" },
  { url: "/ClinicScreenAdvertisingDubai", priority: "0.8", changefreq: "weekly" },
  { url: "/MonetizeYourScreensDubai", priority: "0.8", changefreq: "weekly" }
];

export default function SEOHead({ 
  title, 
  description, 
  keywords, 
  canonical, 
  ogImage,
  structuredData,
  noIndex = false,
  article = null
}) {
  const baseUrl = "https://www.beyondwalls.ae";
  const defaultOgImage = "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=630&fit=crop&q=80";
  const finalCanonical = canonical || baseUrl;
  const finalOgImage = ogImage || defaultOgImage;

  React.useEffect(() => {
      // Update document title
      document.title = title || "BeyondWalls - Digital Advertising Platform UAE";

      // Set BeyondWalls favicon (only once)
      if (!document.querySelector('link[rel="icon"][data-beyondwalls]')) {
        const faviconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1"/><stop offset="100%" style="stop-color:#6366F1;stop-opacity:1"/></linearGradient></defs><rect width="48" height="48" rx="10" fill="url(#grad)"/><path d="M14 14h20a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V16a2 2 0 0 1 2-2z" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 34h12M24 28v6" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>`;
        const faviconHref = 'data:image/svg+xml;base64,' + btoa(faviconSVG);

        // Remove all existing favicons
        document.querySelectorAll('link[rel*="icon"]').forEach(link => link.remove());

        // Add new favicon
        const favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.type = 'image/svg+xml';
        favicon.href = faviconHref;
        favicon.setAttribute('data-beyondwalls', 'true');
        document.head.appendChild(favicon);

        // Add apple touch icon
        const appleFavicon = document.createElement('link');
        appleFavicon.rel = 'apple-touch-icon';
        appleFavicon.href = faviconHref;
        appleFavicon.setAttribute('data-beyondwalls', 'true');
        document.head.appendChild(appleFavicon);
      }



    // Helper to set or create meta tag
    const setMetaTag = (name, content, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let tag = document.querySelector(`meta[${attr}="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    // Basic meta tags
    if (description) setMetaTag("description", description);
    if (keywords) setMetaTag("keywords", keywords);
    if (noIndex) setMetaTag("robots", "noindex, nofollow");
    else setMetaTag("robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");

    // Open Graph tags
    setMetaTag("og:title", title, true);
    setMetaTag("og:description", description, true);
    setMetaTag("og:url", finalCanonical, true);
    setMetaTag("og:image", finalOgImage, true);
    setMetaTag("og:type", article ? "article" : "website", true);
    setMetaTag("og:site_name", "BeyondWalls", true);
    setMetaTag("og:locale", "en_AE", true);

    // Twitter Card tags
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:site", "@BeyondWallsae");
    setMetaTag("twitter:creator", "@BeyondWallsae");
    setMetaTag("twitter:title", title);
    setMetaTag("twitter:description", description);
    setMetaTag("twitter:image", finalOgImage);

    // Article specific tags
    if (article) {
      if (article.publishedTime) setMetaTag("article:published_time", article.publishedTime, true);
      if (article.modifiedTime) setMetaTag("article:modified_time", article.modifiedTime, true);
      if (article.author) setMetaTag("article:author", article.author, true);
      if (article.section) setMetaTag("article:section", article.section, true);
      if (article.tags) article.tags.forEach(tag => setMetaTag("article:tag", tag, true));
    }

    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", finalCanonical);

    // Structured data (JSON-LD)
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement("script");
        script.setAttribute("type", "application/ld+json");
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }

    // Additional meta tags for better SEO
    setMetaTag("author", "BeyondWalls");
    setMetaTag("publisher", "BeyondWalls");
    setMetaTag("geo.region", "AE-DU");
    setMetaTag("geo.placename", "Dubai");
    setMetaTag("geo.position", "25.0957;55.1548");
    setMetaTag("ICBM", "25.0957, 55.1548");
    setMetaTag("theme-color", "#8B5CF6");

  }, [title, description, keywords, canonical, ogImage, structuredData, noIndex, article]);

  return null; // This component only manages document head
}