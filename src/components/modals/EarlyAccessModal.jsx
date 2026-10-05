import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  Mail,
  User,
  Building2,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function EarlyAccessModal({ open, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    interest: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await base44.entities.Lead.create({
        name: formData.name,
        email: formData.email,
        company_name: formData.company,
        lead_type: "advertiser",
        source: "website",
        notes: `AR Early Access Request: ${formData.interest}`,
        status: "new"
      });

      await base44.integrations.Core.SendEmail({
        to: "hello@linkzoneglobal.com",
        subject: `🚀 AR Early Access Request: ${formData.name}`,
        body: `
New AR Early Access Request:

Name: ${formData.name}
Email: ${formData.email}
Company: ${formData.company || "Not provided"}
Interest/Use Case: ${formData.interest || "Not specified"}

Source: Early Access Modal
        `
      });

      setSubmitted(true);
      toast.success("Request submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setFormData({ name: "", email: "", company: "", interest: "" });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-6 h-6 text-violet-500" />
            Request Early Access
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-violet-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Request Received!</h3>
            <p className="text-slate-600 mb-6">
              Our team will review your request and reach out within 2 business days to discuss AR Engage opportunities.
            </p>
            <Button onClick={handleClose} className="bg-gradient-to-r from-violet-600 to-indigo-600">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-slate-600 text-sm">
              Interested in AR advertising? Tell us about your use case and we'll reach out to discuss early access options.
            </p>
            
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  required
                  placeholder="Your full name"
                  className="pl-10"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Company Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Your company"
                  className="pl-10"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>What interests you about AR?</Label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Textarea
                  placeholder="Tell us about your AR advertising goals..."
                  className="pl-10 min-h-[80px]"
                  value={formData.interest}
                  onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Request Early Access
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}