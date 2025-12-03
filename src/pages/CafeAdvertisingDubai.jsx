import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MonitorPlay, ArrowRight, Coffee, Clock, Users, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";

export default function CafeAdvertisingDubai() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Café Advertising Dubai",
    "provider": { "@type": "Organization", "name": "BeyondWalls", "url": "https://www.beyondwalls.ae" },
    "areaServed": "Dubai, UAE",
    "description": "Digital screen advertising in Dubai cafés and coffee shops."
  };

  const benefits = [
    { icon: Clock, title: "High Dwell Time", desc: "45+ minutes average customer stay" },
    { icon: Users, title: "Captive Audience", desc: "Relaxed, receptive viewers" },
    { icon: Target, title: "Targeted Reach", desc: "Young professionals, students" },
    { icon: Coffee, title: "Premium Environment", desc: "Brand-safe, upscale venues" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Café Advertising Dubai | Coffee Shop Digital Screens | BeyondWalls"
        description="Advertise in Dubai cafés and coffee shops. 150+ screens in premium cafés across Dubai. Reach young professionals with 45+ min dwell time. From AED 79/week."
        keywords="café advertising Dubai, coffee shop advertising UAE, café digital screens, restaurant advertising Dubai, F&B venue advertising, café marketing Dubai"
        canonical="https://www.beyondwalls.ae/cafe-advertising-dubai"
        structuredData={structuredData}
      />
      <PublicNav />

      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-amber-600 via-orange-500 to-yellow-500 text-white">
        <div className="max-w-6xl mx-auto">
          <Badge className="bg-white/20 text-white border-0 mb-4"><Coffee className="w-4 h-4 mr-1" /> Café Advertising</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Café Advertising in Dubai</h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl">
            Reach customers where they <strong>relax and spend time</strong>. 150+ screens in Dubai's best cafés with <strong>45+ minutes average dwell time</strong>.
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-amber-600 hover:bg-slate-100 h-14 px-8">
              Book Café Screens <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><p className="text-4xl font-bold text-amber-400">150+</p><p className="text-slate-400">Café Screens</p></div>
          <div><p className="text-4xl font-bold text-amber-400">45min</p><p className="text-slate-400">Avg. Dwell Time</p></div>
          <div><p className="text-4xl font-bold text-amber-400">25-40</p><p className="text-slate-400">Age Group</p></div>
          <div><p className="text-4xl font-bold text-amber-400">AED 79</p><p className="text-slate-400">Starting Price</p></div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Why Café Advertising Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <Card key={i} className="border-0 shadow-lg text-center">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <b.icon className="w-7 h-7 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{b.title}</h3>
                  <p className="text-sm text-slate-600">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Café Locations in Dubai</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["Dubai Marina", "JBR", "DIFC", "Downtown", "Business Bay", "JLT", "Al Barsha", "Jumeirah"].map((loc, i) => (
              <Badge key={i} variant="secondary" className="px-4 py-2 text-base">{loc}</Badge>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-r from-amber-500 to-orange-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Advertise in Dubai Cafés?</h2>
          <Link to={createPageUrl("Register")}><Button size="lg" className="bg-white text-amber-600 hover:bg-slate-100 h-14 px-8">Get Started <ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}