import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Star,
  MonitorPlay,
  MapPin,
  Trash2,
  Plus,
  Search,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function FavoriteScreens() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl("FavoriteScreens"));
        return;
      }
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {
      base44.auth.redirectToLogin(createPageUrl("FavoriteScreens"));
    }
  };

  const { data: favorites = [] } = useQuery({
    queryKey: ["favorites", user?.email],
    queryFn: () => base44.entities.FavoriteScreen.filter({ user_id: user?.email }),
    enabled: !!user?.email
  });

  const { data: screens = [] } = useQuery({
    queryKey: ["all-screens"],
    queryFn: () => base44.entities.Screen.list()
  });

  const { data: venues = [] } = useQuery({
    queryKey: ["venues"],
    queryFn: () => base44.entities.Venue.list()
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["all-bookings"],
    queryFn: () => base44.entities.AdSlotBooking.filter({ status: "active" })
  });

  const favoriteScreens = screens.filter(s => 
    favorites.some(f => f.screen_id === s.id)
  );

  const filteredScreens = favoriteScreens.filter(screen => {
    const venue = venues.find(v => v.id === screen.venue_id);
    return screen.name?.toLowerCase().includes(search.toLowerCase()) ||
           venue?.name?.toLowerCase().includes(search.toLowerCase());
  });

  const handleRemoveFavorite = async (screenId) => {
    const favorite = favorites.find(f => f.screen_id === screenId);
    if (favorite) {
      await base44.entities.FavoriteScreen.delete(favorite.id);
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      toast.success("Removed from favorites");
    }
  };

  const getAvailableSlots = (screenId) => {
    const screenBookings = bookings.filter(b => b.screen_id === screenId);
    return 5 - screenBookings.length;
  };

  if (!user) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
            Favorite Screens
          </h1>
          <p className="text-slate-500 mt-1">Quick access to your saved screens</p>
        </div>
        <Link to={createPageUrl("BookSlot")}>
          <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">
            <Plus className="w-4 h-4 mr-2" />
            Browse All Screens
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search favorites..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Favorites Grid */}
      {filteredScreens.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Star className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No favorite screens yet</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              Save screens you're interested in for quick access when booking
            </p>
            <Link to={createPageUrl("BookSlot")}>
              <Button>Browse Screens</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScreens.map((screen) => {
            const venue = venues.find(v => v.id === screen.venue_id);
            const availableSlots = getAvailableSlots(screen.id);
            
            return (
              <Card key={screen.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                      <MonitorPlay className="w-6 h-6 text-violet-600" />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                      onClick={() => handleRemoveFavorite(screen.id)}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </Button>
                  </div>
                  <h3 className="font-semibold text-slate-900">{screen.name}</h3>
                  <p className="text-sm text-slate-500">{venue?.name}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                    <MapPin className="w-3 h-3" />
                    <span>{venue?.city}</span>
                    <span>•</span>
                    <span>{screen.size}</span>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div>
                      <p className="text-lg font-bold text-violet-600">AED {screen.slot_price}/week</p>
                      <Badge variant={availableSlots === 0 ? "destructive" : "secondary"} className="mt-1">
                        {availableSlots} slots available
                      </Badge>
                    </div>
                    <Link to={createPageUrl(`BookSlot?screen_id=${screen.id}`)}>
                      <Button size="sm" disabled={availableSlots === 0}>
                        Book Now
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