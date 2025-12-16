import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Eye, 
  MousePointer, 
  Target, 
  Zap,
  DollarSign,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PerformanceBasedPricing({ campaignData, onChange }) {
  const [pricingModel, setPricingModel] = useState(campaignData?.pricing_model || "cpm");
  const [rates, setRates] = useState({
    cost_per_impression: campaignData?.cost_per_impression || 0,
    cost_per_click: campaignData?.cost_per_click || 0,
    cost_per_engagement: campaignData?.cost_per_engagement || 0,
    cost_per_action: campaignData?.cost_per_action || 0
  });

  const handleModelChange = (model) => {
    setPricingModel(model);
    onChange({ pricing_model: model });
  };

  const handleRateChange = (field, value) => {
    const updated = { ...rates, [field]: parseFloat(value) || 0 };
    setRates(updated);
    onChange(updated);
  };

  const pricingOptions = [
    {
      id: "cpm",
      icon: Eye,
      title: "CPM - Cost Per Mille",
      description: "Pay per 1,000 impressions (views)",
      field: "cost_per_impression",
      placeholder: "5.00",
      suffix: "per 1,000 impressions",
      recommended: "Best for brand awareness",
      color: "blue"
    },
    {
      id: "cpc",
      icon: MousePointer,
      title: "CPC - Cost Per Click",
      description: "Pay only when users interact (QR scan, click)",
      field: "cost_per_click",
      placeholder: "2.50",
      suffix: "per interaction",
      recommended: "Best for traffic generation",
      color: "green"
    },
    {
      id: "cpe",
      icon: Target,
      title: "CPE - Cost Per Engagement",
      description: "Pay for meaningful engagements (AR, polls, games)",
      field: "cost_per_engagement",
      placeholder: "5.00",
      suffix: "per engagement",
      recommended: "Best for interactive campaigns",
      color: "purple"
    },
    {
      id: "cpa",
      icon: Zap,
      title: "CPA - Cost Per Action",
      description: "Pay only for conversions (app downloads, purchases)",
      field: "cost_per_action",
      placeholder: "25.00",
      suffix: "per conversion",
      recommended: "Best for performance marketing",
      color: "orange"
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "border-blue-500 bg-blue-50",
      green: "border-green-500 bg-green-50",
      purple: "border-purple-500 bg-purple-50",
      orange: "border-orange-500 bg-orange-50"
    };
    return colors[color] || colors.blue;
  };

  const estimateReach = () => {
    const budget = campaignData?.budget || 1000;
    switch (pricingModel) {
      case "cpm":
        return Math.floor((budget / (rates.cost_per_impression || 5)) * 1000);
      case "cpc":
        return Math.floor(budget / (rates.cost_per_click || 2.5));
      case "cpe":
        return Math.floor(budget / (rates.cost_per_engagement || 5));
      case "cpa":
        return Math.floor(budget / (rates.cost_per_action || 25));
      default:
        return 0;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Performance-Based Pricing
        </CardTitle>
        <CardDescription>
          Choose a pricing model that aligns with your campaign goals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={pricingModel} onValueChange={handleModelChange}>
          {pricingOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = pricingModel === option.id;
            
            return (
              <div key={option.id} className="relative">
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected 
                      ? getColorClasses(option.color)
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  onClick={() => handleModelChange(option.id)}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={option.id} className="flex items-center gap-2 cursor-pointer">
                        <Icon className="w-5 h-5" />
                        <span className="font-semibold">{option.title}</span>
                        <Badge variant="outline" className="ml-auto">
                          {option.recommended}
                        </Badge>
                      </Label>
                      <p className="text-sm text-slate-600 mt-1">{option.description}</p>
                      
                      {isSelected && (
                        <div className="mt-3 space-y-2">
                          <Label className="text-xs">Set Your Rate (AED)</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder={option.placeholder}
                              value={rates[option.field] || ""}
                              onChange={(e) => handleRateChange(option.field, e.target.value)}
                              className="max-w-32"
                            />
                            <span className="text-sm text-slate-600">{option.suffix}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </RadioGroup>

        {/* Estimated Reach */}
        {campaignData?.budget && rates[pricingOptions.find(o => o.id === pricingModel)?.field] > 0 && (
          <div className="p-4 bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Estimated Reach</p>
                <p className="text-xs text-slate-600">Based on your budget and pricing model</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-violet-600">
                  {estimateReach().toLocaleString()}
                </p>
                <p className="text-xs text-slate-600">
                  {pricingModel === "cpm" ? "impressions" :
                   pricingModel === "cpc" ? "interactions" :
                   pricingModel === "cpe" ? "engagements" : "conversions"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Performance-based pricing ensures you only pay for actual results. 
            Track all metrics in real-time through your campaign dashboard.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}