import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const pinIcon = L.divIcon({
  className: 'bw-map-pin',
  html: '<div style="width:18px;height:18px;border-radius:50%;background:#FF6B57;border:3px solid #fff;box-shadow:0 0 0 2px #141E3E"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function ClickCatcher({ onPick }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

export default function MapPinPicker({ lat, lng, onChange }) {
  const center = [lat || 25.2048, lng || 55.2708];

  return (
    <div className="h-56 w-full overflow-hidden rounded-xl border border-bw-line relative z-0">
      <MapContainer center={center} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        <ClickCatcher onPick={(nextLat, nextLng) => onChange(nextLat, nextLng)} />
        {lat && lng ? <Marker position={[lat, lng]} icon={pinIcon} /> : null}
      </MapContainer>
    </div>
  );
}