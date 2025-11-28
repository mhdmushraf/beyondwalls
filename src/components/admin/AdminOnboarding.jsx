import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  CheckCircle2,
  Circle,
  Users,
  Building2,
  MonitorPlay,
  Megaphone,
  Newspaper,
  Settings,
  X,
  Sparkles,
  ArrowRight,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ONBOARDING_TASKS = [
  {
    id: "review_users",
    title: "Review Pending Users",
    description: "Approve or reject new user registrations",
    icon: Users,
    link: "AdminUserApprovals",
    check: (data) => data.approvedUsers > 0
  },
  {
    id: "setup_venues",
    title: "Approve a Venue",
    description: "Review and approve venue registrations",
    icon: Building2,
    link: "AdminVenues",
    check: (data) => data.approvedVenues > 0
  },
  {
    id: "setup_screens",
    title: "Approve a Screen",
    description: "Review and set up advertising screens",
    icon: MonitorPlay,
    link: "AdminScreens",
    check: (data) => data.approvedScreens > 0
  },
  {
    id: "review_booking",
    title: "Review a Booking",
    description: "Approve or reject ad campaign bookings",
    icon: Megaphone,
    link: "AdminBookings",
    check: (data) => data.processedBookings > 0
  },
  {
    id: "setup_newsletter",
    title: "Configure Newsletter",
    description: "Set up automated newsletter system",
    icon: Newspaper,
    link: "AdminCRM",
    check: (data) => data.newsletterConfigured
  }
];

export default function AdminOnboarding({ onDismiss }) {
  const [showGuide, setShowGuide] = useState(false);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [checkData, setCheckData] = useState({});

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const [users, venues, screens, bookings, newsletterSettings] = await Promise.all([
        base44.entities.User.filter({ approval_status: "approved" }),
        base44.entities.Venue.filter({ status: "approved" }),
        base44.entities.Screen.filter({ status: "online" }),
        base44.entities.AdSlotBooking.filter({ status: "active" }),
        base44.entities.NewsletterSettings.list()
      ]);

      const data = {
        approvedUsers: users.length,
        approvedVenues: venues.length,
        approvedScreens: screens.length,
        processedBookings: bookings.length,
        newsletterConfigured: newsletterSettings.length > 0
      };

      setCheckData(data);

      const completed = ONBOARDING_TASKS
        .filter(task => task.check(data))
        .map(task => task.id);
      setCompletedTasks(completed);
    } catch (e) {
      console.error("Failed to check onboarding status", e);
    }
  };

  const progress = (completedTasks.length / ONBOARDING_TASKS.length) * 100;
  const isComplete = completedTasks.length === ONBOARDING_TASKS.length;

  if (isComplete) return null;

  return (
    <>
      <Card className="mb-6 bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-200">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-violet-900">
              <Rocket className="w-5 h-5" />
              Getting Started
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGuide(true)}
                className="text-violet-600"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Quick Guide
              </Button>
              {onDismiss && (
                <Button variant="ghost" size="icon" onClick={onDismiss} className="h-8 w-8">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Progress value={progress} className="flex-1 h-2" />
            <span className="text-sm font-medium text-violet-700">
              {completedTasks.length}/{ONBOARDING_TASKS.length}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {ONBOARDING_TASKS.map((task) => {
              const isCompleted = completedTasks.includes(task.id);
              return (
                <Link key={task.id} to={createPageUrl(task.link)}>
                  <div className={`p-3 rounded-xl border-2 transition-all hover:shadow-md ${
                    isCompleted 
                      ? "bg-emerald-50 border-emerald-200" 
                      : "bg-white border-slate-200 hover:border-violet-300"
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <task.icon className="w-5 h-5 text-violet-600" />
                      )}
                      <span className={`text-sm font-medium ${isCompleted ? "text-emerald-700" : "text-slate-900"}`}>
                        {task.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{task.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Start Guide Dialog */}
      <Dialog open={showGuide} onOpenChange={setShowGuide}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-600" />
              Admin Quick Start Guide
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="p-4 bg-violet-50 rounded-xl">
              <h3 className="font-semibold text-violet-900 mb-2">Welcome to BeyondWalls Admin!</h3>
              <p className="text-sm text-violet-700">
                This guide will help you get started with managing the platform. Complete the checklist above to set up your platform.
              </p>
            </div>

            <div className="space-y-4">
              <div className="border rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-violet-600" />
                  </div>
                  <h4 className="font-semibold">1. User Management</h4>
                </div>
                <p className="text-sm text-slate-600 ml-11">
                  Review new user registrations in <strong>User Approvals</strong>. Check their documents (Emirates ID, Trade License) 
                  and approve or reject their accounts. Manage existing users in <strong>Users</strong>.
                </p>
              </div>

              <div className="border rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h4 className="font-semibold">2. Venue Management</h4>
                </div>
                <p className="text-sm text-slate-600 ml-11">
                  Venues are locations where screens are placed (cafés, malls, gyms). Review venue applications in <strong>Venues</strong>, 
                  verify their trade licenses, and approve them to start hosting screens.
                </p>
              </div>

              <div className="border rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <MonitorPlay className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h4 className="font-semibold">3. Screen Management</h4>
                </div>
                <p className="text-sm text-slate-600 ml-11">
                  Screens display advertisements. When venue owners register screens, approve them in <strong>Screens</strong>. 
                  Generate setup codes for the player app. Monitor online/offline status and manage ad slots.
                </p>
              </div>

              <div className="border rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Megaphone className="w-4 h-4 text-amber-600" />
                  </div>
                  <h4 className="font-semibold">4. Booking & Campaign Management</h4>
                </div>
                <p className="text-sm text-slate-600 ml-11">
                  Advertisers book ad slots on screens. Review bookings in <strong>Ad Bookings</strong>, check creative content, 
                  and approve/reject. The platform automatically splits revenue (70% venue, 30% platform).
                </p>
              </div>

              <div className="border rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                    <Newspaper className="w-4 h-4 text-rose-600" />
                  </div>
                  <h4 className="font-semibold">5. Newsletter & CRM</h4>
                </div>
                <p className="text-sm text-slate-600 ml-11">
                  Manage leads and newsletters in <strong>CRM</strong>. Enable auto-newsletters to send daily updates to subscribers. 
                  Use AI to generate content ideas and manage subscriber lists.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl">
              <h4 className="font-semibold text-slate-900 mb-2">💡 Pro Tips</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Use the live preview button to see what's currently playing on screens</li>
                <li>• Check the Dashboard daily for pending approvals</li>
                <li>• Monitor wallet requests to process top-ups and withdrawals</li>
                <li>• Use dynamic pricing to maximize revenue during peak times</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}