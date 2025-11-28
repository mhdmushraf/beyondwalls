import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Box,
  Eye,
  Play,
  Smartphone,
  ShoppingBag,
  Home,
  Sparkles,
  CheckCircle2,
  Crown,
  ArrowRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Default templates (will be created in DB)
const DEFAULT_TEMPLATES = [
  {
    id: "virtual-showroom",
    name: "Virtual Showroom",
    slug: "virtual-showroom",
    description: "Showcase multiple products in an interactive 3D space. Perfect for retail brands.",
    category: "retail",
    ar_type: "3d_viewer",
    cta_type: "buy_now",
    placement_type: "prime_location",
    thumbnail_url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
    features: ["360° Product View", "Multi-product Display", "Direct Purchase CTA", "Brand Customization"],
    is_premium: false
  },
  {
    id: "interactive-demo",
    name: "Interactive Product Demo",
    slug: "interactive-demo",
    description: "Let customers interact with your product features. Ideal for electronics & gadgets.",
    category: "general",
    ar_type: "interactive_demo",
    cta_type: "learn_more",
    placement_type: "standard",
    thumbnail_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    features: ["Feature Hotspots", "Animated Highlights", "Info Overlays", "Tutorial Mode"],
    is_premium: false
  },
  {
    id: "try-before-buy",
    name: "Try Before You Buy",
    slug: "try-before-buy",
    description: "Virtual try-on experience for fashion, accessories, and cosmetics.",
    category: "retail",
    ar_type: "product_try_on",
    cta_type: "buy_now",
    placement_type: "peak_hour",
    thumbnail_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
    features: ["Real-time Try-On", "Size Recommendations", "Color Variants", "Social Sharing"],
    is_premium: true
  },
  {
    id: "room-visualizer",
    name: "Room Visualizer",
    slug: "room-visualizer",
    description: "Help customers see furniture and decor in their actual space.",
    category: "real_estate",
    ar_type: "room_placement",
    cta_type: "book_demo",
    placement_type: "standard",
    thumbnail_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
    features: ["Surface Detection", "Scale Adjustment", "Multiple Items", "Save Layouts"],
    is_premium: true
  },
  {
    id: "seasonal-promo",
    name: "Seasonal Promotion",
    slug: "seasonal-promo",
    description: "Limited-time AR experience with festive themes and special offers.",
    category: "events",
    ar_type: "interactive_demo",
    cta_type: "buy_now",
    placement_type: "multi_screen",
    thumbnail_url: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&h=300&fit=crop",
    features: ["Themed Assets", "Countdown Timer", "Special Offers", "Gamification"],
    is_premium: false
  }
];

const AR_TYPE_ICONS = {
  product_try_on: Eye,
  room_placement: Home,
  interactive_demo: Play,
  "3d_viewer": Box
};

export default function ARTemplateSelector({ onSelectTemplate, selectedTemplateId, isPremiumUser = false }) {
  const { data: dbTemplates = [] } = useQuery({
    queryKey: ["ar-templates"],
    queryFn: () => base44.entities.ARCampaignTemplate.filter({ is_active: true }),
  });

  // Merge DB templates with defaults
  const templates = dbTemplates.length > 0 ? dbTemplates : DEFAULT_TEMPLATES;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Choose a Template</h3>
        <p className="text-slate-500 text-sm">Start with a pre-configured template or create from scratch</p>
      </div>

      {/* Start from Scratch Option */}
      <Card 
        className={`border-2 cursor-pointer transition-all ${
          selectedTemplateId === "scratch" 
            ? "border-violet-500 bg-violet-50" 
            : "border-dashed border-slate-300 hover:border-violet-300"
        }`}
        onClick={() => onSelectTemplate(null)}
      >
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-slate-400" />
          </div>
          <p className="font-semibold text-slate-900">Start from Scratch</p>
          <p className="text-sm text-slate-500">Create a custom AR campaign</p>
        </CardContent>
      </Card>

      {/* Template Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => {
          const TypeIcon = AR_TYPE_ICONS[template.ar_type] || Box;
          const isLocked = template.is_premium && !isPremiumUser;
          const isSelected = selectedTemplateId === template.id;

          return (
            <Card 
              key={template.id}
              className={`border-2 cursor-pointer transition-all relative overflow-hidden ${
                isSelected 
                  ? "border-violet-500 bg-violet-50" 
                  : isLocked 
                    ? "border-slate-200 opacity-75" 
                    : "border-slate-200 hover:border-violet-300"
              }`}
              onClick={() => !isLocked && onSelectTemplate(template)}
            >
              {/* Thumbnail */}
              <div className="h-32 bg-slate-100 relative">
                {template.thumbnail_url ? (
                  <img 
                    src={template.thumbnail_url} 
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <TypeIcon className="w-10 h-10 text-slate-300" />
                  </div>
                )}
                
                {/* Premium Badge */}
                {template.is_premium && (
                  <Badge className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}

                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-2 left-2 w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Locked Overlay */}
                {isLocked && (
                  <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Crown className="w-8 h-8 mx-auto mb-1" />
                      <p className="text-sm font-medium">Premium Only</p>
                    </div>
                  </div>
                )}
              </div>

              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TypeIcon className="w-4 h-4 text-violet-600" />
                  <span className="text-xs text-slate-500 capitalize">{template.ar_type?.replace("_", " ")}</span>
                </div>
                <h4 className="font-semibold text-slate-900 mb-1">{template.name}</h4>
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{template.description}</p>
                
                {/* Features */}
                <div className="flex flex-wrap gap-1">
                  {template.features?.slice(0, 2).map((feature, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {template.features?.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.features.length - 2}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}