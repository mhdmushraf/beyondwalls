import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function AddSiteDialog({ open, onOpenChange, org, onCreated }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [emirate, setEmirate] = useState('');
  const [siteCode, setSiteCode] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setName(''); setAddress(''); setCity(''); setEmirate(''); setSiteCode('');
  };

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error('Site name is required'); return; }
    setSaving(true);
    try {
      await base44.entities.Site.create({
        name: name.trim(),
        address: address.trim() || null,
        city: city.trim() || null,
        emirate: emirate.trim() || null,
        site_code: siteCode.trim() || null,
        org_id: org.id,
        org_member_user_ids: org.member_user_ids || [],
        status: 'active',
      });
      toast.success('Site created');
      reset();
      onOpenChange(false);
      onCreated?.();
    } catch (e) {
      toast.error(e.message || 'Failed to create site');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Add site</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label>Site name</Label>
            <Input placeholder="e.g. Nesto Al Nahda" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Emirate</Label>
              <Input value={emirate} onChange={(e) => setEmirate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Site code (optional)</Label>
            <Input placeholder="Internal branch code" value={siteCode} onChange={(e) => setSiteCode(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Creating…' : 'Create site'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}