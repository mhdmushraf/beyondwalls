import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Loader2,
  AlertCircle,
  CreditCard,
  Info,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function PayoutSettings({ user, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [connectingStripe, setConnectingStripe] = useState(false);
  const [settings, setSettings] = useState({
    payout_frequency: user?.payout_frequency || "monthly",
    auto_payout: user?.auto_payout || false,
    min_payout_amount: user?.min_payout_amount || 500,
    bank_name: user?.bank_name || "",
    account_holder_name: user?.account_holder_name || "",
    iban: user?.iban || "",
    swift_code: user?.swift_code || ""
  });

  useEffect(() => {
    // Check for Stripe setup completion
    const params = new URLSearchParams(window.location.search);
    if (params.get('setup') === 'complete') {
      toast.success('Stripe account connected successfully!');
      if (onUpdate) onUpdate();
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleConnectStripe = async () => {
    setConnectingStripe(true);
    try {
      const response = await base44.functions.invoke('connectStripeAccount');
      if (response.data.url) {
        // Redirect to Stripe onboarding
        window.location.href = response.data.url;
      }
    } catch (error) {
      toast.error("Failed to connect Stripe account");
    } finally {
      setConnectingStripe(false);
    }
  };

  const handleSave = async () => {
    if (settings.auto_payout && (!settings.bank_name || !settings.iban)) {
      toast.error("Please fill in bank details to enable auto-payout");
      return;
    }

    setLoading(true);
    try {
      await base44.auth.updateMe({
        payout_frequency: settings.payout_frequency,
        auto_payout: settings.auto_payout,
        min_payout_amount: settings.min_payout_amount,
        bank_name: settings.bank_name,
        account_holder_name: settings.account_holder_name,
        iban: settings.iban,
        swift_code: settings.swift_code
      });
      toast.success("Payout settings saved!");
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stripe Connect */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-violet-600" />
            Stripe Connect
          </CardTitle>
          <CardDescription>
            Connect your Stripe account for instant payouts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user?.stripe_account_id ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-medium text-emerald-700">Stripe Account Connected</span>
              </div>
              <p className="text-sm text-emerald-600">
                Account ID: {user.stripe_account_id}
              </p>
              <p className="text-xs text-slate-600 mt-2">
                You can now withdraw funds instantly to your bank account.
              </p>
            </div>
          ) : (
            <div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Why Connect Stripe?</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Instant withdrawals to your bank account</li>
                      <li>Secure and encrypted transactions</li>
                      <li>No waiting for admin approval</li>
                      <li>Track all payouts in one place</li>
                    </ul>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleConnectStripe}
                disabled={connectingStripe}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {connectingStripe ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />Connecting...</>
                ) : (
                  <><ExternalLink className="w-4 h-4 mr-2" />Connect Stripe Account</>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout Frequency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-violet-600" />
            Payout Schedule
          </CardTitle>
          <CardDescription>
            Choose when you want to receive your earnings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-Payout</Label>
              <p className="text-sm text-slate-500">Automatically transfer earnings to your bank</p>
            </div>
            <Switch
              checked={settings.auto_payout}
              onCheckedChange={(checked) => setSettings({ ...settings, auto_payout: checked })}
            />
          </div>

          {settings.auto_payout && (
            <>
              <div className="space-y-2">
                <Label>Payout Frequency</Label>
                <Select
                  value={settings.payout_frequency}
                  onValueChange={(v) => setSettings({ ...settings, payout_frequency: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly (Every Monday)</SelectItem>
                    <SelectItem value="biweekly">Bi-Weekly (1st & 15th)</SelectItem>
                    <SelectItem value="monthly">Monthly (1st of month)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Minimum Payout Amount (AED)</Label>
                <Select
                  value={String(settings.min_payout_amount)}
                  onValueChange={(v) => setSettings({ ...settings, min_payout_amount: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">AED 100</SelectItem>
                    <SelectItem value="250">AED 250</SelectItem>
                    <SelectItem value="500">AED 500</SelectItem>
                    <SelectItem value="1000">AED 1,000</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  Payouts will only be processed when your balance exceeds this amount
                </p>
              </div>
            </>
          )}

          {!settings.auto_payout && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-700">
                With auto-payout disabled, you can request manual withdrawals anytime from your wallet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-violet-600" />
            Bank Account Details
          </CardTitle>
          <CardDescription>
            Your bank account for receiving payouts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Bank Name *</Label>
              <Input
                placeholder="e.g., Emirates NBD"
                value={settings.bank_name}
                onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Account Holder Name *</Label>
              <Input
                placeholder="As per bank records"
                value={settings.account_holder_name}
                onChange={(e) => setSettings({ ...settings, account_holder_name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>IBAN *</Label>
            <Input
              placeholder="AE12 3456 7890 1234 5678 901"
              value={settings.iban}
              onChange={(e) => setSettings({ ...settings, iban: e.target.value.toUpperCase() })}
            />
          </div>

          <div className="space-y-2">
            <Label>SWIFT/BIC Code (Optional)</Label>
            <Input
              placeholder="e.g., EABORUMTXXX"
              value={settings.swift_code}
              onChange={(e) => setSettings({ ...settings, swift_code: e.target.value.toUpperCase() })}
            />
          </div>

          {settings.bank_name && settings.iban && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-emerald-700">Bank details verified and saved</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <CheckCircle2 className="w-4 h-4 mr-2" />
        )}
        Save Payout Settings
      </Button>
    </div>
  );
}