import { useState } from 'react';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { usePortal } from '@/lib/PortalContext';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18n';
import { uploadPublic, logActivity, VENUE_TYPES, EMIRATES, SPEND_RANGES } from '@/lib/portalData';
import MapPinPicker from './MapPinPicker';

const fieldClass = 'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

const EMPTY = {
  name: '',
  venue_type: 'cafe',
  address: '',
  city: 'Dubai',
  emirate: 'Dubai',
  opening_time: '09:00',
  closing_time: '23:00',
  daily_customers: '',
  avg_spend_range: '25_50',
  avg_stay_minutes: '',
  peak_hours: '',
};

export default function AddVenueDialog({ open, onOpenChange }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { org, reload } = usePortal();
  const [form, setForm] = useState(EMPTY);
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const uploadLogo = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      setLogoUrl(await uploadPublic(file));
    } catch (e) {
      setError('Logo upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const uploadPhotos = async (event) => {
    const files = Array.from(event.target.files || []).slice(0, 5 - photos.length);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        urls.push(await uploadPublic(file));
      }
      setPhotos((prev) => [...prev, ...urls].slice(0, 5));
    } catch (e) {
      setError('Photo upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!org) return;
    setBusy(true);
    setError('');
    try {
      const venue = await base44.entities.Venue.create({
        org_id: org.id,
        org_member_user_ids: org.member_user_ids || [user.id],
        owner_email: user.email,
        name: form.name.trim(),
        venue_type: form.venue_type,
        address: form.address.trim(),
        city: form.city.trim(),
        emirate: form.emirate,
        latitude: lat,
        longitude: lng,
        logo_url: logoUrl,
        image_url: photos[0] || '',
        photo_urls: photos,
        opening_time: form.opening_time,
        closing_time: form.closing_time,
        opening_hours: `${form.opening_time} - ${form.closing_time}`,
        daily_customers: form.daily_customers ? Number(form.daily_customers) : undefined,
        avg_spend_range: form.avg_spend_range,
        avg_stay_minutes: form.avg_stay_minutes ? Number(form.avg_stay_minutes) : undefined,
        peak_hours: form.peak_hours,
        status: 'pending',
        approval_status: 'pending',
      });

      await logActivity({
        orgId: org.id,
        memberIds: org.member_user_ids || [user.id],
        userEmail: user.email,
        action: 'venue_created',
        targetType: 'venue',
        targetId: venue.id,
        details: `${venue.name} created in ${venue.city}`,
      });

      setForm(EMPTY);
      setPhotos([]);
      setLogoUrl('');
      setLat(null);
      setLng(null);
      reload();
      onOpenChange(false);
    } catch (e) {
      setError('We could not create this venue.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('venues.addTitle')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="venue-name">{t('venues.name')}</Label>
            <Input id="venue-name" required value={form.name} onChange={(e) => set('name', e.target.value)} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="venue-type">{t('venues.type')}</Label>
              <select id="venue-type" className={fieldClass} value={form.venue_type} onChange={(e) => set('venue_type', e.target.value)}>
                {VENUE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="venue-emirate">{t('onboarding.emirate')}</Label>
              <select id="venue-emirate" className={fieldClass} value={form.emirate} onChange={(e) => { set('emirate', e.target.value); set('city', e.target.value); }}>
                {EMIRATES.map((emirate) => (
                  <option key={emirate} value={emirate}>{emirate}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="venue-address">{t('venues.address')}</Label>
            <Input id="venue-address" required value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Al Wasl Road, Jumeirah 1" />
          </div>

          <div className="space-y-1.5">
            <Label>{t('venues.pin')}</Label>
            <MapPinPicker lat={lat} lng={lng} onChange={(la, ln) => { setLat(la); setLng(ln); }} />
            <p className="text-[11px] text-bw-muted">
              {lat && lng ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : 'Tap the map to place the venue pin.'}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t('venues.logo')}</Label>
              <label className="flex items-center gap-3 rounded-xl border border-dashed border-bw-line bg-bw-cream px-3 py-2.5 cursor-pointer">
                {logoUrl ? <Check className="h-4 w-4 text-emerald-500" /> : <Upload className="h-4 w-4 text-bw-navy" />}
                <span className="text-xs text-bw-muted truncate">{logoUrl ? 'Logo added' : 'Upload logo'}</span>
                <input type="file" accept="image/*" className="hidden" onChange={uploadLogo} />
              </label>
            </div>
            <div className="space-y-1.5">
              <Label>{t('venues.photos')}</Label>
              <label className="flex items-center gap-3 rounded-xl border border-dashed border-bw-line bg-bw-cream px-3 py-2.5 cursor-pointer">
                <Upload className="h-4 w-4 text-bw-navy" />
                <span className="text-xs text-bw-muted">{photos.length}/5 photos</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={uploadPhotos} disabled={photos.length >= 5} />
              </label>
            </div>
          </div>

          {photos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {photos.map((url) => (
                <div key={url} className="relative h-16 w-24 rounded-lg overflow-hidden border border-bw-line">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((p) => p !== url))}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="open">{t('venues.open')}</Label>
              <Input id="open" type="time" value={form.opening_time} onChange={(e) => set('opening_time', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="close">{t('venues.close')}</Label>
              <Input id="close" type="time" value={form.closing_time} onChange={(e) => set('closing_time', e.target.value)} />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="customers">{t('venues.dailyCustomers')}</Label>
              <Input id="customers" type="number" min="0" value={form.daily_customers} onChange={(e) => set('daily_customers', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="spend">{t('venues.spend')}</Label>
              <select id="spend" className={fieldClass} value={form.avg_spend_range} onChange={(e) => set('avg_spend_range', e.target.value)}>
                {SPEND_RANGES.map((range) => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stay">{t('venues.stay')}</Label>
              <Input id="stay" type="number" min="0" value={form.avg_stay_minutes} onChange={(e) => set('avg_stay_minutes', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="peak">{t('venues.peak')}</Label>
            <Input id="peak" value={form.peak_hours} onChange={(e) => set('peak_hours', e.target.value)} placeholder="18:00 - 21:00" />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-100 px-3 py-2 text-xs text-rose-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <p className="text-[11px] text-bw-muted">{t('venues.approvalNote')}</p>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={() => onOpenChange(false)} className="rounded-xl border border-bw-line px-4 py-2.5 text-sm font-semibold text-bw-muted">
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={busy || uploading}
              className="rounded-xl bg-bw-coral px-5 py-2.5 text-sm font-semibold text-white hover:bg-bw-coral/90 disabled:opacity-60"
            >
              {busy ? t('common.loading') : t('venues.create')}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}