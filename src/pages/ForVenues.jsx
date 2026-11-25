import { Tag, BadgeDollarSign, CalendarClock, QrCode, ShieldCheck, BarChart3 } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { SitePage } from "@/components/site/Site";
import { PageHero, Block, FeatureGrid, SplitSteps, FAQList, CTABox, Btn, faqLd } from "@/components/site/inner";
import { PRICING, EarningsCalculator } from "@/components/site/sections";

const FAQS = [
  ["Do I need to buy new TVs?", "No. Any TV with HDMI works with a B.One player, and many Samsung, LG and Android TVs run our app directly."],
  ["Can I say no to an ad?", "Yes. Every ad needs your approval, and you can block categories or competitors."],
  ["What if my internet goes down?", "Screens keep playing the last downloaded playlist and catch up when they reconnect."],
  ["How much do I keep from ads?", `${PRICING.venueShare}% of every marketplace booking. Partner venues with free B.One hardware share 60/40 or 50/50. Advertisers you bring yourself carry only a ${PRICING.directDealFee}% fee.`],
];

export default function ForVenues() {
  return (
    <SitePage>
      <SEOHead title="For venues — digital signage that earns | BeyondWalls UAE" description={`Run menus, prices and promos on every TV from your phone, and keep ${PRICING.venueShare}% when brands book your spare slots. Free to list.`} canonical="https://beyondwalls.linkzoneglobal.com/ForVenues" structuredData={faqLd(FAQS)} />
      <PageHero
        tag="For cafés, gyms, clinics & shops"
        title="Your screens. Your menu. Plus rent from ads."
        sub="Run menus, prices and promos on every TV from your phone — and let nearby brands rent a few slots. You approve every ad."
        img="/site/cafe.webp" imgAlt="Café menu screen"
        actions={<><Btn to="/signup">List my venue free</Btn><Btn kind="light" to="/Pricing">See pricing</Btn></>}
      />
      <Block tag="What you get" title="Everything a screen needs, nothing it doesn't">
        <FeatureGrid items={[
          [Tag, "Live prices", "Change a price on your phone and every menu board updates in seconds."],
          [CalendarClock, "Playlists & schedules", "Breakfast menu at 7, lunch combos at 12, prayer times automatically."],
          [QrCode, "QR on every slide", "Offers, Google reviews and Instagram — and see which ones get scanned."],
          [BadgeDollarSign, "Ad earnings", `Keep ${PRICING.venueShare}% of ad revenue. Partner venues with free hardware: 60/40 or 50/50. Paid monthly to your bank.`],
          [ShieldCheck, "You approve every ad", "No competitors, no alcohol — set your rules once, review requests in one tap."],
          [BarChart3, "Reports that matter", "Uptime, plays, scans and which branch performs best."],
        ]} />
      </Block>
      <SplitSteps img="/site/bone.webp" imgAlt="B.One player" tag="Set up in an afternoon" title="Plug in, scan, done." steps={[
        "Sign up and upload your trade licence",
        "Plug in a B.One player or install the app on your smart TV",
        "Scan the pairing code with your phone",
        "Pick a template, add products, go live",
      ]} />
      <Block tag="Earnings" title="What could your screens earn?" sub="An estimate only. Real earnings depend on how many ads are booked near you — early on, it may be little or nothing." tone="soft">
        <EarningsCalculator defaults={{ screens: 3, slots: 6, booked: 30 }} />
      </Block>
      <FAQList items={FAQS} />
      <CTABox title="List your venue free" sub="No contract. Cancel any time." />
    </SitePage>
  );
}
