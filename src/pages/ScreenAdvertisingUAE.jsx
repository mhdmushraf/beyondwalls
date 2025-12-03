import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MonitorPlay, ArrowRight, MapPin, Building2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";

export default function ScreenAdvertisingUAE() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Screen Advertising UAE",
    "provider": { "@type": "Organization", "name": "BeyondWalls", "url": "https://www.beyondwalls.ae" },
    "areaServed": "United Arab Emirates"
  };

  const cities = [
    { name: "Dubai", screens: "300+" },
    { name: "Abu Dhabi", screens: "100+" },
    { name: "Sharjah", screens: "65+" },
    { name: "Ajman", screens: "25+" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Screen Advertising UAE | Digital Display Advertising Network | BeyondWalls"
        description="Book screen advertising across UAE. 500+ digital displays in Dubai, Abu Dhabi, Sharjah, Ajman. Self-serve platform, instant booking, from AED 59/week. BeyondWalls."
        keywords="screen advertising UAE, digital display advertising, TV advertising UAE, screen network UAE, display advertising Dubai, digital screens UAE"
        canonical="https://www.beyondwalls.ae/screen-advertising-uae"
        structuredData={structuredData}
      />
      <PublicNav />

      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 text-white">
        <div className="max-w-6xl mx-auto">
          <Badge className="bg-white/20 text-white border-0 mb-4"><MonitorPlay className="w-4 h-4 mr-1" /> UAE Screen Network</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Screen Advertising Across UAE</h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl">
            Access <strong>500+ digital screens</strong> across all Emirates. One platform to book advertising in Dubai, Abu Dhabi, Sharjah, and beyond.
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-teal-600 hover:bg-slate-100 h-14 px-8">
              Browse All Screens <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {cities.map((city, i) => (
            <div key={i}>
              <p className="text-4xl font-bold text-teal-400">{city.screens}</p>
              <p className="text-slate-400">{city.name} Screens</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Why BeyondWalls Screen Network?</h2>
          <div className="space-y-4">
            {[
              "One platform for all UAE screen advertising",
              "Self-serve booking - no agencies needed",
              "Real-time analytics and reporting",
              "Flexible weekly pricing from AED 59",
              "Go live within 30 minutes",
              "No contracts or long-term commitments"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-teal-500 flex-shrink-0" />
                <span className="font-medium text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-r from-teal-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Advertise Across UAE?</h2>
          <Link to={createPageUrl("Register")}><Button size="lg" className="bg-white text-teal-600 hover:bg-slate-100 h-14 px-8">Get Started <ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}