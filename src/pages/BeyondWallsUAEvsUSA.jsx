import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  MonitorPlay, ArrowRight, CheckCircle2, MapPin, Building2,
  Palette, Zap, Globe, Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";

export default function BeyondWallsUAEvsUSA() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "BeyondWalls UAE vs BeyondWalls USA - Two Different Companies",
    "description": "Learn the difference between BeyondWalls.ae (Dubai DOOH advertising) and BeyondWalls.com (Boston street art). Two separate companies with the same name.",
    "author": {
      "@type": "Organization",
      "name": "BeyondWalls UAE"
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="BeyondWalls UAE vs BeyondWalls USA | Dubai Digital Advertising vs Boston Street Art"
        description="BeyondWalls.ae is UAE's #1 DOOH advertising platform in Dubai. BeyondWalls.com is a Boston street art company. Learn the difference between these two companies."
        keywords="BeyondWalls UAE, BeyondWalls Dubai, BeyondWalls.ae, BeyondWalls.com difference, Dubai advertising company, BeyondWalls comparison"
        canonical="https://www.beyondwalls.ae/beyondwalls-uae-vs-usa"
        structuredData={structuredData}
      />
      <PublicNav />

      {/* Hero */}
      <section className="pt-28 pb-16 px-6 bg-gradient-to-br from-violet-50 via-white to-indigo-50">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-amber-100 text-amber-700 border-0 mb-4">
            ℹ️ Company Comparison
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            BeyondWalls UAE 🇦🇪 vs BeyondWalls USA 🇺🇸
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            <strong>Two different companies</strong> with the same name. 
            We are <span className="text-violet-600 font-semibold">BeyondWalls.ae</span> - UAE's leading digital advertising platform based in Dubai.
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* UAE Card */}
            <Card className="border-2 border-violet-500 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3">
                  <span className="text-2xl">🇦🇪</span>
                  BeyondWalls UAE
                </CardTitle>
                <p className="text-violet-100">beyondwalls.ae</p>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-violet-600 mt-1" />
                  <div>
                    <p className="font-semibold">Based in Dubai, UAE</p>
                    <p className="text-sm text-slate-500">in5 Tech, Dubai Internet City</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MonitorPlay className="w-5 h-5 text-violet-600 mt-1" />
                  <div>
                    <p className="font-semibold">Digital Advertising Platform</p>
                    <p className="text-sm text-slate-500">DOOH screens in cafés, malls, gyms</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-violet-600 mt-1" />
                  <div>
                    <p className="font-semibold">Serving UAE Businesses</p>
                    <p className="text-sm text-slate-500">500+ screens across Emirates</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-violet-600 mt-1" />
                  <div>
                    <p className="font-semibold">AI-Powered Technology</p>
                    <p className="text-sm text-slate-500">Self-serve ad booking platform</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* USA Card */}
            <Card className="border border-slate-200">
              <CardHeader className="bg-slate-100 rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-slate-700">
                  <span className="text-2xl">🇺🇸</span>
                  BeyondWalls USA
                </CardTitle>
                <p className="text-slate-500">beyondwalls.com</p>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-500 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-700">Based in Boston, USA</p>
                    <p className="text-sm text-slate-500">Massachusetts, United States</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Palette className="w-5 h-5 text-slate-500 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-700">Street Art Organization</p>
                    <p className="text-sm text-slate-500">Public murals and art installations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-slate-500 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-700">Serving US Communities</p>
                    <p className="text-sm text-slate-500">Community art projects</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Palette className="w-5 h-5 text-slate-500 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-700">Art Curation</p>
                    <p className="text-sm text-slate-500">Mural festivals and exhibitions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Differences */}
          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
            <h2 className="font-bold text-lg text-amber-800 mb-4">🔑 Key Takeaway</h2>
            <p className="text-amber-900">
              If you're looking for <strong>digital advertising screens in Dubai or UAE</strong>, 
              you're in the right place! <strong>BeyondWalls.ae</strong> is your local partner for 
              DOOH advertising across the Emirates.
            </p>
            <p className="text-amber-700 mt-3 text-sm">
              The US company (beyondwalls.com) focuses on street art in Boston and has no connection to our UAE advertising business.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-violet-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Looking for Digital Advertising in UAE?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            You're in the right place! Start advertising on 500+ screens across Dubai and UAE.
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-violet-600 hover:bg-slate-100 h-14 px-8">
              Get Started with BeyondWalls UAE
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}