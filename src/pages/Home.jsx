import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { SitePage, DarkHero, StoreBadges, GradButton, FinalCTA } from "@/components/site/Site";
import {
  PRICING, ProofStrip, FourSteps, TwoBusinesses, VenueTypes, ForAdvertisersBlock, ForVenueOwnersBlock,
  VenuesGrid, BOneBlock, PricingBlock, TrustStrip, FAQ, faqSchema,
} from "@/components/site/sections";

function FloatCard({ className, children }) {
  return <div className={`absolute bg-white/[0.92] backdrop-blur rounded-[18px] px-4 py-3.5 shadow-[0_10px_30px_rgba(31,20,77,0.2)] ${className}`}>{children}</div>;
}

export default function Home() {
  return (
    <SitePage darkHero>
      <SEOHead
        title="BeyondWalls — Signage that pays you | Screen advertising UAE"
        description={`Run menus, prices and promos on any TV, then sell spare slots to advertisers and keep ${PRICING.venueShare}%. Advertise on venue screens across the UAE from AED ${PRICING.advertiseFrom}/week.`}
        canonical="https://beyondwalls.ae"
        structuredData={[
          { "@context": "https://schema.org", "@type": "Organization", name: "BeyondWalls", legalName: "Linkzone Global FZ-LLC", url: "https://beyondwalls.ae", email: "beyondwalls@linkzoneglobal.com", telephone: "+971545469496", address: { "@type": "PostalAddress", streetAddress: "in5 Tech, Dubai Internet City", addressLocality: "Dubai", addressCountry: "AE" } },
          faqSchema(),
        ]}
      />

      <DarkHero>
        <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-16">
          <div className="flex-1 flex flex-col gap-6 items-start w-full">
            <span className="inline-flex items-center gap-2 rounded-full bg-[rgba(111,63,253,0.18)] border border-[rgba(111,63,253,0.6)] px-3.5 py-2 text-[13px] text-[#d8ccff]">
              <span className="w-2 h-2 rounded-full bg-[#34d399]" />Founding venue pricing · Dubai launch 2027
            </span>
            <h1 className="font-bold text-white text-[44px] sm:text-[56px] lg:text-[68px] leading-[1.04] tracking-[-2.04px]">
              Your screen<br />runs your shop.<br />Then it pays you.
            </h1>
            <p className="text-[#bdb6e3] text-[17px] lg:text-[19px] max-w-[540px]">
              Signage, menus and live prices on any TV — then open spare slots to advertisers and keep {PRICING.venueShare}%. One app for venues, brands and agencies across the UAE.
            </p>
            <div className="flex flex-wrap gap-3.5">
              <GradButton to="/signup">List your screen — free</GradButton>
              <Link to="/ForAdvertisers" className="rounded-full bg-white/[0.06] border border-[#4b4380] px-[23px] py-[15px] text-[15px] font-semibold text-white hover:bg-white/10">
                Advertise from AED {PRICING.advertiseFrom}/week
              </Link>
            </div>
            <StoreBadges />
          </div>
          <div className="relative w-full max-w-[620px] lg:w-[620px] lg:h-[560px] shrink-0">
            <img src="/site/hero.webp" alt="Café menu screen running BeyondWalls" className="w-full h-[340px] sm:h-[440px] lg:absolute lg:left-5 lg:top-5 lg:w-[600px] lg:h-[520px] object-cover rounded-[32px] shadow-[0_30px_80px_rgba(64,26,229,0.45)]" />
            <FloatCard className="hidden sm:block left-2 lg:-left-[30px] top-6 lg:top-[70px]">
              <p className="text-[12px] font-semibold text-[#16a34a]">● Front counter · Online</p>
              <p className="text-[15px] font-bold text-[#111027]">Now playing: Latte promo</p>
            </FloatCard>
            <FloatCard className="right-3 lg:right-auto lg:left-[420px] bottom-20 lg:bottom-auto lg:top-[330px]">
              <p className="text-[12px] font-medium text-[#5b5675]">Earned this month</p>
              <p className="text-[30px] font-bold tracking-[-0.9px] text-[#111027] leading-tight">AED 1,240</p>
              <p className="text-[12px] font-semibold text-[#16a34a]">▲ plan fee covered</p>
            </FloatCard>
            <FloatCard className="left-3 lg:-left-5 -bottom-6 lg:bottom-auto lg:top-[430px]">
              <p className="text-[12px] font-medium text-[#5b5675]">QR scans today</p>
              <p className="text-[30px] font-bold tracking-[-0.9px] text-[#111027] leading-tight">142</p>
            </FloatCard>
          </div>
        </div>
      </DarkHero>

      <ProofStrip />
      <FourSteps />
      <TwoBusinesses />
      <VenueTypes />
      <ForAdvertisersBlock />
      <ForVenueOwnersBlock />
      <VenuesGrid />
      <BOneBlock />
      <PricingBlock />
      <TrustStrip />
      <FAQ />
      <FinalCTA />
    </SitePage>
  );
}
