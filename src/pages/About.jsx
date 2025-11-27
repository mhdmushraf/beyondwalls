import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Target,
  Users,
  Globe,
  Award,
  CheckCircle2,
  Building2,
  Megaphone,
  MapPin,
  Trophy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead, { PAGE_SEO } from "@/components/SEOHead";

export default function About() {
  const values = [
    {
      icon: Target,
      title: "Innovation",
      description: "Pioneering the future of outdoor advertising with cutting-edge technology"
    },
    {
      icon: Users,
      title: "Partnership",
      description: "Building lasting relationships with advertisers and venue owners alike"
    },
    {
      icon: Globe,
      title: "Reach",
      description: "Connecting brands with audiences across the UAE and beyond"
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Delivering exceptional results through quality and reliability"
    }
  ];

  const milestones = [
    { year: "2024", title: "Founded", description: "BeyondWalls was born with a vision to revolutionize DOOH advertising" },
    { year: "2024", title: "in5 Dubai", description: "Joined in5 Dubai incubator program under TECOM Group" },
    { year: "2025", title: "Soft Launch", description: "Attracted 8 venue partners and 25+ advertisers with $25,000+ in pending bookings" },
    { year: "2025", title: "Global Recognition Award", description: "Received 2025 Global Recognition Award for innovation in DOOH sector" }
  ];

  const team = [
    { name: "Muhammed Musharaf", role: "CEO & Founder", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" },
    { name: "Muhammed Shafi", role: "COO", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead {...PAGE_SEO.about} />
      <PublicNav />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-violet-50 via-white to-indigo-50">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-violet-100 text-slate-900 mb-6">About Us</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Transforming Digital Out-of-Home Advertising
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            We're on a mission to make premium screen advertising accessible to every business, 
            while helping venues monetize their spaces.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-violet-100 text-violet-600 mb-4">Our Mission</Badge>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Democratizing Outdoor Advertising
              </h2>
              <p className="text-slate-600 mb-4">
                BeyondWalls was founded with a simple belief: every business deserves access to 
                premium advertising spaces, and every venue should be able to monetize their screens effortlessly.
              </p>
              <p className="text-slate-600 mb-6">
                Our self-serve platform eliminates the complexity of traditional DOOH advertising, 
                making it as easy as running an online ad campaign.
              </p>
              <div className="space-y-3">
                {["Self-serve platform for all business sizes", "Transparent pricing with no hidden fees", "Real-time analytics and reporting", "Premium venues across the UAE"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-violet-600" />
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop" 
                alt="Office" 
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-violet-100 rounded-2xl p-6 shadow-lg">
                <p className="text-3xl font-bold text-slate-900">500+</p>
                <p className="text-slate-900">Active Screens</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-violet-100 text-violet-600 mb-4">Our Values</Badge>
            <h2 className="text-3xl font-bold text-slate-900">What Drives Us</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <Card key={i} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{value.title}</h3>
                  <p className="text-slate-600 text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-violet-100 text-slate-900 mb-4">Our Journey</Badge>
            <h2 className="text-3xl font-bold text-slate-900">Milestones</h2>
          </div>
          <div className="space-y-8">
            {milestones.map((milestone, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">{milestone.year}</span>
                </div>
                <div className="flex-1 bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{milestone.title}</h3>
                  <p className="text-slate-600">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Award Section */}
      <section className="py-20 px-6 bg-amber-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Trophy className="w-16 h-16 text-white" />
            </div>
            <div>
              <Badge className="bg-amber-200 text-amber-800 mb-4">2025 Global Recognition Award</Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                Award-Winning Innovation in DOOH Advertising
              </h2>
              <p className="text-slate-600">
                Beyond Walls has received a 2025 Global Recognition Award for its approach to restructuring 
                the out-of-home advertising sector through technology and an accessible business model. 
                Our platform eliminates obstacles that have historically prevented small and medium-sized 
                businesses from participating in physical advertising by reducing campaign launch times 
                from weeks to under 30 minutes and cutting entry costs by more than 90%.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* in5 Dubai Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-violet-100 text-violet-600 mb-4">Backed by in5 Dubai</Badge>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Part of Dubai's Premier Innovation Hub
              </h2>
              <p className="text-slate-600 mb-4">
                BeyondWalls is proud to be an in5 Dubai incubator startup, part of the TECOM Group ecosystem. 
                in5 is Dubai's leading innovation hub that enables tech, media, and design entrepreneurs 
                to transform their ideas into successful businesses.
              </p>
              <p className="text-slate-600 mb-6">
                Being part of in5 gives us access to world-class facilities, mentorship, and a vibrant 
                community of innovators in Dubai Internet City - the region's largest technology hub.
              </p>
              <div className="flex items-center gap-3 text-slate-700">
                <MapPin className="w-5 h-5 text-violet-600" />
                <span>in5 - Dubai Internet City - Dubai - United Arab Emirates</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-violet-100 to-indigo-100 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Platform Highlights</h3>
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4">
                  <p className="text-2xl font-bold text-violet-600">8+</p>
                  <p className="text-slate-600">Venue Partners</p>
                </div>
                <div className="bg-white rounded-xl p-4">
                  <p className="text-2xl font-bold text-violet-600">25+</p>
                  <p className="text-slate-600">Advertisers on Waitlist</p>
                </div>
                <div className="bg-white rounded-xl p-4">
                  <p className="text-2xl font-bold text-violet-600">$25,000+</p>
                  <p className="text-slate-600">Pending Bookings</p>
                </div>
                <div className="bg-white rounded-xl p-4">
                  <p className="text-2xl font-bold text-violet-600">70/30</p>
                  <p className="text-slate-600">Revenue Split (Venue/Platform)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-violet-100 text-violet-600 mb-4">Our Team</Badge>
            <h2 className="text-3xl font-bold text-slate-900">Meet the Leadership</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {team.map((member, i) => (
              <Card key={i} className="border-0 shadow-lg overflow-hidden">
                <img src={member.image} alt={member.name} className="w-full h-56 object-cover" />
                <CardContent className="p-4 text-center">
                  <h3 className="font-bold text-slate-900">{member.name}</h3>
                  <p className="text-sm text-slate-500">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Social Links */}
          <div className="mt-12 text-center">
            <p className="text-slate-500 mb-4">Follow us on social media</p>
            <div className="flex justify-center gap-4">
              <a href="https://x.com/BeyondWallsae" target="_blank" rel="noopener noreferrer" 
                 className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors">
                𝕏
              </a>
              <a href="https://www.instagram.com/beyondwallsae/" target="_blank" rel="noopener noreferrer"
                 className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center hover:opacity-80 transition-opacity">
                IG
              </a>
              <a href="https://www.youtube.com/@BeyondWallsAE" target="_blank" rel="noopener noreferrer"
                 className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
                YT
              </a>
              <a href="https://www.facebook.com/beyondwallsae" target="_blank" rel="noopener noreferrer"
                 className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                FB
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-violet-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Advertising?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join hundreds of businesses already growing with BeyondWalls
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Register")}>
              <Button size="lg" className="bg-violet-100 text-slate-900 hover:bg-violet-100/90">
                <Megaphone className="w-5 h-5 mr-2" />
                Start Advertising
              </Button>
            </Link>
            <Link to={createPageUrl("Contact")}>
              <Button size="lg" className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-violet-600">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}