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

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker icon
const screenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function ScreenLocations() {
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewMode, setViewMode] = useState("map"); // "map" or "list"
  const [selectedVenue, setSelectedVenue] = useState(null);

  const { data: venues = [], isLoading } = useQuery({
    queryKey: ["public-venues"],
    queryFn: () => base44.entities.Venue.filter({ status: "approved" })
  });

  const { data: screens = [] } = useQuery({
    queryKey: ["public-screens"],
    queryFn: () => base44.entities.Screen.filter({ status: "online" })
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

  // UAE center coordinates
  const uaeCenter = [24.4539, 54.3773];
  const defaultZoom = 7;

  return (
    <div className="min-h-screen bg-white">
      <SEOHead {...PAGE_SEO.screenLocations} />
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
          <div className="max-w-6xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200" style={{ height: "600px" }}>
              <MapContainer
                center={uaeCenter}
                zoom={defaultZoom}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={true}
                zoomControl={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                {venuesWithCoords.map((venue) => (
                  <Marker
                    key={venue.id}
                    position={[venue.latitude, venue.longitude]}
                    icon={screenIcon}
                    eventHandlers={{
                      click: () => setSelectedVenue(venue)
                    }}
                  >
                    <Popup>
                      <div className="p-2 min-w-[200px]">
                        <h3 className="font-bold text-slate-900">{venue.name}</h3>
                        <p className="text-sm text-slate-500">{typeLabels[venue.type] || venue.type}</p>
                        <p className="text-sm text-slate-600 mt-1">{venue.area}, {venue.city}</p>
                        <div className="flex items-center gap-1 mt-2 text-violet-600 font-medium text-sm">
                          <MonitorPlay className="w-4 h-4" />
                          {getScreenCount(venue.id)} Screens
                        </div>
                        <Button
                          size="sm"
                          className="w-full mt-3 bg-violet-600 hover:bg-violet-700"
                          onClick={() => setSelectedVenue(venue)}
                        >
                          View Details
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              {/* Venue Detail Panel */}
              {selectedVenue && (
                <div className="absolute top-4 right-4 bg-white rounded-xl shadow-2xl p-5 w-80 z-[1000] max-h-[550px] overflow-y-auto">
                  <button
                    onClick={() => setSelectedVenue(null)}
                    className="absolute top-3 right-3 p-1 hover:bg-slate-100 rounded-full"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                  <img
                    src={selectedVenue.image_url || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=200&fit=crop"}
                    alt={selectedVenue.name}
                    className="w-full h-32 object-cover rounded-lg mb-4"
                  />
                  <Badge className="bg-amber-100 text-slate-900 mb-2">
                    {typeLabels[selectedVenue.type] || selectedVenue.type}
                  </Badge>
                  <h3 className="text-lg font-bold text-slate-900">{selectedVenue.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {selectedVenue.area}, {selectedVenue.city}
                  </p>
                  
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Users className="w-4 h-4 text-violet-600" />
                      {selectedVenue.avg_daily_footfall?.toLocaleString() || "N/A"} daily visitors
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-4 h-4 text-violet-600" />
                      {selectedVenue.operating_hours || "N/A"}
                    </div>
                  </div>

                  {/* Screens List */}
                  <div className="mt-4">
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <MonitorPlay className="w-4 h-4 text-violet-600" />
                      {getScreenCount(selectedVenue.id)} Available Screens
                    </h4>
                    <div className="space-y-2">
                      {getVenueScreens(selectedVenue.id).map((screen) => (
                        <div key={screen.id} className="bg-slate-50 rounded-lg p-3">
                          <p className="font-medium text-slate-900">{screen.name}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            <span>{screen.size}</span>
                            <span>•</span>
                            <span>{screen.orientation}</span>
                            <span>•</span>
                            <span className="text-violet-600 font-medium">AED {screen.slot_price}/week</span>
                          </div>
                        </div>
                      ))}
                      {getScreenCount(selectedVenue.id) === 0 && (
                        <p className="text-sm text-slate-500">No screens listed yet</p>
                      )}
                    </div>
                  </div>

                  <Link to={createPageUrl("Register")}>
                    <Button className="w-full mt-4 bg-gradient-to-r from-violet-600 to-indigo-600">
                      Advertise Here
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            <p className="text-center text-sm text-slate-500 mt-4">
              Showing {venuesWithCoords.length} venues with map coordinates. Click on markers to view details.
            </p>
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