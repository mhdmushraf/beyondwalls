import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ArrowLeft, MonitorPlay, MapPin, Calendar, Tag, CheckCircle2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import PerformanceBadge from "@/components/performance/PerformanceBadge";

export default function BundleDetails() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const bundleId = new URLSearchParams(window.location.search).get("id");
  const [campaignName, setCampaignName] = useState("");
  const [creativeUrl, setCreativeUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: bundle, isLoading } = useQuery({
    queryKey: ['bundle', bundleId],
    queryFn: async () => {
      const bundles = await base44.entities.CampaignBundle.filter({ id: bundleId });
      return bundles[0];
    },
    enabled: !!bundleId
  });

  const { data: screens = [] } = useQuery({
    queryKey: ['bundle-screens', bundle?.screen_ids],
    queryFn: async () => {
      if (!bundle?.screen_ids) return [];
      const allScreens = await base44.entities.Screen.list();
      return allScreens.filter(s => bundle.screen_ids.includes(s.id));
    },
    enabled: !!bundle?.screen_ids
  });

  const bookBundleMutation = useMutation({
    mutationFn: async () => {
      if (!campaignName || !creativeUrl || !startDate) {
        throw new Error("Please fill all required fields");
      }

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (bundle.duration_weeks * 7));

      // Create bookings for each screen in bundle
      const bookingPromises = screens.map((screen, index) => 
        base44.entities.AdSlotBooking.create({
          screen_id: screen.id,
          advertiser_id: user.email,
          slot_number: 1 + (index % 5),
          creative_url: creativeUrl,
          creative_type: creativeUrl.match(/\.(mp4|mov|avi)$/i) ? "video" : "image",
          start_date: startDate,
          end_date: endDate.toISOString().split('T')[0],
          weeks_booked: bundle.duration_weeks,
          total_cost: bundle.bundle_price / screens.length,
          campaign_name: campaignName,
          discount_type: "bundle",
          bundle_id: bundle.id,
          status: "pending"
        })
      );

      await Promise.all(bookingPromises);

      // Deduct from wallet
      await base44.entities.Transaction.create({
        user_id: user.email,
        type: "ad_spend",
        amount: -bundle.bundle_price,
        description: `Bundle booking: ${bundle.name}`,
        reference_id: bundle.id
      });

      // Update bundle bookings count
      await base44.entities.CampaignBundle.update(bundle.id, {
        bookings_count: (bundle.bookings_count || 0) + 1
      });
    },
    onSuccess: () => {
      toast.success("Bundle booked successfully!");
      queryClient.invalidateQueries(['bookings']);
      navigate(createPageUrl("MyBookings"));
    },
    onError: (error) => {
      toast.error(error.message || "Failed to book bundle");
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setCreativeUrl(file_url);
      toast.success("Creative uploaded!");
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Loading bundle...</p>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Bundle not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Bundle Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{bundle.name}</h1>
                    <p className="text-slate-600">{bundle.description}</p>
                  </div>
                  {bundle.discount_percentage > 0 && (
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {bundle.discount_percentage}% OFF
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MonitorPlay className="w-5 h-5" />
                    <span>{screens.length} Premium Screens</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-5 h-5" />
                    <span>{bundle.duration_weeks} Week Campaign</span>
                  </div>
                  {bundle.total_impressions_estimate > 0 && (
                    <div className="flex items-center gap-2 text-violet-600">
                      <Tag className="w-5 h-5" />
                      <span>~{bundle.total_impressions_estimate.toLocaleString()} impressions</span>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-lg">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-slate-900">
                      AED {bundle.bundle_price.toLocaleString()}
                    </span>
                    {bundle.original_price > bundle.bundle_price && (
                      <>
                        <span className="text-lg text-slate-400 line-through">
                          AED {bundle.original_price.toLocaleString()}
                        </span>
                        <span className="text-green-600 font-semibold">
                          Save AED {(bundle.original_price - bundle.bundle_price).toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Screens List */}
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold mb-4">Included Screens</h2>
                <div className="space-y-3">
                  {screens.map(screen => (
                    <div key={screen.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <MonitorPlay className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="font-medium">{screen.name}</p>
                          <p className="text-sm text-slate-500">{screen.size} • {screen.orientation}</p>
                        </div>
                      </div>
                      <PerformanceBadge score={screen.performance_score} badge={screen.performance_badge} size="sm" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-lg font-bold">Book This Bundle</h3>

                <div>
                  <Label>Campaign Name</Label>
                  <Input
                    placeholder="My Campaign"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <Label>Upload Creative</Label>
                  <div className="mt-2">
                    <label className="flex items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-slate-50">
                      <div className="text-center">
                        <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                        <span className="text-sm text-slate-600">
                          {uploading ? "Uploading..." : creativeUrl ? "✓ Uploaded" : "Click to upload"}
                        </span>
                      </div>
                      <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*" />
                    </label>
                  </div>
                </div>

                <div className="pt-4 space-y-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-medium">AED {bundle.bundle_price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Duration:</span>
                    <span className="font-medium">{bundle.duration_weeks} weeks</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-violet-600">AED {bundle.bundle_price.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                  onClick={() => bookBundleMutation.mutate()}
                  disabled={bookBundleMutation.isPending || !campaignName || !creativeUrl || !startDate}
                >
                  {bookBundleMutation.isPending ? "Booking..." : "Book Bundle"}
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}