import { useState } from "react";
import { Cpu, Plug, Wifi, QrCode } from "lucide-react";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import { SitePage, submitLead } from "@/components/site/Site";
import { PageHero, Block, FeatureGrid, CTABox, Btn, Field, inputCls, Select, FAQList, faqLd } from "@/components/site/inner";
import { PRICING, BOneBlock } from "@/components/site/sections";
import { Check, X } from "lucide-react";

const FAQS = [
  ["Do I need B.One?", "Only if your TV isn't smart. LG (webOS), Samsung (Tizen) and Android / Google TVs run our free player app, so they don't need it. Any other TV or monitor with an HDMI port works with B.One."],
  ["How long does setup take?", "About 5 minutes. Plug it into HDMI and power, connect Wi-Fi or a network cable, then scan the pairing card or enter the 6-digit code in the app."],
  ["What happens if the internet drops?", "B.One keeps playing the playlist it has already downloaded and catches up as soon as it's back online."],
  ["Can I control it remotely?", "Yes. Restart it, refresh content, blank the screen and take a screenshot of what's playing from the web portal or the mobile app."],
  ["Is there a monthly fee for the device?", `No. B.One is AED ${PRICING.bone} one-off. Your screen plan (free, AED ${PRICING.signageAds} or AED ${PRICING.signageOnly} a month) is separate.`],
  ["What if it stops working?", "It has a 12-month warranty. In Dubai we swap a faulty unit within 48 hours."],
  ["Is it free for partner venues?", "High-traffic partner venues can get B.One hardware free in exchange for a 60/40 or 50/50 ad revenue share. Ask us on WhatsApp."],
];

const COMPAT = [
  ["LG smart TV (webOS)", false],
  ["Samsung smart TV (Tizen)", false],
  ["Android TV / Google TV", false],
  ["Older TV or monitor with HDMI", true],
  ["Commercial display without an app store", true],
  ["Projector with HDMI input", true],
];

const SPECS = [
  ["Output", "Up to 4K, landscape or portrait"],
  ["Storage", "Caches your playlist — keeps playing offline"],
  ["Connectivity", "Wi-Fi 5, Ethernet, Bluetooth"],
  ["Remote control", "Restart, update and screenshot from the app"],
  ["Warranty", "12 months, swap within 48 h in Dubai"],
  ["Price", `AED ${PRICING.bone} one-off · no monthly fee for the device`],
];

function OrderForm() {
  const [f, setF] = useState({ name: "", phone: "", company: "", screens: "1", website: "" });
  const [err, setErr] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr({});
    try {
      await submitLead({ kind: "bone", type: "venue", ...f, message: `B.One order · ${f.screens} unit(s)` });
      setDone(true);
    } catch (x) {
      if (x.field) setErr({ [x.field]: x.message }); else toast.error(x.message);
    } finally { setBusy(false); }
  };
  if (done) return <div className="bg-[#ecfdf3] rounded-[20px] p-6 text-[#166534] font-medium">Thanks — we'll WhatsApp you within one working day to confirm delivery and payment.</div>;
  return (
    <form id="order" onSubmit={submit} className="bg-white border border-[#eceaf3] rounded-[24px] p-6 md:p-8 grid md:grid-cols-2 gap-4 scroll-mt-24">
      <input type="text" name="website" value={f.website} onChange={set("website")} className="hidden" tabIndex={-1} autoComplete="off" />
      <Field label="Full name" error={err.name}><input className={inputCls} value={f.name} onChange={set("name")} placeholder="Your name" /></Field>
      <Field label="Mobile (WhatsApp)" error={err.phone}><input className={inputCls} value={f.phone} onChange={set("phone")} placeholder="+971 5X XXX XXXX" inputMode="tel" /></Field>
      <Field label="Business name"><input className={inputCls} value={f.company} onChange={set("company")} placeholder="e.g. Bean & Co." /></Field>
      <Field label="How many players?"><Select value={f.screens} onChange={set("screens")}>{["1", "2", "3", "4", "5", "6–10", "10+"].map((n) => <option key={n}>{n}</option>)}</Select></Field>
      <div className="md:col-span-2 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
        <p className="text-[13px] text-[#6b6787]">AED {PRICING.bone} per player. We confirm delivery and payment on WhatsApp — nothing is charged now.</p>
        <Btn type="submit" disabled={busy}>{busy ? "Sending…" : `Order B.One · AED ${PRICING.bone}`}</Btn>
      </div>
    </form>
  );
}

