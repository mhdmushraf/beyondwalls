import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MonitorPlay, ArrowRight, Tv2, Eye, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";

export default function DigitalBillboardDubai() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Digital Billboard Advertising Dubai",
    "provider": { "@type": "Organization", "name": "BeyondWalls", "url": "https://www.beyondwalls.ae" },
    "areaServed": "Dubai, UAE"
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Digital Billboard Advertising Dubai | Indoor Digital Screens | BeyondWalls"
        description="Book digital billboard advertising in Dubai. 500+ indoor digital screens across venues. More affordable than outdoor billboards. Self-serve platform from AED 99/week."
        keywords="digital billboard Dubai, indoor billboard advertising, digital screens Dubai, LED advertising Dubai, electronic billboard UAE, digital display advertising"
        canonical="https://www.beyondwalls.ae/digital-billboard-dubai"
        structuredData={structuredData}
      />
      <PublicNav />

      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white">
        <div className="max-w-6xl mx-auto">
          <Badge className="bg-white/20 text-white border-0 mb-4"><Tv2 className="w-4 h-4 mr-1" /> Digital Billboards</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Digital Billboard Advertising in Dubai</h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl">
            <strong>Indoor digital billboards</strong> at a fraction of outdoor costs. 500+ screens in high-traffic venues. 
            Self-serve booking, instant activation, real-time analytics.
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-violet-600 hover:bg-slate-100 h-14 px-8">
              Book Digital Billboards <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><p className="text-4xl font-bold text-violet-400">500+</p><p className="text-slate-400">Digital Screens</p></div>
          <div><p className="text-4xl font-bold text-violet-400">90%</p><p className="text-slate-400">Cost Savings</p></div>
          <div><p className="text-4xl font-bold text-violet-400">30min</p><p className="text-slate-400">Go Live Time</p></div>
          <div><p className="text-4xl font-bold text-violet-400">AED 99</p><p className="text-slate-400">Starting Price</p></div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Digital Billboards vs Traditional Outdoor</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 border-violet-500">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-violet-600 mb-4">BeyondWalls Indoor Screens</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2"><Zap className="w-5 h-5 text-green-500" /> From AED 99/week</li>
                  <li className="flex items-center gap-2"><Zap className="w-5 h-5 text-green-500" /> No contracts</li>
                  <li className="flex items-center gap-2"><Zap className="w-5 h-5 text-green-500" /> Go live in 30 minutes</li>
                  <li className="flex items-center gap-2"><Zap className="w-5 h-5 text-green-500" /> Real-time analytics</li>
                  <li className="flex items-center gap-2"><Zap className="w-5 h-5 text-green-500" /> Self-serve booking</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border border-slate-200">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg text-slate-500 mb-4">Traditional Outdoor Billboards</h3>
                <ul className="space-y-3 text-slate-500">
                  <li>AED 50,000+ per month</li>
                  <li>6-12 month contracts</li>
                  <li>Weeks of setup time</li>
                  <li>No tracking or analytics</li>
                  <li>Agency middlemen required</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-r from-violet-600 to-fuchsia-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready for Affordable Digital Billboards?</h2>
          <Link to={createPageUrl("Register")}><Button size="lg" className="bg-white text-violet-600 hover:bg-slate-100 h-14 px-8">Get Started <ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}