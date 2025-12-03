import React from "react";

// SEO configuration for all pages
export const PAGE_SEO = {
  home: {
    title: "BeyondWalls - Best Digital Advertising Company in Dubai & UAE | DOOH Platform",
    description: "UAE's #1 Digital Out-of-Home (DOOH) Advertising Platform. Book ad space on 500+ digital screens across Dubai, Abu Dhabi, Sharjah. Self-serve platform, start from AED 99/week. No contracts, instant activation.",
    keywords: "digital advertising dubai, DOOH advertising UAE, digital billboard advertising, screen advertising dubai, outdoor advertising uae, digital signage advertising, advertising company dubai, best advertising agency uae",
    canonical: "https://www.beyondwalls.ae",
    ogImage: "https://www.beyondwalls.ae/og-image.jpg"
  },
  about: {
    title: "About BeyondWalls - UAE's Leading DOOH Advertising Platform | Our Story",
    description: "Learn about BeyondWalls, UAE's first self-serve Digital Out-of-Home advertising marketplace. Founded in Dubai, we're transforming how businesses advertise on digital screens.",
    keywords: "about beyondwalls, dooh company dubai, digital advertising startup uae, advertising technology dubai",
    canonical: "https://www.beyondwalls.ae/about"
  },
  services: {
    title: "DOOH Advertising Services Dubai | Digital Screen Advertising UAE | BeyondWalls",
    description: "Premium digital advertising services across UAE. Book screens in cafés, malls, gyms & coworking spaces. AI-powered campaigns, real-time analytics, 70% revenue share for venues.",
    keywords: "dooh services dubai, digital screen advertising, venue advertising uae, mall advertising dubai, café advertising, gym advertising screens",
    canonical: "https://www.beyondwalls.ae/services"
  },
  contact: {
    title: "Contact BeyondWalls | Dubai Digital Advertising Experts | Get in Touch",
    description: "Contact BeyondWalls for digital advertising solutions in UAE. Located in in5 Tech, Dubai Internet City. Phone: +971 55 614 0067. Email: hello@beyondwalls.ae",
    keywords: "contact beyondwalls, advertising agency contact dubai, dooh advertising inquiry",
    canonical: "https://www.beyondwalls.ae/contact"
  },
  blog: {
    title: "BeyondWalls Blog | Digital Advertising Insights & Tips | DOOH News UAE",
    description: "Latest insights on digital out-of-home advertising, marketing tips, case studies, and industry news from BeyondWalls - UAE's leading DOOH platform.",
    keywords: "digital advertising blog, dooh news, advertising tips dubai, marketing insights uae",
    canonical: "https://www.beyondwalls.ae/blog"
  },
  screenLocations: {
    title: "Digital Screen Locations UAE | Find Advertising Screens Near You | BeyondWalls",
    description: "Browse 500+ digital advertising screens across Dubai, Abu Dhabi, Sharjah. Filter by venue type, location, and price. Book your ad space today.",
    keywords: "screen locations dubai, digital billboards uae, advertising screens near me, dooh locations",
    canonical: "https://www.beyondwalls.ae/screen-locations"
  },
  howItWorks: {
    title: "How BeyondWalls Works | Book Digital Ads in 4 Easy Steps | DOOH Guide",
    description: "Learn how to advertise on digital screens with BeyondWalls. Choose screens, upload creative, set budget, go live in 30 minutes. Simple self-serve platform.",
    keywords: "how to advertise digitally, dooh advertising guide, digital billboard booking, screen advertising how to",
    canonical: "https://www.beyondwalls.ae/how-it-works"
  },
  register: {
    title: "Sign Up | Start Advertising on Digital Screens | BeyondWalls UAE",
    description: "Create your free BeyondWalls account. Start advertising on 500+ digital screens across UAE or monetize your venue screens. No setup fees.",
    keywords: "sign up beyondwalls, register advertising account, dooh platform signup",
    canonical: "https://www.beyondwalls.ae/register"
  },
  terms: {
    title: "Terms of Service | BeyondWalls UAE",
    description: "Read BeyondWalls Terms of Service. Understand your rights and obligations when using our digital advertising platform.",
    canonical: "https://www.beyondwalls.ae/terms"
  },
  privacy: {
    title: "Privacy Policy | BeyondWalls UAE",
    description: "BeyondWalls Privacy Policy. Learn how we collect, use, and protect your personal information on our DOOH advertising platform.",
    canonical: "https://www.beyondwalls.ae/privacy"
  },
  helpCenter: {
    title: "Help Center | FAQs & Support | BeyondWalls",
    description: "Get help with BeyondWalls. FAQs, tutorials, and support for advertisers and venue owners using our digital advertising platform.",
    canonical: "https://www.beyondwalls.ae/help"
  }
};

// Sitemap data for generation
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
  { url: "/Sitemap", priority: "0.3", changefreq: "monthly" }
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
  const defaultOgImage = `${baseUrl}/og-image.jpg`;
  const finalCanonical = canonical || baseUrl;
  const finalOgImage = ogImage || defaultOgImage;

  React.useEffect(() => {
    // Update document title
    document.title = title || "BeyondWalls - Digital Advertising Platform UAE";

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