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
  Play,
  CheckCircle2,
  Users,
  BarChart3,
  Clock,
  DollarSign,
  Globe,
  Sparkles,
  Star,
  MapPin,
  Wallet,
  PieChart,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead, { PAGE_SEO } from "@/components/SEOHead";
import PublicAIChatWidget from "@/components/chat/PublicAIChatWidget";

export default function Home() {
  const stats = [
    { value: "500+", label: "Active Screens", icon: MonitorPlay },
    { value: "1M+", label: "Daily Impressions", icon: TrendingUp },
    { value: "200+", label: "Premium Venues", icon: Building2 },
    { value: "98%", label: "Uptime", icon: Zap }
  ];

  const advertiserBenefits = [
    { icon: Target, title: "Precision Targeting", desc: "Location, time, and venue-type targeting" },
    { icon: Clock, title: "Go Live in 30 mins", desc: "Instant campaign activation" },
    { icon: BarChart3, title: "Real-time Analytics", desc: "Track impressions & ROI live" },
    { icon: DollarSign, title: "Pay Per Screen", desc: "No hidden fees, transparent pricing" },
    { icon: Sparkles, title: "AI Campaign Builder", desc: "Let AI optimize your ads" },
    { icon: Shield, title: "Brand Safe", desc: "Premium venues only" }
  ];

  const venueBenefits = [
    { icon: Wallet, title: "70% Revenue Share", desc: "Highest in the industry" },
    { icon: MonitorPlay, title: "Easy Setup", desc: "Works on any smart TV" },
    { icon: PieChart, title: "Earnings Dashboard", desc: "Track revenue in real-time" },
    { icon: Shield, title: "Full Control", desc: "Approve ads before they run" }
  ];

  const venueTypes = [
    { 
      name: "Restaurants & Cafés", 
      count: "80+", 
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop",
      description: "Reach diners during meals"
    },
    { 
      name: "Shopping Malls", 
      count: "25+", 
      image: "https://images.unsplash.com/photo-1567449303078-57ad995bd17f?w=600&h=400&fit=crop",
      description: "High-traffic retail zones"
    },
    { 
      name: "Fitness Centers", 
      count: "45+", 
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop",
      description: "Health-conscious audience"
    },
    { 
      name: "Coworking Spaces", 
      count: "50+", 
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
      description: "Business professionals"
    },
    { 
      name: "Hotels & Lobbies", 
      count: "30+", 
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop",
      description: "Tourists & travelers"
    },
    { 
      name: "Clinics & Hospitals", 
      count: "20+", 
      image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop",
      description: "Healthcare sector"
    }
  ];

  const howItWorks = [
    { step: "1", title: "Choose Screens", desc: "Browse 500+ screens across UAE and select locations that match your target audience" },
    { step: "2", title: "Upload Creative", desc: "Upload your image or video ad. Our AI can help you create one if needed" },
    { step: "3", title: "Set Budget & Duration", desc: "Pay per screen per week. No minimums, no long-term commitments" },
    { step: "4", title: "Go Live & Track", desc: "Your ad goes live within 30 minutes. Track performance in real-time" }
  ];

  const testimonials = [
    {
      quote: "BeyondWalls helped us reach customers in premium cafés across Dubai. Our brand visibility increased by 300%!",
      author: "Ahmed K.",
      role: "Marketing Director, Food Brand",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
    },
    {
      quote: "As a gym owner, I earn passive income from my screens while displaying relevant fitness ads to my members.",
      author: "Sara M.",
      role: "Owner, FitZone Dubai",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
    },
    {
      quote: "The self-serve platform is incredibly easy. We launched our campaign in under an hour!",
      author: "Ravi P.",
      role: "CEO, Tech Startup",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
    }
  ];

  const cities = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "RAK"];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead {...PAGE_SEO.home} />
      <PublicNav />

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-indigo-50" />
        <div className="absolute top-10 right-10 w-[600px] h-[600px] bg-violet-200 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-indigo-300 rounded-full blur-3xl opacity-20" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700 border-0 px-4 py-2 text-sm font-semibold mb-6">
                🚀 UAE's #1 Self-Serve DOOH Platform
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Advertise on
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent"> Digital Screens </span>
                Across UAE
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Book ad space on screens in cafés, malls, gyms, and more. 
                <span className="font-semibold text-slate-800"> Start from AED 99/week.</span> No contracts, instant activation.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link to={createPageUrl("Register")}>
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 h-14 px-8 text-lg shadow-xl shadow-violet-500/25">
                    Start Advertising
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to={createPageUrl("HowItWorks")}>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg border-2">
                    <Play className="w-5 h-5 mr-2" />
                    Watch Demo
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="flex -space-x-2">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop" className="w-8 h-8 rounded-full border-2 border-white" alt="" />
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop" className="w-8 h-8 rounded-full border-2 border-white" alt="" />
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop" className="w-8 h-8 rounded-full border-2 border-white" alt="" />
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600">+99</div>
                </div>
                <span>Trusted by <span className="font-semibold text-slate-700">100+ advertisers</span> in UAE</span>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-violet-500/20">
                <img 
                  src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop" 
                  alt="Digital advertising screens in modern venue"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-violet-900/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Live Campaign Performance</p>
                        <p className="text-2xl font-bold text-slate-900">12,847 <span className="text-sm text-emerald-600">impressions today</span></p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-emerald-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Cards */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">30 min</p>
                    <p className="text-xs text-slate-500">Go Live Time</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Star className="w-5 h-5 text-amber-600 fill-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">4.9/5</p>
                    <p className="text-xs text-slate-500">User Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-xl flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                    <p className="text-slate-600 text-sm">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cities Banner */}
      <section className="py-6 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            <span className="text-slate-400 text-sm font-medium">Available in:</span>
            {cities.map((city, i) => (
              <div key={i} className="flex items-center gap-2 text-white">
                <MapPin className="w-4 h-4 text-violet-400" />
                <span className="font-medium">{city}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is BeyondWalls */}
      <section className="py-20 px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="bg-violet-100 text-violet-700 border-0 mb-4">What is BeyondWalls?</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                The Airbnb of Outdoor Advertising
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                BeyondWalls is UAE's first <span className="font-semibold">self-serve marketplace</span> for Digital Out-of-Home (DOOH) advertising. 
                We connect businesses who want to advertise with venues that have digital screens.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">For Advertisers</p>
                    <p className="text-slate-600">Book screens in premium venues, reach your target audience, pay only for what you use</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">For Venue Owners</p>
                    <p className="text-slate-600">Monetize your screens, earn 70% revenue share, fully automated management</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img 
                src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&h=500&fit=crop" 
                alt="Modern office building" 
                className="rounded-2xl shadow-xl w-full h-64 object-cover"
              />
              <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop" 
                alt="Coworking space" 
                className="rounded-2xl shadow-xl w-full h-48 object-cover mt-8"
              />
              <img 
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop" 
                alt="Restaurant interior" 
                className="rounded-2xl shadow-xl w-full h-48 object-cover -mt-4"
              />
              <img 
                src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=500&fit=crop" 
                alt="Gym interior" 
                className="rounded-2xl shadow-xl w-full h-64 object-cover -mt-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-indigo-100 text-indigo-700 border-0 mb-4">Simple Process</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Launch Your Campaign in 4 Easy Steps
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              From signup to live ads in under 30 minutes
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {howItWorks.map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl p-8 h-full border border-violet-100 hover:shadow-xl transition-all">
                  <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-6 shadow-lg shadow-violet-500/25">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600">{item.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-violet-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Advertisers */}
      <section className="py-20 px-6 bg-gradient-to-br from-violet-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "30px 30px"}} />
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-white/20 text-white border-0 mb-4">For Advertisers</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Reach Your Customers Where They Are
              </h2>
              <p className="text-xl text-white/80 mb-8">
                Display your ads on premium screens in high-traffic venues across the UAE. 
                Target by location, venue type, and time of day.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {advertiserBenefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{benefit.title}</p>
                      <p className="text-white/70 text-sm">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link to={createPageUrl("Register")}>
                <Button size="lg" className="bg-white text-violet-600 hover:bg-slate-100 h-14 px-8 text-lg">
                  Start Advertising Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=700&h=500&fit=crop" 
                alt="Team analyzing advertising campaign" 
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-xl max-w-xs">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-lg">+340%</p>
                    <p className="text-slate-500 text-sm">Avg. Brand Visibility Increase</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Venue Owners */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 relative">
              <img 
                src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=700&h=500&fit=crop" 
                alt="Modern café with digital screen" 
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-xl text-white">
                <div className="flex items-center gap-4">
                  <Wallet className="w-10 h-10" />
                  <div>
                    <p className="font-bold text-2xl">70%</p>
                    <p className="text-emerald-100">Revenue Share</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <Badge className="bg-emerald-100 text-emerald-700 border-0 mb-4">For Venue Owners</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Turn Your Screens Into Revenue Streams
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                Have a screen in your café, gym, or office? Monetize it! 
                Earn passive income while displaying relevant ads to your visitors.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {venueBenefits.map((benefit, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-4">
                    <benefit.icon className="w-8 h-8 text-emerald-600 mb-3" />
                    <p className="font-semibold text-slate-900">{benefit.title}</p>
                    <p className="text-slate-600 text-sm">{benefit.desc}</p>
                  </div>
                ))}
              </div>

              <Link to={createPageUrl("Register")}>
                <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 h-14 px-8 text-lg">
                  List Your Venue
                  <Building2 className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Venue Types */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-indigo-100 text-indigo-700 border-0 mb-4">Screen Locations</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Premium Venues Across UAE
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Reach your audience in high-traffic locations where they live, work, and play
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <Badge className="bg-white/20 text-white border-0 mb-2">{venue.count} venues</Badge>
                  <p className="text-white font-bold text-xl">{venue.name}</p>
                  <p className="text-white/80 text-sm">{venue.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to={createPageUrl("ScreenLocations")}>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-2">
                View All Locations
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-amber-100 text-amber-700 border-0 mb-4">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              What Our Users Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <Card key={i} className="border-0 shadow-xl hover:shadow-2xl transition-all">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-4">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className="w-5 h-5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 mb-6 leading-relaxed">"{t.quote}"</p>
                  <div className="flex items-center gap-4">
                    <img src={t.avatar} alt={t.author} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold text-slate-900">{t.author}</p>
                      <p className="text-slate-500 text-sm">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 px-6 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3 text-white">
              <Award className="w-8 h-8 text-amber-400" />
              <div>
                <p className="font-bold">in5 Dubai</p>
                <p className="text-slate-400 text-sm">Startup Member</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white">
              <Shield className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="font-bold">SSL Secured</p>
                <p className="text-slate-400 text-sm">256-bit Encryption</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white">
              <Globe className="w-8 h-8 text-blue-400" />
              <div>
                <p className="font-bold">UAE Based</p>
                <p className="text-slate-400 text-sm">Local Support</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white">
              <Users className="w-8 h-8 text-violet-400" />
              <div>
                <p className="font-bold">100+ Clients</p>
                <p className="text-slate-400 text-sm">And Growing</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px"}} />
        </div>
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Grow Beyond Traditional Advertising?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join 100+ businesses already reaching millions of viewers daily across UAE's premium venues
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Register")}>
              <Button size="lg" className="w-full sm:w-auto bg-white text-violet-600 hover:bg-slate-100 h-14 px-8 text-lg shadow-xl">
                Start Advertising Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl("Contact")}>
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg border-2 border-white bg-transparent text-white hover:bg-white hover:text-violet-600">
                Talk to Sales
              </Button>
            </Link>
          </div>
          <p className="text-white/60 mt-6 text-sm">No credit card required • Setup in 5 minutes</p>
        </div>
      </section>

      <PublicFooter />
      <PublicAIChatWidget />
    </div>
  );
}