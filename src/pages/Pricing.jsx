import { Link } from "react-router-dom";
import { Check, Cpu, Handshake } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { SitePage, GRAD } from "@/components/site/Site";
import { Block, Tag, FAQList, CTABox, faqLd, wrap } from "@/components/site/inner";
import { PRICING, EarningsCalculator } from "@/components/site/sections";

const PLANS = [
  { name: "Ads only", price: "Free", per: "", desc: `Screen plays ads you approve. You keep ${PRICING.venueShare}% of revenue.`, items: ["Ad marketplace", "Approve every ad", "Monthly payouts"], cta: "Choose" },
  { name: "Signage + Ads", price: `AED ${PRICING.signageAds}`, was: `AED ${PRICING.signageAdsWas}`, per: "per screen / month", items: ["Menus, prices, playlists", "QR codes & reports", "Ad marketplace + earnings", "Fees taken from earnings first"], cta: "Start free", hot: true },
  { name: "Signage only", price: `AED ${PRICING.signageOnly}`, was: `AED ${PRICING.signageOnlyWas}`, per: "per screen / month", items: ["Menus, prices, playlists", "QR codes & reports", "No ads on your screens"], cta: "Choose" },
];

const FAQS = [
  ["Is there a contract?", "No. Pay monthly, cancel any time. Founding prices stay for 12 months."],
  ["How do fees get paid?", "Screen fees come out of your ad earnings first. If earnings don't cover it, we charge the card on file."],
  ["What does an advertiser pay?", `Each venue sets its weekly price per screen, from AED ${PRICING.advertiseFrom}. The venue keeps ${PRICING.venueShare}%. Deals a venue brings itself carry a ${PRICING.directDealFee}% fee.`],
  ["Is VAT included?", "Prices exclude 5% VAT."],
];

export default function Pricing() {
  return (
    <SitePage>
      <SEOHead title={`Pricing — from free, AED ${PRICING.signageAds}/screen | BeyondWalls`} description={`Ads only: free, keep ${PRICING.venueShare}%. Signage + Ads: AED ${PRICING.signageAds} per screen per month. Signage only: AED ${PRICING.signageOnly}. B.One player AED ${PRICING.bone}.`} canonical="https://beyondwalls.linkzoneglobal.com/Pricing" structuredData={faqLd(FAQS)} />
      <section className="bg-[#fbfaff]">
        <div className={`${wrap} py-14 lg:py-20 flex flex-col gap-10`}>
          <div className="flex flex-col gap-4 items-start">
            <Tag>Founding venue pricing</Tag>
            <h1 className="font-bold text-[40px] md:text-[56px] leading-[1.1] tracking-[-1.68px] text-[#111027]">Simple pricing per screen</h1>
            <p className="text-[17px] md:text-[19px] text-[#6b6787]">Founding prices are locked for 12 months for venues that join now.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 items-stretch">
            {PLANS.map((p) => (
              <div key={p.name} className={`relative rounded-[24px] p-7 flex flex-col gap-4 ${p.hot ? "text-white shadow-[0_20px_50px_rgba(90,45,237,0.3)]" : "bg-white border border-[#eceaf3]"}`} style={p.hot ? { backgroundImage: GRAD } : undefined}>
                {p.hot && <span className="absolute top-6 right-6 bg-white/20 rounded-full px-3 py-1 text-[12px] font-semibold">Most popular</span>}
                <p className={`font-bold text-[18px] ${p.hot ? "" : "text-[#111027]"}`}>{p.name}</p>
                <div>
                  <div className="flex items-baseline gap-2.5">
                    <p className={`font-bold text-[44px] tracking-[-1.32px] ${p.hot ? "" : "text-[#111027]"}`}>{p.price}</p>
                    {p.was && <p className={`text-[18px] line-through ${p.hot ? "text-[#d8ccff]" : "text-[#a39fb8]"}`}>{p.was}</p>}
                  </div>
                  {p.per && <p className={`text-[14px] ${p.hot ? "text-[#ede7ff]" : "text-[#6b6787]"}`}>{p.per}</p>}
                </div>
                {p.desc && <p className="text-[14px] text-[#6b6787]">{p.desc}</p>}
                <div className="flex flex-col gap-2.5 flex-1">
                  {p.items.map((i) => (
                    <p key={i} className={`flex items-center gap-2 text-[14px] font-medium ${p.hot ? "" : "text-[#111027]"}`}><Check className={`w-4 h-4 ${p.hot ? "" : "text-[#6f3ffd]"}`} />{i}</p>
                  ))}
                </div>
                <Link to="/signup" className={`text-center rounded-xl py-3.5 font-semibold text-[15px] ${p.hot ? "bg-white text-[#5a2ded]" : "border border-[#eceaf3] text-[#111027] hover:bg-[#f7f5fd]"}`}>{p.cta}</Link>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <Link to="/BOne" className="bg-white border border-[#eceaf3] rounded-[20px] p-6 flex gap-4 items-start hover:border-[#6f3ffd]">
              <span className="bg-[#f1ecff] rounded-xl p-2.5"><Cpu className="w-[22px] h-[22px] text-[#5a2ded]" /></span>
              <div><p className="font-bold text-[18px] text-[#111027]">B.One player</p><p className="text-[15px] text-[#6b6787]">AED {PRICING.bone} one-off — optional if your TV runs our app</p></div>
            </Link>
            <Link to="/Contact?type=venue" className="bg-white border border-[#eceaf3] rounded-[20px] p-6 flex gap-4 items-start hover:border-[#6f3ffd]">
              <span className="bg-[#f1ecff] rounded-xl p-2.5"><Handshake className="w-[22px] h-[22px] text-[#5a2ded]" /></span>
              <div><p className="font-bold text-[18px] text-[#111027]">Partner venues</p><p className="text-[15px] text-[#6b6787]">High-traffic sites: free B.One hardware with a 60/40 or 50/50 share</p></div>
            </Link>
          </div>
        </div>
      </section>
      <Block tag="Earnings calculator" title="What could your screens earn?" sub="An estimate only. Real earnings depend on how many ads are booked near you — early on, it may be little or nothing." tone="grey">
        <EarningsCalculator defaults={{ screens: 3, slots: 6, booked: 30 }} />
      </Block>
      <FAQList items={FAQS} />
      <CTABox title="Start with one screen" sub="Most venues test one screen for a month before adding more." />
    </SitePage>
  );
}
