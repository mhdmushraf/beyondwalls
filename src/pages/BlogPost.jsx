import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  FileText,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import CommentSection from "@/components/blog/CommentSection";
import NewsletterSignup from "@/components/NewsletterSignup";
import SEOHead from "@/components/SEOHead";

export default function BlogPost() {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("id");

  const categoryLabels = {
    "industry-news": "Industry News",
    "tips": "Tips & Tricks",
    "case-studies": "Case Studies",
    "product-updates": "Product Updates",
    "guides": "Guides"
  };

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog-post", postId],
    queryFn: () => base44.entities.BlogPost.filter({ id: postId }),
    enabled: !!postId
  });

  const post = posts[0];

  const blogSEO = post ? {
    title: `${post.title} | BeyondWalls Blog`,
    description: post.excerpt || post.content?.substring(0, 160),
    keywords: `${post.title}, DOOH advertising, digital advertising Dubai, ${categoryLabels[post.category] || post.category}, BeyondWalls blog, ${(post.tags || []).join(", ")}`,
    image: post.cover_image || "https://www.beyondwalls.ae/og-blog.jpg",
    url: `/blog/${post.slug || post.id}`,
    type: "article",
    article: {
      publishedTime: post.published_at,
      modifiedTime: post.updated_date,
      author: post.author_name,
      section: categoryLabels[post.category] || post.category,
      tags: post.tags || []
    },
    structuredData: {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://www.beyondwalls.ae/blog/${post.slug || post.id}`
      },
      "headline": post.title,
      "description": post.excerpt,
      "image": post.cover_image || "https://www.beyondwalls.ae/og-blog.jpg",
      "author": {
        "@type": "Person",
        "name": post.author_name || "BeyondWalls Team"
      },
      "publisher": {
        "@type": "Organization",
        "name": "BeyondWalls",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.beyondwalls.ae/logo.png",
          "width": 200,
          "height": 60
        }
      },
      "datePublished": post.published_at,
      "dateModified": post.updated_date || post.published_at,
      "articleSection": categoryLabels[post.category] || post.category,
      "keywords": (post.tags || []).join(", "),
      "wordCount": post.content?.split(/\s+/).length || 0,
      "inLanguage": "en-AE"
    }
  } : {};

  return (
    <div className="min-h-screen bg-white">
      {post && <SEOHead {...blogSEO} />}
      <PublicNav />

      <div className="pt-24 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
          <Link to={createPageUrl("Blog")}>
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          {isLoading ? (
            <div className="text-center py-16">
              <Loader2 className="w-12 h-12 text-violet-600 animate-spin mx-auto" />
            </div>
          ) : !post ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-700">Post not found</h2>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-8">
                <Badge className="bg-amber-100 text-slate-900 mb-4">
                  {categoryLabels[post.category] || post.category}
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  {post.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <Link 
                    to={createPageUrl(`AuthorProfile?${post.author_id ? `email=${post.author_id}` : `name=${encodeURIComponent(post.author_name || "Admin")}`}`)}
                    className="flex items-center gap-2 hover:text-violet-600"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-violet-100 text-violet-600 text-sm">
                        {(post.author_name || "A").charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{post.author_name || "Admin"}</span>
                  </Link>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {post.published_at ? format(new Date(post.published_at), "MMM d, yyyy") : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.read_time || 1} min read
                  </span>
                </div>
              </div>

              {/* Cover Image */}
              {post.cover_image && (
                <img
                  src={post.cover_image}
                  alt={post.title}
                  className="w-full h-64 md:h-96 object-cover rounded-xl mb-8"
                />
              )}

              {/* Content */}
              <article className="prose prose-slate prose-lg max-w-none mb-8">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </article>

              {/* Newsletter CTA */}
              <div className="my-8 p-6 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl border border-violet-100">
                <h4 className="font-semibold text-slate-900 mb-1">Enjoyed this article?</h4>
                <p className="text-slate-600 text-sm mb-4">Subscribe to get more insights delivered to your inbox.</p>
                <NewsletterSignup source="blog" variant="inline" />
              </div>

              {/* Comments */}
              <CommentSection postId={post.id} />
            </>
          )}
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}