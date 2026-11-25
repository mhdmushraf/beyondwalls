import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { loadGoogleMaps, GOOGLE_MAP_ID, onGoogleRefused } from '@/lib/mapsConfig';
import ScreensMapOSM from './ScreensMapOSM';

const aed = (n) => `AED ${Number(n || 0).toLocaleString('en-AE')}`;
const UAE = { lat: 25.2048, lng: 55.2708 };

function pinEl(s, on, full) {
  const el = document.createElement('div');
  el.style.cssText = `padding:4px 9px;border-radius:999px;font:600 12px Inter,sans-serif;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.25);border:2px solid #fff;cursor:pointer;background:${on ? '#1E1B3A' : full ? '#9CA3AF' : '#6F3FFD'};color:#fff`;
  el.textContent = on ? `✓ ${aed(s.price_per_week)}` : aed(s.price_per_week);
  return el;
}

/** Google map of bookable screens, with an area search. Falls back to OpenStreetMap if Google won't load. */
export default function ScreensMap({ screens, selected, onToggle, pickLabel = 'Add to booking', heightClass = 'h-[520px]', bare = false, searchClass = '' }) {
  const box = useRef(null);
  const api = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const info = useRef(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [q, setQ] = useState('');
  const [searchErr, setSearchErr] = useState('');

  useEffect(() => {
    let alive = true;
    loadGoogleMaps().then((g) => {
      if (!alive || !box.current) return;
      api.current = g;
      map.current = new g.Map(box.current, { center: UAE, zoom: 10, mapId: GOOGLE_MAP_ID, streetViewControl: false, mapTypeControl: false, fullscreenControl: true });
      info.current = new g.InfoWindow();
      setReady(true);
    }).catch(() => { if (alive) setFailed(true); });
    const off = onGoogleRefused(() => { if (alive) setFailed(true); });
    return () => { alive = false; off(); };
  }, []);

  // Draw / redraw pins when screens or selection change.
  useEffect(() => {
    if (!ready) return;
    const g = api.current;
    markers.current.forEach((m) => { m.map = null; });
    markers.current = [];
    const bounds = new g.LatLngBounds();
    screens.filter((s) => s.venue.latitude && s.venue.longitude).forEach((s) => {
      const on = selected.includes(s.id);
      const full = s.slots_free <= 0;
      const pos = { lat: s.venue.latitude, lng: s.venue.longitude };
      const m = new g.AdvancedMarkerElement({ map: map.current, position: pos, content: pinEl(s, on, full), title: s.venue.name });
      m.addListener('click', () => {
        const div = document.createElement('div');
        div.style.cssText = 'min-width:200px;font-family:Inter,sans-serif';
        div.innerHTML = `<p style="font-weight:700;margin:0">${s.venue.name.replace(/</g, '&lt;')}</p><p style="margin:2px 0 8px;color:#6B6880;font-size:12px">${s.name.replace(/</g, '&lt;')} · ${aed(s.price_per_week)}/wk · ${full ? 'full for these dates' : `${s.slots_free} slots free`}${s.venue.weekly_footfall ? ` · ~${s.venue.weekly_footfall.toLocaleString()} visits/wk` : ''}</p>`;
        const b = document.createElement('button');
        b.type = 'button';
        b.disabled = full && !on && pickLabel === 'Add to booking';
        b.textContent = on && pickLabel === 'Add to booking' ? 'Added — tap to remove' : full && pickLabel === 'Add to booking' ? 'Full for these dates' : pickLabel;
        b.style.cssText = `width:100%;padding:7px 10px;border-radius:8px;border:0;font-weight:600;cursor:pointer;background:${on ? '#F0EBFF' : '#6F3FFD'};color:${on ? '#1E1B3A' : '#fff'}`;
        b.onclick = () => { onToggle(s.id); info.current.close(); };
        div.appendChild(b);
        info.current.setContent(div);
        info.current.open({ map: map.current, anchor: m });
      });
      markers.current.push(m);
      bounds.extend(pos);
    });
    if (markers.current.length > 1) map.current.fitBounds(bounds, 60);
    else if (markers.current.length === 1) { map.current.setCenter(bounds.getCenter()); map.current.setZoom(14); }
  }, [ready, screens, selected]); // eslint-disable-line

  const search = async (e) => {
    e.preventDefault();
    if (!q.trim() || !ready) return;
    setSearchErr('');
    try {
      const geocoder = new api.current.Geocoder();
      const { results } = await geocoder.geocode({ address: q.trim(), region: 'ae', componentRestrictions: { country: 'AE' } });
      if (!results?.[0]) { setSearchErr(`We couldn't find "${q.trim()}" in the UAE. Try an area, like JLT or Al Barsha.`); return; }
      const r = results[0];
      if (r.geometry.viewport) map.current.fitBounds(r.geometry.viewport); else { map.current.setCenter(r.geometry.location); map.current.setZoom(14); }
    } catch (err) { setSearchErr(`We couldn't find "${q.trim()}". Try an area name, like Downtown Dubai.`); }
  };

  if (failed) return <ScreensMapOSM screens={screens} selected={selected} onToggle={onToggle} heightClass={heightClass} bare={bare} />;

  // Edge-to-edge map for full-screen layouts: no card, area search floats on the map.
  if (bare) {
    return (
      <div className="relative h-full w-full">
        <div ref={box} className="absolute inset-0" />
        {!ready && <div className="absolute inset-0 bw-shimmer" />}
        <form onSubmit={search} className={`absolute z-10 flex gap-2 ${searchClass || 'top-4 right-4 w-[min(360px,calc(100%-2rem))]'}`}>
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8f86b8]" />
            <input className="w-full h-11 rounded-xl bg-white/95 backdrop-blur border border-white shadow-[0_8px_24px_rgba(13,10,31,0.18)] ps-9 pe-3 text-[14px] outline-none focus:ring-2 focus:ring-[#6f3ffd]/30" placeholder="Jump to an area — JLT, Al Barsha…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <button type="submit" disabled={!ready} className="h-11 px-4 rounded-xl text-white text-[14px] font-semibold shadow-[0_8px_24px_rgba(90,45,237,0.35)]" style={{ backgroundImage: 'linear-gradient(135deg,#6f3ffd,#5a2ded)' }}>Go</button>
        </form>
        {searchErr && <p className="absolute z-10 top-[68px] right-4 rounded-lg bg-white px-3 py-2 text-[12px] text-rose-600 shadow">{searchErr}</p>}
      </div>
    );
  }

  const missing = screens.filter((s) => !(s.venue.latitude && s.venue.longitude)).length;
  return (
    <div>
      <form onSubmit={search} className="mb-2 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bw-muted" />
          <input className="bw-input !ps-9" placeholder="Go to an area — JLT, Al Barsha, Downtown…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button type="submit" className="bw-btn bw-btn-ghost" disabled={!ready}>Go</button>
      </form>
      {searchErr && <p className="mb-2 text-[12px] text-rose-600">{searchErr}</p>}
      <div className={`bw-card overflow-hidden ${heightClass} relative`}>
        {!ready && <div className="absolute inset-0 bw-shimmer" />}
        <div ref={box} className="h-full w-full" />
      </div>
      {missing > 0 && <p className="mt-2 text-[12px] text-bw-muted">{missing} {missing === 1 ? 'venue has' : 'venues have'} no map pin yet — switch to List to see {missing === 1 ? 'it' : 'them'}.</p>}
    </div>
  );
}
