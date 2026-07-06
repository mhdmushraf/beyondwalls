import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import {
  Bell,
  Check,
  CheckCheck,
  Megaphone,
  Wallet,
  MonitorPlay,
  AlertCircle,
  ArrowRight,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

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

export default function UserNotifications({ user }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["user-notifications", user?.email],
    queryFn: () => base44.entities.UserNotification.filter(
      { user_id: user?.email },
      "-created_date",
      50
    ),
    enabled: !!user?.email,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) => 
      base44.entities.UserNotification.update(notificationId, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-notifications"] })
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => 
        base44.entities.UserNotification.update(n.id, { is_read: true })
      ));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-notifications"] })
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId) => 
      base44.entities.UserNotification.delete(notificationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-notifications"] })
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    
    if (notification.action_url) {
      setOpen(false);
      navigate(notification.action_url);
    }
  };

  const getActionUrl = (notification) => {
    switch (notification.type) {
      case "campaign_approved":
      case "campaign_rejected":
        return createPageUrl("MyBookings");
      case "new_booking":
        return createPageUrl("Workspace");
      case "low_balance":
      case "payout_completed":
      case "withdrawal_processed":
        return createPageUrl("Workspace");
      case "screen_offline":
        return createPageUrl("Workspace");
      default:
        return null;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 sm:w-96 p-0">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-slate-900">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => markAllAsReadMutation.mutate()}
              className="text-xs text-violet-600 hover:text-violet-700"
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const iconConfig = notificationIcons[notification.type] || {
                  icon: Bell,
                  color: "text-slate-600",
                  bg: "bg-slate-100"
                };
                const Icon = iconConfig.icon;
                const actionUrl = notification.action_url || getActionUrl(notification);

                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                      !notification.is_read ? "bg-violet-50/50" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-full ${iconConfig.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${iconConfig.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${!notification.is_read ? "font-semibold" : "font-medium"} text-slate-900`}>
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-violet-500 rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2 mt-0.5">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-slate-400">
                            {notification.created_date && 
                              format(new Date(notification.created_date), "MMM d, h:mm a")
                            }
                          </p>
                          <div className="flex items-center gap-1">
                            {actionUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-xs text-violet-600 hover:text-violet-700 px-2"
                              >
                                View <ArrowRight className="w-3 h-3 ml-1" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-slate-400 hover:text-rose-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotificationMutation.mutate(notification.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-3 border-t">
            <Button
              variant="ghost"
              className="w-full text-sm text-slate-600"
              onClick={() => {
                setOpen(false);
                navigate(createPageUrl("NotificationCenter"));
              }}
            >
              View All Notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}