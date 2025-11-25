import React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MoreVertical, Play, Pause, Calendar, MonitorPlay, TrendingUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusColors = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  pending_approval: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-blue-100 text-blue-700 border-blue-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  paused: "bg-orange-100 text-orange-700 border-orange-200",
  completed: "bg-violet-100 text-violet-700 border-violet-200",
  cancelled: "bg-slate-100 text-slate-700 border-slate-200"
};

export default function CampaignCard({ campaign, onView, onPause, onResume }) {
  const status = campaign.status || "draft";
  
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 hover:shadow-lg hover:border-violet-100 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 group-hover:text-violet-600 transition-colors">
            {campaign.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
            <Calendar className="w-4 h-4" />
            {campaign.start_date && format(new Date(campaign.start_date), "MMM d")} - 
            {campaign.end_date && format(new Date(campaign.end_date), "MMM d, yyyy")}
          </div>
        </div>
        <Badge className={`${statusColors[status]} border capitalize`}>
          {status.replace("_", " ")}
        </Badge>
      </div>

      {campaign.creative_url && (
        <div className="relative mb-4 rounded-lg overflow-hidden bg-slate-100 aspect-video">
          {campaign.creative_type === "video" ? (
            <video 
              src={campaign.creative_url} 
              className="w-full h-full object-cover"
              muted
            />
          ) : (
            <img 
              src={campaign.creative_url} 
              alt={campaign.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <MonitorPlay className="w-4 h-4 text-slate-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-slate-900">{campaign.screen_ids?.length || 0}</p>
          <p className="text-xs text-slate-500">Screens</p>
        </div>
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <Eye className="w-4 h-4 text-slate-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-slate-900">{campaign.impressions?.toLocaleString() || 0}</p>
          <p className="text-xs text-slate-500">Impressions</p>
        </div>
        <div className="text-center p-3 bg-slate-50 rounded-lg">
          <TrendingUp className="w-4 h-4 text-slate-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-slate-900">AED {campaign.spend || 0}</p>
          <p className="text-xs text-slate-500">Spent</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <p className="text-sm text-slate-500">
          Total: <span className="font-semibold text-slate-900">AED {campaign.total_cost || 0}</span>
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onView(campaign)}>
            View Details
          </Button>
          {status === "active" && (
            <Button variant="ghost" size="icon" onClick={() => onPause(campaign)}>
              <Pause className="w-4 h-4" />
            </Button>
          )}
          {status === "paused" && (
            <Button variant="ghost" size="icon" onClick={() => onResume(campaign)}>
              <Play className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}