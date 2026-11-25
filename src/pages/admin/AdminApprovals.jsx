import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ShieldCheck, MapPin, ExternalLink, Check, X, LogOut, FileText, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/i18n';
import { useSignedUrl, logActivity, formatDateTime } from '@/lib/portalData';
import RejectDialog from '@/components/admin/RejectDialog';
import { ListSkeleton } from '@/components/portal/Skeletons';

const STATUS_BADGE = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  rejected: 'bg-rose-50 text-rose-700 border-rose-100',
  suspended: 'bg-slate-100 text-slate-600 border-slate-200',
  requested: 'bg-amber-50 text-amber-700 border-amber-100',
  none: 'bg-slate-100 text-slate-600 border-slate-200',
};

function DocLink({ fileUri }) {
  const url = useSignedUrl(fileUri);
  if (!url) return <span className="text-[11px] text-bw-muted">—</span>;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-bw-coral hover:underline">
      <FileText className="h-3.5 w-3.5" />
      View document
    </a>
  );
}

async function sendDecisionEmail({ to, businessName, decision, reason }) {
  if (!to) return;
  try {
    await base44.integrations.Core.SendEmail({
      to,
      template_name: 'ApprovalDecision',
      category: 'transactional',
      variables: {
        business_name: businessName,
        decision,
        message: decision === 'approved'
          ? 'Your business is verified. You can now add venues, pair screens and start using the portal.'
          : 'We could not verify this business with the documents provided.',
        reason: reason || 'No further details were provided.',
        action_url: 'https://beyondwalls.ae/app',
      },
    });
  } catch (e) {
    // Email is best effort; the decision itself is saved.
  }
}

