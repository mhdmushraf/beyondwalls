import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Box,
  ScanLine,
  MousePointer,
  Clock,
  Eye,
  MoreVertical,
  Play,
  Pause,
  BarChart3
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_CONFIG = {
  draft: { label: "Draft", color: "slate" },
  pending_review: { label: "Pending Review", color: "amber" },
  active: { label: "Active", color: "emerald" },
  paused: { label: "Paused", color: "orange" },
  completed: { label: "Completed", color: "blue" },
  rejected: { label: "Rejected", color: "red" }
};

const AR_TYPE_CONFIG = {
  product_try_on: { label: "Product Try-On", icon: Eye },
  room_placement: { label: "Room Placement", icon: Box },
  interactive_demo: { label: "Interactive Demo", icon: Play },
  "3d_viewer": { label: "3D Viewer", icon: Box }
};

export default function ARCampaignCard({ campaign }) {
  const status = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.draft;
  const arType = AR_TYPE_CONFIG[campaign.ar_type] || AR_TYPE_CONFIG["3d_viewer"];
  const ArTypeIcon = arType.icon;

  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        {/* Thumbnail */}
        <div className="relative h-40 bg-gradient-to-br from-violet-100 to-fuchsia-100 rounded-t-xl overflow-hidden">
          {campaign.thumbnail_url ? (
            <img 
              src={campaign.thumbnail_url} 
              alt={campaign.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Box className="w-12 h-12 text-violet-300" />
            </div>
          )}
          <Badge className={`absolute top-3 left-3 bg-${status.color}-100 text-${status.color}-700`}>
            {status.label}
          </Badge>
          <div className="absolute top-3 right-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="bg-white/80 hover:bg-white h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview AR
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </DropdownMenuItem>
                {campaign.status === "active" ? (
                  <DropdownMenuItem>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause Campaign
                  </DropdownMenuItem>
                ) : campaign.status === "paused" && (
                  <DropdownMenuItem>
                    <Play className="w-4 h-4 mr-2" />
                    Resume Campaign
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArTypeIcon className="w-4 h-4 text-violet-600" />
            <span className="text-xs text-slate-500">{arType.label}</span>
          </div>
          <h3 className="font-semibold text-slate-900 mb-3 truncate">{campaign.name}</h3>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 rounded-lg p-2">
              <ScanLine className="w-4 h-4 text-slate-400 mx-auto mb-1" />
              <p className="text-sm font-semibold text-slate-900">{campaign.total_scans || 0}</p>
              <p className="text-xs text-slate-500">Scans</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2">
              <MousePointer className="w-4 h-4 text-slate-400 mx-auto mb-1" />
              <p className="text-sm font-semibold text-slate-900">{campaign.total_engagements || 0}</p>
              <p className="text-xs text-slate-500">Engages</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-2">
              <Clock className="w-4 h-4 text-slate-400 mx-auto mb-1" />
              <p className="text-sm font-semibold text-slate-900">{campaign.avg_session_duration || 0}s</p>
              <p className="text-xs text-slate-500">Avg Time</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}