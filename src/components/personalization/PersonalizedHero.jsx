import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Building2, Sparkles, TrendingUp, Users, DollarSign } from "lucide-react";

export default function PersonalizedHero() {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null); // "advertiser" or "venue_owner"

  useEffect(() => {
    detectUserType();
  }, []);

  const detectUserType = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const userData = await base44.auth.me();
        setUser(userData);
        setUserType(userData.user_role || userData.is_venue_owner ? "venue_owner" : "advertiser");
      } else {
        // For non-authenticated users, try to detect from localStorage or default to advertiser
        const savedPreference = localStorage.getItem("userPreference");
        setUserType(savedPreference || "advertiser");
      }
    } catch (e) {
      setUserType("advertiser");
    }
  };

  const content = {
    advertiser: {
      badge: "🎯 For Advertisers",
      title: "Reach Thousands of Customers Daily",
      subtitle: "Launch your campaign on 500+ premium screens across Dubai in minutes",
      stats: [
        { icon: Users, label: "9,000+", desc: "Daily Reach" },
        { icon: TrendingUp, label: "72%", desc: "Brand Recall" },
        { icon: Sparkles, label: "90%", desc: "Cost Savings" }
      ],
      cta: { text: "Start Advertising", icon: Megaphone, page: "AICampaignCreator" },
      secondary: { text: "View Screen Locations", page: "ScreenLocations" }
    },
    venue_owner: {
      badge: "🏢 For Venue Owners",
      title: "Turn Your Screens Into Revenue",
      subtitle: "Earn AED 2,000-4,000+ monthly per screen with zero equipment cost",
      stats: [
        { icon: DollarSign, label: "70%", desc: "Revenue Share" },
        { icon: Building2, label: "8+", desc: "Partner Venues" },
        { icon: Sparkles, label: "Weekly", desc: "Payouts" }
      ],
      cta: { text: "List Your Venue", icon: Building2, page: "Register" },
      secondary: { text: "Learn How It Works", page: "HowItWorks" }
    }
  };

  const activeContent = content[userType] || content.advertiser;

  return (
    <section className="relative pt-32 pb-20 px-6 bg-gradient-to-br from-violet-50 via-purple-50/30 to-indigo-50 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-violet-300 rounded-full blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-300 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "1s" }} />
      
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-12">
          <Badge className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 px-5 py-2 mb-6 text-sm">
            {activeContent.badge}
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-tight">
            {activeContent.title}
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-10">
            {activeContent.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to={createPageUrl(activeContent.cta.page)}>
              <Button size="lg" className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 shadow-2xl shadow-violet-500/30 h-14 px-10 text-lg">
                <activeContent.cta.icon className="w-5 h-5 mr-2" />
                {activeContent.cta.text}
              </Button>
            </Link>
            <Link to={createPageUrl(activeContent.secondary.page)}>
              <Button size="lg" variant="outline" className="border-2 h-14 px-10 text-lg">
                {activeContent.secondary.text}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
            {activeContent.stats.map((stat, idx) => (
              <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
                <stat.icon className="w-8 h-8 text-violet-600 mx-auto mb-2" />
                <p className="text-3xl font-bold text-slate-900">{stat.label}</p>
                <p className="text-sm text-slate-600">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* User Type Toggle for non-authenticated */}
        {!user && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant={userType === "advertiser" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setUserType("advertiser");
                localStorage.setItem("userPreference", "advertiser");
              }}
              className={userType === "advertiser" ? "bg-violet-600" : ""}
            >
              I'm an Advertiser
            </Button>
            <Button
              variant={userType === "venue_owner" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setUserType("venue_owner");
                localStorage.setItem("userPreference", "venue_owner");
              }}
              className={userType === "venue_owner" ? "bg-violet-600" : ""}
            >
              I'm a Venue Owner
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}