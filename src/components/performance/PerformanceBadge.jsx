import React from "react";
import { Star, Award, Crown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PerformanceBadge({ score, badge, size = "default" }) {
  const getBadgeConfig = () => {
    if (badge === "elite" || score >= 4.5) {
      return {
        label: "Elite",
        icon: Crown,
        color: "bg-gradient-to-r from-amber-500 to-yellow-500 text-white",
        stars: 5
      };
    }
    if (badge === "premium" || score >= 3.5) {
      return {
        label: "Premium",
        icon: Award,
        color: "bg-gradient-to-r from-violet-500 to-purple-500 text-white",
        stars: 4
      };
    }
    if (badge === "good" || score >= 2.5) {
      return {
        label: "Good",
        icon: TrendingUp,
        color: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
        stars: 3
      };
    }
    return null;
  };

  const config = getBadgeConfig();
  if (!config) return null;

  const Icon = config.icon;
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <Badge className={`${config.color} ${sizeClasses} flex items-center gap-1`}>
      <Icon className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
      {config.label}
      <div className="flex items-center gap-0.5 ml-1">
        {[...Array(config.stars)].map((_, i) => (
          <Star key={i} className={size === "sm" ? "w-2 h-2 fill-current" : "w-3 h-3 fill-current"} />
        ))}
      </div>
    </Badge>
  );
}