import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

/* ------------------------------------------------------------------ */
/* Online / offline                                                    */
/* ------------------------------------------------------------------ */

const listeners = new Set();
let forcedOffline = false;

export function isOnline() {
  if (forcedOffline) return false;
  return typeof navigator === 'undefined' ? true : navigator.onLine !== false;
}

/** true while the browser has a connection (or ?state=offline forces offline for previews). */
export function useOnline() {
  const [online, setOnline] = useState(isOnline());
  useEffect(() => {
    const on = () => setOnline(isOnline());
    window.addEventListener('online', on);
    window.addEventListener('offline', on);
    listeners.add(on);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', on);
      listeners.delete(on);
    };
  }, []);
  return online;
}

/* ------------------------------------------------------------------ */
/* Dev/preview switch: ?state=empty|loading|error|offline|slow|expired */
/* Only honoured for admins so customers can never see it.             */
/* ------------------------------------------------------------------ */

export const PREVIEW_STATES = ['empty', 'loading', 'error', 'offline', 'slow', 'expired', 'noresults'];

export function readPreviewState(user) {
  if (!user || user.role !== 'admin') return null;
  try {
    const s = new URLSearchParams(window.location.search).get('state');
    return PREVIEW_STATES.includes(s) ? s : null;
  } catch (e) {
    return null;
  }
}

export function applyPreviewState(state) {
  const next = state === 'offline';
  if (next !== forcedOffline) {
    forcedOffline = next;
    listeners.forEach((fn) => fn());
  }
}

/* ------------------------------------------------------------------ */
/* Friendly errors                                                     */
/* ------------------------------------------------------------------ */

/** Turns any thrown error into { title, fix } a venue owner can act on. */
export function friendlyError(error, action = 'do that') {
  const status = error?.response?.status || error?.status;
  const serverMsg = error?.response?.data?.error || error?.response?.data?.message;
  if (!isOnline()) {
    return { title: `You're offline — couldn't ${action}`, fix: 'It will try again automatically when you are back online.', kind: 'offline' };
  }
  if (status === 401) {
    return { title: 'Your session expired', fix: 'Sign in again — your unsaved work is kept on this device.', kind: 'expired' };
  }
  if (status === 403) {
    return { title: `You don't have access to ${action}`, fix: 'Ask the business owner to change your role in Team.', kind: 'denied' };
  }
  if (status === 404) {
    return { title: 'That item no longer exists', fix: 'Someone may have deleted it. Refresh the page to see the latest.', kind: 'missing' };
  }
  if (status === 409) {
    return { title: serverMsg || 'That conflicts with something else', fix: 'Refresh and try again.', kind: 'conflict' };
  }
  if (status === 413) {
    return { title: 'That file is too large', fix: 'Use a file under 200 MB, or compress the video first.', kind: 'size' };
  }
  if (status === 429) {
    return { title: 'Too many tries in a short time', fix: 'Wait a few seconds, then try again.', kind: 'rate' };
  }
  if (status >= 500) {
    return { title: `Our server had a problem and couldn't ${action}`, fix: 'Nothing was lost. Try again in a moment — if it keeps happening, message us on WhatsApp.', kind: 'server' };
  }
  if (serverMsg && serverMsg.length < 120) {
    return { title: serverMsg, fix: 'Check the details and try again.', kind: 'server-msg' };
  }
  return { title: `Couldn't ${action}`, fix: 'Check your internet and try again.', kind: 'unknown' };
}

/** Toast with what went wrong, how to fix it, and a Retry button. */
export function notifyError(error, action, retry) {
  const { title, fix, kind } = friendlyError(error, action);
  if (kind === 'expired') { window.dispatchEvent(new Event('bw:session-expired')); return; }
  toast.error(title, {
    description: fix,
    duration: 8000,
    ...(retry ? { action: { label: 'Try again', onClick: retry } } : {}),
  });
}

/** Success toast that says what happens next, with an optional next-step button. */
export function notifySuccess(title, next, action) {
  toast.success(title, {
    description: next,
    duration: 6000,
    ...(action ? { action } : {}),
  });
}

/* ------------------------------------------------------------------ */
/* Outbox: writes made offline are kept and sent when back online      */
/* ------------------------------------------------------------------ */

const OUTBOX_KEY = 'bw_outbox_v1';
const outboxListeners = new Set();

function readOutbox() {
  try { return JSON.parse(localStorage.getItem(OUTBOX_KEY) || '[]'); } catch (e) { return []; }
}
function writeOutbox(list) {
  try { localStorage.setItem(OUTBOX_KEY, JSON.stringify(list)); } catch (e) { /* storage full */ }
  outboxListeners.forEach((fn) => fn(list.length));
}

export function queueWrite(op) {
  const list = readOutbox();
  // Collapse repeated updates to the same record so only the latest goes out.
  const idx = op.op === 'update' ? list.findIndex((x) => x.op === 'update' && x.entity === op.entity && x.id === op.id) : -1;
  if (idx >= 0) list[idx] = { ...list[idx], data: { ...list[idx].data, ...op.data } };
  else list.push({ ...op, queued_at: Date.now() });
  writeOutbox(list);
}

