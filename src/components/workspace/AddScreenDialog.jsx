import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const VENUE_TYPES = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'cafe', label: 'Café' },
  { value: 'gym', label: 'Gym' },
  { value: 'mall', label: 'Mall' },
  { value: 'coworking', label: 'Co-working' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'salon', label: 'Salon' },
  { value: 'retail', label: 'Retail' },
  { value: 'other', label: 'Other' },
];

export default function AddScreenDialog({ open, onOpenChange, user, org, onScreenAdded }) {
  const [venues, setVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [screenName, setScreenName] = useState('');
  const [selectedVenueId, setSelectedVenueId] = useState('');
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueType, setNewVenueType] = useState('office');

  useEffect(() => {
    if (!open) return;
    setLoadingVenues(true);
    (async () => {
      try {
        const v = await base44.entities.Venue.filter({ owner_email: user.email }, null, 50, 0);
        setVenues(v);
        if (v.length > 0) setSelectedVenueId(v[0].id);
      } catch {
        setVenues([]);
      } finally {
        setLoadingVenues(false);
      }
    })();
  }, [open, user.email]);

  const reset = () => {
    setScreenName('');
    setNewVenueName('');
    setNewVenueType('office');
    setSelectedVenueId(venues[0]?.id || '');
  };

  const handleSubmit = async () => {
    if (!screenName.trim()) {
      toast.error('Please enter a screen name');
      return;
    }
    setSubmitting(true);
    try {
      let venueId = selectedVenueId;

      if (!venueId && newVenueName.trim()) {
        const venue = await base44.entities.Venue.create({
          owner_email: user.email,
          name: newVenueName.trim(),
          venue_type: newVenueType,
          address: '—',
          city: 'Dubai',
        });
        venueId = venue.id;
      }

      if (!venueId) {
        toast.error('Please select or create a venue');
        setSubmitting(false);
        return;
      }

      const res = await base44.functions.invoke('manageSubscription', {
        action: 'add_screen',
        org_id: org.id,
        screen_name: screenName.trim(),
        venue_id: venueId,
      });

      toast.success('Screen added', {
        description: res.data?.subscription_updated
          ? 'Subscription updated — screen quantity increased.'
          : undefined,
      });

      reset();
      onOpenChange(false);
      onScreenAdded?.();
    } catch (e) {
      toast.error(e.message || 'Failed to add screen');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add screen</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="screen-name">Screen name</Label>
            <Input
              id="screen-name"
              placeholder="e.g. Lobby display"
              value={screenName}
              onChange={(e) => setScreenName(e.target.value)}
            />
          </div>

          {loadingVenues ? (
            <p className="text-sm text-slate-400">Loading venues…</p>
          ) : venues.length > 0 ? (
            <div className="space-y-2">
              <Label htmlFor="venue-select">Venue</Label>
              <select
                id="venue-select"
                value={selectedVenueId}
                onChange={(e) => setSelectedVenueId(e.target.value)}
                className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
              >
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
              <p className="text-xs text-slate-400">
                Don't see your venue?{' '}
                <button
                  type="button"
                  className="text-violet-600 underline"
                  onClick={() => setSelectedVenueId('')}
                >
                  Create a new one
                </button>
              </p>
            </div>
          ) : (
            <div className="space-y-3 rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-700">Create a venue for this screen</p>
              <div className="space-y-2">
                <Label htmlFor="venue-name">Venue name</Label>
                <Input
                  id="venue-name"
                  placeholder="e.g. Downtown Café"
                  value={newVenueName}
                  onChange={(e) => setNewVenueName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="venue-type">Venue type</Label>
                <select
                  id="venue-type"
                  value={newVenueType}
                  onChange={(e) => setNewVenueType(e.target.value)}
                  className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {VENUE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {org.commercial_plan === 'saas' && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-3">
              This screen will be added to your SaaS subscription and increase your monthly billing.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Adding…' : 'Add screen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}