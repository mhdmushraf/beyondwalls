import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
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
  Award,
  Rocket
} from "lucide-react";
import InvestorInquiryModal from "@/components/InvestorInquiryModal";
import PersonalizedHero from "@/components/personalization/PersonalizedHero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead, { PAGE_SEO } from "@/components/SEOHead";
import FAQSection, { buildFAQSchema } from "@/components/marketing/FAQSection";
import PublicAIChatWidget from "@/components/chat/PublicAIChatWidget";
import ARFeatureSection from "@/components/home/ARFeatureSection";
import BOneShowcase from "@/components/home/BOneShowcase";

import RestaurantDOOHStats from "@/components/home/RestaurantDOOHStats";
import VenueOwnerBenefits from "@/components/home/VenueOwnerBenefits";

export default function Home() {
  const [showInvestorModal, setShowInvestorModal] = useState(false);
  const navigate = useNavigate();

  // Redirect already-logged-in visitors to their dashboard — but NEVER block
  // rendering the homepage on it. The page is public: crawlers and first-time
  // visitors must see content immediately, not a spinner waiting on an auth
  // round-trip (which previously hung the whole page when the call stalled).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth && !cancelled) {
          navigate(createPageUrl("Workspace"), { replace: true });
        }
      } catch (e) {
        // Not logged in — stay on the homepage.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const stats = [
    { value: "Self-serve", label: "Booking & checkout", icon: Zap },
    { value: "From AED 99", label: "Per screen / week", icon: DollarSign },
    { value: "Proof of play", label: "On every ad", icon: Play },
    { value: "24/7", label: "Screen monitoring", icon: Clock }
  ];

  const advertiserBenefits = [
    { icon: Target, title: "2X More Impressions", desc: "100% more reach than traditional OOH" },
    { icon: Clock, title: "Go Live in 5 mins", desc: "Instant vs weeks of OOH setup" },
    { icon: BarChart3, title: "72% Recall Rate", desc: "Ads stick in captive audiences" },
    { icon: DollarSign, title: "90% Cost Savings", desc: "vs traditional billboard advertising" },
    { icon: Sparkles, title: "45+ Min Dwell Time", desc: "Not 2-second drive-by exposure" },
    { icon: Shield, title: "144+ Plays/Day", desc: "Maximum brand frequency" }
  ];

  const venueBenefits = [
    { icon: Wallet, title: "100% of Your Rate", desc: "Advertisers pay the service fee" },
    { icon: MonitorPlay, title: "Easy Setup", desc: "Works on any smart TV" },
    { icon: PieChart, title: "Earnings Dashboard", desc: "Track revenue in real-time" },
    { icon: Shield, title: "Full Control", desc: "Approve ads before they run" }
  ];

  const venueTypes = [
    { 
      name: "Restaurants & Cafés", 
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop&q=80",
      description: "Reach diners during meals"
    },
    { 
      name: "Shopping Malls", 
      image: "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=600&h=400&fit=crop&q=80",
      description: "High-traffic retail zones"
    },
    { 
      name: "Fitness Centers", 
      image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop&q=80",
      description: "Health-conscious audience"
    },
    { 
      name: "Coworking Spaces", 
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop&q=80",
      description: "Business professionals"
    },
    { 
      name: "Hotels & Lobbies", 
      image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop&q=80",
      description: "Tourists & travelers"
    },
    { 
      name: "Clinics & Hospitals", 
      image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&h=400&fit=crop&q=80",
      description: "Healthcare sector"
    }
  ];

  const howItWorks = [
    { step: "1", title: "Choose Screens", desc: "Browse available screens across UAE and select locations that match your target audience" },
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

  const homeFaqs = [
    {
      question: "What is Beyond Walls?",
      answer: "Beyond Walls is Dubai's leading self-serve digital out-of-home (DOOH) advertising platform. We connect advertisers with digital screens in cafés, gyms, malls, clinics, and co-working spaces across the UAE, with campaigns starting from AED 99 per week."
    },
    {
      question: "How much does digital screen advertising cost in Dubai?",
      answer: "Digital screen advertising on Beyond Walls starts from AED 99 per week per screen. There are no minimum spends, no long-term contracts, and no setup fees — you only pay for the screens and weeks you book."
    },
    {
      question: "How quickly can my campaign go live?",
      answer: "Once you upload your creative and complete checkout, your ad typically goes live within 30 minutes. There is no need for production crews or physical installation — everything is managed through our self-serve platform."
    },
    {
      question: "Where are Beyond Walls screens located?",
      answer: "Beyond Walls screens are located across Dubai, Abu Dhabi, Sharjah, Ajman, and RAK, in cafés, gyms, malls, clinics, co-working spaces, hotels, and retail stores throughout the UAE."
    },
    {
      question: "Can venue owners earn from their screens?",
      answer: "Yes. If you own a venue with digital screens, you can list them on Beyond Walls for free and earn passive income. Venue owners keep 100% of their screen rate and maintain full control over which ads appear."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        {...PAGE_SEO.home}
        structuredData={[
          {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Beyond Walls",
          "alternateName": "BeyondWalls",
          "url": "https://beyondwalls.ae",
          "logo": "https://media.base44.com/images/public/69b31183956b052c51ee3a67/b64097b04_beyondwalls-icon.png",
          "description": "Beyond Walls is a Dubai-based digital out-of-home (DOOH) advertising marketplace connecting advertisers with venues across the UAE.",
          "foundingLocation": { "@type": "Place", "name": "Dubai, United Arab Emirates" },
          "address": { "@type": "PostalAddress", "addressLocality": "Dubai", "addressCountry": "AE" },
          "areaServed": { "@type": "Country", "name": "United Arab Emirates" },
          "email": "hello@beyondwalls.ae",
          "sameAs": [
            "https://www.linkedin.com/company/beyondwallsae",
            "https://www.instagram.com/beyondwallsae/"
          ]
        },
        buildFAQSchema(homeFaqs)
        ]}
      />
      <PublicNav />

      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 lg:pt-28 pb-12 sm:pb-16 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-indigo-50" />
        <div className="absolute top-10 right-10 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-violet-200 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-10 left-10 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-indigo-300 rounded-full blur-3xl opacity-20" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <Badge className="bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700 border-0 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
                🚀 UAE's #1 Self-Serve DOOH Platform
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-4 sm:mb-6">
                Advertise on
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent"> Digital Screens </span>
                Across UAE
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 mb-6 sm:mb-8 leading-relaxed">
                Book ad space on screens in cafés, malls, gyms, and more. 
                <span className="font-semibold text-slate-800"> Start from AED 99/week.</span> No contracts, instant activation.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                <Link to={createPageUrl("Register")} className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg shadow-xl shadow-violet-500/25">
                    Start Advertising
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  </Button>
                </Link>
                <Link to={createPageUrl("HowItWorks")} className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg border-2">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Watch Demo
                  </Button>
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-500">
                <span>Now onboarding launch venues across Dubai</span>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-violet-500/20">
                <img 
                  src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop&q=80" 
                  alt="Digital advertising screens in modern venue"
                  className="w-full h-auto"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-violet-900/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-500">Every ad tracked</p>
                        <p className="text-2xl font-bold text-slate-900">Proof of play <span className="text-sm text-emerald-600">in real time</span></p>
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
                    <p className="font-bold text-slate-900">AED 99</p>
                    <p className="text-xs text-slate-500">From / week</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 sm:mt-16 lg:mt-20 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                    <p className="text-slate-600 text-xs sm:text-sm truncate">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Restaurant Network Stats */}
      <RestaurantDOOHStats />

      {/* AR Feature Section - Premium Feature Highlight */}
      <ARFeatureSection />

      {/* Cities Banner */}
      <section className="py-4 sm:py-6 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-8">
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
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div>
              <Badge className="bg-violet-100 text-violet-700 border-0 mb-3 sm:mb-4">What is BeyondWalls?</Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4 sm:mb-6">
                The Airbnb of Outdoor Advertising
              </h2>
              <p className="text-base sm:text-lg text-slate-600 mb-4 sm:mb-6 leading-relaxed">
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
                    <p className="text-slate-600">Monetize your screens, keep 100% of your rate, fully automated management</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img 
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=500&fit=crop&q=80" 
                alt="Modern office building" 
                className="rounded-2xl shadow-xl w-full h-64 object-cover"
                loading="lazy"
              />
              <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop&q=80" 
                alt="Coworking space" 
                className="rounded-2xl shadow-xl w-full h-48 object-cover mt-8"
                loading="lazy"
              />
              <img 
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&q=80" 
                alt="Restaurant interior" 
                className="rounded-2xl shadow-xl w-full h-48 object-cover -mt-4"
                loading="lazy"
              />
              <img 
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=500&fit=crop&q=80" 
                alt="Gym interior" 
                className="rounded-2xl shadow-xl w-full h-64 object-cover -mt-8"
                loading="lazy"
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

      {/* Plans CTA */}
      <section className="py-16 px-6 bg-gradient-to-r from-violet-50 to-indigo-50">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-violet-100 text-violet-700 border-0 mb-4">Account Types</Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
            Not sure which account type is right for you?
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Compare all four ways to use Beyond Walls — advertiser, venue owner, enterprise, or agency — and see exactly how the pricing works.
          </p>
          <Link to={createPageUrl("Plans")}>
            <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
              Compare Account Types
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
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
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=700&h=500&fit=crop&q=80" 
                alt="Team analyzing advertising campaign" 
                className="rounded-2xl shadow-2xl"
                loading="lazy"
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

      {/* For Venue Owners - Enhanced */}
      <VenueOwnerBenefits />

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
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6925a3bad1f286c6fe7d00ba/700c3204b_image.png" 
                alt="in5 Dubai" 
                className="h-10 object-contain brightness-0 invert"
              />
              <div>
                <p className="font-bold">in5 Dubai</p>
                <p className="text-slate-400 text-sm">Incubated Startup</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white">
              <Award className="w-8 h-8 text-amber-400" />
              <div>
                <p className="font-bold">Award Winner</p>
                <p className="text-slate-400 text-sm">Global Recognition 2025</p>
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
          </div>
        </div>
      </section>

      {/* Investor Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-amber-100 text-amber-700 border-0 mb-4">For Investors</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Disrupting a $45B Global Market
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                BeyondWalls is positioned to capture a significant share of the rapidly growing DOOH market 
                in the MENA region. Our asset-light, high-margin model creates sustainable value.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">First-Mover Advantage</p>
                    <p className="text-slate-500 text-sm">First self-serve DOOH platform in UAE</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Service Fee Model</p>
                    <p className="text-slate-500 text-sm">High-margin recurring revenue</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Award-Winning Innovation</p>
                    <p className="text-slate-500 text-sm">Global Recognition Award 2025</p>
                  </div>
                </div>
              </div>
              <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 h-14 px-8" onClick={() => setShowInvestorModal(true)}>
                Investor Inquiries
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                <p className="text-3xl font-bold text-violet-600 mb-1">$1.2B</p>
                <p className="text-slate-600 text-sm">MENA DOOH Market</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                <p className="text-3xl font-bold text-emerald-600 mb-1">12.4%</p>
                <p className="text-slate-600 text-sm">Annual Growth (CAGR)</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                <p className="text-3xl font-bold text-amber-600 mb-1">90%</p>
                <p className="text-slate-600 text-sm">Cost Reduction</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
                <p className="text-3xl font-bold text-rose-600 mb-1">30 min</p>
                <p className="text-slate-600 text-sm">Campaign Launch</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* B.One Product Showcase */}
      <BOneShowcase />

      <FAQSection faqs={homeFaqs} title="Frequently Asked Questions" subtitle="Everything you need to know about DOOH advertising with Beyond Walls" />

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px"}} />
        </div>
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Rocket className="w-5 h-5 text-white" />
            <span className="text-white font-medium">Official Launch: January 2026</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Grow Beyond Traditional Advertising?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Be among the first to access UAE's most innovative DOOH platform. Early adopters get priority access and special rates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Register")}>
              <Button size="lg" className="w-full sm:w-auto bg-white text-violet-600 hover:bg-slate-100 h-14 px-8 text-lg shadow-xl">
                Get Early Access
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl("Contact")}>
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg border-2 border-white bg-transparent text-white hover:bg-white hover:text-violet-600">
                Talk to Sales
              </Button>
            </Link>
          </div>
          <p className="text-white/60 mt-6 text-sm">No credit card required • Setup in 5 minutes • Cancel anytime</p>
        </div>
      </section>

      <PublicFooter />
      <PublicAIChatWidget />
      <InvestorInquiryModal open={showInvestorModal} onClose={() => setShowInvestorModal(false)} />
    </div>
  );
}