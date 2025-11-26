import React from "react";
import {
  ShoppingBag,
  Utensils,
  Dumbbell,
  Sparkles,
  Calendar,
  Megaphone,
  Gift,
  Building2,
  Coffee,
  Car
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const CAMPAIGN_TEMPLATES = [
  {
    id: "restaurant_promo",
    name: "Restaurant Promotion",
    icon: Utensils,
    color: "orange",
    description: "Drive foot traffic and orders for your restaurant",
    goal: "traffic",
    target_venue_types: ["restaurant", "cafe", "mall"],
    target_demographics: { age_groups: ["25-34", "35-44"], interests: ["food", "dining"] },
    time_slots: ["afternoon", "evening"],
    duration_days: 14,
    budget_range: { min: 2000, max: 5000 },
    headline_template: "Taste the Difference at [Business Name]",
    description_template: "Fresh flavors, unforgettable moments. Visit us today!"
  },
  {
    id: "retail_sale",
    name: "Retail Sale Event",
    icon: ShoppingBag,
    color: "pink",
    description: "Maximize visibility for sales and special offers",
    goal: "reach",
    target_venue_types: ["mall", "cafe", "coworking"],
    target_demographics: { age_groups: ["18-24", "25-34", "35-44"], interests: ["shopping", "fashion"] },
    time_slots: ["morning", "afternoon", "evening"],
    duration_days: 7,
    budget_range: { min: 3000, max: 8000 },
    headline_template: "Up to 50% OFF - Limited Time!",
    description_template: "Don't miss our biggest sale of the season. Shop now!"
  },
  {
    id: "gym_membership",
    name: "Fitness & Gym",
    icon: Dumbbell,
    color: "green",
    description: "Attract new members to your fitness center",
    goal: "conversions",
    target_venue_types: ["gym", "coworking", "cafe"],
    target_demographics: { age_groups: ["18-24", "25-34", "35-44"], interests: ["fitness", "health"] },
    time_slots: ["morning", "evening"],
    duration_days: 30,
    budget_range: { min: 2500, max: 6000 },
    headline_template: "Transform Your Body Today",
    description_template: "Join now and get your first month FREE. Limited spots!"
  },
  {
    id: "brand_awareness",
    name: "Brand Awareness",
    icon: Megaphone,
    color: "violet",
    description: "Build recognition and recall for your brand",
    goal: "awareness",
    target_venue_types: ["mall", "restaurant", "cafe", "hotel"],
    target_demographics: { age_groups: ["25-34", "35-44", "45-54"], interests: [] },
    time_slots: ["morning", "afternoon", "evening", "peak"],
    duration_days: 21,
    budget_range: { min: 5000, max: 15000 },
    headline_template: "[Business Name] - Quality You Can Trust",
    description_template: "Discover why thousands choose us every day."
  },
  {
    id: "event_promotion",
    name: "Event Promotion",
    icon: Calendar,
    color: "blue",
    description: "Drive attendance for events, launches, or openings",
    goal: "traffic",
    target_venue_types: ["mall", "hotel", "coworking", "restaurant"],
    target_demographics: { age_groups: ["18-24", "25-34", "35-44"], interests: ["events", "entertainment"] },
    time_slots: ["afternoon", "evening", "peak"],
    duration_days: 10,
    budget_range: { min: 3000, max: 10000 },
    headline_template: "You're Invited! [Event Name]",
    description_template: "Join us for an unforgettable experience. Save the date!"
  },
  {
    id: "seasonal_offer",
    name: "Seasonal Offer",
    icon: Gift,
    color: "red",
    description: "Capitalize on holidays and seasonal moments",
    goal: "reach",
    target_venue_types: ["mall", "restaurant", "cafe", "hotel"],
    target_demographics: { age_groups: ["25-34", "35-44", "45-54"], interests: ["shopping", "gifts"] },
    time_slots: ["morning", "afternoon", "evening", "peak"],
    duration_days: 14,
    budget_range: { min: 4000, max: 12000 },
    headline_template: "Season's Best Deals Are Here!",
    description_template: "Celebrate with exclusive offers. Limited time only!"
  },
  {
    id: "real_estate",
    name: "Real Estate",
    icon: Building2,
    color: "slate",
    description: "Showcase properties and attract buyers",
    goal: "conversions",
    target_venue_types: ["mall", "coworking", "hotel", "cafe"],
    target_demographics: { age_groups: ["35-44", "45-54", "55+"], income_level: "high", interests: ["real estate"] },
    time_slots: ["morning", "afternoon"],
    duration_days: 30,
    budget_range: { min: 8000, max: 25000 },
    headline_template: "Your Dream Home Awaits",
    description_template: "Luxury living redefined. Schedule a viewing today."
  },
  {
    id: "cafe_coffee",
    name: "Café & Coffee Shop",
    icon: Coffee,
    color: "amber",
    description: "Bring more customers to your café",
    goal: "traffic",
    target_venue_types: ["coworking", "gym", "mall"],
    target_demographics: { age_groups: ["18-24", "25-34"], interests: ["coffee", "work"] },
    time_slots: ["morning", "afternoon"],
    duration_days: 14,
    budget_range: { min: 1500, max: 4000 },
    headline_template: "Start Your Day Right",
    description_template: "Premium coffee, cozy vibes. Your new favorite spot!"
  },
  {
    id: "automotive",
    name: "Automotive",
    icon: Car,
    color: "indigo",
    description: "Promote vehicles, services, or dealerships",
    goal: "conversions",
    target_venue_types: ["mall", "gym", "coworking", "restaurant"],
    target_demographics: { age_groups: ["25-34", "35-44", "45-54"], income_level: "medium", interests: ["automotive"] },
    time_slots: ["morning", "afternoon", "evening"],
    duration_days: 21,
    budget_range: { min: 6000, max: 20000 },
    headline_template: "Drive Your Dreams",
    description_template: "Experience the thrill. Test drive today!"
  }
];

const colorStyles = {
  orange: "bg-orange-100 text-orange-600 border-orange-200",
  pink: "bg-pink-100 text-pink-600 border-pink-200",
  green: "bg-emerald-100 text-emerald-600 border-emerald-200",
  violet: "bg-violet-100 text-violet-600 border-violet-200",
  blue: "bg-blue-100 text-blue-600 border-blue-200",
  red: "bg-rose-100 text-rose-600 border-rose-200",
  slate: "bg-slate-100 text-slate-600 border-slate-200",
  amber: "bg-amber-100 text-amber-600 border-amber-200",
  indigo: "bg-indigo-100 text-indigo-600 border-indigo-200"
};

export default function CampaignTemplates({ onSelectTemplate }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-violet-600" />
        <h3 className="font-semibold text-slate-900">Quick Start Templates</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CAMPAIGN_TEMPLATES.map((template) => {
          const Icon = template.icon;
          return (
            <Card 
              key={template.id} 
              className="border hover:border-violet-300 hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => onSelectTemplate(template)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorStyles[template.color]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 group-hover:text-violet-600 transition-colors">
                      {template.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">{template.description}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mt-3">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {template.goal}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {template.duration_days} days
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    AED {template.budget_range.min.toLocaleString()}+
                  </Badge>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-3 text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export { CAMPAIGN_TEMPLATES };