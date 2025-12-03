import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MonitorPlay, ArrowRight, Building2, Globe, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";

export default function DOOHExpoCity() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "BeyondWalls Expo City Dubai",
    "address": { "@type": "PostalAddress", "streetAddress": "Expo City Dubai", "addressLocality": "Dubai", "addressCountry": "AE" },
    "geo": { "@type": "GeoCoordinates", "latitude": 24.9600, "longitude": 55.1550 },
    "priceRange": "AED 149-500",
    "telephone": "+971556140067"
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Expo City Dubai Advertising | DOOH Screens at Expo 2020 Legacy | BeyondWalls"
        description="Advertise at Expo City Dubai - the legacy of Expo 2020. Reach visitors at events, exhibitions & conferences. Premium DOOH screens from AED 149/week. BeyondWalls."
        keywords="Expo City Dubai advertising, Expo 2020 advertising, Dubai Expo screens, exhibition advertising Dubai, conference advertising UAE, Expo City DOOH"
        canonical="https://www.beyondwalls.ae/dooh-expo-city"
        structuredData={structuredData}
      />
      <PublicNav />

      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute top-10 right-10 text-8xl opacity-20">🌍</div>
        <div className="max-w-6xl mx-auto relative z-10">
          <Badge className="bg-white/20 text-white border-0 mb-4"><Globe className="w-4 h-4 mr-1" /> Expo City Dubai</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Advertise at Expo City Dubai</h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl">
            The <strong>legacy of Expo 2020</strong>. World-class events, exhibitions, and conferences. Reach international and local visitors in Dubai's premier event destination.
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-slate-100 h-14 px-8">
              Book Expo City Screens <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><p className="text-4xl font-bold text-indigo-400">25+</p><p className="text-slate-400">Expo Screens</p></div>
          <div><p className="text-4xl font-bold text-indigo-400">100+</p><p className="text-slate-400">Annual Events</p></div>
          <div><p className="text-4xl font-bold text-indigo-400">Global</p><p className="text-slate-400">Audience Reach</p></div>
          <div><p className="text-4xl font-bold text-indigo-400">AED 149</p><p className="text-slate-400">Starting Price</p></div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Expo City Venues</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Building2, title: "Dubai Exhibition Centre", desc: "Major trade shows" },
              { icon: Users, title: "Al Wasl Plaza", desc: "Large gatherings" },
              { icon: Globe, title: "Terra Pavilion", desc: "Sustainability events" },
              { icon: Sparkles, title: "Jubilee Stage", desc: "Entertainment & concerts" },
            ].map((v, i) => (
              <Card key={i} className="border-0 shadow-lg text-center">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <v.icon className="w-7 h-7 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{v.title}</h3>
                  <p className="text-sm text-slate-600">{v.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Advertise at World-Class Events</h2>
          <Link to={createPageUrl("Register")}><Button size="lg" className="bg-white text-indigo-600 hover:bg-slate-100 h-14 px-8">Get Started <ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}