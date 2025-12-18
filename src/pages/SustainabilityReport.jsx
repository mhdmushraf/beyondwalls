import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Leaf, Download, TrendingUp, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SustainabilityCard from "@/components/sustainability/SustainabilityCard";
import { toast } from "sonner";

export default function SustainabilityReport() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['user-bookings'],
    queryFn: async () => {
      return await base44.entities.AdSlotBooking.filter({ advertiser_id: user.email });
    },
    enabled: !!user
  });

  // Calculate sustainability metrics
  const calculateMetrics = () => {
    const totalImpressions = bookings.reduce((sum, b) => {
      const weeksActive = b.weeks_booked || 1;
      const estimatedDailyImpressions = 500; // Estimate
      return sum + (estimatedDailyImpressions * 7 * weeksActive);
    }, 0);

    // Formulas
    const paperSavedKg = (totalImpressions * 0.5) / 1000; // 0.5g per flyer equivalent
    const carbonOffsetKg = paperSavedKg * 2.5; // Production + transport
    const treesSaved = paperSavedKg / 8; // 8kg paper = 1 tree
    const energyUsedKwh = bookings.length * 0.2 * 24 * 7; // 0.2kWh per screen per hour

    return {
      paper_saved_kg: paperSavedKg,
      carbon_offset_kg: carbonOffsetKg,
      trees_saved: treesSaved,
      energy_consumption_kwh: energyUsedKwh
    };
  };

  const metrics = calculateMetrics();

  const generatePDF = async () => {
    toast.success("Generating sustainability report...");
    
    try {
      const reportContent = `
        Sustainability Report - BeyondWalls
        Generated: ${new Date().toLocaleDateString()}
        
        Your Environmental Impact:
        - Paper Saved: ${metrics.paper_saved_kg.toFixed(1)} kg
        - Carbon Offset: ${metrics.carbon_offset_kg.toFixed(1)} kg CO₂
        - Trees Saved: ${Math.round(metrics.trees_saved)}
        - Energy Used: ${metrics.energy_consumption_kwh.toFixed(1)} kWh
        
        By choosing digital advertising, you're contributing to a greener future!
      `;

      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sustainability-report.txt';
      a.click();
      
      toast.success("Report downloaded!");
    } catch (error) {
      toast.error("Failed to generate report");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Sustainability Dashboard</h1>
                <p className="text-slate-500">Your environmental impact with BeyondWalls</p>
              </div>
            </div>
            <Button onClick={generatePDF} className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>

        {/* Main Metrics */}
        <div className="mb-6">
          <SustainabilityCard metrics={metrics} />
        </div>

        {/* Additional Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Why Digital Matters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-green-600 font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Zero Waste</p>
                  <p className="text-slate-600">No printed materials, no disposal</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Real-time Updates</p>
                  <p className="text-slate-600">Change content instantly, reduce reprints</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Energy Efficient</p>
                  <p className="text-slate-600">LED screens use minimal power</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                UAE Net Zero 2050
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-slate-700">
                BeyondWalls is proud to support the UAE's Net Zero 2050 strategic initiative by providing sustainable advertising solutions.
              </p>
              <div className="p-3 bg-white/50 rounded-lg">
                <p className="text-xs text-slate-600 mb-2">Your contribution:</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-green-600">
                    {metrics.carbon_offset_kg.toFixed(0)}
                  </span>
                  <span className="text-slate-600">kg CO₂ offset</span>
                </div>
              </div>
              <p className="text-xs text-slate-600">
                Equivalent to planting {Math.round(metrics.trees_saved)} trees or driving {(metrics.carbon_offset_kg / 0.4).toFixed(0)} fewer kilometers.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Chart */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Digital vs. Traditional Advertising</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Paper Consumption</span>
                  <span className="text-sm font-medium text-green-600">100% reduction</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-full" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Carbon Emissions</span>
                  <span className="text-sm font-medium text-green-600">85% reduction</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[85%]" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Update Efficiency</span>
                  <span className="text-sm font-medium text-violet-600">Instant</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500 w-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}