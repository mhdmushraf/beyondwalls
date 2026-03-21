import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issue with webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function VenueLocationPicker({ latitude, longitude, onChange }) {
  const defaultCenter = [25.2048, 55.2708]; // Dubai
  const position = latitude && longitude ? [latitude, longitude] : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <MapPin className="w-4 h-4 text-violet-600" />
        <span>Click on the map to pin your exact venue location</span>
      </div>
      <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: 320 }}>
        <MapContainer
          center={position || defaultCenter}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={onChange} />
          {position && <Marker position={position} />}
        </MapContainer>
      </div>
      {latitude && longitude ? (
        <div className="flex gap-4 text-xs text-slate-500 bg-violet-50 border border-violet-100 rounded-lg px-3 py-2">
          <span>📍 Lat: <strong>{latitude.toFixed(6)}</strong></span>
          <span>Lng: <strong>{longitude.toFixed(6)}</strong></span>
        </div>
      ) : (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          ⚠️ No location pinned yet — click on the map above to set your venue location
        </p>
      )}
    </div>
  );
}