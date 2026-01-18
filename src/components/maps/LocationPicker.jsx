import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { MapPin, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const selectedIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapClickHandler({ onClick }) {
  useMapEvents({
    click: (e) => {
      onClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export default function LocationPicker({ onLocationSelect, initialLat, initialLng, className = "" }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [map, setMap] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );

  // Dubai center as default
  const defaultCenter = [25.2048, 55.2708];
  const defaultZoom = 11;

  const handleLocationClick = (lat, lng) => {
    setSelectedPosition([lat, lng]);
    onLocationSelect(lat, lng);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ", UAE")}&limit=1`,
        {
          headers: {
            'User-Agent': 'BeyondWalls Venue Onboarding'
          }
        }
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lon);
        handleLocationClick(latNum, lngNum);
        if (map) {
          map.flyTo([latNum, lngNum], 16);
        }
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search location in UAE..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9"
          />
        </div>
        <Button 
          type="button" 
          onClick={handleSearch}
          disabled={searching}
          variant="outline"
        >
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
        </Button>
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden border-2 border-violet-200 shadow-lg" style={{ height: "400px" }}>
        <MapContainer
          center={selectedPosition || defaultCenter}
          zoom={selectedPosition ? 16 : defaultZoom}
          style={{ height: "100%", width: "100%", cursor: "crosshair" }}
          scrollWheelZoom={true}
          zoomControl={true}
          ref={setMap}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onClick={handleLocationClick} />
          {selectedPosition && (
            <Marker position={selectedPosition} icon={selectedIcon} />
          )}
        </MapContainer>
      </div>

      {/* Instructions */}
      <p className="text-sm text-slate-600 flex items-center gap-2 bg-violet-50 p-3 rounded-lg border border-violet-200">
        <MapPin className="w-4 h-4 text-violet-600" />
        <span><strong>Click anywhere on the map</strong> to pin your venue location, or search for an address above</span>
      </p>

      {/* Selected Coordinates */}
      {selectedPosition && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
          <p className="font-medium text-green-800">✓ Location Selected</p>
          <p className="text-green-600">
            Lat: {selectedPosition[0].toFixed(6)}, Lng: {selectedPosition[1].toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
}