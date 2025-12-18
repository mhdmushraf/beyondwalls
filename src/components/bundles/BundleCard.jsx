import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MonitorPlay, MapPin, TrendingUp, ArrowRight, Tag } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function BundleCard({ bundle, venues = [] }) {
  const savings = bundle.original_price - bundle.bundle_price;
  const savingsPercent = ((savings / bundle.original_price) * 100).toFixed(0);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {bundle.thumbnail_url && (
        <div className="h-48 bg-gradient-to-br from-violet-100 to-indigo-100 relative overflow-hidden">
          <img 
            src={bundle.thumbnail_url} 
            alt={bundle.name}
            className="w-full h-full object-cover"
          />
          {bundle.featured && (
            <Badge className="absolute top-3 right-3 bg-amber-500 text-white">
              Featured
            </Badge>
          )}
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">{bundle.name}</h3>
            <p className="text-sm text-slate-500 line-clamp-2">{bundle.description}</p>
          </div>
          {bundle.discount_percentage > 0 && (
            <Badge className="bg-green-500 text-white shrink-0">
              <Tag className="w-3 h-3 mr-1" />
              {bundle.discount_percentage}% OFF
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-slate-600">
            <MonitorPlay className="w-4 h-4" />
            {bundle.screen_ids?.length || 0} Screens
          </div>
          <div className="flex items-center gap-1 text-slate-600">
            <MapPin className="w-4 h-4" />
            {venues.length} Venues
          </div>
        </div>

        {bundle.target_audience && (
          <div className="text-sm">
            <span className="text-slate-500">Perfect for:</span>
            <span className="ml-1 font-medium text-slate-900">{bundle.target_audience}</span>
          </div>
        )}

        {bundle.total_impressions_estimate > 0 && (
          <div className="flex items-center gap-2 p-2 bg-violet-50 rounded-lg">
            <TrendingUp className="w-4 h-4 text-violet-600" />
            <span className="text-sm text-violet-900">
              ~{bundle.total_impressions_estimate.toLocaleString()} impressions/week
            </span>
          </div>
        )}

        <div className="pt-2 border-t">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              AED {bundle.bundle_price.toLocaleString()}
            </span>
            {bundle.original_price > bundle.bundle_price && (
              <span className="text-sm text-slate-400 line-through">
                AED {bundle.original_price.toLocaleString()}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            for {bundle.duration_weeks} week{bundle.duration_weeks > 1 ? 's' : ''}
          </p>
        </div>
      </CardContent>

      <CardFooter>
        <Link to={createPageUrl("BundleDetails") + `?id=${bundle.id}`} className="w-full">
          <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700">
            View Bundle
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}