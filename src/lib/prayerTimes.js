/**
 * Prayer times worked out on the device (no internet needed), UAE (IACAD Dubai) method:
 * Fajr and Isha at 18.2° below the horizon, Asr = shadow length 1, UAE precaution minutes, UAE time (UTC+4).
 * Checked against the IACAD timetable to the minute. Friday prayer is fixed at 12:45 across the UAE.
 * Same code ships in the mobile app (src/lib/prayer.ts) — keep them in step.
 */
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
const fix = (a, b) => { a = a - b * Math.floor(a / b); return a < 0 ? a + b : a; };

function julian(y, m, d) {
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100); const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}
function sun(jd) {
  const D = jd - 2451545.0;
  const g = fix(357.529 + 0.98560028 * D, 360);
  const q = fix(280.459 + 0.98564736 * D, 360);
  const L = fix(q + 1.915 * Math.sin(rad(g)) + 0.02 * Math.sin(rad(2 * g)), 360);
  const e = 23.439 - 0.00000036 * D;
  const RA = fix(deg(Math.atan2(Math.cos(rad(e)) * Math.sin(rad(L)), Math.cos(rad(L)))) / 15, 24);
  return { decl: deg(Math.asin(Math.sin(rad(e)) * Math.sin(rad(L)))), eqt: q / 15 - RA };
}

/** { fajr, sunrise, dhuhr, asr, maghrib, isha } as minutes after midnight, UAE time. */
export function prayerTimes(date, lat, lng, tz = 4) {
  const local = new Date(date.getTime() + tz * 3600000);
  const jd = julian(local.getUTCFullYear(), local.getUTCMonth() + 1, local.getUTCDate()) - lng / (15 * 24);
  const mid = (t) => fix(12 - sun(jd + t).eqt, 24);
  const angleTime = (angle, t, ccw) => {
    const { decl } = sun(jd + t);
    const c = (-Math.sin(rad(angle)) - Math.sin(rad(decl)) * Math.sin(rad(lat))) / (Math.cos(rad(decl)) * Math.cos(rad(lat)));
    const T = deg(Math.acos(Math.max(-1, Math.min(1, c)))) / 15;
    return mid(t) + (ccw ? -T : T);
  };
  const asr = (t) => { const { decl } = sun(jd + t); return angleTime(-deg(Math.atan(1 / (1 + Math.tan(rad(Math.abs(lat - decl)))))), t); };
  let h = { fajr: 5, sunrise: 6, dhuhr: 12, asr: 13, maghrib: 18, isha: 18 };
  for (let i = 0; i < 2; i++) {
    const f = (x) => x / 24;
    h = {
      fajr: angleTime(18.2, f(h.fajr), true),
      sunrise: angleTime(0.833, f(h.sunrise), true),
      dhuhr: mid(f(h.dhuhr)),
      asr: asr(f(h.asr)),
      maghrib: angleTime(0.833, f(h.maghrib), false),
      isha: angleTime(18.2, f(h.isha), false),
    };
  }
  const toMin = (x) => Math.round((x + tz - lng / 15) * 60);
  return { fajr: toMin(h.fajr), sunrise: toMin(h.sunrise), dhuhr: toMin(h.dhuhr) + 3, asr: toMin(h.asr) + 1, maghrib: toMin(h.maghrib) + 3, isha: toMin(h.isha) };
}

/** Friday prayer across the UAE is held at 12:45 (since 2026). */
export const JUMUAH_MIN = 12 * 60 + 45;

export const PRAYERS = [
  ['fajr', 'Fajr', 'الفجر'], ['dhuhr', 'Dhuhr', 'الظهر'], ['asr', 'Asr', 'العصر'], ['maghrib', 'Maghrib', 'المغرب'], ['isha', 'Isha', 'العشاء'],
];

/** The pause in force at `now`, or null. cfg = manifest.prayer. */
export function activePrayerPause(now, cfg) {
  if (!cfg) return null;
  const t = prayerTimes(now, cfg.lat ?? 25.2048, cfg.lng ?? 55.2708);
  const local = new Date(now.getTime() + 4 * 3600000);
  const nowMin = local.getUTCHours() * 60 + local.getUTCMinutes();
  const friday = local.getUTCDay() === 5;
  for (const [key, en, ar] of PRAYERS) {
    if (cfg.prayers && cfg.prayers.length && !cfg.prayers.includes(key)) continue;
    const jumuah = key === 'dhuhr' && friday;
    const start = jumuah ? JUMUAH_MIN : t[key];
    const len = jumuah ? (cfg.jumuah_minutes || 45) : (cfg.minutes || 15);
    if (nowMin >= start && nowMin < start + len) return { key, en: jumuah ? "Jumu'ah" : en, ar: jumuah ? 'الجمعة' : ar, until: start + len, show: cfg.show || 'card' };
  }
  return null;
}

export const hm = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
