import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Building2,
  MapPin,
  MonitorPlay,
  Activity,
  Settings,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyVenues() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: venues = [], isLoading } = useQuery({
    queryKey: ["my-venues", user?.email],
    queryFn: () => base44.entities.Venue.filter({ owner_id: user?.email }),
    enabled: !!user?.email
  });

  const { data: screens = [] } = useQuery({
    queryKey: ["all-screens"],
    queryFn: () => base44.entities.Screen.list()
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl("MyVenues"));
        return;
      }
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {
      base44.auth.redirectToLogin(createPageUrl("MyVenues"));
    }
  };

  const filteredVenues = venues.filter(venue => {
    const matchesSearch = venue.name?.toLowerCase().includes(search.toLowerCase()) ||
                         venue.address?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || venue.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    rejected: "bg-rose-100 text-rose-700 border-rose-200",
    suspended: "bg-slate-100 text-slate-700 border-slate-200"
  };

  const statusCounts = {
    all: venues.length,
    approved: venues.filter(v => v.status === "approved").length,
    pending: venues.filter(v => v.status === "pending").length
  };

  if (!user) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading venues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">My Venues</h1>
          <p className="text-slate-500 mt-1">Manage your venues and screens</p>
        </div>
        <Link to={createPageUrl("AddVenue")}>
          <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25">
            <Plus className="w-4 h-4 mr-2" />
            Add Venue
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search venues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="all" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
              All ({statusCounts.all})
            </TabsTrigger>
            <TabsTrigger value="approved" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
              Active ({statusCounts.approved})
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
              Pending ({statusCounts.pending})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Venues Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-40 w-full rounded-xl mb-4" />
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredVenues.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-violet-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">
            {search || statusFilter !== "all" ? "No venues found" : "No venues yet"}
          </h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            {search || statusFilter !== "all" 
              ? "Try adjusting your search or filters"
              : "Add your first venue to start earning from screen advertising"
            }
          </p>
          {!search && statusFilter === "all" && (
            <Link to={createPageUrl("AddVenue")}>
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Venue
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => {
            const venueScreens = screens.filter(s => s.venue_id === venue.id);
            const onlineCount = venueScreens.filter(s => s.status === "online").length;
            
            return (
              <Card key={venue.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
                <div className="relative aspect-video bg-slate-100">
                  {venue.image_url ? (
                    <img 
                      src={venue.image_url} 
                      alt={venue.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge className={`absolute top-3 right-3 ${statusColors[venue.status]} border`}>
                    {venue.status}
                  </Badge>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-bold text-white text-lg">{venue.name}</h3>
                    <p className="text-white/80 text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {venue.city}
                    </p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <MonitorPlay className="w-4 h-4" />
                        <span>{venueScreens.length} screens</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-emerald-600">
                        <Activity className="w-4 h-4" />
                        <span>{onlineCount} online</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="capitalize">{venue.type}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Link to={createPageUrl(`VenueDetails?id=${venue.id}`)} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Settings className="w-4 h-4 mr-2" />
                        Manage
                      </Button>
                    </Link>
                    <Link to={createPageUrl(`AddScreen?venue_id=${venue.id}`)}>
                      <Button variant="outline" size="icon">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}