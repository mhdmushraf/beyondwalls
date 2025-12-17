import React from "react";
import { TrendingUp, Star, Target, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function LeadScoreCard({ lead }) {
  // Calculate lead score based on various factors
  const calculateLeadScore = (lead) => {
    let score = 0;
    
    // Priority weight
    if (lead.priority === "high") score += 30;
    else if (lead.priority === "medium") score += 15;
    else score += 5;
    
    // Status weight
    if (lead.status === "qualified") score += 25;
    else if (lead.status === "negotiating") score += 35;
    else if (lead.status === "contacted") score += 15;
    else if (lead.status === "new") score += 10;
    
    // Expected value weight
    if (lead.expected_value) {
      if (lead.expected_value > 10000) score += 25;
      else if (lead.expected_value > 5000) score += 15;
      else score += 5;
    }
    
    // Has follow-up scheduled
    if (lead.next_followup_date) score += 10;
    
    // Has company name
    if (lead.company_name) score += 5;
    
    return Math.min(score, 100);
  };

  const score = calculateLeadScore(lead);
  const getScoreColor = (score) => {
    if (score >= 70) return "text-emerald-600";
    if (score >= 50) return "text-amber-600";
    return "text-slate-500";
  };

  const getScoreLabel = (score) => {
    if (score >= 70) return "Hot Lead 🔥";
    if (score >= 50) return "Warm Lead";
    return "Cold Lead";
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
        {score}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-xs font-medium text-slate-600">{getScoreLabel(score)}</p>
        </div>
        <Progress value={score} className="h-2" />
      </div>
    </div>
  );
}