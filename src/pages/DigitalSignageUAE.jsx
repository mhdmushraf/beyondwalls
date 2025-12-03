import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  MonitorPlay, ArrowRight, Target, TrendingUp, Building2, CheckCircle2,
  MapPin, DollarSign, Clock, BarChart3, Zap, Shield, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";

export default function DigitalSignageUAE() {
  const cities = [
    { name: "Dubai", screens: "500+", desc: "Marina, Downtown, DIFC, JBR" },
    { name: "Abu Dhabi", screens: "150+", desc: "Corniche, Al Reem, Yas Island" },
    { name: "Sharjah", screens: "80+", desc: "Al Majaz, Sahara Centre" },
    { name: "Ajman", screens: "30+", desc: "City Centre, Corniche" },
    { name: "RAK", screens: "20+", desc: "Al Hamra, Manar Mall" }
  ];

  const venueTypes = [
    { name: "Restaurants & Cafés", count: "200+" },
    { name: "Shopping Malls", count: "50+" },
    { name: "Fitness Centers", count: "100+" },
    { name: "Coworking Spaces", count: "80+" },
    { name: "Hotels & Lobbies", count: "60+" },
    { name: "Hospitals & Clinics", count: "40+" }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Digital Signage Advertising UAE",
    "provider": {
      "@type": "Organization",
      "name": "BeyondWalls UAE",
      "url": "https://www.beyondwalls.ae",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "AE",
        "addressRegion": "Dubai",
        "addressLocality": "Dubai Internet City"
      }
    },
    "serviceType": "Digital Signage Advertising",
    "areaServed": ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "RAK", "UAE"],
    "description": "Book digital signage advertising across UAE - Dubai, Abu Dhabi, Sharjah. Self-serve platform for businesses. 500+ screens nationwide."
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Digital Signage UAE | Screen Advertising Across Emirates | BeyondWalls"
        description="Book digital signage advertising across UAE - Dubai, Abu Dhabi, Sharjah, Ajman, RAK. 500+ screens in malls, cafés, gyms. Self-serve platform. Start from AED 99/week."
        keywords="digital signage UAE, digital screens UAE, screen advertising UAE, DOOH UAE, digital billboard UAE, advertising screens Emirates, mall advertising UAE, venue advertising UAE"
        canonical="https://www.beyondwalls.ae/digital-signage-uae"
        structuredData={structuredData}
      />
      <PublicNav />

      {/* Hero */}
      <section className="pt-28 pb-16 px-6 bg-gradient-to-br from-indigo-50 via-white to-violet-50">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="bg-indigo-100 text-indigo-700 border-0 mb-4">
            🇦🇪 Nationwide Coverage
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Digital Signage Advertising Across
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent"> UAE </span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Book advertising screens in <strong>Dubai, Abu Dhabi, Sharjah, Ajman, and RAK</strong>. 
            UAE's largest self-serve digital signage network with 500+ screens nationwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Register")}>
              <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 h-14 px-8">
                Start Advertising in UAE
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl("ScreenLocations")}>
              <Button size="lg" variant="outline" className="h-14 px-8">
                Browse All Screens
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Digital Screens in Every Emirate
          </h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {cities.map((city, i) => (
              <Card key={i} className="text-center hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <Globe className="w-10 h-10 text-violet-600 mx-auto mb-3" />
                  <h3 className="font-bold text-xl text-slate-900">{city.name}</h3>
                  <p className="text-2xl font-bold text-violet-600 my-2">{city.screens}</p>
                  <p className="text-sm text-slate-500">screens</p>
                  <p className="text-xs text-slate-400 mt-2">{city.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Venue Types */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Advertise in Premium UAE Venues
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venueTypes.map((v, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-md flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{v.name}</p>
                  <p className="text-violet-600 font-semibold">{v.count} venues</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-violet-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Reach Customers Across the UAE
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Start advertising on digital screens from AED 99/week
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-violet-600 hover:bg-slate-100 h-14 px-8">
              Get Started Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}