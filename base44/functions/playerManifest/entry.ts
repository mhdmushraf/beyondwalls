import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";
import { resolveMediaUrl, resolvePlayerScreen } from "../../shared/portalAuth.ts";

/**
 * Public: the server builds the ready-to-play list for a paired device.
 * Order of precedence:
 *   1. a live UrgentMessage for this screen (returned as `urgent`, shown over everything)
 *   2. the newest active Playlist for this screen whose day/time window matches now (Asia/Dubai)
 *   3. a MenuBoard assigned directly to this screen (inside its show window)
 *   4. the legacy owner slots on the Screen record
 * URLs are signed here because the player has no app session.
 */

function dubaiNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dubai", hour: "2-digit", minute: "2-digit", weekday: "short", hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return { hm: `${get("hour").replace("24", "00")}:${get("minute")}`, dow: days.indexOf(get("weekday")) };
}

function inWindow(from?: string, until?: string, hm?: string) {
  if (!from && !until) return true;
  const f = from || "00:00";
  const u = until || "24:00";
  if (f <= u) return hm! >= f && hm! < u;
  return hm! >= f || hm! < u; // overnight window
}

function list(page: any) {
  return Array.isArray(page) ? page : page?.items || [];
}

export default async function (req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const token = String(body.device_token || "").trim();
    if (!token) return Response.json({ error: "device_token is required" }, { status: 400 });

    const resolved = await resolvePlayerScreen(base44, token);
    if (!resolved) return Response.json({ error: "screen_moved" }, { status: 409 });
    const { screen } = resolved;
    const svc = base44.asServiceRole.entities;
    const { hm, dow } = dubaiNow();
    const nowIso = new Date().toISOString();

    // Filter by business, then by screen in code (array membership).
    const org = screen.org_id || "__none__";
    const onScreen = (r: any) => (r.screen_ids || []).includes(screen.id);
    const [urgentAll, playlistAll, menuAll, qrAll] = await Promise.all([
      svc.UrgentMessage.filter({ org_id: org, status: "live" }, { sort: "-created_date", limit: 50 }),
      svc.Playlist.filter({ org_id: org }, { sort: "-updated_date", limit: 100 }),
      svc.MenuBoard.filter({ org_id: org }, { sort: "-updated_date", limit: 100 }),
      svc.QRCode.filter({ org_id: org }, { sort: "-updated_date", limit: 50 }),
    ]);
    const qr = list(qrAll).find((q: any) => onScreen(q) && q.is_active !== false && q.target_url) || null;
    const urgentPage = list(urgentAll).filter(onScreen);
    const playlistPage = list(playlistAll).filter((p: any) => onScreen(p) && p.is_active !== false);
    const menuPage = list(menuAll).filter(onScreen);

    const urgent = list(urgentPage).find((m: any) =>
      (!m.starts_at || m.starts_at <= nowIso) && (!m.ends_at || m.ends_at > nowIso)) || null;

    const playlist = list(playlistPage).find((p: any) => {
      const days = p.days_of_week || [];
      if (days.length && !days.includes(dow)) return false;
      return inWindow(p.start_time, p.end_time, hm) && (p.items || []).length > 0;
    });

    const menuCache: Record<string, any> = {};
    const loadMenu = async (id: string) => {
      if (!(id in menuCache)) menuCache[id] = await svc.MenuBoard.get(id).catch(() => null);
      return menuCache[id];
    };
    const menuPayload = (m: any) => m && ({
      id: m.id, name: m.name, name_ar: m.name_ar, layout: m.layout, theme: m.theme, currency: m.currency,
      photo_url: m.photo_url, items: (m.items || []).filter((i: any) => !i.sold_out),
    });

    let items: any[] = [];
    let source = "slots";

    if (playlist) {
      source = `playlist:${playlist.id}`;
      let n = 0;
      for (const it of playlist.items || []) {
        n += 1;
        const itemId = it.id || `p${n}`;
        if (it.kind === "menu" && it.menu_board_id) {
          const m = await loadMenu(it.menu_board_id);
          if (m) items.push({ id: itemId, kind: "menu", menu: menuPayload(m), duration: Number(it.duration) || 20 });
        } else if (it.url) {
          const url = await resolveMediaUrl(base44, it.url);
          if (url) items.push({ id: itemId, kind: "media", url, type: it.type || "image", duration: Number(it.duration) || 10 });
        }
      }
    }

    if (!items.length) {
      const boards = list(menuPage).filter((m: any) => inWindow(m.show_from, m.show_until, hm));
      if (boards.length) {
        source = "menus";
        items = boards.map((m: any) => ({ id: `menu-${m.id}`, kind: "menu", menu: menuPayload(m), duration: 30 }));
      }
    }

    if (!items.length) {
      for (let i = 1; i <= 6; i += 1) {
        const raw = screen[`owner_slot_${i}_url`];
        if (!raw) continue;
        const url = await resolveMediaUrl(base44, raw);
        if (url) items.push({ id: `slot-${i}`, kind: "media", url, type: screen[`owner_slot_${i}_type`] || "image", duration: screen.slot_duration || 30 });
      }
    }

    // Marketplace ads: paid bookings with an approved ad, inside their dates (Dubai day).
    let adCount = 0;
    if ((screen.mode || "signage_ads") !== "signage_only") {
      const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai" }).format(new Date());
      const booked = list(await svc.AdBooking.filter({ screen_id: screen.id, status: "active" }, { limit: 50 }))
        .filter((b: any) => b.creative_status === "approved" && b.creative_url && b.start_date <= today && b.end_date >= today);
      const ads: any[] = [];
      for (const b of booked) {
        const url = await resolveMediaUrl(base44, b.creative_url);
        if (url) ads.push({ id: `ad-${b.id}`, kind: "media", url, type: b.creative_type || "image", duration: Number(screen.slot_duration) || 15, ad: true, booking_id: b.id });
      }
      adCount = ads.length;
      if (ads.length) {
        if (!items.length || (screen.mode || "") === "ads_only") {
          items = [...ads, ...items];
        } else {
          // One ad after every two of the venue's own items, cycling through the ads.
          const mixed: any[] = [];
          let a = 0;
          items.forEach((it, i) => {
            mixed.push(it);
            if (i % 2 === 1) { const ad = ads[a % ads.length]; mixed.push({ ...ad, id: `${ad.id}-${a}` }); a += 1; }
          });
          while (a < ads.length) { mixed.push({ ...ads[a], id: `${ads[a].id}-${a}` }); a += 1; }
          items = mixed;
        }
      }
    }

    return Response.json({
      ads: adCount,
      screen: {
        id: screen.id,
        name: screen.name,
        orientation: screen.orientation || "landscape",
        width_px: screen.width_px || 1920,
        height_px: screen.height_px || 1080,
        display_mode: screen.display_mode || "fit",
        mode: screen.mode || "signage_ads",
        slot_duration: screen.slot_duration || 30,
      },
      source,
      items,
      urgent: urgent && {
        id: urgent.id, text_en: urgent.text_en, text_ar: urgent.text_ar, subtext: urgent.subtext,
        style: urgent.style, ends_at: urgent.ends_at, sound: urgent.sound,
      },
      qr: qr && { id: qr.id, label: qr.label || "", position: qr.position || "bottom_right" },
      house: {
        title: "Advertise here",
        subtitle: "beyondwalls.ae",
      },
      server_time: nowIso,
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}
