import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { getSessionUser, logActivity } from "../../shared/portalAuth.ts";
import { notifyUsers } from "../../shared/notify.ts";
import { addDays, dubaiToday, isBookable, isDemoVenue, isDemoViewer, list, loadSettings, r2, screenPrice } from "../../shared/marketplace.ts";

/**
 * Make-an-offer on a screen's weekly price.
 *  create  { org_id, screen_id, price_per_week, start_date, days, message? }   advertiser → venue
 *  respond { offer_id, decision: 'accept'|'decline'|'counter', price_per_week?, message? }
 *          Whoever did NOT make the last move answers. A counter flips the turn.
 *  withdraw { offer_id }                                                       advertiser only
 *  list    { org_id }                                                          offers for one business (either side)
 * An accepted price is honoured by marketplaceBook for 7 days (use_by).
 */
const bad = (error: string, status = 400) => Response.json({ error }, { status });
const MIN_PCT = 30;          // offers below 30% of the list price are refused
const PENDING_HOURS = 48;    // unanswered offers expire
const USE_DAYS = 7;          // accepted price is valid this long

export default async function (req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await getSessionUser(base44);
    if (!user) return bad("Your session has ended. Sign in again.", 401);
    const body = await req.json().catch(() => ({}));
    const svc = base44.asServiceRole.entities;
    const now = new Date();
    const action = String(body.action || "");

    const expireIfDue = async (o: any) => {
      if (o.status === "pending" && o.expires_at && Date.parse(o.expires_at) < now.getTime()) {
        await svc.Offer.update(o.id, { status: "expired" });
        return { ...o, status: "expired" };
      }
      if (o.status === "accepted" && o.use_by && o.use_by < dubaiToday()) {
        await svc.Offer.update(o.id, { status: "expired" });
        return { ...o, status: "expired" };
      }
      return o;
    };

    if (action === "list") {
      const orgId = String(body.org_id || "");
      const org = await svc.Organization.get(orgId).catch(() => null);
      if (!org || (!(org.member_user_ids || []).includes(user.id) && user.role !== "admin")) return bad("You're not a member of this business.", 403);
      const mine = [
        ...list(await svc.Offer.filter({ advertiser_org_id: orgId }, { sort: "-updated_date", limit: 200 })),
        ...list(await svc.Offer.filter({ venue_org_id: orgId }, { sort: "-updated_date", limit: 200 })),
      ];
      const out = [];
      for (const o of mine) out.push(await expireIfDue(o));
      return Response.json({ offers: out });
    }

    if (action === "create") {
      const org = await svc.Organization.get(String(body.org_id || "")).catch(() => null);
      if (!org) return bad("Pick the business you are making the offer for.", 404);
      const members: string[] = org.member_user_ids || [];
      if (!members.includes(user.id) && user.role !== "admin") return bad("You're not a member of this business.", 403);
      if (org.status === "suspended" || org.status === "rejected") return bad("This business can't make offers right now.", 403);

      const screen = await svc.Screen.get(String(body.screen_id || "")).catch(() => null);
      const venue = screen ? await svc.Venue.get(screen.venue_id).catch(() => null) : null;
      if (!screen || !isBookable(screen, venue) || (isDemoVenue(venue) && !(await isDemoViewer(base44, svc)))) return bad("This screen isn't taking bookings right now.", 409);
      if (screen.accept_offers === false) return bad("This venue only takes the listed price for this screen.", 409);
      if (venue.org_id === org.id) return bad("You can't make an offer on your own screen.");

      const settings = await loadSettings(svc);
      const listPrice = screenPrice(screen, settings);
      const price = r2(Number(body.price_per_week));
      if (!(price > 0)) return bad("Enter your price per week.");
      if (price >= listPrice) return bad(`That's at or above the listed AED ${listPrice}/week — just book it at the listed price.`);
      const floor = Math.max(r2((listPrice * MIN_PCT) / 100), Number(screen.offer_floor_per_week) || 0);
      if (price < floor) return bad(`Offers on this screen start at AED ${floor}/week.`);

      const start = String(body.start_date || "");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || start < dubaiToday()) return bad("Pick a start date from today on.");
      const days = Math.round(Number(body.days));
      if (!(days >= 1 && days <= 84)) return bad("Offer for between 1 day and 12 weeks.");

      const open = list(await svc.Offer.filter({ screen_id: screen.id, advertiser_org_id: org.id, status: "pending" }, { limit: 5 }));
      for (const o of open) if ((await expireIfDue(o)).status === "pending") return bad("You already have an open offer on this screen. Wait for the reply or withdraw it.", 409);

      const msg = String(body.message || "").trim().slice(0, 500);
      const venueMembers: string[] = venue.org_member_user_ids || [];
      const offer = await svc.Offer.create({
        screen_id: screen.id, screen_name: screen.name, venue_id: venue.id, venue_name: venue.name, venue_org_id: venue.org_id, venue_member_user_ids: venueMembers,
        advertiser_org_id: org.id, advertiser_org_name: org.name, advertiser_member_user_ids: members, advertiser_email: user.email,
        list_price_per_week: listPrice, price_per_week: price, last_by: "advertiser", start_date: start, days, message: msg,
        status: "pending", expires_at: new Date(now.getTime() + PENDING_HOURS * 3600000).toISOString(),
        history: [{ by: "advertiser", price, at: now.toISOString(), note: msg }],
      });
      await notifyUsers(svc, venueMembers, {
        type: "offer", org_id: venue.org_id, link: "/app/offers", reference_id: offer.id,
        title: `Offer · AED ${price}/week for ${screen.name}`,
        message: `${org.name} offers AED ${price}/week (you list AED ${listPrice}) for ${days} days from ${start}. Accept, counter or decline within 48 h.`,
      });
      await logActivity(base44, { orgId: org.id, memberIds: members, userEmail: user.email, action: "offer_made", targetType: "Offer", targetId: offer.id, details: `${screen.name} · AED ${price}/wk` });
      return Response.json({ offer });
    }

    const offer0 = await svc.Offer.get(String(body.offer_id || "")).catch(() => null);
    if (!offer0) return bad("We couldn't find that offer.", 404);
    const offer = await expireIfDue(offer0);
    const isAdv = (offer.advertiser_member_user_ids || []).includes(user.id);
    const isVenue = (offer.venue_member_user_ids || []).includes(user.id);
    if (!isAdv && !isVenue && user.role !== "admin") return bad("This offer isn't for your business.", 403);

    if (action === "withdraw") {
      if (!isAdv) return bad("Only the advertiser can withdraw an offer.", 403);
      if (offer.status !== "pending" && offer.status !== "accepted") return bad(`This offer is already ${offer.status}.`, 409);
      await svc.Offer.update(offer.id, { status: "withdrawn", history: [...(offer.history || []), { by: "advertiser", price: offer.price_per_week, at: now.toISOString(), note: "withdrawn" }] });
      await notifyUsers(svc, offer.venue_member_user_ids || [], { type: "offer", org_id: offer.venue_org_id, link: "/app/offers", reference_id: offer.id, title: "Offer withdrawn", message: `${offer.advertiser_org_name} withdrew their offer on ${offer.screen_name}.` });
      return Response.json({ offer: { ...offer, status: "withdrawn" } });
    }

    if (action === "respond") {
      if (offer.status !== "pending") return bad(offer.status === "expired" ? "This offer has expired." : `This offer is already ${offer.status}.`, 409);
      const side = offer.last_by === "advertiser" ? "venue" : "advertiser";
      if ((side === "venue" && !isVenue && user.role !== "admin") || (side === "advertiser" && !isAdv)) return bad("It's the other side's turn to answer.", 409);
      const decision = String(body.decision || "");
      const note = String(body.message || "").trim().slice(0, 500);
      const hist = [...(offer.history || [])];
      const toIds = side === "venue" ? offer.advertiser_member_user_ids || [] : offer.venue_member_user_ids || [];
      const toOrg = side === "venue" ? offer.advertiser_org_id : offer.venue_org_id;
      const who = side === "venue" ? offer.venue_name : offer.advertiser_org_name;

      if (decision === "accept") {
        const useBy = addDays(dubaiToday(), USE_DAYS);
        hist.push({ by: side, price: offer.price_per_week, at: now.toISOString(), note: note || "accepted" });
        const upd = { status: "accepted", accepted_at: now.toISOString(), use_by: useBy, history: hist };
        await svc.Offer.update(offer.id, upd);
        await notifyUsers(svc, toIds, {
          type: "offer", org_id: toOrg, link: "/app/offers", reference_id: offer.id,
          title: `Offer accepted · AED ${offer.price_per_week}/week`,
          message: side === "venue" ? `${who} accepted AED ${offer.price_per_week}/week on ${offer.screen_name}. Book it by ${useBy} to keep this price.` : `${who} accepted your AED ${offer.price_per_week}/week on ${offer.screen_name}. They'll book by ${useBy}.`,
        });
        return Response.json({ offer: { ...offer, ...upd } });
      }
      if (decision === "decline") {
        hist.push({ by: side, price: offer.price_per_week, at: now.toISOString(), note: note || "declined" });
        await svc.Offer.update(offer.id, { status: "declined", history: hist });
        await notifyUsers(svc, toIds, { type: "offer", org_id: toOrg, link: "/app/offers", reference_id: offer.id, title: "Offer declined", message: `${who} declined AED ${offer.price_per_week}/week on ${offer.screen_name}.${note ? ` “${note}”` : ""}` });
        return Response.json({ offer: { ...offer, status: "declined", history: hist } });
      }
      if (decision === "counter") {
        const price = r2(Number(body.price_per_week));
        const listPrice = Number(offer.list_price_per_week) || 0;
        if (!(price > 0)) return bad("Enter your counter price per week.");
        if (listPrice && price > listPrice) return bad(`A counter can't be above the listed AED ${listPrice}/week.`);
        if (price === offer.price_per_week) return bad("That's the same price — accept it instead.");
        if (side === "venue" && price < offer.price_per_week) return bad("Your counter should be higher than their offer.");
        if (side === "advertiser" && price > offer.price_per_week) return bad("Your counter should be lower than their price — or accept it.");
        if (hist.length >= 6) return bad("That's enough rounds — accept or decline this price.");
        hist.push({ by: side, price, at: now.toISOString(), note });
        const upd = { price_per_week: price, last_by: side, expires_at: new Date(now.getTime() + PENDING_HOURS * 3600000).toISOString(), history: hist };
        await svc.Offer.update(offer.id, upd);
        await notifyUsers(svc, toIds, { type: "offer", org_id: toOrg, link: "/app/offers", reference_id: offer.id, title: `Counter offer · AED ${price}/week`, message: `${who} countered with AED ${price}/week on ${offer.screen_name}.${note ? ` “${note}”` : ""} Reply within 48 h.` });
        return Response.json({ offer: { ...offer, ...upd } });
      }
      return bad("Accept, decline or counter.");
    }

    return bad("Unknown action.");
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}
