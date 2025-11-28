import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2, X, Navigation } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Pre-defined UAE areas for suggestions
const UAE_AREAS = {
  "Dubai": [
    "Downtown Dubai", "Dubai Marina", "JBR", "Business Bay", "DIFC", 
    "Jumeirah", "Al Barsha", "Deira", "Bur Dubai", "JLT", "Palm Jumeirah",
    "Dubai Hills", "Arabian Ranches", "Sports City", "Motor City", "Al Quoz",
    "Silicon Oasis", "International City", "Discovery Gardens", "Dubai Internet City",
    "Dubai Media City", "Knowledge Village", "Dubai Investment Park"
  ],
  "Abu Dhabi": [
    "Corniche", "Al Reem Island", "Saadiyat Island", "Yas Island", "Khalifa City",
    "Al Mushrif", "Al Nahyan", "Tourist Club Area", "Hamdan Street", "Electra Street",
    "Madinat Zayed", "Al Maryah Island", "Al Bateen"
  ],
  "Sharjah": [
    "Al Majaz", "Al Nahda", "Al Taawun", "Al Khan", "Al Qasba", "Muwaileh",
    "University City", "Industrial Area", "Rolla", "Al Jubail"
  ],
  "Ajman": [
    "Al Rashidiya", "Al Nuaimia", "Al Sawan", "Emirates City", "Al Jurf"
  ],
  "Ras Al Khaimah": [
    "Al Nakheel", "Al Dhait", "Khuzam", "Al Mamourah", "RAK Free Zone"
  ],
  "Fujairah": [
    "Fujairah City", "Dibba Al Fujairah", "Khor Fakkan"
  ],
  "Umm Al Quwain": [
    "UAQ City", "UAQ Marina"
  ]
};

export default function UAEAddressInput({ 
  value, 
  onChange, 
  onLocationSelect,
  label = "Address",
  required = false,
  showMap = true,
  className = ""
}) {
  const [inputValue, setInputValue] = useState(value || "");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    if (value) setInputValue(value);
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    
    // Generate suggestions based on input
    if (val.length >= 2) {
      const allAreas = [];
      Object.entries(UAE_AREAS).forEach(([cityName, areas]) => {
        areas.forEach(areaName => {
          if (areaName.toLowerCase().includes(val.toLowerCase()) ||
              cityName.toLowerCase().includes(val.toLowerCase())) {
            allAreas.push({ city: cityName, area: areaName });
          }
        });
      });
      setSuggestions(allAreas.slice(0, 8));
      setShowSuggestions(allAreas.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const fullAddress = `${suggestion.area}, ${suggestion.city}, UAE`;
    setInputValue(fullAddress);
    setCity(suggestion.city);
    setArea(suggestion.area);
    onChange(fullAddress);
    setShowSuggestions(false);
    
    if (onLocationSelect) {
      // Get approximate coordinates for UAE cities
      const cityCoords = {
        "Dubai": { lat: 25.2048, lng: 55.2708 },
        "Abu Dhabi": { lat: 24.4539, lng: 54.3773 },
        "Sharjah": { lat: 25.3462, lng: 55.4209 },
        "Ajman": { lat: 25.4052, lng: 55.5136 },
        "Ras Al Khaimah": { lat: 25.7953, lng: 55.9432 },
        "Fujairah": { lat: 25.1288, lng: 56.3265 },
        "Umm Al Quwain": { lat: 25.5647, lng: 55.5552 }
      };
      if (cityCoords[suggestion.city]) {
        onLocationSelect(cityCoords[suggestion.city]);
      }
    }
  };

  const handleCityChange = (selectedCity) => {
    setCity(selectedCity);
    setArea("");
    if (selectedCity) {
      const newAddress = area ? `${area}, ${selectedCity}, UAE` : `${selectedCity}, UAE`;
      setInputValue(newAddress);
      onChange(newAddress);
    }
  };

  const handleAreaChange = (selectedArea) => {
    setArea(selectedArea);
    if (city && selectedArea) {
      const newAddress = `${selectedArea}, ${city}, UAE`;
      setInputValue(newAddress);
      onChange(newAddress);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      return;
    }
    
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Simple reverse geocoding using coordinates
        // In production, you'd use a proper geocoding API
        let nearestCity = "Dubai"; // Default
        
        // Simple distance check to UAE cities
        const cities = [
          { name: "Dubai", lat: 25.2048, lng: 55.2708 },
          { name: "Abu Dhabi", lat: 24.4539, lng: 54.3773 },
          { name: "Sharjah", lat: 25.3462, lng: 55.4209 },
          { name: "Ajman", lat: 25.4052, lng: 55.5136 },
          { name: "Ras Al Khaimah", lat: 25.7953, lng: 55.9432 },
          { name: "Fujairah", lat: 25.1288, lng: 56.3265 },
          { name: "Umm Al Quwain", lat: 25.5647, lng: 55.5552 }
        ];
        
        let minDist = Infinity;
        cities.forEach(city => {
          const dist = Math.sqrt(
            Math.pow(latitude - city.lat, 2) + Math.pow(longitude - city.lng, 2)
          );
          if (dist < minDist) {
            minDist = dist;
            nearestCity = city.name;
          }
        });
        
        setCity(nearestCity);
        const address = `${nearestCity}, UAE`;
        setInputValue(address);
        onChange(address);
        
        if (onLocationSelect) {
          onLocationSelect({ lat: latitude, lng: longitude });
        }
        
        setLoading(false);
      },
      (error) => {
        console.error("Location error:", error);
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <Label className="flex items-center gap-2 text-slate-700">
        <MapPin className="w-4 h-4 text-violet-600" />
        {label} {required && <span className="text-rose-500">*</span>}
      </Label>

      {/* City and Area Selectors */}
      <div className="grid grid-cols-2 gap-3">
        <Select value={city} onValueChange={handleCityChange}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Select Emirate" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(UAE_AREAS).map((cityName) => (
              <SelectItem key={cityName} value={cityName}>
                {cityName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={area} onValueChange={handleAreaChange} disabled={!city}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Select Area" />
          </SelectTrigger>
          <SelectContent>
            {city && UAE_AREAS[city]?.map((areaName) => (
              <SelectItem key={areaName} value={areaName}>
                {areaName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Full Address Input with Autocomplete */}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Building name, street, landmark..."
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          className="h-12 pr-20"
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {inputValue && (
            <button
              type="button"
              onClick={() => {
                setInputValue("");
                setCity("");
                setArea("");
                onChange("");
              }}
              className="p-1.5 hover:bg-slate-100 rounded-full"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={loading}
            className="p-1.5 hover:bg-violet-100 rounded-full text-violet-600"
            title="Use my current location"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-violet-50 flex items-center gap-3 transition-colors border-b border-slate-100 last:border-0"
              >
                <MapPin className="w-4 h-4 text-violet-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-slate-900">{suggestion.area}</p>
                  <p className="text-sm text-slate-500">{suggestion.city}, UAE</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400">
        Select your emirate and area, or type to search
      </p>
    </div>
  );
}