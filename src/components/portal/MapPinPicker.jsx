import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { loadGoogleMaps, GOOGLE_MAP_ID, onGoogleRefused } from '@/lib/mapsConfig';
import MapPinPickerOSM from './MapPinPickerOSM';

/**
 * Venue pin picker on Google Maps: search the address or business name, or tap the map; drag the pin to adjust.
 * Falls back to the OpenStreetMap picker if Google won't load.
 */
export default function MapPinPicker({ lat, lng, onChange, address }) {
  const box = useRef(null);
  const api = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');

  const place = (la, ln) => {
    const g = api.current;
    if (!marker.current) {
      marker.current = new g.AdvancedMarkerElement({ map: map.current, position: { lat: la, lng: ln }, gmpDraggable: true, title: 'Venue' });
      marker.current.addListener('dragend', () => {
        const p = marker.current.position;
        onChange(typeof p.lat === 'function' ? p.lat() : p.lat, typeof p.lng === 'function' ? p.lng() : p.lng);
      });
    } else marker.current.position = { lat: la, lng: ln };
    onChange(la, ln);
  };

  useEffect(() => {
    let alive = true;
    loadGoogleMaps().then((g) => {
      if (!alive || !box.current) return;
      api.current = g;
      const center = lat && lng ? { lat, lng } : { lat: 25.2048, lng: 55.2708 };
      map.current = new g.Map(box.current, { center, zoom: lat ? 16 : 11, mapId: GOOGLE_MAP_ID, streetViewControl: false, mapTypeControl: false, gestureHandling: 'cooperative' });
      map.current.addListener('click', (e) => place(e.latLng.lat(), e.latLng.lng()));
      if (lat && lng) place(lat, lng);
      setReady(true);
    }).catch(() => { if (alive) setFailed(true); });
    const off = onGoogleRefused(() => { if (alive) setFailed(true); });
    return () => { alive = false; off(); };
  }, []); // eslint-disable-line

  const search = async (e) => {
    e?.preventDefault();
    const text = (q || address || '').trim();
    if (!text || !ready) return;
    setErr('');
    try {
      const { results } = await new api.current.Geocoder().geocode({ address: text, region: 'ae', componentRestrictions: { country: 'AE' } });
      const r = results?.[0];
      if (!r) { setErr(`We couldn't find "${text}". Try the building or street name, or tap the map.`); return; }
      map.current.setCenter(r.geometry.location);
      map.current.setZoom(17);
      place(r.geometry.location.lat(), r.geometry.location.lng());
    } catch (ex) { setErr(`We couldn't find "${text}". Tap the map to drop the pin instead.`); }
  };

  if (failed) return <MapPinPickerOSM lat={lat} lng={lng} onChange={onChange} />;

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bw-muted" />
          <input className="bw-input !ps-9" placeholder="Search the venue or building, e.g. Bean Café JLT" value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); search(); } }} />
        </div>
        <button type="button" className="bw-btn bw-btn-ghost" disabled={!ready} onClick={() => search()}>Find</button>
      </div>
      {err && <p className="text-[12px] text-rose-600">{err}</p>}
      <div className="h-56 w-full overflow-hidden rounded-xl border border-bw-line relative z-0">
        {!ready && <div className="absolute inset-0 bw-shimmer" />}
        <div ref={box} className="h-full w-full" />
      </div>
      <p className="text-[11px] text-bw-muted">Tap the map or drag the pin to the exact entrance.</p>
    </div>
  );
}
