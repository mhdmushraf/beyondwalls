import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MonitorPlay, ArrowRight, ShoppingBag, MapPin, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";

export default function MallAdvertisingUAE() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Mall Advertising UAE",
    "provider": { "@type": "Organization", "name": "BeyondWalls", "url": "https://www.beyondwalls.ae" },
    "areaServed": "United Arab Emirates"
  };

  const malls = [
    { name: "Dubai Mall Area", screens: "40+", city: "Dubai" },
    { name: "Mall of the Emirates", screens: "25+", city: "Dubai" },
    { name: "Yas Mall", screens: "20+", city: "Abu Dhabi" },
    { name: "Sahara Centre", screens: "15", city: "Sharjah" },
    { name: "City Centre Mirdif", screens: "12", city: "Dubai" },
    { name: "Abu Dhabi Mall", screens: "18", city: "Abu Dhabi" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Mall Advertising UAE | Shopping Center Digital Screens | BeyondWalls"
        description="Advertise in UAE shopping malls. 150+ screens in Dubai Mall, Mall of Emirates, Yas Mall & more. Reach millions of shoppers. Premium retail advertising from AED 99."
        keywords="mall advertising UAE, shopping mall advertising Dubai, retail advertising UAE, Dubai Mall advertising, Mall of Emirates ads, shopping center screens"
        canonical="https://www.beyondwalls.ae/mall-advertising-uae"
        structuredData={structuredData}
      />
      <PublicNav />

      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-fuchsia-600 via-purple-600 to-violet-600 text-white">
        <div className="max-w-6xl mx-auto">
          <Badge className="bg-white/20 text-white border-0 mb-4"><ShoppingBag className="w-4 h-4 mr-1" /> Mall Advertising</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Mall Advertising in UAE</h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl">
            Reach <strong>millions of shoppers</strong> in UAE's premier shopping destinations. 150+ screens in top malls across Dubai, Abu Dhabi, and Sharjah.
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-fuchsia-600 hover:bg-slate-100 h-14 px-8">
              Book Mall Screens <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><p className="text-4xl font-bold text-fuchsia-400">150+</p><p className="text-slate-400">Mall Screens</p></div>
          <div><p className="text-4xl font-bold text-fuchsia-400">10M+</p><p className="text-slate-400">Monthly Shoppers</p></div>
          <div><p className="text-4xl font-bold text-fuchsia-400">15+</p><p className="text-slate-400">Major Malls</p></div>
          <div><p className="text-4xl font-bold text-fuchsia-400">AED 99</p><p className="text-slate-400">Starting Price</p></div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Mall Network Across UAE</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {malls.map((mall, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <ShoppingBag className="w-6 h-6 text-fuchsia-600" />
                    <h3 className="font-semibold text-slate-900">{mall.name}</h3>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">{mall.city}</span>
                    <span className="text-fuchsia-600 font-medium">{mall.screens} screens</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-r from-fuchsia-600 to-violet-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Advertise in UAE Malls?</h2>
          <Link to={createPageUrl("Register")}><Button size="lg" className="bg-white text-fuchsia-600 hover:bg-slate-100 h-14 px-8">Get Started <ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}