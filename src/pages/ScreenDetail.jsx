import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Upload, Loader2, MapPin, Maximize, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function ScreenDetail() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState(null);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [slots, setSlots] = useState(1);
  const [creativeFile, setCreativeFile] = useState(null);
  const [creativePreview, setCreativePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [commissionRate, setCommissionRate] = useState(30);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const screenId = params.get('screen_id');
    if (!screenId) { navigate('/marketplace'); return; }
    (async () => {
      try {
        const s = await base44.entities.Screen.get(screenId);
        setScreen(s);
        if (s.org_id) {
          try {
            const orgData = await base44.entities.Organization.get(s.org_id);
            if (orgData?.commission_rate != null) setCommissionRate(orgData.commission_rate);
          } catch { /* default 30% */ }
        }
        if (s.venue_id) {
          try {
            const v = await base44.entities.Venue.get(s.venue_id);
            setVenue(v);
          } catch { /* non-fatal */ }
        }
      } catch {
        toast.error('Screen not found');
        navigate('/marketplace');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const today = new Date().toISOString().split('T')[0];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      toast.error('Please upload an image or video file');
      return;
    }
    setCreativeFile(file);
    setCreativePreview(URL.createObjectURL(file));
  };

  const computeTotal = () => {
    if (!screen?.price_per_week || !startDate || !endDate) return 0;
    const start = new Date(startDate + 'T00:00:00Z');
    const end = new Date(endDate + 'T00:00:00Z');
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return 0;
    const weeks = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)));
    return screen.price_per_week * weeks * slots;
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate) { toast.error('Please select dates'); return; }
    if (!creativeFile) { toast.error('Please upload a creative'); return; }

    setSubmitting(true);
    try {
      // 1. Upload creative
      const uploadRes = await base44.integrations.Core.UploadFile({ file: creativeFile });
      const fileUrl = uploadRes.file_url || uploadRes.data?.file_url;
      const creativeType = creativeFile.type.startsWith('video/') ? 'video' : 'image';

      // 2. Create MediaAsset
      const user = await base44.auth.me();
      await base44.entities.MediaAsset.create({
        owner_email: user.email,
        name: creativeFile.name,
        file_url: fileUrl,
        file_type: creativeType,
        file_size_kb: Math.round(creativeFile.size / 1024),
      });

      // 3. Create Campaign in pending approval (enters moderation queue)
      const campaign = await base44.entities.Campaign.create({
        advertiser_email: user.email,
        name: `${screen.name} — ${startDate} to ${endDate}`,
        goal: 'brand_awareness',
        status: 'pending_approval',
        approval_status: 'pending',
        total_budget: totalAmount,
        start_date: startDate,
        end_date: endDate,
        selected_screens: [screen.id],
        creative_urls: [fileUrl],
        creative_type: creativeType,
      });

      // 4. Create booking checkout
      const res = await base44.functions.invoke('createBookingCheckout', {
        screen_id: screen.id,
        campaign_id: campaign.id,
        start_date: startDate,
        end_date: endDate,
        slots,
      });

      const checkoutUrl = res.data?.checkout_url;
      if (checkoutUrl) {
        toast.success('Booking created — redirecting to checkout');
        window.location.href = checkoutUrl;
      } else {
        toast.success('Booking created');
        navigate('/bookings');
      }
    } catch (e) {
      toast.error(e.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="h-8 w-48 bg-slate-100 rounded animate-pulse" />
        <div className="h-96 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!screen) return null;
  const baseAmount = computeTotal();
  const serviceFee = baseAmount > 0 ? +(baseAmount * commissionRate / 100).toFixed(2) : 0;
  const totalAmount = +(baseAmount + serviceFee).toFixed(2);
  const audience = [venue?.audience_age_group, venue?.audience_gender]
    .filter(Boolean).map(s => s.replace(/_/g, ' '));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/marketplace')}>
        <ArrowLeft className="w-4 h-4" /> Back to marketplace
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Screen info */}
        <Card className="p-5 space-y-4">
          <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden">
            {screen.screen_image_url ? (
              <img src={screen.screen_image_url} alt={screen.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Maximize className="w-12 h-12 text-slate-300" />
              </div>
            )}
          </div>
          <h1 className="font-heading text-lg font-bold text-slate-900">{screen.name}</h1>
          <div className="space-y-2 text-sm text-slate-600">
            <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" />{screen.location_description || venue?.name || 'Location TBD'}</p>
            <p className="flex items-center gap-2"><Maximize className="w-4 h-4 text-slate-400" />{screen.width_px || '?'} × {screen.height_px || '?'} px</p>
            {audience.length > 0 && (
              <p className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-400" />{audience.join(' · ')}{venue?.daily_footfall ? ` · ${venue.daily_footfall.toLocaleString()}/day` : ''}</p>
            )}
          </div>
          <div className="pt-2 border-t">
            <span className="text-2xl font-bold text-violet-600">AED {Math.round(screen.price_per_week || 0)}</span>
            <span className="text-sm text-slate-400">/week per slot</span>
          </div>
        </Card>

        {/* Booking form */}
        <Card className="p-5 space-y-4">
          <h2 className="font-heading font-semibold text-slate-900">Book this screen</h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start">Start date</Label>
              <Input id="start" type="date" min={today} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End date</Label>
              <Input id="end" type="date" min={startDate || today} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slots">Slots</Label>
            <Input id="slots" type="number" min={1} max={screen.public_ad_slots || 7} value={slots} onChange={(e) => setSlots(Math.max(1, Number(e.target.value)))} />
            <p className="text-xs text-slate-400">{screen.public_ad_slots || 7} public slots available</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="creative">Creative (image or video)</Label>
            <label htmlFor="creative" className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-6 cursor-pointer hover:border-violet-400 transition-colors">
              {creativePreview ? (
                creativeFile?.type.startsWith('video/') ? (
                  <video src={creativePreview} className="max-h-32 rounded" muted />
                ) : (
                  <img src={creativePreview} alt="Preview" className="max-h-32 rounded" />
                )
              ) : (
                <>
                  <Upload className="w-6 h-6 text-slate-400 mb-2" />
                  <span className="text-sm text-slate-500">Click to upload</span>
                </>
              )}
            </label>
            <Input id="creative" type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
          </div>

          {baseAmount > 0 && (
            <div className="bg-slate-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Screen rate</span>
                <span className="font-medium text-slate-900">AED {baseAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Service fee ({commissionRate}%)</span>
                <span className="font-medium text-slate-900">AED {serviceFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">Total</span>
                <span className="text-lg font-bold text-slate-900">AED {totalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-3">
            Your creative will be reviewed by our team before it goes live. This usually takes 1–2 business days.
          </p>

          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Processing…</> : 'Submit booking'}
          </Button>
        </Card>
      </div>
    </div>
  );
}