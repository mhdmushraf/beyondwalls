import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  MonitorPlay, ArrowRight, CheckCircle2, MapPin, Building2,
  Users, BarChart3, Zap, Target, TrendingUp, Clock, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";

export default function DOOHAdvertisingDubai() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "DOOH Advertising Dubai",
    "provider": {
      "@type": "Organization",
      "name": "BeyondWalls",
      "url": "https://www.beyondwalls.ae"
    },
    "areaServed": "Dubai, UAE",
    "description": "Digital Out-of-Home advertising platform in Dubai with 500+ screens across premium venues."
  };

  const benefits = [
    { icon: Target, title: "Targeted Reach", desc: "Reach your audience in premium Dubai venues" },
    { icon: BarChart3, title: "Real-Time Analytics", desc: "Track impressions and performance live" },
    { icon: Zap, title: "Instant Activation", desc: "Go live within 30 minutes" },
    { icon: Shield, title: "Brand Safe", desc: "Premium venues only, no questionable placements" },
  ];

  const locations = [
    "Dubai Marina", "Downtown Dubai", "JBR", "Business Bay", 
    "DIFC", "Palm Jumeirah", "Dubai Mall Area", "JLT"
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="DOOH Advertising Dubai | Digital Out-of-Home Ads | BeyondWalls"
        description="Book DOOH advertising in Dubai on 500+ digital screens. Self-serve platform, real-time analytics, instant activation. Start from AED 99/week. #1 DOOH platform in UAE."
        keywords="DOOH advertising Dubai, digital out of home Dubai, DOOH screens Dubai, digital billboard Dubai, OOH advertising UAE, programmatic DOOH Dubai"
        canonical="https://www.beyondwalls.ae/dooh-advertising-dubai"
        structuredData={structuredData}
      />
      <PublicNav />

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-white/20 text-white border-0 mb-4">
                🇦🇪 #1 DOOH Platform in Dubai
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                DOOH Advertising in Dubai
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Reach millions of consumers on <strong>500+ digital screens</strong> across Dubai's premium venues. 
                Self-serve booking, real-time analytics, no long-term contracts.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to={createPageUrl("Register")}>
                  <Button size="lg" className="bg-white text-violet-600 hover:bg-slate-100 h-14 px-8">
                    Start Advertising
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to={createPageUrl("ScreenLocations")}>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 h-14 px-8">
                    View Screen Locations
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <img 
                src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop" 
                alt="Dubai skyline with digital advertising"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold text-violet-400">500+</p>
            <p className="text-slate-400">Screens in Dubai</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-violet-400">2M+</p>
            <p className="text-slate-400">Daily Impressions</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-violet-400">AED 99</p>
            <p className="text-slate-400">Starting Price/Week</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-violet-400">30min</p>
            <p className="text-slate-400">Go Live Time</p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Why Choose BeyondWalls for DOOH in Dubai?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              The most advanced digital out-of-home advertising platform in the UAE
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-7 h-7 text-violet-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-slate-600">{benefit.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              DOOH Screens Across Dubai
            </h2>
            <p className="text-lg text-slate-600">
              Premium screen locations in Dubai's busiest areas
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {locations.map((loc, i) => (
              <Badge key={i} variant="secondary" className="px-4 py-2 text-base">
                <MapPin className="w-4 h-4 mr-2" />
                {loc}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-violet-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Launch Your DOOH Campaign in Dubai?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join 100+ businesses already advertising with BeyondWalls
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-violet-600 hover:bg-slate-100 h-14 px-8">
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}