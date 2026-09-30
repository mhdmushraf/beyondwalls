import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  MonitorPlay, Users, Play, MapPin, Clock, 
  TrendingUp, Eye, Sparkles, ArrowRight,
  Coffee, Dumbbell, Scissors, Hotel, Building2, Heart, ShoppingBag, UtensilsCrossed
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function RestaurantDOOHStats() {
  const liveStats = [
    { icon: Sparkles, value: "Self-serve", label: "Booking platform", sublabel: "No contracts" },
    { icon: Eye, value: "Proof of play", label: "On every ad", sublabel: "Verified playback" },
    { icon: Play, value: "200+", label: "Ad Plays Per Day", sublabel: "Per screen" },
    { icon: Clock, value: "24/7", label: "Screen monitoring", sublabel: "Always on" },
  ];

  const screenSpecs = [
    { label: "Screen Sizes", value: "Any Size", desc: "Works on any screen" },
    { label: "Ad Duration", value: "15 Seconds", desc: "Optimal for message retention" },
    { label: "Repeat Frequency", value: "Every 3 min", desc: "Consistent brand exposure" },
    { label: "Operating Hours", value: "10+ Hours/Day", desc: "Full-day coverage" },
  ];

  const venueTypes = [
    { icon: UtensilsCrossed, name: "Restaurants" },
    { icon: Coffee, name: "Cafés" },
    { icon: Dumbbell, name: "Gyms" },
    { icon: Scissors, name: "Salons" },
    { icon: Hotel, name: "Hotels" },
    { icon: Building2, name: "Coworking" },
    { icon: Heart, name: "Clinics" },
    { icon: ShoppingBag, name: "Retail" },
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
        <div className="text-center mb-12">
          <Badge className="bg-violet-500/20 text-violet-300 border-0 mb-4">
            📊 Live Network Performance
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Real Results Across <span className="text-violet-400">All Venue Types</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            What screen advertising can deliver for restaurants and cafés
          </p>
        </div>

        {/* Venue Types Row */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {venueTypes.map((venue, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
              <venue.icon className="w-4 h-4 text-violet-400" />
              <span className="text-slate-300 text-sm">{venue.name}</span>
            </div>
          ))}
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
            <h3 className="text-2xl font-bold text-white mb-2">Flexible Screen Specifications</h3>
            <p className="text-slate-400">Works with any display in any venue</p>
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
              <Sparkles className="w-6 h-6 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Always-On Engagement</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Smart Content Rotation</h3>
            <p className="text-slate-400 max-w-lg">
              Screens display venue-relevant content between ads - menus, services, offers. 
              Keeps viewers engaged throughout their entire visit, maximizing your ad impact.
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