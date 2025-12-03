import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MonitorPlay, ArrowRight, Flag, Calendar, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";

export default function DOOHUAENationalDay() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "UAE National Day Advertising",
    "startDate": "2025-12-02",
    "endDate": "2025-12-03",
    "location": { "@type": "Place", "name": "United Arab Emirates" },
    "organizer": { "@type": "Organization", "name": "BeyondWalls", "url": "https://www.beyondwalls.ae" }
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="UAE National Day Advertising 2025 | Patriotic DOOH Campaigns | BeyondWalls"
        description="Advertise during UAE National Day celebrations. Connect with patriotic audiences across Dubai, Abu Dhabi & all Emirates. DOOH screens for December 2nd campaigns."
        keywords="UAE National Day advertising, December 2 advertising UAE, UAE National Day screens, patriotic advertising Dubai, UAE celebration marketing"
        canonical="https://www.beyondwalls.ae/dooh-uae-national-day"
        structuredData={structuredData}
      />
      <PublicNav />

      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-red-600 via-green-600 to-black text-white relative overflow-hidden">
        <div className="absolute top-10 right-10 text-8xl opacity-20">🇦🇪</div>
        <div className="max-w-6xl mx-auto relative z-10">
          <Badge className="bg-white/20 text-white border-0 mb-4"><Flag className="w-4 h-4 mr-1" /> December 2nd</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">UAE National Day Advertising</h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl">
            Celebrate the <strong>Spirit of the Union</strong> with your brand. Reach millions during UAE's most patriotic celebration across all Emirates.
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-red-600 hover:bg-slate-100 h-14 px-8">
              Book National Day Campaign <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><p className="text-4xl font-bold text-green-400">10M+</p><p className="text-slate-400">UAE Residents</p></div>
          <div><p className="text-4xl font-bold text-green-400">500+</p><p className="text-slate-400">Screens</p></div>
          <div><p className="text-4xl font-bold text-green-400">7</p><p className="text-slate-400">Emirates</p></div>
          <div><p className="text-4xl font-bold text-green-400">AED 99</p><p className="text-slate-400">Starting Price</p></div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Connect with Patriotic Audiences</h2>
          <p className="text-lg text-slate-600 mb-8">
            UAE National Day (December 2nd) is when the entire nation comes together. Brands that celebrate with the community build <strong>lasting emotional connections</strong>.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Heart className="w-10 h-10 text-red-500 mx-auto mb-3" />
                <h3 className="font-semibold">Emotional Bond</h3>
                <p className="text-sm text-slate-600">Connect with national pride</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Users className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <h3 className="font-semibold">Mass Reach</h3>
                <p className="text-sm text-slate-600">Everyone celebrates together</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Flag className="w-10 h-10 text-red-600 mx-auto mb-3" />
                <h3 className="font-semibold">Brand Alignment</h3>
                <p className="text-sm text-slate-600">Show your UAE commitment</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-r from-red-600 via-green-600 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Celebrate With UAE 🇦🇪</h2>
          <Link to={createPageUrl("Register")}><Button size="lg" className="bg-white text-red-600 hover:bg-slate-100 h-14 px-8">Get Started <ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}