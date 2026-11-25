import { useState } from "react";
import { Upload, Rocket, Wallet, TrendingUp, BadgeDollarSign, LayoutDashboard, Globe, ShieldCheck, Briefcase, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import { SitePage, WHATSAPP, submitLead } from "@/components/site/Site";
import { PageHero, Block, FeatureGrid, FAQList, CTABox, Btn, Field, inputCls, Select, faqLd } from "@/components/site/inner";
import { PRICING } from "@/components/site/sections";

const FAQS = [
  ["Who is Connect for?", "UAE media owners and agencies that already run screens — in malls, buildings, gyms, clinics, hotels or retail — and want more advertisers on them. Agencies that only buy media can also manage several clients from one login."],
  ["How much do partners earn?", `You keep ${PRICING.connectShare}% of every booking Beyond Walls sells on your screens. Beyond Walls keeps ${100 - PRICING.connectShare}% for sales, payments, moderation and advertiser support.`],
  ["Is there a fee to join?", "No. There's no joining fee — we only earn when a booking plays on your screens."],
  ["Do I keep control?", "Yes. You choose which screens are listed, set the weekly price for each, and approve every ad before it plays."],
  ["How do screens connect?", "Install the Beyond Walls player on your screens (smart TV app or B.One), or talk to us about connecting your existing player for proof-of-play reporting."],
  ["When do I get paid?", "Earnings are tracked in real time and paid monthly to your company bank account."],
];

function ApplyForm() {
  const [f, setF] = useState({ name: "", company: "", phone: "", email: "", screens: "1–20", message: "", website: "" });
  const [err, setErr] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr({});
    try {
      await submitLead({ kind: "demo", type: "agency", ...f, message: `Connect partner application. ${f.message}` });
      setDone(true);
    } catch (x) {
      if (x.field) setErr({ [x.field]: x.message }); else toast.error(x.message);
    } finally { setBusy(false); }
  };
  if (done) {
    return (
      <div className="bg-white border border-[#eceaf3] rounded-[24px] p-8 flex flex-col items-center gap-3 text-center">
        <CheckCircle2 className="w-12 h-12 text-[#16a34a]" />
        <p className="font-bold text-[22px] text-[#111027]">Application received</p>
        <p className="text-[15px] text-[#6b6787]">We'll WhatsApp you within one working day to talk through your screens.</p>
      </div>
    );
  }
  return (
    <form id="apply" onSubmit={submit} className="bg-white border border-[#eceaf3] rounded-[24px] p-6 md:p-8 grid md:grid-cols-2 gap-4 scroll-mt-24">
      <input type="text" name="website" value={f.website} onChange={set("website")} className="hidden" tabIndex={-1} autoComplete="off" />
      <Field label="Full name" error={err.name}><input className={inputCls} value={f.name} onChange={set("name")} placeholder="Your name" autoComplete="name" /></Field>
      <Field label="Company"><input className={inputCls} value={f.company} onChange={set("company")} placeholder="e.g. Gulf Media Screens" autoComplete="organization" /></Field>
      <Field label="Mobile (WhatsApp)" error={err.phone}><input className={inputCls} value={f.phone} onChange={set("phone")} placeholder="+971 5X XXX XXXX" inputMode="tel" autoComplete="tel" /></Field>
      <Field label="Work email" error={err.email}><input className={inputCls} value={f.email} onChange={set("email")} placeholder="you@company.ae" type="email" autoComplete="email" /></Field>
      <Field label="How many screens?">
        <Select value={f.screens} onChange={set("screens")}>{["1–20", "21–100", "101–500", "500+", "None — we buy media"].map((o) => <option key={o}>{o}</option>)}</Select>
      </Field>
      <Field label="Where are they? (optional)"><input className={inputCls} value={f.message} onChange={set("message")} placeholder="e.g. 40 screens in Dubai malls" /></Field>
      <div className="md:col-span-2 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
        <p className="text-[13px] text-[#6b6787]">No joining fee. We'll only use this to contact you about Connect.</p>
        <Btn type="submit" disabled={busy}>{busy ? "Sending…" : "Apply to Connect"}</Btn>
      </div>
    </form>
  );
}

export default function Connect() {
  return (
    <SitePage>
      <SEOHead title={`Beyond Walls Connect — partner network for UAE screen owners | keep ${PRICING.connectShare}%`} description={`List your screens on the Beyond Walls marketplace and keep ${PRICING.connectShare}% of every booking we sell. For UAE media owners and agencies.`} canonical="https://beyondwalls.linkzoneglobal.com/Connect" structuredData={faqLd(FAQS)} />
      <PageHero
        tag="Beyond Walls Connect · for media owners & agencies"
        title={`Your screens. Our advertisers. You keep ${PRICING.connectShare}%.`}
        sub="Already run screens in malls, buildings, gyms or clinics? List them on the Beyond Walls marketplace and we bring you local advertisers who book online."
        img="/site/mall.webp" imgAlt="Screens in a UAE mall"
        actions={<><Btn href="#apply">Apply to Connect</Btn><Btn kind="light" href={WHATSAPP}>Talk on WhatsApp</Btn></>}
      />
      <Block tag="How it works" title="Three steps to more bookings">
        <FeatureGrid items={[
          [Upload, "1. Apply & connect", "Tell us about your screens. We help you install the Beyond Walls player or connect your existing setup."],
          [Rocket, "2. Go live on the map", "Your screens appear on the marketplace with the price and hours you set. You approve every ad."],
          [Wallet, "3. Earn monthly", `Advertisers pay online. You keep ${PRICING.connectShare}% of every booking, paid monthly to your bank.`],
        ]} />
      </Block>
      <Block tag="Why partner" title="A sales team for your screens, without the cost" tone="grey">
        <FeatureGrid items={[
          [TrendingUp, "New advertisers", "Reach small and mid-size UAE businesses that book screens online by the week."],
          [BadgeDollarSign, "No joining fee", "We only earn when a booking plays on your screens."],
          [LayoutDashboard, "One dashboard", "Bookings, approvals, proof of play, QR scans and earnings in one place."],
          [Globe, "Map listing", "Every screen shown with its location, venue type, hours and weekly price."],
          [ShieldCheck, "You stay in control", "Choose which screens to list, set prices, and approve or block advertisers."],
          [Briefcase, "For agencies too", "Manage several clients from one login, with client billing and white-label reports."],
        ]} />
      </Block>
      <Block tag="Apply" title="Join Beyond Walls Connect" sub="Tell us about your screens and we'll get back to you within one working day.">
        <ApplyForm />
      </Block>
      <FAQList items={FAQS} />
      <CTABox title="Questions before you apply?" sub="Talk to us on WhatsApp — Arabic and English, 9am–9pm." primary={{ label: "Chat on WhatsApp", href: WHATSAPP }} secondary={{ label: "See pricing", to: "/Pricing" }} />
    </SitePage>
  );
}
