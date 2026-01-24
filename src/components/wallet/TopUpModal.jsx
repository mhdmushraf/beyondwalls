import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import {
  CreditCard,
  Building2,
  Loader2,
  CheckCircle2,
  Upload,
  FileText,
  XCircle,
  Smartphone,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import StripeTopUp from "./StripeTopUp";

const QUICK_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

export default function TopUpModal({ open, onOpenChange, user, onSuccess }) {
  const [method, setMethod] = useState("bank");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState("");

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.includes("pdf") && !file.type.includes("image")) {
      toast.error("Please upload a PDF or image file");
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setReceiptUrl(file_url);
      toast.success("Receipt uploaded");
    } catch (error) {
      toast.error("Failed to upload receipt");
    } finally {
      setUploading(false);
    }
  };

  const handleBankTransfer = async () => {
    const topUpAmount = parseFloat(amount);
    if (!topUpAmount || topUpAmount < 50) {
      toast.error("Minimum top-up is AED 50");
      return;
    }
    if (!receiptUrl) {
      toast.error("Please upload bank transfer receipt");
      return;
    }

    setLoading(true);
    try {
      await base44.entities.WalletRequest.create({
        user_id: user.email,
        user_name: user.full_name,
        request_type: "top_up",
        amount: topUpAmount,
        receipt_url: receiptUrl,
        request_date: new Date().toISOString(),
        status: "pending"
      });

      await base44.entities.AdminNotification.create({
        type: "withdrawal_request",
        title: "New Top-up Request",
        message: `${user.full_name || user.email} requested top-up of AED ${topUpAmount}`,
        reference_id: user.email,
        reference_type: "WalletRequest"
      });

      toast.success("Top-up request submitted! Admin will review your receipt.");
      onOpenChange(false);
      resetForm();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const handleCardPayment = async () => {
    const topUpAmount = parseFloat(amount);
    if (!topUpAmount || topUpAmount < 50) {
      toast.error("Minimum top-up is AED 50");
      return;
    }

    // For now, show coming soon message
    // In production, integrate with Stripe/PayTabs/Telr
    toast.info("Card payments coming soon! Please use bank transfer for now.");
  };

  const resetForm = () => {
    setAmount("");
    setReceiptUrl("");
    setMethod("bank");
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { onOpenChange(open); if (!open) resetForm(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Funds to Wallet</DialogTitle>
        </DialogHeader>

        <Tabs value={method} onValueChange={setMethod}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="bank" className="text-xs sm:text-sm">
              <Building2 className="w-4 h-4 mr-1 sm:mr-2" />
              Bank
            </TabsTrigger>
            <TabsTrigger value="card" className="text-xs sm:text-sm">
              <CreditCard className="w-4 h-4 mr-1 sm:mr-2" />
              Card
            </TabsTrigger>
            <TabsTrigger value="mobile" className="text-xs sm:text-sm">
              <Smartphone className="w-4 h-4 mr-1 sm:mr-2" />
              Mobile
            </TabsTrigger>
          </TabsList>

          {/* Amount Selection - Shared across all methods */}
          <div className="mt-4 space-y-4">
            <div>
              <Label>Select Amount</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {QUICK_AMOUNTS.map((amt) => (
                  <Button
                    key={amt}
                    variant={amount === String(amt) ? "default" : "outline"}
                    onClick={() => setAmount(String(amt))}
                    size="sm"
                    className="text-sm"
                  >
                    AED {amt.toLocaleString()}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label>Or Enter Custom Amount</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg mt-1"
              />
              <p className="text-xs text-slate-500 mt-1">Minimum: AED 50</p>
            </div>
          </div>

          <TabsContent value="bank" className="space-y-4 mt-4">
            <div className="p-4 bg-slate-50 rounded-lg space-y-2">
              <p className="text-sm font-medium text-slate-700">Bank Transfer Details:</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-slate-500">Bank:</span>
                <span className="font-medium">Emirates NBD</span>
                <span className="text-slate-500">Account:</span>
                <span className="font-medium">BeyondWalls FZ LLC</span>
                <span className="text-slate-500">IBAN:</span>
                <span className="font-medium text-xs">AE12 3456 7890 1234 5678 901</span>
              </div>
            </div>

            <div>
              <Label>Upload Bank Transfer Receipt *</Label>
              {receiptUrl ? (
                <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm text-emerald-700">Receipt uploaded</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setReceiptUrl("")}>
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="block mt-2">
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                    uploading ? "border-violet-300 bg-violet-50" : "border-slate-200 hover:border-violet-300"
                  }`}>
                    {uploading ? (
                      <Loader2 className="w-6 h-6 text-violet-600 animate-spin mx-auto" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">Upload PDF or image</p>
                      </>
                    )}
                  </div>
                  <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleReceiptUpload} />
                </label>
              )}
            </div>

            <Button
              onClick={handleBankTransfer}
              disabled={loading || !amount || !receiptUrl}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Submit Top-up Request
            </Button>
          </TabsContent>

          <TabsContent value="card" className="space-y-4 mt-4">
            <StripeTopUp onSuccess={onSuccess} />
          </TabsContent>

          <TabsContent value="mobile" className="space-y-4 mt-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Mobile Payments Coming Soon</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Apple Pay and Google Pay integration in progress.
                  </p>
                </div>
              </div>
            </div>

            <Button disabled className="w-full">
              <Smartphone className="w-4 h-4 mr-2" />
              Pay with Mobile (Coming Soon)
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}