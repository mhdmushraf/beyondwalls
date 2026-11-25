import { useMemo, useState } from "react";
import { Search, MonitorSmartphone, Tag as TagIcon, Wallet, Megaphone, Users, FileText, ChevronRight } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { SitePage } from "@/components/site/Site";
import { CTABox, wrap } from "@/components/site/inner";
import { PRICING } from "@/components/site/sections";

const TOPICS = [
  ["screens", MonitorSmartphone, "Screens & pairing", "Pair a TV, B.One setup, offline screens"],
  ["products", TagIcon, "Products & prices", "Templates, price updates, playlists"],
  ["earnings", Wallet, "Earnings & payouts", "Revenue share, fees, bank details"],
  ["ads", Megaphone, "Advertising", "Booking, creatives, refunds"],
  ["account", Users, "Account & team", "Sign-in, roles, switching business"],
  ["policies", FileText, "Policies", "Ad rules, privacy, content guidelines"],
];

const ARTICLES = [
  ["screens", "Pair your first screen in 2 minutes", "Open the BeyondWalls app on the TV (LG, Samsung or Android TV) or plug in your B.One. A 6-digit code appears. In the web portal or mobile app go to Screens, add a screen, enter the code and pick the venue. The screen downloads its playlist and starts playing.", true],
  ["screens", "Why does my screen say 'offline'?", "A screen shows offline when it hasn't checked in for a few minutes. Check the TV is on and connected to Wi-Fi or ethernet. It keeps playing the last downloaded playlist while offline and catches up when it reconnects.", true],
  ["earnings", "How ad earnings and fees are calculated", `You keep ${PRICING.venueShare}% of every marketplace booking on your screens. Partner venues with free hardware share 60/40 or 50/50. Ads you sell yourself (direct deals) carry a ${PRICING.directDealFee}% fee. Your plan fee (AED ${PRICING.signageAds} per screen per month on Signage + Ads) comes out of earnings first; the rest is paid to your bank.`, true],
  ["ads", "Upload a video that fits portrait screens", "Use MP4 (H.264) up to 15 seconds. For portrait screens export 1080×1920; for landscape 1920×1080. We check size and orientation on upload and tell you which screens it won't fit.", true],
  ["account", "Run more than one business from one login", "If you manage several businesses (or an agency and a venue), use the business switcher at the top of the sidebar to move between them. Each business has its own screens, content, billing and earnings.", true],
  ["account", "Add a team member", "Team roles (owner, venue manager, designer, viewer) are being rolled out. Until then, message us on WhatsApp with the person's email and the role you want and we'll add them for you."],
  ["screens", "Setting up the B.One player", `Connect B.One to the TV's HDMI port and power, join Wi-Fi from the on-screen setup or plug in ethernet, then pair with the code. B.One costs AED ${PRICING.bone} one-off with a 12-month warranty.`],
  ["products", "Change a price on every screen", "Open Menus & prices, edit the price and save. Every menu board using that item updates within seconds."],
  ["products", "Schedule a breakfast and lunch menu", "Open Playlists & schedules and set the days and hours for each playlist, so breakfast plays in the morning and lunch from noon."],
  ["earnings", "Add your bank details for payouts", "Open Ad requests & earnings and add your bank details: account holder name, bank and IBAN (UAE IBANs start with AE and have 23 characters). Then request a payout from your available balance."],
  ["ads", "What happens if a venue declines my ad?", "You're only charged for screens that approve your ad. If a venue declines, the amount for that screen is refunded in full."],
  ["ads", "How much does advertising cost?", `Each venue sets its own weekly price per screen, from AED ${PRICING.advertiseFrom}. Prices exclude 5% VAT. Longer bookings get tier discounts.`],
  ["account", "Delete your account", "You can delete your account any time from the More tab in the mobile app, or at beyondwalls.linkzoneglobal.com/delete-account."],
  ["policies", "Advertising rules", "No alcohol, tobacco, adult, political or misleading ads. Content must follow UAE law and the venue's own blocked categories. Venues approve every ad."],
  ["policies", "Privacy", "We collect account details, screen and player data and QR scan counts. We never use cameras to identify people and never sell personal data. See the Privacy policy for full details."],
];

