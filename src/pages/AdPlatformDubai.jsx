import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  MonitorPlay, ArrowRight, CheckCircle2, Sparkles, Building2,
  BarChart3, Zap, Target, TrendingUp, Users, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";

export default function AdPlatformDubai() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "BeyondWalls Ad Platform",
    "applicationCategory": "Advertising Platform",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "99",
      "priceCurrency": "AED"
    }
  };

  const features = [
    { icon: Target, title: "Self-Serve Booking", desc: "Book ad space in minutes, no middleman" },
    { icon: Sparkles, title: "AI-Powered Campaigns", desc: "Smart targeting and optimization" },
    { icon: BarChart3, title: "Real-Time Analytics", desc: "Track performance as it happens" },
    { icon: CreditCard, title: "Flexible Pricing", desc: "Pay per week, no long contracts" },
    { icon: Zap, title: "Instant Activation", desc: "Ads go live within 30 minutes" },
    { icon: Users, title: "Audience Insights", desc: "Know who sees your ads" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Ad Platform Dubai | Self-Serve Advertising Platform | BeyondWalls"
        description="Dubai's leading self-serve advertising platform. Book digital screen ads online, AI-powered campaigns, real-time analytics. No contracts, instant activation. Start from AED 99."
        keywords="ad platform Dubai, advertising platform UAE, self-serve advertising Dubai, digital ad booking Dubai, programmatic advertising UAE, online ad platform"
        canonical="https://www.beyondwalls.ae/ad-platform-dubai"
        structuredData={structuredData}
      />
      <PublicNav />

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-slate-900 via-violet-900 to-indigo-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-violet-500/30 text-violet-200 border-0 mb-4">
                🚀 Dubai's #1 Self-Serve Ad Platform
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                The Smartest Ad Platform in Dubai
              </h1>
              <p className="text-xl text-slate-300 mb-8">
                Book digital advertising space across 500+ screens in Dubai. 
                AI-powered targeting, real-time analytics, and instant activation.
              </p>
              <ul className="space-y-3 mb-8">
                {["No minimum spend", "No contracts", "Pay as you go", "Go live in 30 min"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link to={createPageUrl("Register")}>
                <Button size="lg" className="bg-violet-500 hover:bg-violet-600 h-14 px-8">
                  Try Platform Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="space-y-4">
                  <div className="h-8 bg-white/20 rounded w-3/4"></div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-20 bg-violet-500/30 rounded-lg"></div>
                    <div className="h-20 bg-violet-500/30 rounded-lg"></div>
                    <div className="h-20 bg-violet-500/30 rounded-lg"></div>
                  </div>
                  <div className="h-32 bg-white/10 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Platform Features
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to run successful advertising campaigns in Dubai
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            No hidden fees. No long-term commitments.
          </p>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <p className="text-sm text-slate-500 mb-2">Starting from</p>
            <p className="text-5xl font-bold text-violet-600 mb-2">AED 99</p>
            <p className="text-slate-600 mb-6">per screen / per week</p>
            <ul className="space-y-3 text-left max-w-sm mx-auto mb-8">
              {["15-second ad slot", "Real-time analytics", "Upload any creative", "Cancel anytime"].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link to={createPageUrl("Register")}>
              <Button size="lg" className="bg-violet-600 hover:bg-violet-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-violet-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Try Dubai's Best Ad Platform?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Create your free account and launch your first campaign today
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-violet-600 hover:bg-slate-100 h-14 px-8">
              Start Free Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}