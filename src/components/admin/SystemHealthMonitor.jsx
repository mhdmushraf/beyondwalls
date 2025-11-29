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

  const getOverallHealth = () => {
    const allPages = [...healthStatus.admin, ...healthStatus.user, ...healthStatus.public];
    if (allPages.length === 0) return { percentage: 100, status: 'unknown' };
    
    const healthyCount = allPages.filter(p => p.status === 'healthy').length;
    const percentage = Math.round((healthyCount / allPages.length) * 100);
    
    if (percentage >= 90) return { percentage, status: 'healthy' };
    if (percentage >= 70) return { percentage, status: 'warning' };
    return { percentage, status: 'critical' };
  };

  const overallHealth = getOverallHealth();

  const StatusBadge = ({ status }) => {
    const config = {
      healthy: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
      warning: { color: "bg-amber-100 text-amber-700", icon: AlertCircle },
      error: { color: "bg-red-100 text-red-700", icon: AlertCircle },
      unknown: { color: "bg-slate-100 text-slate-700", icon: Clock }
    };
    
    const { color, icon: Icon } = config[status] || config.unknown;
    
    return (
      <Badge className={`${color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  const PageStatusList = ({ title, pages, icon: Icon }) => {
    const healthyCount = pages.filter(p => p.status === 'healthy').length;
    const hasIssues = pages.some(p => p.status !== 'healthy');
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-violet-600" />
            <span className="font-medium text-slate-900">{title}</span>
          </div>
          <span className="text-sm text-slate-500">
            {healthyCount}/{pages.length} healthy
          </span>
        </div>
        
        {hasIssues && (
          <div className="space-y-2 pl-6">
            {pages.filter(p => p.status !== 'healthy').map((page) => (
              <div 
                key={page.name}
                className="flex items-center justify-between p-2 bg-red-50 rounded-lg"
              >
                <span className="text-sm text-slate-700">{page.label}</span>
                <div className="flex items-center gap-2">
                  <StatusBadge status={page.status} />
                  {page.error && (
                    <span className="text-xs text-red-600">{page.error}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!hasIssues && pages.length > 0 && (
          <div className="pl-6">
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
              All pages operational
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 text-violet-600" />
            System Health Monitor
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={runHealthCheck}
            disabled={isChecking}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Check Now'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Health */}
        <div className="p-4 bg-slate-50 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-700">Overall System Health</span>
            <StatusBadge status={overallHealth.status} />
          </div>
          <Progress 
            value={overallHealth.percentage} 
            className={`h-2 ${
              overallHealth.status === 'healthy' ? '[&>div]:bg-emerald-500' :
              overallHealth.status === 'warning' ? '[&>div]:bg-amber-500' :
              '[&>div]:bg-red-500'
            }`}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-slate-500">
              {overallHealth.percentage}% operational
            </span>
            {lastCheck && (
              <span className="text-xs text-slate-500">
                Last checked: {lastCheck.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Auto-check indicator */}
        <div className="flex items-center justify-between p-3 bg-violet-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-600" />
            <span className="text-sm text-violet-700">Auto-check every 30 minutes</span>
          </div>
          <Badge className={autoCheckEnabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}>
            {autoCheckEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>

        {/* Page Status Sections */}
        <div className="space-y-4">
          <PageStatusList 
            title="Admin Pages" 
            pages={healthStatus.admin} 
            icon={Monitor}
          />
          <PageStatusList 
            title="User Pages" 
            pages={healthStatus.user} 
            icon={Monitor}
          />
          <PageStatusList 
            title="Public Pages" 
            pages={healthStatus.public} 
            icon={Monitor}
          />
        </div>

        {/* Note about manual fixes */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> If issues are detected, they require manual intervention to fix. 
            Contact your development team with the error details above.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}