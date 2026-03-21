import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { DollarSign, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function AdminWalletRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const { toast } = useToast();

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    const r = await base44.entities.PayoutRequest.list("-created_date");
    setRequests(r);
    setLoading(false);
  };

  const handleApprove = async (req) => {
    setActionLoading(req.id);
    try {
      await base44.entities.PayoutRequest.update(req.id, { status: "paid", processed_date: new Date().toISOString() });

      // Deduct from venue owner wallet
      const users = await base44.entities.User.filter({ email: req.venue_owner_email });
      if (users[0]) {
        const newBalance = Math.max(0, (users[0].wallet_balance || 0) - req.amount);
        await base44.entities.User.update(users[0].id, { wallet_balance: newBalance });
      }

      await base44.entities.Notification.create({
        recipient_email: req.venue_owner_email,
        type: "payout_processed",
        title: "Payout Processed!",
        message: `AED ${req.amount.toLocaleString()} has been sent to your bank account.`,
        reference_id: req.id,
      });
      await base44.integrations.Core.SendEmail({
        to: req.venue_owner_email,
        subject: "Payout Processed - BeyondWalls",
        body: `Hi,\n\nYour payout of AED ${req.amount.toLocaleString()} has been processed and sent to:\n\nBank: ${req.bank_name}\nIBAN: ${req.iban}\n\nPlease allow 1-3 business days.\n\nBeyondWalls Team`,
      });
      toast({ title: "Payout approved!", description: "Owner notified." });
      loadRequests();
    } catch (err) {
      toast({ title: "Error", variant: "destructive" });
    }
    setActionLoading(null);
  };

  const handleReject = async (req) => {
    setActionLoading(req.id);
    try {
      await base44.entities.PayoutRequest.update(req.id, { status: "rejected" });
      await base44.integrations.Core.SendEmail({
        to: req.venue_owner_email,
        subject: "Payout Request Update - BeyondWalls",
        body: `Hi,\n\nYour payout request of AED ${req.amount} was not approved. Please contact support.\n\nBeyondWalls Team`,
      });
      toast({ title: "Payout rejected." });
      loadRequests();
    } catch (err) {
      toast({ title: "Error", variant: "destructive" });
    }
    setActionLoading(null);
  };

  const statusColor = { pending: "bg-amber-100 text-amber-700", paid: "bg-emerald-100 text-emerald-700", rejected: "bg-red-100 text-red-700", approved: "bg-blue-100 text-blue-700" };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Payout Requests</h1>
          <p className="text-slate-500 mt-1">{requests.filter(r => r.status === "pending").length} pending</p>
        </div>

        {loading ? <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" /></div> : (
          <div className="space-y-3">
            {requests.map(req => (
              <Card key={req.id} className="border-0 shadow-sm">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">AED {req.amount?.toLocaleString()}</p>
                          <p className="text-xs text-slate-500">{req.venue_owner_email}</p>
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 space-y-0.5 ml-1">
                        <p>Bank: {req.bank_name}</p>
                        <p>IBAN: {req.iban}</p>
                        <p>Requested: {new Date(req.created_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={statusColor[req.status]}>{req.status}</Badge>
                      {req.status === "pending" && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleReject(req)} disabled={actionLoading === req.id}
                            variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                            {actionLoading === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                          </Button>
                          <Button size="sm" onClick={() => handleApprove(req)} disabled={actionLoading === req.id}
                            className="bg-emerald-600 hover:bg-emerald-700">
                            {actionLoading === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
                            Pay
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {requests.length === 0 && (
              <Card className="border-0 shadow-sm">
                <CardContent className="flex flex-col items-center py-12">
                  <CheckCircle2 className="w-12 h-12 text-emerald-300 mb-3" />
                  <p className="text-slate-500">No payout requests</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}