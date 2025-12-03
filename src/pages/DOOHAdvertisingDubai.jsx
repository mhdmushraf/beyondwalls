import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  MonitorPlay, ArrowRight, Target, TrendingUp, Building2, CheckCircle2,
  MapPin, DollarSign, Clock, BarChart3, Zap, Shield, Users, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";

export default function DOOHAdvertisingDubai() {
  const benefits = [
    { icon: Target, title: "Precision Targeting", desc: "Target specific locations in Dubai Marina, JBR, Downtown, DIFC, and more" },
    { icon: Clock, title: "Go Live in 30 Minutes", desc: "Instant campaign activation on screens across Dubai" },
    { icon: BarChart3, title: "Real-time Analytics", desc: "Track impressions and ROI from Dubai venues live" },
    { icon: DollarSign, title: "From AED 99/week", desc: "Affordable Dubai advertising for SMEs and enterprises" },
    { icon: Shield, title: "Premium Dubai Venues", desc: "Screens in Dubai Mall, Marina Mall, JBR, and top locations" },
    { icon: Zap, title: "AI-Powered Optimization", desc: "Let AI optimize your Dubai ad campaigns automatically" }
  ];

  const dubaiLocations = [
    "Dubai Marina", "JBR", "Downtown Dubai", "DIFC", "Business Bay",
    "Dubai Mall", "Mall of Emirates", "Dubai Hills", "JLT", "Palm Jumeirah"
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "DOOH Advertising Dubai",
    "provider": {
      "@type": "Organization",
      "name": "BeyondWalls UAE",
      "url": "https://www.beyondwalls.ae"
    },
    "serviceType": "Digital Out-of-Home Advertising",
    "areaServed": {
      "@type": "City",
      "name": "Dubai",
      "containedInPlace": {
        "@type": "Country",
        "name": "United Arab Emirates"
      }
    },
    "description": "Book digital advertising screens in Dubai cafés, malls, gyms, and coworking spaces. Self-serve DOOH platform. Start from AED 99/week.",
    "offers": {
      "@type": "Offer",
      "priceCurrency": "AED",
      "price": "99",
      "priceValidUntil": "2026-12-31"
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="DOOH Advertising Dubai | Digital Screen Advertising | BeyondWalls UAE"
        description="Book digital advertising screens across Dubai - Marina, Downtown, DIFC, JBR. UAE's #1 self-serve DOOH platform. Start from AED 99/week. 500+ screens in Dubai venues."
        keywords="DOOH advertising Dubai, digital advertising Dubai, screen advertising Dubai, digital signage Dubai, billboard advertising Dubai, outdoor advertising Dubai, advertising screens Dubai, mall advertising Dubai, café advertising Dubai"
        canonical="https://www.beyondwalls.ae/dooh-advertising-dubai"
        structuredData={structuredData}
      />
      <PublicNav />

      {/* Hero */}
      <section className="pt-28 pb-16 px-6 bg-gradient-to-br from-violet-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-violet-100 text-violet-700 border-0 mb-4">
                🇦🇪 Dubai's #1 DOOH Platform
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                DOOH Advertising in
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent"> Dubai </span>
              </h1>
              <p className="text-xl text-slate-600 mb-8">
                Book digital advertising screens across Dubai's premium venues. 
                From <strong>Dubai Marina to Downtown</strong>, reach your customers where they work, dine, and shop.
              </p>
              
              <div className="flex flex-wrap gap-2 mb-8">
                {dubaiLocations.slice(0, 6).map((loc, i) => (
                  <Badge key={i} variant="outline" className="text-slate-600">
                    <MapPin className="w-3 h-3 mr-1" />
                    {loc}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={createPageUrl("Register")}>
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 h-14 px-8">
                    Start Advertising in Dubai
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to={createPageUrl("ScreenLocations")}>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8">
                    View Dubai Screens
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop&q=80"
                alt="Dubai skyline with digital advertising opportunities"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-xl">
                <p className="text-2xl font-bold text-violet-600">500+</p>
                <p className="text-sm text-slate-600">Screens in Dubai</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Why Choose BeyondWalls for Dubai Advertising?
            </h2>
            <p className="text-xl text-slate-600">
              The easiest way to advertise on digital screens across Dubai
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <Card key={i} className="border-0 shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                    <b.icon className="w-6 h-6 text-violet-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{b.title}</h3>
                  <p className="text-slate-600">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dubai Locations */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Digital Advertising Screens Across Dubai
            </h2>
            <p className="text-xl text-slate-600">
              Premium locations in every Dubai district
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {dubaiLocations.map((loc, i) => (
              <div key={i} className="bg-white rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-all">
                <MapPin className="w-6 h-6 text-violet-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-900">{loc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-violet-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Advertise in Dubai?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join 100+ Dubai businesses using BeyondWalls for digital advertising
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-violet-600 hover:bg-slate-100 h-14 px-8">
              Get Started - From AED 99/week
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}