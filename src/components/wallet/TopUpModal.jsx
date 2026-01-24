import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StripeTopUp from "./StripeTopUp";

export default function TopUpModal({ open, onOpenChange, user, onSuccess }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Funds to Wallet</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <StripeTopUp onSuccess={() => {
            onOpenChange(false);
            if (onSuccess) onSuccess();
          }} />
        </div>
      </DialogContent>
    </Dialog>
  );
}