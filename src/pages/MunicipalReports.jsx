import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  BarChart3,
  Loader2,
  CheckCircle2,
  XCircle,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function MunicipalReports() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [dateRange, setDateRange] = useState("30d");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl("MunicipalReports"));
        return;
      }
      const userData = await base44.auth.me();
      
      if (userData?.user_role !== "municipal_inspector") {
        window.location.href = createPageUrl("Dashboard");
        return;
      }
      
      setUser(userData);
      setAuthChecked(true);
    } catch (e) {
      base44.auth.redirectToLogin(createPageUrl("MunicipalReports"));
    }
  };

  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ["audit-logs-all"],
    queryFn: () => base44.entities.AuditLog.list("-created_date", 500),
    enabled: authChecked
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["municipal-bookings-reports"],
    queryFn: () => base44.entities.AdSlotBooking.list("-created_date"),
    enabled: authChecked
  });

  if (!authChecked) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading reports...</p>
        </div>
      </div>
    );
  }

  const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : 365;
  const cutoffDate = subDays(new Date(), days);

  const recentLogs = auditLogs.filter(log => {
    if (!log.created_date) return false;
    return new Date(log.created_date) >= cutoffDate;
  });

  const approvedCount = recentLogs.filter(l => l.action_type === "ad_municipal_approved").length;
  const rejectedCount = recentLogs.filter(l => l.action_type === "ad_municipal_rejected").length;
  const revokedCount = recentLogs.filter(l => l.action_type === "ad_revoked").length;

  const exportReport = async () => {
    setExporting(true);
    try {
      let reportText = `DUBAI MUNICIPALITY - ADVERTISING APPROVAL REPORT\n`;
      reportText += `Generated: ${format(new Date(), "PPP p")}\n`;
      reportText += `Period: Last ${days} days\n`;
      reportText += `Inspector: ${user.full_name} (${user.email})\n`;
      reportText += `\n${"=".repeat(80)}\n\n`;
      
      reportText += `SUMMARY STATISTICS\n`;
      reportText += `${"-".repeat(80)}\n`;
      reportText += `Total Actions: ${recentLogs.length}\n`;
      reportText += `Approved: ${approvedCount}\n`;
      reportText += `Rejected: ${rejectedCount}\n`;
      reportText += `Revoked: ${revokedCount}\n`;
      reportText += `\n${"=".repeat(80)}\n\n`;

      reportText += `DETAILED AUDIT LOG\n`;
      reportText += `${"-".repeat(80)}\n\n`;
      
      recentLogs.forEach((log, i) => {
        reportText += `${i + 1}. ${log.action_type.toUpperCase().replace(/_/g, " ")}\n`;
        reportText += `   Date: ${log.created_date ? format(new Date(log.created_date), "PPP p") : "N/A"}\n`;
        reportText += `   Inspector: ${log.action_by_user_name || log.action_by_user_id}\n`;
        reportText += `   Booking ID: ${log.booking_id || "N/A"}\n`;
        if (log.action_details?.reason) {
          reportText += `   Reason: ${log.action_details.reason}\n`;
        }
        if (log.action_details?.comments) {
          reportText += `   Comments: ${log.action_details.comments}\n`;
        }
        reportText += `\n`;
      });

      const blob = new Blob([reportText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `municipal-report-${format(new Date(), "yyyy-MM-dd")}.txt`;
      a.click();
      toast.success("Report downloaded");
    } catch (error) {
      toast.error("Failed to export report");
    }
    setExporting(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">Compliance Reports</h1>
          <p className="text-slate-500 text-sm sm:text-base">Audit logs and approval statistics</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full sm:w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="365d">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} disabled={exporting} className="w-full sm:w-auto">
            {exporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{recentLogs.length}</p>
                <p className="text-xs sm:text-sm text-slate-500">Total Actions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              <div>
                <p className="text-xl sm:text-2xl font-bold text-emerald-700">{approvedCount}</p>
                <p className="text-xs sm:text-sm text-emerald-600">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-red-50 border-rose-200">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" />
              <div>
                <p className="text-xl sm:text-2xl font-bold text-rose-700">{rejectedCount}</p>
                <p className="text-xs sm:text-sm text-rose-600">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              <div>
                <p className="text-xl sm:text-2xl font-bold text-red-700">{revokedCount}</p>
                <p className="text-xs sm:text-sm text-red-600">Revoked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Audit Log</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-3 sm:p-4 font-medium text-slate-600 text-xs sm:text-sm">Timestamp</th>
                  <th className="text-left p-3 sm:p-4 font-medium text-slate-600 text-xs sm:text-sm">Action</th>
                  <th className="text-left p-3 sm:p-4 font-medium text-slate-600 text-xs sm:text-sm">Inspector</th>
                  <th className="text-left p-3 sm:p-4 font-medium text-slate-600 text-xs sm:text-sm">Details</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">Loading...</td>
                  </tr>
                ) : recentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">No audit logs found</td>
                  </tr>
                ) : (
                  recentLogs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 sm:p-4 text-xs sm:text-sm text-slate-500">
                        {log.created_date && format(new Date(log.created_date), "MMM d, h:mm a")}
                      </td>
                      <td className="p-3 sm:p-4">
                        <Badge className={
                          log.action_type.includes("approved") ? "bg-emerald-100 text-emerald-700" :
                          log.action_type.includes("rejected") ? "bg-rose-100 text-rose-700" :
                          log.action_type.includes("revoked") ? "bg-red-100 text-red-700" :
                          "bg-blue-100 text-blue-700"
                        }>
                          {log.action_type.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="p-3 sm:p-4 text-xs sm:text-sm">
                        <p className="font-medium text-slate-900">{log.action_by_user_name}</p>
                        <p className="text-slate-500">{log.action_by_user_id}</p>
                      </td>
                      <td className="p-3 sm:p-4 text-xs sm:text-sm">
                        {log.action_details?.reason && (
                          <p className="text-slate-600">Reason: {log.action_details.reason}</p>
                        )}
                        {log.action_details?.comments && (
                          <p className="text-slate-500 italic">"{log.action_details.comments}"</p>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}