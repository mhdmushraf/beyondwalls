import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Eye, Clock, DollarSign, Calculator } from "lucide-react";

const AD_LOOP_TIME_MINUTES = 10; // Average ad loop duration
const ATTENTION_FACTOR = 0.30; // 30% attention factor
const AVG_SLOT_PRICE_PER_WEEK = 150; // AED per slot per week

export function calculateEstimatedViewers(venue) {
  const dailyCustomers = venue?.daily_customers || venue?.avg_daily_footfall || 0;
  const visibility = (venue?.screen_visibility_percent || 50) / 100;
  const dwellTime = venue?.customer_dwell_time_minutes || 30;
  
  // Formula: (Daily Customers × Visibility) × (Dwell Time ÷ Ad Loop) × Attention Factor
  const viewersReached = dailyCustomers * visibility;
  const adExposures = dwellTime / AD_LOOP_TIME_MINUTES;
  const estimatedViewers = Math.round(viewersReached * adExposures * ATTENTION_FACTOR);
  
  return {
    dailyCustomers,
    visibility: visibility * 100,
    dwellTime,
    viewersReached: Math.round(viewersReached),
    adExposures: adExposures.toFixed(1),
    estimatedDailyViewers: estimatedViewers,
    estimatedWeeklyViewers: estimatedViewers * 7,
    estimatedMonthlyViewers: estimatedViewers * 30
  };
}

export function calculateEstimatedEarnings(venue, numScreens = 1) {
  const analytics = calculateEstimatedViewers(venue);
  const weeklyEarningsPerSlot = AVG_SLOT_PRICE_PER_WEEK * 0.7; // 70% venue share
  const totalSlotsPerScreen = 5; // Available slots for advertisers
  
  // Assume 60% average occupancy
  const occupancyRate = 0.6;
  const weeklyEarnings = weeklyEarningsPerSlot * totalSlotsPerScreen * occupancyRate * numScreens;
  const monthlyEarnings = weeklyEarnings * 4;
  
  return {
    ...analytics,
    weeklyEarnings: Math.round(weeklyEarnings),
    monthlyEarnings: Math.round(monthlyEarnings),
    yearlyEarnings: Math.round(monthlyEarnings * 12),
    occupancyRate: occupancyRate * 100
  };
}

export default function VenueAnalyticsCalculator({ venue, showEarnings = true, compact = false }) {
  if (!venue) return null;
  
  const analytics = calculateEstimatedViewers(venue);
  const earnings = calculateEstimatedEarnings(venue);
  
  if (compact) {
    return (
      <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-lg p-3 border border-violet-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-medium text-violet-900">
              ~{analytics.estimatedDailyViewers.toLocaleString()} viewers/day
            </span>
          </div>
          {showEarnings && (
            <Badge className="bg-emerald-100 text-emerald-700">
              AED {earnings.monthlyEarnings.toLocaleString()}/mo potential
            </Badge>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="w-5 h-5 text-violet-600" />
          Estimated Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <Eye className="w-5 h-5 text-violet-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-violet-600">{analytics.estimatedDailyViewers.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Daily Viewers</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-blue-600">{analytics.estimatedWeeklyViewers.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Weekly Viewers</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center shadow-sm">
            <TrendingUp className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <p className="text-2xl font-bold text-emerald-600">{analytics.estimatedMonthlyViewers.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Monthly Viewers</p>
          </div>
        </div>
        
        {/* Calculation Breakdown */}
        <div className="bg-white/60 rounded-lg p-3 border border-violet-100">
          <p className="text-xs font-medium text-slate-600 mb-2">How we calculate:</p>
          <div className="text-xs text-slate-500 space-y-1">
            <p>• <span className="font-medium">{analytics.dailyCustomers}</span> daily customers</p>
            <p>• × <span className="font-medium">{analytics.visibility}%</span> screen visibility</p>
            <p>• × <span className="font-medium">{analytics.adExposures}</span> ad exposures ({analytics.dwellTime}min stay ÷ {AD_LOOP_TIME_MINUTES}min loop)</p>
            <p>• × <span className="font-medium">{ATTENTION_FACTOR * 100}%</span> attention factor</p>
            <p className="pt-1 border-t border-violet-100 font-medium text-violet-700">
              = <span className="text-lg">{analytics.estimatedDailyViewers}</span> estimated daily viewers
            </p>
          </div>
        </div>
        
        {/* Earnings Estimate */}
        {showEarnings && (
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <p className="text-sm font-medium text-emerald-800">Potential Earnings</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-emerald-600">AED {earnings.weeklyEarnings}</p>
                <p className="text-xs text-slate-500">Weekly</p>
              </div>
              <div>
                <p className="text-lg font-bold text-emerald-600">AED {earnings.monthlyEarnings}</p>
                <p className="text-xs text-slate-500">Monthly</p>
              </div>
              <div>
                <p className="text-lg font-bold text-emerald-600">AED {earnings.yearlyEarnings.toLocaleString()}</p>
                <p className="text-xs text-slate-500">Yearly</p>
              </div>
            </div>
            <p className="text-xs text-emerald-600 mt-2">*Based on {earnings.occupancyRate}% slot occupancy at avg slot prices</p>
          </div>
        )}
        
        {/* Peak Hours Recommendation */}
        {venue.peak_hours?.length > 0 && (
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <p className="text-xs font-medium text-amber-800 mb-1">💡 Peak Hours Insight</p>
            <p className="text-xs text-amber-700">
              Your busiest times are <span className="font-medium">{venue.peak_hours.join(", ")}</span>. 
              Advertisers targeting these slots will reach maximum audience!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}