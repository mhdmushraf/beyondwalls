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
  ChevronUp,
  Check,
  Eye
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
import { calculateEstimatedViewers } from "@/components/analytics/VenueAnalyticsCalculator";
import PerformanceBadge from "@/components/performance/PerformanceBadge";

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
  selectedScreen,
  multiSelect = false,
  selectedScreens = [],
  onToggleScreen
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
    // Count only bookings for this specific screen
    const screenBookings = allBookings.filter(b => b.screen_id === screenId && (b.status === "active" || b.status === "pending"));
    const bookedSlots = [...new Set(screenBookings.map(b => b.slot_number))].filter(Boolean);
    return 5 - bookedSlots.length;
  };

  const filteredScreens = useMemo(() => {
    return screens.filter(screen => {
      const venue = venues.find(v => v.id === screen.venue_id);
      if (!venue) return false;
      
      // Exclude suspended screens and screens from suspended venues
      if (screen.status === "suspended" || venue.status === "suspended") return false;

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

  const isScreenSelected = (screenId) => {
    if (multiSelect) {
      return selectedScreens.some(s => s.id === screenId);
    }
    return selectedScreen?.id === screenId;
  };

  const handleScreenClick = (screen) => {
    if (multiSelect && onToggleScreen) {
      onToggleScreen(screen);
    } else {
      onSelectScreen(screen);
    }
  };

  const ScreenCard = ({ screen }) => {
    const venue = venues.find(v => v.id === screen.venue_id);
    const availability = getScreenAvailability(screen.id);
    const selected = isScreenSelected(screen.id);
    
    return (
      <Card 
        className={`cursor-pointer transition-all hover:shadow-lg active:scale-[0.98] ${
          selected ? "ring-2 ring-violet-600 bg-violet-50" : ""
        }`}
        onClick={() => handleScreenClick(screen)}
      >
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            {multiSelect && (
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                selected ? "bg-violet-600 border-violet-600" : "border-slate-300"
              }`}>
                {selected && <Check className="w-3 h-3 text-white" />}
              </div>
            )}
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${
              selected ? "bg-violet-200" : "bg-violet-100"
            }`}>
              <MonitorPlay className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900 text-sm sm:text-base truncate">{screen.name}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 truncate">{venue?.name}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(e, screen.id);
                  }}
                  className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${
                    isFavorite(screen.id) 
                      ? "text-amber-500 hover:bg-amber-50" 
                      : "text-slate-300 hover:text-amber-500 hover:bg-amber-50"
                  }`}
                >
                  <Star className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite(screen.id) ? "fill-current" : ""}`} />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-slate-400">
                <span className="flex items-center gap-0.5 sm:gap-1">
                  <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  {venue?.city}
                </span>
                <span>•</span>
                <span>{screen.size}</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline capitalize">{screen.orientation}</span>
                {venue?.daily_customers > 0 && (
                  <span className="hidden lg:flex items-center gap-1 text-violet-500">
                    • <Eye className="w-3 h-3" />
                    ~{calculateEstimatedViewers(venue).estimatedDailyViewers.toLocaleString()} viewers/day
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t">
            <div className="flex items-center gap-2">
              <p className="text-base sm:text-lg font-bold text-violet-600">AED {screen.slot_price}<span className="text-xs sm:text-sm font-normal text-slate-500">/mo</span></p>
              {screen.performance_score > 0 && (
                <PerformanceBadge score={screen.performance_score} badge={screen.performance_badge} size="sm" />
              )}
            </div>
            <Badge 
              variant={availability === 0 ? "destructive" : availability <= 2 ? "secondary" : "default"}
              className="text-[10px] sm:text-xs"
            >
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
      <div className="flex flex-col gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search screens, venues, cities..." 
            className="pl-10 text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <SlidersHorizontal className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Advanced</span> Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-1 sm:ml-2 h-5 w-5 p-0 flex items-center justify-center bg-violet-600">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:w-[400px] overflow-y-auto" side="right">
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
                  <Label>Price Range (AED/month)</Label>
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
            <TabsList className="h-9">
              <TabsTrigger value="list" className="px-3">
                <List className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="map" className="px-3">
                <Map className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Quick Filters - Responsive */}
      <div className="flex flex-wrap gap-2 items-center">
        <Select value={filters.city} onValueChange={(v) => setFilters({...filters, city: v})}>
          <SelectTrigger className="w-28 sm:w-32 h-9 text-sm">
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
          <SelectTrigger className="w-28 sm:w-36 h-9 text-sm">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {venueTypes.map(type => (
              <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.availability} onValueChange={(v) => setFilters({...filters, availability: v})}>
          <SelectTrigger className="w-28 sm:w-36 h-9 text-sm">
            <SelectValue placeholder="Slots" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="high-availability">3+ Slots</SelectItem>
          </SelectContent>
        </Select>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="text-rose-600 h-9 px-2">
            <X className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Clear</span>
          </Button>
        )}

        <div className="ml-auto text-xs sm:text-sm text-slate-500 whitespace-nowrap">
          {filteredScreens.length} screens
          {multiSelect && selectedScreens.length > 0 && (
            <span className="ml-2 text-violet-600 font-medium">
              ({selectedScreens.length} selected)
            </span>
          )}
        </div>
      </div>

      {/* Results */}
      {viewMode === "list" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredScreens.map((screen) => (
            <ScreenCard key={screen.id} screen={screen} />
          ))}
          {filteredScreens.length === 0 && (
            <div className="col-span-full text-center py-8 sm:py-12">
              <MonitorPlay className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm sm:text-base">No screens match your filters</p>
              <Button variant="link" size="sm" onClick={resetFilters}>Clear all filters</Button>
            </div>
          )}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="h-[350px] sm:h-[450px] lg:h-[500px]">
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
                          <span className="font-bold text-violet-600">AED {screen.slot_price}/month</span>
                            <Badge variant={availability === 0 ? "destructive" : "secondary"}>
                              {availability} slots
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            className={`w-full mt-2 ${isScreenSelected(screen.id) ? "bg-emerald-600" : "bg-violet-600"}`}
                            onClick={() => handleScreenClick(screen)}
                          >
                            {isScreenSelected(screen.id) ? "Selected ✓" : "Select Screen"}
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