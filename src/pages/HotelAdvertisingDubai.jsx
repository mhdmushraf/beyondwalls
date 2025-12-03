import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MonitorPlay, ArrowRight, Hotel, Plane, CreditCard, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";

export default function HotelAdvertisingDubai() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Hotel Advertising Dubai",
    "provider": { "@type": "Organization", "name": "BeyondWalls", "url": "https://www.beyondwalls.ae" },
    "areaServed": "Dubai, UAE"
  };

  const benefits = [
    { icon: Plane, title: "Tourist Audience", desc: "International travelers & business visitors" },
    { icon: CreditCard, title: "High Spending Power", desc: "Luxury travelers with disposable income" },
    { icon: Star, title: "Premium Environment", desc: "5-star and 4-star hotel lobbies" },
    { icon: Hotel, title: "Captive Audience", desc: "Check-in/out & waiting areas" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Hotel Advertising Dubai | Hotel Lobby Digital Screens | BeyondWalls"
        description="Advertise in Dubai hotel lobbies. 50+ screens in 4-5 star hotels. Reach tourists & business travelers. Premium hospitality advertising from AED 129/week. BeyondWalls."
        keywords="hotel advertising Dubai, hotel lobby screens UAE, hospitality advertising Dubai, tourism advertising UAE, hotel digital signage, Dubai hotel marketing"
        canonical="https://www.beyondwalls.ae/hotel-advertising-dubai"
        structuredData={structuredData}
      />
      <PublicNav />

      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-yellow-600 via-amber-500 to-orange-500 text-white">
        <div className="max-w-6xl mx-auto">
          <Badge className="bg-white/20 text-white border-0 mb-4"><Hotel className="w-4 h-4 mr-1" /> Hotel Advertising</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Hotel Advertising in Dubai</h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl">
            Reach <strong>international tourists and business travelers</strong>. 50+ screens in Dubai's premium hotel lobbies with high-spending audiences.
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-amber-600 hover:bg-slate-100 h-14 px-8">
              Book Hotel Screens <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><p className="text-4xl font-bold text-amber-400">50+</p><p className="text-slate-400">Hotel Screens</p></div>
          <div><p className="text-4xl font-bold text-amber-400">16M+</p><p className="text-slate-400">Annual Tourists</p></div>
          <div><p className="text-4xl font-bold text-amber-400">4-5⭐</p><p className="text-slate-400">Star Hotels</p></div>
          <div><p className="text-4xl font-bold text-amber-400">AED 129</p><p className="text-slate-400">Starting Price</p></div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Why Hotel Advertising Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <Card key={i} className="border-0 shadow-lg text-center">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <b.icon className="w-7 h-7 text-amber-600" />
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
            {["Tourism", "Airlines", "Car Rentals", "Luxury Retail", "Restaurants", "Entertainment", "Travel Apps"].map((cat, i) => (
              <Badge key={i} variant="secondary" className="px-4 py-2 text-base">{cat}</Badge>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-r from-amber-500 to-orange-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Advertise in Dubai Hotels?</h2>
          <Link to={createPageUrl("Register")}><Button size="lg" className="bg-white text-amber-600 hover:bg-slate-100 h-14 px-8">Get Started <ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}