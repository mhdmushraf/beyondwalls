import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  MonitorPlay, ArrowRight, Target, TrendingUp, CheckCircle2,
  DollarSign, Clock, BarChart3, Zap, Shield, Sparkles, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";

export default function AdPlatformDubai() {
  const features = [
    { icon: MonitorPlay, title: "500+ Digital Screens", desc: "Access premium screens across Dubai and UAE" },
    { icon: Target, title: "Smart Targeting", desc: "Location, venue type, and time-based targeting" },
    { icon: Sparkles, title: "AI Campaign Builder", desc: "Let AI create and optimize your campaigns" },
    { icon: BarChart3, title: "Real-time Analytics", desc: "Track performance with live dashboards" },
    { icon: Clock, title: "30-Min Activation", desc: "Go live in under 30 minutes" },
    { icon: DollarSign, title: "Transparent Pricing", desc: "No hidden fees, pay per screen per week" }
  ];

  const comparisons = [
    { traditional: "Weeks of negotiation", beyondwalls: "Book in 5 minutes" },
    { traditional: "Minimum AED 50,000+", beyondwalls: "Start from AED 99" },
    { traditional: "No real-time data", beyondwalls: "Live analytics dashboard" },
    { traditional: "Long-term contracts", beyondwalls: "Weekly bookings, no contracts" },
    { traditional: "Manual processes", beyondwalls: "Fully automated platform" }
  ];

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
    },
    "provider": {
      "@type": "Organization",
      "name": "BeyondWalls UAE",
      "url": "https://www.beyondwalls.ae"
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Ad Platform Dubai | Self-Serve Advertising Platform UAE | BeyondWalls"
        description="Dubai's #1 self-serve advertising platform. Book digital ad screens in 5 minutes. AI-powered campaigns, real-time analytics. Start from AED 99/week. No contracts."
        keywords="ad platform Dubai, advertising platform UAE, self-serve advertising Dubai, digital ad booking Dubai, advertising software UAE, ad tech Dubai, programmatic advertising UAE"
        canonical="https://www.beyondwalls.ae/ad-platform-dubai"
        structuredData={structuredData}
      />
      <PublicNav />

      {/* Hero */}
      <section className="pt-28 pb-16 px-6 bg-gradient-to-br from-violet-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-violet-100 text-violet-700 border-0 mb-4">
                🚀 Self-Serve Platform
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Dubai's #1
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent"> Ad Platform </span>
                for Digital Screens
              </h1>
              <p className="text-xl text-slate-600 mb-8">
                Book advertising on <strong>500+ digital screens</strong> across Dubai with our self-serve platform. 
                No agencies, no contracts, no minimum spend.
              </p>
              
              <div className="space-y-3 mb-8">
                {["Book screens in 5 minutes", "AI-powered campaign optimization", "Real-time performance tracking", "Pay only for what you use"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>

              <Link to={createPageUrl("Register")}>
                <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 h-14 px-8">
                  Try the Platform Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&q=80"
                alt="BeyondWalls advertising platform dashboard"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Platform Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Card key={i} className="hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <f.icon className="w-10 h-10 text-violet-600 mb-4" />
                  <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-slate-600">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Traditional Advertising vs BeyondWalls
          </h2>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-2 bg-slate-100 p-4 font-bold text-slate-700">
              <div>Traditional Way</div>
              <div className="text-violet-600">BeyondWalls Platform</div>
            </div>
            {comparisons.map((c, i) => (
              <div key={i} className="grid grid-cols-2 p-4 border-b last:border-0">
                <div className="text-slate-500 line-through">{c.traditional}</div>
                <div className="text-slate-900 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {c.beyondwalls}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-violet-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Advertising?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join 100+ Dubai businesses using the BeyondWalls platform
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