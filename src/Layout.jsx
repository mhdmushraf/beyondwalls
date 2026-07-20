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
  Activity,
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
import { getRoleNavItems } from "@/components/shell/navConfig";
import MobileBottomNav from "@/components/shell/MobileBottomNav";

const NOINDEX_PAGES = new Set([
  "ScreenPlayer"
]);

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(true);
  const [org, setOrg] = useState(null);
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
      if (userData && userData.role !== "admin") {
        try {
          const orgId = userData.current_org_id;
          if (orgId) {
            const orgData = await base44.entities.Organization.get(orgId);
            setOrg(orgData);
          }
        } catch (e) {
          console.log("Could not load org");
        }
      }
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
    return getRoleNavItems(user, org);
  };

// Public pages without sidebar - no auth required
const publicPages = [
        "Home", "Login", "Register", "ScreenPlayer", 
        "About", "Services", "Contact", "ScreenLocations", "Blog", 
        "HelpCenter", "Terms", "Privacy", "HowItWorks", 
        "Connect", "BlogPost", "AuthorProfile", "NotFound", "Sitemap",
        "SitemapPage", "DOOHAdvertisingDubai", "DigitalSignageUAE", "RobotsTxt", "SitemapXML",
        "CafeScreenAdvertisingDubai", "GymScreenAdvertisingDubai", "CoworkingSpaceAdvertisingDubai",
        "ClinicScreenAdvertisingDubai", "MonetizeYourScreensDubai",
        "DOOHAdvertisingCostDubai", "IndoorVenueDOOHvsBillboardsDubai",
        "WhatIsDOOHAdvertisingGuide", "EarnMoneyVenueScreensDubai",
        "DOOHAdvertisingMarketplaceDubai", "ForgotPassword", "ResetPassword",
        "ScreensOverview",
        "Plans"
      ];

  // Scroll to top when navigating to public pages
  useEffect(() => {
    if (publicPages.includes(currentPageName)) {
      window.scrollTo(0, 0);
    }
  }, [currentPageName]);

  // SEO: Block private/authenticated pages from search indexing
  useEffect(() => {
    if (NOINDEX_PAGES.has(currentPageName)) {
      let tag = document.querySelector('meta[name="robots"]');
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", "robots");
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", "noindex, nofollow");
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
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
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
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <MonitorPlay className="w-6 h-6 text-white" />
          </div>
          <p className="text-slate-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // SECURITY: Check if user profile is complete (except for admins)
  const isAdmin = user?.role === "admin" || user?.user_role === "admin";
  if (!isAdmin && !user?.profile_complete) {
    navigate(createPageUrl("Home"));
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <MonitorPlay className="w-6 h-6 text-white" />
          </div>
          <p className="text-slate-500">Completing profile...</p>
        </div>
      </div>
    );
  }

  // SECURITY: Check approval status for non-admin users
  if (!isAdmin && user?.approval_status !== "approved") {
    navigate(createPageUrl("Home"));
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <MonitorPlay className="w-6 h-6 text-white" />
          </div>
          <p className="text-slate-500">Checking approval status...</p>
        </div>
      </div>
    );
  }

  // SECURITY: Admin pages protection
  const adminPages = [];

  // SECURITY: Venue owner pages protection
  const venueOwnerPages = [];
  const isVenueOwner = !isAdmin && user?.user_role === "venue_owner";
  if (venueOwnerPages.includes(currentPageName) && !isVenueOwner && !isAdmin) {
    navigate(createPageUrl("Home"));
    return null;
  }
  
  if (adminPages.includes(currentPageName) && !isAdmin) {
    // Non-admin trying to access admin page - redirect to home
    navigate(createPageUrl("Home"));
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <p className="text-slate-500">Access denied. Redirecting...</p>
        </div>
      </div>
    );
  }

  const navItems = getNavItems();

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
          <div className="w-10" />
        )}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary rounded-lg flex items-center justify-center">
            <MonitorPlay className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg font-heading bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent select-none">
            Beyond Walls
          </span>
        </div>
        <Bell className="w-5 h-5 text-slate-400" />
      </div>



      {/* Sidebar (desktop only) */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-[280px] sm:w-72 bg-white border-r border-slate-200 z-50 flex-col">
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                <MonitorPlay className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl font-heading bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
                Beyond Walls
              </span>
            </div>

          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 overflow-y-auto">
            {navItems.map((item, idx) => {
              if (item.type === 'divider') {
                return (
                  <div key={`divider-${idx}`} className="px-3 sm:px-4 pt-5 pb-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{item.label}</p>
                    <div className="mt-2 border-t border-slate-100" />
                  </div>
                );
              }
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`select-none flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-primary to-primary text-white shadow-lg shadow-primary/25' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
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
                      {(user?.role === "admin" || user?.user_role === "admin") ? "Admin" : user?.user_role?.replace("_", " ") || "Advertiser"}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
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

      <MobileBottomNav navItems={navItems} />
    </div>
  );
}