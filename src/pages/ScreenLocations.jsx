import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, BadgeCheck, MonitorPlay, ChevronUp, MapPin, Store, Radio, Globe2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SEOHead from "@/components/SEOHead";
import { SitePage, GRAD, WHATSAPP } from "@/components/site/Site";
import { Btn, Select } from "@/components/site/inner";
import ScreensMap from "@/components/portal/ScreensMap";

const label = (t) => (t || "venue").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const PRICE_BANDS = [["any", "Any price"], ["100", "Under AED 100/wk"], ["200", "Under AED 200/wk"], ["200+", "AED 200+/wk"]];

function Skeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="bg-white border border-[#eceaf3] rounded-[18px] p-3.5 flex gap-3.5 animate-pulse">
          <div className="w-16 h-16 rounded-xl bg-[#efedf6]" />
          <div className="flex-1 flex flex-col gap-2 py-1"><div className="h-4 w-2/3 bg-[#efedf6] rounded" /><div className="h-3 w-1/2 bg-[#efedf6] rounded" /><div className="h-3 w-1/3 bg-[#efedf6] rounded" /></div>
        </div>
      ))}
    </div>
  );
}

export default function ScreenLocations() {
  const [screens, setScreens] = useState(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [emirate, setEmirate] = useState("all");
  const [type, setType] = useState("all");
  const [price, setPrice] = useState("any");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [active, setActive] = useState(null);

  const load = () => {
    setError(""); setScreens(null);
    base44.functions.invoke("marketplaceScreens", {})
      .then((r) => setScreens(r?.data?.screens || []))
      .catch(() => setError("We couldn't load the screens. Check your connection and try again."));
  };
  useEffect(load, []);

  const emirates = useMemo(() => [...new Set((screens || []).map((s) => s.venue.emirate).filter(Boolean))].sort(), [screens]);
  const types = useMemo(() => [...new Set((screens || []).map((s) => s.venue.venue_type).filter(Boolean))].sort(), [screens]);

  const shown = useMemo(() => (screens || []).filter((s) => {
    const text = `${s.venue.name} ${s.venue.area} ${s.venue.emirate} ${s.name} ${s.position_label}`.toLowerCase();
    if (q.trim() && !text.includes(q.trim().toLowerCase())) return false;
    if (emirate !== "all" && s.venue.emirate !== emirate) return false;
    if (type !== "all" && s.venue.venue_type !== type) return false;
    if (price === "100" && s.price_per_week >= 100) return false;
    if (price === "200" && s.price_per_week >= 200) return false;
    if (price === "200+" && s.price_per_week < 200) return false;
    return true;
  }), [screens, q, emirate, type, price]);

  const venues = useMemo(() => {
    const m = new Map();
    for (const s of shown) {
      const v = m.get(s.venue.id) || { ...s.venue, screens: [], photo: s.photo_url };
      v.screens.push(s);
      if (!v.photo && s.photo_url) v.photo = s.photo_url;
      m.set(s.venue.id, v);
    }
    return [...m.values()].map((v) => ({ ...v, from: Math.min(...v.screens.map((s) => s.price_per_week)) }));
  }, [shown]);

  const stats = [
    [Store, screens ? new Set(screens.map((s) => s.venue.id)).size : "–", "Founding venues"],
    [Radio, screens ? screens.filter((s) => s.is_online).length : "–", "Live screens"],
    [Globe2, emirates.length || 1, "Emirates"],
  ];
  const where = emirate !== "all" ? emirate : "the UAE";

  const list = error ? (
    <div className="bg-white border border-[#eceaf3] rounded-[18px] p-5 flex flex-col gap-3 items-start">
      <p className="text-[15px] text-[#111027]">{error}</p>
      <Btn kind="light" onClick={load}>Try again</Btn>
    </div>
  ) : !screens ? <Skeleton /> : venues.length === 0 ? (
    <div className="rounded-[20px] p-5 flex flex-col gap-3 items-start text-white" style={{ backgroundImage: "linear-gradient(150deg,#1e1150,#0d0a1f)" }}>
      <span className="rounded-xl p-2.5 bg-white/10"><MonitorPlay className="w-6 h-6 text-[#c4b5fd]" /></span>
      <p className="font-bold text-[18px] leading-snug">{screens.length ? "No venues match those filters" : "The map is filling up"}</p>
      <p className="text-[14px] text-[#bdb6e3]">{screens.length ? "Clear a filter to see more screens." : "Founding venues are onboarding now. Own a café, gym, clinic or shop? List your screen free and be first on the map."}</p>
      {!screens.length && (
        <div className="flex flex-wrap gap-2">
          <Link to="/signup" className="rounded-xl px-4 py-2.5 text-[14px] font-semibold text-white" style={{ backgroundImage: GRAD }}>List your screen — free</Link>
          <a href={WHATSAPP} target="_blank" rel="noreferrer" className="rounded-xl px-4 py-2.5 text-[14px] font-semibold bg-white/10 border border-white/20">Ask on WhatsApp</a>
        </div>
      )}
    </div>
  ) : (
    <div className="flex flex-col gap-2.5">
      {venues.map((v) => (
        <button key={v.id} onClick={() => setActive(v.id)} className={`text-left bg-white border rounded-[18px] p-3.5 flex gap-3.5 transition ${active === v.id ? "border-[#6f3ffd] ring-2 ring-[#6f3ffd]/15" : "border-[#eceaf3] hover:border-[#c9bdfb]"}`}>
          {v.photo ? <img src={v.photo} alt="" loading="lazy" className="w-16 h-16 rounded-xl object-cover shrink-0" /> : <div className="w-16 h-16 rounded-xl bg-[#f1ecff] flex items-center justify-center shrink-0"><MonitorPlay className="w-6 h-6 text-[#6f3ffd]" /></div>}
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <p className="font-bold text-[15px] text-[#111027] truncate">{v.name}</p>
            <p className="text-[12px] text-[#6b6787] truncate">{label(v.venue_type)} · {v.area || v.emirate}</p>
            <div className="flex flex-wrap gap-1.5">
              <span className="bg-[#f1ecff] text-[#5a2ded] rounded-full px-2 py-0.5 text-[11px] font-semibold">{v.screens.length} screen{v.screens.length === 1 ? "" : "s"}</span>
              <span className="bg-[#dcfce7] text-[#166534] rounded-full px-2 py-0.5 text-[11px] font-semibold inline-flex items-center gap-1"><BadgeCheck className="w-3 h-3" />Verified</span>
            </div>
          </div>
          <p className="self-center font-bold text-[13px] text-[#5a2ded] whitespace-nowrap">AED {v.from}<span className="font-medium text-[#8f86b8]">/wk</span></p>
        </button>
      ))}
    </div>
  );

  const panelHead = (
    <>
      <div className="flex items-center gap-2 text-[12px] font-semibold text-[#5a2ded]"><MapPin className="w-4 h-4" />Screen network · UAE</div>
      <h1 className="font-bold text-[26px] leading-[1.15] tracking-[-0.8px] text-[#111027]">Find screens across the UAE</h1>
      <div className="grid grid-cols-3 gap-2">
        {stats.map(([Icon, n, t]) => (
          <div key={t} className="rounded-xl bg-[#f7f5fd] px-3 py-2.5">
            <div className="flex items-center gap-1.5"><Icon className="w-3.5 h-3.5 text-[#6f3ffd]" /><span className="font-bold text-[18px] text-[#111027]">{n}</span></div>
            <p className="text-[11px] font-medium text-[#6b6787]">{t}</p>
          </div>
        ))}
      </div>
    </>
  );

  const filters = (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 h-11 rounded-xl border border-[#eceaf3] bg-white px-3 focus-within:border-[#6f3ffd]">
        <Search className="w-4 h-4 text-[#8f86b8]" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search venues or areas…" className="flex-1 outline-none text-[14px] bg-transparent" />
      </label>
      <div className="grid grid-cols-3 gap-2 [&_select]:h-10 [&_select]:text-[13px] [&_select]:px-3">
        <Select value={emirate} onChange={(e) => setEmirate(e.target.value)}><option value="all">All emirates</option>{emirates.map((e) => <option key={e}>{e}</option>)}</Select>
        <Select value={type} onChange={(e) => setType(e.target.value)}><option value="all">All types</option>{types.map((t) => <option key={t} value={t}>{label(t)}</option>)}</Select>
        <Select value={price} onChange={(e) => setPrice(e.target.value)}>{PRICE_BANDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</Select>
      </div>
      {screens && !error && <p className="text-[13px] font-semibold text-[#111027] pt-1">{venues.length} venue{venues.length === 1 ? "" : "s"} in {where}</p>}
    </div>
  );

  return (
    <SitePage>
      <SEOHead title="Screen map — advertise on venue screens in the UAE | BeyondWalls" description="Browse verified venues on the map, see each screen's position and weekly price, and book in minutes." canonical="https://beyondwalls.linkzoneglobal.com/ScreenLocations" />
      <section className="relative h-[calc(100svh-81px)] min-h-[560px] bg-[#e9e6f3] overflow-hidden">
        <div className="absolute inset-0">
          {screens ? (
            <ScreensMap bare pickLabel="Show in list" screens={shown}
              selected={active ? shown.filter((s) => s.venue.id === active).map((s) => s.id) : []}
              onToggle={(id) => { const s = shown.find((x) => x.id === id); if (s) { setActive(s.venue.id); setSheetOpen(true); } }}
              searchClass="top-4 right-4 w-[min(360px,calc(100%-2rem))] lg:w-[360px]" />
          ) : <div className="w-full h-full bw-shimmer" />}
        </div>

        {/* Desktop: floating glass panel */}
        <aside className="hidden lg:flex absolute top-5 left-5 bottom-5 w-[410px] z-10 flex-col rounded-[26px] bg-white/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(13,10,31,0.25)] border border-white overflow-hidden">
          <div className="p-5 flex flex-col gap-4 border-b border-[#eceaf3]">{panelHead}{filters}</div>
          <div className="flex-1 overflow-y-auto p-4">{list}</div>
          <div className="p-4 border-t border-[#eceaf3] flex gap-2">
            <Link to="/signup" className="flex-1 text-center rounded-xl py-3 text-[14px] font-semibold text-white" style={{ backgroundImage: GRAD }}>Sign up free to book</Link>
            <Link to="/ForAdvertisers" className="rounded-xl px-4 py-3 text-[14px] font-semibold border border-[#eceaf3] text-[#111027]">How it works</Link>
          </div>
        </aside>

        {/* Mobile: bottom sheet */}
        <div className={`lg:hidden absolute inset-x-0 bottom-0 z-10 rounded-t-[26px] bg-white shadow-[0_-12px_40px_rgba(13,10,31,0.25)] transition-[max-height] duration-300 flex flex-col ${sheetOpen ? "max-h-[82%]" : "max-h-[210px]"}`}>
          <button onClick={() => setSheetOpen(!sheetOpen)} className="flex flex-col items-center pt-2.5 pb-1" aria-label={sheetOpen ? "Show map" : "Show list"}>
            <span className="h-1.5 w-10 rounded-full bg-[#dcd8ea]" />
            <ChevronUp className={`w-4 h-4 text-[#8f86b8] mt-1 transition-transform ${sheetOpen ? "rotate-180" : ""}`} />
          </button>
          <div className="px-4 pb-3 flex flex-col gap-3">{panelHead}</div>
          <div className="flex-1 overflow-y-auto px-4 pb-6 flex flex-col gap-3">{filters}{list}</div>
        </div>
      </section>
    </SitePage>
  );
}
