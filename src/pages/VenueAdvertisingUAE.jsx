import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Building2, ArrowRight, Wallet, MonitorPlay, PieChart, Shield,
  CheckCircle2, TrendingUp, DollarSign, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";

export default function VenueAdvertisingUAE() {
  const benefits = [
    { icon: Wallet, title: "70% Revenue Share", desc: "Highest in the UAE advertising industry" },
    { icon: MonitorPlay, title: "Easy Setup", desc: "Works on any smart TV or digital screen" },
    { icon: PieChart, title: "Real-time Dashboard", desc: "Track earnings and ad performance live" },
    { icon: Shield, title: "Full Control", desc: "Approve all ads before they run" }
  ];

  const venueTypes = [
    { name: "Restaurants & Cafés", earning: "AED 2,000-5,000/mo" },
    { name: "Gyms & Fitness Centers", earning: "AED 3,000-6,000/mo" },
    { name: "Shopping Malls", earning: "AED 5,000-15,000/mo" },
    { name: "Coworking Spaces", earning: "AED 2,500-4,000/mo" },
    { name: "Hotels & Lobbies", earning: "AED 4,000-8,000/mo" },
    { name: "Salons & Spas", earning: "AED 1,500-3,000/mo" }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Venue Advertising Platform UAE",
    "provider": {
      "@type": "Organization",
      "name": "BeyondWalls UAE"
    },
    "serviceType": "Venue Screen Monetization",
    "areaServed": "UAE",
    "description": "Monetize your venue screens with BeyondWalls. Earn 70% revenue share from advertising on your digital screens in Dubai and UAE."
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Venue Advertising UAE | Monetize Your Screens | 70% Revenue Share | BeyondWalls"
        description="Turn your venue screens into revenue streams. Earn 70% of ad revenue. Perfect for cafés, gyms, malls, hotels in Dubai and UAE. Easy setup, full control."
        keywords="venue advertising UAE, screen monetization Dubai, passive income screens, café advertising UAE, gym screen advertising, mall advertising revenue, venue owner advertising"
        canonical="https://www.beyondwalls.ae/venue-advertising-uae"
        structuredData={structuredData}
      />
      <PublicNav />

      {/* Hero */}
      <section className="pt-28 pb-16 px-6 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-emerald-100 text-emerald-700 border-0 mb-4">
                🏢 For Venue Owners
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Monetize Your
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"> Venue Screens </span>
                in UAE
              </h1>
              <p className="text-xl text-slate-600 mb-8">
                Have screens in your café, gym, or hotel? <strong>Earn up to AED 15,000/month</strong> by displaying ads. 
                70% revenue share - highest in UAE!
              </p>
              
              <div className="bg-emerald-50 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-emerald-600 rounded-xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">70%</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-lg">Revenue Share</p>
                    <p className="text-slate-600">You keep 70% of all ad revenue</p>
                  </div>
                </div>
              </div>

              <Link to={createPageUrl("Register")}>
                <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 h-14 px-8">
                  List Your Venue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop&q=80"
                alt="Café with digital advertising screen"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-4 shadow-xl">
                <p className="text-sm text-slate-500">Average Monthly Earnings</p>
                <p className="text-2xl font-bold text-emerald-600">AED 4,500</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Why UAE Venues Choose BeyondWalls
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <Card key={i} className="text-center hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <b.icon className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{b.title}</h3>
                  <p className="text-slate-600 text-sm">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings by Venue Type */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Potential Earnings by Venue Type
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {venueTypes.map((v, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="w-8 h-8 text-emerald-600" />
                  <span className="font-medium text-slate-900">{v.name}</span>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700">{v.earning}</Badge>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Start Earning From Your Screens Today
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join 200+ UAE venues already earning with BeyondWalls
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100 h-14 px-8">
              Register Your Venue - Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}