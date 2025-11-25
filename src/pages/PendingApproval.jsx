import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Clock, CheckCircle2, XCircle, RefreshCw, MonitorPlay } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PendingApproval() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      if (userData.approval_status === "approved") {
        navigate(createPageUrl("Dashboard"));
      }
    } catch (e) {
      base44.auth.redirectToLogin();
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    checkUserStatus();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-indigo-50">
        <RefreshCw className="w-8 h-8 text-violet-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex flex-col">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
            <MonitorPlay className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            BeyondWalls
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            {user?.approval_status === "pending" && (
              <>
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-10 h-10 text-amber-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-3">
                  Account Pending Approval
                </h1>
                <p className="text-slate-600 mb-6">
                  Thank you for registering! Our team is reviewing your account details. 
                  You'll receive an email once your account is approved.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-amber-800">
                    This usually takes 1-2 business days. We're verifying your submitted documents.
                  </p>
                </div>
              </>
            )}

            {user?.approval_status === "rejected" && (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-3">
                  Account Not Approved
                </h1>
                <p className="text-slate-600 mb-4">
                  Unfortunately, your account application was not approved.
                </p>
                {user?.rejection_reason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-sm font-medium text-red-800 mb-1">Reason:</p>
                    <p className="text-sm text-red-700">{user.rejection_reason}</p>
                  </div>
                )}
                <p className="text-sm text-slate-500 mb-6">
                  Please contact support at info@beyondwalls.ae for assistance.
                </p>
              </>
            )}

            <Button onClick={handleRefresh} variant="outline" className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Status
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full mt-3 text-slate-500"
              onClick={() => base44.auth.logout()}
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}