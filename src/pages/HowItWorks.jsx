import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  MonitorPlay,
  Building2,
  Megaphone,
  Users,
  ArrowRight,
  CheckCircle2,
  Wifi,
  CreditCard,
  BarChart3,
  Shield,
  Zap,
  Lock,
  RefreshCw,
  DollarSign,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead, { PAGE_SEO } from "@/components/SEOHead";

export default function HowItWorks() {
  const [openFaq, setOpenFaq] = useState(null);

  const advertiserSteps = [
    {
      step: 1,
      title: "Create Your Account",
      description: "Sign up as an advertiser (individual or company). Complete KYC verification with Emirates ID and trade license.",
      icon: Users,
      color: "violet"
    },
    {
      step: 2,
      title: "Fund Your Wallet",
      description: "Add funds using credit card, Apple Pay, or bank transfer. Your wallet balance is used to pay for ad campaigns.",
      icon: CreditCard,
      color: "emerald"
    },
    {
      step: 3,
      title: "Create a Campaign",
      description: "Set your target audience, choose venues, select screens, upload your creative (image or video), and set your budget.",
      icon: Megaphone,
      color: "indigo"
    },
    {
      step: 4,
      title: "Campaign Approval",
      description: "Our team reviews your creative for compliance. Once approved, your ads go live on selected screens.",
      icon: CheckCircle2,
      color: "amber"
    },
    {
      step: 5,
      title: "Track Performance",
      description: "Monitor impressions, reach, and spend in real-time. Get detailed analytics and reports on your dashboard.",
      icon: BarChart3,
      color: "rose"
    }
  ];

  const venueSteps = [
    {
      step: 1,
      title: "Register Your Venue",
      description: "Sign up as a venue owner. Provide venue details, trade license, and contact information for verification.",
      icon: Building2,
      color: "violet"
    },
    {
      step: 2,
      title: "Add Your Screens",
      description: "Register each screen with specifications: size, orientation, location in venue, and set your hourly rate.",
      icon: MonitorPlay,
      color: "indigo"
    },
    {
      step: 3,
      title: "Connect Screen Player",
      description: "Open the BeyondWalls Player on your TV, enter your Screen ID and PIN to connect and start displaying ads.",
      icon: Wifi,
      color: "emerald"
    },
    {
      step: 4,
      title: "Earn Revenue",
      description: "Earn money for every ad displayed on your screens. Revenue is calculated based on impressions and your hourly rate.",
      icon: DollarSign,
      color: "amber"
    },
    {
      step: 5,
      title: "Withdraw Earnings",
      description: "Request withdrawals to your bank account anytime. Track all earnings and transactions in your dashboard.",
      icon: CreditCard,
      color: "rose"
    }
  ];

  const screenPlayerSteps = [
    {
      step: 1,
      title: "Register Your Screen",
      description: "In your venue dashboard, click 'Add Screen' and fill in the details: screen name, size, orientation, location, and hourly rate. You'll receive a unique Screen ID (e.g., BW-CAF-001).",
      details: [
        "Screen sizes: 32\" to 85+\"",
        "Orientation: Portrait or Landscape",
        "Resolution: HD, FHD, or 4K",
        "Set optional PIN for security"
      ]
    },
    {
      step: 2,
      title: "Get Your Screen Credentials",
      description: "After registration, go to 'My Screens' and click 'Launch Player' on your screen card. You'll see your Screen ID and PIN (if set).",
      details: [
        "Screen ID is your unique identifier",
        "PIN adds extra security layer",
        "Copy credentials for easy access",
        "QR code available for quick setup"
      ]
    },
    {
      step: 3,
      title: "Open Player on Your TV",
      description: "On your Smart TV or display device, open the web browser and navigate to the BeyondWalls Player URL. The player works on any device with a modern browser.",
      details: [
        "Compatible with Android TV, WebOS, Tizen",
        "Works on Fire TV and Chromecast",
        "Can run on any device with Chrome/Firefox",
        "Optimized for 24/7 operation"
      ]
    },
    {
      step: 4,
      title: "Enter Screen Credentials",
      description: "On the player login screen, enter your Screen ID and PIN (if required). Click 'Connect Screen' to authenticate.",
      details: [
        "Screen ID is case-insensitive",
        "PIN is 6 digits",
        "Connection is secure and encrypted",
        "Auto-reconnects if connection drops"
      ]
    },
    {
      step: 5,
      title: "Screen Goes Live",
      description: "Once connected, your screen status changes to 'Online' in your dashboard. The player starts displaying scheduled ads automatically.",
      details: [
        "Real-time status updates",
        "Heartbeat sent every 30 seconds",
        "Auto-cycles through active campaigns",
        "Fullscreen mode for clean display"
      ]
    },
    {
      step: 6,
      title: "Monitor & Manage",
      description: "Track your screen's status, view impressions, and manage settings from your dashboard. Get notified if a screen goes offline.",
      details: [
        "Live online/offline status",
        "View last heartbeat time",
        "Track daily impressions",
        "Remote management capabilities"
      ]
    }
  ];

  const faqs = [
    {
      question: "What types of venues can join BeyondWalls?",
      answer: "We welcome all types of venues including restaurants, cafes, gyms, malls, hotels, hospitals, coworking spaces, and more. Any location with foot traffic and a digital screen can participate."
    },
    {
      question: "How is revenue calculated for venue owners?",
      answer: "Revenue is based on your hourly rate multiplied by the ad duration and number of plays. You keep 100% of your screen rate for campaigns displayed on your screens. Payments are made weekly or monthly."
    },
    {
      question: "What are the screen requirements?",
      answer: "Any digital screen from 32\" to 85+\" with internet connectivity. We support Android TV, WebOS (LG), Tizen (Samsung), Fire TV, and any device with a modern web browser."
    },
    {
      question: "How do I ensure my ads reach the right audience?",
      answer: "Our platform offers precise targeting by city, area, venue type, and time slots. You can target morning commuters at cafes or evening gym-goers. Real-time analytics help optimize your campaigns."
    },
    {
      question: "Is my screen secure?",
      answer: "Yes! Each screen has a unique ID and optional PIN protection. Only authenticated devices can display content. All communications are encrypted and we monitor for unauthorized access."
    },
    {
      question: "What happens if my screen goes offline?",
      answer: "Our system detects offline screens within 60 seconds via heartbeat monitoring. You'll receive notifications and the screen will automatically reconnect when internet is restored."
    },
    {
      question: "What ad formats are supported?",
      answer: "We support static images (JPG, PNG) and videos (MP4). Recommended resolution is 1920x1080 for landscape or 1080x1920 for portrait screens. Maximum video duration is 60 seconds."
    },
    {
      question: "How quickly can my campaign go live?",
      answer: "Once submitted, campaigns are typically reviewed within 2-4 hours during business days. Approved campaigns go live immediately on all selected screens."
    }
  ];

  const stats = [
    { value: "500+", label: "Active Screens" },
    { value: "50M+", label: "Monthly Impressions" },
    { value: "200+", label: "Premium Venues" },
    { value: "98%", label: "Uptime" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        {...PAGE_SEO.howItWorks}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": "How to Advertise on Digital Screens in Dubai & UAE",
          "description": "Complete step-by-step guide to booking DOOH advertising on BeyondWalls platform",
          "totalTime": "PT30M",
          "estimatedCost": {
            "@type": "MonetaryAmount",
            "currency": "AED",
            "value": "99"
          },
          "step": [
            {
              "@type": "HowToStep",
              "position": 1,
              "name": "Create Your Account",
              "text": "Sign up as an advertiser or venue owner. Complete verification with Emirates ID or trade license."
            },
            {
              "@type": "HowToStep",
              "position": 2,
              "name": "Fund Your Wallet",
              "text": "Add funds using credit card, Apple Pay, or bank transfer. Minimum top-up is AED 100."
            },
            {
              "@type": "HowToStep",
              "position": 3,
              "name": "Choose Screens",
              "text": "Browse 500+ screens across Dubai, Abu Dhabi, and Sharjah. Filter by location, venue type, and price."
            },
            {
              "@type": "HowToStep",
              "position": 4,
              "name": "Upload Creative",
              "text": "Upload your image or video ad. Supported formats: JPG, PNG, MP4. Max 60 seconds for video."
            },
            {
              "@type": "HowToStep",
              "position": 5,
              "name": "Go Live",
              "text": "Submit for approval. Campaigns reviewed within 2-4 hours. Ads go live on selected screens."
            }
          ]
        }}
      />
      <PublicNav />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-violet-50 via-white to-indigo-50 relative overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-violet-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-30" />
        <div className="max-w-5xl mx-auto text-center relative">
          <Badge className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 px-4 py-2 mb-6">
            📖 Complete Platform Guide
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            From Signup to 
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent"> Live Ads </span>
            in 30 Minutes
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            BeyondWalls makes digital out-of-home advertising accessible to everyone. 
            Whether you're an advertiser or venue owner, here's everything you need to know.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to={createPageUrl("Register")}>
              <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 h-14 px-8">
                <Megaphone className="w-5 h-5 mr-2" />
                I'm an Advertiser
              </Button>
            </Link>
            <Link to={createPageUrl("Register")}>
              <Button size="lg" variant="outline" className="h-14 px-8 border-2">
                <Building2 className="w-5 h-5 mr-2" />
                I'm a Venue Owner
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Placeholder / Visual */}
      <section className="py-16 px-6 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-4xl mx-auto">
          <div className="aspect-video bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl flex items-center justify-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px"}} />
            </div>
            <div className="text-center text-white relative z-10">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-white/30 transition-colors">
                <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-2" />
              </div>
              <p className="text-xl font-medium">Watch How It Works</p>
              <p className="text-white/60 text-sm mt-2">2 minute overview</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Overview */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Platform Overview</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              BeyondWalls connects advertisers with venues, creating a seamless marketplace for digital out-of-home advertising.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 border-violet-100 hover:border-violet-300 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Megaphone className="w-8 h-8 text-violet-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">For Advertisers</h3>
                <p className="text-slate-600 mb-4">
                  Create targeted campaigns, choose specific venues and screens, and track performance in real-time.
                </p>
                <ul className="text-left text-sm text-slate-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Self-serve campaign creation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Precise audience targeting
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Real-time analytics
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-indigo-100 hover:border-indigo-300 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Building2 className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">For Venues</h3>
                <p className="text-slate-600 mb-4">
                  Monetize your existing screens by displaying ads. Easy setup with our web-based player.
                </p>
                <ul className="text-left text-sm text-slate-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Passive income stream
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Easy screen setup
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Weekly/monthly payouts
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-emerald-100 hover:border-emerald-300 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MonitorPlay className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Screen Player</h3>
                <p className="text-slate-600 mb-4">
                  Our web-based player runs on any smart TV or device. Secure, reliable, and always connected.
                </p>
                <ul className="text-left text-sm text-slate-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Works on any browser
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    PIN-protected security
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Auto-reconnect capability
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For Advertisers */}
      <section className="py-20 px-6 bg-gradient-to-br from-violet-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-violet-100 text-violet-700 mb-4">For Advertisers</Badge>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How to Run Your Campaign</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              From sign-up to seeing your ads on screens across the UAE - here's your journey.
            </p>
          </div>

          <div className="space-y-6">
            {advertiserSteps.map((item, index) => (
              <div key={index} className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className={`w-14 h-14 rounded-2xl bg-${item.color}-100 flex items-center justify-center`}>
                    <item.icon className={`w-7 h-7 text-${item.color}-600`} />
                  </div>
                </div>
                <div className="flex-1 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-bold text-violet-600">Step {item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
                {index < advertiserSteps.length - 1 && (
                  <div className="hidden md:block absolute left-7 mt-14 w-0.5 h-6 bg-slate-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Venues */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-indigo-100 text-indigo-700 mb-4">For Venue Owners</Badge>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How to Monetize Your Screens</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Turn your idle screens into a revenue stream. Simple setup, passive income.
            </p>
          </div>

          <div className="space-y-6">
            {venueSteps.map((item, index) => (
              <div key={index} className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className={`w-14 h-14 rounded-2xl bg-${item.color}-100 flex items-center justify-center`}>
                    <item.icon className={`w-7 h-7 text-${item.color}-600`} />
                  </div>
                </div>
                <div className="flex-1 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-bold text-indigo-600">Step {item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Screen Player Deep Dive */}
      <section className="py-20 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-emerald-500/20 text-emerald-400 mb-4">Technical Guide</Badge>
            <h2 className="text-3xl font-bold mb-4">Screen Player Setup Guide</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Detailed step-by-step instructions to connect your screen to the BeyondWalls network.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {screenPlayerSteps.map((item, index) => (
              <Card key={index} className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center font-bold text-lg">
                      {item.step}
                    </div>
                    <h3 className="text-lg font-bold">{item.title}</h3>
                  </div>
                  <p className="text-slate-400 mb-4">{item.description}</p>
                  <ul className="space-y-2">
                    {item.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Player Architecture Diagram */}
          <div className="mt-16 bg-white/5 rounded-3xl p-8 border border-white/10">
            <h3 className="text-xl font-bold mb-6 text-center">How the Screen Player Works</h3>
            <div className="grid md:grid-cols-5 gap-4 items-center">
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <MonitorPlay className="w-8 h-8 text-violet-400" />
                </div>
                <p className="text-sm font-medium">Screen Player</p>
                <p className="text-xs text-slate-500">On your TV</p>
              </div>
              <div className="text-center">
                <ArrowRight className="w-8 h-8 text-slate-600 mx-auto" />
              </div>
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-8 h-8 text-indigo-400" />
                </div>
                <p className="text-sm font-medium">BeyondWalls Cloud</p>
                <p className="text-xs text-slate-500">Authentication & Content</p>
              </div>
              <div className="text-center">
                <ArrowRight className="w-8 h-8 text-slate-600 mx-auto" />
              </div>
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Megaphone className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-sm font-medium">Active Campaigns</p>
                <p className="text-xs text-slate-500">Scheduled Ads</p>
              </div>
            </div>

            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Lock className="w-5 h-5 text-amber-400" />
                  <span className="font-medium">Security</span>
                </div>
                <p className="text-sm text-slate-400">
                  PIN authentication, encrypted connections, and secure content delivery.
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <RefreshCw className="w-5 h-5 text-emerald-400" />
                  <span className="font-medium">Reliability</span>
                </div>
                <p className="text-sm text-slate-400">
                  Auto-reconnect, offline detection, and 30-second heartbeat monitoring.
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-5 h-5 text-violet-400" />
                  <span className="font-medium">Performance</span>
                </div>
                <p className="text-sm text-slate-400">
                  Optimized content delivery, smooth transitions, and 4K support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Model */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-emerald-100 text-emerald-700 mb-4">Revenue Model</Badge>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How Earnings Work</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 border-slate-100">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4">For Advertisers</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-slate-600">Pricing Model</span>
                    <span className="font-medium">Hourly Rate per Screen</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-slate-600">Average Rate</span>
                    <span className="font-medium">AED 50-250/hour</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-slate-600">Minimum Spend</span>
                    <span className="font-medium">AED 100</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-slate-600">Payment Methods</span>
                    <span className="font-medium">Card, Apple Pay, Bank</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-100">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4">For Venues</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-slate-600">Revenue Share</span>
                    <span className="font-medium text-emerald-600">100% to Venue</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-slate-600">Payout Frequency</span>
                    <span className="font-medium">Weekly or Monthly</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <span className="text-slate-600">Minimum Payout</span>
                    <span className="font-medium">AED 100</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-slate-600">Payout Method</span>
                    <span className="font-medium">Bank Transfer</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border border-slate-200">
                <CardContent className="p-0">
                  <button
                    className="w-full px-6 py-4 flex items-center justify-between text-left"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span className="font-medium text-slate-900">{faq.question}</span>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-4">
                      <p className="text-slate-600">{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Still Have Questions?</h2>
          <p className="text-slate-600 mb-8">Our team is ready to help you get started</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to={createPageUrl("HelpCenter")}>
              <Button variant="outline" size="lg" className="border-2">
                Visit Help Center
              </Button>
            </Link>
            <Link to={createPageUrl("Contact")}>
              <Button variant="outline" size="lg" className="border-2">
                Contact Support
              </Button>
            </Link>
            <a href="mailto:hello@beyondwalls.ae">
              <Button variant="outline" size="lg" className="border-2">
                Email Us
              </Button>
            </a>
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
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join the fastest-growing DOOH network in the UAE. Launch your first campaign in under 30 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Register")}>
              <Button size="lg" className="bg-white text-violet-600 hover:bg-slate-100 h-14 px-8 shadow-xl">
                <Megaphone className="w-5 h-5 mr-2" />
                Start as Advertiser
              </Button>
            </Link>
            <Link to={createPageUrl("Register")}>
              <Button size="lg" className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-violet-600 h-14 px-8">
                <Building2 className="w-5 h-5 mr-2" />
                Join as Venue Owner
              </Button>
            </Link>
          </div>
          <p className="text-white/60 mt-8 text-sm">No credit card required • Free to sign up • Go live in 30 minutes</p>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}