export default function HelpCenter() {
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState(null);
  const [open, setOpen] = useState(null);
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return ARTICLES.filter(([t, title, body, popular]) => (topic ? t === topic : s ? true : popular) && (!s || `${title} ${body}`.toLowerCase().includes(s)));
  }, [q, topic]);
  const heading = topic ? TOPICS.find((t) => t[0] === topic)[2] : q.trim() ? `Results for “${q.trim()}”` : "Popular articles";

  return (
    <SitePage>
      <SEOHead title="Help centre | BeyondWalls" description="Pair a screen, update prices, understand earnings and payouts, and book ads. Real people on WhatsApp, 9am–9pm." canonical="https://beyondwalls.linkzoneglobal.com/HelpCenter" />
      <section className="bg-[#fbfaff]">
        <div className={`${wrap} py-14 lg:py-20 flex flex-col items-center gap-6 text-center`}>
          <h1 className="font-bold text-[40px] md:text-[56px] tracking-[-1.68px] text-[#111027]">How can we help?</h1>
          <label className="w-full max-w-[640px] flex items-center gap-3 bg-white border border-[#eceaf3] rounded-2xl px-5 py-4 focus-within:border-[#6f3ffd]">
            <Search className="w-5 h-5 text-[#8f86b8]" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setTopic(null); }} placeholder="Search: pairing, prices, payouts…" className="flex-1 outline-none text-[16px] text-[#111027] placeholder:text-[#a39fb8] bg-transparent" />
          </label>
        </div>
      </section>
      <section className="bg-white">
        <div className={`${wrap} py-14 flex flex-col gap-12`}>
          <div className="flex flex-col gap-5">
            <h2 className="font-bold text-[24px] text-[#111027]">Browse by topic</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TOPICS.map(([k, Icon, t, d]) => (
                <button key={k} onClick={() => { setTopic(topic === k ? null : k); setQ(""); setOpen(null); }} className={`text-left bg-white border rounded-[20px] p-5 flex gap-4 items-start transition ${topic === k ? "border-[#6f3ffd] ring-2 ring-[#6f3ffd]/15" : "border-[#eceaf3] hover:border-[#c9bdfb]"}`}>
                  <span className="bg-[#f1ecff] rounded-xl p-2.5"><Icon className="w-5 h-5 text-[#5a2ded]" /></span>
                  <div><p className="font-bold text-[17px] text-[#111027]">{t}</p><p className="text-[14px] text-[#6b6787]">{d}</p></div>
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="font-bold text-[24px] text-[#111027]">{heading}</h2>
            {shown.length === 0 ? (
              <p className="text-[15px] text-[#6b6787]">Nothing matches that yet — ask us on WhatsApp and we'll answer in minutes.</p>
            ) : (
              <div className="bg-white border border-[#eceaf3] rounded-[20px] divide-y divide-[#eceaf3]">
                {shown.map(([, title, body]) => (
                  <div key={title}>
                    <button onClick={() => setOpen(open === title ? null : title)} className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-[#fbfaff]" aria-expanded={open === title}>
                      <span className="font-semibold text-[16px] text-[#111027]">{title}</span>
                      <ChevronRight className={`w-5 h-5 text-[#6f3ffd] shrink-0 transition-transform ${open === title ? "rotate-90" : ""}`} />
                    </button>
                    {open === title && <p className="px-6 pb-5 text-[15px] leading-[1.6] text-[#6b6787]">{body}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      <CTABox title="Still stuck?" sub="Real people on WhatsApp, 9am–9pm, Arabic and English." primary={{ label: "Book a call", to: "/Contact" }} />
    </SitePage>
  );
}
