import { useState } from "react";
import { Link } from "react-router-dom";
import { Monitor, Menu, X, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import PublicAIChatWidget from "@/components/chat/PublicAIChatWidget";

// Shared building blocks for the public website (Figma file zt5zHPFgpthYEAfpSeJYZr).
export const GRAD = "linear-gradient(135deg, #6f3ffd 0%, #5a2ded 71%)";
export const WHATSAPP = "https://wa.me/971556140067";

// Public lead capture (book a demo, B.One order, investor deck, newsletter) → Lead entity + admin alert.
export async function submitLead(payload) {
  const res = await base44.functions.invoke("submitLead", payload).catch((e) => ({ data: e?.response?.data || { error: e.message } }));
  const data = res?.data || {};
  if (data.error) {
    const err = new Error(data.error);
    err.field = data.field;
    throw err;
  }
  return data;
}

export const SOCIALS = [["Instagram", ""], ["LinkedIn", ""], ["TikTok", ""], ["X", ""]];

export const NAV_LINKS = [
  { label: "Venues", to: "/ForVenues" },
  { label: "Advertisers", to: "/ForAdvertisers" },
  { label: "B.One player", to: "/BOne" },
  { label: "Pricing", to: "/Pricing" },
  { label: "Map", to: "/ScreenLocations" },
];

export function Logo({ dark = true, size = "md" }) {
  const big = size === "md";
  return (
    <Link to="/" className="flex items-center gap-2.5 shrink-0">
      <span className={`flex items-center justify-center ${big ? "w-9 h-9 rounded-xl" : "w-8 h-8 rounded-[10px]"}`} style={{ backgroundImage: GRAD }}>
        <Monitor className="w-[18px] h-[18px] text-white" />
      </span>
      <span className={`font-bold ${big ? "text-[22px]" : "text-[20px]"} ${dark ? "text-white" : "text-[#111027]"}`}>BeyondWalls</span>
    </Link>
  );
}

export function GradButton({ to, href, children, className = "", size = "md" }) {
  const cls = `inline-flex items-center justify-center font-semibold text-white rounded-full whitespace-nowrap transition hover:brightness-110 ${size === "lg" ? "px-7 py-4 text-base" : "px-[22px] py-[14px] text-[15px]"} ${className}`;
  if (href) return <a href={href} className={cls} style={{ backgroundImage: GRAD }}>{children}</a>;
  return <Link to={to} className={cls} style={{ backgroundImage: GRAD }}>{children}</Link>;
}

export function SiteNav({ dark = true }) {
  const [open, setOpen] = useState(false);
  const link = dark ? "text-[#cfc9ee] hover:text-white" : "text-[#5b5675] hover:text-[#111027]";
  return (
    <header className={dark ? "" : "bg-white/95 backdrop-blur border-b border-[#eceaf3] sticky top-0 z-40"}>
      <nav className="max-w-[1440px] mx-auto px-6 lg:px-24 py-5 lg:py-7 flex items-center justify-between gap-6">
        <Logo dark={dark} />
        <div className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className={`text-[15px] font-medium ${link}`}>{l.label}</Link>
          ))}
        </div>
        <div className="hidden lg:flex items-center gap-3">
          <Link to="/login" className={`text-[15px] font-medium ${link}`}>Sign in</Link>
          <GradButton to="/signup">Get started</GradButton>
        </div>
        <button className={`lg:hidden p-2 -mr-2 ${dark ? "text-white" : "text-[#111027]"}`} onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>
      {open && (
        <div className="lg:hidden px-6 py-6 flex flex-col gap-4 bg-[#140b3a]">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="text-[#cfc9ee] text-base font-medium" onClick={() => setOpen(false)}>{l.label}</Link>
          ))}
          <div className="flex gap-3 pt-2">
            <Link to="/login" className="flex-1 text-center rounded-full border border-[#4b4380] text-white py-3 font-semibold">Sign in</Link>
            <GradButton to="/signup" className="flex-1">Get started</GradButton>
          </div>
        </div>
      )}
    </header>
  );
}

