import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Bell,
  CheckCheck,
  Megaphone,
  Wallet,
  MonitorPlay,
  AlertCircle,
  ArrowRight,
  Trash2,
  Loader2,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const notificationIcons = {
  campaign_approved: { icon: Megaphone, color: "text-emerald-600", bg: "bg-emerald-100" },
  campaign_rejected: { icon: Megaphone, color: "text-rose-600", bg: "bg-rose-100" },
  new_booking: { icon: MonitorPlay, color: "text-violet-600", bg: "bg-violet-100" },
  low_balance: { icon: Wallet, color: "text-amber-600", bg: "bg-amber-100" },
  payout_completed: { icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-100" },
  screen_offline: { icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-100" },
  booking_ending: { icon: Megaphone, color: "text-amber-600", bg: "bg-amber-100" },
  withdrawal_processed: { icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-100" }
};

export default function NotificationCenter() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl("NotificationCenter"));
        return;
      }
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {
      base44.auth.redirectToLogin(createPageUrl("NotificationCenter"));
    }
  };

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["all-user-notifications", user?.email],
    queryFn: () => base44.entities.UserNotification.filter(
      { user_id: user?.email },
      "-created_date",
      100
    ),
    enabled: !!user?.email
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) => 
      base44.entities.UserNotification.update(notificationId, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["all-user-notifications"] })
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => 
        base44.entities.UserNotification.update(n.id, { is_read: true })
      ));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["all-user-notifications"] })
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId) => 
      base44.entities.UserNotification.delete(notificationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["all-user-notifications"] })
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(notifications.map(n => 
        base44.entities.UserNotification.delete(n.id)
      ));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["all-user-notifications"] })
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.is_read;
    if (filter === "campaigns") return n.type.includes("campaign");
    if (filter === "wallet") return n.type.includes("balance") || n.type.includes("payout") || n.type.includes("withdrawal");
    return true;
  });

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  if (!user) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button 
              variant="outline"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button 
              variant="outline"
              onClick={() => clearAllMutation.mutate()}
              disabled={clearAllMutation.isPending}
              className="text-rose-600 hover:text-rose-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-500">Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2">No notifications</h3>
            <p className="text-slate-500">
              {filter === "unread" 
                ? "You've read all your notifications!"
                : "You don't have any notifications yet."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => {
            const iconConfig = notificationIcons[notification.type] || {
              icon: Bell,
              color: "text-slate-600",
              bg: "bg-slate-100"
            };
            const Icon = iconConfig.icon;

            return (
              <Card 
                key={notification.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !notification.is_read ? "border-l-4 border-l-violet-500 bg-violet-50/30" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-full ${iconConfig.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${iconConfig.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className={`font-semibold ${!notification.is_read ? "text-slate-900" : "text-slate-700"}`}>
                            {notification.title}
                          </h3>
                          <p className="text-slate-600 mt-1">{notification.message}</p>
                        </div>
                        {!notification.is_read && (
                          <div className="w-3 h-3 bg-violet-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-sm text-slate-400">
                          {notification.created_date && 
                            format(new Date(notification.created_date), "MMM d, yyyy • h:mm a")
                          }
                        </p>
                        <div className="flex items-center gap-2">
                          {notification.action_url && (
                            <Badge variant="outline" className="text-violet-600">
                              View Details <ArrowRight className="w-3 h-3 ml-1" />
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-rose-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotificationMutation.mutate(notification.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}