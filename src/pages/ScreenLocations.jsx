import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, BadgeCheck, List, Map as MapIcon, MonitorPlay } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SEOHead from "@/components/SEOHead";
import { SitePage } from "@/components/site/Site";
import { Tag, Btn, inputCls, wrap } from "@/components/site/inner";
import ScreensMap from "@/components/portal/ScreensMap";

const label = (t) => (t || "venue").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const PRICE_BANDS = [["any", "Any price"], ["100", "Under AED 100/wk"], ["200", "Under AED 200/wk"], ["200+", "AED 200+/wk"]];

function Skeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="bg-white border border-[#eceaf3] rounded-[18px] p-4 flex gap-4 animate-pulse">
          <div className="w-20 h-20 rounded-xl bg-[#efedf6]" />
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
  const [view, setView] = useState("list");
  const [active, setActive] = useState(null);

  const load = () => {
    setError(""); setScreens(null);
    base44.functions.invoke("marketplaceScreens", {})
      .then((r) => setScreens(r?.data?.screens || []))
      .catch(() => setError("We couldn't load the screen map. Check your connection and try again."));
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
    [screens ? new Set(screens.map((s) => s.venue.id)).size : "—", "Founding venues", "Onboarding now"],
    [screens ? screens.filter((s) => s.is_online).length : "—", "Live screens", "Updated in real time"],
    [emirates.length || 1, "Emirates", "Dubai first, then UAE"],
  ];
  const where = emirate !== "all" ? emirate : "the UAE";

  return (
    <SitePage>
      <SEOHead title="Screen map — advertise on venue screens in the UAE | BeyondWalls" description="Browse verified venues, see each screen's position and weekly price, and book in minutes." canonical="https://beyondwalls.ae/ScreenLocations" />
      <section className="bg-[#fbfaff]">
        <div className={`${wrap} pt-12 lg:pt-16 pb-8 flex flex-col lg:flex-row lg:items-end gap-8 justify-between`}>
          <div className="flex flex-col gap-4 items-start">
            <Tag>Screen network</Tag>
            <h1 className="font-bold text-[36px] md:text-[48px] leading-[1.1] tracking-[-1.44px] text-[#111027]">Find screens across the UAE</h1>
            <p className="text-[17px] text-[#6b6787] max-w-[560px]">Browse verified venues, see each screen's position and price, and book in minutes.</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {stats.map(([n, t, d]) => (
              <div key={t} className="bg-white border border-[#eceaf3] rounded-[18px] px-4 py-3 min-w-[120px]">
                <p className="font-bold text-[24px] text-[#111027]">{n}</p>
                <p className="font-semibold text-[13px] text-[#111027]">{t}</p>
                <p className="text-[12px] text-[#6b6787]">{d}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={`${wrap} pb-6`}>
          <div className="bg-white border border-[#eceaf3] rounded-[18px] p-3 flex flex-col md:flex-row gap-3">
            <label className="flex-1 flex items-center gap-2 px-3">
              <Search className="w-4 h-4 text-[#8f86b8]" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search venues or areas…" className="flex-1 py-2.5 outline-none text-[15px] bg-transparent" />
            </label>
            <select value={emirate} onChange={(e) => setEmirate(e.target.value)} className={`${inputCls} md:w-44`}><option value="all">All emirates</option>{emirates.map((e) => <option key={e}>{e}</option>)}</select>
            <select value={type} onChange={(e) => setType(e.target.value)} className={`${inputCls} md:w-48`}><option value="all">All venue types</option>{types.map((t) => <option key={t} value={t}>{label(t)}</option>)}</select>
            <select value={price} onChange={(e) => setPrice(e.target.value)} className={`${inputCls} md:w-48`}>{PRICE_BANDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            <div className="lg:hidden grid grid-cols-2 bg-[#f6f5fa] rounded-xl p-1">
              {[["list", List, "List"], ["map", MapIcon, "Map"]].map(([k, Icon, l]) => (
                <button key={k} onClick={() => setView(k)} className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-semibold ${view === k ? "bg-white text-[#5a2ded] shadow-sm" : "text-[#6b6787]"}`}><Icon className="w-4 h-4" />{l}</button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fbfaff]">
        <div className={`${wrap} pb-16 flex flex-col lg:flex-row gap-5`}>
          <div className={`lg:w-[420px] shrink-0 flex flex-col gap-3 ${view === "map" ? "hidden lg:flex" : ""}`}>
            {error ? (
              <div className="bg-white border border-[#eceaf3] rounded-[18px] p-6 flex flex-col gap-3 items-start">
                <p className="text-[15px] text-[#111027]">{error}</p>
                <Btn kind="light" onClick={load}>Try again</Btn>
              </div>
            ) : !screens ? <Skeleton /> : (
              <>
                <p className="font-semibold text-[15px] text-[#111027]">{venues.length} venue{venues.length === 1 ? "" : "s"} in {where}</p>
                {venues.length === 0 ? (
                  <div className="bg-white border border-[#eceaf3] rounded-[18px] p-6 flex flex-col gap-3 items-start">
                    <MonitorPlay className="w-8 h-8 text-[#6f3ffd]" />
                    <p className="font-bold text-[17px] text-[#111027]">{screens.length ? "No venues match those filters" : "Founding venues are onboarding now"}</p>
                    <p className="text-[14px] text-[#6b6787]">{screens.length ? "Clear a filter to see more screens." : "The first screens go live soon. Own a venue? List yours free and be first on the map."}</p>
                    {!screens.length && <Btn to="/signup">List your screen — free</Btn>}
                  </div>
                ) : venues.map((v) => (
                  <button key={v.id} onClick={() => setActive(v.id)} className={`text-left bg-white border rounded-[18px] p-4 flex gap-4 transition ${active === v.id ? "border-[#6f3ffd] ring-2 ring-[#6f3ffd]/15" : "border-[#eceaf3] hover:border-[#c9bdfb]"}`}>
                    {v.photo ? <img src={v.photo} alt="" loading="lazy" className="w-20 h-20 rounded-xl object-cover shrink-0" /> : <div className="w-20 h-20 rounded-xl bg-[#f1ecff] flex items-center justify-center shrink-0"><MonitorPlay className="w-7 h-7 text-[#6f3ffd]" /></div>}
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <p className="font-bold text-[16px] text-[#111027] truncate">{v.name}</p>
                      <p className="text-[13px] text-[#6b6787] truncate">{label(v.venue_type)} · {v.area || v.emirate}</p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="bg-[#f1ecff] text-[#5a2ded] rounded-full px-2 py-0.5 text-[11px] font-semibold">{v.screens.length} screen{v.screens.length === 1 ? "" : "s"}</span>
                        <span className="bg-[#dcfce7] text-[#166534] rounded-full px-2 py-0.5 text-[11px] font-semibold inline-flex items-center gap-1"><BadgeCheck className="w-3 h-3" />Verified</span>
                      </div>
                      <p className="font-bold text-[14px] text-[#5a2ded]">from AED {v.from}/wk</p>
                    </div>
                  </button>
                ))}
                {venues.length > 0 && <Btn to="/signup" className="mt-2">Sign up free to book</Btn>}
              </>
            )}
          </div>
          <div className={`flex-1 min-w-0 ${view === "list" ? "hidden lg:block" : ""}`}>
            {screens ? (
              <ScreensMap pickLabel="Show in list" heightClass="h-[480px] lg:h-[640px]" screens={shown} selected={active ? shown.filter((s) => s.venue.id === active).map((s) => s.id) : []} onToggle={(id) => { const s = shown.find((x) => x.id === id); if (s) setActive(s.venue.id); }} />
            ) : <div className="w-full h-[480px] lg:h-[690px] rounded-[18px] bg-[#efedf6] animate-pulse" />}
          </div>
        </div>
      </section>
      <div className="bg-[#fbfaff] pb-4 text-center">
        <Link to="/ForAdvertisers" className="text-[14px] font-semibold text-[#5a2ded]">How advertising works →</Link>
      </div>
    </SitePage>
  );
}
