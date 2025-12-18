import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Clock, Tag, Building2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function LocalBusinessBooking() {
  const queryClient = useQueryClient();
  const [selectedScreen, setSelectedScreen] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: screens = [] } = useQuery({
    queryKey: ['local-business-screens'],
    queryFn: async () => {
      const allScreens = await base44.entities.Screen.list();
      return allScreens.filter(s => s.local_business_enabled && s.status === "online");
    }
  });

  // Check if user is eligible (UAE-based)
  const isEligible = user?.account_type === "company" && user?.country === "UAE";

  const bookLocalSlotMutation = useMutation({
    mutationFn: async (screenId) => {
      const screen = screens.find(s => s.id === screenId);
      const discountedPrice = screen.slot_price * 0.5; // 50% discount

      await base44.entities.AdSlotBooking.create({
        screen_id: screenId,
        advertiser_id: user.email,
        slot_number: 1,
        creative_url: "", // To be uploaded
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        weeks_booked: 1,
        total_cost: discountedPrice,
        discount_type: "local_business_hour",
        discount_amount: screen.slot_price - discountedPrice,
        is_local_business: true,
        status: "pending"
      });
    },
    onSuccess: () => {
      toast.success("Local Business Hour slot booked! Upload your creative in My Bookings.");
      queryClient.invalidateQueries(['bookings']);
    },
    onError: () => {
      toast.error("Booking failed");
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Local Business Hour</h1>
              <p className="text-slate-500">50% off for Dubai-based SMEs • 12-1 PM daily</p>
            </div>
          </div>
        </div>

        {/* Eligibility Alert */}
        {!isEligible && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <AlertDescription className="text-amber-900">
              This program is only available for UAE-registered businesses. Please update your profile with a valid UAE trade license.
            </AlertDescription>
          </Alert>
        )}

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <Tag className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <p className="font-bold text-2xl text-slate-900">50% OFF</p>
              <p className="text-sm text-slate-500">Standard ad rates</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="w-8 h-8 text-violet-600 mx-auto mb-3" />
              <p className="font-bold text-2xl text-slate-900">12-1 PM</p>
              <p className="text-sm text-slate-500">Prime lunch hour</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Building2 className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <p className="font-bold text-2xl text-slate-900">Support Local</p>
              <p className="text-sm text-slate-500">Community-focused</p>
            </CardContent>
          </Card>
        </div>

        {/* Available Screens */}
        <Card>
          <CardHeader>
            <CardTitle>Available Screens for Local Businesses</CardTitle>
          </CardHeader>
          <CardContent>
            {screens.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No screens available at the moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {screens.map(screen => (
                  <div key={screen.id} className="p-4 bg-slate-50 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{screen.name}</p>
                      <p className="text-sm text-slate-500">{screen.size} • {screen.orientation}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-slate-500">
                          <Clock className="w-3 h-3 mr-1" />
                          12-1 PM
                        </Badge>
                        <span className="text-sm text-slate-400 line-through">
                          AED {screen.slot_price}/week
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          AED {(screen.slot_price * 0.5).toFixed(0)}/week
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => bookLocalSlotMutation.mutate(screen.id)}
                      disabled={!isEligible || bookLocalSlotMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Book Now
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <h3 className="font-bold text-green-900 mb-2">Why Local Business Hour?</h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li>✓ Support Dubai's small business ecosystem</li>
              <li>✓ Reach customers during peak lunch hour</li>
              <li>✓ Fill off-peak inventory with community impact</li>
              <li>✓ Build brand visibility at affordable rates</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}