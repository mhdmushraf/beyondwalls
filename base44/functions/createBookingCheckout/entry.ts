import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// =============================================================================
// PAYMENTS CONFIG — single source of truth for the payment gateway.
//   "manual" — no real gateway; returns a mock success URL (default, dev/staging)
//   "tap"    — Tap Payments (AED-friendly, popular in UAE/GCC)
//   "stripe" — Stripe Checkout
//
// To switch providers: change PAYMENTS_PROVIDER here and implement the matching
// branch in createCheckout() below. No caller code changes required.
// =============================================================================
const PAYMENTS_PROVIDER = 'manual';

// =============================================================================
// PAYMENT GATEWAY ABSTRACTION
// Every provider implementation receives a uniform CreateCheckoutInput and
// returns a uniform CheckoutResult. The rest of the app never references a
// gateway SDK directly — it goes through createCheckout() here.
// =============================================================================
interface CreateCheckoutInput {
  referenceId: string;
  amount: number;
  currency: string;
  description: string;
  successUrl: string;
  cancelUrl: string;
}

interface CheckoutResult {
  checkoutUrl: string;
  provider: string;
  referenceId: string;
}

async function createCheckout(input: CreateCheckoutInput): Promise<CheckoutResult> {
  switch (PAYMENTS_PROVIDER) {
    case 'manual':
      return createManualCheckout(input);
    case 'tap':
      return createTapCheckout(input);
    case 'stripe':
      return createStripeCheckout(input);
    default:
      throw new Error(`Unknown PAYMENTS_PROVIDER: "${PAYMENTS_PROVIDER}"`);
  }
}

// --- Provider: manual (mock) ---
async function createManualCheckout(input: CreateCheckoutInput): Promise<CheckoutResult> {
  const url = `/bookings?checkout=manual_success&reference=${encodeURIComponent(input.referenceId)}`;
  return { checkoutUrl: url, provider: 'manual', referenceId: input.referenceId };
}

// --- Provider: Tap Payments (https://www.tap.company/docs) ---
// Activate by setting PAYMENTS_PROVIDER = 'tap' and adding TAP_SECRET_KEY secret.
async function createTapCheckout(input: CreateCheckoutInput): Promise<CheckoutResult> {
  const secretKey = Deno.env.get('TAP_SECRET_KEY');
  if (!secretKey) throw new Error('TAP_SECRET_KEY secret is not set. Add it in dashboard settings.');

  const res = await fetch('https://api.tap.company/v2/charges', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${secretKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      amount: input.amount,
      currency: input.currency,
      threeDS: { enabled: true },
      save_card: false,
      description: input.description,
      metadata: { reference_id: input.referenceId },
      redirect: { url: input.successUrl },
    }),
  });

  const data = await res.json();
  if (!res.ok || !data?.transaction?.url) {
    throw new Error(`Tap checkout failed: ${data?.message ?? JSON.stringify(data)}`);
  }
  return { checkoutUrl: data.transaction.url, provider: 'tap', referenceId: input.referenceId };
}

