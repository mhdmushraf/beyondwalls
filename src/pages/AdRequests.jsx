import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  CheckCircle2,
  XCircle,
  Eye,
  Megaphone,
  Clock,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdRequests() {
  const [user, setUser] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (e) {
      base44.auth.redirectToLogin();
    }
  };

  const { data: venues = [] } = useQuery({
    queryKey: ["my-venues", user?.email],
    queryFn: () => base44.entities.Venue.filter({ owner_id: user?.email }),
    enabled: !!user?.email
  });

  const { data: screens = [] } = useQuery({
    queryKey: ["my-screens", venues],
    queryFn: async () => {
      if (venues.length === 0) return [];
      const venueIds = venues.map(v => v.id);
      const allScreens = await base44.entities.Screen.list();
      return allScreens.filter(s => venueIds.includes(s.venue_id));
    },
    enabled: venues.length > 0
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns-for-screens", screens],
    queryFn: async () => {
      if (screens.length === 0) return [];
      const allCampaigns = await base44.entities.Campaign.filter({ status: "active" });
      // Filter campaigns targeting this venue's screens
      return allCampaigns.filter(c => 
        c.screen_ids?.some(id => screens.some(s => s.id === id))
      );
    },
    enabled: screens.length > 0
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Ad Requests</h1>
        <p className="text-slate-500 mt-1">View campaigns running on your screens</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Active Campaigns</p>
                <p className="text-3xl font-bold text-emerald-600">
                  {campaigns.filter(c => c.status === "active").length}
                </p>
              </div>
              <Megaphone className="w-8 h-8 text-emerald-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">My Screens</p>
                <p className="text-3xl font-bold text-slate-900">{screens.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-slate-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">My Venues</p>
                <p className="text-3xl font-bold text-slate-900">{venues.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-slate-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card>
        <CardHeader>
          <CardTitle>Campaigns on Your Screens</CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Megaphone className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">No active campaigns</h3>
              <p className="text-slate-500">
                Campaigns targeting your screens will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div 
                  key={campaign.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {campaign.creative_url ? (
                      <img 
                        src={campaign.creative_url} 
                        alt=""
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center">
                        <Megaphone className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-slate-900">{campaign.name}</p>
                      <p className="text-sm text-slate-500">
                        {campaign.start_date && format(new Date(campaign.start_date), "MMM d")} - 
                        {campaign.end_date && format(new Date(campaign.end_date), "MMM d, yyyy")}
                      </p>
                      <p className="text-sm text-slate-500">
                        {campaign.screen_ids?.filter(id => screens.some(s => s.id === id)).length} of your screens
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-emerald-100 text-emerald-700">
                      Active
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedCampaign(campaign)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign Details Dialog */}
      <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Campaign Details</DialogTitle>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-4">
              {selectedCampaign.creative_url && (
                selectedCampaign.creative_type === "video" ? (
                  <video 
                    src={selectedCampaign.creative_url} 
                    controls 
                    className="w-full aspect-video rounded-lg"
                  />
                ) : (
                  <img 
                    src={selectedCampaign.creative_url} 
                    alt="Creative"
                    className="w-full aspect-video object-cover rounded-lg"
                  />
                )
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Campaign Name</p>
                  <p className="font-medium">{selectedCampaign.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Duration</p>
                  <p className="font-medium">
                    {selectedCampaign.start_date && format(new Date(selectedCampaign.start_date), "MMM d")} - 
                    {selectedCampaign.end_date && format(new Date(selectedCampaign.end_date), "MMM d")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Time Slots</p>
                  <p className="font-medium capitalize">{selectedCampaign.time_slots?.join(", ") || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Impressions</p>
                  <p className="font-medium">{selectedCampaign.impressions?.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}