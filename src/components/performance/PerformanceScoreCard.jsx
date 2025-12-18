import React from "react";
import { TrendingUp, Eye, MousePointerClick } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import PerformanceBadge from "./PerformanceBadge";

export default function PerformanceScoreCard({ screen }) {
  const score = screen.performance_score || 0;
  const scanRate = screen.total_impressions_tracked > 0 
    ? ((screen.total_qr_scans / screen.total_impressions_tracked) * 100).toFixed(2)
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Performance Score</CardTitle>
          <PerformanceBadge score={score} badge={screen.performance_badge} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold">{score.toFixed(1)}</span>
            <span className="text-sm text-slate-500">out of 5.0</span>
          </div>
          <Progress value={(score / 5) * 100} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <Eye className="w-3 h-3" />
              Impressions
            </div>
            <p className="text-lg font-semibold">{screen.total_impressions_tracked?.toLocaleString() || 0}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <MousePointerClick className="w-3 h-3" />
              QR Scans
            </div>
            <p className="text-lg font-semibold">{screen.total_qr_scans?.toLocaleString() || 0}</p>
          </div>
        </div>

        <div className="p-3 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-medium text-violet-900">Engagement Rate</span>
          </div>
          <p className="text-2xl font-bold text-violet-600">{scanRate}%</p>
        </div>
      </CardContent>
    </Card>
  );
}