import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  MonitorPlay, ArrowRight, CheckCircle2, Coffee, ShoppingBag,
  Dumbbell, Building2, Hotel, Utensils, Scissors, Stethoscope
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";

export default function VenueAdvertisingUAE() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Venue Advertising UAE",
    "provider": {
      "@type": "Organization",
      "name": "BeyondWalls",
      "url": "https://www.beyondwalls.ae"
    },
    "areaServed": "United Arab Emirates",
    "description": "Advertise in premium venues across UAE including cafés, malls, gyms, hotels, and more."
  };

  const venueTypes = [
    { icon: Coffee, name: "Cafés & Restaurants", screens: "150+", audience: "Young professionals, families" },
    { icon: ShoppingBag, name: "Shopping Malls", screens: "100+", audience: "Shoppers, tourists" },
    { icon: Dumbbell, name: "Gyms & Fitness", screens: "80+", audience: "Health-conscious adults" },
    { icon: Building2, name: "Coworking Spaces", screens: "60+", audience: "Entrepreneurs, professionals" },
    { icon: Hotel, name: "Hotels & Lobbies", screens: "50+", audience: "Business travelers, tourists" },
    { icon: Scissors, name: "Salons & Spas", screens: "40+", audience: "Beauty-conscious consumers" },
  ];

  const benefits = [
    "Captive audience with high dwell time",
    "Contextual advertising in relevant venues",
    "Premium brand-safe environments",
    "High-income demographics",
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Venue Advertising UAE | Advertise in Cafés, Malls, Gyms | BeyondWalls"
        description="Advertise in premium UAE venues - cafés, malls, gyms, hotels. Reach captive audiences with digital screens. 500+ venues across Dubai, Abu Dhabi. Book online from AED 99."
        keywords="venue advertising UAE, café advertising Dubai, mall advertising UAE, gym advertising Dubai, hotel advertising UAE, restaurant advertising Dubai, indoor advertising UAE"
        canonical="https://www.beyondwalls.ae/venue-advertising-uae"
        structuredData={structuredData}
      />
      <PublicNav />

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="bg-white/20 text-white border-0 mb-4">
            🏢 500+ Premium Venues in UAE
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Venue Advertising in UAE
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Reach your audience where they spend time - in <strong>cafés, malls, gyms, hotels</strong> and more. 
            Captive audiences, premium environments, measurable results.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to={createPageUrl("Register")}>
              <Button size="lg" className="bg-white text-orange-600 hover:bg-slate-100 h-14 px-8">
                Start Advertising
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl("ScreenLocations")}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 h-14 px-8">
                Browse Venues
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Venue Types */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Advertise in These Venue Types
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Choose from a variety of premium venues across UAE
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venueTypes.map((venue, i) => (
              <Card key={i} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <venue.icon className="w-7 h-7 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">{venue.name}</h3>
                      <p className="text-sm text-orange-600 font-medium mb-1">{venue.screens} screens</p>
                      <p className="text-xs text-slate-500">{venue.audience}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Why Venue Advertising Works
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-4 bg-white p-5 rounded-xl shadow">
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                <span className="font-medium text-slate-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Venue Owners */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-green-100 text-green-700 border-0 mb-4">
            💰 For Venue Owners
          </Badge>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Own a Venue? Monetize Your Screens
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Join BeyondWalls network and earn 70% revenue share from ads displayed on your screens.
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" variant="outline" className="border-violet-600 text-violet-600 hover:bg-violet-50">
              Register as Venue Owner
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Advertise in Premium UAE Venues?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Book your venue advertising campaign today
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-orange-600 hover:bg-slate-100 h-14 px-8">
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