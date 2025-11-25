import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import {
  MonitorPlay,
  ArrowRight,
  CheckCircle2,
  MapPin,
  TrendingUp,
  Zap,
  Shield,
  Building2,
  Target,
  Play,
  ChevronRight,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const auth = await base44.auth.isAuthenticated();
    setIsAuthenticated(auth);
  };

  const stats = [
    { value: "500+", label: "Active Screens" },
    { value: "1M+", label: "Daily Impressions" },
    { value: "200+", label: "Premium Venues" },
    { value: "98%", label: "Uptime" }
  ];

  const features = [
    {
      icon: Target,
      title: "Precision Targeting",
      description: "Reach your audience at the right place and time with location-based targeting"
    },
    {
      icon: Zap,
      title: "Instant Activation",
      description: "Go live within 30 minutes of approval with our automated workflow"
    },
    {
      icon: TrendingUp,
      title: "Real-time Analytics",
      description: "Track impressions, engagement, and ROI with our advanced dashboard"
    },
    {
      icon: Shield,
      title: "Brand Safe",
      description: "Premium venues only - restaurants, malls, gyms, and coworking spaces"
    }
  ];

  const venueTypes = [
    { name: "Restaurants & Cafés", count: "80+", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop" },
    { name: "Shopping Malls", count: "25+", image: "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=400&h=300&fit=crop" },
    { name: "Fitness Centers", count: "45+", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop" },
    { name: "Coworking Spaces", count: "50+", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#2C3E50] to-[#667EEA] rounded-xl flex items-center justify-center shadow-lg">
              <MonitorPlay className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-[#2C3E50]">
              BeyondWalls
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-slate-600 hover:text-[#2C3E50] font-medium transition-colors">Features</a>
            <a href="#venues" className="text-slate-600 hover:text-[#2C3E50] font-medium transition-colors">Venues</a>
            <Link to={createPageUrl("About")} className="text-slate-600 hover:text-[#2C3E50] font-medium transition-colors">About</Link>
            <Link to={createPageUrl("Contact")} className="text-slate-600 hover:text-[#2C3E50] font-medium transition-colors">Contact</Link>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to={createPageUrl("AdvertiserDashboard")}>
                <Button className="bg-gradient-to-r from-[#2C3E50] to-[#667EEA]">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="hidden sm:flex text-[#2C3E50]"
                  onClick={() => base44.auth.redirectToLogin()}
                >
                  Sign In
                </Button>
                <Link to={createPageUrl("Register")}>
                  <Button className="bg-gradient-to-r from-[#2C3E50] to-[#667EEA]">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2C3E50]/5 via-white to-[#667EEA]/10" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-[#667EEA]/20 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#F5D547]/20 rounded-full blur-3xl opacity-30" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-3xl">
            <Badge className="bg-[#F5D547] text-[#2C3E50] px-4 py-1.5 text-sm font-medium mb-6">
              🚀 #1 DOOH Platform in UAE
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#2C3E50] leading-tight mb-6">
              Advertise on
              <span className="bg-gradient-to-r from-[#667EEA] to-[#2C3E50] bg-clip-text text-transparent"> premium screens </span>
              everywhere
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              The self-serve marketplace connecting advertisers with high-traffic venues. 
              Book screens in cafés, malls, and gyms across the UAE in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={createPageUrl("Register")}>
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-[#2C3E50] to-[#667EEA] h-14 px-8 text-lg shadow-xl">
                  Start Advertising
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl("HowItWorks")}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg border-2 border-[#2C3E50] text-[#2C3E50]">
                  <Play className="w-5 h-5 mr-2" />
                  How It Works
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50"
              >
                <p className="text-3xl md:text-4xl font-bold text-[#667EEA]">
                  {stat.value}
                </p>
                <p className="text-slate-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-[#667EEA]/10 text-[#667EEA] mb-4">Features</Badge>
            <h2 className="text-4xl font-bold text-[#2C3E50] mb-4">
              Everything you need to run successful campaigns
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Our platform makes it easy to create, launch, and optimize your DOOH advertising
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-8 border border-slate-100 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-[#2C3E50] to-[#667EEA] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#2C3E50] mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Venue Types */}
      <section id="venues" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-[#F5D547] text-[#2C3E50] mb-4">Venues</Badge>
            <h2 className="text-4xl font-bold text-[#2C3E50] mb-4">
              Premium locations across the UAE
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Reach your audience in high-traffic venues where they spend their time
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {venueTypes.map((venue, index) => (
              <div 
                key={index}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer"
              >
                <img 
                  src={venue.image} 
                  alt={venue.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-white font-bold text-lg">{venue.name}</p>
                  <p className="text-white/80 text-sm">{venue.count} venues</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#2C3E50] to-[#667EEA] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-white/5" style={{backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px"}} />
        
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to go beyond traditional advertising?
          </h2>
          <p className="text-xl text-white/80 mb-10">
            Join hundreds of advertisers already reaching millions of viewers daily
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Register")}>
              <Button size="lg" className="w-full sm:w-auto bg-[#F5D547] text-[#2C3E50] hover:bg-[#F5D547]/90 h-14 px-8 text-lg">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl("Register")}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg border-2 border-white/30 text-white hover:bg-white/10">
                List Your Venue
                <Building2 className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-[#2C3E50]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#667EEA] to-[#F5D547] rounded-xl flex items-center justify-center">
                  <MonitorPlay className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white">BeyondWalls</span>
              </div>
              <p className="text-slate-400 text-sm">The #1 self-serve DOOH advertising platform in the UAE.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <div className="space-y-2 text-sm">
                <Link to={createPageUrl("About")} className="block text-slate-400 hover:text-white">About Us</Link>
                <Link to={createPageUrl("Services")} className="block text-slate-400 hover:text-white">Services</Link>
                <Link to={createPageUrl("Blog")} className="block text-slate-400 hover:text-white">Blog</Link>
                <Link to={createPageUrl("Contact")} className="block text-slate-400 hover:text-white">Contact</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <div className="space-y-2 text-sm">
                <Link to={createPageUrl("HowItWorks")} className="block text-slate-400 hover:text-white">How It Works</Link>
                <Link to={createPageUrl("ScreenLocations")} className="block text-slate-400 hover:text-white">Screen Locations</Link>
                <Link to={createPageUrl("HelpCenter")} className="block text-slate-400 hover:text-white">Help Center</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <p>info@beyondwalls.ae</p>
                <p>+971 55 614 0067</p>
                <p>Dubai, UAE</p>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm">
              © 2024 BeyondWalls. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link to={createPageUrl("Terms")} className="text-slate-400 hover:text-white">Terms of Service</Link>
              <Link to={createPageUrl("Privacy")} className="text-slate-400 hover:text-white">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}