import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Navigation, Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom violet marker
const violetIcon = new L.Icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#7c3aed" width="36" height="36">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `),
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

// UAE Cities with their coordinates
const UAE_CITIES = [
  { name: "Dubai", lat: 25.2048, lng: 55.2708 },
  { name: "Abu Dhabi", lat: 24.4539, lng: 54.3773 },
  { name: "Sharjah", lat: 25.3462, lng: 55.4209 },
  { name: "Ajman", lat: 25.4052, lng: 55.5136 },
  { name: "Ras Al Khaimah", lat: 25.7953, lng: 55.9432 },
  { name: "Fujairah", lat: 25.1288, lng: 56.3265 },
  { name: "Umm Al Quwain", lat: 25.5647, lng: 55.5552 }
];

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function MapController({ center }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], 15);
    }
  }, [center, map]);
  
  return null;
}

export default function VenueLocationPicker({ 
  value, 
  onChange,
  selectedCity = null
}) {
  const [position, setPosition] = useState(value || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 25.2048, lng: 55.2708 }); // Dubai default

  // Update center when city changes
  useEffect(() => {
    if (selectedCity) {
      const city = UAE_CITIES.find(c => c.name === selectedCity);
      if (city) {
        setMapCenter({ lat: city.lat, lng: city.lng });
      }
    }
  }, [selectedCity]);

  // Update from external value
  useEffect(() => {
    if (value && value.lat && value.lng) {
      setPosition(value);
      setMapCenter(value);
    }
  }, [value]);

  const handleLocationSelect = (coords) => {
    setPosition(coords);
    onChange({ latitude: coords.lat, longitude: coords.lng });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return;
    
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(coords);
        setMapCenter(coords);
        onChange({ latitude: coords.lat, longitude: coords.lng });
        setLoading(false);
      },
      (error) => {
        console.error("Location error:", error);
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const jumpToCity = (cityName) => {
    const city = UAE_CITIES.find(c => c.name === cityName);
    if (city) {
      setMapCenter({ lat: city.lat, lng: city.lng });
    }
  };

  return (
    <div className="space-y-3">
      {/* Quick city selection */}
      <div className="flex flex-wrap gap-2">
        {UAE_CITIES.map((city) => (
          <Button
            key={city.name}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => jumpToCity(city.name)}
            className="text-xs"
          >
            {city.name}
          </Button>
        ))}
      </div>

      {/* Map Container */}
      <div className="relative rounded-xl overflow-hidden border border-slate-200">
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={13}
          style={{ height: "300px", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          <MapController center={mapCenter} />
          {position && (
            <Marker position={[position.lat, position.lng]} icon={violetIcon} />
          )}
        </MapContainer>

        {/* Current Location Button */}
        <Button
          type="button"
          size="icon"
          variant="secondary"
          onClick={getCurrentLocation}
          disabled={loading}
          className="absolute bottom-4 right-4 z-[1000] shadow-lg"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Selected coordinates display */}
      {position && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span className="text-sm text-emerald-700">
            Location selected: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
          </span>
        </div>
      )}

      <p className="text-xs text-slate-500">
        Click on the map to select your venue's exact location, or use the button to get your current location
      </p>
    </div>
  );
}