export default function BOne() {
  return (
    <SitePage>
      <SEOHead title={`B.One media player — AED ${PRICING.bone} | BeyondWalls`} description="A small media player you plug into HDMI. Pre-loaded, self-install, made for 24/7 playback. Turn any TV into a smart screen." canonical="https://beyondwalls.linkzoneglobal.com/BOne" structuredData={[faqLd(FAQS), { "@context": "https://schema.org", "@type": "Product", name: "B.One media player", brand: { "@type": "Brand", name: "BeyondWalls" }, description: "Plug-in HDMI media player for digital signage. Up to 4K, Wi-Fi + Ethernet, offline caching, remote control.", offers: { "@type": "Offer", price: PRICING.bone, priceCurrency: "AED", availability: "https://schema.org/PreOrder" } }]} />
      <PageHero
        tag="The B.One player"
        title="Turn any TV into a smart screen."
        sub="A small media player you plug into HDMI. Pre-loaded, self-install, made for 24/7 playback."
        img="/site/bone.webp" imgAlt="B.One media player"
        actions={<><Btn href="#order">Order B.One · AED {PRICING.bone}</Btn><Btn kind="light" href="#specs">Specs</Btn></>}
      />
      <BOneBlock withHeader={false} />
      <Block tag="Do I need one?" title="Which screens need B.One" sub="Smart TVs use our free app. B.One is for everything else with an HDMI port." tone="soft">
        <div className="bg-white border border-[#eceaf3] rounded-[24px] divide-y divide-[#eceaf3]">
          {COMPAT.map(([t, need]) => (
            <div key={t} className="px-6 py-4 flex items-center justify-between gap-4">
              <p className="text-[15px] font-medium text-[#111027]">{t}</p>
              {need
                ? <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1ecff] text-[#5a2ded] px-3 py-1 text-[13px] font-semibold"><Check className="w-4 h-4" />Use B.One</span>
                : <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ecfdf3] text-[#16a34a] px-3 py-1 text-[13px] font-semibold"><X className="w-4 h-4" />Free app, no B.One</span>}
            </div>
          ))}
        </div>
      </Block>
      <Block tag="In the box" title="Everything to set it up yourself">
        <FeatureGrid cols={4} items={[
          [Cpu, "B.One player", "Quad-core player with cooling and 4K output"],
          [Plug, "Power & HDMI", "UAE plug, HDMI cable and wall mount"],
          [Wifi, "Wi-Fi + Ethernet", "Works on your venue Wi-Fi or a cable"],
          [QrCode, "Pairing card", "Scan to link it to your account in a minute"],
        ]} />
      </Block>
      <Block tag="Specs" title="Made to run all day" tone="grey">
        <div id="specs" className="bg-white border border-[#eceaf3] rounded-[24px] divide-y divide-[#eceaf3] scroll-mt-24">
          {SPECS.map(([k, v]) => (
            <div key={k} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
              <p className="sm:w-48 font-semibold text-[15px] text-[#111027]">{k}</p>
              <p className="text-[15px] text-[#6b6787]">{v}</p>
            </div>
          ))}
        </div>
      </Block>
      <Block tag="Order" title={`Order B.One — AED ${PRICING.bone}`} sub="Delivery across the UAE · setup guide in the box · WhatsApp support">
        <OrderForm />
      </Block>
      <FAQList items={FAQS} title="B.One questions" />
      <CTABox title="Already have a smart TV?" sub="Try the free app first — buy a B.One only if you need it." primary={{ label: "Get the TV app", to: "/HelpCenter" }} />
    </SitePage>
  );
}
