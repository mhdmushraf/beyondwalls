import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  MonitorPlay,
  MapPin,
  Building2,
  Search,
  Users,
  Clock,
  X,
  Map,
  List
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead, { PAGE_SEO } from "@/components/SEOHead";
import VenueSuitabilityCalculator from "@/components/leadgen/VenueSuitabilityCalculator";

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker icons by venue type
const venueTypeColors = {
  restaurant: "red",
  cafe: "orange", 
  mall: "violet",
  gym: "green",
  coworking: "blue",
  hotel: "gold",
  hospital: "grey",
  salon: "pink",
  other: "violet"
};

const createVenueIcon = (type) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${venueTypeColors[type] || "violet"}.png`,
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const screenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Map controller component for dynamic center/zoom
function MapController({ center, zoom }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

export default function ScreenLocations() {
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState("map"); // "map" or "list"
  const [selectedVenue, setSelectedVenue] = useState(null);

  const { data: venues = [], isLoading } = useQuery({
    queryKey: ["public-venues"],
    queryFn: async () => {
      return await base44.entities.Venue.filter({ approval_status: "approved" }, '-created_date', 100, 0);
    }
  });

  const { data: screens = [] } = useQuery({
    queryKey: ["public-screens"],
    queryFn: () => base44.entities.Screen.filter({ approval_status: "approved" }, '-created_date', 200, 0)
  });

  const filteredVenues = venues.filter(venue => {
    const matchesSearch = venue.name?.toLowerCase().includes(search.toLowerCase()) ||
                         venue.area?.toLowerCase().includes(search.toLowerCase());
    const matchesCity = cityFilter === "all" || venue.city === cityFilter;
    const matchesType = typeFilter === "all" || venue.type === typeFilter;
    return matchesSearch && matchesCity && matchesType;
  });

  // Venues with coordinates for map
  const venuesWithCoords = filteredVenues.filter(v => v.latitude && v.longitude);

  const getScreenCount = (venueId) => screens.filter(s => s.venue_id === venueId).length;
  const getVenueScreens = (venueId) => screens.filter(s => s.venue_id === venueId);

  const cities = [...new Set(venues.map(v => v.city).filter(Boolean))];
  const venueTypes = [...new Set(venues.map(v => v.type).filter(Boolean))];

  const typeLabels = {
    restaurant: "Restaurant",
    cafe: "Café",
    mall: "Shopping Mall",
    gym: "Fitness Center",
    coworking: "Coworking Space",
    hotel: "Hotel",
    hospital: "Hospital"
  };

  // UAE city coordinates for focused zoom
  const cityCoords = {
    "Dubai": { center: [25.2048, 55.2708], zoom: 11 },
    "Abu Dhabi": { center: [24.4539, 54.3773], zoom: 11 },
    "Sharjah": { center: [25.3463, 55.4209], zoom: 12 },
    "Ajman": { center: [25.4052, 55.5136], zoom: 13 },
    "RAK": { center: [25.7895, 55.9432], zoom: 12 },
    "Fujairah": { center: [25.1288, 56.3265], zoom: 12 },
    "Umm Al Quwain": { center: [25.5647, 55.5533], zoom: 13 }
  };
  
  const uaeCenter = [25.2048, 55.2708]; // Dubai center
  const defaultZoom = 11; // Zoom into Dubai
  
  // Get map center based on city filter
  const getMapCenter = () => {
    if (cityFilter !== "all" && cityCoords[cityFilter]) {
      return cityCoords[cityFilter].center;
    }
    return uaeCenter;
  };
  
  const getMapZoom = () => {
    if (cityFilter !== "all" && cityCoords[cityFilter]) {
      return cityCoords[cityFilter].zoom;
    }
    return defaultZoom;
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        {...PAGE_SEO.screenLocations}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "BeyondWalls Digital Advertising Screen Locations",
          "description": "500+ digital advertising screens in premium venues across Dubai, Abu Dhabi, and Sharjah",
          "url": "https://www.beyondwalls.ae/screen-locations",
          "numberOfItems": venues.length || 500,
          "itemListElement": filteredVenues.slice(0, 20).map((venue, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "Place",
              "name": venue.name,
              "address": {
                "@type": "PostalAddress",
                "addressLocality": venue.city,
                "addressRegion": venue.area,
                "addressCountry": "AE"
              }
            }
          }))
        }}
      />
      <PublicNav />

      {/* Hero */}
      <section className="pt-32 pb-12 px-6 bg-gradient-to-br from-violet-50 via-white to-indigo-50">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-amber-100 text-slate-900 mb-6">Screen Network</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Premium Screen Locations
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Explore our network of high-traffic venues across the UAE. Find the perfect locations for your campaigns.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 px-6 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{venues.length}</p>
              <p className="text-slate-300">Premium Venues</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[#F5D547]">{screens.length}</p>
              <p className="text-slate-300">Active Screens</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{cities.length}</p>
              <p className="text-slate-300">Cities Covered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 px-6 border-b border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search venues..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Venue Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Venue Types</SelectItem>
                {venueTypes.map(type => (
                  <SelectItem key={type} value={type}>{typeLabels[type] || type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "map" ? "default" : "ghost"}
                size="sm"
                className={viewMode === "map" ? "bg-violet-600 rounded-none" : "rounded-none"}
                onClick={() => setViewMode("map")}
              >
                <Map className="w-4 h-4 mr-1" />
                Map
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className={viewMode === "list" ? "bg-violet-600 rounded-none" : "rounded-none"}
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4 mr-1" />
                List
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Map View */}
      {viewMode === "map" && (
        <section className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Filter Sidebar */}
              <div className="lg:col-span-1 space-y-4">
                <Card className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-violet-600" />
                    Filter by City
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setCityFilter("all")}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        cityFilter === "all" ? "bg-violet-100 text-violet-700 font-medium" : "hover:bg-slate-100"
                      }`}
                    >
                      All UAE ({venues.length})
                    </button>
                    {cities.map(city => {
                      const count = venues.filter(v => v.city === city).length;
                      return (
                        <button
                          key={city}
                          onClick={() => setCityFilter(city)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between ${
                            cityFilter === city ? "bg-violet-100 text-violet-700 font-medium" : "hover:bg-slate-100"
                          }`}
                        >
                          <span>{city}</span>
                          <span className="text-slate-500">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </Card>

                <Card className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-violet-600" />
                    Filter by Venue Type
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setTypeFilter("all")}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        typeFilter === "all" ? "bg-violet-100 text-violet-700 font-medium" : "hover:bg-slate-100"
                      }`}
                    >
                      All Types
                    </button>
                    {venueTypes.map(type => {
                      const count = venues.filter(v => v.type === type).length;
                      return (
                        <button
                          key={type}
                          onClick={() => setTypeFilter(type)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                            typeFilter === type ? "bg-violet-100 text-violet-700 font-medium" : "hover:bg-slate-100"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: venueTypeColors[type] || "violet" }}
                            />
                            {typeLabels[type] || type}
                          </span>
                          <span className="text-slate-500">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </Card>

                {/* Legend */}
                <Card className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-3">Map Legend</h3>
                  <div className="space-y-2 text-sm">
                    {Object.entries(venueTypeColors).slice(0, 7).map(([type, color]) => (
                      <div key={type} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-slate-600 capitalize">{typeLabels[type] || type}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Map */}
              <div className="lg:col-span-3">
                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200" style={{ height: "700px" }}>
                  <MapContainer
                    center={getMapCenter()}
                    zoom={getMapZoom()}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={true}
                    zoomControl={true}
                  >
                    <MapController center={getMapCenter()} zoom={getMapZoom()} />
                    <TileLayer
                      attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />
                    {venuesWithCoords.map((venue) => (
                      <Marker
                        key={venue.id}
                        position={[venue.latitude, venue.longitude]}
                        icon={createVenueIcon(venue.type)}
                        eventHandlers={{
                          click: () => setSelectedVenue(venue)
                        }}
                      >
                        <Popup>
                          <div className="p-2 min-w-[220px]">
                            <div className="flex items-start gap-2 mb-2">
                              <span 
                                className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" 
                                style={{ backgroundColor: venueTypeColors[venue.type] || "violet" }}
                              />
                              <div>
                                <h3 className="font-bold text-slate-900">{venue.name}</h3>
                                <p className="text-xs text-slate-500">{typeLabels[venue.type] || venue.type}</p>
                              </div>
                            </div>
                            <p className="text-sm text-slate-600">{venue.area}, {venue.city}</p>
                            <div className="flex items-center gap-1 mt-2 text-violet-600 font-medium text-sm">
                              <MonitorPlay className="w-4 h-4" />
                              {getScreenCount(venue.id)} Screens Available
                            </div>
                            {venue.avg_daily_footfall && (
                              <div className="flex items-center gap-1 mt-1 text-slate-600 text-sm">
                                <Users className="w-4 h-4" />
                                {venue.avg_daily_footfall.toLocaleString()} daily visitors
                              </div>
                            )}
                            <Button
                              size="sm"
                              className="w-full mt-3 bg-violet-600 hover:bg-violet-700"
                              onClick={() => setSelectedVenue(venue)}
                            >
                              View Details & Screens
                            </Button>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>

                  {/* Venue Detail Panel */}
                  {selectedVenue && (
                    <div className="absolute top-4 right-4 bg-white rounded-xl shadow-2xl p-5 w-80 z-[1000] max-h-[650px] overflow-y-auto">
                      <button
                        onClick={() => setSelectedVenue(null)}
                        className="absolute top-3 right-3 p-1 hover:bg-slate-100 rounded-full"
                      >
                        <X className="w-5 h-5 text-slate-500" />
                      </button>
                      <img
                        src={selectedVenue.image_url || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=200&fit=crop"}
                        alt={selectedVenue.name}
                        className="w-full h-36 object-cover rounded-lg mb-4"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="flex items-center gap-2 mb-2">
                        <span 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: venueTypeColors[selectedVenue.type] || "violet" }}
                        />
                        <Badge className="bg-slate-100 text-slate-700">
                          {typeLabels[selectedVenue.type] || selectedVenue.type}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{selectedVenue.name}</h3>
                      <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {selectedVenue.area}, {selectedVenue.city}
                      </p>
                      
                      <div className="mt-4 p-3 bg-violet-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-violet-600 font-semibold">{selectedVenue.avg_daily_footfall?.toLocaleString() || "N/A"}</p>
                            <p className="text-slate-500 text-xs">Daily Visitors</p>
                          </div>
                          <div>
                            <p className="text-violet-600 font-semibold">{getScreenCount(selectedVenue.id)}</p>
                            <p className="text-slate-500 text-xs">Screens</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="w-4 h-4 text-violet-600" />
                          {selectedVenue.operating_hours || "Hours not specified"}
                        </div>
                      </div>

                      {/* Screens List */}
                      <div className="mt-4">
                        <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                          <MonitorPlay className="w-4 h-4 text-violet-600" />
                          Available Screens ({getScreenCount(selectedVenue.id)})
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {getVenueScreens(selectedVenue.id).map((screen) => (
                            <div key={screen.id} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                              <p className="font-medium text-slate-900 text-sm">{screen.name}</p>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                                <Badge variant="outline" className="text-xs">{screen.size}</Badge>
                                <Badge variant="outline" className="text-xs">{screen.orientation}</Badge>
                              </div>
                              <p className="text-violet-600 font-semibold text-sm mt-2">
                                AED {screen.slot_price}/week
                              </p>
                            </div>
                          ))}
                          {getScreenCount(selectedVenue.id) === 0 && (
                            <p className="text-sm text-slate-500 text-center py-4">No screens listed yet</p>
                          )}
                        </div>
                      </div>

                      <Link to={createPageUrl("Register")}>
                        <Button className="w-full mt-4 bg-gradient-to-r from-violet-600 to-indigo-600">
                          Advertise at This Venue
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* Results Count Badge */}
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg z-[1000]">
                    <p className="text-sm font-medium text-slate-700">
                      <span className="text-violet-600 font-bold">{venuesWithCoords.length}</span> venues 
                      {cityFilter !== "all" && <span> in {cityFilter}</span>}
                      {typeFilter !== "all" && <span> • {typeLabels[typeFilter] || typeFilter}</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Venues Grid (List View) */}
      {viewMode === "list" && (
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i}>
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredVenues.length === 0 ? (
            <div className="text-center py-16">
              <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No venues found</h3>
              <p className="text-slate-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVenues.map((venue) => (
                <Card key={venue.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-48">
                    <img
                      src={venue.image_url || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop"}
                      alt={venue.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <Badge className="absolute top-3 right-3 bg-amber-100 text-slate-900">
                      {typeLabels[venue.type] || venue.type}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{venue.name}</h3>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-violet-600" />
                        {venue.area}, {venue.city}
                      </div>
                      <div className="flex items-center gap-2">
                        <MonitorPlay className="w-4 h-4 text-violet-600" />
                        {getScreenCount(venue.id)} Active Screens
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-violet-600" />
                        {venue.avg_daily_footfall?.toLocaleString() || "N/A"} daily visitors
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-violet-600" />
                        {venue.operating_hours || "N/A"}
                      </div>
                    </div>
                    <Link to={createPageUrl("Register")}>
                      <Button className="w-full mt-4 bg-gradient-to-r from-violet-600 to-indigo-600">
                        Advertise Here
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
      )}

      {/* Venue Calculator */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Badge className="bg-emerald-100 text-emerald-700 mb-4">For Venue Owners</Badge>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Calculate Your Revenue Potential</h2>
            <p className="text-slate-600">
              See how much you could earn by listing your venue on BeyondWalls
            </p>
          </div>
          <VenueSuitabilityCalculator />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-violet-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Want to Add Your Venue?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join our network and start earning from your screens
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-amber-100 text-slate-900 hover:bg-amber-100/90">
              <Building2 className="w-5 h-5 mr-2" />
              List Your Venue
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}