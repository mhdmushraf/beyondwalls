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
    area: "",
    address: "",
    operating_hours: "",
    daily_customers: "",
    screen_location: "",
    screen_visibility_percent: "",
    peak_hours: [],
    customer_dwell_time: "",
    customer_age_groups: [],
    customer_gender_mix: "",
    special_events: "",
    number_of_screens: "",
    min_payment_per_screen: "",
    trade_license: null,
    venue_front_photo: null,
    screen_photos: [],
    high_traffic_photo: null,
    notes: ""
  });

  const venueTypes = [
    "restaurant", "cafe", "mall", "gym", "coworking", 
    "hotel", "hospital", "salon", "other"
  ];

  const screenLocations = [
    "counter", "waiting_area", "entrance", "tables", 
    "equipment_area", "walkway", "other"
  ];

  const peakHourOptions = [
    "6AM-9AM", "9AM-12PM", "12PM-3PM", "3PM-6PM", 
    "6PM-9PM", "9PM-12AM"
  ];

  const ageGroupOptions = [
    "18-24", "25-34", "35-44", "45-54", "55+"
  ];

  const handleFileUpload = async (file, fieldName) => {
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (fieldName === "trade_license") {
        setFormData({...formData, trade_license: file_url});
      } else if (fieldName === "venue_front_photo") {
        setFormData({...formData, venue_front_photo: file_url});
      } else if (fieldName === "high_traffic_photo") {
        setFormData({...formData, high_traffic_photo: file_url});
      } else if (fieldName === "screen_photos") {
        setFormData({...formData, screen_photos: [...formData.screen_photos, file_url]});
      }
    } catch (error) {
      console.error("File upload failed:", error);
      toast.error("Failed to upload file");
    }
  };

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
        notes: `Venue Type: ${formData.venue_type}
City: ${formData.city}
Area: ${formData.area}
Address: ${formData.address}
Operating Hours: ${formData.operating_hours}
Daily Customers: ${formData.daily_customers}
Screen Location: ${formData.screen_location}
Screen Visibility: ${formData.screen_visibility_percent}%
Peak Hours: ${formData.peak_hours.join(", ")}
Customer Dwell Time: ${formData.customer_dwell_time} minutes
Age Groups: ${formData.customer_age_groups.join(", ")}
Gender Mix: ${formData.customer_gender_mix}
Special Events: ${formData.special_events}
Number of Screens: ${formData.number_of_screens}
Minimum Payment Per Screen: AED ${formData.min_payment_per_screen}/week
Trade License: ${formData.trade_license || "Not provided"}
Venue Front Photo: ${formData.venue_front_photo || "Not provided"}
Screen Photos: ${formData.screen_photos.join(", ") || "Not provided"}
High Traffic Photo: ${formData.high_traffic_photo || "Not provided"}

Additional Notes: ${formData.notes}`,
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
            Location: ${formData.address}, ${formData.area}, ${formData.city}
            Operating Hours: ${formData.operating_hours}
            Daily Customers: ${formData.daily_customers}
            Screen Location: ${formData.screen_location}
            Screen Visibility: ${formData.screen_visibility_percent}%
            
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
                      <Select value={formData.venue_type} onValueChange={(value) => setFormData({...formData, venue_type: value})} required>
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
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Area/District *</label>
                      <Input
                        required
                        value={formData.area}
                        onChange={(e) => setFormData({...formData, area: e.target.value})}
                        placeholder="e.g., Dubai Marina, Business Bay"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Operating Hours *</label>
                      <Input
                        required
                        value={formData.operating_hours}
                        onChange={(e) => setFormData({...formData, operating_hours: e.target.value})}
                        placeholder="e.g., 8AM-11PM"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Address *</label>
                    <Input
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Street address, building number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Daily Customer Count (Estimated) *</label>
                    <Input
                      required
                      type="number"
                      value={formData.daily_customers}
                      onChange={(e) => setFormData({...formData, daily_customers: e.target.value})}
                      placeholder="e.g., 300"
                    />
                  </div>
                </div>

                {/* Screen & Audience Information */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-violet-600" />
                    Screen & Audience Details
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Screen Location *</label>
                      <Select value={formData.screen_location} onValueChange={(value) => setFormData({...formData, screen_location: value})} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {screenLocations.map(loc => (
                            <SelectItem key={loc} value={loc}>
                              {loc.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Screen Visibility (%) *</label>
                      <Input
                        required
                        type="number"
                        min="0"
                        max="100"
                        value={formData.screen_visibility_percent}
                        onChange={(e) => setFormData({...formData, screen_visibility_percent: e.target.value})}
                        placeholder="e.g., 80"
                      />
                      <p className="text-xs text-slate-500 mt-1">% of customers who can see the screen</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Peak Hours (Select all that apply) *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {peakHourOptions.map(hour => (
                        <label key={hour} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-slate-50">
                          <input
                            type="checkbox"
                            checked={formData.peak_hours.includes(hour)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({...formData, peak_hours: [...formData.peak_hours, hour]});
                              } else {
                                setFormData({...formData, peak_hours: formData.peak_hours.filter(h => h !== hour)});
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{hour}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Avg. Customer Dwell Time (minutes) *</label>
                      <Input
                        required
                        type="number"
                        value={formData.customer_dwell_time}
                        onChange={(e) => setFormData({...formData, customer_dwell_time: e.target.value})}
                        placeholder="e.g., 30"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Customer Gender Mix *</label>
                      <Select value={formData.customer_gender_mix} onValueChange={(value) => setFormData({...formData, customer_gender_mix: value})} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select mix" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mostly_male">Mostly Male</SelectItem>
                          <SelectItem value="mostly_female">Mostly Female</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                          <SelectItem value="unknown">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Customer Age Groups (Select all that apply) *</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {ageGroupOptions.map(age => (
                        <label key={age} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-slate-50">
                          <input
                            type="checkbox"
                            checked={formData.customer_age_groups.includes(age)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({...formData, customer_age_groups: [...formData.customer_age_groups, age]});
                              } else {
                                setFormData({...formData, customer_age_groups: formData.customer_age_groups.filter(a => a !== age)});
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{age}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Special Events / Busy Days</label>
                    <Input
                      value={formData.special_events}
                      onChange={(e) => setFormData({...formData, special_events: e.target.value})}
                      placeholder="e.g., Weekends, Friday brunch, Happy hours"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Number of Screens *</label>
                      <Input
                        required
                        type="number"
                        min="1"
                        value={formData.number_of_screens}
                        onChange={(e) => setFormData({...formData, number_of_screens: e.target.value})}
                        placeholder="e.g., 2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Min. Payment Per Screen (AED/week) *</label>
                      <Input
                        required
                        type="number"
                        min="0"
                        value={formData.min_payment_per_screen}
                        onChange={(e) => setFormData({...formData, min_payment_per_screen: e.target.value})}
                        placeholder="e.g., 500"
                      />
                      <p className="text-xs text-slate-500 mt-1">Your expected minimum earnings per screen per week</p>
                    </div>
                  </div>
                </div>

                {/* Documents & Images */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <h3 className="font-semibold text-slate-900">Documents & Photos *</h3>
                  <p className="text-sm text-slate-600">Please upload clear photos to help us assess your venue</p>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Trade License (Optional)</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], "trade_license")}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                    />
                    {formData.trade_license && (
                      <p className="text-xs text-green-600 mt-1">✓ Trade license uploaded</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Venue Front Photo *</label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], "venue_front_photo")}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                    />
                    {formData.venue_front_photo && (
                      <p className="text-xs text-green-600 mt-1">✓ Venue front photo uploaded</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">Clear photo of your venue entrance/exterior</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Screen Photos *</label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      multiple
                      onChange={(e) => {
                        Array.from(e.target.files).forEach(file => handleFileUpload(file, "screen_photos"));
                      }}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                    />
                    {formData.screen_photos.length > 0 && (
                      <p className="text-xs text-green-600 mt-1">✓ {formData.screen_photos.length} screen photo(s) uploaded</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">Photos of existing screens or proposed screen locations</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">High Traffic Photo *</label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], "high_traffic_photo")}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                    />
                    {formData.high_traffic_photo && (
                      <p className="text-xs text-green-600 mt-1">✓ High traffic photo uploaded</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">Photo showing your venue during peak hours with customers</p>
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