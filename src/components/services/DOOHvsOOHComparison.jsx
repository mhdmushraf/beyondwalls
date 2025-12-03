import React from "react";
import { CheckCircle2, XCircle, ArrowRight, Zap, Clock, Target, DollarSign, BarChart3, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function DOOHvsOOHComparison() {
  const advantages = [
    { 
      icon: DollarSign, 
      title: "Pocket-Friendly", 
      dooh: "From AED 99/week", 
      ooh: "AED 50,000+/month",
      highlight: "Save 90%+ on advertising costs"
    },
    { 
      icon: Target, 
      title: "Laser-Focused Reach", 
      dooh: "100% targeted audience", 
      ooh: "80% wasted impressions",
      highlight: "Every view counts"
    },
    { 
      icon: Clock, 
      title: "Captive Attention", 
      dooh: "45+ min dwell time", 
      ooh: "2-3 second glance",
      highlight: "Real engagement, not drive-by"
    },
    { 
      icon: Zap, 
      title: "Lightning Fast", 
      dooh: "Live in 5 minutes", 
      ooh: "2-4 weeks setup",
      highlight: "Launch campaigns instantly"
    },
    { 
      icon: BarChart3, 
      title: "Data-Driven", 
      dooh: "Real-time analytics", 
      ooh: "Zero tracking",
      highlight: "Know exactly what works"
    },
    { 
      icon: FileText, 
      title: "Zero Hidden Costs", 
      dooh: "No printing/mounting", 
      ooh: "AED 5,000+ extras",
      highlight: "What you see is what you pay"
    },
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "30px 30px"}} />
      </div>
      <div className="absolute top-20 right-20 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-16">
          <Badge className="bg-violet-500/20 text-violet-300 border-0 mb-4">
            ⚡ The Unfair Advantage
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Why <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Smart Brands</span> Choose DOOH
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Traditional billboards are yesterday's game. Here's why the future belongs to digital.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {advantages.map((item, i) => (
            <Card key={i} className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all group">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-emerald-300 font-medium">{item.dooh}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-slate-500 flex-shrink-0" />
                    <span className="text-slate-500 line-through">{item.ooh}</span>
                  </div>
                </div>
                
                <p className="text-violet-300 text-sm font-medium">{item.highlight}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="bg-gradient-to-r from-violet-600/30 to-indigo-600/30 rounded-3xl p-8 border border-white/10 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">Ready to Advertise Smarter?</h3>
          <p className="text-slate-400 mb-6 max-w-xl mx-auto">
            Join 100+ brands who've already made the switch. No contracts, no hidden fees, just results.
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 h-14 px-8 text-lg">
              Start Your Free Campaign
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}