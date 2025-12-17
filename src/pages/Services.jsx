import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  MonitorPlay,
  Target,
  BarChart3,
  Upload,
  Clock,
  Shield,
  Zap,
  Building2,
  DollarSign,
  Settings,
  Wifi,
  CheckCircle2,
  Megaphone,
  TrendingUp,
  Sparkles,
  Globe,
  Users,
  ArrowRight,
  Star,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead, { PAGE_SEO } from "@/components/SEOHead";
import PublicAIChatWidget from "@/components/chat/PublicAIChatWidget";
import DOOHvsOOHComparison from "@/components/services/DOOHvsOOHComparison";

export default function Services() {
  const advertiserServices = [
    {
      icon: Target,
      title: "2X More Impressions",
      description: "100% more audience reach than traditional outdoor advertising"
    },
    {
      icon: Upload,
      title: "5-Minute Setup",
      description: "Upload and go live instantly vs weeks of traditional OOH setup"
    },
    {
      icon: BarChart3,
      title: "72% Recall Rate",
      description: "Captive audiences in relaxed settings retain your message better"
    },
    {
      icon: Clock,
      title: "45+ Min Dwell Time",
      description: "Extended exposure vs 2-second billboard drive-by viewing"
    },
    {
      icon: Shield,
      title: "Guaranteed Attention",
      description: "Screens show menus - viewers must look at your ad"
    },
    {
      icon: Zap,
      title: "144+ Plays Per Day",
      description: "Ads repeat every 5 minutes for maximum brand frequency"
    }
  ];

  const venueServices = [
    {
      icon: DollarSign,
      title: "70% Revenue Share",
      description: "Industry-leading payout - earn AED 2,000-4,000+ per screen monthly"
    },
    {
      icon: MonitorPlay,
      title: "Use Existing Screens",
      description: "Works on 43\", 55\", 65\" smart TVs - no new equipment needed"
    },
    {
      icon: Settings,
      title: "Keep 3 Own Slots",
      description: "Display your own promotions on 3 reserved ad slots"
    },
    {
      icon: Wifi,
      title: "Weekly Payouts",
      description: "Get paid every week directly to your bank account"
    },
    {
      icon: Shield,
      title: "Full Ad Control",
      description: "Approve ad categories - only show content you're comfortable with"
    },
    {
      icon: BarChart3,
      title: "Real-time Earnings",
      description: "Track every impression and revenue as it happens"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "50",
      unit: "AED/hr per screen",
      description: "Perfect for small venues",
      features: ["Up to 3 screens", "Basic analytics", "Email support", "Weekly payouts"]
    },
    {
      name: "Professional",
      price: "100",
      unit: "AED/hr per screen",
      description: "For growing businesses",
      features: ["Up to 10 screens", "Advanced analytics", "Priority support", "Weekly payouts", "Custom time slots"],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      unit: "Contact us",
      description: "For large venues and chains",
      features: ["Unlimited screens", "Dedicated manager", "24/7 support", "Daily payouts", "API access", "White-label options"]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        {...PAGE_SEO.services}
        structuredData={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": "https://www.beyondwalls.ae/Services#webpage",
              "url": "https://www.beyondwalls.ae/Services",
              "name": "DOOH Advertising Services Dubai",
              "isPartOf": {
                "@id": "https://www.beyondwalls.ae/#website"
              },
              "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://www.beyondwalls.ae"
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Services",
                    "item": "https://www.beyondwalls.ae/Services"
                  }
                ]
              }
            },
            {
          "@type": "Service",
          "name": "BeyondWalls DOOH Advertising Services",
          "serviceType": "Digital Out-of-Home Advertising",
          "provider": {
            "@type": "Organization",
            "name": "BeyondWalls",
            "url": "https://www.beyondwalls.ae"
          },
          "areaServed": ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "RAK", "UAE"],
          "description": "Premium DOOH advertising services for advertisers and venue owners in UAE. Self-serve platform with 500+ screens.",
          "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "AED",
            "lowPrice": "50",
            "highPrice": "250",
            "priceSpecification": {
              "@type": "UnitPriceSpecification",
              "price": "99",
              "priceCurrency": "AED",
              "unitText": "per week per screen"
            }
          }
            }
          ]
        }}
      />
      <PublicNav />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-violet-50 via-white to-indigo-50 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-72 h-72 bg-violet-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-30" />
        <div className="max-w-5xl mx-auto text-center relative">
          <Badge className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 px-4 py-2 mb-6">
            ✨ Complete DOOH Solutions
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Powerful Tools for
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent"> Modern Advertising</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            From AI-powered campaign creation to real-time analytics, BeyondWalls provides everything 
            advertisers and venue owners need to succeed in digital out-of-home advertising.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to={createPageUrl("Register")}>
              <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 h-14 px-8">
                <Megaphone className="w-5 h-5 mr-2" />
                Start Advertising
              </Button>
            </Link>
            <Link to={createPageUrl("Contact")}>
              <Button size="lg" variant="outline" className="h-14 px-8 border-2">
                <Building2 className="w-5 h-5 mr-2" />
                List Your Venue
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="py-12 bg-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-white mb-1">9,000+</p>
              <p className="text-slate-400">Daily Audience Reach</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-white mb-1">72%</p>
              <p className="text-slate-400">Recall Rate</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-white mb-1">144+</p>
              <p className="text-slate-400">Plays Per Day</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-white mb-1">90%</p>
              <p className="text-slate-400">Cost Savings vs OOH</p>
            </div>
          </div>
        </div>
      </section>

      {/* For Advertisers */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-violet-100 text-violet-600 mb-4">For Advertisers</Badge>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Powerful Advertising Tools</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Create impactful campaigns with our self-serve platform
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {advertiserServices.map((service, i) => (
              <Card key={i} className="border-2 border-slate-100 hover:border-violet-200 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{service.title}</h3>
                  <p className="text-slate-600 text-sm">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For Venues */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-amber-100 text-slate-900 mb-4">For Venue Owners</Badge>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Monetize Your Screens</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Turn your digital displays into a revenue stream
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {venueServices.map((service, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
                    <service.icon className="w-6 h-6 text-slate-900" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{service.title}</h3>
                  <p className="text-slate-600 text-sm">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Quick */}
      <section className="py-20 px-6 bg-gradient-to-br from-indigo-50 to-violet-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-indigo-100 text-indigo-600 mb-4">How It Works</Badge>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Launch Your Campaign in 4 Steps</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Sign Up", desc: "Create your account in 2 minutes", icon: Users },
              { step: "2", title: "Choose Screens", desc: "Select from 500+ locations", icon: MonitorPlay },
              { step: "3", title: "Upload Creative", desc: "Add your image or video", icon: Upload },
              { step: "4", title: "Go Live", desc: "Your ad runs within 30 min", icon: Zap }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow h-full">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm">{item.desc}</p>
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

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-violet-100 text-violet-600 mb-4">Transparent Pricing</Badge>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">No Hidden Fees. Pay As You Go.</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Start with as little as AED 50/week per screen. Scale up as your campaign grows.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, i) => (
              <Card key={i} className={`relative ${plan.popular ? 'border-2 border-violet-500 shadow-2xl scale-105' : 'border-2 border-slate-100'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-slate-500 text-sm mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-500 text-sm ml-2">{plan.unit}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to={createPageUrl("Register")}>
                    <Button className={`w-full h-12 ${plan.popular ? 'bg-gradient-to-r from-violet-600 to-indigo-600' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl relative">
            <div className="absolute -top-6 left-8">
              <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-white fill-white" />
              </div>
            </div>
            <div className="flex gap-1 mb-6">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className="w-5 h-5 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <p className="text-xl md:text-2xl text-slate-700 mb-6 leading-relaxed">
              "BeyondWalls transformed how we advertise. We launched our campaign across 15 screens in Dubai 
              within an hour. The self-serve platform is incredibly intuitive, and the real-time analytics 
              helped us optimize on the fly. Our brand visibility increased by 300%!"
            </p>
            <div className="flex items-center gap-4">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop" 
                alt="Ahmed K." 
                className="w-14 h-14 rounded-full object-cover"
              />
              <div>
                <p className="font-bold text-slate-900">Ahmed K.</p>
                <p className="text-slate-500">Marketing Director, Food & Beverage Brand</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DOOH vs OOH Comparison */}
      <DOOHvsOOHComparison />

      {/* Why Choose Us */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-emerald-100 text-emerald-700 mb-4">Why BeyondWalls</Badge>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">The BeyondWalls Advantage</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">UAE-Wide Coverage</h3>
              <p className="text-slate-600">Screens in Dubai, Abu Dhabi, Sharjah, Ajman, and RAK. Reach audiences wherever they are.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">AI-Powered</h3>
              <p className="text-slate-600">Our AI recommends best screens, optimizes creatives, and predicts campaign performance.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Award-Winning</h3>
              <p className="text-slate-600">Recognized with 2025 Global Recognition Award for innovation in DOOH advertising.</p>
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
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Advertise Smarter?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join 100+ businesses already reaching millions of customers through BeyondWalls screens
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Register")}>
              <Button size="lg" className="bg-white text-violet-600 hover:bg-slate-100 h-14 px-8 shadow-xl">
                <Megaphone className="w-5 h-5 mr-2" />
                Start Advertising Now
              </Button>
            </Link>
            <Link to={createPageUrl("HowItWorks")}>
              <Button size="lg" className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-violet-600 h-14 px-8">
                See How It Works
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
          <p className="text-white/60 mt-8 text-sm">No credit card required • Setup in 5 minutes • Cancel anytime</p>
        </div>
      </section>

      <PublicFooter />
      <PublicAIChatWidget />
    </div>
  );
}