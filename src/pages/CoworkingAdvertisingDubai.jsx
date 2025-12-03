import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MonitorPlay, ArrowRight, Building2, Users, Briefcase, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";

export default function CoworkingAdvertisingDubai() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Coworking Space Advertising Dubai",
    "provider": { "@type": "Organization", "name": "BeyondWalls", "url": "https://www.beyondwalls.ae" },
    "areaServed": "Dubai, UAE"
  };

  const benefits = [
    { icon: Users, title: "Entrepreneurs & Startups", desc: "Decision-makers and founders" },
    { icon: Briefcase, title: "B2B Audience", desc: "Perfect for SaaS & business services" },
    { icon: Zap, title: "Tech-Savvy", desc: "Early adopters and innovators" },
    { icon: Building2, title: "Premium Spaces", desc: "WeWork, Regus, DTEC & more" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Coworking Space Advertising Dubai | Startup & Business Screens | BeyondWalls"
        description="Advertise in Dubai coworking spaces. 60+ screens reaching entrepreneurs, startups & professionals. B2B advertising in WeWork, Regus, DTEC. From AED 89/week."
        keywords="coworking advertising Dubai, WeWork advertising UAE, startup advertising Dubai, B2B advertising UAE, coworking screens Dubai, business center advertising"
        canonical="https://www.beyondwalls.ae/coworking-advertising-dubai"
        structuredData={structuredData}
      />
      <PublicNav />

      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 text-white">
        <div className="max-w-6xl mx-auto">
          <Badge className="bg-white/20 text-white border-0 mb-4"><Building2 className="w-4 h-4 mr-1" /> Coworking Advertising</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Coworking Space Advertising in Dubai</h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl">
            Reach <strong>entrepreneurs, startups, and business professionals</strong>. 60+ screens in Dubai's top coworking spaces including WeWork, Regus, and DTEC.
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-slate-100 h-14 px-8">
              Book Coworking Screens <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><p className="text-4xl font-bold text-indigo-400">60+</p><p className="text-slate-400">Coworking Screens</p></div>
          <div><p className="text-4xl font-bold text-indigo-400">50K+</p><p className="text-slate-400">Daily Members</p></div>
          <div><p className="text-4xl font-bold text-indigo-400">8hrs</p><p className="text-slate-400">Daily Exposure</p></div>
          <div><p className="text-4xl font-bold text-indigo-400">AED 89</p><p className="text-slate-400">Starting Price</p></div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Why Coworking Advertising Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <Card key={i} className="border-0 shadow-lg text-center">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <b.icon className="w-7 h-7 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{b.title}</h3>
                  <p className="text-sm text-slate-600">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Ideal for These Brands</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["SaaS Tools", "Fintech", "Cloud Services", "Business Software", "HR Tech", "Marketing Tools", "Payment Solutions"].map((cat, i) => (
              <Badge key={i} variant="secondary" className="px-4 py-2 text-base">{cat}</Badge>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-r from-indigo-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Reach Dubai's Entrepreneurs?</h2>
          <Link to={createPageUrl("Register")}><Button size="lg" className="bg-white text-indigo-600 hover:bg-slate-100 h-14 px-8">Get Started <ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}