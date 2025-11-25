import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  MonitorPlay,
  ArrowRight,
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
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <MonitorPlay className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">BeyondWalls</span>
          </Link>
          <Link to={createPageUrl("Register")}>
            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-12 px-6 bg-gradient-to-br from-violet-50 via-white to-indigo-50">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-amber-100 text-slate-900 mb-6">Help Center</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            How Can We Help?
          </h1>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search for answers..."
              className="pl-12 h-14 text-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <MessageSquare className="w-16 h-16 text-violet-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Still Have Questions?
          </h2>
          <p className="text-slate-600 mb-8">
            Our support team is here to help. Reach out and we'll get back to you within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Contact")}>
              <Button size="lg" className="bg-gradient-to-r from-violet-600 to-indigo-600">
                Contact Support
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-slate-900">
              <a href="mailto:info@beyondwalls.ae">Email: info@beyondwalls.ae</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-slate-900 text-center">
        <p className="text-slate-400">© 2024 BeyondWalls. All rights reserved.</p>
      </footer>
    </div>
  );
}