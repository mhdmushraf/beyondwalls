import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Loader2, MonitorPlay } from "lucide-react";

function generateSetupCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function AddScreen() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [venues, setVenues] = useState([]);
  const [form, setForm] = useState({
    venue_id: "", name: "", width_px: "1920", height_px: "1080",
    display_mode: "fit", total_slots: "10", public_ad_slots: "7",
    internal_slots: "3", slot_duration: "30", price_per_week: "",
    location_description: "",
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const venueId = urlParams.get("venue_id");
    if (venueId) setForm(f => ({ ...f, venue_id: venueId }));
    base44.auth.me().then(u => {
      setUser(u);
      base44.entities.Venue.filter({ owner_email: u.email, approval_status: "approved" }).then(setVenues);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.venue_id || !form.name) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const screen = await base44.entities.Screen.create({
        ...form,
        owner_email: user.email,
        setup_code: generateSetupCode(),
        width_px: Number(form.width_px),
        height_px: Number(form.height_px),
        total_slots: Number(form.total_slots),
        public_ad_slots: Number(form.public_ad_slots),
        internal_slots: Number(form.internal_slots),
        slot_duration: Number(form.slot_duration),
        price_per_week: Number(form.price_per_week),
        approval_status: "pending",
        status: "pending",
      });

      await base44.entities.Notification.create({
        recipient_email: "admin",
        type: "screen_approved",
        title: "New Screen Pending Approval",
        message: `${user.full_name} registered screen "${form.name}"`,
        reference_id: screen.id,
      });

      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: "Screen Registered - BeyondWalls",
        body: `Hi ${user.full_name},\n\nYour screen "${form.name}" has been registered with setup code: ${screen.setup_code}\n\nPending admin approval. Once approved, connect it via the ScreenPlayer app.\n\nBeyondWalls Team`,
      });

      toast({ title: "Screen registered!", description: `Setup code: ${screen.setup_code}` });
      navigate("/MyScreens");
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Register New Screen</h1>
        </div>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Venue *</Label>
                <select className="mt-1 w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                  value={form.venue_id} onChange={e => setForm(f => ({ ...f, venue_id: e.target.value }))} required>
                  <option value="">Select venue</option>
                  {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
                {venues.length === 0 && <p className="text-xs text-amber-600 mt-1">No approved venues yet. Add and get a venue approved first.</p>}
              </div>
              <div>
                <Label>Screen Name *</Label>
                <Input className="mt-1" placeholder="e.g. Main Entrance Screen" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Width (px)</Label>
                  <Input className="mt-1" type="number" value={form.width_px} onChange={e => setForm(f => ({ ...f, width_px: e.target.value }))} />
                </div>
                <div>
                  <Label>Height (px)</Label>
                  <Input className="mt-1" type="number" value={form.height_px} onChange={e => setForm(f => ({ ...f, height_px: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Display Mode</Label>
                  <select className="mt-1 w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                    value={form.display_mode} onChange={e => setForm(f => ({ ...f, display_mode: e.target.value }))}>
                    <option value="fit">Fit</option>
                    <option value="stretch">Stretch</option>
                    <option value="fill">Fill</option>
                  </select>
                </div>
                <div>
                  <Label>Slot Duration (sec)</Label>
                  <select className="mt-1 w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                    value={form.slot_duration} onChange={e => setForm(f => ({ ...f, slot_duration: e.target.value }))}>
                    <option value="15">15 seconds</option>
                    <option value="30">30 seconds</option>
                    <option value="45">45 seconds</option>
                    <option value="60">60 seconds</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Total Slots</Label>
                  <Input className="mt-1" type="number" value={form.total_slots} onChange={e => setForm(f => ({ ...f, total_slots: e.target.value }))} />
                </div>
                <div>
                  <Label>Ad Slots</Label>
                  <Input className="mt-1" type="number" value={form.public_ad_slots} onChange={e => setForm(f => ({ ...f, public_ad_slots: e.target.value }))} />
                </div>
                <div>
                  <Label>Internal Slots</Label>
                  <Input className="mt-1" type="number" value={form.internal_slots} onChange={e => setForm(f => ({ ...f, internal_slots: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Price Per Week (AED) *</Label>
                <Input className="mt-1" type="number" placeholder="e.g. 200" value={form.price_per_week} onChange={e => setForm(f => ({ ...f, price_per_week: e.target.value }))} required />
              </div>
              <div>
                <Label>Location in Venue</Label>
                <Input className="mt-1" placeholder="e.g. Near entrance, left wall" value={form.location_description} onChange={e => setForm(f => ({ ...f, location_description: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">Cancel</Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-violet-600 hover:bg-violet-700">
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Registering...</> : "Register Screen"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}