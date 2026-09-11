import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { MonitorPlay, Shield, Loader2 } from "lucide-react";

// Send unauthenticated users to our own /login page (with a next param so they
// return where they were headed), NOT base44.auth.redirectToLogin() which lands
// on Base44's generic hosted login form.
function goToOurLogin(redirectTo) {
  const next = redirectTo || window.location.pathname;
  window.location.href = `/login?next=${encodeURIComponent(next)}`;
}

/**
 * AuthGuard - Protects pages requiring authentication
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to render if authenticated
 * @param {boolean} props.requireAdmin - If true, requires admin role
 * @param {string} props.redirectTo - Page to redirect after login
 */
export default function AuthGuard({ children, requireAdmin = false, redirectTo }) {
  const [status, setStatus] = useState("loading"); // loading | authenticated | unauthorized | unauthenticated
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      
      if (!isAuth) {
        setStatus("unauthenticated");
        base44.auth.redirectToLogin(redirectTo || window.location.pathname);
        return;
      }

      const userData = await base44.auth.me();
      setUser(userData);

      // Check admin requirement
      if (requireAdmin) {
        const isAdmin = userData?.user_role === "admin" || userData?.role === "admin";
        if (!isAdmin) {
          setStatus("unauthorized");
          window.location.href = createPageUrl("Workspace");
          return;
        }
      }

      setStatus("authenticated");
    } catch (e) {
      setStatus("unauthenticated");
      base44.auth.redirectToLogin(redirectTo || window.location.pathname);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
          <p className="text-slate-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
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

  if (status === "unauthorized") {
    // Redirect non-admin to workspace
    window.location.href = createPageUrl("Workspace");
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <p className="text-slate-900 font-semibold mb-2">Access Denied</p>
          <p className="text-slate-500">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  // Pass user to children if needed
  if (typeof children === "function") {
    return children({ user });
  }

  return children;
}

/**
 * useAuthGuard - Hook version of AuthGuard for use in components
 */
export function useAuthGuard(requireAdmin = false) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      
      if (!isAuth) {
        base44.auth.redirectToLogin(window.location.pathname);
        return;
      }

      const userData = await base44.auth.me();
      setUser(userData);

      if (requireAdmin) {
        const isAdmin = userData?.user_role === "admin" || userData?.role === "admin";
        setAuthorized(isAdmin);
        if (!isAdmin) {
          window.location.href = createPageUrl("Workspace");
        }
      } else {
        setAuthorized(true);
      }
    } catch (e) {
      base44.auth.redirectToLogin(window.location.pathname);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, authorized };
}