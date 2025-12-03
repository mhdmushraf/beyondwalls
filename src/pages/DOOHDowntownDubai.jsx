import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MonitorPlay, ArrowRight, MapPin, Building2, Coffee, ShoppingBag, Hotel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";

export default function DOOHDowntownDubai() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "BeyondWalls Downtown Dubai",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Downtown Dubai",
      "addressLocality": "Dubai",
      "addressCountry": "AE"
    },
    "geo": { "@type": "GeoCoordinates", "latitude": 25.1972, "longitude": 55.2744 },
    "priceRange": "AED 99-500",
    "telephone": "+971556140067"
  };

  const venues = [
    { icon: ShoppingBag, name: "Dubai Mall Area", screens: "30+", footfall: "500,000/day" },
    { icon: Hotel, name: "Boulevard Hotels", screens: "15", footfall: "50,000/day" },
    { icon: Coffee, name: "Downtown Cafés", screens: "20+", footfall: "100,000/day" },
    { icon: Building2, name: "Business Bay Offices", screens: "25", footfall: "80,000/day" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="DOOH Advertising Downtown Dubai | Dubai Mall & Burj Khalifa Area | BeyondWalls"
        description="Book DOOH ads in Downtown Dubai near Burj Khalifa & Dubai Mall. 90+ screens reaching 750,000+ daily visitors. Premium locations, instant booking. BeyondWalls UAE."
        keywords="DOOH Downtown Dubai, Dubai Mall advertising, Burj Khalifa digital ads, Downtown Dubai screens, Business Bay advertising, Boulevard advertising Dubai"
        canonical="https://www.beyondwalls.ae/dooh-downtown-dubai"
        structuredData={structuredData}
      />
      <PublicNav />

      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&fit=crop" alt="Burj Khalifa Downtown Dubai" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <Badge className="bg-white/20 text-white border-0 mb-4">
            <MapPin className="w-4 h-4 mr-1" /> Downtown Dubai
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">DOOH Advertising in Downtown Dubai</h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl">
            Advertise at the heart of Dubai - near <strong>Burj Khalifa</strong> and <strong>Dubai Mall</strong>. 
            Reach <strong>750,000+ daily visitors</strong> in the world's most iconic destination.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to={createPageUrl("Register")}>
              <Button size="lg" className="bg-white text-orange-600 hover:bg-slate-100 h-14 px-8">
                Book Downtown Screens <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><p className="text-4xl font-bold text-orange-400">90+</p><p className="text-slate-400">Downtown Screens</p></div>
          <div><p className="text-4xl font-bold text-orange-400">750K+</p><p className="text-slate-400">Daily Visitors</p></div>
          <div><p className="text-4xl font-bold text-orange-400">#1</p><p className="text-slate-400">Tourist Destination</p></div>
          <div><p className="text-4xl font-bold text-orange-400">AED 149</p><p className="text-slate-400">Starting Price</p></div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Downtown Dubai Screen Locations</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {venues.map((venue, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                    <venue.icon className="w-7 h-7 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{venue.name}</h3>
                    <p className="text-sm text-orange-600">{venue.screens} screens</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Footfall</p>
                    <p className="font-semibold text-slate-900">{venue.footfall}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Why Advertise in Downtown Dubai?</h2>
          <div className="prose prose-lg max-w-none text-slate-600">
            <p><strong>Downtown Dubai</strong> is the beating heart of the city, home to the world's tallest building and largest mall. With <strong>750,000+ daily visitors</strong>, it offers unmatched exposure for brands targeting tourists, luxury shoppers, and business professionals.</p>
            <p>BeyondWalls provides <strong>90+ digital screens</strong> in strategic locations including Dubai Mall surroundings, Boulevard cafés, Business Bay offices, and premium hotels. Perfect for luxury brands, tourism, retail, and F&B businesses.</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Advertise in Downtown Dubai?</h2>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-orange-600 hover:bg-slate-100 h-14 px-8">
              Get Started - From AED 149/week <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}