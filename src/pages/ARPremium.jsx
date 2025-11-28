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
  MessageSquare
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
import SEOHead from "@/components/SEOHead";
import PremiumWaitlistModal from "@/components/modals/PremiumWaitlistModal";
import EarlyAccessModal from "@/components/modals/EarlyAccessModal";
import PublicAIChatWidget from "@/components/chat/PublicAIChatWidget";

export default function ARPremium() {
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [showEarlyAccessModal, setShowEarlyAccessModal] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const arCapabilities = [
    {
      icon: ScanLine,
      title: "WebAR Technology",
      description: "No app downloads required. Customers scan a QR code and instantly access AR experiences through their mobile browser. Works on 95%+ of smartphones.",
      features: ["Instant browser-based AR", "iOS & Android support", "No friction user experience"]
    },
    {
      icon: Box,
      title: "3D Product Visualization",
      description: "Let customers see products in stunning 3D. Rotate, zoom, and explore every detail before making a purchase decision.",
      features: ["High-fidelity 3D models", "360° product views", "Realistic textures & lighting"]
    },
    {
      icon: Eye,
      title: "Virtual Try-On",
      description: "Enable customers to virtually try products like watches, sunglasses, jewelry, and more using their phone's camera.",
      features: ["Real-time face/wrist tracking", "Accurate sizing", "Multiple product variants"]
    },
    {
      icon: Layers,
      title: "Place in Room",
      description: "Furniture, décor, and large products can be visualized in the customer's actual space using AR surface detection.",
      features: ["Floor/surface detection", "True-to-scale placement", "Shadow & lighting effects"]
    },
    {
      icon: ShoppingBag,
      title: "Direct Conversion",
      description: "Built-in call-to-action buttons within the AR experience. Buy Now, Book, Get Directions, or Contact - all without leaving AR.",
      features: ["One-tap purchasing", "Lead capture forms", "Booking integration"]
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Track every interaction. Know how many people scanned, how long they engaged, what products they viewed, and conversion rates.",
      features: ["Scan tracking", "Dwell time metrics", "Conversion funnels"]
    }
  ];

  const useCases = [
    {
      industry: "Luxury Retail",
      title: "Virtual Watch Try-On",
      description: "High-end watch brands use AR to let shoppers try on timepieces from digital screens in malls. Customers see the watch on their wrist before visiting the store.",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop",
      stats: ["3x higher engagement", "45% store visit increase", "2.5x conversion rate"]
    },
    {
      industry: "Real Estate",
      title: "3D Property Tours",
      description: "Property developers showcase apartments through AR experiences on lobby screens. Potential buyers explore floor plans and interior designs in immersive 3D.",
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop",
      stats: ["5x longer engagement", "60% qualified lead increase", "30% faster sales cycle"]
    },
    {
      industry: "Automotive",
      title: "Car Interior Explorer",
      description: "Car brands let customers explore vehicle interiors, customize colors, and see features up close through AR experiences at showrooms and malls.",
      image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=400&fit=crop",
      stats: ["4x test drive bookings", "80% feature awareness", "35% higher intent"]
    },
    {
      industry: "Furniture & Home",
      title: "Place in Your Room",
      description: "Furniture retailers enable customers to visualize sofas, tables, and décor in their actual homes using AR, reducing return rates and increasing confidence.",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop",
      stats: ["40% lower returns", "2x purchase confidence", "25% higher AOV"]
    },
    {
      industry: "Beauty & Cosmetics",
      title: "Virtual Makeup Try-On",
      description: "Beauty brands offer virtual try-on for lipsticks, eyeshadows, and foundations. Customers find their perfect shade without physical testers.",
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=400&fit=crop",
      stats: ["6x product sampling", "50% hygiene preference", "3x color match accuracy"]
    },
    {
      industry: "Food & Beverage",
      title: "Interactive Menu Preview",
      description: "Restaurants display 3D food models through AR. Diners see exactly what dishes look like before ordering, enhancing decision-making.",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
      stats: ["20% higher order value", "35% faster decisions", "15% fewer wrong orders"]
    }
  ];

  const pricingTiers = [
    {
      name: "AR Starter",
      price: "2,500",
      period: "month",
      description: "Perfect for testing AR advertising",
      features: [
        "Up to 5 AR campaigns",
        "Basic 3D product models",
        "QR code generation",
        "Standard analytics",
        "Email support"
      ],
      popular: false
    },
    {
      name: "AR Professional",
      price: "7,500",
      period: "month",
      description: "For growing brands with AR ambitions",
      features: [
        "Unlimited AR campaigns",
        "Advanced 3D modeling",
        "Virtual try-on features",
        "Place in room AR",
        "Advanced analytics dashboard",
        "Priority support",
        "Custom branding"
      ],
      popular: true
    },
    {
      name: "AR Enterprise",
      price: "Custom",
      period: "quote",
      description: "Full AR solution for large brands",
      features: [
        "Everything in Professional",
        "Custom AR development",
        "API integration",
        "Dedicated account manager",
        "SLA guarantee",
        "White-label options",
        "Multi-market support"
      ],
      popular: false
    }
  ];

  const roadmap = [
    {
      phase: "Phase 1",
      title: "Foundation",
      timeline: "Q1 2026",
      status: "upcoming",
      features: [
        "WebAR product try-on for fashion & accessories",
        "QR code integration with all screen campaigns",
        "Basic scan & engagement analytics",
        "3D model library with 500+ products"
      ]
    },
    {
      phase: "Phase 2",
      title: "Advanced Features",
      timeline: "Q3 2026",
      status: "planned",
      features: [
        "AI-powered personalized AR experiences",
        "Real-time animation & interactivity",
        "Self-serve AR campaign builder",
        "A/B testing for AR creatives",
        "Integration with e-commerce platforms"
      ]
    },
    {
      phase: "Phase 3",
      title: "AR-First Advertising",
      timeline: "2027",
      status: "vision",
      features: [
        "Living billboards with dynamic AR content",
        "Social AR integration (share to Instagram/TikTok)",
        "Gamified AR experiences",
        "Location-based AR triggers",
        "Premium analytics with AI insights"
      ]
    }
  ];

  const stats = [
    { value: "300%", label: "Higher Engagement", icon: TrendingUp },
    { value: "2.5x", label: "Conversion Rate", icon: Target },
    { value: "45%", label: "Longer Dwell Time", icon: Clock },
    { value: "85%", label: "Brand Recall", icon: Users }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="AR Engage - Premium AR Advertising | BeyondWalls Dubai"
        description="Transform static screens into immersive AR experiences. Virtual try-on, 3D visualization, and interactive advertising for premium brands in UAE. WebAR technology - no app required."
        keywords="AR advertising Dubai, augmented reality advertising UAE, virtual try-on Dubai, 3D product visualization, WebAR advertising, interactive DOOH, AR marketing UAE, immersive advertising Dubai"
        url="/ar-premium"
        image="https://www.beyondwalls.ae/og-ar-engage.jpg"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": "BeyondWalls AR Engage",
          "description": "Premium augmented reality advertising solution for digital out-of-home screens in UAE",
          "brand": {
            "@type": "Brand",
            "name": "BeyondWalls"
          },
          "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "AED",
            "lowPrice": "2500",
            "highPrice": "7500",
            "offerCount": "3"
          },
          "category": "AR Advertising",
          "provider": {
            "@type": "Organization",
            "name": "BeyondWalls",
            "url": "https://www.beyondwalls.ae"
          }
        }}
      />
      <PublicNav />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-slate-900 via-violet-950 to-indigo-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-violet-500/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-[120px]" />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm border border-amber-500/30 rounded-full px-5 py-2 mb-6">
              <Crown className="w-5 h-5 text-amber-400" />
              <span className="text-amber-300 font-semibold">Premium Feature</span>
              <Badge className="bg-amber-500 text-black border-0 text-xs">COMING Q1 2026</Badge>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                BeyondWalls AR Engage
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-8">
              The future of outdoor advertising is immersive. Transform any digital screen into an interactive AR gateway that captivates, engages, and converts.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 h-14 px-8 text-lg shadow-xl shadow-violet-500/25"
                onClick={() => setShowWaitlistModal(true)}
              >
                <Crown className="w-5 h-5 mr-2" />
                Join Premium Waitlist
              </Button>
              <Button 
                size="lg" 
                className="h-14 px-8 text-lg border-2 border-white bg-transparent text-white hover:bg-white hover:text-violet-600"
                onClick={() => setShowDemo(true)}
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {stats.map((stat, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <stat.icon className="w-6 h-6 text-violet-400 mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What is AR Engage */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-violet-100 text-violet-700 mb-4">What is AR Engage?</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Bridge Physical & Digital Advertising
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                AR Engage transforms traditional DOOH screens into interactive portals. When viewers see your ad, 
                they can scan a QR code and instantly experience your product in augmented reality - no app required.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">No App Required</p>
                    <p className="text-slate-600 text-sm">WebAR works directly in mobile browsers</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Instant Engagement</p>
                    <p className="text-slate-600 text-sm">From scan to AR experience in under 3 seconds</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Measurable Results</p>
                    <p className="text-slate-600 text-sm">Track every scan, interaction, and conversion</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-violet-100 to-indigo-100 rounded-3xl p-8">
                <img 
                  src="https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=600&h=500&fit=crop" 
                  alt="AR Experience"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-lg">300%</p>
                    <p className="text-slate-500 text-sm">Higher Engagement</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AR Capabilities */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-indigo-100 text-indigo-700 mb-4">Capabilities</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Powerful AR Features
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Everything you need to create immersive, conversion-focused AR advertising experiences
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {arCapabilities.map((capability, i) => (
              <Card key={i} className="border-0 shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                    <capability.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{capability.title}</h3>
                  <p className="text-slate-600 text-sm mb-4">{capability.description}</p>
                  <ul className="space-y-2">
                    {capability.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-emerald-100 text-emerald-700 mb-4">Use Cases</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              AR Success Stories by Industry
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              See how leading brands use AR to transform customer engagement
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {useCases.map((useCase, i) => (
              <Card key={i} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all group">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={useCase.image} 
                    alt={useCase.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                  <Badge className="absolute top-3 left-3 bg-violet-600 text-white border-0">
                    {useCase.industry}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{useCase.title}</h3>
                  <p className="text-slate-600 text-sm mb-4">{useCase.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {useCase.stats.map((stat, j) => (
                      <Badge key={j} variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">
                        {stat}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-gradient-to-br from-violet-50 to-indigo-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-amber-100 text-amber-700 mb-4">Pricing</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              AR Engage Pricing Plans
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Choose the plan that fits your AR advertising ambitions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, i) => (
              <Card key={i} className={`relative ${tier.popular ? 'border-2 border-violet-500 shadow-2xl scale-105' : 'border-0 shadow-lg'}`}>
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{tier.name}</h3>
                  <p className="text-slate-500 text-sm mb-4">{tier.description}</p>
                  <div className="mb-6">
                    {tier.price === "Custom" ? (
                      <span className="text-4xl font-bold text-slate-900">Custom</span>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-slate-900">AED {tier.price}</span>
                        <span className="text-slate-500">/{tier.period}</span>
                      </>
                    )}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span className="text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${tier.popular ? 'bg-gradient-to-r from-violet-600 to-indigo-600' : 'bg-slate-900 hover:bg-slate-800'}`}
                    onClick={() => setShowWaitlistModal(true)}
                  >
                    Join Waitlist
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-20 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 mb-4">Roadmap</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">AR Engage Development Timeline</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Our phased approach to bringing world-class AR advertising to BeyondWalls
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {roadmap.map((phase, i) => (
              <Card key={i} className={`bg-white/5 border-white/10 ${i === 0 ? 'ring-2 ring-violet-500' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className={i === 0 ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300'}>
                      {phase.phase}
                    </Badge>
                    <span className="text-slate-400 text-sm">{phase.timeline}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{phase.title}</h3>
                  <ul className="space-y-2">
                    {phase.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-slate-300 text-sm">
                        <CheckCircle2 className={`w-4 h-4 ${i === 0 ? 'text-violet-400' : 'text-slate-500'}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px"}} />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <Crown className="w-16 h-16 text-amber-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Be a Pioneer in AR Advertising
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join our exclusive premium waitlist and be among the first brands to leverage AR Engage when it launches in Q1 2026.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-violet-600 hover:bg-slate-100 h-14 px-8 text-lg shadow-xl"
              onClick={() => setShowWaitlistModal(true)}
            >
              <Crown className="w-5 h-5 mr-2" />
              Join Premium Waitlist
            </Button>
            <Button 
              size="lg" 
              className="h-14 px-8 text-lg border-2 border-white bg-transparent text-white hover:bg-white hover:text-violet-600"
              onClick={() => setShowEarlyAccessModal(true)}
            >
              Request Early Access
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
          <p className="text-white/60 mt-8 text-sm">
            Questions? Contact us at partnership@beyondwalls.ae
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
          <div className="aspect-video bg-slate-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-violet-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-10 h-10 text-violet-400" />
              </div>
              <p className="text-slate-400">AR Demo Video Coming Soon</p>
              <p className="text-slate-500 text-sm mt-2">Expected launch: Q1 2026</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}