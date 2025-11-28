import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const UAE_AREAS = {
  "Dubai": ["Downtown Dubai", "Dubai Marina", "JBR", "Business Bay", "DIFC", "Jumeirah", "Al Barsha", "Deira", "Bur Dubai", "JLT", "Palm Jumeirah", "Dubai Hills", "Al Quoz", "Silicon Oasis", "Dubai Internet City"],
  "Abu Dhabi": ["Corniche", "Al Reem Island", "Saadiyat Island", "Yas Island", "Khalifa City", "Al Mushrif", "Tourist Club Area", "Madinat Zayed"],
  "Sharjah": ["Al Majaz", "Al Nahda", "Al Taawun", "Al Khan", "Al Qasba", "Muwaileh", "University City"],
  "Ajman": ["Al Rashidiya", "Al Nuaimia", "Al Sawan", "Emirates City"],
  "Ras Al Khaimah": ["Al Nakheel", "Al Dhait", "Khuzam", "RAK Free Zone"],
  "Fujairah": ["Fujairah City", "Dibba Al Fujairah"],
  "Umm Al Quwain": ["UAQ City", "UAQ Marina"]
};

export default function UAEAddressInput({ 
  value, 
  onChange, 
  label = "Address",
  required = false,
  className = ""
}) {
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [building, setBuilding] = useState("");

  useEffect(() => {
    if (value && !city && !area) {
      // Try to parse existing value
      const parts = value.split(",").map(p => p.trim());
      if (parts.length >= 2) {
        setBuilding(parts[0] || "");
      }
    }
  }, []);

  const updateAddress = (newCity, newArea, newBuilding) => {
    const parts = [];
    if (newBuilding) parts.push(newBuilding);
    if (newArea) parts.push(newArea);
    if (newCity) parts.push(newCity);
    parts.push("UAE");
    onChange(parts.join(", "));
  };

  const handleCityChange = (val) => {
    setCity(val);
    setArea("");
    updateAddress(val, "", building);
  };

  const handleAreaChange = (val) => {
    setArea(val);
    updateAddress(city, val, building);
  };

  const handleBuildingChange = (e) => {
    const val = e.target.value;
    setBuilding(val);
    updateAddress(city, area, val);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <Label className="flex items-center gap-2 text-slate-700">
        <MapPin className="w-4 h-4 text-violet-600" />
        {label} {required && <span className="text-rose-500">*</span>}
      </Label>

      <div className="grid grid-cols-2 gap-2">
        <Select value={city} onValueChange={handleCityChange}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Emirate" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(UAE_AREAS).map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={area} onValueChange={handleAreaChange} disabled={!city}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Area" />
          </SelectTrigger>
          <SelectContent>
            {city && UAE_AREAS[city]?.map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Input
        placeholder="Building/Street (optional)"
        value={building}
        onChange={handleBuildingChange}
        className="h-11"
      />
    </div>
  );
}