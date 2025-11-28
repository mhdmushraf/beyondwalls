import React, { useEffect } from "react";

const DEFAULT_SEO = {
  siteName: "BeyondWalls",
  siteUrl: "https://www.beyondwalls.ae",
  defaultTitle: "BeyondWalls - #1 Digital Out-of-Home (DOOH) Advertising Platform in Dubai & UAE",
  defaultDescription: "BeyondWalls is UAE's leading DOOH advertising platform. Book digital screens in cafés, malls, gyms & coworking spaces across Dubai, Abu Dhabi & Sharjah. 500+ screens, real-time analytics, instant activation. Best advertising company in Dubai for SMBs. Start from AED 99/week!",
  defaultImage: "https://www.beyondwalls.ae/og-image.jpg",
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

    // Open Graph Tags (for Facebook, WhatsApp, LinkedIn, etc.)
    setMetaTag("og:title", fullTitle, true);
    setMetaTag("og:description", metaDescription, true);
    setMetaTag("og:image", metaImage, true);
    setMetaTag("og:image:alt", "BeyondWalls - Digital Advertising Platform", true);
    setMetaTag("og:image:width", "1200", true);
    setMetaTag("og:image:height", "630", true);
    setMetaTag("og:url", canonicalUrl, true);
    setMetaTag("og:type", type, true);
    setMetaTag("og:site_name", DEFAULT_SEO.siteName, true);
    setMetaTag("og:locale", DEFAULT_SEO.locale, true);
    
    // WhatsApp specific
    setMetaTag("og:image:secure_url", metaImage, true);

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
      "alternateName": ["BeyondWalls UAE", "BeyondWalls Dubai", "BeyondWalls DOOH"],
      "url": DEFAULT_SEO.siteUrl,
      "logo": "https://www.beyondwalls.ae/logo.png",
      "image": "https://www.beyondwalls.ae/og-image.jpg",
      "description": "UAE's #1 Digital Out-of-Home (DOOH) Advertising Platform. Self-serve advertising on 500+ digital screens across Dubai, Abu Dhabi, and Sharjah. Best advertising company in UAE for businesses of all sizes.",
      "foundingDate": "2025",
      "founder": {
        "@type": "Person",
        "name": "Muhammed Musharaf"
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "in5 Tech, Dubai Internet City",
        "addressLocality": "Dubai",
        "addressRegion": "Dubai",
        "postalCode": "500001",
        "addressCountry": "AE"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "25.0957",
        "longitude": "55.1548"
      },
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+971-55-614-0067",
          "contactType": "customer service",
          "email": "hello@beyondwalls.ae",
          "areaServed": ["AE", "UAE", "Dubai", "Abu Dhabi", "Sharjah"],
          "availableLanguage": ["English", "Arabic"]
        },
        {
          "@type": "ContactPoint",
          "telephone": "+971-55-614-0067",
          "contactType": "sales",
          "email": "partnership@beyondwalls.ae"
        }
      ],
      "sameAs": [
        "https://x.com/BeyondWallsae",
        "https://www.instagram.com/beyondwallsae/",
        "https://www.youtube.com/@BeyondWallsAE",
        "https://www.facebook.com/beyondwallsae",
        "https://www.linkedin.com/company/beyondwallsae",
        "https://www.tiktok.com/@beyondwallsae"
      ],
      "areaServed": {
        "@type": "Country",
        "name": "United Arab Emirates"
      },
      "serviceType": ["Digital Advertising", "DOOH Advertising", "Screen Advertising", "Outdoor Advertising"],
      "priceRange": "AED 99 - AED 10,000",
      "award": "Global Recognition Award 2025"
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
    description: "BeyondWalls is UAE's #1 self-serve DOOH advertising platform & best advertising company in Dubai. Book premium digital screens in 500+ cafés, malls, gyms & coworking spaces across Dubai, Abu Dhabi & Sharjah. Start from AED 99/week. Venues earn 70% revenue share!",
    keywords: "advertising companies in Dubai, advertising agency Dubai, DOOH advertising UAE, digital signage Dubai, outdoor advertising Dubai, screen advertising UAE, digital billboard Dubai, café advertising Dubai, mall advertising Dubai, gym advertising UAE, digital out of home advertising, programmatic DOOH UAE, self-serve advertising platform, best advertising company UAE, advertising companies in UAE, Dubai advertising, Abu Dhabi advertising, Sharjah advertising, billboard advertising Dubai, digital marketing Dubai",
    url: "/",
    image: "https://www.beyondwalls.ae/og-image.jpg",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "BeyondWalls - Best Advertising Company in Dubai & UAE",
      "alternateName": "BeyondWalls DOOH Advertising",
      "url": "https://www.beyondwalls.ae",
      "description": "UAE's #1 Digital Out-of-Home Advertising Platform & Best Advertising Company in Dubai. Book digital screens in cafés, malls & gyms across Dubai, Abu Dhabi, Sharjah.",
      "inLanguage": "en-AE",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.beyondwalls.ae/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      },
      "publisher": {
        "@type": "Organization",
        "name": "BeyondWalls",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.beyondwalls.ae/logo.png"
        }
      }
    }
  },
  about: {
    title: "About BeyondWalls - Award-Winning DOOH Advertising Startup in Dubai | in5 Dubai",
    description: "BeyondWalls is an award-winning DOOH advertising startup incubated by in5 Dubai (TECOM Group). Global Recognition Award 2025 winner. Democratizing outdoor advertising across UAE. Founded by Muhammed Musharaf.",
    keywords: "BeyondWalls about, DOOH startup Dubai, in5 Dubai startup, digital advertising company UAE, outdoor advertising company Dubai, Global Recognition Award 2025, Muhammed Musharaf, TECOM Group, Dubai Internet City, advertising startup UAE, best advertising agency Dubai",
    url: "/about",
    image: "https://www.beyondwalls.ae/og-about.jpg",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "About BeyondWalls",
      "description": "Award-winning DOOH advertising startup from in5 Dubai, democratizing outdoor advertising in UAE",
      "mainEntity": {
        "@type": "Organization",
        "name": "BeyondWalls",
        "foundingDate": "2025-06",
        "award": "Global Recognition Award 2025",
        "parentOrganization": {
          "@type": "Organization",
          "name": "in5 Dubai"
        }
      }
    }
  },
  services: {
    title: "DOOH Advertising Services Dubai | Digital Screen Advertising | Venue Monetization UAE",
    description: "BeyondWalls offers premium DOOH advertising services in Dubai & UAE. For advertisers: precision targeting, AI campaigns, real-time analytics. For venues: 70% revenue share, easy screen setup. Best advertising services in Dubai!",
    keywords: "DOOH advertising services Dubai, venue monetization UAE, screen advertising services, digital signage solutions Dubai, advertising platform features, 70% revenue share, advertising services Dubai, digital advertising Dubai, outdoor advertising services UAE, billboard advertising services, advertising agency services Dubai",
    url: "/services",
    image: "https://www.beyondwalls.ae/og-services.jpg",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "BeyondWalls DOOH Advertising Services",
      "provider": {
        "@type": "Organization",
        "name": "BeyondWalls"
      },
      "serviceType": "Digital Out-of-Home Advertising",
      "areaServed": ["Dubai", "Abu Dhabi", "Sharjah", "UAE"],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Advertising Services",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Screen Advertising",
              "description": "Book digital screens in premium venues"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Venue Monetization",
              "description": "Earn 70% revenue from your screens"
            }
          }
        ]
      }
    }
  },
  contact: {
    title: "Contact BeyondWalls Dubai | Advertising Inquiry | +971 55 614 0067",
    description: "Contact BeyondWalls for DOOH advertising inquiries, venue partnerships, or investor relations. Email hello@beyondwalls.ae or call +971 55 614 0067. Located at in5 Tech, Dubai Internet City, UAE.",
    keywords: "contact BeyondWalls, DOOH advertising inquiry Dubai, venue partnership Dubai, advertising support UAE, Dubai advertising agency contact, advertising company phone number Dubai, advertising companies Dubai contact",
    url: "/contact",
    image: "https://www.beyondwalls.ae/og-contact.jpg",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contact BeyondWalls",
      "description": "Get in touch with BeyondWalls for advertising and partnership inquiries",
      "mainEntity": {
        "@type": "Organization",
        "name": "BeyondWalls",
        "telephone": "+971-55-614-0067",
        "email": "hello@beyondwalls.ae",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "in5 Tech, Dubai Internet City",
          "addressLocality": "Dubai",
          "addressCountry": "AE"
        }
      }
    }
  },
  blog: {
    title: "DOOH Advertising Blog Dubai | Digital Marketing Tips | Outdoor Advertising Insights UAE",
    description: "Read BeyondWalls blog for latest DOOH advertising insights, digital marketing tips, outdoor advertising trends in Dubai & UAE. Expert guides, case studies, and industry news.",
    keywords: "DOOH blog Dubai, digital advertising tips UAE, outdoor advertising trends Dubai, screen advertising insights, UAE advertising news, marketing tips Dubai, advertising blog UAE, digital marketing blog Dubai, billboard advertising tips",
    url: "/blog",
    image: "https://www.beyondwalls.ae/og-blog.jpg",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "BeyondWalls Blog",
      "description": "DOOH advertising insights and digital marketing tips for Dubai & UAE",
      "publisher": {
        "@type": "Organization",
        "name": "BeyondWalls",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.beyondwalls.ae/logo.png"
        }
      }
    }
  },
  howItWorks: {
    title: "How DOOH Advertising Works | Book Digital Screens Dubai | Self-Serve Platform Guide",
    description: "Learn how BeyondWalls DOOH advertising works. Step-by-step guide: choose screens, upload creative, set budget, go live in 30 minutes. Best self-serve advertising platform in Dubai & UAE.",
    keywords: "how DOOH advertising works, digital advertising guide Dubai, screen setup guide UAE, advertising campaign tutorial, venue monetization guide, self-serve advertising platform, how to advertise in Dubai, outdoor advertising guide UAE, book billboard Dubai",
    url: "/how-it-works",
    image: "https://www.beyondwalls.ae/og-how-it-works.jpg",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Advertise on Digital Screens in Dubai",
      "description": "Complete guide to booking DOOH advertising in UAE",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Choose Screens",
          "text": "Browse 500+ screens and select locations matching your target audience"
        },
        {
          "@type": "HowToStep",
          "name": "Upload Creative",
          "text": "Upload your image or video ad"
        },
        {
          "@type": "HowToStep",
          "name": "Set Budget",
          "text": "Pay per screen per week, starting from AED 99"
        },
        {
          "@type": "HowToStep",
          "name": "Go Live",
          "text": "Your ad goes live within 30 minutes"
        }
      ]
    }
  },
  screenLocations: {
    title: "Digital Advertising Screens Dubai | Billboard Locations UAE | 500+ Premium Venues",
    description: "Browse 500+ digital advertising screens in premium locations across Dubai, Abu Dhabi & Sharjah. Find screens in cafés, malls, gyms, hotels, hospitals & coworking spaces. Best advertising locations in UAE!",
    keywords: "advertising screens Dubai, digital billboards UAE, mall advertising locations Dubai, café screens Dubai, gym advertising Abu Dhabi, coworking space ads Sharjah, billboard locations Dubai, advertising spaces UAE, screen advertising locations, outdoor advertising spots Dubai",
    url: "/screen-locations",
    image: "https://www.beyondwalls.ae/og-locations.jpg",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "BeyondWalls Screen Locations",
      "description": "500+ digital advertising screens across UAE",
      "numberOfItems": 500,
      "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Dubai Screens"},
        {"@type": "ListItem", "position": 2, "name": "Abu Dhabi Screens"},
        {"@type": "ListItem", "position": 3, "name": "Sharjah Screens"}
      ]
    }
  },
  helpCenter: {
    title: "BeyondWalls Help Center | DOOH Advertising FAQs | Customer Support Dubai",
    description: "Get answers to FAQs about BeyondWalls DOOH advertising. Learn about campaign setup, venue onboarding, payments, screen player, and troubleshooting. 24/7 support available.",
    keywords: "BeyondWalls help, DOOH FAQ Dubai, advertising support UAE, screen player help, venue owner support, customer service Dubai, advertising platform help, how to use BeyondWalls",
    url: "/help-center",
    image: "https://www.beyondwalls.ae/og-help.jpg",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "name": "BeyondWalls Help Center",
      "description": "Frequently asked questions about DOOH advertising"
    }
  },
  connect: {
    title: "BeyondWalls Connect | Venue Partner Program Dubai | Earn 70% Revenue Share",
    description: "Join BeyondWalls Connect partner program. Turn your venue screens into revenue generators. 70% revenue share, zero upfront costs, easy 5-minute setup. Best venue monetization in UAE!",
    keywords: "BeyondWalls Connect, venue partner program Dubai, screen monetization UAE, passive income screens, digital signage partnership, venue advertising revenue, monetize café screens, gym screen advertising, restaurant digital signage",
    url: "/connect",
    image: "https://www.beyondwalls.ae/og-connect.jpg",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "BeyondWalls Connect Partner Program",
      "description": "Venue partner program with 70% revenue share"
    }
  },
  register: {
    title: "Sign Up | Create BeyondWalls Account | Start Advertising in Dubai Today",
    description: "Create your free BeyondWalls account. Start advertising on 500+ digital screens across Dubai, Abu Dhabi & Sharjah. Or register as a venue owner and earn 70% revenue share!",
    keywords: "BeyondWalls sign up, create advertising account Dubai, register DOOH platform, advertiser registration UAE, venue owner sign up, start advertising Dubai",
    url: "/register",
    image: "https://www.beyondwalls.ae/og-register.jpg"
  },
  terms: {
    title: "Terms of Service | BeyondWalls UAE",
    description: "Read BeyondWalls Terms of Service. Understand your rights and responsibilities when using our digital out-of-home advertising platform in UAE.",
    keywords: "BeyondWalls terms, advertising terms of service, DOOH platform terms UAE",
    url: "/terms",
    noindex: true
  },
  privacy: {
    title: "Privacy Policy | BeyondWalls UAE",
    description: "BeyondWalls Privacy Policy. Learn how we collect, use, and protect your data on our digital advertising platform. GDPR compliant.",
    keywords: "BeyondWalls privacy, advertising platform privacy policy, data protection UAE",
    url: "/privacy",
    noindex: true
  }
};