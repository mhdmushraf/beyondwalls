/**
 * Shared helpers for the Beyond Walls player + portal functions.
 * Kept in one place so pairing, manifests and screens never drift apart.
 */

export const PAIRING_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function randomPairingCode(length = 6) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += PAIRING_ALPHABET[bytes[i] % PAIRING_ALPHABET.length];
  }
  return out;
}

/** filter() with options returns a page; without options an array. Normalise both. */
export function firstOf(page) {
  if (!page) return null;
  const list = Array.isArray(page) ? page : page.items || [];
  return list[0] || null;
}

export async function uniquePairingCode(base44) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = randomPairingCode(6);
    const [screenHit, deviceHit] = await Promise.all([
      base44.asServiceRole.entities.Screen.filter({ pairing_code: code }, { limit: 1 }),
      base44.asServiceRole.entities.PlayerDevice.filter({ pairing_code: code }, { limit: 1 }),
    ]);
    if (!firstOf(screenHit) && !firstOf(deviceHit)) return code;
  }
  throw new Error("Could not allocate a pairing code");
}

export async function getSessionUser(base44) {
  return await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
}

export async function getVenueForUser(base44, venueId, user) {
  const venue = await base44.asServiceRole.entities.Venue.get(venueId).catch((e) =>
    e.status === 404 ? null : Promise.reject(e),
  );
  if (!venue) return { venue: null, status: 404 };
  const members = venue.org_member_user_ids || [];
  const allowed = members.includes(user.id) || user.role === "admin";
  if (!allowed) return { venue, status: 403 };
  return { venue, status: 200 };
}

export async function logActivity(base44, entry) {
  try {
    await base44.asServiceRole.entities.ActivityLog.create({
      org_id: entry.orgId || "",
      org_member_user_ids: entry.memberIds || [],
      user_email: entry.userEmail || "",
      action: entry.action,
      target_type: entry.targetType,
      target_id: entry.targetId || "",
      details: entry.details || "",
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    // Activity logging must never break the action it records.
  }
}

/**
 * A player authenticates with the token held in its PlayerDevice record.
 * The screen is only returned when this device is still the paired one,
 * which is what enforces the one-location lock.
 */
export async function resolvePlayerScreen(base44, token) {
  if (!token) return null;
  const device = firstOf(
    await base44.asServiceRole.entities.PlayerDevice.filter({ device_token: token }, { limit: 1 }),
  );
  if (!device || !device.screen_id) return null;
  const screen = await base44.asServiceRole.entities.Screen.get(device.screen_id).catch((e) =>
    e.status === 404 ? null : Promise.reject(e),
  );
  if (!screen) return null;
  if (screen.paired_device_id && screen.paired_device_id !== device.device_id) return null;
  return { screen, device };
}

/** Resolve an owner slot URL to something the player can load. */
export async function resolveMediaUrl(base44, url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  try {
    const res = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({
      file_uri: url,
      expires_in: 3600,
    });
    return res?.signed_url || null;
  } catch (e) {
    return null;
  }
}