export function Pill({ children, dark = false, className = "" }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1.5 text-[13px] font-semibold ${dark ? "bg-[rgba(111,63,253,0.2)] text-[#cdbfff]" : "bg-[#f1ecff] text-[#5a2ded]"} ${className}`}>
      {children}
    </span>
  );
}

export function SectionHead({ pill, title, sub, dark = false, align = "center" }) {
  return (
    <div className={`flex flex-col gap-3.5 ${align === "center" ? "items-center text-center" : "items-start"}`}>
      {pill && <Pill dark={dark}>{pill}</Pill>}
      <h2 className={`font-bold text-[32px] md:text-[44px] leading-[1.1] tracking-[-1.1px] ${dark ? "text-white" : "text-[#111027]"}`}>{title}</h2>
      {sub && <p className={`text-[17px] md:text-[18px] max-w-[760px] ${dark ? "text-[#9a93c4]" : "text-[#5b5675]"}`}>{sub}</p>}
    </div>
  );
}

export function Section({ children, className = "", style }) {
  return (
    <section className={className} style={style}>
      <div className="max-w-[1440px] mx-auto px-6 lg:px-24 py-16 lg:py-24">{children}</div>
    </section>
  );
}

export function CheckLine({ children, light = true }) {
  return (
    <div className="flex items-center gap-2">
      <Check className={`w-[15px] h-[15px] shrink-0 ${light ? "text-white" : "text-[#6f3ffd]"}`} />
      <span className={`text-[14px] font-medium ${light ? "text-white" : "text-[#111027]"}`}>{children}</span>
    </div>
  );
}

export function StoreBadges({ compact = false, tv = true }) {
  const items = [
    ["Download on the", "App Store"],
    ["Get it on", "Google Play"],
    ...(tv ? [["TV player for", "Android TV"], ["Available on", "Samsung · LG"]] : []),
  ];
  return (
    <div className="flex flex-wrap gap-2.5">
      {items.map(([a, b]) => (
        <div key={b} className={`bg-black border ${compact ? "border-[#34305a] rounded-[10px] pl-3 pr-3.5 py-1.5" : "border-[#3a3360] rounded-xl px-4 py-2"} flex flex-col`}>
          <span className={`${compact ? "text-[9px]" : "text-[10px]"} font-medium text-[#9a93c4] leading-tight`}>{a}</span>
          <span className={`${compact ? "text-[13px]" : "text-[15px]"} font-semibold text-white leading-tight`}>{b}</span>
        </div>
      ))}
    </div>
  );
}

