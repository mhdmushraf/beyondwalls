import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  MonitorPlay,
  ArrowRight,
  Target,
  Users,
  Globe,
  Award,
  CheckCircle2,
  Building2,
  Megaphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    { year: "2022", title: "Founded", description: "BeyondWalls was born with a vision to revolutionize DOOH" },
    { year: "2023", title: "100+ Screens", description: "Reached our first major milestone of 100 active screens" },
    { year: "2024", title: "500+ Screens", description: "Expanded to 500+ screens across premium venues" },
    { year: "2025", title: "UAE Leader", description: "Became the #1 self-serve DOOH platform in the UAE" }
  ];

  const team = [
    { name: "Mohammed Al Rashid", role: "CEO & Founder", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop" },
    { name: "Sarah Ahmed", role: "COO", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" },
    { name: "Omar Hassan", role: "CTO", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" },
    { name: "Fatima Al Ali", role: "Head of Sales", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#2C3E50] to-[#667EEA] rounded-xl flex items-center justify-center shadow-lg">
              <MonitorPlay className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-[#2C3E50]">BeyondWalls</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to={createPageUrl("Home")} className="text-slate-600 hover:text-[#2C3E50] font-medium">Home</Link>
            <Link to={createPageUrl("Services")} className="text-slate-600 hover:text-[#2C3E50] font-medium">Services</Link>
            <Link to={createPageUrl("Contact")} className="text-slate-600 hover:text-[#2C3E50] font-medium">Contact</Link>
          </div>
          <Link to={createPageUrl("Register")}>
            <Button className="bg-gradient-to-r from-[#2C3E50] to-[#667EEA]">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-[#2C3E50]/5 via-white to-[#667EEA]/5">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-[#F5D547] text-[#2C3E50] mb-6">About Us</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2C3E50] mb-6">
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
              <Badge className="bg-[#667EEA]/10 text-[#667EEA] mb-4">Our Mission</Badge>
              <h2 className="text-3xl font-bold text-[#2C3E50] mb-6">
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
                    <CheckCircle2 className="w-5 h-5 text-[#667EEA]" />
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
              <div className="absolute -bottom-6 -left-6 bg-[#F5D547] rounded-2xl p-6 shadow-lg">
                <p className="text-3xl font-bold text-[#2C3E50]">500+</p>
                <p className="text-[#2C3E50]">Active Screens</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-[#667EEA]/10 text-[#667EEA] mb-4">Our Values</Badge>
            <h2 className="text-3xl font-bold text-[#2C3E50]">What Drives Us</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <Card key={i} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#2C3E50] to-[#667EEA] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-[#2C3E50] mb-2">{value.title}</h3>
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
            <Badge className="bg-[#F5D547] text-[#2C3E50] mb-4">Our Journey</Badge>
            <h2 className="text-3xl font-bold text-[#2C3E50]">Milestones</h2>
          </div>
          <div className="space-y-8">
            {milestones.map((milestone, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="w-20 h-20 bg-gradient-to-br from-[#2C3E50] to-[#667EEA] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">{milestone.year}</span>
                </div>
                <div className="flex-1 bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="text-xl font-bold text-[#2C3E50] mb-2">{milestone.title}</h3>
                  <p className="text-slate-600">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-[#667EEA]/10 text-[#667EEA] mb-4">Our Team</Badge>
            <h2 className="text-3xl font-bold text-[#2C3E50]">Meet the Leadership</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <Card key={i} className="border-0 shadow-lg overflow-hidden">
                <img src={member.image} alt={member.name} className="w-full h-48 object-cover" />
                <CardContent className="p-4 text-center">
                  <h3 className="font-bold text-[#2C3E50]">{member.name}</h3>
                  <p className="text-sm text-slate-500">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#2C3E50] to-[#667EEA]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Advertising?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join hundreds of businesses already growing with BeyondWalls
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Register")}>
              <Button size="lg" className="bg-[#F5D547] text-[#2C3E50] hover:bg-[#F5D547]/90">
                <Megaphone className="w-5 h-5 mr-2" />
                Start Advertising
              </Button>
            </Link>
            <Link to={createPageUrl("Contact")}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-[#2C3E50] text-center">
        <p className="text-slate-400">© 2024 BeyondWalls. All rights reserved.</p>
      </footer>
    </div>
  );
}