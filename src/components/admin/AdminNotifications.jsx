import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import {
  Bell,
  UserPlus,
  Building2,
  MonitorPlay,
  Megaphone,
  Wallet,
  Users,
  CheckCircle2,
  X,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

const NOTIFICATION_ICONS = {
  new_user: UserPlus,
  new_venue: Building2,
  new_screen: MonitorPlay,
  withdrawal_request: Wallet,
  campaign_approval: Megaphone,
  low_subscribers: Users
};

const NOTIFICATION_COLORS = {
  new_user: "bg-violet-100 text-violet-600",
  new_venue: "bg-indigo-100 text-indigo-600",
  new_screen: "bg-emerald-100 text-emerald-600",
  withdrawal_request: "bg-amber-100 text-amber-600",
  campaign_approval: "bg-rose-100 text-rose-600",
  low_subscribers: "bg-blue-100 text-blue-600"
};

const NOTIFICATION_LINKS = {
  new_user: "AdminUserApprovals",
  new_venue: "AdminVenues",
  new_screen: "AdminScreens",
  withdrawal_request: "AdminWalletRequests",
  campaign_approval: "AdminBookings",
  low_subscribers: "AdminCRM"
};

export default function AdminNotifications() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: notifications = [], refetch } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: () => base44.entities.AdminNotification.filter({ status: "unread" }, "-created_date", 20),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const { data: allNotifications = [] } = useQuery({
    queryKey: ["admin-notifications-all"],
    queryFn: () => base44.entities.AdminNotification.list("-created_date", 50),
    enabled: open
  });

  const unreadCount = notifications.length;

  const markAsRead = async (notification) => {
    try {
      await base44.entities.AdminNotification.update(notification.id, {
        status: "read"
      });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["admin-notifications-all"] });
    } catch (e) {
      console.error("Failed to mark as read", e);
    }
  };

  const markAllAsRead = async () => {
    try {
      for (const notification of notifications) {
        await base44.entities.AdminNotification.update(notification.id, {
          status: "read"
        });
      }
      refetch();
      queryClient.invalidateQueries({ queryKey: ["admin-notifications-all"] });
    } catch (e) {
      console.error("Failed to mark all as read", e);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-slate-900">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[400px]">
          {allNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {allNotifications.map((notification) => {
                const Icon = NOTIFICATION_ICONS[notification.type] || Bell;
                const colorClass = NOTIFICATION_COLORS[notification.type] || "bg-slate-100 text-slate-600";
                const linkPage = NOTIFICATION_LINKS[notification.type];
                const isUnread = notification.status === "unread";

                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-slate-50 transition-colors ${isUnread ? "bg-violet-50/50" : ""}`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm ${isUnread ? "font-semibold text-slate-900" : "text-slate-700"}`}>
                            {notification.title}
                          </p>
                          {isUnread && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification);
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-slate-400">
                            {notification.created_date && formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
                          </span>
                          {linkPage && (
                            <Link
                              to={createPageUrl(linkPage)}
                              onClick={() => {
                                setOpen(false);
                                if (isUnread) markAsRead(notification);
                              }}
                            >
                              <Button variant="ghost" size="sm" className="h-6 text-xs text-violet-600">
                                View <ExternalLink className="w-3 h-3 ml-1" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}