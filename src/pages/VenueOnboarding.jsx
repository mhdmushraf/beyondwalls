import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Building2, Phone, Mail, MapPin, Users, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { toast } from "sonner";

export default function VenueOnboarding() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company_name: "",
    venue_type: "",
    city: "",
    address: "",
    daily_footfall: "",
    notes: ""
  });

  const venueTypes = [
    "restaurant", "cafe", "mall", "gym", "coworking", 
    "hotel", "hospital", "salon", "other"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await base44.entities.Lead.create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company_name: formData.company_name,
        lead_type: "venue_owner",
        source: "website",
        status: "new",
        notes: `Venue Type: ${formData.venue_type}\nCity: ${formData.city}\nAddress: ${formData.address}\nDaily Footfall: ${formData.daily_footfall}\n\nAdditional Notes: ${formData.notes}`,
        priority: "high"
      });

      // Send notification email to admin
      try {
        await base44.integrations.Core.SendEmail({
          to: "admin@beyondwalls.com",
          subject: "🏢 New Venue Onboarding Request",
          body: `
            New venue owner has requested to join BeyondWalls!
            
            Contact Details:
            Name: ${formData.name}
            Email: ${formData.email}
            Phone: ${formData.phone}
            
            Venue Details:
            Venue Name: ${formData.company_name}
            Type: ${formData.venue_type}
            Location: ${formData.address}, ${formData.city}
            Daily Footfall: ${formData.daily_footfall}
            
            Notes: ${formData.notes}
            
            Please follow up with this lead in the CRM system.
          `
        });
      } catch (e) {
        console.log("Email notification failed:", e);
      }

      setSubmitted(true);
      toast.success("Request submitted successfully!");
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <PublicNav />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-indigo-50/30 flex items-center justify-center p-6">
          <Card className="max-w-lg w-full">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                Thank You for Your Interest!
              </h2>
              <p className="text-slate-600 mb-6">
                We've received your venue onboarding request. Our team will review your information and get back to you within 24-48 hours.
              </p>
              <p className="text-sm text-slate-500 mb-6">
                Check your email ({formData.email}) for confirmation and next steps.
              </p>
              <Button 
                onClick={() => window.location.href = "/"}
                className="bg-gradient-to-r from-violet-600 to-indigo-600"
              >
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
        <PublicFooter />
      </>
    );
  }

  return (
    <>
      <PublicNav />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-indigo-50/30 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl mb-6 shadow-xl shadow-violet-500/30">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Join BeyondWalls
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Transform your venue into a revenue-generating advertising space
            </p>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-white/80 backdrop-blur-xl border-violet-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Passive Income</h3>
                <p className="text-sm text-slate-600">Earn 70% revenue from every ad displayed on your screens</p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-xl border-indigo-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Easy Setup</h3>
                <p className="text-sm text-slate-600">We handle everything - from installation to content management</p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-xl border-purple-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">Full Control</h3>
                <p className="text-sm text-slate-600">Reserve slots for your own promotions anytime</p>
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <Card className="bg-white/80 backdrop-blur-xl shadow-2xl">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-2xl font-bold text-slate-900">Venue Onboarding Request</CardTitle>
              <p className="text-slate-600 mt-2">Fill out the form below and our team will contact you shortly</p>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-violet-600" />
                    Contact Information
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                      <Input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Email Address *</label>
                      <Input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number *</label>
                    <Input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+971 50 123 4567"
                    />
                  </div>
                </div>

                {/* Venue Information */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-violet-600" />
                    Venue Information
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Venue Name *</label>
                    <Input
                      required
                      value={formData.company_name}
                      onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                      placeholder="My Coffee Shop"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Venue Type *</label>
                      <Select value={formData.venue_type} onValueChange={(value) => setFormData({...formData, venue_type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {venueTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">City *</label>
                      <Input
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        placeholder="Dubai"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Address *</label>
                    <Input
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Street address, area"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Daily Footfall (Estimated) *</label>
                    <Input
                      required
                      value={formData.daily_footfall}
                      onChange={(e) => setFormData({...formData, daily_footfall: e.target.value})}
                      placeholder="e.g., 200-500 customers/day"
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <h3 className="font-semibold text-slate-900">Additional Information</h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tell us more about your venue and goals
                    </label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Any specific requirements, questions, or information you'd like to share..."
                      rows={4}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 h-12 text-lg shadow-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Onboarding Request"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Trust Badges */}
          <div className="mt-12 text-center">
            <p className="text-sm text-slate-500 mb-4">Trusted by venues across the UAE</p>
            <div className="flex flex-wrap justify-center gap-8 text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Free Setup</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>No Hidden Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PublicFooter />
    </>
  );
}