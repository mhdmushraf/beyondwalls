import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MonitorPlay, ArrowRight, Dumbbell, Heart, Users, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";

export default function GymAdvertisingDubai() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Gym Advertising Dubai",
    "provider": { "@type": "Organization", "name": "BeyondWalls", "url": "https://www.beyondwalls.ae" },
    "areaServed": "Dubai, UAE"
  };

  const benefits = [
    { icon: Dumbbell, title: "Health-Conscious Audience", desc: "Active, wellness-focused consumers" },
    { icon: Heart, title: "High Income", desc: "AED 20K+ monthly income average" },
    { icon: Users, title: "Repeat Exposure", desc: "Members visit 3-5x per week" },
    { icon: Target, title: "Long Dwell Time", desc: "60-90 minutes per visit" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Gym Advertising Dubai | Fitness Center Digital Screens | BeyondWalls"
        description="Advertise in Dubai gyms and fitness centers. 80+ screens in premium gyms. Reach health-conscious consumers with high income. From AED 99/week. BeyondWalls UAE."
        keywords="gym advertising Dubai, fitness center advertising UAE, gym digital screens, health club advertising Dubai, fitness advertising UAE, gym marketing Dubai"
        canonical="https://www.beyondwalls.ae/gym-advertising-dubai"
        structuredData={structuredData}
      />
      <PublicNav />

      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-green-600 via-emerald-500 to-teal-500 text-white">
        <div className="max-w-6xl mx-auto">
          <Badge className="bg-white/20 text-white border-0 mb-4"><Dumbbell className="w-4 h-4 mr-1" /> Gym Advertising</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Gym Advertising in Dubai</h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl">
            Reach <strong>health-conscious, high-income consumers</strong>. 80+ screens in Dubai's premium gyms with <strong>60-90 min dwell time</strong> and repeat exposure.
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-green-600 hover:bg-slate-100 h-14 px-8">
              Book Gym Screens <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><p className="text-4xl font-bold text-green-400">80+</p><p className="text-slate-400">Gym Screens</p></div>
          <div><p className="text-4xl font-bold text-green-400">90min</p><p className="text-slate-400">Avg. Visit Time</p></div>
          <div><p className="text-4xl font-bold text-green-400">4x</p><p className="text-slate-400">Weekly Visits</p></div>
          <div><p className="text-4xl font-bold text-green-400">AED 99</p><p className="text-slate-400">Starting Price</p></div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Why Gym Advertising Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <Card key={i} className="border-0 shadow-lg text-center">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <b.icon className="w-7 h-7 text-green-600" />
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
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Ideal for These Brands</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["Sports Nutrition", "Fitness Apps", "Sportswear", "Health Insurance", "Wellness Products", "Sports Equipment", "Healthy F&B"].map((cat, i) => (
              <Badge key={i} variant="secondary" className="px-4 py-2 text-base">{cat}</Badge>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-r from-green-600 to-teal-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Advertise in Dubai Gyms?</h2>
          <Link to={createPageUrl("Register")}><Button size="lg" className="bg-white text-green-600 hover:bg-slate-100 h-14 px-8">Get Started <ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}