import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  MonitorPlay,
  ArrowRight,
  Target,
  TrendingUp,
  Zap,
  Shield,
  Building2,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead, { PAGE_SEO } from "@/components/SEOHead";
import PublicAIChatWidget from "@/components/chat/PublicAIChatWidget";

export default function Home() {
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
      <SEOHead {...PAGE_SEO.home} />
      <PublicNav />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-indigo-50" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-violet-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-30" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-3xl">
            <Badge className="bg-violet-100 text-violet-700 border-violet-200 px-4 py-1.5 text-sm font-medium mb-6">
              🚀 #1 DOOH Platform in UAE
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight mb-6">
              Advertise on
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent"> premium screens </span>
              everywhere
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              The self-serve marketplace connecting advertisers with high-traffic venues. 
              Book screens in cafés, malls, and gyms across the UAE in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={createPageUrl("Register")}>
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 h-14 px-8 text-lg shadow-xl shadow-violet-500/25">
                  Start Advertising
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl("HowItWorks")}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg border-2">
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
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
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
            <Badge className="bg-violet-100 text-violet-700 border-violet-200 mb-4">Features</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
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
                className="bg-white rounded-2xl p-8 border border-slate-100 hover:shadow-xl hover:shadow-violet-100 transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-violet-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
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
            <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 mb-4">Venues</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
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
      <section className="py-24 px-6 bg-gradient-to-br from-violet-600 to-indigo-600 relative overflow-hidden">
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
              <Button size="lg" className="w-full sm:w-auto bg-white text-violet-600 hover:bg-slate-100 h-14 px-8 text-lg">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl("Register")}>
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg border-2 border-white bg-transparent text-white hover:bg-white hover:text-violet-600">
                List Your Venue
                <Building2 className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
      <PublicAIChatWidget />
    </div>
  );
}