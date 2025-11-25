import React, { useState, useMemo } from "react";
import { format, getDay, getHours, isWithinInterval, parseISO } from "date-fns";
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  Zap,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function PricingCalculator({ 
  basePrice, 
  screen, 
  venue, 
  pricingRules = [],
  bookings = [],
  selectedDate = new Date(),
  weeks = 1 
}) {
  const calculateDemandMultiplier = () => {
    if (!screen) return 1;
    const screenBookings = bookings.filter(b => b.screen_id === screen.id && b.status === "active");
    const occupancyRate = screenBookings.length / 5; // 5 available slots
    
    if (occupancyRate >= 0.8) return 1.3; // High demand
    if (occupancyRate >= 0.6) return 1.15; // Medium-high demand
    if (occupancyRate >= 0.4) return 1.0; // Normal demand
    if (occupancyRate >= 0.2) return 0.9; // Low demand
    return 0.85; // Very low demand - discount
  };

  const getTimeOfDayMultiplier = () => {
    const hour = getHours(selectedDate);
    // Peak hours pricing
    if (hour >= 11 && hour <= 14) return { multiplier: 1.2, label: "Lunch Peak" };
    if (hour >= 17 && hour <= 21) return { multiplier: 1.25, label: "Evening Peak" };
    if (hour >= 6 && hour <= 9) return { multiplier: 1.1, label: "Morning Rush" };
    return { multiplier: 1.0, label: "Standard" };
  };

  const getDayOfWeekMultiplier = () => {
    const day = getDay(selectedDate);
    // Weekend premium
    if (day === 5 || day === 6) return { multiplier: 1.15, label: "Weekend Premium" };
    // Thursday in UAE (pre-weekend)
    if (day === 4) return { multiplier: 1.1, label: "Thursday Premium" };
    return { multiplier: 1.0, label: "Weekday" };
  };

  const getSeasonalMultiplier = () => {
    const month = selectedDate.getMonth();
    // UAE seasons
    if (month >= 10 || month <= 2) return { multiplier: 1.2, label: "Peak Season (Winter)" };
    if (month >= 5 && month <= 8) return { multiplier: 0.85, label: "Off-Season (Summer)" };
    return { multiplier: 1.0, label: "Regular Season" };
  };

  const getVenueTypeMultiplier = () => {
    if (!venue) return { multiplier: 1.0, label: "Standard" };
    const premiumVenues = ["mall", "hotel", "hospital"];
    if (premiumVenues.includes(venue.type)) return { multiplier: 1.25, label: "Premium Venue" };
    if (venue.avg_daily_footfall > 1000) return { multiplier: 1.15, label: "High Traffic" };
    return { multiplier: 1.0, label: "Standard Venue" };
  };

  const getCustomRulesMultiplier = () => {
    let totalMultiplier = 1;
    const appliedRules = [];

    pricingRules
      .filter(rule => rule.is_active)
      .sort((a, b) => (b.priority || 1) - (a.priority || 1))
      .forEach(rule => {
        if (rule.type === "seasonal" && rule.start_date && rule.end_date) {
          try {
            const start = parseISO(rule.start_date);
            const end = parseISO(rule.end_date);
            if (isWithinInterval(selectedDate, { start, end })) {
              totalMultiplier *= rule.multiplier;
              appliedRules.push(rule);
            }
          } catch (e) {}
        }
      });

    return { multiplier: totalMultiplier, rules: appliedRules };
  };

  const demandMultiplier = calculateDemandMultiplier();
  const timeOfDay = getTimeOfDayMultiplier();
  const dayOfWeek = getDayOfWeekMultiplier();
  const seasonal = getSeasonalMultiplier();
  const venueType = getVenueTypeMultiplier();
  const customRules = getCustomRulesMultiplier();

  const totalMultiplier = demandMultiplier * timeOfDay.multiplier * dayOfWeek.multiplier * 
    seasonal.multiplier * venueType.multiplier * customRules.multiplier;

  const dynamicPrice = Math.round(basePrice * totalMultiplier);
  const totalCost = dynamicPrice * weeks;
  const savings = basePrice * weeks - totalCost;

  const pricingFactors = [
    { 
      name: "Demand Level", 
      multiplier: demandMultiplier, 
      icon: TrendingUp,
      label: demandMultiplier > 1 ? "High Demand" : demandMultiplier < 1 ? "Low Demand" : "Normal"
    },
    { name: "Time of Day", multiplier: timeOfDay.multiplier, icon: Clock, label: timeOfDay.label },
    { name: "Day of Week", multiplier: dayOfWeek.multiplier, icon: Calendar, label: dayOfWeek.label },
    { name: "Season", multiplier: seasonal.multiplier, icon: Zap, label: seasonal.label },
    { name: "Venue Type", multiplier: venueType.multiplier, icon: TrendingUp, label: venueType.label },
  ];

  if (customRules.rules.length > 0) {
    customRules.rules.forEach(rule => {
      pricingFactors.push({
        name: rule.name,
        multiplier: rule.multiplier,
        icon: Zap,
        label: "Custom Rule"
      });
    });
  }

  return (
    <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="w-5 h-5 text-violet-600" />
          Dynamic Pricing Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Base Price */}
        <div className="flex justify-between items-center pb-3 border-b">
          <span className="text-slate-600">Base Price</span>
          <span className="font-semibold">AED {basePrice}/week</span>
        </div>

        {/* Pricing Factors */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Price Adjustments</p>
          {pricingFactors.map((factor, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <factor.icon className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600">{factor.name}</span>
                <Badge variant="outline" className="text-xs">
                  {factor.label}
                </Badge>
              </div>
              <span className={`font-medium ${
                factor.multiplier > 1 ? "text-rose-600" : 
                factor.multiplier < 1 ? "text-emerald-600" : "text-slate-500"
              }`}>
                {factor.multiplier > 1 ? "+" : ""}{((factor.multiplier - 1) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>

        {/* Total Multiplier */}
        <div className="flex justify-between items-center py-3 border-t border-b">
          <span className="font-medium text-slate-700">Total Adjustment</span>
          <span className={`font-bold text-lg ${
            totalMultiplier > 1 ? "text-rose-600" : 
            totalMultiplier < 1 ? "text-emerald-600" : "text-slate-700"
          }`}>
            {totalMultiplier > 1 ? "+" : ""}{((totalMultiplier - 1) * 100).toFixed(0)}%
          </span>
        </div>

        {/* Final Price */}
        <div className="bg-white rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Dynamic Price</span>
            <span className="font-bold text-violet-600">AED {dynamicPrice}/week</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Duration</span>
            <span className="font-medium">{weeks} week{weeks > 1 ? "s" : ""}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="font-semibold text-lg">Total Cost</span>
            <span className="font-bold text-2xl text-violet-600">AED {totalCost.toLocaleString()}</span>
          </div>
          {savings !== 0 && (
            <div className={`flex items-center justify-end gap-1 text-sm ${
              savings > 0 ? "text-emerald-600" : "text-rose-600"
            }`}>
              {savings > 0 ? (
                <>
                  <TrendingDown className="w-4 h-4" />
                  Save AED {savings.toLocaleString()}
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  Premium: AED {Math.abs(savings).toLocaleString()}
                </>
              )}
            </div>
          )}
        </div>

        {/* Tip */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg text-sm">
          <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-amber-800">
            Book during off-peak hours or summer months to save up to 15% on your campaign.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}