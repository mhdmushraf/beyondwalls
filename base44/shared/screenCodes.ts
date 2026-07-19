// Shared screen code generation — used by manageSubscription and bulkCreateScreens.
// Do NOT reimplement inline; import from here.

const SETUP_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateSetupCode(): string {
  let code = 'BW-';
  for (let i = 0; i < 8; i++) code += SETUP_CHARS[Math.floor(Math.random() * SETUP_CHARS.length)];
  return code;
}

export function generateScreenPin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateDeviceToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) token += chars[Math.floor(Math.random() * chars.length)];
  return token;
}