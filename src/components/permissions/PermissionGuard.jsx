import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Permission Guard Component
 * Enforces role-based access control across the app
 */
export default function PermissionGuard({ 
  user, 
  requiredRole, 
  requiredPermission, 
  allowedRoles = [],
  children,
  fallback 
}) {
  const navigate = useNavigate();

  // Check if user has required role
  const hasRole = () => {
    if (!user) return false;
    
    const userRole = user.user_role || user.role;
    
    // Admin has access to everything
    if (userRole === "admin") return true;
    
    // Check if user has specific required role
    if (requiredRole && userRole !== requiredRole) return false;
    
    // Check if user has one of allowed roles
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) return false;
    
    return true;
  };

  // Check if user has required permission (for admins)
  const hasPermission = () => {
    if (!user || !requiredPermission) return true;
    
    const userRole = user.user_role || user.role;
    if (userRole !== "admin") return true; // Only check permissions for admins
    
    const permissions = user.admin_permissions || ["all"];
    return permissions.includes("all") || permissions.includes(requiredPermission);
  };

  // Check if user can manage specific entity
  const canManageEntity = (entityId, entityType) => {
    if (!user) return false;
    
    const userRole = user.user_role || user.role;
    
    // Admin can manage everything
    if (userRole === "admin") return true;
    
    // Advertiser manager can manage assigned advertisers
    if (userRole === "advertiser_manager") {
      const managedIds = user.managed_advertiser_ids || [];
      return entityType === "advertiser" && managedIds.includes(entityId);
    }
    
    // Venue manager can manage assigned venues
    if (userRole === "venue_manager") {
      const managedIds = user.managed_venue_ids || [];
      return entityType === "venue" && managedIds.includes(entityId);
    }
    
    return false;
  };

  if (!hasRole() || !hasPermission()) {
    if (fallback) return fallback;
    
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-6">
            You don't have permission to access this section.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
            >
              Go Back
            </Button>
            <Button
              onClick={() => navigate(createPageUrl("Workspace"))}
              className="bg-gradient-to-r from-violet-600 to-indigo-600"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

// Hook for checking permissions in components
export function usePermissions(user) {
  const hasRole = (role) => {
    if (!user) return false;
    const userRole = user.user_role || user.role;
    return userRole === "admin" || userRole === role;
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    const userRole = user.user_role || user.role;
    if (userRole !== "admin") return false;
    const permissions = user.admin_permissions || ["all"];
    return permissions.includes("all") || permissions.includes(permission);
  };

  const canManageAdvertiser = (advertiserId) => {
    if (!user) return false;
    const userRole = user.user_role || user.role;
    if (userRole === "admin") return true;
    if (userRole === "advertiser_manager") {
      const managedIds = user.managed_advertiser_ids || [];
      return managedIds.includes(advertiserId);
    }
    return user.email === advertiserId || user.id === advertiserId;
  };

  const canManageVenue = (venueId) => {
    if (!user) return false;
    const userRole = user.user_role || user.role;
    if (userRole === "admin") return true;
    if (userRole === "venue_manager") {
      const managedIds = user.managed_venue_ids || [];
      return managedIds.includes(venueId);
    }
    return false;
  };

  const canUploadContent = () => {
    if (!user) return false;
    const userRole = user.user_role || user.role;
    return ["admin", "advertiser", "advertiser_manager", "content_uploader"].includes(userRole);
  };

  return {
    hasRole,
    hasPermission,
    canManageAdvertiser,
    canManageVenue,
    canUploadContent,
    isAdmin: hasRole("admin"),
    isAdvertiser: hasRole("advertiser"),
    isVenueOwner: hasRole("venue_owner"),
    isAdvertiserManager: hasRole("advertiser_manager"),
    isVenueManager: hasRole("venue_manager"),
    isContentUploader: hasRole("content_uploader")
  };
}