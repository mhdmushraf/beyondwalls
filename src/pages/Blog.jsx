import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  MonitorPlay,
  ArrowRight,
  Search,
  Calendar,
  User,
  Clock,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Blog() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["All", "Industry News", "Tips & Tricks", "Case Studies", "Product Updates"];

  const blogPosts = [
    {
      id: 1,
      title: "The Future of Digital Out-of-Home Advertising in the UAE",
      excerpt: "Explore how DOOH is transforming the advertising landscape in the Middle East and what it means for businesses.",
      image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop",
      category: "Industry News",
      author: "Sarah Ahmed",
      date: "Nov 20, 2024",
      readTime: "5 min read"
    },
    {
      id: 2,
      title: "5 Tips for Creating Effective Screen Ads",
      excerpt: "Learn the best practices for designing eye-catching advertisements that convert viewers into customers.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
      category: "Tips & Tricks",
      author: "Omar Hassan",
      date: "Nov 18, 2024",
      readTime: "4 min read"
    },
    {
      id: 3,
      title: "How Café Milano Increased Footfall by 30%",
      excerpt: "A deep dive into how one of our venue partners leveraged BeyondWalls to boost their business.",
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop",
      category: "Case Studies",
      author: "Fatima Al Ali",
      date: "Nov 15, 2024",
      readTime: "6 min read"
    },
    {
      id: 4,
      title: "New Feature: Real-time Campaign Analytics",
      excerpt: "Introducing our latest dashboard update with live impression tracking and detailed performance metrics.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
      category: "Product Updates",
      author: "Tech Team",
      date: "Nov 12, 2024",
      readTime: "3 min read"
    },
    {
      id: 5,
      title: "Why Location Matters: Targeting the Right Audience",
      excerpt: "Understanding the importance of venue selection and how to maximize your campaign's reach.",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=400&fit=crop",
      category: "Tips & Tricks",
      author: "Sarah Ahmed",
      date: "Nov 10, 2024",
      readTime: "5 min read"
    },
    {
      id: 6,
      title: "DOOH vs Traditional Billboards: A Comparison",
      excerpt: "Discover why digital screens are becoming the preferred choice for modern advertisers.",
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop",
      category: "Industry News",
      author: "Omar Hassan",
      date: "Nov 8, 2024",
      readTime: "7 min read"
    }
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <MonitorPlay className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">BeyondWalls</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to={createPageUrl("Home")} className="text-slate-600 hover:text-slate-900 font-medium">Home</Link>
            <Link to={createPageUrl("About")} className="text-slate-600 hover:text-slate-900 font-medium">About</Link>
            <Link to={createPageUrl("Contact")} className="text-slate-600 hover:text-slate-900 font-medium">Contact</Link>
          </div>
          <Link to={createPageUrl("Register")}>
            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </nav>

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
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No articles found</h3>
              <p className="text-slate-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 left-3 bg-amber-100 text-slate-900">
                      {post.category}
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
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {post.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {post.date}
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>
                  </CardContent>
                </Card>
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

      {/* Footer */}
      <footer className="py-8 px-6 bg-slate-900 text-center">
        <p className="text-slate-400">© 2024 BeyondWalls. All rights reserved.</p>
      </footer>
    </div>
  );
}