import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import {
  Bell,
  Mail,
  Megaphone,
  Wallet,
  MonitorPlay,
  TrendingDown,
  Calendar,
  FileText,
  Save,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function NotificationPreferences() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl("NotificationPreferences"));
        return;
      }
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {
      base44.auth.redirectToLogin(createPageUrl("NotificationPreferences"));
    }
  };

  const { data: preferences, isLoading } = useQuery({
    queryKey: ["notification-preferences", user?.email],
    queryFn: async () => {
      const prefs = await base44.entities.NotificationPreference.filter({ user_id: user?.email });
      return prefs[0] || null;
    },
    enabled: !!user?.email
  });

  const [localPrefs, setLocalPrefs] = useState(null);

  useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences);
    } else if (user?.email && !isLoading) {
      // Set defaults
      setLocalPrefs({
        user_id: user.email,
        email_notifications: true,
        in_app_notifications: true,
        campaign_approved: true,
        campaign_rejected: true,
        new_booking: true,
        low_balance: true,
        low_balance_threshold: 500,
        payout_completed: true,
        screen_offline: true,
        screen_offline_threshold_minutes: 30,
        booking_ending: true,
        booking_ending_days_before: 3,
        withdrawal_processed: true,
        performance_alerts: true,
        performance_threshold_percent: 20,
        daily_summary: false,
        weekly_report: true
      });
    }
  }, [preferences, user, isLoading]);

  const saveMutation = useMutation({
    mutationFn: async (prefs) => {
      if (preferences?.id) {
        return await base44.entities.NotificationPreference.update(preferences.id, prefs);
      } else {
        return await base44.entities.NotificationPreference.create(prefs);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      toast.success("Notification preferences saved!");
    },
    onError: () => {
      toast.error("Failed to save preferences");
    }
  });

  const handleSave = () => {
    saveMutation.mutate(localPrefs);
  };

  const updatePref = (key, value) => {
    setLocalPrefs({ ...localPrefs, [key]: value });
  };

  if (!user || !localPrefs) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Notification Preferences</h1>
        <p className="text-slate-500">Manage how you receive alerts and updates</p>
      </div>

      {/* Main Channels */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>Choose how you want to receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-violet-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-violet-600" />
              <div>
                <Label className="font-semibold text-slate-900">In-App Notifications</Label>
                <p className="text-sm text-slate-600">Get notified within the app</p>
              </div>
            </div>
            <Switch
              checked={localPrefs.in_app_notifications}
              onCheckedChange={(val) => updatePref("in_app_notifications", val)}
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <Label className="font-semibold text-slate-900">Email Notifications</Label>
                <p className="text-sm text-slate-600">Receive alerts via email</p>
              </div>
            </div>
            <Switch
              checked={localPrefs.email_notifications}
              onCheckedChange={(val) => updatePref("email_notifications", val)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Campaign Notifications */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-violet-600" />
            Campaign Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Campaign Approved</Label>
              <p className="text-sm text-slate-500">When your campaign is approved</p>
            </div>
            <Switch
              checked={localPrefs.campaign_approved}
              onCheckedChange={(val) => updatePref("campaign_approved", val)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Campaign Rejected</Label>
              <p className="text-sm text-slate-500">When your campaign is rejected</p>
            </div>
            <Switch
              checked={localPrefs.campaign_rejected}
              onCheckedChange={(val) => updatePref("campaign_rejected", val)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Campaign Ending Soon</Label>
              <p className="text-sm text-slate-500">Alert before campaign ends</p>
            </div>
            <Switch
              checked={localPrefs.booking_ending}
              onCheckedChange={(val) => updatePref("booking_ending", val)}
            />
          </div>
          {localPrefs.booking_ending && (
            <div className="pl-6 pt-2">
              <Label className="text-sm">Alert me (days before)</Label>
              <Input
                type="number"
                value={localPrefs.booking_ending_days_before}
                onChange={(e) => updatePref("booking_ending_days_before", parseInt(e.target.value))}
                className="w-32 mt-1"
                min={1}
                max={7}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wallet Notifications */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            Wallet & Finance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Low Balance Alert</Label>
              <p className="text-sm text-slate-500">When wallet balance is low</p>
            </div>
            <Switch
              checked={localPrefs.low_balance}
              onCheckedChange={(val) => updatePref("low_balance", val)}
            />
          </div>
          {localPrefs.low_balance && (
            <div className="pl-6 pt-2">
              <Label className="text-sm">Alert threshold (AED)</Label>
              <Input
                type="number"
                value={localPrefs.low_balance_threshold}
                onChange={(e) => updatePref("low_balance_threshold", parseInt(e.target.value))}
                className="w-40 mt-1"
                min={100}
                step={100}
              />
            </div>
          )}
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Payout Completed</Label>
              <p className="text-sm text-slate-500">When earnings are paid out</p>
            </div>
            <Switch
              checked={localPrefs.payout_completed}
              onCheckedChange={(val) => updatePref("payout_completed", val)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Withdrawal Processed</Label>
              <p className="text-sm text-slate-500">When withdrawal is completed</p>
            </div>
            <Switch
              checked={localPrefs.withdrawal_processed}
              onCheckedChange={(val) => updatePref("withdrawal_processed", val)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Screen Notifications */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MonitorPlay className="w-5 h-5 text-indigo-600" />
            Screen Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>New Booking on Screen</Label>
              <p className="text-sm text-slate-500">When someone books ad on your screen</p>
            </div>
            <Switch
              checked={localPrefs.new_booking}
              onCheckedChange={(val) => updatePref("new_booking", val)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Screen Offline Alert</Label>
              <p className="text-sm text-slate-500">When screen goes offline</p>
            </div>
            <Switch
              checked={localPrefs.screen_offline}
              onCheckedChange={(val) => updatePref("screen_offline", val)}
            />
          </div>
          {localPrefs.screen_offline && (
            <div className="pl-6 pt-2">
              <Label className="text-sm">Alert after (minutes)</Label>
              <Input
                type="number"
                value={localPrefs.screen_offline_threshold_minutes}
                onChange={(e) => updatePref("screen_offline_threshold_minutes", parseInt(e.target.value))}
                className="w-32 mt-1"
                min={5}
                step={5}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Notifications */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-amber-600" />
            Performance Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Performance Change Alerts</Label>
              <p className="text-sm text-slate-500">Significant changes in campaign performance</p>
            </div>
            <Switch
              checked={localPrefs.performance_alerts}
              onCheckedChange={(val) => updatePref("performance_alerts", val)}
            />
          </div>
          {localPrefs.performance_alerts && (
            <div className="pl-6 pt-2">
              <Label className="text-sm">Alert threshold (%)</Label>
              <Input
                type="number"
                value={localPrefs.performance_threshold_percent}
                onChange={(e) => updatePref("performance_threshold_percent", parseInt(e.target.value))}
                className="w-32 mt-1"
                min={5}
                max={50}
                step={5}
              />
              <p className="text-xs text-slate-400 mt-1">Alert if performance changes by this percentage</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reports */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            Reports & Summaries
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Daily Summary Email</Label>
              <p className="text-sm text-slate-500">Get daily activity summary</p>
            </div>
            <Switch
              checked={localPrefs.daily_summary}
              onCheckedChange={(val) => updatePref("daily_summary", val)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>Weekly Performance Report</Label>
              <p className="text-sm text-slate-500">Comprehensive weekly report</p>
            </div>
            <Switch
              checked={localPrefs.weekly_report}
              onCheckedChange={(val) => updatePref("weekly_report", val)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg"
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
}