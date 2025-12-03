import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MonitorPlay, ArrowRight, ShoppingBag, Calendar, Percent, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";

export default function DOOHDubaiShoppingFestival() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Dubai Shopping Festival 2025 Advertising",
    "startDate": "2024-12-15",
    "endDate": "2025-01-26",
    "location": { "@type": "Place", "name": "Dubai, UAE" },
    "organizer": { "@type": "Organization", "name": "BeyondWalls", "url": "https://www.beyondwalls.ae" }
  };

  const benefits = [
    { icon: ShoppingBag, title: "Peak Shopping Season", desc: "Millions of shoppers across Dubai" },
    { icon: Percent, title: "High Purchase Intent", desc: "Consumers ready to spend" },
    { icon: Gift, title: "Festive Atmosphere", desc: "Maximum brand engagement" },
    { icon: Calendar, title: "6 Weeks Exposure", desc: "Extended campaign duration" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Dubai Shopping Festival 2025 Advertising | DSF DOOH Screens | BeyondWalls"
        description="Advertise during Dubai Shopping Festival 2025. Book DOOH screens across malls, cafés & venues. Reach millions of DSF shoppers. Premium festival advertising from AED 99/week."
        keywords="Dubai Shopping Festival advertising, DSF 2025 ads, Dubai Shopping Festival screens, DSF marketing, Dubai festival advertising, shopping festival DOOH"
        canonical="https://www.beyondwalls.ae/dooh-dubai-shopping-festival"
        structuredData={structuredData}
      />
      <PublicNav />

      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-red-600 via-pink-600 to-orange-500 text-white relative overflow-hidden">
        <div className="absolute top-10 right-10 text-8xl opacity-20">🛍️</div>
        <div className="max-w-6xl mx-auto relative z-10">
          <Badge className="bg-white/20 text-white border-0 mb-4"><Calendar className="w-4 h-4 mr-1" /> Dec 15 - Jan 26</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Dubai Shopping Festival 2025 Advertising</h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl">
            Capture <strong>millions of DSF shoppers</strong> with DOOH advertising. 500+ screens across malls, cafés, and high-traffic venues during Dubai's biggest retail event.
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-red-600 hover:bg-slate-100 h-14 px-8">
              Book DSF Campaign <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><p className="text-4xl font-bold text-red-400">5M+</p><p className="text-slate-400">DSF Visitors</p></div>
          <div><p className="text-4xl font-bold text-red-400">500+</p><p className="text-slate-400">Screens Available</p></div>
          <div><p className="text-4xl font-bold text-red-400">6 Weeks</p><p className="text-slate-400">Festival Duration</p></div>
          <div><p className="text-4xl font-bold text-red-400">AED 99</p><p className="text-slate-400">Starting Price</p></div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Why Advertise During DSF?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <Card key={i} className="border-0 shadow-lg text-center">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <b.icon className="w-7 h-7 text-red-600" />
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
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">DSF Hotspot Locations</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["Dubai Mall", "Mall of Emirates", "City Walk", "JBR The Walk", "Global Village", "Dubai Festival City", "Ibn Battuta Mall"].map((loc, i) => (
              <Badge key={i} variant="secondary" className="px-4 py-2 text-base">{loc}</Badge>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-r from-red-600 to-orange-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Don't Miss DSF 2025!</h2>
          <p className="text-white/90 mb-8">Book your screens now before prime slots sell out.</p>
          <Link to={createPageUrl("Register")}><Button size="lg" className="bg-white text-red-600 hover:bg-slate-100 h-14 px-8">Reserve Your Spots <ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}