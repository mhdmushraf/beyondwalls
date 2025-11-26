import React from "react";
import { Eye, MousePointer, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const goals = [
  {
    id: "reach",
    name: "Maximize Reach",
    description: "Get your ad seen by as many people as possible",
    icon: Eye,
    color: "violet",
    kpiLabel: "Target Impressions",
    kpiPlaceholder: "e.g., 50000"
  },
  {
    id: "awareness",
    name: "Brand Awareness",
    description: "Build recognition and recall for your brand",
    icon: Users,
    color: "blue",
    kpiLabel: "Target Brand Lift %",
    kpiPlaceholder: "e.g., 15"
  },
  {
    id: "traffic",
    name: "Drive Traffic",
    description: "Send customers to your location or website",
    icon: TrendingUp,
    color: "emerald",
    kpiLabel: "Target Visits",
    kpiPlaceholder: "e.g., 1000"
  },
  {
    id: "clicks",
    name: "Generate Engagement",
    description: "Encourage interactions with your QR code or call-to-action",
    icon: MousePointer,
    color: "amber",
    kpiLabel: "Target Engagements",
    kpiPlaceholder: "e.g., 500"
  },
  {
    id: "conversions",
    name: "Drive Conversions",
    description: "Focus on sales, sign-ups, or specific actions",
    icon: ShoppingCart,
    color: "rose",
    kpiLabel: "Target Conversions",
    kpiPlaceholder: "e.g., 100"
  }
];

const colorClasses = {
  violet: { bg: "bg-violet-100", text: "text-violet-600", border: "border-violet-500", activeBg: "bg-violet-50" },
  blue: { bg: "bg-blue-100", text: "text-blue-600", border: "border-blue-500", activeBg: "bg-blue-50" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-600", border: "border-emerald-500", activeBg: "bg-emerald-50" },
  amber: { bg: "bg-amber-100", text: "text-amber-600", border: "border-amber-500", activeBg: "bg-amber-50" },
  rose: { bg: "bg-rose-100", text: "text-rose-600", border: "border-rose-500", activeBg: "bg-rose-50" }
};

export default function CampaignGoalSelector({ selectedGoal, targetKpi, onGoalChange, onKpiChange }) {
  const selectedGoalData = goals.find(g => g.id === selectedGoal);
  
  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">What's your campaign objective?</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {goals.map((goal) => {
          const colors = colorClasses[goal.color];
          const isSelected = selectedGoal === goal.id;
          
          return (
            <div
              key={goal.id}
              onClick={() => onGoalChange(goal.id)}
              className={`
                p-4 rounded-xl border-2 cursor-pointer transition-all
                ${isSelected 
                  ? `${colors.border} ${colors.activeBg}` 
                  : 'border-slate-200 hover:border-slate-300'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.bg}`}>
                  <goal.icon className={`w-5 h-5 ${colors.text}`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{goal.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{goal.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {selectedGoalData && (
        <div className="mt-4 p-4 bg-slate-50 rounded-xl">
          <Label>{selectedGoalData.kpiLabel} (Optional)</Label>
          <Input
            type="number"
            placeholder={selectedGoalData.kpiPlaceholder}
            value={targetKpi || ""}
            onChange={(e) => onKpiChange(e.target.value)}
            className="mt-2"
          />
          <p className="text-xs text-slate-500 mt-1">
            AI will optimize your campaign to achieve this target
          </p>
        </div>
      )}
    </div>
  );
}