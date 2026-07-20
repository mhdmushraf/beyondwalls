import React, { useState, useEffect } from 'react';
import SEOHead from "@/components/SEOHead";
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { WorkspaceSkeleton } from '@/components/workspace/Skeletons';
import { Save, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function Organizations() {
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [autoApprove, setAutoApprove] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        const orgId = u?.current_org_id;
        if (!orgId) { setLoading(false); return; }
        const o = await base44.entities.Organization.get(orgId);
        setOrg(o);
        setName(o.name || '');
        setBillingEmail(o.billing_email || '');
        setLogoUrl(o.logo_url || '');
        setAutoApprove(o.auto_approve_creative === true);
      } catch { /* silent */ } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.Organization.update(org.id, {
        name: name.trim(),
        billing_email: billingEmail.trim(),
        logo_url: logoUrl.trim() || null,
        auto_approve_creative: autoApprove,
      });
      toast.success('Organization updated');
    } catch (e) {
      toast.error(e.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <WorkspaceSkeleton />;
  if (!org) return <div className="p-4 sm:p-6 lg:p-8"><p className="text-slate-500">No organization found.</p></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <SEOHead noIndex title="Organizations | Beyond Walls" />
      <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">Organization Settings</h1>

      <Card className="p-5 sm:p-6 space-y-5">
        <div className="space-y-2">
          <Label>Organization name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Billing email</Label>
          <Input type="email" value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Logo URL</Label>
          <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://…" />
          {logoUrl && <img src={logoUrl} alt="Logo preview" className="h-12 mt-2 rounded" />}
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </Card>

      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Label className="text-base">Auto-approve creative</Label>
            <p className="text-sm text-slate-500 mt-1">
              When enabled, new ad bookings on your screens are automatically approved — ads will run without review.
              Disable to require manual approval before creatives go live.
            </p>
            {autoApprove && (
              <div className="flex items-center gap-2 mt-2 text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
                <AlertTriangle className="w-4 h-4" />
                Ads on your screens will run without review.
              </div>
            )}
          </div>
          <Switch checked={autoApprove} onCheckedChange={setAutoApprove} />
        </div>
        <Button variant="outline" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </Card>
    </div>
  );
}