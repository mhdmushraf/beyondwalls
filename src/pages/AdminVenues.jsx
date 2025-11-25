import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Building2,
  MapPin,
  Phone,
  ExternalLink,
  Pencil,
  Save,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AdminVenues() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  const { data: venues = [], isLoading } = useQuery({
    queryKey: ["admin-venues"],
    queryFn: () => base44.entities.Venue.list("-created_date")
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Venue.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-venues"] });
      toast.success("Venue updated successfully");
    }
  });

  const handleApprove = async (venue) => {
    updateMutation.mutate({
      id: venue.id,
      data: { status: "approved" }
    });
    setSelectedVenue(null);
  };

  const handleReject = async () => {
    if (!selectedVenue) return;
    updateMutation.mutate({
      id: selectedVenue.id,
      data: { status: "rejected" }
    });
    setShowRejectDialog(false);
    setSelectedVenue(null);
  };

  const handleEditVenue = (venue) => {
    setSelectedVenue(venue);
    setEditMode(true);
    setEditData({
      name: venue.name || "",
      type: venue.type || "",
      address: venue.address || "",
      city: venue.city || "",
      area: venue.area || "",
      contact_name: venue.contact_name || "",
      contact_phone: venue.contact_phone || "",
      contact_email: venue.contact_email || "",
      operating_hours: venue.operating_hours || "",
      avg_daily_footfall: venue.avg_daily_footfall || 0,
      status: venue.status || "pending"
    });
  };

  const handleSaveVenue = async () => {
    setSaving(true);
    try {
      await base44.entities.Venue.update(selectedVenue.id, editData);
      queryClient.invalidateQueries({ queryKey: ["admin-venues"] });
      toast.success("Venue updated successfully");
      setEditMode(false);
      setSelectedVenue(null);
    } catch (e) {
      toast.error("Failed to update venue");
    }
    setSaving(false);
  };

  const filteredVenues = venues.filter(venue => {
    const matchesSearch = venue.name?.toLowerCase().includes(search.toLowerCase()) ||
                         venue.city?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || venue.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
    suspended: "bg-slate-100 text-slate-700"
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Venue Management</h1>
        <p className="text-slate-500 mt-1">Review and manage venue registrations</p>
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
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Venues Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-slate-600">Venue</th>
                  <th className="text-left p-4 font-medium text-slate-600">Owner</th>
                  <th className="text-left p-4 font-medium text-slate-600">Location</th>
                  <th className="text-left p-4 font-medium text-slate-600">Type</th>
                  <th className="text-left p-4 font-medium text-slate-600">Status</th>
                  <th className="text-left p-4 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">Loading...</td>
                  </tr>
                ) : filteredVenues.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">No venues found</td>
                  </tr>
                ) : (
                  filteredVenues.map((venue) => (
                    <tr key={venue.id} className="border-b hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {venue.image_url ? (
                            <img 
                              src={venue.image_url} 
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-slate-900">{venue.name}</p>
                            <p className="text-sm text-slate-500">{venue.contact_phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-900">{venue.owner_id}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-900">{venue.city}</p>
                        <p className="text-xs text-slate-500">{venue.area}</p>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary" className="capitalize">{venue.type}</Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={statusColors[venue.status]}>
                          {venue.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => setSelectedVenue(venue)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditVenue(venue)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          {venue.status === "pending" && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-emerald-600 hover:bg-emerald-50"
                                onClick={() => handleApprove(venue)}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-rose-600 hover:bg-rose-50"
                                onClick={() => {
                                  setSelectedVenue(venue);
                                  setShowRejectDialog(true);
                                }}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Venue Details Dialog */}
      <Dialog open={!!selectedVenue && !showRejectDialog} onOpenChange={() => setSelectedVenue(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Venue Details</DialogTitle>
          </DialogHeader>
          {selectedVenue && (
            <div className="space-y-4">
              {selectedVenue.image_url && (
                <img 
                  src={selectedVenue.image_url} 
                  alt={selectedVenue.name}
                  className="w-full h-48 object-cover rounded-xl"
                />
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-500">Venue Name</Label>
                  <p className="font-medium">{selectedVenue.name}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Type</Label>
                  <p className="font-medium capitalize">{selectedVenue.type}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Location</Label>
                  <p className="font-medium">{selectedVenue.city}, {selectedVenue.area}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Address</Label>
                  <p className="font-medium">{selectedVenue.address}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Contact Person</Label>
                  <p className="font-medium">{selectedVenue.contact_name}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Contact Phone</Label>
                  <p className="font-medium">{selectedVenue.contact_phone}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Operating Hours</Label>
                  <p className="font-medium">{selectedVenue.operating_hours || "—"}</p>
                </div>
                <div>
                  <Label className="text-slate-500">Daily Footfall</Label>
                  <p className="font-medium">{selectedVenue.avg_daily_footfall || "—"}</p>
                </div>
              </div>
              {selectedVenue.trade_license_url && (
                <div>
                  <Label className="text-slate-500">Trade License</Label>
                  <a 
                    href={selectedVenue.trade_license_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-violet-600 hover:underline mt-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Document
                  </a>
                </div>
              )}
              {selectedVenue.status === "pending" && (
                <DialogFooter>
                  <Button 
                    variant="outline"
                    onClick={() => setShowRejectDialog(true)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleApprove(selectedVenue)}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Venue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              <XCircle className="w-4 h-4 mr-2" />
              Reject Venue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Venue Dialog */}
      <Dialog open={editMode} onOpenChange={() => { setEditMode(false); setSelectedVenue(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Venue</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Venue Name</Label>
                <Input
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={editData.type} onValueChange={(v) => setEditData({ ...editData, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="cafe">Cafe</SelectItem>
                    <SelectItem value="mall">Mall</SelectItem>
                    <SelectItem value="gym">Gym</SelectItem>
                    <SelectItem value="coworking">Coworking</SelectItem>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={editData.address}
                onChange={(e) => setEditData({ ...editData, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={editData.city}
                  onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Area</Label>
                <Input
                  value={editData.area}
                  onChange={(e) => setEditData({ ...editData, area: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Name</Label>
                <Input
                  value={editData.contact_name}
                  onChange={(e) => setEditData({ ...editData, contact_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  value={editData.contact_phone}
                  onChange={(e) => setEditData({ ...editData, contact_phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input
                  value={editData.contact_email}
                  onChange={(e) => setEditData({ ...editData, contact_email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Operating Hours</Label>
                <Input
                  placeholder="e.g., 9AM-11PM"
                  value={editData.operating_hours}
                  onChange={(e) => setEditData({ ...editData, operating_hours: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Daily Footfall</Label>
                <Input
                  type="number"
                  value={editData.avg_daily_footfall}
                  onChange={(e) => setEditData({ ...editData, avg_daily_footfall: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editData.status} onValueChange={(v) => setEditData({ ...editData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditMode(false); setSelectedVenue(null); }}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveVenue}
              disabled={saving}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}