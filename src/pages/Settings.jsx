import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { User, Building2, CreditCard, Bell, Loader2, Save } from "lucide-react";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();

  useEffect(() => {
    base44.auth.me().then(u => { setUser(u); setForm(u || {}); });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await base44.auth.updateMe({
        phone: form.phone,
        city: form.city,
        address: form.address,
        company_name: form.company_name,
        bank_name: form.bank_name,
        account_holder_name: form.account_holder_name,
        iban: form.iban,
        swift_code: form.swift_code,
      });
      toast({ title: "Settings saved!" });
    } catch (err) {
      toast({ title: "Error saving settings", variant: "destructive" });
    }
    setLoading(false);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "banking", label: "Banking", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">Settings</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? "border-violet-600 text-violet-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 sm:p-6">
            {activeTab === "profile" && (
              <div className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input className="mt-1" value={form.full_name || ""} disabled placeholder="Cannot change" />
                  <p className="text-xs text-slate-400 mt-1">Name is set from your account and cannot be changed here</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input className="mt-1" value={form.email || ""} disabled />
                </div>
                <div>
                  <Label>Company / Brand Name</Label>
                  <Input className="mt-1" value={form.company_name || ""} onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Phone</Label>
                    <Input className="mt-1" value={form.phone || ""} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+971 55 000 0000" />
                  </div>
                  <div>
                    <Label>City</Label>
                    <Input className="mt-1" value={form.city || ""} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Dubai" />
                  </div>
                </div>
                <div>
                  <Label>Address</Label>
                  <Input className="mt-1" value={form.address || ""} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                </div>
              </div>
            )}

            {activeTab === "banking" && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
                  Bank details are required for payout requests (venue owners).
                </div>
                <div>
                  <Label>Bank Name</Label>
                  <Input className="mt-1" value={form.bank_name || ""} onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))} placeholder="e.g. Emirates NBD" />
                </div>
                <div>
                  <Label>Account Holder Name</Label>
                  <Input className="mt-1" value={form.account_holder_name || ""} onChange={e => setForm(f => ({ ...f, account_holder_name: e.target.value }))} />
                </div>
                <div>
                  <Label>IBAN</Label>
                  <Input className="mt-1" value={form.iban || ""} onChange={e => setForm(f => ({ ...f, iban: e.target.value }))} placeholder="AE..." />
                </div>
                <div>
                  <Label>SWIFT / BIC Code</Label>
                  <Input className="mt-1" value={form.swift_code || ""} onChange={e => setForm(f => ({ ...f, swift_code: e.target.value }))} />
                </div>
              </div>
            )}

            <Button onClick={handleSave} disabled={loading} className="mt-6 w-full sm:w-auto bg-violet-600 hover:bg-violet-700">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}