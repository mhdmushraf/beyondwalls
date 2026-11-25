import { useEffect, useState } from 'react';
import { Store, Megaphone, Sparkles, Upload, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18n';
import StatusScreen from '@/components/portal/StatusScreen';
import LanguageToggle from '@/components/portal/LanguageToggle';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadPrivate, logActivity, EMIRATES } from '@/lib/portalData';

const EMPTY_FORM = {
  businessName: '',
  licenseNumber: '',
  emirate: 'Dubai',
  industry: '',
  whatsapp: '',
};

export default function Onboarding() {
  const { t } = useI18n();
  const { user, isLoadingAuth, navigateToLogin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState(null);
  const [step, setStep] = useState(0);
  const [modes, setModes] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [licenseUri, setLicenseUri] = useState('');
  const [licenseName, setLicenseName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!user) {
      navigateToLogin();
      return;
    }
    let cancelled = false;
    (async () => {
      const page = await base44.entities.Membership.filter({ user_id: user.id }, { limit: 10 });
      const memberships = page.items || [];
      if (memberships.length) {
        const orgIds = memberships.map((m) => m.org_id).filter(Boolean);
        const orgPage = await base44.entities.Organization.filter({ id: { $in: orgIds } }, { limit: 10 });
        const first = (orgPage.items || [])[0] || null;
        if (cancelled) return;
        if (first?.status === 'approved') {
          window.location.href = '/app';
          return;
        }
        setOrg(first);
      }
      setLoading(false);
    })().catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user, isLoadingAuth, navigateToLogin]);

  const toggleMode = (mode) => {
    setModes((prev) => (prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]));
  };

  const handleLicense = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const uri = await uploadPrivate(file);
      setLicenseUri(uri);
      setLicenseName(file.name);
    } catch (e) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      const type = modes.includes('venue') ? 'venue' : 'advertiser';
      const created = await base44.entities.Organization.create({
        name: form.businessName.trim(),
        type,
        status: 'pending',
        business_modes: modes,
        advertiser_status: modes.includes('advertiser') ? 'requested' : 'none',
        trade_license_number: form.licenseNumber.trim(),
        trade_license_url: licenseUri,
        emirate: form.emirate,
        industry: form.industry.trim(),
        whatsapp: form.whatsapp.trim(),
        billing_email: user.email,
        member_user_ids: [user.id],
        commission_rate: 30,
        commercial_plan: 'revenue_share',
      });

      await base44.entities.Membership.create({
        org_id: created.id,
        user_id: user.id,
        user_email: user.email,
        user_name: user.full_name || '',
        role: 'owner',
        venue_ids: [],
        current_org: true,
      });

      await logActivity({
        orgId: created.id,
        memberIds: [user.id],
        userEmail: user.email,
        action: 'business_submitted',
        targetType: 'organization',
        targetId: created.id,
        details: `${created.name} submitted for approval`,
      });

      setOrg(created);
    } catch (e) {
      setError('We could not submit your business. Please try again.');
      setBusy(false);
    }
  };

  if (loading || isLoadingAuth) {
    return (
      <div className="min-h-screen bg-bw-cream">
        <div className="h-16 bg-white border-b border-bw-line" />
        <div className="max-w-2xl mx-auto p-6 space-y-4">
          <div className="bw-shimmer h-8 w-56 rounded-lg" />
          <div className="bw-shimmer h-40 rounded-2xl" />
          <div className="bw-shimmer h-40 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (org && org.status !== 'approved') return <StatusScreen org={org} />;

  const canContinueDetails = form.businessName.trim() && form.licenseNumber.trim() && licenseUri;

  return (
    <div className="min-h-screen bg-bw-cream">
      <header className="h-16 bg-white border-b border-bw-line flex items-center justify-between px-5 md:px-8">
        <div className="flex items-center gap-2.5">
          <span className="h-8 w-8 rounded-lg bg-bw-navy flex items-center justify-center">
            <span className="h-3 w-3 rounded-sm bg-bw-coral" />
          </span>
          <span className="font-semibold text-bw-navy">Beyond Walls</span>
        </div>
        <LanguageToggle />
      </header>

      <div className="max-w-2xl mx-auto px-5 py-8 md:py-12">
        <div className="flex items-center gap-2 mb-6">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className={`h-1.5 flex-1 rounded-full ${index <= step ? 'bg-bw-coral' : 'bg-bw-line'}`}
            />
          ))}
        </div>

        {step === 0 && (
          <div>
            <h1 className="text-2xl font-semibold text-bw-navy">{t('onboarding.title')}</h1>
            <p className="mt-1 text-sm text-bw-muted">{t('onboarding.step.mode')}</p>

            <div className="mt-6 space-y-3">
              {[
                { key: 'venue', title: t('onboarding.modeVenue'), body: t('onboarding.modeVenueBody'), icon: Store },
                { key: 'advertiser', title: t('onboarding.modeAdvertiser'), body: t('onboarding.modeAdvertiserBody'), icon: Megaphone },
              ].map((option) => {
                const Icon = option.icon;
                const active = modes.includes(option.key);
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => toggleMode(option.key)}
                    className={`w-full text-start rounded-2xl border p-5 flex items-start gap-4 transition-colors ${
                      active ? 'border-bw-coral bg-white shadow-sm' : 'border-bw-line bg-white/60 hover:border-bw-navy/20'
                    }`}
                  >
                    <span className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${active ? 'bg-bw-coral text-white' : 'bg-bw-cream text-bw-navy'}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-bw-navy">{option.title}</span>
                      <span className="block text-xs text-bw-muted mt-1 leading-relaxed">{option.body}</span>
                    </span>
                    {active && <Check className="h-5 w-5 text-bw-coral" />}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setModes(['venue', 'advertiser'])}
                className={`w-full text-start rounded-2xl border p-4 flex items-center gap-3 transition-colors ${
                  modes.length === 2 ? 'border-bw-coral bg-white' : 'border-dashed border-bw-line bg-transparent hover:border-bw-navy/20'
                }`}
              >
                <Sparkles className="h-4 w-4 text-bw-coral" />
                <span className="text-sm font-medium text-bw-navy">{t('onboarding.modeBoth')}</span>
              </button>
            </div>

            <button
              type="button"
              disabled={!modes.length}
              onClick={() => setStep(1)}
              className="mt-6 w-full rounded-xl bg-bw-navy px-4 py-3 text-sm font-semibold text-white hover:bg-bw-navy/90 disabled:opacity-40 inline-flex items-center justify-center gap-2"
            >
              {t('common.next')}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h1 className="text-2xl font-semibold text-bw-navy">{t('onboarding.step.details')}</h1>
            <p className="mt-1 text-sm text-bw-muted">{t('onboarding.step.review')}</p>

            <div className="mt-6 bg-white rounded-2xl border border-bw-line p-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="businessName">{t('onboarding.businessName')}</Label>
                <Input
                  id="businessName"
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  placeholder="Bloom Cafe"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="license">{t('onboarding.licenseNumber')}</Label>
                  <Input
                    id="license"
                    value={form.licenseNumber}
                    onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="emirate">{t('onboarding.emirate')}</Label>
                  <select
                    id="emirate"
                    value={form.emirate}
                    onChange={(e) => setForm({ ...form, emirate: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {EMIRATES.map((emirate) => <option key={emirate} value={emirate}>{emirate}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="industry">{t('onboarding.industry')}</Label>
                  <Input
                    id="industry"
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    placeholder="F&B, fitness, retail"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="whatsapp">{t('onboarding.whatsapp')}</Label>
                  <Input
                    id="whatsapp"
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    placeholder="+971 50 000 0000"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>{t('onboarding.licenseFile')}</Label>
                <label className="flex items-center gap-3 rounded-xl border border-dashed border-bw-line bg-bw-cream px-4 py-4 cursor-pointer hover:border-bw-navy/30">
                  <span className="h-9 w-9 rounded-lg bg-white border border-bw-line flex items-center justify-center">
                    {licenseUri ? <Check className="h-4 w-4 text-emerald-500" /> : <Upload className="h-4 w-4 text-bw-navy" />}
                  </span>
                  <span className="text-xs text-bw-muted truncate">
                    {uploading ? t('common.uploading') : licenseName || 'PDF or photo of your trade licence'}
                  </span>
                  <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleLicense} />
                </label>
                <p className="text-[11px] text-bw-muted">Stored privately and only used for verification.</p>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-100 px-3 py-2 text-xs text-rose-600">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="rounded-xl border border-bw-line px-4 py-3 text-sm font-semibold text-bw-muted hover:text-bw-navy"
              >
                {t('common.back')}
              </button>
              <button
                type="button"
                disabled={!canContinueDetails || uploading}
                onClick={() => setStep(2)}
                className="flex-1 rounded-xl bg-bw-navy px-4 py-3 text-sm font-semibold text-white hover:bg-bw-navy/90 disabled:opacity-40"
              >
                {t('common.next')}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-2xl font-semibold text-bw-navy">{t('onboarding.step.review')}</h1>
            <p className="mt-1 text-sm text-bw-muted">{t('onboarding.title')}</p>

            <div className="mt-6 bg-white rounded-2xl border border-bw-line divide-y divide-bw-line">
              {[
                [t('onboarding.businessName'), form.businessName],
                [t('onboarding.licenseNumber'), form.licenseNumber],
                [t('onboarding.emirate'), form.emirate],
                [t('onboarding.industry'), form.industry || t('common.none')],
                [t('onboarding.whatsapp'), form.whatsapp || t('common.none')],
                [t('onboarding.step.mode'), modes.map((m) => (m === 'venue' ? t('onboarding.modeVenue') : t('onboarding.modeAdvertiser'))).join(' + ')],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 px-5 py-3">
                  <span className="text-xs text-bw-muted">{label}</span>
                  <span className="text-sm font-medium text-bw-navy text-end">{value}</span>
                </div>
              ))}
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-100 px-3 py-2 text-xs text-rose-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-xl border border-bw-line px-4 py-3 text-sm font-semibold text-bw-muted hover:text-bw-navy"
              >
                {t('common.back')}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={submit}
                className="flex-1 rounded-xl bg-bw-coral px-4 py-3 text-sm font-semibold text-white hover:bg-bw-coral/90 disabled:opacity-60"
              >
                {busy ? t('common.loading') : t('onboarding.finish')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}