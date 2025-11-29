import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Crown,
  Sparkles,
  ScanLine,
  Box,
  Eye,
  ShoppingBag,
  BarChart3,
  Share2,
  Smartphone,
  Zap,
  Users,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Play,
  Target,
  Globe,
  Shield,
  Clock,
  DollarSign,
  Layers,
  Cpu,
  Palette,
  Video,
  MessageSquare,
  Star,
  Rocket,
  Award,
  MousePointer,
  Hand,
  Scan,
  Glasses,
  CircleDot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead, { PAGE_SEO } from "@/components/SEOHead";
import PremiumWaitlistModal from "@/components/modals/PremiumWaitlistModal";
import EarlyAccessModal from "@/components/modals/EarlyAccessModal";
import PublicAIChatWidget from "@/components/chat/PublicAIChatWidget";

export default function ARPremium() {
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [showEarlyAccessModal, setShowEarlyAccessModal] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [activeUseCase, setActiveUseCase] = useState(0);

  const heroStats = [
    { value: "300%", label: "Higher Engagement", icon: TrendingUp, color: "violet" },
    { value: "2.5x", label: "Conversion Rate", icon: Target, color: "emerald" },
    { value: "45sec", label: "Avg. Dwell Time", icon: Clock, color: "amber" },
    { value: "85%", label: "Brand Recall", icon: Users, color: "fuchsia" }
  ];

  const arJourney = [
    {
      step: 1,
      icon: Eye,
      title: "See the Ad",
      description: "Customer notices your AR-enabled campaign on a digital screen",
      visual: "📺"
    },
    {
      step: 2,
      icon: Scan,
      title: "Scan QR Code",
      description: "Opens instantly in browser - no app download required",
      visual: "📱"
    },
    {
      step: 3,
      icon: Hand,
      title: "Interact in AR",
      description: "Try on products, explore features, place in room",
      visual: "✨"
    },
    {
      step: 4,
      icon: ShoppingBag,
      title: "Take Action",
      description: "Buy now, book demo, get directions - all in AR",
      visual: "🛒"
    }
  ];

  const arCapabilities = [
    {
      icon: Glasses,
      title: "Virtual Try-On",
      description: "Watches, sunglasses, jewelry, makeup - let customers try before they buy using their phone camera",
      gradient: "from-violet-600 to-indigo-600",
      stats: "6x higher engagement"
    },
    {
      icon: Box,
      title: "3D Product Viewer",
      description: "360° product exploration with zoom, rotate, and detail inspection in stunning 3D",
      gradient: "from-indigo-600 to-blue-600",
      stats: "3x longer viewing time"
    },
    {
      icon: Layers,
      title: "Place in Room",
      description: "Furniture, décor, appliances - visualize products in your actual space with true-to-scale AR",
      gradient: "from-blue-600 to-cyan-600",
      stats: "40% fewer returns"
    },
    {
      icon: Video,
      title: "Animated Experiences",
      description: "Bring products to life with animations, demos, and interactive storytelling",
      gradient: "from-cyan-600 to-teal-600",
      stats: "2x emotional connection"
    },
    {
      icon: MousePointer,
      title: "Interactive Hotspots",
      description: "Tap to explore features, compare options, view specs - all within the AR experience",
      gradient: "from-teal-600 to-emerald-600",
      stats: "80% feature discovery"
    },
    {
      icon: Share2,
      title: "Social Sharing",
      description: "One-tap share to Instagram, TikTok, WhatsApp - turn customers into brand ambassadors",
      gradient: "from-emerald-600 to-green-600",
      stats: "4x organic reach"
    }
  ];

  const useCases = [
    {
      industry: "Luxury Watches",
      title: "Virtual Wrist Try-On",
      description: "Premium watch brands let shoppers try on timepieces from mall screens. See the watch on your wrist before visiting the store.",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop",
      stats: { engagement: "5x", storeVisits: "+65%", conversionLift: "3.2x" },
      testimonial: "AR try-on drove 65% more qualified store visits",
      brand: "Luxury Watch Retailer"
    },
    {
      industry: "Real Estate",
      title: "3D Property Tours",
      description: "Developers showcase apartments through immersive AR on lobby screens. Explore floor plans and interior designs in 3D.",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
      stats: { engagement: "8x", leads: "+90%", salesCycle: "-40%" },
      testimonial: "Buyers explore 3 more properties per visit with AR",
      brand: "Leading Developer"
    },
    {
      industry: "Automotive",
      title: "Car Interior Explorer",
      description: "Explore vehicle interiors, customize colors, see every feature up close through AR experiences at showrooms.",
      image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop",
      stats: { engagement: "4x", testDrives: "+45%", awareness: "92%" },
      testimonial: "Customers spend 4x longer exploring cars in AR",
      brand: "Auto Dealership"
    },
    {
      industry: "Furniture & Home",
      title: "Place in Your Room",
      description: "Visualize sofas, tables, and décor in your actual home. See exact size, color, and fit before purchasing.",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
      stats: { engagement: "6x", returns: "-45%", aov: "+32%" },
      testimonial: "Return rates dropped 45% with AR visualization",
      brand: "Home Retailer"
    },
    {
      industry: "Beauty & Cosmetics",
      title: "Virtual Makeup Try-On",
      description: "Try lipsticks, eyeshadows, foundations virtually. Find your perfect shade without physical testers.",
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop",
      stats: { engagement: "7x", sampling: "+300%", purchase: "+55%" },
      testimonial: "300% more product trials through virtual try-on",
      brand: "Beauty Brand"
    },
    {
      industry: "Food & Beverage",
      title: "3D Menu Preview",
      description: "See dishes in 3D before ordering. Understand portion sizes, ingredients, and presentation.",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
      stats: { engagement: "3x", orderValue: "+25%", satisfaction: "+40%" },
      testimonial: "Average order value increased 25% with AR menus",
      brand: "Restaurant Chain"
    }
  ];

  const pricingTiers = [
    {
      name: "AR Starter",
      price: "2,500",
      period: "month",
      description: "Perfect for testing AR advertising",
      badge: null,
      features: [
        "Up to 5 AR campaigns",
        "Basic 3D product models",
        "QR code generation",
        "Standard analytics",
        "Email support",
        "500 AR sessions/month"
      ],
      cta: "Join Waitlist"
    },
    {
      name: "AR Professional",
      price: "7,500",
      period: "month",
      description: "For brands serious about AR engagement",
      badge: "Most Popular",
      features: [
        "Unlimited AR campaigns",
        "Advanced 3D modeling",
        "Virtual try-on features",
        "Place in room AR",
        "Advanced analytics dashboard",
        "Priority support",
        "Custom branding",
        "5,000 AR sessions/month",
        "A/B testing"
      ],
      cta: "Get Early Access"
    },
    {
      name: "AR Enterprise",
      price: "Custom",
      period: "quote",
      description: "Full AR solution for enterprise brands",
      badge: "White Glove",
      features: [
        "Everything in Professional",
        "Custom AR development",
        "API integration",
        "Dedicated account manager",
        "SLA guarantee",
        "White-label options",
        "Unlimited AR sessions",
        "Multi-market support",
        "On-site training"
      ],
      cta: "Contact Sales"
    }
  ];

  const roadmap = [
    {
      phase: "Phase 1",
      title: "Foundation",
      timeline: "Q1 2026",
      status: "upcoming",
      icon: Rocket,
      color: "violet",
      features: [
        "WebAR product try-on (watches, sunglasses, jewelry)",
        "QR code integration with all BeyondWalls screens",
        "Scan & engagement analytics dashboard",
        "3D model library with 500+ products",
        "Basic customization options"
      ]
    },
    {
      phase: "Phase 2",
      title: "Advanced Features",
      timeline: "Q3 2026",
      status: "planned",
      icon: Sparkles,
      color: "indigo",
      features: [
        "AI-powered personalized AR experiences",
        "Real-time animation & interactivity",
        "Self-serve AR campaign builder",
        "A/B testing for AR creatives",
        "Integration with Shopify, WooCommerce",
        "Multi-language support"
      ]
    },
    {
      phase: "Phase 3",
      title: "AR-First Future",
      timeline: "2027+",
      status: "vision",
      icon: Crown,
      color: "fuchsia",
      features: [
        "Living billboards with dynamic AR content",
        "Social AR (share to Instagram/TikTok)",
        "Gamified AR experiences & rewards",
        "Location-based AR triggers",
        "AI-generated 3D models",
        "Premium analytics with predictive insights"
      ]
    }
  ];

  const faqs = [
    {
      q: "Do customers need to download an app?",
      a: "No! AR Engage uses WebAR technology that works directly in mobile browsers. Customers simply scan a QR code and the AR experience opens instantly - no app store, no friction."
    },
    {
      q: "What devices support AR Engage?",
      a: "AR Engage works on 95%+ of smartphones including iPhone (iOS 12+) and Android (8.0+). No special hardware required."
    },
    {
      q: "Can I use my own 3D product models?",
      a: "Yes! You can upload your own 3D models in GLTF/GLB format. We also offer 3D modeling services if you need models created."
    },
    {
      q: "How do I track AR campaign performance?",
      a: "Our analytics dashboard tracks QR scans, AR sessions, dwell time, interactions, conversions, and more. Export data or integrate via API."
    },
    {
      q: "When will AR Engage launch?",
      a: "AR Engage Phase 1 is planned for Q1 2026. Join the waitlist to get early access and special founding member pricing."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead {...PAGE_SEO.arPremium} />
      <PublicNav />

      {/* Hero Section - Immersive Dark Theme */}
      <section className="pt-24 pb-32 px-6 bg-gradient-to-b from-slate-950 via-violet-950 to-indigo-950 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-violet-500/20 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-20 right-10 w-[600px] h-[600px] bg-fuchsia-500/15 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[200px]" />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
          
          {/* Floating Particles */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-violet-400 rounded-full animate-ping" />
          <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-fuchsia-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-indigo-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm border border-amber-500/30 rounded-full px-5 py-2.5 mb-8">
                <Crown className="w-5 h-5 text-amber-400" />
                <span className="text-amber-300 font-semibold">Premium Feature</span>
                <Badge className="bg-amber-500 text-black border-0 text-xs font-bold">COMING Q1 2026</Badge>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
                <span className="text-white">Turn Screens Into</span>
                <br />
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                  AR Portals
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-xl">
                Bridge physical and digital advertising with immersive Augmented Reality experiences. 
                No app required - just scan and engage.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 h-16 px-10 text-lg shadow-2xl shadow-violet-500/30 border border-violet-400/20"
                  onClick={() => setShowWaitlistModal(true)}
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Join Premium Waitlist
                </Button>
                <Button 
                  size="lg" 
                  className="h-16 px-10 text-lg border-2 border-white/30 bg-white/5 backdrop-blur-sm text-white hover:bg-white hover:text-violet-600"
                  onClick={() => setShowDemo(true)}
                >
                  <Play className="w-5 h-5 mr-2" />
                  See AR in Action
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>WebAR - No App Needed</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>95% Device Support</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>3-Second Load Time</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive Visual */}
            <div className="relative flex justify-center">
              {/* Phone Mockup with AR Scene */}
              <div className="relative">
                <div className="w-72 h-[580px] bg-gradient-to-br from-slate-800 to-slate-900 rounded-[3rem] border-4 border-slate-600 shadow-2xl shadow-violet-500/20 overflow-hidden">
                  {/* Notch */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-7 bg-slate-900 rounded-full z-10" />
                  
                  {/* Screen Content */}
                  <div className="h-full p-2 pt-10">
                    <div className="h-full bg-gradient-to-br from-violet-900/30 to-indigo-900/30 rounded-[2.5rem] overflow-hidden relative">
                      <img 
                        src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&h=700&fit=crop" 
                        alt="AR furniture in living room"
                        className="w-full h-full object-cover"
                      />
                      
                      {/* AR Overlay UI */}
                      <div className="absolute inset-0">
                        {/* Scanning animation */}
                        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          <div className="w-40 h-40 border-2 border-violet-400/50 rounded-lg animate-pulse">
                            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-violet-400 rounded-tl-lg" />
                            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-violet-400 rounded-tr-lg" />
                            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-violet-400 rounded-bl-lg" />
                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-violet-400 rounded-br-lg" />
                          </div>
                        </div>
                        
                        {/* Product Info Card */}
                        <div className="absolute bottom-6 left-4 right-4 bg-black/70 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center">
                              <Box className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="text-white font-semibold">Modern Sofa Set</p>
                              <p className="text-violet-300 text-sm">Tap to place in room</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm py-2.5 rounded-xl font-medium">
                              Buy Now - AED 2,499
                            </button>
                            <button className="px-4 bg-white/10 text-white rounded-xl">
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl p-4 shadow-xl animate-bounce">
                  <ScanLine className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-4 shadow-xl">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="absolute top-1/4 -left-12 bg-white rounded-xl p-3 shadow-xl">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-bold text-slate-900">+300%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
            {heroStats.map((stat, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all hover:scale-105">
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-violet-400" />
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How AR Engage Works - Journey Steps */}
      <section className="py-24 px-6 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-100 rounded-full blur-3xl opacity-50" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <Badge className="bg-violet-100 text-violet-700 mb-4">How It Works</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              From Screen to <span className="text-violet-600">Conversion</span> in 4 Steps
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              AR Engage creates a seamless bridge between physical advertising and interactive digital experiences
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {arJourney.map((step, i) => (
              <div key={i} className="relative group">
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 hover:border-violet-200 transition-all hover:-translate-y-2 h-full">
                  {/* Step Number */}
                  <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-6 shadow-lg shadow-violet-500/25">
                    {step.step}
                  </div>
                  
                  {/* Icon */}
                  <div className="text-5xl mb-4">{step.visual}</div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-600">{step.description}</p>
                </div>
                
                {/* Connector Arrow */}
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 z-10">
                    <ArrowRight className="w-6 h-6 text-violet-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AR Capabilities - Bento Grid Style */}
      <section className="py-24 px-6 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(139, 92, 246, 0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16">
            <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 mb-4">Capabilities</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Powerful <span className="text-violet-400">AR Features</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Everything you need to create immersive, conversion-focused AR advertising experiences
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {arCapabilities.map((capability, i) => (
              <Card key={i} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:border-violet-500/50 transition-all group hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className={`w-14 h-14 bg-gradient-to-br ${capability.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <capability.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{capability.title}</h3>
                  <p className="text-slate-400 mb-4">{capability.description}</p>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    {capability.stats}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Use Cases - Interactive Showcase */}
      <section className="py-24 px-6 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-emerald-100 text-emerald-700 mb-4">Success Stories</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              AR Drives <span className="text-emerald-600">Real Results</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              See how leading brands across industries use AR to transform customer engagement
            </p>
          </div>

          {/* Use Case Tabs */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {useCases.map((useCase, i) => (
              <button
                key={i}
                onClick={() => setActiveUseCase(i)}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  activeUseCase === i
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {useCase.industry}
              </button>
            ))}
          </div>

          {/* Active Use Case Display */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img 
                src={useCases[activeUseCase].image}
                alt={useCases[activeUseCase].title}
                className="rounded-3xl shadow-2xl w-full aspect-[4/3] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent rounded-3xl" />
              <Badge className="absolute top-4 left-4 bg-violet-600 text-white border-0 text-sm">
                {useCases[activeUseCase].industry}
              </Badge>
            </div>
            
            <div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">
                {useCases[activeUseCase].title}
              </h3>
              <p className="text-lg text-slate-600 mb-8">
                {useCases[activeUseCase].description}
              </p>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-violet-50 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-violet-600">{useCases[activeUseCase].stats.engagement}</div>
                  <div className="text-slate-600 text-sm">Engagement</div>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-emerald-600">{useCases[activeUseCase].stats.storeVisits || useCases[activeUseCase].stats.leads || useCases[activeUseCase].stats.testDrives || useCases[activeUseCase].stats.returns || useCases[activeUseCase].stats.sampling || useCases[activeUseCase].stats.orderValue}</div>
                  <div className="text-slate-600 text-sm">Key Metric</div>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-amber-600">{useCases[activeUseCase].stats.conversionLift || useCases[activeUseCase].stats.salesCycle || useCases[activeUseCase].stats.awareness || useCases[activeUseCase].stats.aov || useCases[activeUseCase].stats.purchase || useCases[activeUseCase].stats.satisfaction}</div>
                  <div className="text-slate-600 text-sm">Impact</div>
                </div>
              </div>
              
              {/* Testimonial */}
              <div className="bg-slate-100 rounded-2xl p-6">
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 italic mb-2">"{useCases[activeUseCase].testimonial}"</p>
                <p className="text-slate-500 text-sm">— {useCases[activeUseCase].brand}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-violet-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-amber-100 text-amber-700 mb-4">Pricing</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              AR Engage <span className="text-violet-600">Plans</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Choose the plan that matches your AR advertising ambitions. All plans include WebAR technology.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, i) => (
              <Card key={i} className={`relative overflow-hidden ${tier.badge === 'Most Popular' ? 'border-2 border-violet-500 shadow-2xl scale-105 z-10' : 'border-0 shadow-xl'}`}>
                {tier.badge && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-center py-2 text-sm font-semibold">
                    {tier.badge}
                  </div>
                )}
                <CardContent className={`p-8 ${tier.badge ? 'pt-14' : ''}`}>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{tier.name}</h3>
                  <p className="text-slate-500 text-sm mb-6">{tier.description}</p>
                  
                  <div className="mb-8">
                    {tier.price === "Custom" ? (
                      <span className="text-4xl font-bold text-slate-900">Custom</span>
                    ) : (
                      <>
                        <span className="text-sm text-slate-500">AED</span>
                        <span className="text-5xl font-bold text-slate-900 mx-1">{tier.price}</span>
                        <span className="text-slate-500">/{tier.period}</span>
                      </>
                    )}
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {tier.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <span className="text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full h-14 text-lg ${tier.badge === 'Most Popular' ? 'bg-gradient-to-r from-violet-600 to-indigo-600' : 'bg-slate-900 hover:bg-slate-800'}`}
                    onClick={() => tier.cta === "Contact Sales" ? setShowEarlyAccessModal(true) : setShowWaitlistModal(true)}
                  >
                    {tier.cta}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-24 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 mb-4">Development Roadmap</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              The <span className="text-violet-400">AR Future</span> We're Building
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Our phased approach to bringing world-class AR advertising to BeyondWalls
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {roadmap.map((phase, i) => (
              <div key={i} className={`relative ${i === 0 ? 'md:-mt-4' : ''}`}>
                <Card className={`bg-slate-800/50 border-slate-700/50 backdrop-blur-sm h-full ${i === 0 ? 'ring-2 ring-violet-500' : ''}`}>
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center">
                        <phase.icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <Badge className={i === 0 ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300'}>
                          {phase.phase}
                        </Badge>
                        <p className="text-slate-400 text-sm mt-1">{phase.timeline}</p>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-6">{phase.title}</h3>
                    
                    <ul className="space-y-3">
                      {phase.features.map((feature, j) => (
                        <li key={j} className="flex items-start gap-3">
                          <CheckCircle2 className={`w-5 h-5 mt-0.5 ${i === 0 ? 'text-violet-400' : 'text-slate-500'}`} />
                          <span className="text-slate-300 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                {i === 0 && (
                  <div className="absolute -top-3 -right-3 bg-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                    UP NEXT
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-slate-100 text-slate-700 mb-4">FAQ</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Common Questions About AR Engage
            </h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-6 hover:bg-slate-100 transition-colors">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">{faq.q}</h3>
                <p className="text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "30px 30px"
          }} />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2 mb-8">
            <Award className="w-5 h-5 text-amber-300" />
            <span className="text-white font-medium">Limited Early Access Spots</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Be a Pioneer in<br />AR Advertising
          </h2>
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Join our exclusive premium waitlist and be among the first brands to leverage AR Engage when it launches in Q1 2026. Early adopters receive special founding member pricing.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-violet-600 hover:bg-slate-100 h-16 px-10 text-lg shadow-2xl"
              onClick={() => setShowWaitlistModal(true)}
            >
              <Crown className="w-6 h-6 mr-2" />
              Join Premium Waitlist
            </Button>
            <Button 
              size="lg" 
              className="h-16 px-10 text-lg border-2 border-white bg-transparent text-white hover:bg-white hover:text-violet-600"
              onClick={() => setShowEarlyAccessModal(true)}
            >
              Request Demo
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
          
          <p className="text-white/60 mt-10 text-sm">
            Questions? Contact us at <a href="mailto:ar@beyondwalls.ae" className="underline hover:text-white">ar@beyondwalls.ae</a> | +971 55 614 0067
          </p>
        </div>
      </section>

      <PublicFooter />
      <PublicAIChatWidget />

      {/* Modals */}
      <PremiumWaitlistModal open={showWaitlistModal} onClose={() => setShowWaitlistModal(false)} />
      <EarlyAccessModal open={showEarlyAccessModal} onClose={() => setShowEarlyAccessModal(false)} />

      {/* Demo Dialog */}
      <Dialog open={showDemo} onOpenChange={setShowDemo}>
        <DialogContent className="max-w-4xl bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">AR Engage Demo</DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-slate-800 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Play className="w-12 h-12 text-white" />
              </div>
              <p className="text-xl text-white font-semibold">AR Demo Video</p>
              <p className="text-slate-400 mt-2">Coming with AR Engage launch - Q1 2026</p>
              <Button 
                className="mt-6 bg-violet-600 hover:bg-violet-700"
                onClick={() => {
                  setShowDemo(false);
                  setShowWaitlistModal(true);
                }}
              >
                Get Notified at Launch
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}