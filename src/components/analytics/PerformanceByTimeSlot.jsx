import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Sun, Sunset, Moon, TrendingUp, Zap } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from "recharts";

export default function PerformanceByTimeSlot({ bookings, screens }) {
  // Simulated hourly data based on typical patterns
  const hourlyData = [
    { hour: "6AM", impressions: 120, engagement: 2.1, label: "Early Morning" },
    { hour: "7AM", impressions: 280, engagement: 2.3, label: "Morning" },
    { hour: "8AM", impressions: 450, engagement: 2.8, label: "Morning Rush" },
    { hour: "9AM", impressions: 520, engagement: 3.1, label: "Morning" },
    { hour: "10AM", impressions: 480, engagement: 2.9, label: "Late Morning" },
    { hour: "11AM", impressions: 420, engagement: 2.7, label: "Late Morning" },
    { hour: "12PM", impressions: 680, engagement: 3.4, label: "Lunch Peak" },
    { hour: "1PM", impressions: 720, engagement: 3.6, label: "Lunch Peak" },
    { hour: "2PM", impressions: 550, engagement: 3.0, label: "Afternoon" },
    { hour: "3PM", impressions: 480, engagement: 2.8, label: "Afternoon" },
    { hour: "4PM", impressions: 520, engagement: 2.9, label: "Late Afternoon" },
    { hour: "5PM", impressions: 650, engagement: 3.2, label: "Evening Rush" },
    { hour: "6PM", impressions: 890, engagement: 4.1, label: "Evening Peak" },
    { hour: "7PM", impressions: 950, engagement: 4.3, label: "Evening Peak" },
    { hour: "8PM", impressions: 880, engagement: 4.0, label: "Evening" },
    { hour: "9PM", impressions: 720, engagement: 3.5, label: "Night" },
    { hour: "10PM", impressions: 420, engagement: 2.8, label: "Late Night" },
    { hour: "11PM", impressions: 220, engagement: 2.2, label: "Late Night" },
  ];

  // Time slot categories
  const timeSlots = [
    { 
      name: "Morning", 
      range: "6AM - 12PM", 
      icon: Sun, 
      color: "#f59e0b",
      impressions: 2270,
      ctr: 2.7,
      bestHour: "9AM",
      recommendation: "Great for business and commuter audiences"
    },
    { 
      name: "Afternoon", 
      range: "12PM - 5PM", 
      icon: Sun, 
      color: "#3b82f6",
      impressions: 2900,
      ctr: 3.1,
      bestHour: "1PM",
      recommendation: "Ideal for lunch crowd and shopping traffic"
    },
    { 
      name: "Evening", 
      range: "5PM - 9PM", 
      icon: Sunset, 
      color: "#8b5cf6",
      impressions: 3370,
      ctr: 3.9,
      bestHour: "7PM",
      recommendation: "Peak engagement - maximize budget here"
    },
    { 
      name: "Night", 
      range: "9PM - 12AM", 
      icon: Moon, 
      color: "#6366f1",
      impressions: 1360,
      ctr: 2.8,
      bestHour: "9PM",
      recommendation: "Best for entertainment and dining venues"
    }
  ];

  // Day of week data
  const dayOfWeekData = [
    { day: "Mon", impressions: 4200, engagement: 2.8 },
    { day: "Tue", impressions: 4500, engagement: 3.0 },
    { day: "Wed", impressions: 4800, engagement: 3.2 },
    { day: "Thu", impressions: 5200, engagement: 3.4 },
    { day: "Fri", impressions: 6800, engagement: 4.1 },
    { day: "Sat", impressions: 7500, engagement: 4.5 },
    { day: "Sun", impressions: 5500, engagement: 3.6 },
  ];

  const peakHour = hourlyData.reduce((max, h) => h.impressions > max.impressions ? h : max);

  return (
    <div className="space-y-6">
      {/* Time Slot Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        {timeSlots.map((slot, index) => {
          const isPeak = slot.name === "Evening";
          return (
            <Card key={slot.name} className={isPeak ? "border-2 border-violet-200 bg-violet-50/50" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${slot.color}20` }}
                    >
                      <slot.icon className="w-5 h-5" style={{ color: slot.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{slot.name}</h3>
                      <p className="text-xs text-slate-500">{slot.range}</p>
                    </div>
                  </div>
                  {isPeak && (
                    <Badge className="bg-violet-100 text-violet-700 border-0">
                      <Zap className="w-3 h-3 mr-1" />
                      Peak
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-slate-900">{slot.impressions.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">Impressions</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold" style={{ color: slot.color }}>{slot.ctr}%</p>
                    <p className="text-xs text-slate-500">Avg CTR</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600">
                  <span className="font-medium">Best hour:</span> {slot.bestHour}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Hourly Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-violet-600" />
            Hourly Performance Distribution
          </CardTitle>
          <CardDescription>Impressions and engagement rates by hour of day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} domain={[0, 5]} />
                <Tooltip 
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="impressions" name="Impressions" radius={[4, 4, 0, 0]}>
                  {hourlyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.hour === "7PM" ? "#8b5cf6" : "#c4b5fd"} 
                    />
                  ))}
                </Bar>
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="engagement" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Engagement %"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Day of Week Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Performance Pattern</CardTitle>
          <CardDescription>Compare performance across days of the week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayOfWeekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Bar dataKey="impressions" fill="#6366f1" radius={[4, 4, 0, 0]} name="Impressions">
                  {dayOfWeekData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={["Fri", "Sat"].includes(entry.day) ? "#8b5cf6" : "#c4b5fd"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Weekend Boost</p>
                <p className="text-sm text-amber-700">
                  Friday and Saturday show 40-50% higher engagement. Consider increasing bids during weekends for maximum impact.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Peak Hour Insight */}
      <Card className="bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-100">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Peak Performance Time</h3>
              <p className="text-slate-600">
                Your campaigns perform best at <strong>{peakHour.hour}</strong> with{" "}
                <strong>{peakHour.impressions.toLocaleString()}</strong> impressions and{" "}
                <strong>{peakHour.engagement}%</strong> engagement rate. This is{" "}
                <strong>35% higher</strong> than the daily average.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}