import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  MapPin,
  Building2,
  MonitorPlay,
  DollarSign,
  Users,
  Clock,
  Star,
  List,
  Map,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const violetIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function AdvancedScreenSearch({
  screens,
  venues,
  allBookings,
  favorites,
  onSelectScreen,
  onToggleFavorite,
  selectedScreen
}) {
  const [viewMode, setViewMode] = useState("list");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [search, setSearch] = useState("");
  
  const [filters, setFilters] = useState({
    city: "",
    venue_type: "",
    screen_size: "",
    min_price: 0,
    max_price: 1000,
    min_footfall: 0,
    availability: "all", // all, available, high-availability
    screen_id: "",
    venue_name: "",
    orientation: "",
    resolution: ""
  });

  const cities = [...new Set(venues.map(v => v.city).filter(Boolean))];
  const venueTypes = [...new Set(venues.map(v => v.type).filter(Boolean))];
  const screenSizes = ["32\"", "43\"", "55\"", "65\"", "75\"", "85+\""];
  const orientations = ["portrait", "landscape"];
  const resolutions = ["HD", "FHD", "4K"];

  const getScreenAvailability = (screenId) => {
    const bookings = allBookings.filter(b => b.screen_id === screenId);
    return 5 - bookings.length;
  };

  const filteredScreens = useMemo(() => {
    return screens.filter(screen => {
      const venue = venues.find(v => v.id === screen.venue_id);
      if (!venue) return false;

      // Text search
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch = 
          screen.name?.toLowerCase().includes(searchLower) ||
          screen.id?.toLowerCase().includes(searchLower) ||
          venue.name?.toLowerCase().includes(searchLower) ||
          venue.city?.toLowerCase().includes(searchLower) ||
          venue.area?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Screen ID filter
      if (filters.screen_id && !screen.id?.toLowerCase().includes(filters.screen_id.toLowerCase())) {
        return false;
      }

      // Venue name filter
      if (filters.venue_name && !venue.name?.toLowerCase().includes(filters.venue_name.toLowerCase())) {
        return false;
      }

      // City filter
      if (filters.city && filters.city !== "all" && venue.city !== filters.city) {
        return false;
      }

      // Venue type filter
      if (filters.venue_type && filters.venue_type !== "all" && venue.type !== filters.venue_type) {
        return false;
      }

      // Screen size filter
      if (filters.screen_size && filters.screen_size !== "all" && screen.size !== filters.screen_size) {
        return false;
      }

      // Orientation filter
      if (filters.orientation && filters.orientation !== "all" && screen.orientation !== filters.orientation) {
        return false;
      }

      // Resolution filter
      if (filters.resolution && filters.resolution !== "all" && screen.resolution !== filters.resolution) {
        return false;
      }

      // Price range filter
      const price = screen.slot_price || 0;
      if (price < filters.min_price || price > filters.max_price) {
        return false;
      }

      // Footfall filter
      if (filters.min_footfall > 0 && (venue.avg_daily_footfall || 0) < filters.min_footfall) {
        return false;
      }

      // Availability filter
      const availability = getScreenAvailability(screen.id);
      if (filters.availability === "available" && availability === 0) {
        return false;
      }
      if (filters.availability === "high-availability" && availability < 3) {
        return false;
      }

      return true;
    });
  }, [screens, venues, allBookings, search, filters]);

  const resetFilters = () => {
    setFilters({
      city: "",
      venue_type: "",
      screen_size: "",
      min_price: 0,
      max_price: 1000,
      min_footfall: 0,
      availability: "all",
      screen_id: "",
      venue_name: "",
      orientation: "",
      resolution: ""
    });
    setSearch("");
  };

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== "all" && v !== 0 && v !== 1000).length;

  const isFavorite = (screenId) => favorites?.some(f => f.screen_id === screenId);

  // Map center - UAE
  const mapCenter = [25.2048, 55.2708];

  const ScreenCard = ({ screen }) => {
    const venue = venues.find(v => v.id === screen.venue_id);
    const availability = getScreenAvailability(screen.id);
    
    return (
      <Card 
        className={`cursor-pointer transition-all hover:shadow-lg ${
          selectedScreen?.id === screen.id ? "ring-2 ring-violet-600" : ""
        }`}
        onClick={() => onSelectScreen(screen)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <MonitorPlay className="w-6 h-6 text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 truncate">{screen.name}</h3>
                  <p className="text-sm text-slate-500 truncate">{venue?.name}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(e, screen.id);
                  }}
                  className={`p-1 rounded-full transition-colors ${
                    isFavorite(screen.id) 
                      ? "text-amber-500 hover:bg-amber-50" 
                      : "text-slate-300 hover:text-amber-500 hover:bg-amber-50"
                  }`}
                >
                  <Star className={`w-5 h-5 ${isFavorite(screen.id) ? "fill-current" : ""}`} />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {venue?.city}
                </span>
                <span>•</span>
                <span>{screen.size}</span>
                <span>•</span>
                <span className="capitalize">{screen.orientation}</span>
                {venue?.avg_daily_footfall && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {venue.avg_daily_footfall}/day
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <div>
              <p className="text-lg font-bold text-violet-600">AED {screen.slot_price}/week</p>
            </div>
            <Badge variant={availability === 0 ? "destructive" : availability <= 2 ? "secondary" : "default"}>
              {availability} slots
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Bar and View Toggle */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search by screen name, venue, city, or screen ID..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Advanced Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-violet-600">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between">
                  Advanced Filters
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    Reset All
                  </Button>
                </SheetTitle>
              </SheetHeader>
              
              <div className="space-y-6 mt-6">
                {/* Screen ID Search */}
                <div className="space-y-2">
                  <Label>Screen ID</Label>
                  <Input
                    placeholder="Search by screen ID..."
                    value={filters.screen_id}
                    onChange={(e) => setFilters({...filters, screen_id: e.target.value})}
                  />
                </div>

                {/* Venue Name Search */}
                <div className="space-y-2">
                  <Label>Venue Name</Label>
                  <Input
                    placeholder="Search by venue name..."
                    value={filters.venue_name}
                    onChange={(e) => setFilters({...filters, venue_name: e.target.value})}
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label>City</Label>
                  <Select value={filters.city} onValueChange={(v) => setFilters({...filters, city: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {cities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Venue Type */}
                <div className="space-y-2">
                  <Label>Venue Type</Label>
                  <Select value={filters.venue_type} onValueChange={(v) => setFilters({...filters, venue_type: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {venueTypes.map(type => (
                        <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Screen Specifications */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Screen Size</Label>
                    <Select value={filters.screen_size} onValueChange={(v) => setFilters({...filters, screen_size: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Sizes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sizes</SelectItem>
                        {screenSizes.map(size => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Orientation</Label>
                    <Select value={filters.orientation} onValueChange={(v) => setFilters({...filters, orientation: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {orientations.map(o => (
                          <SelectItem key={o} value={o} className="capitalize">{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Resolution</Label>
                  <Select value={filters.resolution} onValueChange={(v) => setFilters({...filters, resolution: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Resolutions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Resolutions</SelectItem>
                      {resolutions.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-4">
                  <Label>Price Range (AED/week)</Label>
                  <div className="px-2">
                    <Slider
                      value={[filters.min_price, filters.max_price]}
                      min={0}
                      max={1000}
                      step={50}
                      onValueChange={([min, max]) => setFilters({...filters, min_price: min, max_price: max})}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>AED {filters.min_price}</span>
                    <span>AED {filters.max_price}</span>
                  </div>
                </div>

                {/* Min Footfall */}
                <div className="space-y-2">
                  <Label>Minimum Daily Footfall</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 500"
                    value={filters.min_footfall || ""}
                    onChange={(e) => setFilters({...filters, min_footfall: parseInt(e.target.value) || 0})}
                  />
                </div>

                {/* Availability */}
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <Select value={filters.availability} onValueChange={(v) => setFilters({...filters, availability: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Screens</SelectItem>
                      <SelectItem value="available">Has Available Slots</SelectItem>
                      <SelectItem value="high-availability">3+ Slots Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Tabs value={viewMode} onValueChange={setViewMode}>
            <TabsList>
              <TabsTrigger value="list">
                <List className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="map">
                <Map className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={filters.city} onValueChange={(v) => setFilters({...filters, city: v})}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map(city => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filters.venue_type} onValueChange={(v) => setFilters({...filters, venue_type: v})}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Venue Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {venueTypes.map(type => (
              <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.availability} onValueChange={(v) => setFilters({...filters, availability: v})}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="high-availability">3+ Slots</SelectItem>
          </SelectContent>
        </Select>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="text-rose-600">
            <X className="w-4 h-4 mr-1" />
            Clear Filters
          </Button>
        )}

        <div className="ml-auto text-sm text-slate-500">
          {filteredScreens.length} screens found
        </div>
      </div>

      {/* Results */}
      {viewMode === "list" ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScreens.map((screen) => (
            <ScreenCard key={screen.id} screen={screen} />
          ))}
          {filteredScreens.length === 0 && (
            <div className="col-span-full text-center py-12">
              <MonitorPlay className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No screens match your filters</p>
              <Button variant="link" onClick={resetFilters}>Clear all filters</Button>
            </div>
          )}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="h-[500px]">
              <MapContainer
                center={mapCenter}
                zoom={10}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap'
                />
                {filteredScreens.map((screen) => {
                  const venue = venues.find(v => v.id === screen.venue_id);
                  if (!venue?.latitude || !venue?.longitude) return null;
                  
                  const availability = getScreenAvailability(screen.id);
                  
                  return (
                    <Marker
                      key={screen.id}
                      position={[venue.latitude, venue.longitude]}
                      icon={violetIcon}
                      eventHandlers={{
                        click: () => onSelectScreen(screen)
                      }}
                    >
                      <Popup>
                        <div className="p-2 min-w-[200px]">
                          <h3 className="font-semibold">{screen.name}</h3>
                          <p className="text-sm text-slate-500">{venue.name}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-bold text-violet-600">AED {screen.slot_price}/week</span>
                            <Badge variant={availability === 0 ? "destructive" : "secondary"}>
                              {availability} slots
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            className="w-full mt-2 bg-violet-600"
                            onClick={() => onSelectScreen(screen)}
                          >
                            Select Screen
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}