import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Mail,
  Building2,
  MapPin,
  MonitorPlay,
  Megaphone,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";

export default function AuthorProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const authorEmail = urlParams.get("email");
  const authorName = urlParams.get("name");

  const categoryLabels = {
    "industry-news": "Industry News",
    "tips": "Tips & Tricks",
    "case-studies": "Case Studies",
    "product-updates": "Product Updates",
    "guides": "Guides"
  };

  const { data: users = [], isLoading: loadingUser } = useQuery({
    queryKey: ["author-user", authorEmail],
    queryFn: () => base44.entities.User.filter({ email: authorEmail }),
    enabled: !!authorEmail
  });

  const user = users[0];

  const { data: blogPosts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ["author-posts", authorEmail, authorName],
    queryFn: async () => {
      if (authorEmail) {
        return base44.entities.BlogPost.filter({ author_id: authorEmail, status: "published" }, "-published_at");
      } else if (authorName) {
        return base44.entities.BlogPost.filter({ author_name: authorName, status: "published" }, "-published_at");
      }
      return [];
    },
    enabled: !!authorEmail || !!authorName
  });

  const { data: venues = [] } = useQuery({
    queryKey: ["author-venues", authorEmail],
    queryFn: () => base44.entities.Venue.filter({ owner_id: authorEmail, status: "approved" }),
    enabled: !!authorEmail && user?.is_venue_owner
  });

  const { data: screens = [] } = useQuery({
    queryKey: ["author-screens", authorEmail],
    queryFn: () => base44.entities.Screen.filter({ owner_id: authorEmail, status: "online" }),
    enabled: !!authorEmail && user?.is_venue_owner
  });

  const isLoading = loadingUser || loadingPosts;
  const displayName = user?.full_name || authorName || "Author";
  const isVenueOwner = user?.is_venue_owner;
  const isAdvertiser = user?.user_role === "advertiser" || user?.user_role === "both";

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      <div className="pt-24 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
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
          ) : (
            <>
              {/* Profile Header */}
              <Card className="mb-8">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={user?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-2xl">
                        {displayName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-slate-900 mb-2">{displayName}</h1>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {isVenueOwner && (
                          <Badge className="bg-emerald-100 text-emerald-700">
                            <Building2 className="w-3 h-3 mr-1" />
                            Venue Owner
                          </Badge>
                        )}
                        {isAdvertiser && (
                          <Badge className="bg-violet-100 text-violet-700">
                            <Megaphone className="w-3 h-3 mr-1" />
                            Advertiser
                          </Badge>
                        )}
                        {blogPosts.length > 0 && (
                          <Badge className="bg-amber-100 text-amber-700">
                            <FileText className="w-3 h-3 mr-1" />
                            {blogPosts.length} Article{blogPosts.length !== 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>
                      {user?.company_name && (
                        <p className="text-slate-600 flex items-center gap-2 mb-2">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          {user.company_name}
                        </p>
                      )}
                      {user?.address && (
                        <p className="text-slate-500 flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          {user.address}
                        </p>
                      )}
                    </div>
                    {user?.email && (
                      <a href={`mailto:${user.email}`}>
                        <Button variant="outline">
                          <Mail className="w-4 h-4 mr-2" />
                          Contact
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Content Tabs */}
              <Tabs defaultValue="posts">
                <TabsList className="mb-6">
                  <TabsTrigger value="posts">Blog Posts ({blogPosts.length})</TabsTrigger>
                  {isVenueOwner && venues.length > 0 && (
                    <TabsTrigger value="venues">Venues ({venues.length})</TabsTrigger>
                  )}
                  {isVenueOwner && screens.length > 0 && (
                    <TabsTrigger value="screens">Screens ({screens.length})</TabsTrigger>
                  )}
                </TabsList>

                {/* Blog Posts Tab */}
                <TabsContent value="posts">
                  {blogPosts.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-xl">
                      <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No published articles yet</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      {blogPosts.map((post) => (
                        <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                          <div className="relative h-40 overflow-hidden">
                            {post.cover_image ? (
                              <img
                                src={post.cover_image}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                                <FileText className="w-10 h-10 text-violet-300" />
                              </div>
                            )}
                            <Badge className="absolute top-3 left-3 bg-amber-100 text-slate-900">
                              {categoryLabels[post.category] || post.category}
                            </Badge>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-bold text-slate-900 mb-2 group-hover:text-violet-600 transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                              {post.excerpt}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {post.published_at ? format(new Date(post.published_at), "MMM d, yyyy") : ""}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {post.read_time || 1} min
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Venues Tab */}
                {isVenueOwner && (
                  <TabsContent value="venues">
                    <div className="grid md:grid-cols-2 gap-6">
                      {venues.map((venue) => (
                        <Card key={venue.id} className="overflow-hidden">
                          <div className="relative h-40 overflow-hidden">
                            {venue.image_url ? (
                              <img src={venue.image_url} alt={venue.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                                <Building2 className="w-10 h-10 text-emerald-300" />
                              </div>
                            )}
                            <Badge className="absolute top-3 left-3 bg-white/90 text-slate-900 capitalize">
                              {venue.type}
                            </Badge>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-bold text-slate-900 mb-1">{venue.name}</h3>
                            <p className="text-slate-500 text-sm flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {venue.area}, {venue.city}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                )}

                {/* Screens Tab */}
                {isVenueOwner && (
                  <TabsContent value="screens">
                    <div className="grid md:grid-cols-3 gap-4">
                      {screens.map((screen) => (
                        <Card key={screen.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                                <MonitorPlay className="w-6 h-6 text-violet-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-900">{screen.name}</h4>
                                <p className="text-sm text-slate-500">{screen.size} • {screen.orientation}</p>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t flex justify-between items-center">
                              <Badge className="bg-emerald-100 text-emerald-700">Online</Badge>
                              <span className="text-sm font-medium text-violet-600">AED {screen.slot_price}/week</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            </>
          )}
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}