import { ShieldCheck, BarChart3, MapPin } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { SitePage, WHATSAPP } from "@/components/site/Site";
import { PageHero, Block, FeatureGrid, Btn, Tag, wrap } from "@/components/site/inner";

const PROGRESS = [
  ["Product", "Venue, advertiser and admin portals, mobile app and TV player in build"],
  ["Hardware", "B.One player ready for self-install pilots"],
  ["Licence", "Dubai Development Authority licence in place"],
  ["Next milestone", "10 paying or trial screens before scaling sales"],
];

export default function About() {
  return (
    <SitePage>
      <SEOHead title="About BeyondWalls — Linkzone Global FZ-LLC, Dubai" description="Beyond Walls helps small venues run their screens and earn from them, and helps local brands reach people nearby. Built in Dubai by Linkzone Global FZ-LLC." canonical="https://beyondwalls.linkzoneglobal.com/About" />
      <PageHero
        tag="About Beyond Walls"
        title="Screens should work for the business that owns them."
        sub="Beyond Walls is built by Linkzone Global FZ-LLC in Dubai. We help small venues run their screens and earn from them, and help local brands reach people nearby."
        img="/site/v-restaurant.webp" imgAlt="Venue screen in Dubai"
        actions={<><Btn to="/Contact">Talk to us</Btn><Btn kind="light" href="#investors">Investors</Btn></>}
      />
      <Block tag="What we believe" title="Principles we build by">
        <FeatureGrid items={[
          [ShieldCheck, "Venues stay in control", "Nothing plays on a venue's screen without the owner's approval."],
          [BarChart3, "Honest numbers", "We report plays and scans we can measure. We don't invent reach."],
          [MapPin, "Local first", "Built for UAE businesses — Arabic, AED, WhatsApp support."],
        ]} />
      </Block>
      <section className="bg-[#f6f5fa]">
        <div className={`${wrap} py-16 lg:py-24 flex flex-col gap-5 items-start max-w-[1440px]`}>
          <Tag>Founder</Tag>
          <h2 className="font-bold text-[32px] md:text-[40px] leading-[1.1] tracking-[-1.2px] text-[#111027]">Muhammed Musharaf Abdulla</h2>
          <p className="text-[17px] leading-[1.6] text-[#6b6787] max-w-[760px]">Grew up in Dubai's wholesale markets in Deira and spent years in FMCG distribution, finance and systems. Started Beyond Walls after seeing how many shop screens sit idle or show the wrong price.</p>
          <div className="flex flex-wrap gap-2">
            {["Linkzone Global FZ-LLC", "in5 Dubai", "DDA licensed"].map((t) => <span key={t} className="bg-white border border-[#eceaf3] rounded-full px-3.5 py-1.5 text-[13px] font-semibold text-[#111027]">{t}</span>)}
          </div>
        </div>
      </section>
      <Block tag="For investors" title="Where we are, honestly" sub="We share real progress only. Ask us for the latest numbers and the deck.">
        <div id="investors" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 scroll-mt-24">
          {PROGRESS.map(([k, v]) => (
            <div key={k} className="bg-white border border-[#eceaf3] rounded-[20px] p-6 flex flex-col gap-2">
              <p className="font-semibold text-[13px] text-[#6f3ffd] uppercase tracking-wide">{k}</p>
              <p className="text-[16px] leading-[1.5] text-[#111027] font-medium">{v}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <Btn to="/Contact?topic=investor">Request the deck</Btn>
          <Btn kind="light" href={WHATSAPP}>Book a call</Btn>
        </div>
      </Block>
    </SitePage>
  );
}
