import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MonitorPlay, ArrowRight, Moon, Clock, Users, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";

export default function DOOHRamadanAdvertising() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Ramadan Advertising UAE 2025",
    "startDate": "2025-02-28",
    "endDate": "2025-03-29",
    "location": { "@type": "Place", "name": "United Arab Emirates" },
    "organizer": { "@type": "Organization", "name": "BeyondWalls", "url": "https://www.beyondwalls.ae" }
  };

  const tips = [
    { icon: Clock, title: "Peak Hours: Iftar Time", desc: "6-9 PM highest engagement" },
    { icon: Moon, title: "Suhoor Audiences", desc: "Late night cafe crowds" },
    { icon: Users, title: "Family Gatherings", desc: "Reach groups, not individuals" },
    { icon: ShoppingBag, title: "High Spending", desc: "Ramadan spending increases 20%" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Ramadan Advertising UAE 2025 | DOOH Screens for Holy Month | BeyondWalls"
        description="Advertise during Ramadan in UAE. Reach audiences at Iftar, Suhoor & throughout the holy month. 500+ screens in mosques areas, malls, cafés. Ramadan DOOH from AED 99."
        keywords="Ramadan advertising UAE, Ramadan marketing Dubai, Iftar advertising, holy month advertising, Ramadan screens UAE, Ramadan DOOH campaign"
        canonical="https://www.beyondwalls.ae/dooh-ramadan-advertising"
        structuredData={structuredData}
      />
      <PublicNav />

      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-emerald-700 via-teal-600 to-cyan-700 text-white relative overflow-hidden">
        <div className="absolute top-10 right-10 text-8xl opacity-20">🌙</div>
        <div className="max-w-6xl mx-auto relative z-10">
          <Badge className="bg-white/20 text-white border-0 mb-4"><Moon className="w-4 h-4 mr-1" /> Ramadan 2025</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Ramadan Advertising in UAE</h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl">
            Connect with audiences during the <strong>Holy Month</strong>. Special Iftar and Suhoor time slots, family-oriented venues, and culturally sensitive placements.
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100 h-14 px-8">
              Book Ramadan Campaign <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><p className="text-4xl font-bold text-emerald-400">30 Days</p><p className="text-slate-400">Campaign Duration</p></div>
          <div><p className="text-4xl font-bold text-emerald-400">+20%</p><p className="text-slate-400">Consumer Spending</p></div>
          <div><p className="text-4xl font-bold text-emerald-400">Peak</p><p className="text-slate-400">Iftar Hours</p></div>
          <div><p className="text-4xl font-bold text-emerald-400">AED 99</p><p className="text-slate-400">Starting Price</p></div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Ramadan Advertising Tips</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tips.map((t, i) => (
              <Card key={i} className="border-0 shadow-lg text-center">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <t.icon className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{t.title}</h3>
                  <p className="text-sm text-slate-600">{t.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Best Categories for Ramadan</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {["F&B", "Grocery", "Fashion", "Electronics", "Home Decor", "Telecom", "Banking", "Charity"].map((cat, i) => (
              <Badge key={i} variant="secondary" className="px-4 py-2 text-base">{cat}</Badge>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ramadan Mubarak 🌙</h2>
          <Link to={createPageUrl("Register")}><Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100 h-14 px-8">Start Campaign <ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}