let flushing = false;
export async function flushOutbox() {
  if (flushing || !isOnline()) return 0;
  flushing = true;
  let sent = 0;
  try {
    let list = readOutbox();
    while (list.length && isOnline()) {
      const op = list[0];
      try {
        if (op.op === 'update') await base44.entities[op.entity].update(op.id, op.data);
        else if (op.op === 'create') await base44.entities[op.entity].create(op.data);
        sent += 1;
      } catch (e) {
        const status = e?.response?.status;
        if (!status || status >= 500 || status === 401) break; // try again later
        // 4xx other than auth: drop it so the queue can't jam forever.
      }
      list = readOutbox().slice(1);
      writeOutbox(list);
    }
  } finally {
    flushing = false;
  }
  if (sent) notifySuccess(`Back online — ${sent} saved ${sent === 1 ? 'change' : 'changes'} sent`, 'Your screens update within a minute.');
  return sent;
}

export function useOutboxCount() {
  const [n, setN] = useState(readOutbox().length);
  useEffect(() => {
    outboxListeners.add(setN);
    const flush = () => flushOutbox();
    window.addEventListener('online', flush);
    flushOutbox();
    return () => { outboxListeners.delete(setN); window.removeEventListener('online', flush); };
  }, []);
  return n;
}

/* ------------------------------------------------------------------ */
/* Draft autosave: typed work survives refresh, crash and session end */
/* ------------------------------------------------------------------ */

/**
 * Keeps `value` in localStorage under `key` while it differs from `saved`.
 * Returns { restored, discard, clear } — call clear() after a successful save.
 */
export function useDraft(key, value, setValue, { saved, enabled = true } = {}) {
  const storeKey = `bw_draft:${key}`;
  const [restored, setRestored] = useState(false);
  const checked = useRef(null);

  // Offer the stored draft once per key.
  useEffect(() => {
    if (!enabled || !key || checked.current === key) return;
    checked.current = key;
    try {
      const raw = localStorage.getItem(storeKey);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (draft && JSON.stringify(draft.value) !== JSON.stringify(saved ?? value)) {
        setValue(draft.value);
        setRestored(true);
      } else {
        localStorage.removeItem(storeKey);
      }
    } catch (e) { /* ignore */ }
  }, [key, enabled]); // eslint-disable-line

  // Save while typing.
  useEffect(() => {
    if (!enabled || !key || value === undefined || value === null) return undefined;
    const id = setTimeout(() => {
      try {
        if (saved !== undefined && JSON.stringify(saved) === JSON.stringify(value)) localStorage.removeItem(storeKey);
        else localStorage.setItem(storeKey, JSON.stringify({ value, at: Date.now() }));
      } catch (e) { /* storage full */ }
    }, 600);
    return () => clearTimeout(id);
  }, [key, value, saved, enabled, storeKey]);

  const clear = useCallback(() => {
    try { localStorage.removeItem(storeKey); } catch (e) { /* ignore */ }
    setRestored(false);
  }, [storeKey]);

  const discard = useCallback(() => {
    clear();
    if (saved !== undefined) setValue(saved);
  }, [clear, saved, setValue]);

  return { restored, discard, clear };
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

export const rules = {
  required: (label) => (v) => (String(v ?? '').trim() ? null : `${label} is required.`),
  max: (label, n) => (v) => (String(v ?? '').length <= n ? null : `${label} is too long — ${String(v).length} of ${n} characters.`),
  price: (label) => (v) => {
    if (v === '' || v === null || v === undefined) return `${label} is required.`;
    const n = Number(v);
    if (Number.isNaN(n)) return `${label} must be a number, like 32 or 32.50.`;
    if (n < 0) return `${label} can't be below 0.`;
    if (n > 100000) return `${label} looks too high — check the number.`;
    return null;
  },
  url: (label) => (v) => {
    const s = String(v ?? '').trim();
    if (!s || s === 'https://') return `${label} is required.`;
    if (!/^https?:\/\/[^\s.]+\.[^\s]{2,}/i.test(s)) return `${label} must be a full link, like https://beancoffee.ae/menu`;
    return null;
  },
  phoneUAE: (label) => (v) => {
    const digits = String(v ?? '').replace(/\D/g, '');
    if (!digits) return `${label} is required.`;
    const local = digits.startsWith('971') ? digits.slice(3) : digits.replace(/^0/, '');
    if (local.length !== 9) return `${label} needs 9 digits after +971. You typed ${local.length}.`;
    return null;
  },
  code6: () => (v) => {
    const s = String(v ?? '');
    if (s.length !== 6) return `The TV code has 6 characters. You typed ${s.length}.`;
    return null;
  },
};

/** validate({ field: [rule, ...] }, values) → { field: message } */
export function validate(schema, values) {
  const out = {};
  Object.entries(schema).forEach(([field, list]) => {
    for (const rule of list) {
      const msg = rule(values?.[field]);
      if (msg) { out[field] = msg; break; }
    }
  });
  return out;
}
