import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Loader2, Building2 } from "lucide-react";

const VENUE_TYPES = ["restaurant", "cafe", "gym", "mall", "coworking", "hotel", "clinic", "salon", "retail", "other"];
const CITIES = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "RAK", "Fujairah", "UAQ"];

export default function AddVenue() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "", venue_type: "", address: "", city: "", area: "",
    description: "", daily_footfall: "", operating_hours: "",
    contact_phone: "", contact_email: "",
  });

  useEffect(() => { base44.auth.me().then(setUser); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.venue_type || !form.city) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const venue = await base44.entities.Venue.create({
        ...form,
        owner_email: user.email,
        daily_footfall: Number(form.daily_footfall) || 0,
        approval_status: "pending",
        status: "pending",
      });

      // Notify admin
      await base44.entities.Notification.create({
        recipient_email: "admin",
        type: "system",
        title: "New Venue Pending Approval",
        message: `${user.full_name} submitted venue "${form.name}" for approval`,
        reference_id: venue.id,
      });

      // Email owner
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: "Venue Submitted for Review - BeyondWalls",
        body: `Hi ${user.full_name},\n\nYour venue "${form.name}" has been submitted and is pending admin approval. We'll notify you once it's reviewed (usually within 24 hours).\n\nBeyondWalls Team`,
      });

      toast({ title: "Venue submitted!", description: "Awaiting admin approval." });
      navigate("/MyVenues");
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Add New Venue</h1>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label>Venue Name *</Label>
                  <Input className="mt-1" placeholder="e.g. The Coffee House" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                  <Label>Venue Type *</Label>
                  <select className="mt-1 w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                    value={form.venue_type} onChange={e => setForm(f => ({ ...f, venue_type: e.target.value }))} required>
                    <option value="">Select type</option>
                    {VENUE_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <Label>City *</Label>
                  <select className="mt-1 w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                    value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} required>
                    <option value="">Select city</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Area / Neighborhood</Label>
                  <Input className="mt-1" placeholder="e.g. Downtown, Marina" value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} />
                </div>
                <div>
                  <Label>Daily Footfall (Approx)</Label>
                  <Input className="mt-1" type="number" placeholder="e.g. 200" value={form.daily_footfall} onChange={e => setForm(f => ({ ...f, daily_footfall: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Full Address *</Label>
                  <Input className="mt-1" placeholder="Street address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} required />
                </div>
                <div>
                  <Label>Operating Hours</Label>
                  <Input className="mt-1" placeholder="e.g. 8am - 11pm" value={form.operating_hours} onChange={e => setForm(f => ({ ...f, operating_hours: e.target.value }))} />
                </div>
                <div>
                  <Label>Contact Phone</Label>
                  <Input className="mt-1" placeholder="+971 55 000 0000" value={form.contact_phone} onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Description</Label>
                  <textarea className="mt-1 w-full border border-input rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring min-h-[80px]"
                    placeholder="Describe your venue..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">Cancel</Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-violet-600 hover:bg-violet-700">
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</> : "Submit for Approval"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}