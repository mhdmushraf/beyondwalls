import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";

export default function ArticleLayout({
  title,
  description,
  canonical,
  publishedDate,
  category = "Guides",
  readTime = 6,
  coverImage,
  children,
  ctaTitle = "Ready to Launch Your DOOH Campaign?",
  ctaText = "Browse available screens across Dubai and launch your campaign in under 30 minutes — from AED 99/week, no contracts.",
  ctaLink = "Register",
  ctaLabel = "Get Started Free"
}) {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "datePublished": publishedDate,
    "dateModified": publishedDate,
    "author": {
      "@type": "Organization",
      "name": "Beyond Walls",
      "url": "https://www.beyondwalls.ae"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Beyond Walls",
      "url": "https://www.beyondwalls.ae",
      "logo": {
        "@type": "ImageObject",
        "url": "https://media.base44.com/images/public/69b31183956b052c51ee3a67/b64097b04_beyondwalls-icon.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonical
    },
    "inLanguage": "en-AE"
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title={title}
        description={description}
        canonical={canonical}
        structuredData={articleSchema}
      />
      <PublicNav />

      <div className="pt-24 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
          <Link to={createPageUrl("Blog")}>
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <Badge className="bg-amber-100 text-slate-900 mb-4">{category}</Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
              {title.split(" | ")[0]}
            </h1>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(publishedDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {readTime} min read
              </span>
              <span className="text-slate-400">By Beyond Walls</span>
            </div>
          </div>

          {/* Cover Image */}
          {coverImage && (
            <img
              src={coverImage}
              alt={title.split(" | ")[0]}
              className="w-full h-64 md:h-80 object-cover rounded-xl mb-8"
            />
          )}

          {/* Article Content */}
          <article className="prose prose-slate prose-lg max-w-none mb-12">
            {children}
          </article>

          {/* CTA */}
          <div className="my-8 p-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl text-center">
            <h3 className="text-2xl font-bold text-white mb-3">{ctaTitle}</h3>
            <p className="text-white/80 mb-6 max-w-lg mx-auto">{ctaText}</p>
            <Link to={createPageUrl(ctaLink)}>
              <Button size="lg" className="bg-white text-violet-600 hover:bg-slate-100 h-12 px-8">
                {ctaLabel}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}