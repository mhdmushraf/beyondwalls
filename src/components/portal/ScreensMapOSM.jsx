import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const aed = (n) => `AED ${Number(n || 0).toLocaleString('en-AE')}`;
const pin = (on, full) => L.divIcon({
  className: 'bw-map-pin',
  html: `<div style="padding:4px 8px;border-radius:999px;font:600 11px Inter,sans-serif;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.25);border:2px solid #fff;background:${on ? '#1E1B3A' : full ? '#9CA3AF' : '#6F3FFD'};color:#fff">${on ? '✓' : ''}</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function Fit({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) map.setView(points[0], 14);
    else map.fitBounds(points, { padding: [40, 40], maxZoom: 14 });
  }, [map, points.map((p) => p.join(',')).join('|')]); // eslint-disable-line
  return null;
}

/** Bookable screens on an OpenStreetMap map (no API key needed). Venues without a map pin are listed under it. */
export default function ScreensMap({ screens, selected, onToggle }) {
  const located = screens.filter((s) => s.venue.latitude && s.venue.longitude);
  const missing = screens.length - located.length;
  const points = located.map((s) => [s.venue.latitude, s.venue.longitude]);
  return (
    <div>
      <div className="bw-card overflow-hidden h-[520px]">
        <MapContainer center={[25.2048, 55.2708]} zoom={10} className="h-full w-full" scrollWheelZoom>
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Fit points={points} />
          {located.map((s) => {
            const on = selected.includes(s.id);
            const full = s.slots_free <= 0;
            return (
              <Marker key={s.id} position={[s.venue.latitude, s.venue.longitude]} icon={pin(on, full)}>
                <Popup>
                  <div style={{ minWidth: 180 }}>
                    <p style={{ fontWeight: 700, margin: 0 }}>{s.venue.name}</p>
                    <p style={{ margin: '2px 0', color: '#6B6880', fontSize: 12 }}>{s.name} · {aed(s.price_per_week)}/wk · {full ? 'full' : `${s.slots_free} slots free`}</p>
                    <button type="button" disabled={full && !on} onClick={() => onToggle(s.id)}
                      style={{ marginTop: 6, width: '100%', padding: '6px 10px', borderRadius: 8, border: 0, background: on ? '#F0EBFF' : '#6F3FFD', color: on ? '#1E1B3A' : '#fff', fontWeight: 600, cursor: 'pointer' }}>
                      {on ? 'Added — tap to remove' : full ? 'Full for these dates' : 'Add to booking'}
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
      {missing > 0 && <p className="mt-2 text-[12px] text-bw-muted">{missing} {missing === 1 ? 'venue has' : 'venues have'} no map pin yet — switch to List to see {missing === 1 ? 'it' : 'them'}.</p>}
    </div>
  );
}
