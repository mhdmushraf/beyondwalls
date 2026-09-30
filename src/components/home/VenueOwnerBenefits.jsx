import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Wallet, MonitorPlay, PieChart, Shield, 
  Clock, Users, Building2, ArrowRight,
  CheckCircle2, TrendingUp, DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function VenueOwnerBenefits() {
  const earnings = [
    { venues: "1 Screen", monthly: "AED 2,000 - 4,000", yearly: "AED 24,000 - 48,000" },
    { venues: "3 Screens", monthly: "AED 6,000 - 12,000", yearly: "AED 72,000 - 144,000" },
    { venues: "5+ Screens", monthly: "AED 10,000+", yearly: "AED 120,000+" },
  ];

  const benefits = [
    { icon: Wallet, title: "70% Revenue Share", desc: "Industry-leading payout rate", highlight: true },
    { icon: MonitorPlay, title: "Use Existing Screens", desc: "Works on any smart TV" },
    { icon: Shield, title: "Full Ad Control", desc: "Approve what runs on your screens" },
    { icon: PieChart, title: "Real-time Earnings", desc: "Track revenue as it happens" },
    { icon: Clock, title: "Weekly Payouts", desc: "Get paid every week" },
    { icon: Users, title: "Keep 3 Own Slots", desc: "Display your own content too" },
  ];

  const venueTypes = [
    "Restaurants", "Cafés", "Gyms", "Salons", "Hotels", 
    "Coworking Spaces", "Clinics", "Retail Stores"
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-emerald-100 text-emerald-700 border-0 mb-4">
            For Venue Owners
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Turn Your Screens Into <span className="text-emerald-600">Revenue Machines</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Earn passive income from your screens. No investment needed - use your existing screens.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Earnings Calculator */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-8 h-8" />
                <h3 className="text-2xl font-bold">Earnings Potential</h3>
              </div>
              <p className="text-emerald-100">Estimated monthly & yearly revenue</p>
            </div>
            <div className="p-6">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-slate-500 text-sm border-b">
                    <th className="pb-3">Setup</th>
                    <th className="pb-3">Monthly</th>
                    <th className="pb-3">Yearly</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.map((row, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-4 font-medium text-slate-900">{row.venues}</td>
                      <td className="py-4 text-emerald-600 font-semibold">{row.monthly}</td>
                      <td className="py-4 text-slate-700">{row.yearly}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-6 p-4 bg-emerald-50 rounded-xl">
                <p className="text-sm text-emerald-800">
                  <strong>💡 Pro Tip:</strong> Restaurants with 600+ daily customers typically earn on the higher end. 
                  Screens at counter, waiting areas, or entrance perform best.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {benefits.map((benefit, i) => (
                <Card key={i} className={`border-0 ${benefit.highlight ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' : 'bg-white shadow-lg'}`}>
                  <CardContent className="p-5">
                    <benefit.icon className={`w-8 h-8 mb-3 ${benefit.highlight ? 'text-white' : 'text-emerald-600'}`} />
                    <h4 className={`font-bold mb-1 ${benefit.highlight ? 'text-white' : 'text-slate-900'}`}>{benefit.title}</h4>
                    <p className={`text-sm ${benefit.highlight ? 'text-emerald-100' : 'text-slate-600'}`}>{benefit.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Venue Types */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h4 className="font-bold text-slate-900 mb-4">Perfect For:</h4>
              <div className="flex flex-wrap gap-2">
                {venueTypes.map((type, i) => (
                  <Badge key={i} variant="secondary" className="px-3 py-1.5">{type}</Badge>
                ))}
              </div>
            </div>

            {/* CTA */}
            <Link to={createPageUrl("Register")}>
              <Button size="lg" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 h-14 text-lg">
                <Building2 className="w-5 h-5 mr-2" />
                List Your Venue - Start Earning
              </Button>
            </Link>
            <p className="text-center text-slate-500 text-sm">
              Free to join • No contracts • Keep full control
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}