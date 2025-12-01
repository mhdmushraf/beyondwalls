import React, { useState } from "react";
import { HelpCircle, X, Eye, Users, Play, Target, DollarSign, TrendingUp, Clock, MonitorPlay } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// DOOH-specific metric explanations in simple language
const METRIC_EXPLANATIONS = {
  playouts: {
    title: "Ad Playouts",
    icon: Play,
    simple: "How many times your ad appeared on screens",
    detailed: "Every time your ad displays on a screen counts as one playout. Ads typically play in a 10-minute loop, so your ad shows about 6 times per hour.",
    example: "If your ad runs on 2 screens for a week = ~2,000 playouts"
  },
  impressions: {
    title: "Impressions",
    icon: Eye,
    simple: "Estimated number of people who saw your ad",
    detailed: "We calculate this based on the venue's daily customer count, screen visibility, and how long people stay. Not everyone who visits sees every ad.",
    example: "500 daily customers × 70% visibility = 350 impressions/day"
  },
  reach: {
    title: "Unique Reach",
    icon: Users,
    simple: "Individual people who saw your ad (no duplicates)",
    detailed: "Since some customers visit multiple times, reach counts each person only once. This tells you how many different people your ad reached.",
    example: "1,000 impressions with 1.5x frequency = 667 unique people"
  },
  frequency: {
    title: "Frequency",
    icon: TrendingUp,
    simple: "Average times each person saw your ad",
    detailed: "Calculated as Impressions ÷ Reach. Higher frequency means people see your ad multiple times, which improves brand recall.",
    example: "Frequency of 2.5x = Each person saw your ad ~2-3 times"
  },
  cpm: {
    title: "CPM (Cost Per Thousand)",
    icon: DollarSign,
    simple: "How much you pay for every 1,000 people who see your ad",
    detailed: "A standard advertising metric. Lower CPM means more efficient spending. DOOH typically ranges AED 5-50 CPM depending on location.",
    example: "AED 100 spend ÷ 10,000 impressions × 1000 = AED 10 CPM"
  },
  costPerPlayout: {
    title: "Cost Per Playout",
    icon: MonitorPlay,
    simple: "How much each ad display costs you",
    detailed: "Total spend divided by total playouts. This shows the cost efficiency of your screen time.",
    example: "AED 500 spend ÷ 1,000 playouts = AED 0.50 per playout"
  },
  screenTime: {
    title: "Screen Time",
    icon: Clock,
    simple: "Total minutes your ad was displayed",
    detailed: "Each playout is typically 15 seconds. Screen time helps you understand your total brand exposure duration.",
    example: "500 playouts × 15 sec = 125 minutes of screen time"
  },
  brandLift: {
    title: "Brand Awareness Lift",
    icon: Target,
    simple: "Estimated increase in people recognizing your brand",
    detailed: "Industry studies show DOOH advertising typically increases brand awareness by 15-25%. We estimate based on your reach and frequency.",
    example: "18% lift = ~18 more people per 100 now recognize your brand"
  },
  dailyViewers: {
    title: "Estimated Daily Viewers",
    icon: Eye,
    simple: "How many people see your screen each day",
    detailed: "Calculated from venue traffic × screen visibility × attention factor. This is your screen's daily advertising reach potential.",
    formula: "Daily Customers × Visibility % × (Dwell Time ÷ 10min) × 30% attention"
  }
};

export function MetricExplainer({ metric, children, showIcon = true }) {
  const explanation = METRIC_EXPLANATIONS[metric];
  
  if (!explanation) return children;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <span className="inline-flex items-center gap-1 cursor-help">
          {children}
          {showIcon && <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-violet-500" />}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
              <explanation.icon className="w-4 h-4 text-violet-600" />
            </div>
            <h4 className="font-semibold text-slate-900">{explanation.title}</h4>
          </div>
          
          <p className="text-sm text-slate-600 mb-3">{explanation.simple}</p>
          
          <div className="bg-slate-50 rounded-lg p-3 mb-3">
            <p className="text-xs text-slate-500">{explanation.detailed}</p>
          </div>
          
          {explanation.example && (
            <div className="bg-violet-50 rounded-lg p-3">
              <p className="text-xs font-medium text-violet-700">📊 Example:</p>
              <p className="text-xs text-violet-600">{explanation.example}</p>
            </div>
          )}
          
          {explanation.formula && (
            <div className="bg-amber-50 rounded-lg p-3 mt-2">
              <p className="text-xs font-medium text-amber-700">🔢 Formula:</p>
              <p className="text-xs text-amber-600 font-mono">{explanation.formula}</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Standalone help button for larger explanations
export function MetricHelpButton({ metric }) {
  const [open, setOpen] = useState(false);
  const explanation = METRIC_EXPLANATIONS[metric];
  
  if (!explanation) return null;

  return (
    <button
      onClick={() => setOpen(!open)}
      className="p-1 rounded-full hover:bg-slate-100 transition-colors"
    >
      <HelpCircle className="w-4 h-4 text-slate-400" />
    </button>
  );
}

// Export all explanations for use in other components
export { METRIC_EXPLANATIONS };