import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Wifi, 
  TrendingUp, 
  Shield, 
  Zap, 
  CheckCircle2,
  ArrowRight,
  MonitorPlay,
  Cable,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function BOneShowcase() {
  const steps = [
    {
      icon: Cable,
      title: "Plug In",
      description: "Connect the B.One to any HDMI screen with a single cable. No technical skills required.",
      color: "violet"
    },
    {
      icon: Wifi,
      title: "Connect",
      description: "The B.One automatically syncs with the BeyondWalls platform via secure Wi-Fi.",
      color: "indigo"
    },
    {
      icon: TrendingUp,
      title: "Earn",
      description: "Your screen is now live! Start earning a 70% revenue share from premium ads, managed entirely by us.",
      color: "emerald"
    }
  ];

  const features = [
    { icon: MonitorPlay, text: "Universal Compatibility", desc: "Works with any modern TV or display" },
    { icon: RefreshCw, text: "Offline Caching", desc: "Ads play smoothly, even if the internet flickers" },
    { icon: Shield, text: "Secure & Reliable", desc: "Enterprise-grade security and 24/7 monitoring" },
    { icon: Zap, text: "Zero Maintenance", desc: "We handle all updates and support remotely" }
  ];

  const colorClasses = {
    violet: { bg: "bg-violet-100", text: "text-violet-600", ring: "ring-violet-200" },
    indigo: { bg: "bg-indigo-100", text: "text-indigo-600", ring: "ring-indigo-200" },
    emerald: { bg: "bg-emerald-100", text: "text-emerald-600", ring: "ring-emerald-200" }
  };

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-gradient-to-r from-violet-100 to-indigo-100 text-violet-700 border-0 px-4 py-2 text-sm font-semibold mb-6">
            🔌 Introducing B.One
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            B.One: <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Plug. Play. Profit.</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Transform any screen into a smart, revenue-generating billboard in minutes.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Device Image */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 shadow-2xl">
              {/* B.One Device Visualization */}
              <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden">
                {/* Device Box */}
                <div className="relative">
                  <div className="w-48 h-32 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl shadow-xl flex items-center justify-center relative">
                    {/* Logo on device */}
                    <div className="text-center">
                      <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">B.One</span>
                      <p className="text-xs text-slate-500 mt-1">by BeyondWalls</p>
                    </div>
                    
                    {/* LED Status Light */}
                    <div className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
                    
                    {/* Ports on bottom edge */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-3">
                      <div className="w-4 h-1.5 bg-slate-400 rounded-t" title="HDMI" />
                      <div className="w-3 h-1.5 bg-slate-400 rounded-t" title="USB" />
                      <div className="w-2 h-1.5 bg-slate-400 rounded-t" title="Power" />
                    </div>
                  </div>
                  
                  {/* HDMI Cable */}
                  <div className="absolute -right-16 top-1/2 -translate-y-1/2 flex items-center">
                    <div className="w-16 h-0.5 bg-slate-500" />
                    <div className="w-3 h-4 bg-slate-400 rounded-r" />
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-violet-500/30 rounded-tl-lg" />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-violet-500/30 rounded-br-lg" />
              </div>
              
              {/* Caption */}
              <p className="text-center text-slate-400 mt-4 text-sm">
                The B.One device — sleek, compact, and powerful
              </p>
            </div>
            
            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-white rounded-xl px-4 py-2 shadow-xl border border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-slate-700">Plug & Play</span>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl px-4 py-2 shadow-xl">
              <span className="text-white font-bold">70% Revenue Share</span>
            </div>
          </div>

          {/* How It Works Steps */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900 mb-8">How It Works</h3>
            
            {steps.map((step, index) => {
              const colors = colorClasses[step.color];
              return (
                <div key={index} className="flex items-start gap-4 group">
                  <div className={`w-14 h-14 rounded-2xl ${colors.bg} flex items-center justify-center flex-shrink-0 ring-4 ${colors.ring} group-hover:scale-110 transition-transform`}>
                    <step.icon className={`w-7 h-7 ${colors.text}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-violet-600">Step {index + 1}</span>
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 mb-1">{step.title}</h4>
                    <p className="text-slate-600">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="absolute left-7 mt-14 w-0.5 h-8 bg-slate-200 hidden lg:block" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Features Grid */}
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-3xl p-8 md:p-12 border border-violet-100">
          <h3 className="text-xl font-bold text-slate-900 mb-8 text-center">Key Features of B.One</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-violet-600" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <h4 className="font-semibold text-slate-900">{feature.text}</h4>
                </div>
                <p className="text-slate-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 h-14 px-8 text-lg shadow-xl shadow-violet-500/25">
              Get Your B.One Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="text-slate-500 mt-4 text-sm">
            Free shipping across UAE • 30-day money-back guarantee
          </p>
        </div>
      </div>
    </section>
  );
}