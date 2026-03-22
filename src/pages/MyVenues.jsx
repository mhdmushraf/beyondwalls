import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, MapPin, Users, MonitorPlay } from "lucide-react";

export default function MyVenues() {
  const [venues, setVenues] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    const u = await base44.auth.me();
    const v = await base44.entities.Venue.filter({ owner_email: u.email }, "-created_date");
    setVenues(v);
    setLoading(false);
  };

  const statusColor = {
    approved: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    rejected: "bg-red-100 text-red-700",
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">My Venues</h1>
          <Link to="/AddVenue">
            <Button className="bg-violet-600 hover:bg-violet-700">
              <Plus className="w-4 h-4 mr-2" /> Add Venue
            </Button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {["all", "approved", "pending", "rejected"].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${filter === tab ? "bg-violet-600 text-white shadow" : "bg-white text-slate-600 border border-slate-200 hover:border-violet-300"}`}
            >
              {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {venues.filter(v => filter === "all" || v.approval_status === filter).length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center py-16">
              <Building2 className="w-14 h-14 text-slate-200 mb-4" />
              <p className="text-slate-500 mb-4">No venues added yet</p>
              <Link to="/AddVenue"><Button className="bg-violet-600 hover:bg-violet-700">Add Your First Venue</Button></Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {venues.filter(v => filter === "all" || v.approval_status === filter).map(v => (
              <Card key={v.id} className="border-0 shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {(v.image_url || (v.photo_urls && v.photo_urls.length > 0)) ? (
                        <img src={v.image_url || v.photo_urls[0]} alt={v.name} className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-11 h-11 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-violet-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-slate-900">{v.name}</h3>
                        <p className="text-xs text-slate-500 capitalize">{v.venue_type}</p>
                      </div>
                    </div>
                    <Badge className={statusColor[v.approval_status] || "bg-slate-100 text-slate-600"}>
                      {v.approval_status}
                    </Badge>
                  </div>
                  <div className="space-y-1.5 text-sm text-slate-500">
                    <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />{v.area ? `${v.area}, ` : ""}{v.city}</div>
                    {v.daily_footfall > 0 && <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5" />{v.daily_footfall.toLocaleString()} daily visitors</div>}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link to={`/AddScreen?venue_id=${v.id}`} className={`flex-1 ${v.approval_status !== "approved" ? "pointer-events-none" : ""}`}>
                      <Button size="sm" variant="outline" className="w-full text-xs" disabled={v.approval_status !== "approved"} title={v.approval_status !== "approved" ? "Venue must be approved before adding screens" : ""}>
                        <MonitorPlay className="w-3 h-3 mr-1" /> Add Screen
                      </Button>
                    </Link>
                    <Link to={`/VenueDetail/${v.id}`} className="flex-1">
                      <Button size="sm" className="w-full bg-violet-600 hover:bg-violet-700 text-xs">View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}