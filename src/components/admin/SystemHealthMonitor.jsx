import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Monitor,
  Clock,
  Zap,
  Wifi,
  WifiOff
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { differenceInMinutes } from "date-fns";

export default function SystemHealthMonitor() {
  const [lastCheck, setLastCheck] = useState(new Date());

  // Fetch all screens for real-time monitoring
  const { data: screens = [], refetch, isLoading } = useQuery({
    queryKey: ["health-monitor-screens"],
    queryFn: () => base44.entities.Screen.list(),
    refetchInterval: 60000 // Refetch every minute
  });

  const handleRefresh = () => {
    refetch();
    setLastCheck(new Date());
  };

  // Calculate screen health
  const getScreenHealth = () => {
    if (screens.length === 0) return { online: 0, offline: 0, warning: 0, total: 0 };
    
    const now = new Date();
    let online = 0;
    let offline = 0;
    let warning = 0;
    
    screens.forEach(screen => {
      if (screen.status === "online" && screen.last_heartbeat) {
        const lastHeartbeat = new Date(screen.last_heartbeat);
        const minutesAgo = differenceInMinutes(now, lastHeartbeat);
        
        if (minutesAgo <= 2) {
          online++;
        } else if (minutesAgo <= 5) {
          warning++;
        } else {
          offline++;
        }
      } else if (screen.status === "online" && !screen.last_heartbeat) {
        warning++;
      } else {
        offline++;
      }
    });
    
    return { online, offline, warning, total: screens.length };
  };

  const screenHealth = getScreenHealth();
  const healthPercentage = screenHealth.total > 0 
    ? Math.round((screenHealth.online / screenHealth.total) * 100) 
    : 100;

  // Get screens that need attention (offline for more than 5 minutes)
  const getOfflineScreens = () => {
    const now = new Date();
    return screens.filter(screen => {
      if (screen.status !== "online") return false;
      if (!screen.last_heartbeat) return true;
      
      const lastHeartbeat = new Date(screen.last_heartbeat);
      const minutesAgo = differenceInMinutes(now, lastHeartbeat);
      return minutesAgo > 5;
    });
  };

  const offlineScreens = getOfflineScreens();

  const getOverallStatus = () => {
    if (healthPercentage >= 90) return 'healthy';
    if (healthPercentage >= 70) return 'warning';
    return 'critical';
  };

  const overallStatus = getOverallStatus();

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 text-violet-600" />
            Screen Health Monitor
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Health */}
        <div className="p-4 bg-slate-50 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-700">Screen Network Health</span>
            <Badge className={`flex items-center gap-1 ${
              overallStatus === 'healthy' ? 'bg-emerald-100 text-emerald-700' :
              overallStatus === 'warning' ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }`}>
              {overallStatus === 'healthy' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              {overallStatus}
            </Badge>
          </div>
          <Progress 
            value={healthPercentage} 
            className={`h-2 ${
              overallStatus === 'healthy' ? '[&>div]:bg-emerald-500' :
              overallStatus === 'warning' ? '[&>div]:bg-amber-500' :
              '[&>div]:bg-red-500'
            }`}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-slate-500">
              {healthPercentage}% screens online
            </span>
            <span className="text-xs text-slate-500">
              Last checked: {lastCheck.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Screen Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-emerald-50 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Wifi className="w-4 h-4 text-emerald-600" />
              <span className="text-2xl font-bold text-emerald-600">{screenHealth.online}</span>
            </div>
            <p className="text-xs text-emerald-700">Online</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-2xl font-bold text-amber-600">{screenHealth.warning}</span>
            </div>
            <p className="text-xs text-amber-700">Delayed</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <WifiOff className="w-4 h-4 text-red-600" />
              <span className="text-2xl font-bold text-red-600">{screenHealth.offline}</span>
            </div>
            <p className="text-xs text-red-700">Offline</p>
          </div>
        </div>

        {/* Offline Screens Alert */}
        {offlineScreens.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-800">
                {offlineScreens.length} Screen{offlineScreens.length > 1 ? 's' : ''} Offline
              </span>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {offlineScreens.slice(0, 5).map(screen => (
                <div key={screen.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm text-slate-700">{screen.name}</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {screen.last_heartbeat 
                      ? `Last seen: ${differenceInMinutes(new Date(), new Date(screen.last_heartbeat))}m ago`
                      : 'Never connected'
                    }
                  </span>
                </div>
              ))}
              {offlineScreens.length > 5 && (
                <p className="text-xs text-red-600 text-center">
                  +{offlineScreens.length - 5} more screens offline
                </p>
              )}
            </div>
          </div>
        )}

        {/* All Good Message */}
        {offlineScreens.length === 0 && screenHealth.total > 0 && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-emerald-800">All screens are operating normally</span>
            </div>
          </div>
        )}

        {/* Auto-refresh indicator */}
        <div className="flex items-center justify-between p-3 bg-violet-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-600" />
            <span className="text-sm text-violet-700">Auto-refresh every minute</span>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
        </div>
      </CardContent>
    </Card>
  );
}