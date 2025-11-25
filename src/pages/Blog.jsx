import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Search,
  Calendar,
  User,
  Clock,
  FileText,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

export default function Blog() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["All", "Industry News", "Tips & Tricks", "Case Studies", "Product Updates", "Guides"];

  const categoryMap = {
    "Industry News": "industry-news",
    "Tips & Tricks": "tips",
    "Case Studies": "case-studies",
    "Product Updates": "product-updates",
    "Guides": "guides"
  };

  const categoryLabels = {
    "industry-news": "Industry News",
    "tips": "Tips & Tricks",
    "case-studies": "Case Studies",
    "product-updates": "Product Updates",
    "guides": "Guides"
  };

  const { data: blogPosts = [], isLoading } = useQuery({
    queryKey: ["public-blog-posts"],
    queryFn: () => base44.entities.BlogPost.filter({ status: "published" }, "-published_at")
  });

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(search.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || post.category === categoryMap[selectedCategory];
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* Hero */}
      <section className="pt-32 pb-12 px-6 bg-gradient-to-br from-violet-50 via-white to-indigo-50">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-amber-100 text-slate-900 mb-6">Blog</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Insights & Updates
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Stay informed with the latest trends in DOOH advertising, tips for success, and BeyondWalls updates.
          </p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-8 px-6 border-b border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search articles..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === (cat === "All" ? "all" : cat) ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat === "All" ? "all" : cat)}
                  className={selectedCategory === (cat === "All" ? "all" : cat) 
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600" 
                    : "text-slate-900"
                  }
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="text-center py-16">
              <Loader2 className="w-12 h-12 text-violet-600 animate-spin mx-auto mb-4" />
              <p className="text-slate-500">Loading articles...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No articles found</h3>
              <p className="text-slate-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <Link key={post.id} to={createPageUrl(`BlogPost?id=${post.id}`)}>
              <Card className="overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer">
                  <div className="relative h-48 overflow-hidden">
                    {post.cover_image ? (
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-violet-300" />
                      </div>
                    )}
                    <Badge className="absolute top-3 left-3 bg-amber-100 text-slate-900">
                      {categoryLabels[post.category] || post.category}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-violet-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-4">
                        <Link 
                        to={createPageUrl(`AuthorProfile?${post.author_id ? `email=${post.author_id}` : `name=${encodeURIComponent(post.author_name || "Admin")}`}`)}
                        className="flex items-center gap-1 hover:text-violet-600 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <User className="w-3 h-3" />
                        {post.author_name || "Admin"}
                      </Link>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {post.published_at ? format(new Date(post.published_at), "MMM d, yyyy") : format(new Date(post.created_date), "MMM d, yyyy")}
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.read_time || 1} min read
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 px-6 bg-gradient-to-br from-violet-600 to-indigo-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-white/80 mb-8">
            Get the latest insights and updates delivered to your inbox
          </p>
          <div className="flex gap-3 max-w-md mx-auto">
            <Input
              placeholder="Enter your email"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            <Button className="bg-amber-100 text-slate-900 hover:bg-amber-100/90">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}