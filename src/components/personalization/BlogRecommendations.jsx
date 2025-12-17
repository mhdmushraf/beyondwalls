import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp } from "lucide-react";

export default function BlogRecommendations({ currentPostId }) {
  const [readHistory, setReadHistory] = useState([]);

  useEffect(() => {
    // Load reading history from localStorage
    const history = JSON.parse(localStorage.getItem("blogReadHistory") || "[]");
    setReadHistory(history);
  }, []);

  const { data: allPosts = [] } = useQuery({
    queryKey: ["blog-recommendations"],
    queryFn: () => base44.entities.BlogPost.filter({ status: "published" }, "-published_at", 20)
  });

  const getRecommendations = () => {
    if (readHistory.length === 0) {
      // No history - show latest posts
      return allPosts.filter(p => p.id !== currentPostId).slice(0, 3);
    }

    // Get categories from reading history
    const readCategories = readHistory
      .map(id => allPosts.find(p => p.id === id))
      .filter(Boolean)
      .map(p => p.category);

    // Count category frequency
    const categoryFrequency = readCategories.reduce((acc, cat) => {
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    // Get most read category
    const preferredCategory = Object.keys(categoryFrequency).sort(
      (a, b) => categoryFrequency[b] - categoryFrequency[a]
    )[0];

    // Recommend posts from preferred category first
    const categoryMatches = allPosts.filter(
      p => p.category === preferredCategory && p.id !== currentPostId && !readHistory.includes(p.id)
    );

    // Fill remaining slots with other posts
    const otherPosts = allPosts.filter(
      p => p.id !== currentPostId && !readHistory.includes(p.id) && p.category !== preferredCategory
    );

    return [...categoryMatches, ...otherPosts].slice(0, 3);
  };

  const recommendations = getRecommendations();

  if (recommendations.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-violet-600" />
        <h3 className="text-xl font-bold text-slate-900">Recommended for You</h3>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {recommendations.map(post => (
          <Link key={post.id} to={createPageUrl(`BlogPost?id=${post.id}`)}>
            <Card className="overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer">
              <div className="relative h-32 bg-slate-100">
                {post.cover_image ? (
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-100 to-indigo-100" />
                )}
              </div>
              <CardContent className="p-4">
                <h4 className="font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-violet-600 transition-colors">
                  {post.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2">{post.excerpt}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}