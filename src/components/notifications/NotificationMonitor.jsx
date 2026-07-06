import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";
import { Bell, Megaphone, Wallet, MonitorPlay, AlertCircle } from "lucide-react";

const notificationIcons = {
  campaign_approved: Megaphone,
  campaign_rejected: Megaphone,
  new_booking: MonitorPlay,
  low_balance: Wallet,
  payout_completed: Wallet,
  screen_offline: AlertCircle,
  booking_ending: Megaphone,
  withdrawal_processed: Wallet
};

export default function NotificationMonitor({ user }) {
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["realtime-notifications", user?.email],
    queryFn: () => base44.entities.UserNotification.filter(
      { user_id: user?.email },
      "-created_date",
      10
    ),
    enabled: !!user?.email,
    refetchInterval: 15000 // Check every 15 seconds
  });

  const { data: preferences } = useQuery({
    queryKey: ["notification-preferences", user?.email],
    queryFn: async () => {
      const prefs = await base44.entities.NotificationPreference.filter({ user_id: user?.email });
      return prefs[0];
    },
    enabled: !!user?.email
  });

  useEffect(() => {
    if (!notifications || notifications.length === 0) return;
    if (!preferences?.in_app_notifications) return;

    // Show toast for new unread notifications
    const unreadNotifications = notifications.filter(n => !n.is_read);
    
    // Only show the most recent unread notification
    if (unreadNotifications.length > 0) {
      const latest = unreadNotifications[0];
      const Icon = notificationIcons[latest.type] || Bell;
      
      // Check if this notification type is enabled
      const notifEnabled = preferences[latest.type] !== false;
      
      if (notifEnabled) {
        toast.custom((t) => (
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 p-4 min-w-[320px]">
            <div className="flex gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-violet-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{latest.title}</p>
                <p className="text-sm text-slate-600 mt-0.5">{latest.message}</p>
              </div>
            </div>
          </div>
        ), {
          duration: 5000,
          position: "top-right"
        });
      }
    }
  }, [notifications, preferences]);

  // Monitor wallet balance
  useEffect(() => {
    if (!user || !preferences) return;
    
    const checkWalletBalance = async () => {
      if (preferences.low_balance) {
        const threshold = preferences.low_balance_threshold || 500;
        const balance = user.wallet_balance || 0;
        
        if (balance < threshold) {
          // Check if we already sent this notification recently
          const recentLowBalanceNotif = notifications.find(n => 
            n.type === "low_balance" && 
            new Date(n.created_date) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          );
          
          if (!recentLowBalanceNotif) {
            await base44.entities.UserNotification.create({
              user_id: user.email,
              type: "low_balance",
              title: "Low Wallet Balance",
              message: `Your wallet balance (AED ${balance}) is below AED ${threshold}. Please top up to continue advertising.`,
              action_url: createPageUrl("Workspace")
            });
            
            queryClient.invalidateQueries({ queryKey: ["realtime-notifications"] });
          }
        }
      }
    };
    
    checkWalletBalance();
  }, [user, preferences]);

  return null; // This is a background component
}