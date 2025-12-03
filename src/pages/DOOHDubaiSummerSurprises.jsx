import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MonitorPlay, ArrowRight, Sun, ShoppingBag, Percent, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";

export default function DOOHDubaiSummerSurprises() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Dubai Summer Surprises 2025 Advertising",
    "startDate": "2025-06-28",
    "endDate": "2025-09-03",
    "location": { "@type": "Place", "name": "Dubai, UAE" },
    "organizer": { "@type": "Organization", "name": "BeyondWalls", "url": "https://www.beyondwalls.ae" }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Dubai Summer Surprises 2025 Advertising | DSS DOOH Screens | BeyondWalls"
        description="Advertise during Dubai Summer Surprises 2025. Reach shoppers in air-conditioned malls & indoor venues. 10 weeks of summer promotions. DOOH advertising from AED 99."
        keywords="Dubai Summer Surprises advertising, DSS 2025 ads, summer advertising Dubai, Dubai summer sales ads, DSS marketing, summer DOOH Dubai"
        canonical="https://www.beyondwalls.ae/dooh-dubai-summer-surprises"
        structuredData={structuredData}
      />
      <PublicNav />

      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 text-white relative overflow-hidden">
        <div className="absolute top-10 right-10 text-8xl opacity-20">☀️</div>
        <div className="max-w-6xl mx-auto relative z-10">
          <Badge className="bg-white/20 text-white border-0 mb-4"><Sun className="w-4 h-4 mr-1" /> June - September</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Dubai Summer Surprises 2025</h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl">
            <strong>10 weeks of summer shopping!</strong> Reach families in air-conditioned malls, entertainment venues, and indoor destinations during Dubai's biggest summer festival.
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-orange-600 hover:bg-slate-100 h-14 px-8">
              Book DSS Campaign <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><p className="text-4xl font-bold text-yellow-400">10 Weeks</p><p className="text-slate-400">Festival Duration</p></div>
          <div><p className="text-4xl font-bold text-yellow-400">70%</p><p className="text-slate-400">Mall Foot Traffic Increase</p></div>
          <div><p className="text-4xl font-bold text-yellow-400">500+</p><p className="text-slate-400">Indoor Screens</p></div>
          <div><p className="text-4xl font-bold text-yellow-400">AED 99</p><p className="text-slate-400">Starting Price</p></div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Why DSS is Perfect for Advertising</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShoppingBag, title: "Massive Sales", desc: "Up to 90% discounts" },
              { icon: Sun, title: "Indoor Focus", desc: "Escape the heat = more mall time" },
              { icon: Gift, title: "Raffles & Prizes", desc: "High engagement period" },
              { icon: Percent, title: "Spending Spike", desc: "Family entertainment budgets" },
            ].map((b, i) => (
              <Card key={i} className="border-0 shadow-lg text-center">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <b.icon className="w-7 h-7 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{b.title}</h3>
                  <p className="text-sm text-slate-600">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-r from-yellow-500 to-orange-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Summer is Coming! ☀️</h2>
          <Link to={createPageUrl("Register")}><Button size="lg" className="bg-white text-orange-600 hover:bg-slate-100 h-14 px-8">Book Now <ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}