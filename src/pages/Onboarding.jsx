import { useEffect, useState } from 'react';
import { Store, Megaphone, Sparkles, Upload, Check, AlertCircle, ArrowRight, Eye, X, FileText, RefreshCw } from 'lucide-react';
import { BrandLogo, BrandBackdrop } from '@/components/Brand';
import ShowcaseStack from '@/components/auth/ShowcaseCards';
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
  const [licensePreview, setLicensePreview] = useState(null); // { url, type }
  const [showLicense, setShowLicense] = useState(false);
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
      setLicensePreview((prev) => {
        if (prev?.url) URL.revokeObjectURL(prev.url);
        return { url: URL.createObjectURL(file), type: file.type };
      });
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
    <div className="relative min-h-screen font-[Inter,system-ui,sans-serif]">
      <BrandBackdrop />
      <header className="relative z-10 h-[72px] flex items-center justify-between px-5 md:px-10">
        <BrandLogo size={36} endorsement />
        <LanguageToggle />
      </header>

      <div className="relative z-10 mx-auto grid max-w-6xl gap-14 px-5 pt-4 pb-14 md:pt-8 xl:grid-cols-[minmax(0,640px)_1fr]">
        <div className="min-w-0">
        <ol className="mb-8 grid grid-cols-3 gap-3">
          {[t('onboarding.step.mode'), t('onboarding.step.details'), t('onboarding.step.review')].map((label, index) => (
            <li key={index} className="flex flex-col gap-2">
              <span className={`h-1.5 rounded-full ${index < step ? 'bw-grad' : index === step ? 'bw-grad opacity-100' : 'bg-[#e6e2f2]'}`} />
              <span className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] ${index <= step ? 'text-[#5a2ded]' : 'text-[#a39fb8]'}`}>
                <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${index < step ? 'bw-grad text-white' : index === step ? 'bg-[#ece6ff] text-[#5a2ded]' : 'bg-[#efedf6] text-[#a39fb8]'}`}>
                  {index < step ? <Check className="h-3 w-3" /> : index + 1}
                </span>
                <span className="truncate">{label}</span>
              </span>
            </li>
          ))}
        </ol>

        {step === 0 && (
          <div>
            <h1 className="text-[30px] font-bold tracking-[-0.6px] text-[#111027]">{t('onboarding.title')}</h1>
            <p className="mt-1.5 text-[15px] text-[#6b6787]">{t('onboarding.step.mode')}</p>

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
                      active ? 'border-[#6f3ffd] bg-white shadow-[0_16px_40px_-20px_rgba(90,45,237,0.45)] ring-4 ring-[#6f3ffd]/10' : 'border-[#e7e3f3] bg-white/75 backdrop-blur hover:border-[#c9bdfb]'
                    }`}
                  >
                    <span className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${active ? 'bw-grad text-white' : 'bg-[#f3f0fd] text-[#5a2ded]'}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-bw-navy">{option.title}</span>
                      <span className="block text-xs text-bw-muted mt-1 leading-relaxed">{option.body}</span>
                    </span>
                    {active && <span className="h-6 w-6 rounded-full bw-grad flex items-center justify-center"><Check className="h-3.5 w-3.5 text-white" /></span>}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setModes(['venue', 'advertiser'])}
                className={`w-full text-start rounded-2xl border p-4 flex items-center gap-3 transition-colors ${
                  modes.length === 2 ? 'border-[#6f3ffd] bg-white' : 'border-dashed border-[#d9d3ee] bg-white/50 hover:border-[#c9bdfb]'
                }`}
              >
                <Sparkles className="h-4 w-4 text-[#6f3ffd]" />
                <span className="text-sm font-medium text-bw-navy">{t('onboarding.modeBoth')}</span>
              </button>
            </div>

            <button
              type="button"
              disabled={!modes.length}
              onClick={() => setStep(1)}
              className="mt-7 w-full h-12 rounded-xl bw-grad px-5 text-[15px] font-semibold text-white shadow-[0_12px_26px_-12px_rgba(90,45,237,0.7)] hover:brightness-110 disabled:opacity-40 inline-flex items-center justify-center gap-2"
            >
              {t('common.next')}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h1 className="text-[30px] font-bold tracking-[-0.6px] text-[#111027]">{t('onboarding.step.details')}</h1>
            <p className="mt-1.5 text-[15px] text-[#6b6787]">{t('onboarding.step.review')}</p>

            <div className="mt-7 rounded-[24px] bg-white/85 backdrop-blur-xl ring-1 ring-[#e7e3f3] shadow-[0_24px_60px_-28px_rgba(55,30,140,0.35)] p-6 md:p-7 space-y-5">
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
                    className="flex h-11 w-full rounded-xl border border-input bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6f3ffd]/30"
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
                {licenseUri && licensePreview ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-[#e7e3f3] bg-[#f7f5fd] p-3">
                    <button type="button" onClick={() => setShowLicense(true)} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-[#e7e3f3]" aria-label="View trade licence">
                      {licensePreview.type.startsWith('image/')
                        ? <img src={licensePreview.url} alt="" className="h-full w-full object-cover" />
                        : <span className="flex h-full w-full items-center justify-center text-[#5a2ded]"><FileText className="h-6 w-6" /></span>}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-[#111027]">{licenseName}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-emerald-600"><Check className="h-3 w-3" /> Uploaded</p>
                    </div>
                    <button type="button" onClick={() => setShowLicense(true)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bw-grad px-3 text-[12px] font-semibold text-white">
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                    <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3 text-[12px] font-semibold text-[#6b6787] ring-1 ring-[#e7e3f3] hover:text-[#111027]">
                      <RefreshCw className="h-3.5 w-3.5" /> Replace
                      <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleLicense} />
                    </label>
                  </div>
                ) : (
                  <label className="flex items-center gap-4 rounded-2xl border-2 border-dashed border-[#d9d3ee] bg-[#faf9fe] px-4 py-5 cursor-pointer hover:border-[#a993ff] hover:bg-[#f5f2ff]">
                    <span className="h-11 w-11 rounded-xl bw-grad flex items-center justify-center shadow-[0_8px_18px_-8px_rgba(90,45,237,0.7)]">
                      <Upload className="h-5 w-5 text-white" />
                    </span>
                    <span>
                      <span className="block text-[13px] font-semibold text-[#111027]">{uploading ? t('common.uploading') : 'Upload trade licence'}</span>
                      <span className="block text-[12px] text-[#6b6787]">PDF or photo · you can preview it after upload</span>
                    </span>
                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleLicense} />
                  </label>
                )}
                <p className="text-[11px] text-bw-muted">Stored privately and only used for verification.</p>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-100 px-3 py-2 text-xs text-rose-600">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
            </div>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="h-12 rounded-xl bg-white/80 ring-1 ring-[#e7e3f3] px-5 text-[15px] font-semibold text-[#6b6787] hover:text-[#111027]"
              >
                {t('common.back')}
              </button>
              <button
                type="button"
                disabled={!canContinueDetails || uploading}
                onClick={() => setStep(2)}
                className="flex-1 h-12 rounded-xl bw-grad px-5 text-[15px] font-semibold text-white shadow-[0_12px_26px_-12px_rgba(90,45,237,0.7)] hover:brightness-110 disabled:opacity-40 inline-flex items-center justify-center gap-2"
              >
                {t('common.next')}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-[30px] font-bold tracking-[-0.6px] text-[#111027]">{t('onboarding.step.review')}</h1>
            <p className="mt-1.5 text-[15px] text-[#6b6787]">{t('onboarding.title')}</p>

            <div className="mt-7 rounded-[24px] bg-white/85 backdrop-blur-xl ring-1 ring-[#e7e3f3] shadow-[0_24px_60px_-28px_rgba(55,30,140,0.35)] divide-y divide-[#efedf6] overflow-hidden">
              {[
                [t('onboarding.businessName'), form.businessName],
                [t('onboarding.licenseNumber'), form.licenseNumber],
                [t('onboarding.licenseFile'), licensePreview ? <button type="button" onClick={() => setShowLicense(true)} className="inline-flex items-center gap-1.5 font-semibold text-[#5a2ded] hover:underline"><Eye className="h-3.5 w-3.5" /> View</button> : licenseName],
                [t('onboarding.emirate'), form.emirate],
                [t('onboarding.industry'), form.industry || t('common.none')],
                [t('onboarding.whatsapp'), form.whatsapp || t('common.none')],
                [t('onboarding.step.mode'), modes.map((m) => (m === 'venue' ? t('onboarding.modeVenue') : t('onboarding.modeAdvertiser'))).join(' + ')],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 px-6 py-3.5">
                  <span className="text-[13px] text-[#6b6787]">{label}</span>
                  <span className="text-[14px] font-semibold text-[#111027] text-end">{value}</span>
                </div>
              ))}
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-100 px-3 py-2 text-xs text-rose-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="h-12 rounded-xl bg-white/80 ring-1 ring-[#e7e3f3] px-5 text-[15px] font-semibold text-[#6b6787] hover:text-[#111027]"
              >
                {t('common.back')}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={submit}
                className="flex-1 h-12 rounded-xl bw-grad px-5 text-[15px] font-semibold text-white shadow-[0_12px_26px_-12px_rgba(90,45,237,0.7)] hover:brightness-110 disabled:opacity-40 inline-flex items-center justify-center gap-2"
              >
                {busy ? t('common.loading') : t('onboarding.finish')}
              </button>
            </div>
          </div>
        )}
        </div>
        <aside className="hidden xl:block">
          <div className="sticky top-10 pt-8">
            <ShowcaseStack greeting={step === 2 ? 'Almost live' : 'Good morning'} />
            <div className="mt-6 max-w-[460px] mx-auto">
              <p className="text-[18px] font-bold tracking-[-0.3px] text-[#111027]">{step === 0 ? 'Earn from the screens you already have.' : step === 1 ? 'We verify every business — that keeps ads on your walls safe.' : 'Once approved, ads start booking your free slots.'}</p>
              <p className="mt-1.5 text-[14px] text-[#6b6787]">Venues keep 70% of every booking. You approve every ad before it plays.</p>
            </div>
          </div>
        </aside>
      </div>
      {showLicense && licensePreview && (
        <div role="dialog" aria-modal="true" aria-label="Trade licence" className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0824]/70 p-4 backdrop-blur-sm" onClick={() => setShowLicense(false)}>
          <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[22px] bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3 border-b border-[#efedf6] px-5 py-3.5">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#5a2ded]">Trade licence</p>
                <p className="truncate text-[14px] font-semibold text-[#111027]">{licenseName}</p>
              </div>
              <button type="button" onClick={() => setShowLicense(false)} className="h-9 w-9 shrink-0 rounded-lg bg-[#f3f1f9] text-[#6b6787] hover:text-[#111027] flex items-center justify-center" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-[#f6f5fb] p-4">
              {licensePreview.type.startsWith('image/')
                ? <img src={licensePreview.url} alt="Trade licence" className="mx-auto max-h-[72vh] w-auto rounded-lg shadow" />
                : <iframe title="Trade licence" src={licensePreview.url} className="h-[72vh] w-full rounded-lg bg-white" />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}