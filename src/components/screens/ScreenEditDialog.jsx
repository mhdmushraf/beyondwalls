import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ScreenEditDialog({ screen, open, onOpenChange, onSaved }) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (screen) {
      setName(screen.name || '');
      setLocation(screen.location_description || '');
      setWidth(screen.width_px?.toString() || '');
      setHeight(screen.height_px?.toString() || '');
    }
  }, [screen]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.Screen.update(screen.id, {
        name: name.trim(),
        location_description: location.trim() || null,
        width_px: width ? Number(width) : null,
        height_px: height ? Number(height) : null,
      });
      toast.success('Screen updated');
      onSaved();
    } catch (e) {
      toast.error(e.message || 'Failed to update screen');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit screen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Screen name</Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-location">Location description</Label>
            <Input id="edit-location" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-width">Width (px)</Label>
              <Input id="edit-width" type="number" value={width} onChange={(e) => setWidth(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-height">Height (px)</Label>
              <Input id="edit-height" type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}