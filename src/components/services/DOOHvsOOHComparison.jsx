import React from "react";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DOOHvsOOHComparison() {
  const comparison = [
    { feature: "Cost", dooh: "From AED 99/week", ooh: "AED 50,000+/month" },
    { feature: "Audience Reach", dooh: "100% targeted", ooh: "80% wastage" },
    { feature: "Dwell Time", dooh: "45+ minutes", ooh: "2-3 seconds" },
    { feature: "Recall Rate", dooh: "72% retention", ooh: "~20% retention" },
    { feature: "Launch Time", dooh: "5 minutes", ooh: "2-4 weeks" },
    { feature: "Analytics", dooh: "Real-time tracking", ooh: "No data available" },
    { feature: "Printing Costs", dooh: "Zero", ooh: "AED 5,000+" },
    { feature: "Contract Required", dooh: "No contracts", ooh: "6-12 months" },
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <Badge className="bg-violet-100 text-violet-700 border-0 mb-4">
            The Smart Choice
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            BeyondWalls DOOH vs Traditional OOH
          </h2>
          <p className="text-xl text-slate-600">
            See why smart brands are switching to digital out-of-home
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="grid grid-cols-3 bg-gradient-to-r from-violet-600 to-indigo-600 p-5 text-white">
            <div className="font-semibold">Comparison</div>
            <div className="font-semibold text-center">BeyondWalls ✅</div>
            <div className="font-semibold text-center opacity-70">Traditional OOH</div>
          </div>
          {comparison.map((item, i) => (
            <div key={i} className={`grid grid-cols-3 p-4 items-center ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'} border-b last:border-0`}>
              <div className="font-medium text-slate-700">{item.feature}</div>
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  {item.dooh}
                </span>
              </div>
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 text-slate-400 text-sm">
                  <XCircle className="w-4 h-4" />
                  {item.ooh}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600 h-14 px-8">
              Switch to Smarter Advertising
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}