import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Search,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Megaphone,
  Building2,
  CreditCard,
  Settings,
  Shield,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead, { PAGE_SEO } from "@/components/SEOHead";

export default function HelpCenter() {
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Topics", icon: HelpCircle },
    { id: "advertiser", name: "For Advertisers", icon: Megaphone },
    { id: "venue", name: "For Venues", icon: Building2 },
    { id: "billing", name: "Billing & Payments", icon: CreditCard },
    { id: "technical", name: "Technical", icon: Settings },
    { id: "security", name: "Security & Privacy", icon: Shield }
  ];

  const faqs = [
    {
      category: "advertiser",
      question: "How do I create my first campaign?",
      answer: "Creating a campaign is easy! Log in to your dashboard, click 'Create Campaign', and follow the 5-step wizard. You'll set your campaign details, choose target locations, select screens, upload your creative, and review before submitting. Campaigns are typically approved within 2-4 hours."
    },
    {
      category: "advertiser",
      question: "What ad formats are supported?",
      answer: "We support static images (JPG, PNG) and videos (MP4). Recommended resolution is 1920x1080 for landscape or 1080x1920 for portrait screens. Maximum video duration is 60 seconds. File size limit is 50MB."
    },
    {
      category: "advertiser",
      question: "How is campaign pricing calculated?",
      answer: "Pricing is based on the hourly rate of each screen multiplied by the duration and time slots selected. You'll see the total cost before submitting your campaign. There are no hidden fees."
    },
    {
      category: "advertiser",
      question: "Can I pause or cancel my campaign?",
      answer: "Yes! You can pause an active campaign anytime from your dashboard. Paused campaigns don't incur charges. To cancel, contact our support team and we'll process a refund for any unused budget."
    },
    {
      category: "venue",
      question: "How do I register my venue?",
      answer: "Sign up as a venue owner and complete your profile with venue details, trade license, and contact information. Once verified (usually within 24-48 hours), you can start adding screens to your venue."
    },
    {
      category: "venue",
      question: "What devices are compatible with the screen player?",
      answer: "Our web-based player works on any device with a modern browser. This includes Android TV, LG WebOS, Samsung Tizen, Amazon Fire TV, and any computer or smart TV with Chrome, Firefox, or Safari."
    },
    {
      category: "venue",
      question: "How do I set up my screen?",
      answer: "1. Add the screen in your dashboard (name, size, location, rate). 2. Get your Screen ID and PIN. 3. Open the BeyondWalls Player URL on your TV. 4. Enter credentials and connect. That's it!"
    },
    {
      category: "venue",
      question: "How much can I earn from my screens?",
      answer: "Earnings depend on your screen's hourly rate and how often ads are displayed. You receive 70% of all ad revenue. Most venues earn AED 500-3000 per screen per month depending on location and foot traffic."
    },
    {
      category: "billing",
      question: "What payment methods do you accept?",
      answer: "We accept credit/debit cards (Visa, Mastercard), Apple Pay, Google Pay, and bank transfers. All payments are processed securely through our payment partners."
    },
    {
      category: "billing",
      question: "How do wallet top-ups work?",
      answer: "Add funds to your wallet using any payment method. Your wallet balance is used to pay for campaigns. Top-ups are instant and you can add any amount above AED 100."
    },
    {
      category: "billing",
      question: "How do withdrawals work for venue owners?",
      answer: "Request a withdrawal from your dashboard anytime your balance exceeds AED 100. Withdrawals are processed within 3-5 business days to your registered bank account."
    },
    {
      category: "technical",
      question: "What happens if my screen goes offline?",
      answer: "Our system detects offline screens within 60 seconds via heartbeat monitoring. You'll receive notifications via email. The screen will automatically reconnect when internet is restored."
    },
    {
      category: "technical",
      question: "How do I reset my screen's PIN?",
      answer: "Go to My Screens in your dashboard, click on the screen settings, and generate a new PIN. Update the PIN on your physical screen player to reconnect."
    },
    {
      category: "security",
      question: "Is my payment information secure?",
      answer: "Yes! We use industry-standard encryption (SSL/TLS) and never store your full card details. All payments are processed through PCI-compliant payment providers."
    },
    {
      category: "security",
      question: "How is my screen protected from unauthorized access?",
      answer: "Each screen has a unique ID and optional PIN protection. Only authenticated devices can display content. All communications are encrypted and we monitor for suspicious activity."
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(search.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        {...PAGE_SEO.helpCenter}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "name": "BeyondWalls Help Center & FAQs",
          "description": "Frequently asked questions about DOOH advertising on BeyondWalls platform",
          "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        }}
      />
      <PublicNav />

      {/* Hero */}
      <section className="pt-32 pb-12 px-6 bg-gradient-to-br from-violet-50 via-white to-indigo-50 relative overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-violet-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-indigo-200 rounded-full blur-3xl opacity-30" />
        <div className="max-w-4xl mx-auto text-center relative">
          <Badge className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 px-4 py-2 mb-6">
            24/7 Support
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            How Can We Help You?
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Find answers to common questions or reach out to our support team
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search for answers..."
              className="pl-12 h-14 text-lg shadow-lg border-0"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 px-6 bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to={createPageUrl("HowItWorks")} className="bg-white/5 hover:bg-white/10 rounded-xl p-4 text-center transition-colors">
              <Megaphone className="w-6 h-6 text-violet-400 mx-auto mb-2" />
              <p className="text-white font-medium text-sm">How It Works</p>
            </Link>
            <Link to={createPageUrl("Contact")} className="bg-white/5 hover:bg-white/10 rounded-xl p-4 text-center transition-colors">
              <MessageSquare className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-white font-medium text-sm">Contact Support</p>
            </Link>
            <Link to={createPageUrl("Services")} className="bg-white/5 hover:bg-white/10 rounded-xl p-4 text-center transition-colors">
              <Building2 className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="text-white font-medium text-sm">Our Services</p>
            </Link>
            <a href="mailto:support@beyondwalls.ae" className="bg-white/5 hover:bg-white/10 rounded-xl p-4 text-center transition-colors">
              <Shield className="w-6 h-6 text-rose-400 mx-auto mb-2" />
              <p className="text-white font-medium text-sm">Email Support</p>
            </a>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 px-6 border-b border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-3 flex-wrap justify-center">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat.id)}
                className={selectedCategory === cat.id 
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600" 
                  : "text-slate-900"
                }
              >
                <cat.icon className="w-4 h-4 mr-2" />
                {cat.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-16">
              <HelpCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No results found</h3>
              <p className="text-slate-500 mb-6">Try adjusting your search or browse categories</p>
              <Link to={createPageUrl("Contact")}>
                <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">
                  Contact Support
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <Card key={index} className="border border-slate-200 overflow-hidden">
                  <button
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span className="font-medium text-slate-900 pr-4">{faq.question}</span>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-violet-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === index && (
                    <CardContent className="px-6 pb-4 pt-0">
                      <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-violet-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px"}} />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Our support team responds within 24 hours. We're here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Contact")}>
              <Button size="lg" className="bg-white text-violet-600 hover:bg-slate-100 h-14 px-8">
                Contact Support
              </Button>
            </Link>
            <a href="mailto:support@beyondwalls.ae">
              <Button size="lg" className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-violet-600 h-14 px-8">
                support@beyondwalls.ae
              </Button>
            </a>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-white/60 text-sm">
            <span>📞 +971 55 614 0067</span>
            <span>📍 in5 Dubai, UAE</span>
            <span>⏰ Sun-Thu 9AM-6PM</span>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}