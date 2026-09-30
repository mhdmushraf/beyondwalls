import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  MonitorPlay, ArrowRight, CheckCircle2, MapPin, Building2,
  Wifi, Settings, BarChart3, Zap, Shield, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";

export default function DigitalSignageUAE() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Digital Signage UAE",
    "provider": {
      "@type": "Organization",
      "name": "BeyondWalls",
      "url": "https://beyondwalls.ae"
    },
    "areaServed": "United Arab Emirates",
    "description": "Digital signage advertising network across UAE with screens in Dubai, Abu Dhabi, Sharjah and more."
  };

  const features = [
    { icon: MonitorPlay, title: "Screen Network", desc: "Premium digital displays across UAE" },
    { icon: Wifi, title: "Cloud Connected", desc: "Remote content management" },
    { icon: BarChart3, title: "Analytics Dashboard", desc: "Track performance in real-time" },
    { icon: Settings, title: "Easy Management", desc: "Self-serve booking platform" },
    { icon: Shield, title: "Premium Venues", desc: "Cafés, malls, gyms, hotels" },
    { icon: Clock, title: "24/7 Display", desc: "Round-the-clock visibility" },
  ];

  const cities = [
    { name: "Dubai", screens: "Coming soon" },
    { name: "Abu Dhabi", screens: "Coming soon" },
    { name: "Sharjah", screens: "Coming soon" },
    { name: "Ajman", screens: "Coming soon" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Digital Signage Advertising UAE | Screen Network | Beyond Walls"
        description="Advertise on a UAE-wide digital signage network. Reach audiences in malls, hotels and high-traffic venues with Beyond Walls."
        keywords="digital signage UAE, digital displays UAE, screen advertising UAE, digital signage Dubai, digital signage Abu Dhabi, LED advertising UAE"
        canonical="https://beyondwalls.ae/DigitalSignageUAE"
        structuredData={structuredData}
      />
      <PublicNav />

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="bg-white/20 text-white border-0 mb-4">
            🇦🇪 Digital Signage Network for the UAE
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Digital Signage Advertising in UAE
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            Advertise on <strong>digital screens</strong> across the UAE. 
            From Dubai to Abu Dhabi, reach your audience where they shop, dine, and relax.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to={createPageUrl("Register")}>
              <Button size="lg" className="bg-white text-violet-600 hover:bg-slate-100 h-14 px-8">
                Start Advertising
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl("ScreenLocations")}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 h-14 px-8">
                Browse Screens
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className="py-12 px-6 bg-slate-900">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {cities.map((city, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-bold text-violet-400">{city.screens}</p>
              <p className="text-white">{city.name} Screens</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Why BeyondWalls Digital Signage?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              The most comprehensive digital signage network in the UAE
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-violet-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            How to Advertise on Digital Signage
          </h2>
          <div className="space-y-6">
            {[
              { step: 1, title: "Choose Your Screens", desc: "Browse available screens across UAE and select your locations" },
              { step: 2, title: "Upload Your Ad", desc: "Upload your image or video creative" },
              { step: 3, title: "Set Your Budget", desc: "Starting from just AED 99/week per screen" },
              { step: 4, title: "Go Live", desc: "Your ad goes live within 30 minutes" },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-violet-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Advertise on Digital Signage in UAE?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Start reaching customers across the Emirates today
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-violet-600 hover:bg-slate-100 h-14 px-8">
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}