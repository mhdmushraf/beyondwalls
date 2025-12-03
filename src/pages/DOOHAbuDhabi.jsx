import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MonitorPlay, ArrowRight, MapPin, Building2, Coffee, ShoppingBag, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";

export default function DOOHAbuDhabi() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "BeyondWalls Abu Dhabi",
    "address": { "@type": "PostalAddress", "addressLocality": "Abu Dhabi", "addressCountry": "AE" },
    "geo": { "@type": "GeoCoordinates", "latitude": 24.4539, "longitude": 54.3773 },
    "priceRange": "AED 79-400",
    "telephone": "+971556140067"
  };

  const areas = [
    { icon: ShoppingBag, name: "Yas Mall & Yas Island", screens: "35+", footfall: "150,000/day" },
    { icon: Landmark, name: "Corniche Area", screens: "20+", footfall: "80,000/day" },
    { icon: Building2, name: "Al Maryah Island", screens: "15", footfall: "50,000/day" },
    { icon: Coffee, name: "Abu Dhabi Mall Area", screens: "25+", footfall: "100,000/day" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="DOOH Advertising Abu Dhabi | Yas Mall, Corniche & Al Maryah Screens | BeyondWalls"
        description="Book DOOH advertising in Abu Dhabi. 100+ screens at Yas Island, Corniche, Al Maryah Island. Reach 400,000+ daily visitors in UAE's capital. BeyondWalls platform."
        keywords="DOOH Abu Dhabi, Abu Dhabi advertising screens, Yas Mall digital ads, Corniche advertising, Al Maryah Island screens, Abu Dhabi digital signage"
        canonical="https://www.beyondwalls.ae/dooh-abu-dhabi"
        structuredData={structuredData}
      />
      <PublicNav />

      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=1200&fit=crop" alt="Abu Dhabi skyline" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <Badge className="bg-white/20 text-white border-0 mb-4">
            <MapPin className="w-4 h-4 mr-1" /> Abu Dhabi - UAE Capital
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">DOOH Advertising in Abu Dhabi</h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl">
            Reach <strong>400,000+ daily visitors</strong> in UAE's capital city. 
            100+ digital screens at Yas Island, Corniche, Al Maryah Island, and major malls.
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100 h-14 px-8">
              Book Abu Dhabi Screens <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><p className="text-4xl font-bold text-emerald-400">100+</p><p className="text-slate-400">Abu Dhabi Screens</p></div>
          <div><p className="text-4xl font-bold text-emerald-400">400K+</p><p className="text-slate-400">Daily Reach</p></div>
          <div><p className="text-4xl font-bold text-emerald-400">AED 79</p><p className="text-slate-400">Starting Price</p></div>
          <div><p className="text-4xl font-bold text-emerald-400">4</p><p className="text-slate-400">Key Districts</p></div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Abu Dhabi Screen Locations</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {areas.map((area, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <area.icon className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{area.name}</h3>
                    <p className="text-sm text-emerald-600">{area.screens} screens</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{area.footfall}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Why Advertise in Abu Dhabi?</h2>
          <div className="prose prose-lg max-w-none text-slate-600">
            <p><strong>Abu Dhabi</strong> is the UAE's capital and wealthiest emirate, home to government entities, oil companies, and high-net-worth residents. The city offers access to a <strong>premium, affluent audience</strong> different from Dubai's tourist-heavy demographics.</p>
            <p>Key advertising opportunities: <strong>Yas Island</strong> (entertainment hub), <strong>Corniche</strong> (leisure & families), <strong>Al Maryah Island</strong> (business district), and major shopping centers.</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Advertise in Abu Dhabi?</h2>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100 h-14 px-8">
              Get Started - From AED 79/week <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}