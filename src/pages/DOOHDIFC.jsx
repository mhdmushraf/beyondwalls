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

export default function DOOHDIFC() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "BeyondWalls DIFC",
    "address": { "@type": "PostalAddress", "streetAddress": "DIFC", "addressLocality": "Dubai", "addressCountry": "AE" },
    "geo": { "@type": "GeoCoordinates", "latitude": 25.2138, "longitude": 55.2796 },
    "priceRange": "AED 149-600",
    "telephone": "+971556140067"
  };

  const venues = [
    { icon: Building2, name: "Gate Village", screens: "15", footfall: "30,000/day" },
    { icon: Coffee, name: "DIFC Cafés & Restaurants", screens: "20+", footfall: "25,000/day" },
    { icon: Briefcase, name: "Office Lobbies", screens: "12", footfall: "40,000/day" },
    { icon: Building2, name: "ICD Brookfield Place", screens: "10", footfall: "20,000/day" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="DOOH Advertising DIFC Dubai | Gate Village & Financial District Screens | BeyondWalls"
        description="Premium DOOH advertising in DIFC Dubai. 55+ screens in Gate Village, office lobbies, restaurants. Reach 115,000+ finance professionals daily. BeyondWalls UAE."
        keywords="DOOH DIFC, DIFC advertising Dubai, Gate Village digital ads, financial district advertising Dubai, DIFC screens, business advertising Dubai"
        canonical="https://www.beyondwalls.ae/dooh-difc"
        structuredData={structuredData}
      />
      <PublicNav />

      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <Badge className="bg-amber-500/20 text-amber-300 border-0 mb-4">
            <MapPin className="w-4 h-4 mr-1" /> DIFC Financial District
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">DOOH Advertising in DIFC</h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl">
            Target Dubai's <strong>financial elite</strong>. 55+ screens in DIFC reaching <strong>115,000+ professionals</strong> daily. 
            Premium placements in Gate Village, office towers, and upscale restaurants.
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-amber-500 text-slate-900 hover:bg-amber-400 h-14 px-8">
              Book DIFC Screens <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-12 px-6 bg-amber-500 text-slate-900">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><p className="text-4xl font-bold">55+</p><p>DIFC Screens</p></div>
          <div><p className="text-4xl font-bold">115K+</p><p>Daily Professionals</p></div>
          <div><p className="text-4xl font-bold">$150K+</p><p>Avg. Income</p></div>
          <div><p className="text-4xl font-bold">AED 149</p><p>Starting Price</p></div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">DIFC Screen Locations</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {venues.map((venue, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center">
                    <venue.icon className="w-7 h-7 text-slate-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{venue.name}</h3>
                    <p className="text-sm text-amber-600">{venue.screens} screens</p>
                  </div>
                  <div className="text-right">
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
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Why Advertise in DIFC?</h2>
          <div className="prose prose-lg max-w-none text-slate-600">
            <p><strong>DIFC (Dubai International Financial Centre)</strong> is the region's leading financial hub, housing 2,500+ companies including major banks, law firms, and investment funds. The audience here has the <strong>highest spending power in the UAE</strong>.</p>
            <p>Perfect for: <strong>Luxury brands, financial services, real estate, premium automotive, private banking, and B2B services</strong>. Average visitor income exceeds $150,000 annually.</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-r from-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Reach DIFC's Elite?</h2>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-amber-500 text-slate-900 hover:bg-amber-400 h-14 px-8">
              Get Started <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}