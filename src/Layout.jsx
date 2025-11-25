import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard,
  MonitorPlay,
  Megaphone,
  Wallet,
  Building2,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {
      console.log("User not logged in");
    }
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  const getNavItems = () => {
    const userRole = user?.user_role || "advertiser";
    
    if (userRole === "admin") {
      return [
        { name: "Dashboard", icon: LayoutDashboard, page: "AdminDashboard" },
        { name: "User Approvals", icon: Users, page: "AdminUserApprovals" },
        { name: "Campaigns", icon: Megaphone, page: "AdminCampaigns" },
        { name: "Venues", icon: Building2, page: "AdminVenues" },
        { name: "Screens", icon: MonitorPlay, page: "AdminScreens" },
        { name: "Users", icon: Users, page: "AdminUsers" },
        { name: "Transactions", icon: Wallet, page: "AdminTransactions" },
      ];
    } else {
      // Unified dashboard for all users (both advertiser and venue owner)
      const items = [
          { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
          { name: "AI Campaign", icon: Megaphone, page: "AICampaignCreator" },
          { name: "Book Ad Slot", icon: Plus, page: "BookSlot" },
          { name: "My Bookings", icon: Megaphone, page: "MyBookings" },
          { name: "Wallet", icon: Wallet, page: "Wallet" },
        ];
      
      // Add venue/screen management if user is venue owner
      if (user?.is_venue_owner) {
        items.push(
          { name: "My Venues", icon: Building2, page: "MyVenues" },
          { name: "My Screens", icon: MonitorPlay, page: "MyScreens" },
          { name: "My Ad Slots", icon: Settings, page: "ManageOwnerSlots" },
        );
      }
      
      return items;
    }
  };

  const navItems = getNavItems();

  // Public pages without sidebar
  if (["Home", "Login", "Register", "CompleteProfile", "ScreenPlayer", "About", "Services", "Contact", "ScreenLocations", "Blog", "HelpCenter", "Terms", "Privacy", "HowItWorks", "PendingApproval"].includes(currentPageName)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 px-4 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2">
          <Menu className="w-6 h-6 text-slate-700" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <MonitorPlay className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            BeyondWalls
          </span>
        </div>
        <Button variant="ghost" size="icon">
          <Bell className="w-5 h-5 text-slate-600" />
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-72 bg-white border-r border-slate-200 z-50
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                <MonitorPlay className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                BeyondWalls
              </span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white font-medium">
                      {user?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-slate-900 text-sm truncate">
                      {user?.full_name || "User"}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">
                      {user?.user_role?.replace("_", " ") || "Advertiser"}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl("Settings")} className="cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-72 min-h-screen">
        <div className="pt-16 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}