// --- Provider: Stripe Checkout ---
// Activate by setting PAYMENTS_PROVIDER = 'stripe' and adding STRIPE_SECRET_KEY secret.
async function createStripeCheckout(input: CreateCheckoutInput): Promise<CheckoutResult> {
  const secretKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY secret is not set. Add it in dashboard settings.');

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${secretKey}`,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      mode: 'payment',
      'line_items[0][quantity]': '1',
      'line_items[0][price_data][currency]': input.currency,
      'line_items[0][price_data][product_data][name]': input.description,
      'line_items[0][price_data][unit_amount]': String(Math.round(input.amount * 100)),
      'metadata[reference_id]': input.referenceId,
      'success_url': input.successUrl,
      'cancel_url': input.cancelUrl,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data?.url) {
    throw new Error(`Stripe checkout failed: ${data?.error?.message ?? JSON.stringify(data)}`);
  }
  return { checkoutUrl: data.url, provider: 'stripe', referenceId: input.referenceId };
}

// =============================================================================
// MAIN HANDLER
// =============================================================================
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { screen_id, campaign_id, start_date, end_date, slots } = body;

    // --- Validate required inputs ---
    if (!screen_id || !campaign_id || !start_date || !end_date) {
      return Response.json(
        { error: 'Missing required fields: screen_id, campaign_id, start_date, end_date' },
        { status: 400 }
      );
    }
    const slotsBooked = typeof slots === 'number' && slots > 0 ? slots : 1;

    // --- Parse dates (YYYY-MM-DD) ---
    const start = new Date(start_date + 'T00:00:00Z');
    const end = new Date(end_date + 'T00:00:00Z');
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
      return Response.json(
        { error: 'Invalid date range: end_date must be after start_date' },
        { status: 400 }
      );
    }

    // --- Idempotency: if a booking already exists for (campaign_id, screen_id, start_date), return it ---
    const existing = await base44.asServiceRole.entities.AdBooking.filter({
      campaign_id,
      screen_id,
      start_date,
    });
    if (existing.length > 0) {
      const booking = existing[0];
      return Response.json({ booking, checkout_url: booking.checkout_url, already_existed: true });
    }

    // --- Resolve the Screen (service role — we only need to read) ---
    const screen = await base44.asServiceRole.entities.Screen.get(screen_id);
    if (!screen) {
      return Response.json({ error: 'Screen not found' }, { status: 404 });
    }
    if (screen.org_id == null) {
      return Response.json({ error: 'Screen is not linked to an organization' }, { status: 409 });
    }

    // --- Resolve the owning Organization and snapshot its commission_rate NOW ---
    const org = await base44.asServiceRole.entities.Organization.get(screen.org_id);
    if (!org) {
      return Response.json({ error: 'Owning organization not found' }, { status: 404 });
    }
    const commissionRate = typeof org.commission_rate === 'number' ? org.commission_rate : 0;

    // --- SERVER-SIDE price computation: price_per_week × weeks × slots ---
    const pricePerWeek = typeof screen.price_per_week === 'number' && screen.price_per_week > 0
      ? screen.price_per_week
      : 0;
    if (pricePerWeek === 0) {
      return Response.json(
        { error: 'Screen does not have a valid price_per_week set' },
        { status: 400 }
      );
    }

    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const weeks = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / msPerWeek));
    const totalAmount = +(pricePerWeek * weeks * slotsBooked).toFixed(2);

    const platformFee = +(totalAmount * commissionRate / 100).toFixed(2);
    const venueEarnings = +(totalAmount - platformFee).toFixed(2);

    // --- Resolve campaign for advertiser_email denormalization (best-effort) ---
    let advertiserEmail = user.email;
    try {
      const campaign = await base44.asServiceRole.entities.Campaign.get(campaign_id);
      if (campaign && campaign.advertiser_email) {
        advertiserEmail = campaign.advertiser_email;
      }
    } catch (_) { /* non-fatal */ }

    // --- Create the pending AdBooking ---
    const booking = await base44.asServiceRole.entities.AdBooking.create({
      campaign_id,
      screen_id,
      advertiser_email: advertiserEmail,
      venue_owner_email: screen.owner_email || '',
      org_id: screen.org_id,
      start_date,
      end_date,
      slots_booked: slotsBooked,
      price_per_week: pricePerWeek,
      weeks,
      total_amount: totalAmount,
      commission_rate_snapshot: commissionRate,
      platform_fee: platformFee,
      venue_earnings: venueEarnings,
      status: 'pending_payment',
    });

    // --- Create checkout via the swappable payment abstraction ---
    const appUrl = Deno.env.get('APP_URL') || '';
    const successUrl = appUrl
      ? `${appUrl}/bookings?checkout=success&booking=${booking.id}`
      : `/bookings?checkout=success&booking=${booking.id}`;
    const cancelUrl = appUrl
      ? `${appUrl}/bookings?checkout=cancelled&booking=${booking.id}`
      : `/bookings?checkout=cancelled&booking=${booking.id}`;

    const checkout = await createCheckout({
      referenceId: booking.id,
      amount: totalAmount,
      currency: 'AED',
      description: `Ad booking: ${slotsBooked} slot(s) × ${weeks} week(s) on screen ${screen.name || screen_id}`,
      successUrl,
      cancelUrl,
    });

    // --- Persist the checkout URL on the booking ---
    await base44.asServiceRole.entities.AdBooking.update(booking.id, {
      checkout_url: checkout.checkoutUrl,
    });

    return Response.json({
      booking_id: booking.id,
      checkout_url: checkout.checkoutUrl,
      provider: checkout.provider,
      total_amount: totalAmount,
      commission_rate_snapshot: commissionRate,
      platform_fee: platformFee,
      venue_earnings: venueEarnings,
      already_existed: false,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});