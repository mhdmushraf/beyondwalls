import React, { useState } from "react";
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
  Trophy,
  TrendingUp,
  Zap,
  Shield,
  DollarSign,
  Rocket,
  Lightbulb,
  BarChart3,
  ArrowRight
} from "lucide-react";
import InvestorInquiryModal from "@/components/InvestorInquiryModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead, { PAGE_SEO } from "@/components/SEOHead";
import PublicAIChatWidget from "@/components/chat/PublicAIChatWidget";

export default function About() {
  const [showInvestorModal, setShowInvestorModal] = useState(false);
  
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
    { year: "Jun 2025", title: "The Idea is Born", description: "BeyondWalls concept was created with a vision to revolutionize DOOH advertising in the UAE" },
    { year: "Nov 2025", title: "Global Recognition Award", description: "Received 2025 Global Recognition Award for innovation in the DOOH advertising sector" },
    { year: "Dec 2025", title: "in5 Dubai Incubator", description: "Officially incorporated under in5 Dubai incubator program, part of TECOM Group ecosystem" },
    { year: "Dec 2025", title: "Soft Launch", description: "Platform soft launch with 8+ venue partners and 25+ advertisers on waitlist" },
    { year: "Jan 2026", title: "Official Launch", description: "Grand official launch of BeyondWalls platform across UAE" }
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
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-violet-50 via-white to-indigo-50 relative overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-violet-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-30" />
        <div className="max-w-5xl mx-auto text-center relative">
          <Badge className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 px-4 py-2 mb-6">
            🚀 Disrupting a $45B Global Market
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            The Future of
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent"> Digital Advertising </span>
            is Here
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            BeyondWalls is UAE's first self-serve marketplace for Digital Out-of-Home (DOOH) advertising. 
            We're democratizing access to premium screen advertising while creating passive income streams for venues.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Founded June 2025</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>in5 Dubai Incubated</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>Global Recognition Award 2025</span>
            </div>
          </div>
        </div>
      </section>

      {/* Market Opportunity - NEW SECTION FOR INVESTORS */}
      <section className="py-16 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-amber-500/20 text-amber-400 border-0 mb-4">Market Opportunity</Badge>
            <h2 className="text-3xl font-bold mb-4">A Massive Untapped Market</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
              <p className="text-4xl font-bold text-violet-400 mb-2">$45B</p>
              <p className="text-slate-400">Global DOOH Market by 2027</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
              <p className="text-4xl font-bold text-emerald-400 mb-2">$1.2B</p>
              <p className="text-slate-400">MENA DOOH Market Size</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
              <p className="text-4xl font-bold text-amber-400 mb-2">12.4%</p>
              <p className="text-slate-400">Annual Growth Rate (CAGR)</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
              <p className="text-4xl font-bold text-rose-400 mb-2">90%</p>
              <p className="text-slate-400">SMBs Can't Access DOOH</p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-slate-400 max-w-2xl mx-auto">
              Traditional DOOH requires minimum budgets of $10,000+ and weeks of planning. 
              BeyondWalls reduces entry costs by 90% and launch times from weeks to 30 minutes.
            </p>
          </div>
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
                BeyondWalls was born in June 2025 with a simple belief: every business deserves access to 
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
            <div className="w-32 h-32 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-xl shadow-amber-500/30">
              <Trophy className="w-16 h-16 text-white" />
            </div>
            <div>
              <Badge className="bg-amber-200 text-amber-800 mb-4">November 2025 • Global Recognition Award</Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                Award-Winning Innovation in DOOH Advertising
              </h2>
              <p className="text-slate-600 mb-4">
                In November 2025, BeyondWalls received the prestigious Global Recognition Award for its innovative 
                approach to restructuring the out-of-home advertising sector through technology and an accessible 
                business model.
              </p>
              <p className="text-slate-600">
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
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a3bad1f286c6fe7d00ba/700c3204b_image.png" 
                  alt="in5 Dubai Logo" 
                  className="h-12 object-contain"
                />
                <Badge className="bg-violet-100 text-violet-600">Official Partner</Badge>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Incubated by in5 Dubai
              </h2>
              <p className="text-slate-600 mb-4">
                As of December 2025, BeyondWalls is officially incorporated under the in5 Dubai incubator program, 
                part of the prestigious TECOM Group ecosystem. in5 is Dubai's leading innovation hub that enables 
                tech, media, and design entrepreneurs to transform their ideas into successful businesses.
              </p>
              <p className="text-slate-600 mb-6">
                Being part of in5 gives us access to world-class facilities, mentorship from industry experts, 
                and a vibrant community of innovators in Dubai Internet City - the region's largest technology hub.
              </p>
              <div className="flex items-center gap-3 text-slate-700">
                <MapPin className="w-5 h-5 text-violet-600" />
                <span>in5 Tech - Dubai Internet City - Dubai - UAE</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-violet-100 to-indigo-100 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">Platform Highlights</h3>
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

      {/* Why Invest / Competitive Advantage */}
      <section className="py-20 px-6 bg-gradient-to-br from-violet-50 to-indigo-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-violet-100 text-violet-600 mb-4">Competitive Advantage</Badge>
            <h2 className="text-3xl font-bold text-slate-900">Why BeyondWalls Wins</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center mb-4">
                  <Zap className="w-7 h-7 text-violet-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">First-Mover Advantage</h3>
                <p className="text-slate-600">First self-serve DOOH platform in UAE. No direct competitors in the self-serve SMB segment.</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Asset-Light Model</h3>
                <p className="text-slate-600">We don't own screens. Venues bring their own, creating infinite scalability with minimal CAPEX.</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
                  <DollarSign className="w-7 h-7 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Recurring Revenue</h3>
                <p className="text-slate-600">30% platform commission on every transaction. Weekly recurring campaigns drive predictable revenue.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-violet-100 text-violet-600 mb-4">Our Team</Badge>
            <h2 className="text-3xl font-bold text-slate-900">Meet the Founders</h2>
            <p className="text-slate-600 mt-4 max-w-2xl mx-auto">
              A passionate team with deep expertise in technology, advertising, and business development.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {team.map((member, i) => (
              <Card key={i} className="border-0 shadow-xl overflow-hidden group">
                <div className="relative">
                  <img src={member.image} alt={member.name} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-bold text-xl">{member.name}</h3>
                    <p className="text-violet-300">{member.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {/* Social Links */}
          <div className="mt-12 text-center">
            <p className="text-slate-500 mb-4">Connect with us</p>
            <div className="flex justify-center gap-4">
              <a href="https://x.com/BeyondWallsae" target="_blank" rel="noopener noreferrer" 
                 className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-slate-700 transition-colors">
                𝕏
              </a>
              <a href="https://www.instagram.com/beyondwallsae/" target="_blank" rel="noopener noreferrer"
                 className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity">
                IG
              </a>
              <a href="https://www.youtube.com/@BeyondWallsAE" target="_blank" rel="noopener noreferrer"
                 className="w-12 h-12 bg-red-600 text-white rounded-xl flex items-center justify-center hover:bg-red-700 transition-colors">
                YT
              </a>
              <a href="https://www.facebook.com/beyondwallsae" target="_blank" rel="noopener noreferrer"
                 className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors">
                FB
              </a>
              <a href="https://www.linkedin.com/company/beyondwallsae" target="_blank" rel="noopener noreferrer"
                 className="w-12 h-12 bg-blue-700 text-white rounded-xl flex items-center justify-center hover:bg-blue-800 transition-colors">
                in
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Traction Section - NEW */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-emerald-100 text-emerald-700 mb-4">Traction</Badge>
            <h2 className="text-3xl font-bold text-slate-900">Early Validation</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <p className="text-4xl font-bold text-violet-600 mb-2">8+</p>
              <p className="text-slate-600">Venue Partners Onboarded</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <p className="text-4xl font-bold text-emerald-600 mb-2">25+</p>
              <p className="text-slate-600">Advertisers on Waitlist</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <p className="text-4xl font-bold text-amber-600 mb-2">$25K+</p>
              <p className="text-slate-600">Pending Booking Value</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <p className="text-4xl font-bold text-rose-600 mb-2">50+</p>
              <p className="text-slate-600">Screen Capacity</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px"}} />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <Badge className="bg-white/20 text-white border-0 mb-6">Join the Revolution</Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Be Part of the Future?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Whether you're an advertiser, venue owner, or investor - there's a place for you in the BeyondWalls ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Register")}>
              <Button size="lg" className="bg-white text-violet-600 hover:bg-slate-100 h-14 px-8">
                <Megaphone className="w-5 h-5 mr-2" />
                Start Advertising
              </Button>
            </Link>
            <Link to={createPageUrl("Connect")}>
              <Button size="lg" className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-violet-600 h-14 px-8">
                <Building2 className="w-5 h-5 mr-2" />
                Partner With Us
              </Button>
            </Link>
            <Button size="lg" className="border-2 border-amber-400 bg-amber-400/20 text-white hover:bg-amber-400 hover:text-slate-900 h-14 px-8" onClick={() => setShowInvestorModal(true)}>
              <TrendingUp className="w-5 h-5 mr-2" />
              Investor Inquiries
            </Button>
          </div>
          <p className="text-white/60 mt-8 text-sm">
            Contact: partnership@beyondwalls.ae | +971 55 614 0067
          </p>
        </div>
      </section>

      <PublicFooter />
      <PublicAIChatWidget />
      <InvestorInquiryModal open={showInvestorModal} onClose={() => setShowInvestorModal(false)} />
    </div>
  );
}