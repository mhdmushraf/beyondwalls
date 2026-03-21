import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { base44 } from "@/api/base44Client";
import {
  MonitorPlay,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Bell,
  Shield,
  Settings,
  ArrowLeft,
  BarChart3,
  Users,
  Megaphone,
  Building2,
  DollarSign,
  Plus,
  Wallet as WalletIcon,
  Settings as Settings2,
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

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  const isRootRoute = location.pathname === '/';

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {
      console.log("User not logged in");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    base44.auth.logout(createPageUrl("Home"));
  };

  const getNavItems = () => {
    if (!user) return [];
    const isAdmin = user?.user_role === "admin" || user?.role === "admin";
    const isVenueOwner = user?.user_role === "venue_owner";
    const isAdvertiser = user?.user_role === "advertiser";

    if (isAdmin) {
      return [
        { name: "Dashboard", page: "AdminDashboard", icon: BarChart3 },
        { name: "User Approvals", page: "AdminUserApprovals", icon: Users },
        { name: "Campaigns", page: "AdminCampaigns", icon: Megaphone },
        { name: "Screens", page: "AdminScreens", icon: MonitorPlay },
        { name: "Venues", page: "AdminVenues", icon: Building2 },
        { name: "Payout Requests", page: "AdminWalletRequests", icon: DollarSign },
        { name: "Settings", page: "Settings", icon: Settings2 },
      ];
    }
    if (isVenueOwner) {
      return [
        { name: "Dashboard", page: "VenueOwnerDashboard", icon: BarChart3 },
        { name: "My Venues", page: "MyVenues", icon: Building2 },
        { name: "My Screens", page: "MyScreens", icon: MonitorPlay },
        { name: "Earnings", page: "VenueEarnings", icon: DollarSign },
        { name: "Settings", page: "Settings", icon: Settings2 },
      ];
    }
    // Default: Advertiser
    return [
      { name: "Dashboard", page: "Dashboard", icon: BarChart3 },
      { name: "My Campaigns", page: "MyCampaigns", icon: Megaphone },
      { name: "Create Campaign", page: "CreateCampaign", icon: Plus },
      { name: "Wallet", page: "Wallet", icon: WalletIcon },
      { name: "Settings", page: "Settings", icon: Settings2 },
    ];
  };

// Public pages without sidebar - no auth required
const publicPages = [
        "Home", "Login", "Register", "CompleteProfile", "ScreenPlayer", 
        "About", "Services", "Contact", "ScreenLocations", "Blog", 
        "HelpCenter", "Terms", "Privacy", "HowItWorks", "PendingApproval", 
        "Connect", "BlogPost", "AuthorProfile", "NotFound", "ARDashboard", "Sitemap",
        "SitemapPage", "DOOHAdvertisingDubai", "DigitalSignageUAE", "RobotsTxt", "SitemapXML"
      ];

  // Scroll to top when navigating to public pages
  useEffect(() => {
    if (publicPages.includes(currentPageName)) {
      window.scrollTo(0, 0);
    }
  }, [currentPageName]);
  
  if (publicPages.includes(currentPageName)) {
    return <>{children}</>;
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <MonitorPlay className="w-6 h-6 text-white" />
          </div>
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  // SECURITY: Redirect to login if not authenticated for protected pages
  if (!user) {
    base44.auth.redirectToLogin(window.location.pathname);
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <MonitorPlay className="w-6 h-6 text-white" />
          </div>
          <p className="text-slate-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // SECURITY: Check if user profile is complete (except for admins)
  const isAdmin = user?.user_role === "admin" || user?.role === "admin";
  if (!isAdmin && !user?.profile_complete) {
    navigate(createPageUrl("CompleteProfile"));
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <MonitorPlay className="w-6 h-6 text-white" />
          </div>
          <p className="text-slate-500">Completing profile...</p>
        </div>
      </div>
    );
  }

  // SECURITY: Check approval status for non-admin users
  if (!isAdmin && user?.approval_status !== "approved") {
    navigate(createPageUrl("PendingApproval"));
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <MonitorPlay className="w-6 h-6 text-white" />
          </div>
          <p className="text-slate-500">Checking approval status...</p>
        </div>
      </div>
    );
  }

  // SECURITY: Admin pages protection
  const adminPages = [
    "AdminDashboard", "AdminUserApprovals", "AdminUsers", "AdminBookings",
    "AdminCampaigns", "AdminVenues", "AdminScreens", "AdminWallet",
    "AdminWalletRequests", "AdminTransactions", "AdminPricing",
    "AdminPlatformWallet", "AdminBlog", "AdminCRM", "AdminDefaultContent",
    "LogoGenerator"
  ];
  
  if (adminPages.includes(currentPageName) && !isAdmin) {
    // Non-admin trying to access admin page - redirect to user dashboard
    navigate(createPageUrl("Dashboard"));
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <p className="text-slate-500">Access denied. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 px-4 flex items-center justify-between safe-area-inset-top">
        {!isRootRoute ? (
          <button 
            onClick={() => navigate(-1)}
            className="select-none p-2 -ml-2 hover:bg-slate-100 rounded-lg"
          >
            <ArrowLeft className="w-6 h-6 text-slate-700" />
          </button>
        ) : (
          <button onClick={() => setSidebarOpen(true)} className="select-none p-2 -ml-2">
            <Menu className="w-6 h-6 text-slate-700" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <MonitorPlay className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent select-none">
            BeyondWalls
          </span>
        </div>
        <Bell className="w-5 h-5 text-slate-400" />
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
        fixed top-0 left-0 h-full w-[280px] sm:w-72 bg-white border-r border-slate-200 z-50
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
          <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 overflow-y-auto">
            {getNavItems().map((item) => {
              if (item.isGroup) {
                const isChildActive = item.children?.some(child => currentPageName === child.page);
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                      className={`
                        w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                        ${isChildActive 
                          ? 'bg-violet-100 text-violet-700' 
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${isChildActive ? 'text-violet-600' : 'text-slate-500'}`} />
                        {item.name}
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${adminMenuOpen ? 'rotate-90' : ''}`} />
                    </button>
                    {adminMenuOpen && (
                      <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-200 pl-4">
                        {item.children.map((child) => {
                          const isActive = currentPageName === child.page;
                          return (
                            <Link
                              key={child.page}
                              to={createPageUrl(child.page)}
                              onClick={() => setSidebarOpen(false)}
                              className={`
                                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                ${isActive 
                                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' 
                                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }
                              `}
                            >
                              <child.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    select-none flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }
                  `}
                >
                  <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-3 sm:p-4 border-t border-slate-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <Avatar className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0">
                    <AvatarImage src={user?.profile_image || user?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-500 text-white font-medium text-sm">
                      {user?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate">
                      {user?.full_name || "User"}
                    </p>
                    <p className="text-xs text-slate-500 capitalize truncate">
                      {user?.user_role?.replace("_", " ") || "Advertiser"}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                    <Link to={createPageUrl("Settings")} className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl("NotificationPreferences")} className="cursor-pointer">
                      <Bell className="w-4 h-4 mr-2" />
                      Notifications
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
      <main className="lg:pl-72 min-h-screen lg:pb-0 pb-24">
        <div className="pt-16 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}