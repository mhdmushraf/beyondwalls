import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MonitorPlay, ArrowRight, MapPin, Building2, Coffee, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";

export default function DOOHBusinessBay() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "BeyondWalls Business Bay",
    "address": { "@type": "PostalAddress", "streetAddress": "Business Bay", "addressLocality": "Dubai", "addressCountry": "AE" },
    "geo": { "@type": "GeoCoordinates", "latitude": 25.1850, "longitude": 55.2650 },
    "priceRange": "AED 119-500",
    "telephone": "+971556140067"
  };

  const venues = [
    { icon: Building2, name: "Bay Square", screens: "18", footfall: "40,000/day" },
    { icon: Coffee, name: "Business Bay Cafés", screens: "25+", footfall: "60,000/day" },
    { icon: Briefcase, name: "Office Tower Lobbies", screens: "30", footfall: "80,000/day" },
    { icon: Building2, name: "Executive Towers", screens: "15", footfall: "35,000/day" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="DOOH Advertising Business Bay Dubai | Office & Corporate Screens | BeyondWalls"
        description="Book DOOH ads in Business Bay Dubai. 88+ screens in office lobbies, Bay Square, cafés. Reach 215,000+ business professionals daily. B2B advertising from AED 119/week."
        keywords="DOOH Business Bay, Business Bay advertising Dubai, corporate advertising Dubai, office lobby screens, Bay Square digital ads, B2B advertising Dubai"
        canonical="https://www.beyondwalls.ae/dooh-business-bay"
        structuredData={structuredData}
      />
      <PublicNav />

      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <Badge className="bg-blue-500/20 text-blue-300 border-0 mb-4"><MapPin className="w-4 h-4 mr-1" /> Business Bay</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">DOOH Advertising in Business Bay</h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl">
            Target Dubai's <strong>business professionals</strong>. 88+ screens in office towers, Bay Square, and corporate cafés. 
            Reach <strong>215,000+ decision-makers</strong> daily.
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-blue-500 hover:bg-blue-600 h-14 px-8">
              Book Business Bay Screens <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-12 px-6 bg-blue-600 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><p className="text-4xl font-bold">88+</p><p>Screens</p></div>
          <div><p className="text-4xl font-bold">215K+</p><p>Daily Professionals</p></div>
          <div><p className="text-4xl font-bold">$80K+</p><p>Avg. Income</p></div>
          <div><p className="text-4xl font-bold">AED 119</p><p>Starting Price</p></div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Business Bay Screen Locations</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {venues.map((venue, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                    <venue.icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{venue.name}</h3>
                    <p className="text-sm text-blue-600">{venue.screens} screens</p>
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
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Why Advertise in Business Bay?</h2>
          <div className="prose prose-lg max-w-none text-slate-600">
            <p><strong>Business Bay</strong> is Dubai's fastest-growing commercial district with 240+ towers housing thousands of companies. The area attracts <strong>high-income professionals, entrepreneurs, and corporate decision-makers</strong>.</p>
            <p>Ideal for: <strong>B2B services, SaaS companies, financial services, real estate, recruitment, and corporate events</strong>.</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-r from-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Reach Business Bay?</h2>
          <Link to={createPageUrl("Register")}><Button size="lg" className="bg-blue-500 hover:bg-blue-600 h-14 px-8">Get Started <ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}