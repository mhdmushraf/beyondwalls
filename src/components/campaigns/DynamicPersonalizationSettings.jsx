import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CloudRain, 
  Calendar, 
  Users,
  Sparkles,
  TrendingUp
} from "lucide-react";

export default function DynamicPersonalizationSettings({ campaignData, onChange }) {
  const [settings, setSettings] = useState(campaignData?.dynamic_personalization || {
    enabled: false,
    time_based: false,
    weather_based: false,
    event_based: false,
    audience_based: false
  });

  const handleToggle = (field, value) => {
    const updated = { ...settings, [field]: value };
    
    // If disabling main toggle, disable all sub-options
    if (field === "enabled" && !value) {
      updated.time_based = false;
      updated.weather_based = false;
      updated.event_based = false;
      updated.audience_based = false;
    }
    
    setSettings(updated);
    onChange({ dynamic_personalization: updated });
  };

  const personalizationOptions = [
    {
      id: "time_based",
      icon: Clock,
      title: "Time-Based Adaptation",
      description: "Adjust content based on time of day (morning, afternoon, evening)",
      example: "Show breakfast menu in morning, dinner specials in evening",
      color: "blue"
    },
    {
      id: "weather_based",
      icon: CloudRain,
      title: "Weather-Responsive",
      description: "Adapt creative based on current weather conditions",
      example: "Show hot drinks during cold weather, ice cream when it's hot",
      color: "cyan"
    },
    {
      id: "event_based",
      icon: Calendar,
      title: "Event-Triggered",
      description: "Change content during local events or holidays",
      example: "Special promotions during Dubai Shopping Festival, Ramadan",
      color: "purple"
    },
    {
      id: "audience_based",
      icon: Users,
      title: "Audience Targeting",
      description: "Personalize based on venue audience demographics",
      example: "Show family offers at family venues, premium products at upscale locations",
      color: "green"
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-100 text-blue-700 border-blue-200",
      cyan: "bg-cyan-100 text-cyan-700 border-cyan-200",
      purple: "bg-purple-100 text-purple-700 border-purple-200",
      green: "bg-green-100 text-green-700 border-green-200"
    };
    return colors[color] || colors.blue;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-600" />
              AI Dynamic Personalization
            </CardTitle>
            <CardDescription>
              Let AI automatically adapt your ad content for maximum relevance
            </CardDescription>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(checked) => handleToggle("enabled", checked)}
          />
        </div>
      </CardHeader>

      {settings.enabled && (
        <CardContent className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-lg mb-4">
            <div className="flex items-center gap-2 text-sm text-violet-800">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">AI will automatically optimize your content for better engagement</span>
            </div>
          </div>

          {personalizationOptions.map((option) => {
            const Icon = option.icon;
            const isEnabled = settings[option.id];
            
            return (
              <div
                key={option.id}
                className={`p-4 border-2 rounded-lg transition-all ${
                  isEnabled 
                    ? "border-violet-300 bg-violet-50" 
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColorClasses(option.color)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <Label className="text-base font-medium">{option.title}</Label>
                      <p className="text-sm text-slate-600">{option.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => handleToggle(option.id, checked)}
                  />
                </div>
                {isEnabled && (
                  <div className="mt-3 pl-13 text-sm text-slate-700 bg-white/50 p-2 rounded border border-slate-200">
                    <span className="font-medium text-violet-700">Example: </span>
                    {option.example}
                  </div>
                )}
              </div>
            );
          })}

          {/* Active Features Summary */}
          {Object.values(settings).some(v => v === true) && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-sm text-green-800 mb-2">
                Active Personalization Features:
              </h4>
              <div className="flex flex-wrap gap-2">
                {personalizationOptions.map((option) => 
                  settings[option.id] && (
                    <Badge key={option.id} className={getColorClasses(option.color)}>
                      <option.icon className="w-3 h-3 mr-1" />
                      {option.title}
                    </Badge>
                  )
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}