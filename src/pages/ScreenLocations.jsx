import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  MonitorPlay,
  ArrowRight,
  MapPin,
  Building2,
  Search,
  Filter,
  Users,
  Clock
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

export default function ScreenLocations() {
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

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

  const getScreenCount = (venueId) => screens.filter(s => s.venue_id === venueId).length;

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

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <MonitorPlay className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">BeyondWalls</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link to={createPageUrl("Home")} className="text-slate-600 hover:text-slate-900 font-medium">Home</Link>
            <Link to={createPageUrl("About")} className="text-slate-600 hover:text-slate-900 font-medium">About</Link>
            <Link to={createPageUrl("Contact")} className="text-slate-600 hover:text-slate-900 font-medium">Contact</Link>
          </div>
          <Link to={createPageUrl("Register")}>
            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </nav>

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
          </div>
        </div>
      </section>

      {/* Venues Grid */}
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

      {/* Footer */}
      <footer className="py-8 px-6 bg-slate-900 text-center">
        <p className="text-slate-400">© 2024 BeyondWalls. All rights reserved.</p>
      </footer>
    </div>
  );
}