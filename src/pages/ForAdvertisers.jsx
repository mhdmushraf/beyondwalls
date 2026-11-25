import { Link } from "react-router-dom";
import { MapPinned, Clock, QrCode, ShieldCheck } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { SitePage } from "@/components/site/Site";
import { PageHero, Block, FeatureGrid, CTABox, Btn } from "@/components/site/inner";
import { PRICING } from "@/components/site/sections";

const STEPS = [
  ["1. Find", "Filter by area, venue type, budget and time"],
  ["2. Upload", "Image or video — we check it fits every screen"],
  ["3. Pay", "Card or Apple Pay. Refund if a venue declines"],
  ["4. Track", "Plays, scans and cost per scan, live"],
];

export default function ForAdvertisers() {
  return (
    <SitePage>
      <SEOHead title="Advertise on venue screens in Dubai & the UAE | BeyondWalls" description={`Book screens in cafés, gyms and supermarkets on a map from AED ${PRICING.advertiseFrom} a week, and track results with QR scans.`} canonical="https://beyondwalls.linkzoneglobal.com/ForAdvertisers" />
      <PageHero
        tag="Local screen advertising"
        title="Be seen in the places your customers already are."
        sub={`Pick screens in cafés, gyms and supermarkets on a map, book from AED ${PRICING.advertiseFrom} a week, and track results with QR scans.`}
        img="/site/mall.webp" imgAlt="Ad screens in a UAE mall"
        actions={<><Btn to="/ScreenLocations">Find screens near me</Btn><Btn kind="light" href="#how">How it works</Btn></>}
      />
      <Block tag="Why it works" title="Built for local businesses, not media agencies">
        <FeatureGrid cols={4} items={[
          [MapPinned, "Book by map", "See every screen, the venue type, its hours and its weekly price before you pay."],
          [Clock, "Pick the hours", "Mornings at the gym, lunchtime at the café — only pay for the slots you want."],
          [QrCode, "Measurable", "Every ad gets a QR code. You see scans and cost per scan, not guesses."],
          [ShieldCheck, "Brand-safe", "Venues approve each ad. You're only charged when a screen says yes."],
        ]} />
      </Block>
      <Block tag="Simple steps" title="From idea to on-screen in a day" tone="grey">
        <div id="how" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 scroll-mt-24">
          {STEPS.map(([t, d]) => (
            <div key={t} className="bg-white border border-[#eceaf3] rounded-[20px] p-6 flex flex-col gap-2">
              <p className="font-bold text-[18px] text-[#5a2ded]">{t}</p>
              <p className="text-[15px] leading-[1.5] text-[#6b6787]">{d}</p>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {[
            ["Agencies & Connect partners", `Manage several clients from one login, with client billing and white-label reports. Partners keep ${PRICING.connectShare}% of what they sell.`, "/Connect"],
            ["Bigger budgets", "Talk to us about a planned campaign across a whole area or venue category.", "/Contact?type=advertiser"],
          ].map(([t, d, to]) => (
            <div key={t} className="bg-white border border-[#eceaf3] rounded-[20px] p-7 flex flex-col gap-2 items-start">
              <p className="font-bold text-[20px] text-[#111027]">{t}</p>
              <p className="text-[15px] leading-[1.5] text-[#6b6787]">{d}</p>
              <Link to={to} className="font-semibold text-[15px] text-[#5a2ded] mt-1">Talk to us →</Link>
            </div>
          ))}
        </div>
      </Block>
      <CTABox title="Find screens near your business" sub="Free to browse. Pay only when you book." primary={{ label: "Open the map", to: "/ScreenLocations" }} />
    </SitePage>
  );
}
