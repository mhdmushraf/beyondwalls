import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MonitorPlay, ArrowRight, MapPin, ShoppingBag, Coffee, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";

export default function DOOHDubaiMall() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "BeyondWalls Dubai Mall Area",
    "address": { "@type": "PostalAddress", "streetAddress": "Dubai Mall", "addressLocality": "Dubai", "addressCountry": "AE" },
    "geo": { "@type": "GeoCoordinates", "latitude": 25.1972, "longitude": 55.2796 },
    "priceRange": "AED 149-600",
    "telephone": "+971556140067"
  };

  const venues = [
    { icon: ShoppingBag, name: "Dubai Mall Surroundings", screens: "40+", footfall: "300,000/day" },
    { icon: Coffee, name: "Souk Al Bahar", screens: "15", footfall: "80,000/day" },
    { icon: Utensils, name: "Food Court Area", screens: "20", footfall: "150,000/day" },
    { icon: ShoppingBag, name: "Fashion Avenue Exit", screens: "12", footfall: "100,000/day" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="DOOH Advertising Dubai Mall | World's Largest Mall Screens | BeyondWalls"
        description="Advertise near Dubai Mall - world's most visited destination. 87+ screens reaching 630,000+ daily shoppers. Premium retail advertising from AED 149/week. BeyondWalls."
        keywords="DOOH Dubai Mall, Dubai Mall advertising, mall advertising Dubai, retail advertising UAE, shopping mall screens Dubai, Dubai Mall digital ads"
        canonical="https://www.beyondwalls.ae/dooh-dubai-mall"
        structuredData={structuredData}
      />
      <PublicNav />

      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 text-white relative">
        <div className="max-w-6xl mx-auto">
          <Badge className="bg-white/20 text-white border-0 mb-4"><MapPin className="w-4 h-4 mr-1" /> Dubai Mall Area</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">DOOH Advertising at Dubai Mall</h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl">
            Advertise at the <strong>world's most visited destination</strong>. 87+ screens reaching <strong>630,000+ daily visitors</strong>. 
            Premium exposure near the world's largest shopping mall.
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-rose-600 hover:bg-slate-100 h-14 px-8">
              Book Dubai Mall Screens <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><p className="text-4xl font-bold text-rose-400">87+</p><p className="text-slate-400">Screens</p></div>
          <div><p className="text-4xl font-bold text-rose-400">630K+</p><p className="text-slate-400">Daily Visitors</p></div>
          <div><p className="text-4xl font-bold text-rose-400">#1</p><p className="text-slate-400">Global Destination</p></div>
          <div><p className="text-4xl font-bold text-rose-400">AED 149</p><p className="text-slate-400">Starting Price</p></div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Dubai Mall Area Screens</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {venues.map((venue, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-14 h-14 bg-rose-100 rounded-xl flex items-center justify-center">
                    <venue.icon className="w-7 h-7 text-rose-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{venue.name}</h3>
                    <p className="text-sm text-rose-600">{venue.screens} screens</p>
                  </div>
                  <p className="font-semibold text-slate-900">{venue.footfall}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Why Advertise at Dubai Mall?</h2>
          <div className="prose prose-lg max-w-none text-slate-600">
            <p><strong>Dubai Mall</strong> welcomes over 80 million visitors annually, making it the world's most visited destination. The surrounding areas offer premium advertising opportunities targeting <strong>shoppers, tourists, and luxury consumers</strong>.</p>
            <p>Perfect for: <strong>Retail brands, luxury goods, fashion, electronics, F&B, entertainment, and tourism</strong>.</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-r from-rose-500 to-fuchsia-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Advertise at Dubai Mall?</h2>
          <Link to={createPageUrl("Register")}><Button size="lg" className="bg-white text-rose-600 hover:bg-slate-100 h-14 px-8">Get Started <ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}