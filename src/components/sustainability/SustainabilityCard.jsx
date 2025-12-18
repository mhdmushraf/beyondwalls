import React from "react";
import { Leaf, Zap, FileText, TreePine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SustainabilityCard({ metrics }) {
  const items = [
    {
      icon: FileText,
      label: "Paper Saved",
      value: `${(metrics?.paper_saved_kg || 0).toFixed(1)} kg`,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      icon: Leaf,
      label: "Carbon Offset",
      value: `${(metrics?.carbon_offset_kg || 0).toFixed(1)} kg CO₂`,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      icon: TreePine,
      label: "Trees Saved",
      value: `${Math.round(metrics?.trees_saved || 0)}`,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      icon: Zap,
      label: "Energy Used",
      value: `${(metrics?.energy_consumption_kwh || 0).toFixed(1)} kWh`,
      color: "text-amber-600",
      bg: "bg-amber-50"
    }
  ];

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-900">
          <Leaf className="w-5 h-5" />
          Sustainability Impact
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className={`p-3 ${item.bg} rounded-lg`}>
                <Icon className={`w-5 h-5 ${item.color} mb-2`} />
                <p className="text-xs text-slate-600 mb-1">{item.label}</p>
                <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 p-3 bg-white/50 rounded-lg text-center">
          <p className="text-xs text-slate-600">
            🌍 Contributing to UAE's Net Zero 2050 initiative
          </p>
        </div>
      </CardContent>
    </Card>
  );
}