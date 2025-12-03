import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MonitorPlay, ArrowRight, MapPin, Coffee, ShoppingBag, Waves, Hotel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";

export default function DOOHJBRDubai() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "BeyondWalls JBR Dubai",
    "address": { "@type": "PostalAddress", "streetAddress": "Jumeirah Beach Residence", "addressLocality": "Dubai", "addressCountry": "AE" },
    "geo": { "@type": "GeoCoordinates", "latitude": 25.0772, "longitude": 55.1330 },
    "priceRange": "AED 99-400",
    "telephone": "+971556140067"
  };

  const venues = [
    { icon: Waves, name: "The Walk JBR", screens: "25+", footfall: "120,000/day" },
    { icon: Coffee, name: "JBR Beachfront Cafés", screens: "15", footfall: "50,000/day" },
    { icon: Hotel, name: "JBR Hotels & Resorts", screens: "12", footfall: "30,000/day" },
    { icon: ShoppingBag, name: "The Beach Mall", screens: "18", footfall: "80,000/day" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="DOOH Advertising JBR Dubai | The Walk & Beach Screens | BeyondWalls"
        description="Book DOOH ads at JBR The Walk Dubai. 70+ screens reaching 280,000+ daily beachgoers & tourists. Premium beachfront advertising from AED 99/week. BeyondWalls UAE."
        keywords="DOOH JBR Dubai, The Walk JBR advertising, JBR beach screens, Jumeirah Beach Residence ads, JBR digital signage, beachfront advertising Dubai"
        canonical="https://www.beyondwalls.ae/dooh-jbr-dubai"
        structuredData={structuredData}
      />
      <PublicNav />

      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-sky-500 via-blue-500 to-cyan-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&fit=crop" alt="JBR Beach Dubai" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <Badge className="bg-white/20 text-white border-0 mb-4"><MapPin className="w-4 h-4 mr-1" /> JBR - The Walk</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">DOOH Advertising at JBR Dubai</h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl">
            Reach <strong>280,000+ daily visitors</strong> at Dubai's most popular beach destination. 
            70+ screens along The Walk, beachfront cafés, and luxury hotels.
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-sky-600 hover:bg-slate-100 h-14 px-8">
              Book JBR Screens <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><p className="text-4xl font-bold text-sky-400">70+</p><p className="text-slate-400">JBR Screens</p></div>
          <div><p className="text-4xl font-bold text-sky-400">280K+</p><p className="text-slate-400">Daily Visitors</p></div>
          <div><p className="text-4xl font-bold text-sky-400">80%</p><p className="text-slate-400">Tourists</p></div>
          <div><p className="text-4xl font-bold text-sky-400">AED 99</p><p className="text-slate-400">Starting Price</p></div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">JBR Screen Locations</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {venues.map((venue, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-14 h-14 bg-sky-100 rounded-xl flex items-center justify-center">
                    <venue.icon className="w-7 h-7 text-sky-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{venue.name}</h3>
                    <p className="text-sm text-sky-600">{venue.screens} screens</p>
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
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Why Advertise at JBR?</h2>
          <div className="prose prose-lg max-w-none text-slate-600">
            <p><strong>JBR (Jumeirah Beach Residence)</strong> is Dubai's premier beachfront destination, attracting tourists, residents, and families year-round. The Walk promenade features restaurants, shops, and entertainment venues with <strong>high dwell time</strong>.</p>
            <p>Perfect for: <strong>Tourism, hospitality, F&B, lifestyle brands, suncare products, and entertainment</strong>. Peak season: October-April with 500,000+ daily visitors.</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-r from-sky-500 to-cyan-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Advertise at JBR?</h2>
          <Link to={createPageUrl("Register")}><Button size="lg" className="bg-white text-sky-600 hover:bg-slate-100 h-14 px-8">Get Started <ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}