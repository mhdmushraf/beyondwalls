import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const GOALS = [
  { value: 'brand_awareness', label: 'Brand Awareness' },
  { value: 'drive_traffic', label: 'Drive Traffic' },
  { value: 'promote_event', label: 'Promote Event' },
  { value: 'product_launch', label: 'Product Launch' },
  { value: 'other', label: 'Other' },
];

export default function CampaignFormDialog({ open, onOpenChange, org, user, onCreated }) {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('brand_awareness');
  const [totalBudget, setTotalBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [creativeType, setCreativeType] = useState('image');
  const [creativeUrls, setCreativeUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clientId, setClientId] = useState('');
  const [clients, setClients] = useState([]);

  const isAgency = org?.type === 'agency';

  useEffect(() => {
    if (!open || !isAgency) return;
    (async () => {
      try {
        const list = await base44.entities.Client.filter(
          { agency_org_id: org.id, status: 'active' },
          '-created_date', 100, 0
        );
        setClients(list);
      } catch { /* silent */ }
    })();
  }, [open, isAgency, org?.id]);

  const reset = () => {
    setName(''); setGoal('brand_awareness'); setTotalBudget(''); setClientId('');
    setStartDate(''); setEndDate(''); setCreativeType('image'); setCreativeUrls([]);
  };

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(
        files.map((file) =>
          base44.integrations.Core.UploadFile({ file }).then((r) => r.file_url)
        )
      );
      setCreativeUrls((prev) => [...prev, ...uploaded]);
      toast.success(`${uploaded.length} file(s) uploaded`);
    } catch (err) {
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeCreative = (idx) => {
    setCreativeUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!name || !totalBudget) {
      toast.error('Name and budget are required');
      return;
    }
    if (isAgency && !clientId) {
      toast.error('Please select a client');
      return;
    }
    setSaving(true);
    try {
      const campaign = await base44.entities.Campaign.create({
        name,
        goal,
        total_budget: Number(totalBudget),
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        creative_type: creativeType,
        creative_urls: creativeUrls,
        status: 'draft',
        org_id: org.id,
        client_id: isAgency ? clientId : undefined,
        advertiser_email: user.email,
      });
      toast.success('Campaign created');
      reset();
      onOpenChange(false);
      onCreated?.(campaign);
    } catch (err) {
      toast.error(err?.message || 'Failed to create campaign');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New campaign</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isAgency && (
            <div className="space-y-2">
              <Label>Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select a client" /></SelectTrigger>
                <SelectContent>
                  {clients.map((cl) => <SelectItem key={cl.id} value={cl.id}>{cl.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Campaign name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Summer Sale 2026" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Goal</Label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GOALS.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Total budget (AED)</Label>
              <Input type="number" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)} placeholder="5000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Start date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Creative type</Label>
            <Select value={creativeType} onValueChange={setCreativeType}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Creative files</Label>
            {creativeUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {creativeUrls.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
                    {creativeType === 'video'
                      ? <video src={url} className="w-full h-full object-cover" muted />
                      : <img src={url} alt="" className="w-full h-full object-cover" />}
                    <button
                      type="button"
                      onClick={() => removeCreative(i)}
                      className="absolute top-0 right-0 bg-black/60 text-white rounded-bl-md p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-lg p-4 cursor-pointer hover:border-violet-300 transition-colors">
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleFiles}
                disabled={uploading}
              />
              {uploading
                ? <Loader2 className="w-5 h-5 text-violet-600 animate-spin" />
                : <Upload className="w-5 h-5 text-slate-400" />}
              <span className="text-sm text-slate-600">{uploading ? 'Uploading...' : 'Upload creatives'}</span>
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving || uploading}>
            {saving ? 'Creating...' : 'Create campaign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}