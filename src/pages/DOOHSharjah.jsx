import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MonitorPlay, ArrowRight, MapPin, Building2, Coffee, ShoppingBag, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";

export default function DOOHSharjah() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "BeyondWalls Sharjah",
    "address": { "@type": "PostalAddress", "addressLocality": "Sharjah", "addressCountry": "AE" },
    "geo": { "@type": "GeoCoordinates", "latitude": 25.3463, "longitude": 55.4209 },
    "priceRange": "AED 59-300",
    "telephone": "+971556140067"
  };

  const areas = [
    { icon: ShoppingBag, name: "Sahara Centre", screens: "20+", footfall: "80,000/day" },
    { icon: GraduationCap, name: "University City", screens: "15", footfall: "50,000/day" },
    { icon: Building2, name: "Al Majaz Waterfront", screens: "12", footfall: "40,000/day" },
    { icon: Coffee, name: "City Centre Sharjah", screens: "18", footfall: "60,000/day" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="DOOH Advertising Sharjah | Sahara Centre, University City Screens | BeyondWalls"
        description="Book DOOH advertising in Sharjah from AED 59/week. 65+ screens at Sahara Centre, University City, Al Majaz. Reach families & students. BeyondWalls UAE."
        keywords="DOOH Sharjah, Sharjah advertising screens, Sahara Centre ads, University City advertising, Sharjah digital signage, Al Majaz advertising"
        canonical="https://www.beyondwalls.ae/dooh-sharjah"
        structuredData={structuredData}
      />
      <PublicNav />

      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 text-white">
        <div className="max-w-6xl mx-auto">
          <Badge className="bg-white/20 text-white border-0 mb-4">
            <MapPin className="w-4 h-4 mr-1" /> Sharjah - Cultural Capital
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">DOOH Advertising in Sharjah</h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl">
            Reach <strong>230,000+ daily visitors</strong> in UAE's cultural capital. 
            65+ screens in malls, universities, and family destinations. Most affordable rates in UAE.
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-purple-600 hover:bg-slate-100 h-14 px-8">
              Book Sharjah Screens <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><p className="text-4xl font-bold text-purple-400">65+</p><p className="text-slate-400">Sharjah Screens</p></div>
          <div><p className="text-4xl font-bold text-purple-400">230K+</p><p className="text-slate-400">Daily Reach</p></div>
          <div><p className="text-4xl font-bold text-purple-400">AED 59</p><p className="text-slate-400">Lowest in UAE</p></div>
          <div><p className="text-4xl font-bold text-purple-400">40%</p><p className="text-slate-400">Students & Youth</p></div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Sharjah Screen Locations</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {areas.map((area, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                    <area.icon className="w-7 h-7 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{area.name}</h3>
                    <p className="text-sm text-purple-600">{area.screens} screens</p>
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
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Why Advertise in Sharjah?</h2>
          <div className="prose prose-lg max-w-none text-slate-600">
            <p><strong>Sharjah</strong> is the UAE's third-largest emirate and cultural capital, home to 1.5 million residents. It offers the <strong>most affordable DOOH rates in the UAE</strong> while reaching a valuable family and student demographic.</p>
            <p>Key audiences: <strong>University students</strong> (50,000+ in University City), <strong>families</strong> at malls, and <strong>commuters</strong> traveling to Dubai. Perfect for education, FMCG, retail, and entertainment brands.</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Advertise in Sharjah?</h2>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-purple-600 hover:bg-slate-100 h-14 px-8">
              Get Started - From AED 59/week <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}