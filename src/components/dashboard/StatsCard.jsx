import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatsCard({ title, value, icon: Icon, trend, trendValue, color = "violet" }) {
  const colors = {
    violet: "from-violet-500 to-violet-600",
    indigo: "from-indigo-500 to-indigo-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    rose: "from-rose-500 to-rose-600"
  };

  return (
    <div className="relative group bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-600 tracking-wide">{title}</p>
          <p className="text-4xl font-black text-slate-900 mt-2">{value}</p>
          {trendValue && (
            <div className="flex items-center gap-1 mt-3 bg-slate-50 rounded-lg px-3 py-1.5 w-fit">
              {trend === "up" ? (
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rose-500" />
              )}
              <span className={`text-sm font-bold ${trend === "up" ? "text-emerald-600" : "text-rose-600"}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  );
}