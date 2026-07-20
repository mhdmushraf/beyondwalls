import React, { useState, useEffect } from 'react';
import SEOHead from "@/components/SEOHead";
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const SIZE_PRESETS = [
  { label: 'Full HD Landscape', width: 1920, height: 1080 },
  { label: 'Full HD Portrait', width: 1080, height: 1920 },
  { label: '4K Landscape', width: 3840, height: 2160 },
  { label: '4K Portrait', width: 2160, height: 3840 },
];

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

export default function AddScreen() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [selectedSize, setSelectedSize] = useState(0);
  const [monetizationMode, setMonetizationMode] = useState('marketplace');
  const [venues, setVenues] = useState([]);
  const [selectedVenueId, setSelectedVenueId] = useState('');
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueType, setNewVenueType] = useState('other');

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        if (!u) { navigate('/'); return; }
        const memberships = await base44.entities.Membership.filter({ user_id: u.id }, null, 1, 0);
        const orgId = u.current_org_id || memberships[0]?.org_id;
        if (!orgId) { navigate('/'); return; }
        const o = await base44.entities.Organization.get(orgId);
        setUser(u);
        setOrg(o);
        const v = await base44.entities.Venue.filter({ owner_email: u.email }, null, 50, 0);
        setVenues(v);
        if (v.length > 0) setSelectedVenueId(v[0].id);
      } catch {
        navigate('/');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error('Please enter a screen name'); return; }
    let venueId = selectedVenueId;
    if (!venueId && newVenueName.trim()) {
      try {
        const venue = await base44.entities.Venue.create({
          owner_email: user.email, name: newVenueName.trim(),
          venue_type: newVenueType, address: '—', city: 'Dubai',
        });
        venueId = venue.id;
      } catch { toast.error('Failed to create venue'); return; }
    }
    setSubmitting(true);
    try {
      const preset = SIZE_PRESETS[selectedSize];
      const res = await base44.functions.invoke('manageSubscription', {
        action: 'add_screen', org_id: org.id,         screen_name: name.trim(), venue_id: venueId || null,
        location_description: location.trim() || null,
        width_px: preset.width, height_px: preset.height, monetization_mode: monetizationMode,
      });
      toast.success('Screen created');
      navigate(`/screen-pairing?screen_id=${res.data.screen_id}`);
    } catch (e) {
      toast.error(e.message || 'Failed to create screen');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="h-8 w-48 bg-slate-100 rounded animate-pulse mb-6" />
        <div className="h-96 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <SEOHead noIndex title="AddScreen | Beyond Walls" />
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">Add Screen</h1>
          <p className="text-sm text-slate-500">Register a new display on your network.</p>
        </div>
      </div>

      <Card className="p-5 sm:p-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Screen name</Label>
          <Input id="name" placeholder="e.g. Lobby display" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location description</Label>
          <Input id="location" placeholder="e.g. Main entrance, next to reception" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Venue (optional)</Label>
          {venues.length > 0 && selectedVenueId !== '' ? (
            <>
              <select value={selectedVenueId} onChange={(e) => setSelectedVenueId(e.target.value)}
                className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm">
                {venues.map((v) => (<option key={v.id} value={v.id}>{v.name}</option>))}
              </select>
              <button type="button" className="text-xs text-violet-600 underline" onClick={() => setSelectedVenueId('')}>
                Create a new venue instead
              </button>
            </>
          ) : (
            <div className="space-y-3 rounded-lg border border-slate-200 p-4">
              <div className="space-y-2">
                <Label htmlFor="venue-name">Venue name</Label>
                <Input id="venue-name" placeholder="e.g. Downtown Café" value={newVenueName} onChange={(e) => setNewVenueName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="venue-type">Venue type</Label>
                <select id="venue-type" value={newVenueType} onChange={(e) => setNewVenueType(e.target.value)}
                  className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm">
                  {VENUE_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                </select>
              </div>
              {venues.length > 0 && (
                <button type="button" className="text-xs text-violet-600 underline" onClick={() => setSelectedVenueId(venues[0].id)}>
                  Use existing venue instead
                </button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Screen size</Label>
          <div className="grid grid-cols-2 gap-2">
            {SIZE_PRESETS.map((preset, idx) => (
              <button key={idx} type="button" onClick={() => setSelectedSize(idx)}
                className={`text-left p-3 rounded-lg border transition-all ${selectedSize === idx ? 'border-violet-500 bg-violet-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <p className="text-sm font-medium text-slate-900">{preset.label}</p>
                <p className="text-xs text-slate-400">{preset.width} × {preset.height}px</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Monetization mode</Label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setMonetizationMode('marketplace')}
              className={`text-left p-3 rounded-lg border transition-all ${monetizationMode === 'marketplace' ? 'border-violet-500 bg-violet-50' : 'border-slate-200 hover:border-slate-300'}`}>
              <p className="text-sm font-medium text-slate-900">Marketplace</p>
              <p className="text-xs text-slate-400">Earn from advertisers</p>
            </button>
            <button type="button" onClick={() => setMonetizationMode('self_serve')}
              className={`text-left p-3 rounded-lg border transition-all ${monetizationMode === 'self_serve' ? 'border-violet-500 bg-violet-50' : 'border-slate-200 hover:border-slate-300'}`}>
              <p className="text-sm font-medium text-slate-900">Private</p>
              <p className="text-xs text-slate-400">Internal content only</p>
            </button>
          </div>
        </div>

        {org?.commercial_plan === 'saas' && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-3">
            This screen will be added to your SaaS subscription and increase your monthly billing.
          </p>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
            {submitting ? 'Creating…' : 'Create & pair screen'}
          </Button>
        </div>
      </Card>
    </div>
  );
}