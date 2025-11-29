import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function SuspensionRequestForm({ 
  open, 
  onOpenChange, 
  item, 
  itemType, 
  user,
  onSuccess 
}) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for your request");
      return;
    }

    setSubmitting(true);
    try {
      await base44.entities.SuspensionRequest.create({
        user_id: user.email,
        item_type: itemType,
        item_id: item.id,
        item_name: item.name,
        reason: reason.trim(),
        status: "pending"
      });

      // Notify admin
      await base44.entities.AdminNotification.create({
        type: "withdrawal_request",
        title: `Suspension Removal Request: ${item.name}`,
        message: `${user.full_name || user.email} requested removal of suspension for ${itemType}: ${item.name}`,
        reference_id: item.id,
        reference_type: "SuspensionRequest",
        status: "unread"
      });

      toast.success("Request submitted successfully! Admin will review your request.");
      setReason("");
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Request Suspension Removal
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700">
              Your <strong>{itemType}</strong> "{item?.name}" is currently suspended.
            </p>
            {item?.suspension_reason && (
              <p className="text-sm text-amber-600 mt-2">
                <strong>Reason:</strong> {item.suspension_reason}
              </p>
            )}
          </div>

          <div>
            <Label>Why should your {itemType} be reactivated? *</Label>
            <Textarea
              placeholder={`Explain why you believe your ${itemType} should be reactivated...`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="mt-2"
            />
            <p className="text-xs text-slate-500 mt-1">
              Provide any relevant information that may help with the review.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !reason.trim()}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}