import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Loader2,
  Megaphone,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import PublicAIChatWidget from "@/components/chat/PublicAIChatWidget";

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success("Message sent! We'll get back to you soon.");
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    setLoading(false);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "hello@beyondwalls.ae",
      link: "mailto:hello@beyondwalls.ae"
    },
    {
      icon: Phone,
      title: "Phone",
      value: "+971 55 614 0067",
      link: "tel:+971556140067"
    },
    {
      icon: MapPin,
      title: "Address",
      value: "in5 - Dubai Internet City, Dubai, UAE",
      link: "https://maps.google.com/?q=in5+Dubai+Internet+City"
    },
    {
      icon: Clock,
      title: "Business Hours",
      value: "Sun - Thu: 9AM - 6PM",
      link: null
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead {...PAGE_SEO.contact} />
      <PublicNav />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-violet-50 via-white to-indigo-50 relative overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-violet-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-indigo-200 rounded-full blur-3xl opacity-30" />
        <div className="max-w-4xl mx-auto text-center relative">
          <Badge className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 px-4 py-2 mb-6">
            Let's Connect
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            We'd Love to Hear From You
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Whether you're an advertiser, venue owner, or investor - our team is ready to help you succeed.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-8 px-6 -mt-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow-xl text-center">
              <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Megaphone className="w-7 h-7 text-violet-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Advertisers</h3>
              <p className="text-slate-500 text-sm mb-3">Start your campaign today</p>
              <a href="mailto:hello@beyondwalls.ae" className="text-violet-600 font-medium text-sm hover:underline">
                hello@beyondwalls.ae
              </a>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-xl text-center">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Venue Partners</h3>
              <p className="text-slate-500 text-sm mb-3">Monetize your screens</p>
              <a href="mailto:partnership@beyondwalls.ae" className="text-emerald-600 font-medium text-sm hover:underline">
                partnership@beyondwalls.ae
              </a>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-xl text-center">
              <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Technical Support</h3>
              <p className="text-slate-500 text-sm mb-3">Need help? We're here</p>
              <a href="mailto:support@beyondwalls.ae" className="text-amber-600 font-medium text-sm hover:underline">
                support@beyondwalls.ae
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Information</h2>
                <p className="text-slate-600">
                  Reach out to us through any of these channels. We're here to help!
                </p>
              </div>

              {contactInfo.map((info, i) => (
                <Card key={i} className="border-0 shadow-md">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
                      <info.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{info.title}</p>
                      {info.link ? (
                        <a href={info.link} className="font-medium text-slate-900 hover:text-violet-600">
                          {info.value}
                        </a>
                      ) : (
                        <p className="font-medium text-slate-900">{info.value}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Social Links */}
              <div className="pt-6">
                <p className="text-sm text-slate-500 mb-4">Follow us on social media</p>
                <div className="flex gap-3">
                  {["LinkedIn", "Twitter", "Instagram"].map((social, i) => (
                    <Button key={i} variant="outline" size="sm" className="text-slate-900">
                      {social}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-slate-900" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Send us a Message</h3>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Full Name *</Label>
                        <Input
                          required
                          placeholder="Your name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email Address *</Label>
                        <Input
                          type="email"
                          required
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input
                          placeholder="+971 XX XXX XXXX"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Subject *</Label>
                        <Select
                          value={formData.subject}
                          onValueChange={(v) => setFormData({ ...formData, subject: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a topic" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="advertiser">I'm an Advertiser</SelectItem>
                            <SelectItem value="venue">I'm a Venue Owner</SelectItem>
                            <SelectItem value="partnership">Partnership Inquiry</SelectItem>
                            <SelectItem value="support">Technical Support</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Message *</Label>
                      <Textarea
                        required
                        placeholder="How can we help you?"
                        className="h-32"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 h-12"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Google Map */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Visit Our Office</h3>
            <p className="text-slate-600">in5 - Dubai Internet City, Dubai, UAE</p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3613.168!2d55.1544!3d25.0957!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f6b5402c126e3%3A0xb9511e6655c46d7c!2sin5%20Tech%20Innovation%20Centre!5e0!3m2!1sen!2sae!4v1700000000000!5m2!1sen!2sae"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="BeyondWalls Office Location - in5 Dubai Internet City"
            />
          </div>
          <div className="mt-6 text-center">
            <a
              href="https://maps.google.com/?q=in5+Dubai+Internet+City+Dubai"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">
                <MapPin className="w-4 h-4 mr-2" />
                Get Directions
              </Button>
            </a>
          </div>
        </div>
      </section>

      <PublicFooter />
      <PublicAIChatWidget />
    </div>
  );
}