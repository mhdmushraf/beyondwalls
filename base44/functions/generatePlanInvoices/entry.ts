import { createClientFromRequest } from "npm:@base44/sdk@0.8.54";

/**
 * Admin only: create one monthly "plans" invoice per business for a period (YYYY-MM).
 * Lines come from the business's screens and their mode; prices from PlatformSettings.
 * Businesses that already have a plans invoice for the period are skipped.
 */
function list(page: any) {
  return Array.isArray(page) ? page : page?.items || [];
}
const r2 = (n: number) => Math.round(n * 100) / 100;

export default async function (req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user || user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const now = new Date();
    const period = /^\d{4}-\d{2}$/.test(body.period || "")
      ? body.period
      : `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    const dryRun = Boolean(body.dry_run);

    const svc = base44.asServiceRole.entities;
    const settings = list(await svc.PlatformSettings.filter({ key: "main" }, { limit: 1 }))[0] || {};
    const price = {
      signage_ads: Number(settings.price_signage_ads ?? 15),
      signage_only: Number(settings.price_signage_only ?? 29),
      ads_only: Number(settings.price_ads_only ?? 0),
    };
    const vatPct = Number(settings.vat_pct ?? 5);
    const prefix = settings.invoice_prefix || "BW";

    const [orgs, screens, existing] = await Promise.all([
      svc.Organization.filter({ status: "approved" }, { limit: 500 }).then(list),
      svc.Screen.list({ limit: 2000 }).then(list),
      svc.Invoice.filter({ period, kind: "plans" }, { limit: 1000 }).then(list),
    ]);
    const done = new Set(existing.map((i: any) => i.org_id));
    const all = list(await svc.Invoice.list({ limit: 5000 }));
    let seq = all.filter((i: any) => String(i.number || "").startsWith(`${prefix}-${period.replace("-", "")}`)).length;

    const labels: Record<string, [string, string]> = {
      signage_ads: ["Screen plan · Signage + Ads", "باقة الشاشة · لافتات + إعلانات"],
      signage_only: ["Screen plan · Signage only", "باقة الشاشة · لافتات فقط"],
      ads_only: ["Screen plan · Ads only", "باقة الشاشة · إعلانات فقط"],
    };

    const created: any[] = [];
    const skipped: any[] = [];
    for (const org of orgs) {
      const mine = screens.filter((s: any) => s.org_id === org.id && s.status !== "inactive");
      if (!mine.length) continue;
      if (done.has(org.id)) { skipped.push({ org: org.name, reason: "already invoiced" }); continue; }
      const lines: any[] = [];
      for (const mode of ["signage_ads", "signage_only", "ads_only"]) {
        const qty = mine.filter((s: any) => (s.mode || "signage_ads") === mode).length;
        if (!qty) continue;
        const unit = price[mode as keyof typeof price];
        lines.push({ description: labels[mode][0], description_ar: labels[mode][1], qty, unit_price: unit, amount: r2(qty * unit) });
      }
      const subtotal = r2(lines.reduce((s, l) => s + l.amount, 0));
      if (subtotal <= 0) { skipped.push({ org: org.name, reason: "nothing to bill" }); continue; }
      const vat = r2((subtotal * vatPct) / 100);
      seq += 1;
      const issued = new Date();
      const due = new Date(issued.getTime() + 14 * 86400000);
      const invoice = {
        org_id: org.id,
        org_member_user_ids: org.member_user_ids || [],
        org_name: org.name,
        number: `${prefix}-${period.replace("-", "")}-${String(seq).padStart(4, "0")}`,
        period, kind: "plans", lines, subtotal, vat_pct: vatPct, vat, total: r2(subtotal + vat), currency: "AED",
        status: "issued", issued_at: issued.toISOString(), due_at: due.toISOString(),
      };
      if (!dryRun) await svc.Invoice.create(invoice);
      created.push({ org: org.name, number: invoice.number, total: invoice.total });
    }

    return Response.json({ period, dry_run: dryRun, created, skipped });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}
