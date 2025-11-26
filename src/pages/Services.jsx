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
  Megaphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead, { PAGE_SEO } from "@/components/SEOHead";

export default function Services() {
  const advertiserServices = [
    {
      icon: Target,
      title: "Precision Targeting",
      description: "Target by city, venue type, time of day, and audience demographics"
    },
    {
      icon: Upload,
      title: "Easy Creative Upload",
      description: "Upload images or videos in seconds, preview before going live"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Track impressions, reach, and ROI with detailed dashboards"
    },
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description: "Choose specific time slots - morning, afternoon, evening, or peak hours"
    },
    {
      icon: Shield,
      title: "Brand Safety",
      description: "Premium venues only - your brand in trusted environments"
    },
    {
      icon: Zap,
      title: "Fast Approval",
      description: "Campaigns reviewed within 2-4 hours, go live the same day"
    }
  ];

  const venueServices = [
    {
      icon: DollarSign,
      title: "Passive Revenue",
      description: "Earn 70% revenue share on all ads displayed on your screens"
    },
    {
      icon: MonitorPlay,
      title: "Easy Screen Setup",
      description: "Web-based player works on any smart TV or display device"
    },
    {
      icon: Settings,
      title: "Full Control",
      description: "Set your own rates, approve ad categories, manage schedules"
    },
    {
      icon: Wifi,
      title: "Remote Monitoring",
      description: "Real-time status updates, offline alerts, and remote management"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "PIN-protected screens with encrypted connections"
    },
    {
      icon: BarChart3,
      title: "Detailed Reports",
      description: "Track earnings, impressions, and screen performance"
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
      <SEOHead {...PAGE_SEO.services} />
      <PublicNav />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-violet-50 via-white to-indigo-50">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-amber-100 text-slate-900 mb-6">Our Services</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Everything You Need for DOOH Success
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Whether you're an advertiser looking to reach audiences or a venue owner 
            wanting to monetize screens, we've got you covered.
          </p>
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

      {/* Pricing */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-violet-100 text-violet-600 mb-4">Pricing</Badge>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              No hidden fees. Pay only for what you use.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, i) => (
              <Card key={i} className={`relative ${plan.popular ? 'border-2 border-violet-500 shadow-xl' : 'border-2 border-slate-100'}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-violet-600 text-white">Most Popular</Badge>
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
                        <CheckCircle2 className="w-4 h-4 text-violet-600" />
                        <span className="text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to={createPageUrl("Register")}>
                    <Button className={`w-full ${plan.popular ? 'bg-gradient-to-r from-violet-600 to-indigo-600' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-violet-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join BeyondWalls today and transform your advertising
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Register")}>
              <Button size="lg" className="bg-amber-100 text-slate-900 hover:bg-amber-100/90">
                <Megaphone className="w-5 h-5 mr-2" />
                Start Free Trial
              </Button>
            </Link>
            <Link to={createPageUrl("Contact")}>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Building2 className="w-5 h-5 mr-2" />
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}