import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MonitorPlay, ArrowRight, MapPin, Users, Clock, Building2, Coffee, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";

export default function DOOHDubaiMarina() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "BeyondWalls Dubai Marina",
    "image": "https://beyondwalls.ae/dubai-marina.jpg",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Dubai Marina",
      "addressLocality": "Dubai",
      "addressRegion": "Dubai",
      "postalCode": "00000",
      "addressCountry": "AE"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 25.0805,
      "longitude": 55.1403
    },
    "priceRange": "AED 99-500",
    "openingHours": "Mo-Su 00:00-24:00",
    "telephone": "+971556140067",
    "url": "https://www.beyondwalls.ae/dooh-dubai-marina"
  };

  const venues = [
    { icon: Coffee, name: "Marina Walk Cafés", screens: "25+", footfall: "50,000/day" },
    { icon: Dumbbell, name: "Fitness First Marina", screens: "8", footfall: "2,000/day" },
    { icon: Building2, name: "JBR The Walk", screens: "15+", footfall: "100,000/day" },
    { icon: Coffee, name: "Marina Mall Food Court", screens: "12", footfall: "30,000/day" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="DOOH Advertising Dubai Marina | Digital Screens JBR & Marina Walk | BeyondWalls"
        description="Book DOOH advertising in Dubai Marina & JBR. 60+ digital screens in Marina Walk cafés, gyms, restaurants. Reach 200,000+ daily visitors. From AED 99/week. BeyondWalls UAE."
        keywords="DOOH Dubai Marina, digital advertising Marina Walk, JBR advertising screens, Dubai Marina billboard, Marina Mall advertising, JBR digital signage, Dubai Marina screens"
        canonical="https://www.beyondwalls.ae/dooh-dubai-marina"
        structuredData={structuredData}
      />
      <PublicNav />

      {/* Hero with Marina Image */}
      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&fit=crop" 
            alt="Dubai Marina skyline"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <Badge className="bg-white/20 text-white border-0 mb-4">
            <MapPin className="w-4 h-4 mr-1" /> Dubai Marina & JBR
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            DOOH Advertising in Dubai Marina
          </h1>
          <p className="text-xl text-white/90 mb-4 max-w-3xl">
            Reach <strong>200,000+ daily visitors</strong> in Dubai's most iconic waterfront district. 
            Digital screens in Marina Walk cafés, JBR restaurants, gyms, and retail outlets.
          </p>
          <p className="text-lg text-white/80 mb-8 max-w-3xl">
            Dubai Marina is home to young professionals, tourists, and high-income residents. 
            Perfect for lifestyle brands, F&B, fitness, and luxury products.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to={createPageUrl("Register")}>
              <Button size="lg" className="bg-white text-cyan-600 hover:bg-slate-100 h-14 px-8">
                Book Marina Screens
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl("ScreenLocations")}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 h-14 px-8">
                View All Marina Locations
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold text-cyan-400">60+</p>
            <p className="text-slate-400">Screens in Marina</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-cyan-400">200K+</p>
            <p className="text-slate-400">Daily Footfall</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-cyan-400">AED 99</p>
            <p className="text-slate-400">Starting Price</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-cyan-400">25-45</p>
            <p className="text-slate-400">Age Demographics</p>
          </div>
        </div>
      </section>

      {/* Venues */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">
            Dubai Marina Screen Locations
          </h2>
          <p className="text-lg text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            Premium digital advertising placements across Dubai Marina's busiest venues
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {venues.map((venue, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center">
                    <venue.icon className="w-7 h-7 text-cyan-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{venue.name}</h3>
                    <p className="text-sm text-cyan-600">{venue.screens} screens</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Footfall</p>
                    <p className="font-semibold text-slate-900">{venue.footfall}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Map Embed */}
      <section className="py-12 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Dubai Marina Location
          </h2>
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14452.254847855397!2d55.13!3d25.08!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f6b5402c126e3%3A0xb9511e6655c46d7c!2sDubai%20Marina!5e0!3m2!1sen!2sae!4v1701609600000"
              width="100%" 
              height="400" 
              style={{border: 0}}
              allowFullScreen="" 
              loading="lazy"
              title="Dubai Marina Map"
            />
          </div>
        </div>
      </section>

      {/* Why Marina */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Why Advertise in Dubai Marina?
          </h2>
          <div className="prose prose-lg max-w-none text-slate-600">
            <p>
              <strong>Dubai Marina</strong> is one of the most affluent neighborhoods in the UAE, 
              attracting tourists, expatriates, and wealthy residents. With over <strong>200,000 daily visitors</strong> 
              to Marina Walk and JBR, your brand gains exposure to a highly desirable demographic.
            </p>
            <p>
              The area features world-class restaurants, luxury retail, fitness centers, and entertainment venues. 
              BeyondWalls offers <strong>60+ digital screens</strong> strategically placed in high-traffic locations 
              where your audience spends time dining, shopping, and relaxing.
            </p>
            <p>
              <strong>Key demographics:</strong> Young professionals (25-45), tourists, high-income families, 
              fitness enthusiasts, and luxury consumers. Average income: AED 30,000+/month.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-cyan-600 to-teal-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Advertise in Dubai Marina?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Book screens in Marina Walk, JBR, and surrounding areas today
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-cyan-600 hover:bg-slate-100 h-14 px-8">
              Get Started - From AED 99/week
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}