export default function AdminApprovals() {
  const { t, lang } = useI18n();
  const { user, isLoadingAuth, logout, navigateToLogin } = useAuth();
  const [tab, setTab] = useState('businesses');
  const [loading, setLoading] = useState(true);
  const [orgs, setOrgs] = useState([]);
  const [venues, setVenues] = useState([]);
  const [busy, setBusy] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isLoadingAuth) return;
    if (!user) {
      navigateToLogin();
      return;
    }
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const [orgPage, venuePage] = await Promise.all([
        base44.entities.Organization.list({ sort: '-created_date', limit: 200 }),
        base44.entities.Venue.list({ sort: '-created_date', limit: 200 }),
      ]);
      if (cancelled) return;
      setOrgs(orgPage.items || []);
      setVenues(venuePage.items || []);
      setLoading(false);
    })().catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user, isLoadingAuth, isAdmin, navigateToLogin]);

  const refresh = async () => {
    const [orgPage, venuePage] = await Promise.all([
      base44.entities.Organization.list({ sort: '-created_date', limit: 200 }),
      base44.entities.Venue.list({ sort: '-created_date', limit: 200 }),
    ]);
    setOrgs(orgPage.items || []);
    setVenues(venuePage.items || []);
  };

  const decideBusiness = async (org, decision, reason = '') => {
    setBusy(true);
    try {
      await base44.entities.Organization.update(org.id, {
        status: decision,
        rejection_reason: decision === 'rejected' ? reason : '',
      });
      await logActivity({
        orgId: org.id,
        memberIds: org.member_user_ids || [],
        userEmail: user.email,
        action: `business_${decision}`,
        targetType: 'organization',
        targetId: org.id,
        details: reason || `${org.name} ${decision}`,
      });
      await sendDecisionEmail({
        to: org.billing_email,
        businessName: org.name,
        decision,
        reason,
      });
      await refresh();
      toast.success(t('admin.decisionSaved'));
    } finally {
      setBusy(false);
      setRejectTarget(null);
    }
  };

  const decideVenue = async (venue, decision, reason = '') => {
    setBusy(true);
    try {
      await base44.entities.Venue.update(venue.id, {
        approval_status: decision,
        status: decision === 'approved' ? 'active' : 'inactive',
        rejection_reason: decision === 'rejected' ? reason : '',
      });
      await logActivity({
        orgId: venue.org_id,
        memberIds: venue.org_member_user_ids || [],
        userEmail: user.email,
        action: `venue_${decision}`,
        targetType: 'venue',
        targetId: venue.id,
        details: reason || `${venue.name} ${decision}`,
      });
      await sendDecisionEmail({
        to: venue.owner_email,
        businessName: venue.name,
        decision,
        reason,
      });
      await refresh();
      toast.success(t('admin.decisionSaved'));
    } finally {
      setBusy(false);
      setRejectTarget(null);
    }
  };

  const decideAdvertiser = async (org, decision, reason = '') => {
    setBusy(true);
    try {
      await base44.entities.Organization.update(org.id, {
        advertiser_status: decision === 'approved' ? 'approved' : 'none',
        rejection_reason: decision === 'rejected' ? reason : org.rejection_reason || '',
      });
      await logActivity({
        orgId: org.id,
        memberIds: org.member_user_ids || [],
        userEmail: user.email,
        action: `advertiser_${decision}`,
        targetType: 'organization',
        targetId: org.id,
        details: reason || `${org.name} advertiser access ${decision}`,
      });
      await refresh();
      toast.success(t('admin.decisionSaved'));
    } finally {
      setBusy(false);
      setRejectTarget(null);
    }
  };

  if (isLoadingAuth) {
    return <div className="min-h-screen bg-bw-cream" />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-bw-cream flex items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-bw-line bg-white p-8 text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-bw-muted" />
          <p className="mt-3 text-sm text-bw-navy">{t('admin.notAuthorised')}</p>
          <Link to="/app" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-bw-coral hover:underline">
            <ArrowLeft className="h-4 w-4" />
            {t('nav.dashboard')}
          </Link>
        </div>
      </div>
    );
  }

  const pendingBusinesses = orgs.filter((org) => org.status === 'pending');
  const advertiserRequests = orgs.filter((org) => org.advertiser_status === 'requested');
  const pendingVenues = venues.filter((venue) => venue.approval_status === 'pending');

  const tabs = [
    { key: 'businesses', label: t('admin.tabBusinesses'), count: pendingBusinesses.length },
    { key: 'venues', label: t('admin.tabVenues'), count: pendingVenues.length },
    { key: 'advertisers', label: t('admin.tabAdvertisers'), count: advertiserRequests.length },
  ];

  const renderBusiness = (org) => (
    <div key={org.id} className="rounded-2xl border border-bw-line bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-bw-navy">{org.name}</p>
          <p className="text-[11px] text-bw-muted">
            {[org.emirate, org.industry, org.type].filter(Boolean).join(' · ')}
          </p>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize ${STATUS_BADGE[org.status] || STATUS_BADGE.pending}`}>
          {org.status}
        </span>
      </div>

      <div className="mt-3 grid sm:grid-cols-2 gap-3 text-[11px] text-bw-muted">
        <p>Licence: <span className="text-bw-ink">{org.trade_license_number || '—'}</span></p>
        <p>Modes: <span className="text-bw-ink">{(org.business_modes || []).join(', ') || '—'}</span></p>
        <p>WhatsApp: <span className="text-bw-ink">{org.whatsapp || '—'}</span></p>
        <p>Submitted: <span className="text-bw-ink">{formatDateTime(org.created_date, lang)}</span></p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <DocLink fileUri={org.trade_license_url} />
        {org.rejection_reason && <span className="text-[11px] text-rose-600">{org.rejection_reason}</span>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || org.status === 'approved'}
          onClick={() => decideBusiness(org, 'approved')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-[11px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
        >
          <Check className="h-3.5 w-3.5" />
          {t('common.approve')}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setRejectTarget({ kind: 'business', item: org })}
          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-40"
        >
          <X className="h-3.5 w-3.5" />
          {t('common.reject')}
        </button>
        {org.status === 'suspended' && (
          <span className="text-[11px] text-bw-muted">Suspended</span>
        )}
      </div>
    </div>
  );

  const renderVenue = (venue) => (
    <div key={venue.id} className="rounded-2xl border border-bw-line bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-bw-navy">{venue.name}</p>
          <p className="text-[11px] text-bw-muted capitalize">
            {venue.venue_type} · {[venue.address, venue.city].filter(Boolean).join(', ')}
          </p>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize ${STATUS_BADGE[venue.approval_status] || STATUS_BADGE.pending}`}>
          {venue.approval_status}
        </span>
      </div>

      <div className="mt-3 grid sm:grid-cols-3 gap-3 text-[11px] text-bw-muted">
        <p>Owner: <span className="text-bw-ink">{venue.owner_email || '—'}</span></p>
        <p>Hours: <span className="text-bw-ink">{venue.opening_hours || '—'}</span></p>
        <p>Daily customers: <span className="text-bw-ink">{venue.daily_customers ?? '—'}</span></p>
      </div>

      {venue.photo_urls?.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {venue.photo_urls.map((photo) => (
            <img key={photo} src={photo} alt="" className="h-16 w-24 rounded-lg object-cover border border-bw-line" />
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {venue.latitude && venue.longitude ? (
          <a
            href={`https://www.google.com/maps?q=${venue.latitude},${venue.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-bw-coral hover:underline"
          >
            <MapPin className="h-3.5 w-3.5" />
            {t('admin.location')}
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span className="text-[11px] text-bw-muted">No pin</span>
        )}
        {venue.rejection_reason && <span className="text-[11px] text-rose-600">{venue.rejection_reason}</span>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy || venue.approval_status === 'approved'}
          onClick={() => decideVenue(venue, 'approved')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-[11px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
        >
          <Check className="h-3.5 w-3.5" />
          {t('common.approve')}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setRejectTarget({ kind: 'venue', item: venue })}
          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-40"
        >
          <X className="h-3.5 w-3.5" />
          {t('common.reject')}
        </button>
      </div>
    </div>
  );

  const renderAdvertiser = (org) => (
    <div key={org.id} className="rounded-2xl border border-bw-line bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-bw-navy">{org.name}</p>
          <p className="text-[11px] text-bw-muted">{org.billing_email}</p>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize ${STATUS_BADGE[org.advertiser_status] || STATUS_BADGE.none}`}>
          {org.advertiser_status}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => decideAdvertiser(org, 'approved')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-[11px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
        >
          <Check className="h-3.5 w-3.5" />
          {t('common.approve')}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setRejectTarget({ kind: 'advertiser', item: org })}
          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-40"
        >
          <X className="h-3.5 w-3.5" />
          {t('common.reject')}
        </button>
      </div>
    </div>
  );

  const rejectOpen = Boolean(rejectTarget);

  const confirmReject = (reason) => {
    if (!rejectTarget) return;
    if (rejectTarget.kind === 'business') decideBusiness(rejectTarget.item, 'rejected', reason);
    else if (rejectTarget.kind === 'venue') decideVenue(rejectTarget.item, 'rejected', reason);
    else decideAdvertiser(rejectTarget.item, 'rejected', reason);
  };

  return (
    <div>
      <div className="max-w-5xl space-y-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-bw-navy">{t('admin.title')}</h1>
          <p className="mt-1 text-sm text-bw-muted">{t('admin.subtitle')}</p>
        </div>

        <div className="flex flex-wrap gap-1 rounded-xl bg-white border border-bw-line p-1 w-fit">
          {tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${tab === item.key ? 'bg-bw-navy text-white' : 'text-bw-muted hover:text-bw-navy'}`}
            >
              {item.label}
              {item.count > 0 && (
                <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${tab === item.key ? 'bg-white/20' : 'bg-bw-cream'}`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <ListSkeleton rows={3} />
        ) : (
          <div className="space-y-3">
            {tab === 'businesses' && (
              orgs.length ? (
                <>
                  {pendingBusinesses.map(renderBusiness)}
                  {orgs.filter((org) => org.status !== 'pending').map(renderBusiness)}
                </>
              ) : <p className="text-sm text-bw-muted">{t('admin.noPending')}</p>
            )}

            {tab === 'venues' && (
              venues.length ? (
                <>
                  {pendingVenues.map(renderVenue)}
                  {venues.filter((venue) => venue.approval_status !== 'pending').map(renderVenue)}
                </>
              ) : <p className="text-sm text-bw-muted">{t('admin.noPending')}</p>
            )}

            {tab === 'advertisers' && (
              advertiserRequests.length ? (
                advertiserRequests.map(renderAdvertiser)
              ) : <p className="text-sm text-bw-muted">{t('admin.noPending')}</p>
            )}
          </div>
        )}
      </div>

      <RejectDialog
        open={rejectOpen}
        busy={busy}
        onOpenChange={(next) => { if (!next) setRejectTarget(null); }}
        onConfirm={confirmReject}
      />
    </div>
  );
}