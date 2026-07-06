import React, { useState } from "react";
import { Wifi, WifiOff, Wrench, Power, RefreshCw, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "online", label: "Online", icon: Wifi, color: "text-emerald-600", bg: "bg-emerald-100" },
  { value: "offline", label: "Offline", icon: WifiOff, color: "text-rose-600", bg: "bg-rose-100" },
  { value: "maintenance", label: "Maintenance", icon: Wrench, color: "text-amber-600", bg: "bg-amber-100" },
];

export default function ScreenStatusControl({ 
  screen, 
  open, 
  onOpenChange,
  onUpdateStatus,
  onRemoteAction 
}) {
  const [status, setStatus] = useState(screen?.status || "online");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  React.useEffect(() => {
    setStatus(screen?.status || "online");
  }, [screen]);

  const handleSaveStatus = async () => {
    setLoading(true);
    await onUpdateStatus(screen.id, status);
    setLoading(false);
    toast.success(`Screen status updated to ${status}`);
    onOpenChange(false);
  };

  const handleAction = async (action) => {
    setActionLoading(action);
    await onRemoteAction(screen.id, action);
    setActionLoading(null);
  };

  const currentStatus = STATUS_OPTIONS.find(s => s.value === screen?.status);
  const CurrentIcon = currentStatus?.icon || Wifi;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Power className="w-5 h-5 text-violet-600" />
            Screen Control - {screen?.name}
          </DialogTitle>
          <DialogDescription>
            Manage screen status and trigger remote actions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Status */}
          <div className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${currentStatus?.bg || "bg-slate-100"} rounded-lg flex items-center justify-center`}>
                <CurrentIcon className={`w-5 h-5 ${currentStatus?.color || "text-slate-600"}`} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Current Status</p>
                <p className="font-semibold capitalize">{screen?.status?.replace("_", " ")}</p>
              </div>
            </div>
            <div className={`w-3 h-3 rounded-full ${screen?.status === "online" ? "bg-emerald-500 animate-pulse" : screen?.status === "offline" ? "bg-rose-500" : "bg-amber-500"}`} />
          </div>

          {/* Set Status */}
          <div>
            <Label className="mb-2 block">Set Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <opt.icon className={`w-4 h-4 ${opt.color}`} />
                      {opt.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Remote Actions */}
          <div>
            <Label className="mb-2 block">Remote Actions</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-16 flex-col gap-1"
                onClick={() => handleAction("restart")}
                disabled={actionLoading === "restart"}
              >
                {actionLoading === "restart" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Power className="w-5 h-5 text-blue-600" />
                )}
                <span className="text-xs">Restart Screen</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 flex-col gap-1"
                onClick={() => handleAction("refresh")}
                disabled={actionLoading === "refresh"}
              >
                {actionLoading === "refresh" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <RefreshCw className="w-5 h-5 text-emerald-600" />
                )}
                <span className="text-xs">Push Content</span>
              </Button>
            </div>
          </div>

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveStatus} 
            disabled={loading || status === screen?.status}
            className="bg-gradient-to-r from-violet-600 to-indigo-600"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
            Update Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}