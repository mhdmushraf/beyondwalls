import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Search,
  MonitorPlay,
  Wifi,
  WifiOff,
  Building2,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export default function AdminScreens() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: screens = [], isLoading } = useQuery({
    queryKey: ["admin-screens"],
    queryFn: () => base44.entities.Screen.list("-created_date")
  });

  const { data: venues = [] } = useQuery({
    queryKey: ["admin-venues-lookup"],
    queryFn: () => base44.entities.Venue.list()
  });

  const filteredScreens = screens.filter(screen => {
    const venue = venues.find(v => v.id === screen.venue_id);
    const matchesSearch = screen.name?.toLowerCase().includes(search.toLowerCase()) ||
                         venue?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || screen.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const onlineCount = screens.filter(s => s.status === "online").length;
  const offlineCount = screens.filter(s => s.status === "offline").length;

  const statusColors = {
    online: "bg-emerald-100 text-emerald-700",
    offline: "bg-slate-100 text-slate-700",
    maintenance: "bg-amber-100 text-amber-700",
    pending_setup: "bg-blue-100 text-blue-700"
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Screen Management</h1>
        <p className="text-slate-500 mt-1">Monitor and manage all screens on the network</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm">Online</p>
                <p className="text-3xl font-bold">{onlineCount}</p>
              </div>
              <Wifi className="w-8 h-8 text-emerald-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Offline</p>
                <p className="text-3xl font-bold text-slate-900">{offlineCount}</p>
              </div>
              <WifiOff className="w-8 h-8 text-slate-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Total Screens</p>
                <p className="text-3xl font-bold text-slate-900">{screens.length}</p>
              </div>
              <MonitorPlay className="w-8 h-8 text-slate-300" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-slate-500 text-sm mb-2">Network Health</p>
            <Progress value={screens.length > 0 ? (onlineCount / screens.length) * 100 : 0} className="h-2 mb-2" />
            <p className="text-sm font-medium">
              {screens.length > 0 ? Math.round((onlineCount / screens.length) * 100) : 0}% Online
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search screens..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="online">Online</TabsTrigger>
            <TabsTrigger value="offline">Offline</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Screens Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-slate-600">Screen</th>
                  <th className="text-left p-4 font-medium text-slate-600">Venue</th>
                  <th className="text-left p-4 font-medium text-slate-600">Specs</th>
                  <th className="text-left p-4 font-medium text-slate-600">Rate</th>
                  <th className="text-left p-4 font-medium text-slate-600">Status</th>
                  <th className="text-left p-4 font-medium text-slate-600">Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">Loading...</td>
                  </tr>
                ) : filteredScreens.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">No screens found</td>
                  </tr>
                ) : (
                  filteredScreens.map((screen) => {
                    const venue = venues.find(v => v.id === screen.venue_id);
                    return (
                      <tr key={screen.id} className="border-b hover:bg-slate-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              screen.status === "online" ? "bg-emerald-100" : "bg-slate-100"
                            }`}>
                              <MonitorPlay className={`w-5 h-5 ${
                                screen.status === "online" ? "text-emerald-600" : "text-slate-400"
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{screen.name}</p>
                              <p className="text-sm text-slate-500">{screen.device_type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-slate-900">{venue?.name || "—"}</p>
                          <p className="text-xs text-slate-500">{venue?.city}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-slate-900">{screen.size} • {screen.orientation}</p>
                          <p className="text-xs text-slate-500">{screen.resolution}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-slate-900">AED {screen.hourly_rate}/hr</p>
                        </td>
                        <td className="p-4">
                          <Badge className={statusColors[screen.status]}>
                            {screen.status === "online" ? (
                              <><Activity className="w-3 h-3 mr-1 animate-pulse" /> Online</>
                            ) : (
                              screen.status?.replace("_", " ")
                            )}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-slate-500">
                            {screen.last_heartbeat 
                              ? format(new Date(screen.last_heartbeat), "MMM d, h:mm a")
                              : "Never"
                            }
                          </p>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}