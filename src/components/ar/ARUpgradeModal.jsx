import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Crown,
  CheckCircle2,
  Loader2,
  Zap,
  Box,
  Eye,
  BarChart3,
  Sparkles,
  Mail,
  User,
  Building2,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const PLANS = [
  {
    id: "starter",
    name: "AR Starter",
    price: 2500,
    credits: 5,
    description: "Perfect for testing AR advertising",
    features: [
      "5 AR campaign credits",
      "Basic 3D product models",
      "QR code generation",
      "Standard analytics",
      "Email support"
    ],
    popular: false
  },
  {
    id: "professional",
    name: "AR Professional",
    price: 7500,
    credits: 20,
    description: "For growing brands with AR ambitions",
    features: [
      "20 AR campaign credits",
      "Advanced 3D modeling",
      "Virtual try-on features",
      "Place in room AR",
      "Advanced analytics dashboard",
      "Priority support",
      "Custom branding"
    ],
    popular: true
  },
  {
    id: "enterprise",
    name: "AR Enterprise",
    price: null,
    credits: 100,
    description: "Full AR solution for large brands",
    features: [
      "100+ AR campaign credits",
      "Custom AR development",
      "API integration",
      "Dedicated account manager",
      "SLA guarantee",
      "White-label options",
      "Multi-market support"
    ],
    popular: false
  }
];

export default function ARUpgradeModal({ open, onClose, currentSubscription }) {
  const [selectedPlan, setSelectedPlan] = useState("professional");
  const [processing, setProcessing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: ""
  });

  const handleJoinWaitlist = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Please fill in your name and email");
      return;
    }

    setProcessing(true);
    try {
      const plan = PLANS.find(p => p.id === selectedPlan);
      
      // Create lead for waitlist
      await base44.entities.Lead.create({
        name: formData.name,
        email: formData.email,
        company_name: formData.company,
        phone: formData.phone,
        lead_type: "advertiser",
        source: "website",
        status: "new",
        notes: `AR Premium Waitlist - Interested in: ${plan.name}`,
        expected_value: plan.price || 10000
      });

      // Send notification email
      await base44.integrations.Core.SendEmail({
        to: "partnership@beyondwalls.ae",
        subject: `🎯 New AR Premium Waitlist: ${formData.name}`,
        body: `
New AR Premium Waitlist Registration:

Name: ${formData.name}
Email: ${formData.email}
Company: ${formData.company || "N/A"}
Phone: ${formData.phone || "N/A"}
Interested Plan: ${plan.name}
Expected Value: AED ${plan.price?.toLocaleString() || "Custom"}
        `
      });

      setSubmitted(true);
    } catch (error) {
      toast.error("Failed to join waitlist. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // Success state
  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">You're on the Waitlist!</h3>
            <p className="text-slate-600 mb-6">
              Thank you for your interest in AR Engage Premium. We'll notify you as soon as it's available.
            </p>
            <Button onClick={onClose} className="bg-gradient-to-r from-violet-600 to-fuchsia-600">
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Crown className="w-6 h-6 text-amber-500" />
            Join AR Engage Premium Waitlist
          </DialogTitle>
        </DialogHeader>

        <p className="text-slate-600 mb-6">
          AR Engage is coming soon! Join the waitlist to get early access and exclusive launch pricing.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative rounded-xl border-2 p-5 cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? "border-violet-500 bg-violet-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">
                  Most Popular
                </Badge>
              )}
              <h3 className="font-bold text-slate-900 mb-1">{plan.name}</h3>
              <p className="text-slate-500 text-sm mb-3">{plan.description}</p>
              <div className="mb-4">
                {plan.price ? (
                  <>
                    <span className="text-2xl font-bold text-slate-900">AED {plan.price.toLocaleString()}</span>
                    <span className="text-slate-500">/month</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-slate-900">Custom</span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-4 p-2 bg-violet-100 rounded-lg">
                <Sparkles className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-medium text-violet-700">{plan.credits} AR Credits</span>
              </div>
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Waitlist Form */}
        <div className="bg-slate-50 rounded-xl p-6 mb-6">
          <h4 className="font-semibold text-slate-900 mb-4">Join the Waitlist</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Your full name"
                  className="pl-10"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Company (Optional)</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Company name"
                  className="pl-10"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Phone (Optional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="+971 XX XXX XXXX"
                  className="pl-10"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleJoinWaitlist}
            disabled={processing || !formData.name || !formData.email}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Join Waitlist
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}