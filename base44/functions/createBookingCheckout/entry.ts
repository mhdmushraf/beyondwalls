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
// To activate: set PAYMENTS_PROVIDER = 'tap', add TAP_SECRET_KEY secret,
// then replace this stub with the fetch() call to Tap's /v2/charges endpoint.
async function createTapCheckout(_input: CreateCheckoutInput): Promise<CheckoutResult> {
  throw new Error(
    'Tap provider not configured. Set PAYMENTS_PROVIDER="tap", add TAP_SECRET_KEY secret, ' +
    'then implement the fetch call in createTapCheckout().'
  );
}

// --- Provider: Stripe Checkout ---
// To activate: set PAYMENTS_PROVIDER = 'stripe', add STRIPE_SECRET_KEY secret,
// then replace this stub with the fetch() call to Stripe's /v1/checkout/sessions endpoint.
async function createStripeCheckout(_input: CreateCheckoutInput): Promise<CheckoutResult> {
  throw new Error(
    'Stripe provider not configured. Set PAYMENTS_PROVIDER="stripe", add STRIPE_SECRET_KEY secret, ' +
    'then implement the fetch call in createStripeCheckout().'
  );
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