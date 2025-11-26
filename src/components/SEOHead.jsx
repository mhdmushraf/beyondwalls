import React, { useEffect } from "react";

const DEFAULT_SEO = {
  siteName: "BeyondWalls",
  siteUrl: "https://beyondwalls.ae",
  defaultTitle: "BeyondWalls - #1 Digital Out-of-Home Advertising Platform in UAE",
  defaultDescription: "Book premium digital screens in cafés, malls, gyms & coworking spaces across the UAE. Self-serve DOOH advertising platform with real-time analytics. Start advertising in minutes.",
  defaultImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=630&fit=crop",
  twitterHandle: "@BeyondWallsae",
  locale: "en_AE"
};

export default function SEOHead({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
  article = null,
  noindex = false,
  structuredData = null
}) {
  const fullTitle = title ? `${title} | ${DEFAULT_SEO.siteName}` : DEFAULT_SEO.defaultTitle;
  const metaDescription = description || DEFAULT_SEO.defaultDescription;
  const metaImage = image || DEFAULT_SEO.defaultImage;
  const canonicalUrl = url ? `${DEFAULT_SEO.siteUrl}${url}` : DEFAULT_SEO.siteUrl;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to update or create meta tag
    const setMetaTag = (name, content, property = false) => {
      const attr = property ? "property" : "name";
      let tag = document.querySelector(`meta[${attr}="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    // Basic Meta Tags
    setMetaTag("description", metaDescription);
    if (keywords) setMetaTag("keywords", keywords);
    setMetaTag("robots", noindex ? "noindex, nofollow" : "index, follow");
    setMetaTag("author", "BeyondWalls");
    setMetaTag("viewport", "width=device-width, initial-scale=1.0");
    setMetaTag("theme-color", "#7c3aed");

    // Open Graph Tags
    setMetaTag("og:title", fullTitle, true);
    setMetaTag("og:description", metaDescription, true);
    setMetaTag("og:image", metaImage, true);
    setMetaTag("og:image:width", "1200", true);
    setMetaTag("og:image:height", "630", true);
    setMetaTag("og:url", canonicalUrl, true);
    setMetaTag("og:type", type, true);
    setMetaTag("og:site_name", DEFAULT_SEO.siteName, true);
    setMetaTag("og:locale", DEFAULT_SEO.locale, true);

    // Twitter Card Tags
    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:site", DEFAULT_SEO.twitterHandle);
    setMetaTag("twitter:creator", DEFAULT_SEO.twitterHandle);
    setMetaTag("twitter:title", fullTitle);
    setMetaTag("twitter:description", metaDescription);
    setMetaTag("twitter:image", metaImage);

    // Article specific tags
    if (article && type === "article") {
      if (article.publishedTime) setMetaTag("article:published_time", article.publishedTime, true);
      if (article.modifiedTime) setMetaTag("article:modified_time", article.modifiedTime, true);
      if (article.author) setMetaTag("article:author", article.author, true);
      if (article.section) setMetaTag("article:section", article.section, true);
      if (article.tags) {
        article.tags.forEach((tag, i) => setMetaTag(`article:tag:${i}`, tag, true));
      }
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);

    // Structured Data / JSON-LD
    const existingScript = document.querySelector('script[data-seo-structured-data]');
    if (existingScript) existingScript.remove();

    const defaultStructuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "BeyondWalls",
      "url": DEFAULT_SEO.siteUrl,
      "logo": `${DEFAULT_SEO.siteUrl}/logo.png`,
      "description": DEFAULT_SEO.defaultDescription,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Dubai",
        "addressCountry": "AE"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+971-55-614-0067",
        "contactType": "customer service",
        "email": "info@beyondwalls.ae"
      },
      "sameAs": [
        "https://x.com/BeyondWallsae",
        "https://www.instagram.com/beyondwallsae/",
        "https://www.youtube.com/@BeyondWallsAE",
        "https://www.facebook.com/beyondwallsae"
      ]
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-seo-structured-data", "true");
    script.textContent = JSON.stringify(structuredData || defaultStructuredData);
    document.head.appendChild(script);

    // Cleanup
    return () => {
      const scriptToRemove = document.querySelector('script[data-seo-structured-data]');
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [fullTitle, metaDescription, metaImage, canonicalUrl, type, article, keywords, noindex, structuredData]);

  return null;
}

// Pre-configured SEO for common pages
export const PAGE_SEO = {
  home: {
    title: null, // Uses default
    description: "BeyondWalls is the UAE's #1 self-serve digital out-of-home advertising platform. Book premium screens in cafés, malls, gyms & coworking spaces. Real-time analytics, instant activation, 500+ screens.",
    keywords: "DOOH advertising UAE, digital signage Dubai, outdoor advertising platform, screen advertising, digital billboard UAE, café advertising, mall advertising Dubai, gym advertising",
    url: "/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "BeyondWalls",
      "url": "https://beyondwalls.ae",
      "description": "UAE's #1 Digital Out-of-Home Advertising Platform",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://beyondwalls.ae/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  },
  about: {
    title: "About Us - Our Mission & Story",
    description: "Learn about BeyondWalls, the award-winning DOOH advertising startup from in5 Dubai. Founded to democratize outdoor advertising and help venues monetize their screens across the UAE.",
    keywords: "BeyondWalls about, DOOH startup Dubai, in5 Dubai startup, digital advertising company UAE, outdoor advertising company",
    url: "/about"
  },
  services: {
    title: "Services - Advertising & Venue Solutions",
    description: "Explore BeyondWalls services for advertisers and venue owners. Precision targeting, real-time analytics, easy screen setup, and 70% revenue share for venues. Start today.",
    keywords: "DOOH advertising services, venue monetization UAE, screen advertising services, digital signage solutions Dubai, advertising platform features",
    url: "/services"
  },
  contact: {
    title: "Contact Us - Get in Touch",
    description: "Contact BeyondWalls for advertising inquiries, venue partnerships, or support. Email info@beyondwalls.ae or call +971 55 614 0067. Located in Dubai, UAE.",
    keywords: "contact BeyondWalls, DOOH advertising inquiry, venue partnership Dubai, advertising support UAE",
    url: "/contact"
  },
  blog: {
    title: "Blog - DOOH Advertising Insights & Tips",
    description: "Read the latest insights on digital out-of-home advertising, industry trends, tips for successful campaigns, and BeyondWalls product updates.",
    keywords: "DOOH blog, digital advertising tips, outdoor advertising trends, screen advertising insights, UAE advertising news",
    url: "/blog"
  },
  howItWorks: {
    title: "How It Works - Complete Platform Guide",
    description: "Learn how BeyondWalls works for advertisers and venue owners. Step-by-step guide to creating campaigns, setting up screens, and earning revenue from digital advertising.",
    keywords: "how DOOH works, digital advertising guide, screen setup guide, advertising campaign tutorial, venue monetization guide",
    url: "/how-it-works"
  },
  screenLocations: {
    title: "Screen Locations - Premium Venues Across UAE",
    description: "Browse 500+ digital screens in premium locations across the UAE. Find advertising spaces in Dubai, Abu Dhabi, Sharjah cafés, malls, gyms, and coworking spaces.",
    keywords: "advertising screens Dubai, digital billboards UAE, mall advertising locations, café screens Dubai, gym advertising Abu Dhabi",
    url: "/screen-locations"
  },
  helpCenter: {
    title: "Help Center - FAQs & Support",
    description: "Get answers to frequently asked questions about BeyondWalls. Learn about advertising, venue setup, payments, screen player, and troubleshooting.",
    keywords: "BeyondWalls help, DOOH FAQ, advertising support, screen player help, venue owner support",
    url: "/help-center"
  },
  terms: {
    title: "Terms of Service",
    description: "Read BeyondWalls Terms of Service. Understand your rights and responsibilities when using our digital out-of-home advertising platform.",
    keywords: "BeyondWalls terms, advertising terms of service, DOOH platform terms",
    url: "/terms",
    noindex: true
  },
  privacy: {
    title: "Privacy Policy",
    description: "BeyondWalls Privacy Policy. Learn how we collect, use, and protect your data on our digital advertising platform.",
    keywords: "BeyondWalls privacy, advertising platform privacy policy, data protection UAE",
    url: "/privacy",
    noindex: true
  }
};