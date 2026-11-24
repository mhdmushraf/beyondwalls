import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export const SCREEN_MODES = [
  { value: 'ads_only', label: 'Ads only' },
  { value: 'signage_ads', label: 'Signage + ads' },
  { value: 'signage_only', label: 'Signage only' },
];

export const PLAYER_TYPES = [
  { value: 'browser', label: 'Browser / TV stick' },
  { value: 'bone', label: 'B.One box' },
  { value: 'android_tv', label: 'Android TV' },
  { value: 'lg', label: 'LG webOS' },
  { value: 'samsung', label: 'Samsung Tizen' },
];

export const VENUE_TYPES = [
  'restaurant', 'cafe', 'gym', 'mall', 'coworking', 'hotel', 'clinic', 'salon', 'retail', 'other',
];

export const EMIRATES = [
  'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain',
];

export const SPEND_RANGES = [
  { value: 'under_25', label: 'Under AED 25' },
  { value: '25_50', label: 'AED 25 - 50' },
  { value: '50_100', label: 'AED 50 - 100' },
  { value: '100_plus', label: 'AED 100+' },
];

/** Private files render through a short-lived signed URL. */
export function useSignedUrl(fileUri) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let alive = true;
    if (!fileUri) {
      setUrl(null);
      return () => { alive = false; };
    }
    if (/^https?:\/\//i.test(fileUri) || fileUri.startsWith('blob:') || fileUri.startsWith('data:')) {
      setUrl(fileUri);
      return () => { alive = false; };
    }
    base44.integrations.Core.CreateFileSignedUrl({ file_uri: fileUri, expires_in: 3600 })
      .then((res) => { if (alive) setUrl(res.signed_url); })
      .catch(() => { if (alive) setUrl(null); });
    return () => { alive = false; };
  }, [fileUri]);

  return url;
}

/** Venue logos and photos appear on the public marketplace, so they are public files. */
export async function uploadPublic(file) {
  const res = await base44.integrations.Core.UploadPublicFile({ file });
  return res.file_url;
}

/** Trade licences are sensitive: private storage, signed on view. */
export async function uploadPrivate(file) {
  const res = await base44.integrations.Core.UploadPrivateFile({ file });
  return res.file_uri;
}

export async function logActivity(entry) {
  try {
    await base44.entities.ActivityLog.create({
      org_id: entry.orgId || '',
      org_member_user_ids: entry.memberIds || [],
      user_email: entry.userEmail || '',
      action: entry.action,
      target_type: entry.targetType,
      target_id: entry.targetId || '',
      details: entry.details || '',
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    // Logging never blocks the action.
  }
}

export function formatDateTime(value, lang = 'en') {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-AE' : 'en-AE', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  }).format(date);
}

export function timeAgo(value, lang = 'en') {
  if (!value) return null;
  const diff = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(diff)) return null;
  const mins = Math.round(diff / 60000);
  if (lang === 'ar') {
    if (mins < 1) return 'الآن';
    if (mins < 60) return `قبل ${mins} دقيقة`;
    const hours = Math.round(mins / 60);
    if (hours < 24) return `قبل ${hours} ساعة`;
    return `قبل ${Math.round(hours / 24)} يوم`;
  }
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
}

export function pairingCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}