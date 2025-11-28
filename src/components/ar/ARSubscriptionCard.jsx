import React from "react";
import { Crown, Zap, CreditCard, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const TIER_CONFIG = {
  starter: { 
    name: "AR Starter", 
    color: "blue", 
    credits: 5,
    price: 2500
  },
  professional: { 
    name: "AR Professional", 
    color: "violet", 
    credits: 20,
    price: 7500
  },
  enterprise: { 
    name: "AR Enterprise", 
    color: "amber", 
    credits: 100,
    price: null
  }
};

export default function ARSubscriptionCard({ subscription, onUpgrade }) {
  if (!subscription) {
    return (
      <Card className="border-0 shadow-md mb-8 border-l-4 border-l-slate-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">No AR Subscription</p>
                <p className="text-sm text-slate-500">Upgrade to access AR Engage features</p>
              </div>
            </div>
            <Button onClick={onUpgrade} className="bg-gradient-to-r from-violet-600 to-fuchsia-600">
              <Zap className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tier = TIER_CONFIG[subscription.tier] || TIER_CONFIG.starter;
  const creditsUsed = subscription.credits_used || 0;
  const creditsTotal = subscription.ar_credits || tier.credits;
  const creditsRemaining = creditsTotal - creditsUsed;
  const usagePercent = (creditsUsed / creditsTotal) * 100;
  const isLowCredits = creditsRemaining <= 2;

  return (
    <Card className={`border-0 shadow-md mb-8 border-l-4 border-l-${tier.color}-500`}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 bg-${tier.color}-100 rounded-xl flex items-center justify-center`}>
              <Crown className={`w-6 h-6 text-${tier.color}-600`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-900">{tier.name}</p>
                <Badge className={`bg-${tier.color}-100 text-${tier.color}-700`}>
                  {subscription.status}
                </Badge>
              </div>
              <p className="text-sm text-slate-500">
                {tier.price ? `AED ${tier.price.toLocaleString()}/month` : "Custom pricing"}
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">AR Credits</span>
              <span className="text-sm font-medium text-slate-900">
                {creditsRemaining} / {creditsTotal} remaining
              </span>
            </div>
            <Progress value={usagePercent} className="h-2" />
            {isLowCredits && (
              <div className="flex items-center gap-1 mt-2 text-amber-600 text-xs">
                <AlertCircle className="w-3 h-3" />
                Low credits - consider upgrading
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <CreditCard className="w-4 h-4 mr-2" />
              Buy Credits
            </Button>
            {subscription.tier !== "enterprise" && (
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600"
                onClick={onUpgrade}
              >
                Upgrade
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}