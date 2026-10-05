import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  Handshake,
  Upload,
  Rocket,
  Wallet,
  TrendingUp,
  Shield,
  Zap,
  Users,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Building2,
  Globe,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead, { PAGE_SEO } from "@/components/SEOHead";

export default function Connect() {
  const [formData, setFormData] = useState({
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    screen_count: "",
    goals: ""
  });
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      toast.error("Please agree to be contacted by our team");
      return;
    }
    
    setSubmitting(true);
    try {
      await base44.entities.PartnerApplication.create(formData);
      
      // Send notification email
      await base44.integrations.Core.SendEmail({
        to: "hello@linkzoneglobal.com",
        subject: `New Partner Application: ${formData.company_name}`,
        body: `
New partner application received:

Company: ${formData.company_name}
Contact: ${formData.contact_person}
Email: ${formData.email}
Phone: ${formData.phone}
Screens: ${formData.screen_count}
Goals: ${formData.goals || "Not specified"}
        `
      });

      setSubmitted(true);
      toast.success("Application submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    {
      icon: Upload,
      title: "Apply & Integrate",
      description: "Submit your company details. Our team will onboard you and help integrate your screen inventory via our simple API or manual upload. The process takes less than a week."
    },
    {
      icon: Rocket,
      title: "Go Live on Our Marketplace",
      description: "Your available ad space instantly becomes visible to our growing network of SME and corporate advertisers. You set the minimum prices and control which screens are listed."
    },
    {
      icon: Wallet,
      title: "Earn Passive Revenue",
      description: "Sit back as bookings roll in. We handle the payments, ad delivery, and customer support. You receive 85% of the gross revenue from every ad we sell on your screens, paid weekly."
    }
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: "Access New Revenue Streams",
      description: "Tap into the massive, underserved SME market that's eager for affordable DOOH advertising."
    },
    {
      icon: DollarSign,
      title: "Zero Upfront Costs",
      description: "No fees to join. We only earn when you earn. Pure performance-based partnership."
    },
    {
      icon: Zap,
      title: "Leverage Our Technology",
      description: "Use our AI-powered platform, analytics, and self-serve dashboard to maximize efficiency."
    },
    {
      icon: Globe,
      title: "Expand Your Reach",
      description: "Get your screens in front of hundreds of new advertisers actively looking to book."
    },
    {
      icon: Shield,
      title: "Full Control",
      description: "You decide which screens to list, set minimum prices, and approve advertisers."
    },
    {
      icon: Users,
      title: "Focus on Your Core Business",
      description: "We act as your digital sales team for new client acquisition while you focus on operations."
    }
  ];

  const stats = [
    { value: "100%", label: "Revenue Share" },
    { value: "Self-serve", label: "Booking platform" },
    { value: "Weekly", label: "Payouts" },
    { value: "<7 Days", label: "Onboarding" }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <SEOHead {...PAGE_SEO.connect} />
      <PublicNav />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <Handshake className="w-6 h-6 text-violet-400" />
            <span className="text-violet-400 font-semibold">B2B Partner Program</span>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
            Beyond Walls Connect:<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
              The Partner Network for DOOH Growth
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 max-w-3xl mb-8">
            Unlock the power of our marketplace. Connect your screens to ready-to-advertise businesses and keep <span className="text-white font-bold">100% of your screen rate</span> on all new sales we generate for you.
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              onClick={() => document.getElementById("apply-form").scrollIntoView({ behavior: "smooth" })}
            >
              Join the Network Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-slate-900">
              Schedule a Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              How It Works in 3 Steps
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Simple onboarding, powerful results. Get started in less than a week.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-slate-50 rounded-2xl p-8 h-full border border-slate-100 hover:border-violet-200 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {i + 1}
                    </div>
                    <step.icon className="w-8 h-8 text-violet-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-600">{step.description}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-slate-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Benefits of Joining the Connect Network
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to grow your DOOH business without the hassle
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, i) => (
              <Card key={i} className="border-0 shadow-md hover:shadow-xl transition-all bg-white">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-violet-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{benefit.title}</h3>
                  <p className="text-slate-600 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply-form" className="py-20 px-6 bg-gradient-to-br from-violet-600 to-indigo-700">
        <div className="max-w-2xl mx-auto">
          {submitted ? (
            <Card className="border-0 shadow-2xl">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Application Submitted!</h3>
                <p className="text-slate-600 mb-8">
                  Thank you for your interest in Beyond Walls Connect! Our partnership team will review your application and contact you within 2 business days to discuss the next steps.
                </p>
                <Link to={createPageUrl("Home")}>
                  <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">
                    Return to Home
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-2xl">
              <CardContent className="p-8 lg:p-12">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-violet-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    Apply to Become a Connect Partner
                  </h3>
                  <p className="text-slate-600">
                    Fill out the form below and our team will reach out within 2 business days
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label>Company Name *</Label>
                      <Input
                        required
                        placeholder="Your company name"
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Person *</Label>
                      <Input
                        required
                        placeholder="Full name"
                        value={formData.contact_person}
                        onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label>Business Email *</Label>
                      <Input
                        type="email"
                        required
                        placeholder="email@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number *</Label>
                      <Input
                        type="tel"
                        required
                        placeholder="+971 XX XXX XXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Approximate Number of Screens *</Label>
                    <Select
                      value={formData.screen_count}
                      onValueChange={(v) => setFormData({ ...formData, screen_count: v })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select screen count" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-50">1-50 Screens</SelectItem>
                        <SelectItem value="51-200">51-200 Screens</SelectItem>
                        <SelectItem value="201-500">201-500 Screens</SelectItem>
                        <SelectItem value="500+">500+ Screens</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>What are your goals for joining the network?</Label>
                    <Textarea
                      placeholder="e.g., Access SME market, Monetize unused ad space, etc."
                      value={formData.goals}
                      onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div className="flex items-start gap-3 pt-2">
                    <Checkbox
                      id="agree"
                      checked={agreed}
                      onCheckedChange={setAgreed}
                    />
                    <Label htmlFor="agree" className="text-sm text-slate-600 font-normal cursor-pointer">
                      I agree to be contacted by the Beyond Walls team regarding this partnership opportunity
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Apply for Partnership
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}