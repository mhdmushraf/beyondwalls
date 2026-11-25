import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Map, Upload, CircleDollarSign, LineChart, Sparkles, Eye, QrCode, Clock, Target, ShieldCheck,
  Wallet, Tv, Shield, User, Plug, Wifi, TrendingUp, Monitor, RefreshCw, Zap, Check, ChevronDown,
  Rocket, Award, Lock, Globe,
} from "lucide-react";
import { GRAD, Pill, Section, SectionHead, CheckLine, GradButton } from "./Site";

// ── Pricing constants (agreed Nov 2026) ─────────────────────────────
export const PRICING = {
  venueShare: 70, // % venue keeps on marketplace bookings
  signageAds: 15, signageAdsWas: 29,
  signageOnly: 29, signageOnlyWas: 49,
  bone: 449,
  advertiseFrom: 99, // AED per screen per week
  directDealFee: 10, // % platform fee on venue's own direct deals
  connectShare: 85, // % agency/partner keeps
};

export function ProofStrip() {
  const items = [
    ["Any TV", "LG · Samsung · Android · browser · B.One"],
    ["Arabic + English", "Built for the UAE"],
    ["Real reporting", "Proof of play · snapshots · QR scans"],
    ["Live in minutes", "Pair with a 6-digit code"],
  ];
  return (
    <section className="bg-white border-b border-[#eceaf3]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-24 py-7 grid grid-cols-2 lg:flex lg:justify-between gap-6">
        {items.map(([a, b]) => (
          <div key={a}>
            <p className="font-bold text-[18px] text-[#0d0a1f]">{a}</p>
            <p className="font-medium text-[13px] text-[#5b5675]">{b}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FourSteps() {
  const steps = [
    [Map, "Choose screens", "Pick cafés, gyms or supermarkets on the map by area, venue type and time of day."],
    [Upload, "Upload creative", "Image or video. We check size, orientation and content rules automatically."],
    [CircleDollarSign, "Set budget & weeks", "Pay per screen per week. Tier discounts for longer bookings. No minimums."],
    [LineChart, "Go live & track", "Proof of play, snapshots and QR scans in real time. Cost per scan, not guesses."],
  ];
  return (
    <Section className="bg-white">
      <div className="flex flex-col items-center gap-10">
        <SectionHead pill="Simple process" title="Launch your campaign in 4 steps" sub="From sign-up to live ads in under 30 minutes." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
          {steps.map(([Icon, t, d], i) => (
            <div key={t} className="bg-[#f7f5fd] border border-[#eceaf3] rounded-[22px] p-6 flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <span className="px-3.5 py-2.5 rounded-xl text-white font-bold text-[18px] leading-none" style={{ backgroundImage: GRAD }}>{i + 1}</span>
                <Icon className="w-[22px] h-[22px] text-[#8f86b8]" />
              </div>
              <p className="font-bold text-[19px] text-[#111027]">{t}</p>
              <p className="text-[14px] text-[#5b5675]">{d}</p>
            </div>
          ))}
        </div>
        <GradButton to="/Pricing">Compare account types →</GradButton>
      </div>
    </Section>
  );
}

export function TwoBusinesses() {
  const cards = [
    ["/site/cafe.webp", "01 · SIGNAGE", "Run menus, prices and promos", "Change a price on your phone and every screen updates in seconds. Schedules, playlists, prayer times, QR codes.", ["Products & prices", "Takeover", "Widgets"]],
    ["/site/market.webp", "02 · MARKETPLACE", `Sell spare slots, keep ${PRICING.venueShare}%`, "Brands book your screen on the map. You approve every ad, block competitors, and get paid monthly.", ["Map listing", "Direct deals", "Payouts"]],
    ["/site/bone.webp", "03 · B.ONE PLAYER", "Turn any old TV smart", `Plug-in player for non-smart TVs. Self-install in 5 minutes with the pairing code. AED ${PRICING.bone}.`, ["Offline cache", "Auto-restart", "Snapshots"]],
  ];
  return (
    <Section className="bg-[#f7f5fd]">
      <h2 className="font-bold text-[32px] md:text-[44px] leading-[1.1] tracking-[-1.32px] text-[#0d0a1f] mb-10">Two businesses in one screen</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {cards.map(([img, k, t, d, tags]) => (
          <div key={k} className="bg-white rounded-[28px] overflow-hidden pb-7 flex flex-col gap-[18px]">
            <img src={img} alt={t} loading="lazy" className="h-[260px] w-full object-cover" />
            <div className="px-7 flex flex-col gap-2.5">
              <p className="font-bold text-[13px] text-[#6f3ffd]">{k}</p>
              <p className="font-bold text-[24px] text-[#0d0a1f] leading-tight">{t}</p>
              <p className="text-[15px] leading-[1.5] text-[#5b5675]">{d}</p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((g) => <span key={g} className="bg-[#efeaff] text-[#5a2ded] text-[12px] font-semibold rounded-full px-2.5 py-[5px]">{g}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function VenueTypes() {
  const types = ["Restaurants", "Cafés", "Gyms", "Salons", "Hotels", "Coworking", "Clinics", "Supermarkets"];
  const stats = [[Sparkles, "Self-serve", "Book online", "No contracts"], [Eye, "Proof of play", "Every ad", "Snapshot verified"], [QrCode, "QR tracking", "Every screen", "Scans per hour"], [Clock, "24/7", "Monitoring", "Offline alerts"]];
  const specs = [["Any size", "Screen sizes", "Portrait or landscape"], ["15 sec", "Ad length", "Best for recall"], ["Every ~3 min", "Repeat", "Steady brand exposure"], ["10+ hrs/day", "Operating hours", "Full-day coverage"]];
  return (
    <Section style={{ backgroundImage: "linear-gradient(142deg, #0d0a1f 7%, #1e1150 79%)" }}>
      <div className="flex flex-col items-center gap-10">
        <SectionHead dark pill="Built for every venue" title="One platform, every kind of venue" sub="What screens can do for restaurants, cafés, gyms, clinics and retail." />
        <div className="flex flex-wrap justify-center gap-2.5">
          {types.map((t) => <span key={t} className="bg-white/[0.04] border border-white/15 rounded-full px-4 py-2.5 text-[14px] font-medium text-[#d9d3f5]">{t}</span>)}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 w-full">
          {stats.map(([Icon, a, b, c]) => (
            <div key={a} className="bg-white/[0.04] border border-white/10 rounded-[22px] px-6 py-7 flex flex-col items-center gap-2.5 text-center">
              <span className="bg-[rgba(111,63,253,0.18)] rounded-[14px] p-3"><Icon className="w-[22px] h-[22px] text-[#b9a6ff]" /></span>
              <p className="font-bold text-[24px] md:text-[30px] tracking-[-0.75px] text-white">{a}</p>
              <p className="font-medium text-[15px] text-[#d9d3f5]">{b}</p>
              <p className="text-[13px] text-[#9a93c4]">{c}</p>
            </div>
          ))}
        </div>
        <div className="w-full bg-[rgba(111,63,253,0.14)] border border-[rgba(111,63,253,0.35)] rounded-[28px] px-6 md:px-10 py-9 flex flex-col items-center gap-7">
          <p className="font-bold text-[24px] tracking-[-0.6px] text-white">Flexible screen specifications</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {specs.map(([a, b, c]) => (
              <div key={b} className="flex flex-col items-center gap-1 text-center">
                <p className="font-bold text-[26px] md:text-[34px] tracking-[-0.85px] text-[#b9a6ff]">{a}</p>
                <p className="font-semibold text-[15px] text-white">{b}</p>
                <p className="text-[13px] text-[#9a93c4]">{c}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] rounded-[24px] px-6 md:px-8 py-7 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 flex flex-col gap-2">
            <Sparkles className="w-[15px] h-[15px] text-[#6ee7b7]" />
            <p className="font-semibold text-[14px] text-[#6ee7b7]">Always-on engagement</p>
            <p className="font-bold text-[26px] tracking-[-0.65px] text-white">Smart content rotation</p>
            <p className="text-[15px] text-[#9a93c4] max-w-[720px]">Screens show the venue's own menus and offers between ads, so people keep looking — and your ad lands in front of an engaged audience.</p>
          </div>
          <Link to="/signup" className="self-start md:self-auto bg-[#10b981] text-white rounded-xl px-[22px] py-[14px] text-[15px] font-semibold whitespace-nowrap">Book your campaign →</Link>
        </div>
      </div>
    </Section>
  );
}

export function ForAdvertisersBlock() {
  const feats = [[Target, "Target precisely", "Area, venue type, daypart"], [Clock, "Live in minutes", "Not weeks of OOH setup"], [LineChart, "Real reporting", "Plays, snapshots, QR scans"], [CircleDollarSign, `From AED ${PRICING.advertiseFrom}/week`, "No minimum spend"], [Eye, "Captive audience", "People stay 20–60 min*"], [ShieldCheck, "Every venue verified", "Licence + photo checked"]];
  return (
    <Section style={{ backgroundImage: "linear-gradient(155deg, #6f3ffd 0%, #5a2ded 71%)" }}>
      <div className="flex flex-col lg:flex-row items-center gap-14">
        <div className="flex-1 flex flex-col gap-5 items-start">
          <Pill dark>For advertisers</Pill>
          <h2 className="font-bold text-[32px] md:text-[44px] leading-[1.1] tracking-[-1.1px] text-white max-w-[600px]">Reach customers where they actually spend time</h2>
          <p className="text-[18px] text-[#e7e0ff] max-w-[580px]">Your ad on screens inside cafés, gyms, clinics and supermarkets across the UAE. Target by area, venue type and time of day.</p>
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4 w-full">
            {feats.map(([Icon, a, b]) => (
              <div key={a} className="flex gap-3 items-start">
                <span className="bg-white/[0.14] rounded-xl p-2.5"><Icon className="w-5 h-5 text-white" /></span>
                <div><p className="font-bold text-[16px] text-white">{a}</p><p className="text-[13px] text-[#e7e0ff]">{b}</p></div>
              </div>
            ))}
          </div>
          <Link to="/ForAdvertisers" className="bg-white text-[#5a2ded] rounded-xl px-6 py-[15px] text-[15px] font-bold">Start advertising →</Link>
          <p className="text-[11px] text-[#d3c7ff]">*Typical dwell time by venue type; actual figures shown per screen.</p>
        </div>
        <div className="relative w-full max-w-[560px] lg:h-[480px]">
          <img src="/site/mall.webp" alt="Screens in a UAE mall" loading="lazy" className="w-full h-[320px] md:h-[440px] object-cover rounded-[28px]" />
          <div className="absolute left-3 md:-left-8 -bottom-6 lg:bottom-auto lg:top-[380px] bg-white rounded-[18px] shadow-[0_10px_30px_rgba(31,20,77,0.07)] pl-[18px] pr-[22px] py-4 flex items-center gap-3.5">
            <span className="bg-[#dcfce7] rounded-xl p-2.5"><QrCode className="w-[22px] h-[22px] text-[#16a34a]" /></span>
            <div><p className="font-bold text-[24px] tracking-[-0.6px] text-[#111027]">AED 0.84</p><p className="font-medium text-[12px] text-[#5b5675]">Cost per QR scan · example campaign</p></div>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Stepper({ label, value, display, onChange, min, max, step = 1 }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className="font-medium text-[14px] text-[#5b5675]">{label}</p>
      <div className="flex items-center gap-1.5">
        <button type="button" aria-label={`Less ${label}`} onClick={() => onChange(Math.max(min, value - step))} className="w-7 h-7 rounded-lg border border-[#eceaf3] text-[#5b5675] hover:bg-[#f7f5fd]">−</button>
        <span className="border border-[#eceaf3] rounded-lg px-3 py-1.5 font-bold text-[14px] text-[#111027] min-w-[76px] text-center">{display ?? value}</span>
        <button type="button" aria-label={`More ${label}`} onClick={() => onChange(Math.min(max, value + step))} className="w-7 h-7 rounded-lg border border-[#eceaf3] text-[#5b5675] hover:bg-[#f7f5fd]">+</button>
      </div>
    </div>
  );
}

export function EarningsCalculator({ defaults = {} }) {
  const [screens, setScreens] = useState(defaults.screens ?? 2);
  const [slots, setSlots] = useState(defaults.slots ?? 3);
  const [price, setPrice] = useState(defaults.price ?? PRICING.advertiseFrom);
  const [booked, setBooked] = useState(defaults.booked ?? 70);
  const share = PRICING.venueShare / 100;
  const monthly = Math.round(screens * slots * price * (booked / 100) * share * 4);
  const fee = screens * PRICING.signageAds;
  return (
    <div className="bg-white rounded-[28px] overflow-hidden shadow-[0_10px_30px_rgba(31,20,77,0.07)] w-full lg:w-[560px] shrink-0">
      <div className="bg-gradient-to-r from-[#16a34a] to-[#0f766e] px-7 py-6">
        <p className="font-bold text-[24px] tracking-[-0.6px] text-white">Earnings calculator</p>
        <p className="font-medium text-[13px] text-[#d1fae5]">An estimate — real earnings depend on bookings</p>
      </div>
      <div className="px-7 pt-5 pb-6 flex flex-col gap-3.5">
        <Stepper label="Screens" value={screens} onChange={setScreens} min={1} max={50} />
        <Stepper label="Ad slots you sell per screen" value={slots} display={`${slots} of 10`} onChange={setSlots} min={1} max={10} />
        <Stepper label="Weekly price per slot" value={price} display={`AED ${price}`} onChange={setPrice} min={49} max={499} step={10} />
        <Stepper label="Slots booked (estimate)" value={booked} display={`${booked}%`} onChange={setBooked} min={10} max={100} step={10} />
        <div className="bg-[#ecfdf3] rounded-2xl px-[18px] py-4 flex items-center justify-between gap-3">
          <div>
            <p className="font-medium text-[13px] text-[#5b5675]">Your share ({PRICING.venueShare}%) per month</p>
            <p className="font-bold text-[28px] tracking-[-0.7px] text-[#16a34a]">≈ AED {monthly.toLocaleString("en-US")}</p>
          </div>
          <p className={`font-semibold text-[13px] text-right ${monthly >= fee ? "text-[#16a34a]" : "text-[#b45309]"}`}>
            {monthly >= fee ? "Fee covered ✓" : `Plan fee AED ${fee}`}
          </p>
        </div>
        <p className="text-[11px] text-[#8f86b8]">Based on 4 weeks a month. Plan fee: Signage + Ads, AED {PRICING.signageAds}/screen/month.</p>
      </div>
    </div>
  );
}

export function ForVenueOwnersBlock() {
  const feats = [[Wallet, `${PRICING.venueShare}% revenue share`, "Paid monthly to your bank"], [Tv, "Use existing screens", "Smart TV app or B.One"], [Shield, "Full ad control", "Approve, block categories & brands"], [LineChart, "Real-time earnings", "See every booking"], [User, "Keep your own slots", "Your menu & offers first"], [Clock, "Monthly payouts", "Or spend on your own ads"]];
  return (
    <Section className="bg-[#f2fbf6]">
      <div className="flex flex-col items-center gap-10">
        <SectionHead pill="For venue owners" title="Turn your screens into a second income" sub={`Use the screens you already have. You approve every ad and keep ${PRICING.venueShare}%.`} />
        <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
          <EarningsCalculator />
          <div className="flex-1 flex flex-col gap-4 w-full">
            <div className="grid sm:grid-cols-2 gap-4">
              {feats.map(([Icon, a, b]) => (
                <div key={a} className="bg-white rounded-[20px] p-5 flex flex-col gap-2 shadow-[0_10px_30px_rgba(31,20,77,0.07)]">
                  <span className="bg-[#dcfce7] rounded-xl p-2.5 self-start"><Icon className="w-5 h-5 text-[#16a34a]" /></span>
                  <p className="font-bold text-[16px] text-[#111027]">{a}</p>
                  <p className="text-[13px] text-[#5b5675]">{b}</p>
                </div>
              ))}
            </div>
            <Link to="/signup" className="bg-gradient-to-r from-[#16a34a] to-[#0f766e] rounded-[14px] py-4 text-center font-bold text-[16px] text-white">List your venue — start earning</Link>
          </div>
        </div>
      </div>
    </Section>
  );
}

export function VenuesGrid() {
  const v = [["v-restaurant", "Restaurants & cafés", "Diners during meals"], ["mall", "Shopping malls", "High-traffic retail"], ["v-gym", "Fitness centres", "Health-focused audience"], ["v-cowork", "Coworking spaces", "Business professionals"], ["v-hotel", "Hotels & lobbies", "Tourists & travellers"], ["v-clinic", "Clinics", "Waiting-room attention"]];
  return (
    <Section className="bg-[#f7f5fd]">
      <div className="flex flex-col items-center gap-10">
        <SectionHead pill="Screen locations" title="Venues across the UAE" sub="Reach people where they live, work, train and shop." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
          {v.map(([img, a, b]) => (
            <div key={a} className="relative h-[260px] md:h-[300px] rounded-[24px] overflow-hidden">
              <img src={`/site/${img}.webp`} alt={a} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[35%] to-[rgba(8,5,26,0.85)]" />
              <div className="absolute left-6 bottom-6">
                <p className="font-bold text-[24px] tracking-[-0.6px] text-white">{a}</p>
                <p className="font-medium text-[14px] text-[#e5e1f5]">{b}</p>
              </div>
            </div>
          ))}
        </div>
        <Link to="/ScreenLocations" className="bg-white border border-[#eceaf3] rounded-xl px-6 py-3.5 font-semibold text-[15px] text-[#111027]">View the screen map →</Link>
      </div>
    </Section>
  );
}

export function BOneBlock({ withHeader = true }) {
  const steps = [[Plug, "#f1ecff", "Plug in", "Connect B.One to any HDMI screen. One cable, no technician."], [Wifi, "#e0e7ff", "Pair", "Enter the 6-digit code on the TV into the app. Connects over Wi-Fi or ethernet."], [TrendingUp, "#dcfce7", "Run & earn", `Show your menus and offers — and earn ${PRICING.venueShare}% when brands book your slots.`]];
  const feats = [[Monitor, "Works with any TV", "Any HDMI screen, portrait or landscape"], [RefreshCw, "Offline caching", "Keeps playing if the internet drops"], [Shield, "Secure & monitored", "Locked kiosk, auto-restart, alerts"], [Zap, "Remote updates", "We update the player — no visits"]];
  return (
    <Section className="bg-white">
      <div className="flex flex-col items-center gap-12">
        {withHeader && <SectionHead pill="Introducing B.One" title="B.One: Plug. Play. Earn." sub="Turn any HDMI screen into a smart, managed screen in minutes. Only needed for TVs that aren't smart." />}
        <div className="flex flex-col lg:flex-row items-center gap-14 w-full">
          <div className="relative w-full lg:w-[600px] shrink-0">
            <img src="/site/bone.webp" alt="B.One media player" loading="lazy" className="w-full h-[320px] md:h-[440px] object-cover rounded-[32px]" />
            <span className="absolute right-6 -top-4 bg-white rounded-full px-3.5 py-2 shadow-[0_10px_30px_rgba(31,20,77,0.07)] text-[13px] font-semibold text-[#16a34a]">● Plug &amp; play</span>
            <span className="absolute -left-2 md:-left-5 bottom-6 rounded-[14px] px-[18px] py-3 text-white font-bold text-[16px]" style={{ backgroundImage: GRAD }}>AED {PRICING.bone} · self-install</span>
          </div>
          <div className="flex-1 flex flex-col gap-6">
            <p className="font-bold text-[26px] tracking-[-0.65px] text-[#111027]">How it works</p>
            {steps.map(([Icon, bg, t, d], i) => (
              <div key={t} className="flex gap-[18px] items-start">
                <span className="rounded-[18px] p-4" style={{ background: bg }}><Icon className="w-[26px] h-[26px] text-[#5a2ded]" /></span>
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-[13px] text-[#6f3ffd]">Step {i + 1}</p>
                  <p className="font-bold text-[20px] text-[#111027]">{t}</p>
                  <p className="text-[15px] text-[#5b5675] max-w-[460px]">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#f7f5fd] rounded-[32px] p-6 md:p-10 flex flex-col items-center gap-7 w-full">
          <p className="font-bold text-[24px] tracking-[-0.6px] text-[#111027]">Key features of B.One</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-[18px] w-full">
            {feats.map(([Icon, a, b]) => (
              <div key={a} className="bg-white rounded-[20px] p-[22px] flex flex-col gap-3 shadow-[0_10px_30px_rgba(31,20,77,0.07)]">
                <span className="bg-[#f1ecff] rounded-[14px] p-3 self-start"><Icon className="w-[22px] h-[22px] text-[#5a2ded]" /></span>
                <p className="flex items-center gap-2 font-bold text-[16px] text-[#111027]"><Check className="w-[17px] h-[17px]" />{a}</p>
                <p className="text-[14px] text-[#5b5675]">{b}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center gap-2.5 text-center">
          <Link to="/Contact?topic=bone" className="rounded-xl px-7 py-4 text-white font-bold text-[16px]" style={{ backgroundImage: GRAD }}>Get your B.One →</Link>
          <p className="font-medium text-[13px] text-[#5b5675]">Delivery across the UAE · setup guide in the box · WhatsApp support</p>
        </div>
      </div>
    </Section>
  );
}

export function PricingBlock({ title = "Founding venue pricing" }) {
  const plans = [
    { name: "Ads only", price: "Free", was: null, desc: `Lend your screen to advertisers. You keep ${PRICING.venueShare}% of every booking.`, items: ["Map listing", "Approve every ad", "Monthly payouts"] },
    { name: "Signage + Ads", price: `AED ${PRICING.signageAds}`, was: `AED ${PRICING.signageAdsWas}`, desc: "Your content and ads in one loop. Earnings usually cover the fee.", items: ["Everything in signage", "Marketplace earnings", "Pay fee from earnings"], hot: true },
    { name: "Signage only", price: `AED ${PRICING.signageOnly}`, was: `AED ${PRICING.signageOnlyWas}`, desc: "Your content only, no ads. Roles and reports included.", items: ["Products & live prices", "Teams & approvals", "Uptime reports"] },
  ];
  return (
    <Section className="bg-[#0d0a1f]">
      <div className="flex flex-col gap-9">
        <div className="flex flex-col gap-4">
          <h2 className="font-bold text-[32px] md:text-[44px] tracking-[-1.32px] text-white">{title}</h2>
          <p className="text-[17px] text-[#a9a3c9] max-w-[700px]">Locked for 12 months for venues that join before launch. Per screen, per month.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((p) => (
            <div key={p.name} className={`rounded-[24px] p-7 flex flex-col gap-3.5 ${p.hot ? "bg-gradient-to-r from-[#6f3ffd] to-[#5a2ded]" : "bg-white/5 border border-white/[0.12]"}`}>
              <p className="font-bold text-[18px] text-white">{p.name}</p>
              <div className="flex items-baseline gap-2.5">
                <p className="font-bold text-[44px] tracking-[-1.32px] text-white">{p.price}</p>
                {p.was && <p className={`font-medium text-[18px] line-through ${p.hot ? "text-[#d8ccff]" : "text-[#a9a3c9]"}`}>{p.was}</p>}
              </div>
              <p className={`text-[14px] leading-[1.5] ${p.hot ? "text-[#ede7ff]" : "text-[#a9a3c9]"}`}>{p.desc}</p>
              {p.items.map((i) => <CheckLine key={i}>{i}</CheckLine>)}
            </div>
          ))}
        </div>
        <div className="bg-white/5 rounded-[20px] px-6 py-5 flex items-center gap-5">
          <img src="/site/bone.webp" alt="" loading="lazy" className="w-[84px] h-[84px] rounded-2xl object-cover shrink-0" />
          <div className="flex flex-col gap-1">
            <p className="font-bold text-[20px] text-white">B.One player — AED {PRICING.bone} one-off</p>
            <p className="text-[14px] text-[#a9a3c9]">Only needed for non-smart TVs. Smart TVs use our free app from the LG, Samsung or Google Play store.</p>
          </div>
        </div>
      </div>
    </Section>
  );
}

export function TrustStrip() {
  const t = [[Rocket, "#a78bfa", "in5 Dubai", "Incubated startup"], [Award, "#facc15", "Award winner", "Global Recognition 2025"], [Lock, "#34d399", "SSL secured", "Encrypted & private"], [Globe, "#60a5fa", "UAE based", "Local WhatsApp support"]];
  return (
    <section className="bg-[#0d0a1f] border-t border-white/5">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-24 py-10 grid grid-cols-2 lg:flex lg:justify-center gap-8 lg:gap-12">
        {t.map(([Icon, c, a, b]) => (
          <div key={a} className="flex items-center gap-3">
            <Icon className="w-7 h-7 shrink-0" style={{ color: c }} />
            <div><p className="font-bold text-[16px] text-white">{a}</p><p className="text-[13px] text-[#9a93c4]">{b}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}

export const HOME_FAQ = [
  ["What is BeyondWalls?", "A UAE platform where venues run their screens (menus, prices, promos) and can sell spare ad slots to brands. Advertisers book those screens online and get proof-of-play reports."],
  ["Do I need to buy new screens?", "No. Smart TVs from LG, Samsung and Android TV run our free player app. Older TVs with an HDMI port only need the B.One player (AED 449, one-off)."],
  ["How much does it cost to advertise?", `Screens start from AED ${PRICING.advertiseFrom} per screen per week, with discounts for longer bookings and no minimum spend. Each venue sets its own price, shown on the map before you book.`],
  ["How do I get paid as a venue?", `You keep ${PRICING.venueShare}% of every marketplace booking, paid monthly to your bank — or you can use your balance to pay your plan fee or run your own ads. Deals you bring yourself carry only a ${PRICING.directDealFee}% fee.`],
  ["Can I block competitors or certain ads?", "Yes. You approve every ad before it plays, and you can block whole categories or specific brands."],
  ["Which TVs work?", "Any LG webOS, Samsung Tizen or Android TV, any browser-based screen, and any HDMI screen with B.One. Portrait or landscape."],
];

export function FAQ({ items = HOME_FAQ, title = "Frequently asked questions", sub = "Everything you need to know about screens and advertising with BeyondWalls" }) {
  const [open, setOpen] = useState(0);
  return (
    <Section className="bg-[#f7f5fd]">
      <div className="flex flex-col items-center gap-7">
        <h2 className="font-bold text-[32px] md:text-[44px] tracking-[-1.1px] text-[#111027] text-center">{title}</h2>
        {sub && <p className="text-[17px] text-[#5b5675] text-center">{sub}</p>}
        <div className="flex flex-col gap-3 w-full max-w-[860px]">
          {items.map(([q, a], i) => {
            const on = open === i;
            return (
              <div key={q} className={`bg-white rounded-2xl border ${on ? "border-[#6f3ffd]" : "border-[#eceaf3]"}`}>
                <button className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left" onClick={() => setOpen(on ? -1 : i)} aria-expanded={on}>
                  <span className="font-semibold text-[17px] text-[#111027]">{q}</span>
                  <ChevronDown className={`w-5 h-5 text-[#8f86b8] shrink-0 transition-transform ${on ? "rotate-180 text-[#6f3ffd]" : ""}`} />
                </button>
                {on && <p className="px-6 pb-5 -mt-1 text-[15px] text-[#5b5675]">{a}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

export function faqSchema(items = HOME_FAQ) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
}
