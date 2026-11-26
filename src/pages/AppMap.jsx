import { useEffect, useRef, useState } from 'react';
import { loadGoogleMaps, GOOGLE_MAP_ID, onGoogleRefused } from '@/lib/mapsConfig';

/**
 * Google map for the Beyond Walls mobile app (shown inside a WebView, so it uses the website's Maps key).
 * The app sends: { type: 'data', pins: [{ id, lat, lng, label, on }], me?: {lat,lng}, radiusKm?, fit? }
 * The page sends back: { type: 'ready' } · { type: 'select', id } · { type: 'center', lat, lng } (pin mode) · { type: 'error' }
 * ?mode=pin shows a fixed centre pin and reports where the map stops.
 */
const UAE = { lat: 25.12, lng: 55.2 };
const post = (m) => { try { window.ReactNativeWebView?.postMessage(JSON.stringify(m)); } catch (e) { /* not in the app */ } };

function pill(label, on) {
  const el = document.createElement('div');
  el.style.cssText = `display:flex;align-items:center;gap:4px;padding:6px 10px;border-radius:999px;font:700 13px Inter,system-ui,sans-serif;white-space:nowrap;box-shadow:0 6px 16px rgba(31,20,77,.18);${on ? 'background:#6F3FFD;color:#fff;border:2px solid #fff' : 'background:#fff;color:#111027'}`;
  el.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${on ? '#fff' : '#5A2DED'}" stroke-width="2.4"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>${String(label).replace(/</g, '')}`;
  return el;
}

export default function AppMap() {
  const box = useRef(null);
  const g = useRef(null);
  const map = useRef(null);
  const marks = useRef([]);
  const extras = useRef([]);
  const [failed, setFailed] = useState(false);
  const pinMode = new URLSearchParams(window.location.search).get('mode') === 'pin';

  useEffect(() => {
    document.body.style.margin = '0';
    let alive = true;
    loadGoogleMaps().then((api) => {
      if (!alive) return;
      g.current = api;
      map.current = new api.Map(box.current, { center: UAE, zoom: 11, mapId: GOOGLE_MAP_ID, disableDefaultUI: true, zoomControl: true, gestureHandling: 'greedy', clickableIcons: false });
      if (pinMode) map.current.addListener('dragend', () => { const c = map.current.getCenter(); post({ type: 'center', lat: c.lat(), lng: c.lng() }); });
      post({ type: 'ready' });
    }).catch(() => { setFailed(true); post({ type: 'error' }); });
    const off = onGoogleRefused(() => { setFailed(true); post({ type: 'error' }); });

    const onMsg = (e) => {
      let d = e.data;
      try { if (typeof d === 'string') d = JSON.parse(d); } catch (x) { return; }
      if (!d || d.type !== 'data' || !g.current) return;
      const api = g.current;
      marks.current.forEach((m) => { m.map = null; });
      extras.current.forEach((x) => x.setMap ? x.setMap(null) : (x.map = null));
      marks.current = []; extras.current = [];
      const bounds = new api.LatLngBounds();
      (d.pins || []).forEach((p) => {
        if (!p.lat || !p.lng) return;
        const m = new api.AdvancedMarkerElement({ map: map.current, position: { lat: p.lat, lng: p.lng }, content: pill(p.label, p.on), zIndex: p.on ? 10 : 1 });
        m.addListener('click', () => post({ type: 'select', id: p.id }));
        marks.current.push(m);
        bounds.extend({ lat: p.lat, lng: p.lng });
      });
      if (d.me?.lat) {
        const dot = document.createElement('div');
        dot.style.cssText = 'width:16px;height:16px;border-radius:50%;background:#2563EB;border:3px solid #fff;box-shadow:0 0 0 6px rgba(37,99,235,.2)';
        extras.current.push(new api.AdvancedMarkerElement({ map: map.current, position: d.me, content: dot }));
        if (d.radiusKm) extras.current.push(new api.Circle({ map: map.current, center: d.me, radius: d.radiusKm * 1000, strokeColor: '#6F3FFD', strokeOpacity: 0.6, strokeWeight: 1.5, fillColor: '#6F3FFD', fillOpacity: 0.12 }));
        bounds.extend(d.me);
      }
      if (d.center?.lat) { map.current.setCenter(d.center); map.current.setZoom(d.zoom || 15); if (pinMode) post({ type: 'center', lat: d.center.lat, lng: d.center.lng }); }
      else if (d.fit !== false && marks.current.length > 1) map.current.fitBounds(bounds, 50);
      else if (marks.current.length === 1) { map.current.setCenter(bounds.getCenter()); map.current.setZoom(14); }
    };
    window.addEventListener('message', onMsg);
    document.addEventListener('message', onMsg);
    return () => { alive = false; off(); window.removeEventListener('message', onMsg); document.removeEventListener('message', onMsg); };
  }, []); // eslint-disable-line

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#E8E6EF' }}>
      <div ref={box} style={{ position: 'absolute', inset: 0 }} />
      {pinMode && !failed ? (
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-100%)', pointerEvents: 'none' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#E5484D" stroke="#fff" strokeWidth="1.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" fill="#fff" /></svg>
        </div>
      ) : null}
      {failed ? <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', font: '600 14px Inter,sans-serif', color: '#6B6787', padding: 24, textAlign: 'center' }}>Map couldn't load. Check your connection.</div> : null}
    </div>
  );
}
