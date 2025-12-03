import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  MonitorPlay, Users, Play, MapPin, Clock, 
  TrendingUp, Eye, RefreshCw, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function RestaurantDOOHStats() {
  const liveStats = [
    { icon: Users, value: "9,000+", label: "Daily Audience Reach", sublabel: "Across all screens" },
    { icon: Eye, value: "4,800+", label: "Unique Viewers Daily", sublabel: "Individual reach" },
    { icon: Play, value: "144+", label: "Ad Plays Per Day", sublabel: "Per screen" },
    { icon: MapPin, value: "13+", label: "Premium Locations", sublabel: "High-traffic venues" },
  ];

  const screenSpecs = [
    { label: "Screen Sizes", value: "43\", 55\", 65\"", desc: "Premium, impossible to miss" },
    { label: "Ad Duration", value: "20 Seconds", desc: "Optimal for message retention" },
    { label: "Repeat Frequency", value: "Every 5 min", desc: "Consistent brand exposure" },
    { label: "Operating Hours", value: "12+ Hours/Day", desc: "Full-day coverage" },
  ];

  return (
    <section className="py-20 px-6 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "40px 40px"}} />
      </div>
      <div className="absolute top-10 right-10 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-violet-500/20 text-violet-300 border-0 mb-4">
            📊 Live Network Performance
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Real Results from Our <span className="text-violet-400">Restaurant Network</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Verified performance data from our active campaigns across UAE restaurants and cafés
          </p>
        </div>

        {/* Main Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {liveStats.map((stat, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center hover:bg-white/10 transition-colors">
              <div className="w-14 h-14 bg-violet-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-7 h-7 text-violet-400" />
              </div>
              <p className="text-4xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-slate-300 font-medium">{stat.label}</p>
              <p className="text-slate-500 text-sm">{stat.sublabel}</p>
            </div>
          ))}
        </div>

        {/* Screen Specs */}
        <div className="bg-gradient-to-r from-violet-600/20 to-indigo-600/20 rounded-3xl p-8 border border-white/10 mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Premium Screen Specifications</h3>
            <p className="text-slate-400">High-impact displays that demand attention</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {screenSpecs.map((spec, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-bold text-violet-400 mb-1">{spec.value}</p>
                <p className="text-white font-medium">{spec.label}</p>
                <p className="text-slate-500 text-sm">{spec.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Engagement Callout */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl p-8 border border-emerald-500/20">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center gap-3 mb-2">
              <RefreshCw className="w-6 h-6 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Continuous Engagement</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Menu Display Between Ads</h3>
            <p className="text-slate-400 max-w-lg">
              Screens display venue menus between ad slots, ensuring viewers keep watching. 
              Your audience is captive and engaged throughout their 45+ minute visit.
            </p>
          </div>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 h-14 px-8">
              Book Your Campaign
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}