export function FinalCTA({ title = "Put your screen to work this week", sub = "List free in 10 minutes. Pair with a code. Start earning when brands book." }) {
  return (
    <section style={{ backgroundImage: GRAD }}>
      <div className="max-w-[1440px] mx-auto px-6 lg:px-24 py-16 lg:py-20 flex flex-col items-center gap-5 text-center">
        <h2 className="font-bold text-[32px] md:text-[44px] tracking-[-1.1px] text-white leading-tight">{title}</h2>
        <p className="text-[#e7e0ff] text-[17px] md:text-[18px]">{sub}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/signup" className="bg-[#0b0920] text-white rounded-full px-[22px] py-[14px] text-[15px] font-semibold">List your screen — free</Link>
          <Link to="/Contact" className="bg-white/10 border border-white/40 text-white rounded-full px-[22px] py-[14px] text-[15px] font-semibold">Book a 15-min demo</Link>
        </div>
      </div>
    </section>
  );
}

const FOOTER_COLS = [
  ["Product", [["Digital signage", "/ForVenues"], ["Ad marketplace", "/ForAdvertisers"], ["B.One player", "/BOne"], ["Screen map", "/ScreenLocations"], ["Pricing", "/Pricing"], ["TV apps", "/BOne"]]],
  ["For", [["Cafés & restaurants", "/CafeScreenAdvertisingDubai"], ["Supermarkets", "/ForVenues"], ["Gyms", "/GymScreenAdvertisingDubai"], ["Clinics", "/ClinicScreenAdvertisingDubai"], ["Agencies", "/Connect"], ["Advertisers", "/ForAdvertisers"]]],
  ["Company", [["About", "/About"], ["Book a demo", "/Contact"], ["Contact", "/Contact"], ["Blog", "/Blog"]]],
  ["Support", [["Help centre", "/HelpCenter"], ["Setup guide", "/HelpCenter"], ["Terms", "/Terms"], ["Privacy", "/Privacy"], ["Delete account", "/delete-account"]]],
  ["Guides", [["DOOH advertising Dubai", "/DOOHAdvertisingDubai"], ["Digital signage UAE", "/DigitalSignageUAE"], ["Café screen advertising", "/CafeScreenAdvertisingDubai"], ["Gym screen advertising", "/GymScreenAdvertisingDubai"], ["Clinic screen advertising", "/ClinicScreenAdvertisingDubai"], ["Earn from venue screens", "/EarnMoneyVenueScreensDubai"], ["Indoor DOOH vs billboards", "/IndoorVenueDOOHvsBillboardsDubai"]]],
];

function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return toast.error("Enter a valid email");
    setBusy(true);
    try {
      await submitLead({ kind: "newsletter", email: email.trim() });
      toast.success("You're on the list.");
      setEmail("");
    } catch (err) {
      toast.error(err.message || "Couldn't subscribe right now. Try again.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="bg-white/5 border border-white/10 rounded-[20px] px-6 md:px-7 py-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-5">
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[18px] text-white">Get launch updates</p>
        <p className="text-[13px] text-[#9a93c4]">hello@linkzoneglobal.com · +971 55 614 0067 · in5 Tech, Dubai Internet City</p>
      </div>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" aria-label="Email"
        className="md:w-[280px] bg-white/[0.06] border border-white/[0.12] rounded-[10px] px-4 py-3 text-[14px] text-white placeholder:text-[#9a93c4] outline-none focus:border-[#6f3ffd]" />
      <button disabled={busy} className="rounded-[10px] px-5 py-3 text-[14px] font-semibold text-white disabled:opacity-60" style={{ backgroundImage: GRAD }}>
        {busy ? "Subscribing…" : "Subscribe"}
      </button>
    </form>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-[#0b0920]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-24 pt-16 lg:pt-[72px] pb-9 flex flex-col gap-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-[320px_repeat(5,1fr)] gap-10 lg:gap-12">
          <div className="col-span-2 md:col-span-3 lg:col-span-1 flex flex-col gap-4">
            <Logo size="sm" />
            <p className="text-[14px] text-[#9a93c4] max-w-[300px]">Signage and screen advertising for venues across the UAE. A Linkzone Global company.</p>
            <StoreBadges compact tv={false} />
            <a href={WHATSAPP} target="_blank" rel="noreferrer" className="self-start bg-[#25d366] text-[#062e16] rounded-full px-3.5 py-2.5 text-[13px] font-semibold">WhatsApp +971 55 614 0067</a>
          </div>
          {FOOTER_COLS.map(([head, links]) => (
            <div key={head} className="flex flex-col gap-3 min-w-0">
              <p className="text-[13px] font-semibold text-white">{head}</p>
              {links.map(([l, to]) => (
                <Link key={l} to={to} className="text-[14px] text-[#9a93c4] hover:text-white truncate">{l}</Link>
              ))}
            </div>
          ))}
        </div>
        <FooterNewsletter />
        <div className="h-px bg-white/10" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-[12px] text-[#9a93c4]">
          <p>© {new Date().getFullYear()} Linkzone Global FZ-LLC · DDA licence 107603 · in5 Tech, Dubai Internet City</p>
          <div className="flex flex-wrap gap-[18px] font-medium">
            {/* TODO: set real profile URLs */}
            {SOCIALS.map(([n, u]) => u ? <a key={n} href={u} target="_blank" rel="noreferrer" className="hover:text-white">{n}</a> : <span key={n}>{n}</span>)}
            <span dir="auto">English | العربية</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Page shell: light sticky nav (or none when a page draws its own dark hero nav), footer, chat.
export function SitePage({ children, darkHero = false }) {
  return (
    <div className="min-h-screen bg-white font-[Inter,system-ui,sans-serif] overflow-x-clip">
      {!darkHero && <SiteNav dark={false} />}
      <main>{children}</main>
      <SiteFooter />
      <PublicAIChatWidget />
    </div>
  );
}

// Dark gradient hero wrapper with the dark nav inside.
export function DarkHero({ children }) {
  return (
    <section style={{ backgroundImage: "linear-gradient(151deg, #140b3a 14%, #0d0a1f 54%, #2a0f6b 86%)" }}>
      <SiteNav dark />
      <div className="max-w-[1440px] mx-auto px-6 lg:px-24 pt-8 lg:pt-16 pb-16 lg:pb-24">{children}</div>
    </section>
  );
}
