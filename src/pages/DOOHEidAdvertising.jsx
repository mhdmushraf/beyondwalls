import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MonitorPlay, ArrowRight, Moon, Gift, Users, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";

export default function DOOHEidAdvertising() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Eid Advertising UAE 2025",
    "location": { "@type": "Place", "name": "United Arab Emirates" },
    "organizer": { "@type": "Organization", "name": "BeyondWalls", "url": "https://www.beyondwalls.ae" }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Eid Advertising UAE 2025 | Eid Al Fitr & Eid Al Adha DOOH | BeyondWalls"
        description="Advertise during Eid in UAE. Reach families celebrating Eid Al Fitr and Eid Al Adha. DOOH screens in malls, venues & gathering places. From AED 99/week."
        keywords="Eid advertising UAE, Eid Al Fitr advertising Dubai, Eid Al Adha marketing, Eid screens UAE, Eid promotion Dubai, Islamic holiday advertising"
        canonical="https://www.beyondwalls.ae/dooh-eid-advertising"
        structuredData={structuredData}
      />
      <PublicNav />

      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 text-white relative overflow-hidden">
        <div className="absolute top-10 right-10 text-8xl opacity-20">🌙</div>
        <div className="max-w-6xl mx-auto relative z-10">
          <Badge className="bg-white/20 text-white border-0 mb-4"><Moon className="w-4 h-4 mr-1" /> Eid Mubarak</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Eid Advertising in UAE</h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl">
            Celebrate <strong>Eid Al Fitr & Eid Al Adha</strong> with your brand. Reach families during the most joyous time of the Islamic calendar with festive campaigns.
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-purple-600 hover:bg-slate-100 h-14 px-8">
              Book Eid Campaign <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><p className="text-4xl font-bold text-purple-400">2x Eid</p><p className="text-slate-400">Annual Celebrations</p></div>
          <div><p className="text-4xl font-bold text-purple-400">+35%</p><p className="text-slate-400">Retail Spending</p></div>
          <div><p className="text-4xl font-bold text-purple-400">Family</p><p className="text-slate-400">Focused Audience</p></div>
          <div><p className="text-4xl font-bold text-purple-400">AED 99</p><p className="text-slate-400">Starting Price</p></div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Eid Advertising Opportunities</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Gift, title: "Gift Shopping", desc: "Eid gift-buying peak" },
              { icon: Users, title: "Family Gatherings", desc: "Group audiences" },
              { icon: ShoppingBag, title: "Fashion & Beauty", desc: "New outfits for Eid" },
              { icon: Moon, title: "Festive Spirit", desc: "High brand recall" },
            ].map((b, i) => (
              <Card key={i} className="border-0 shadow-lg text-center">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <b.icon className="w-7 h-7 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{b.title}</h3>
                  <p className="text-sm text-slate-600">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Eid Mubarak! 🌙</h2>
          <Link to={createPageUrl("Register")}><Button size="lg" className="bg-white text-purple-600 hover:bg-slate-100 h-14 px-8">Start Campaign <ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}