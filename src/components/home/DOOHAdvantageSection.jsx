import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Eye, Brain, Clock, Target, Zap, Percent, 
  TrendingUp, Users, CheckCircle2, XCircle,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DOOHAdvantageSection() {
  const doohBenefits = [
    { 
      icon: Eye, 
      title: "2X More Impressions", 
      stat: "100%", 
      desc: "More audience reach than traditional OOH advertising",
      color: "violet"
    },
    { 
      icon: Brain, 
      title: "72% Recall Rate", 
      stat: "72%", 
      desc: "Ads stick when viewers are relaxed & receptive",
      color: "emerald"
    },
    { 
      icon: Clock, 
      title: "45+ Min Dwell Time", 
      stat: "45min", 
      desc: "Captive audience with extended viewing sessions",
      color: "amber"
    },
    { 
      icon: Target, 
      title: "Guaranteed Attention", 
      stat: "98%", 
      desc: "Screens show menus - viewers must look",
      color: "rose"
    },
    { 
      icon: Zap, 
      title: "5-Min Activation", 
      stat: "5min", 
      desc: "Go live instantly vs weeks of traditional setup",
      color: "blue"
    },
    { 
      icon: Percent, 
      title: "90% Cost Savings", 
      stat: "90%", 
      desc: "Compared to traditional OOH & billboard advertising",
      color: "indigo"
    },
  ];

  const comparison = [
    { feature: "Cost", dooh: "From AED 99/week", ooh: "AED 50,000+/month", doohWins: true },
    { feature: "Audience Targeting", dooh: "100% targeted reach", ooh: "80% wastage", doohWins: true },
    { feature: "Dwell Time", dooh: "45+ minutes", ooh: "2-3 seconds", doohWins: true },
    { feature: "Recall Rate", dooh: "72% retention", ooh: "~20% retention", doohWins: true },
    { feature: "Launch Time", dooh: "5 minutes", ooh: "2-4 weeks", doohWins: true },
    { feature: "Analytics", dooh: "Real-time tracking", ooh: "No data", doohWins: true },
    { feature: "Hidden Costs", dooh: "Zero", ooh: "Printing, mounting, removal", doohWins: true },
  ];

  const colorMap = {
    violet: { bg: "bg-violet-100", text: "text-violet-600", stat: "text-violet-600" },
    emerald: { bg: "bg-emerald-100", text: "text-emerald-600", stat: "text-emerald-600" },
    amber: { bg: "bg-amber-100", text: "text-amber-600", stat: "text-amber-600" },
    rose: { bg: "bg-rose-100", text: "text-rose-600", stat: "text-rose-600" },
    blue: { bg: "bg-blue-100", text: "text-blue-600", stat: "text-blue-600" },
    indigo: { bg: "bg-indigo-100", text: "text-indigo-600", stat: "text-indigo-600" },
  };

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-violet-100 text-violet-700 border-0 mb-4">
            Why DOOH Outperforms
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            The <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">BeyondWalls</span> Advantage
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Traditional billboards can't compete. Here's why smart brands choose Digital Out-of-Home.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {doohBenefits.map((benefit, i) => (
            <Card key={i} className="border-0 shadow-lg hover:shadow-xl transition-all group">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 ${colorMap[benefit.color].bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <benefit.icon className={`w-7 h-7 ${colorMap[benefit.color].text}`} />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${colorMap[benefit.color].stat} mb-1`}>{benefit.stat}</p>
                    <h3 className="font-semibold text-slate-900 mb-1">{benefit.title}</h3>
                    <p className="text-slate-600 text-sm">{benefit.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-12">
          <div className="grid grid-cols-3 bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
            <div className="font-semibold">Feature</div>
            <div className="font-semibold text-center">BeyondWalls DOOH ✅</div>
            <div className="font-semibold text-center opacity-70">Traditional OOH</div>
          </div>
          {comparison.map((item, i) => (
            <div key={i} className={`grid grid-cols-3 p-4 items-center ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
              <div className="font-medium text-slate-900">{item.feature}</div>
              <div className="text-center">
                <span className="inline-flex items-center gap-2 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  {item.dooh}
                </span>
              </div>
              <div className="text-center">
                <span className="inline-flex items-center gap-2 text-slate-400">
                  <XCircle className="w-4 h-4" />
                  {item.ooh}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 h-14 px-8">
              Start Advertising Smarter
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="text-slate-500 mt-4 text-sm">No contracts • Cancel anytime • Go live in 5 minutes</p>
        </div>
      </div>
    </section>
  );
}