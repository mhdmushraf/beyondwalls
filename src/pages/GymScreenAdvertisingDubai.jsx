import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Dumbbell, Clock, Target, BarChart3, Heart, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";
import FAQSection, { buildFAQSchema } from "@/components/marketing/FAQSection";

export default function GymScreenAdvertisingDubai() {
  const faqs = [
    {
      question: "How much does gym screen advertising cost in Dubai?",
      answer: "Gym and fitness screen advertising on Beyond Walls starts from AED 99 per week per screen. There are no minimum spends, no contracts, and no setup fees — you only pay for the screens and weeks you select."
    },
    {
      question: "What audience does gym DOOH advertising reach?",
      answer: "Gym screens reach health-conscious individuals aged 18–45 who spend 45–90 minutes per session. The audience skews toward professionals with disposable income who actively invest in fitness, wellness, nutrition, and lifestyle products."
    },
    {
      question: "How long do viewers see my ad during a gym session?",
      answer: "The average gym session lasts 45–90 minutes, and screens cycle ads every 5 minutes. That means a single gym-goer may see your ad 9–18 times in one visit, delivering exceptional repetition and brand recall."
    },
    {
      question: "How do I book gym screen advertising in Dubai?",
      answer: "Create a free account, browse available gym screens across Dubai, select your preferred locations and dates, upload your creative, and check out. Your campaign goes live within 30 minutes of creative approval."
    },
    {
      question: "Can gym owners earn from their screens?",
      answer: "Yes. Gym and fitness studio owners can list their screens on Beyond Walls for free and earn passive income. Venues keep 100% of their screen rate and maintain full control over which categories of ads appear."
    }
  ];

  const benefits = [
    { icon: Clock, title: "45–90 Min Sessions", desc: "Full workout-length captive attention per viewer" },
    { icon: Heart, title: "Health-Focused Audience", desc: "Reach consumers who invest in wellness" },
    { icon: Target, title: "High Repetition", desc: "Ads repeat every 5 minutes for maximum recall" },
    { icon: Users, title: "Loyal Members", desc: "Same audience returns 3–5x per week" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Gym Screen Advertising Dubai | Fitness DOOH Ads | Beyond Walls"
        description="Put your brand on gym and fitness studio screens across Dubai. Reach health-focused audiences during full workout sessions. Book in minutes with Beyond Walls."
        keywords="gym advertising dubai, fitness screen advertising, gym DOOH dubai, gym tv advertising uae, fitness center digital signage, health advertising dubai"
        canonical="https://beyondwalls.ae/GymScreenAdvertisingDubai"
        structuredData={buildFAQSchema(faqs)}
      />
      <PublicNav />

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-white/20 text-white border-0 mb-4">
                <Dumbbell className="w-4 h-4 mr-1" /> Fitness DOOH Advertising
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Gym & Fitness Screen Advertising in Dubai
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Reach health-conscious consumers during their full workout. With sessions lasting 45–90 minutes and ads
                cycling every 5 minutes, gym screens deliver the deepest audience engagement of any DOOH format.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to={createPageUrl("Register")}>
                  <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100 h-14 px-8">
                    Start Advertising
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to={createPageUrl("ScreenLocations")}>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 h-14 px-8">
                    Browse Gym Screens
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop"
                alt="Digital screen inside a modern Dubai gym"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><p className="text-4xl font-bold text-emerald-400">Now</p><p className="text-slate-400">Onboarding gyms</p></div>
          <div><p className="text-4xl font-bold text-emerald-400">90 min</p><p className="text-slate-400">Avg. Session Length</p></div>
          <div><p className="text-4xl font-bold text-emerald-400">4x/week</p><p className="text-slate-400">Member Return Rate</p></div>
          <div><p className="text-4xl font-bold text-emerald-400">18x</p><p className="text-slate-400">Ad Views Per Session</p></div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Gym Screens Outperform</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Gyms offer the longest captive audience of any DOOH venue type in Dubai
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <b.icon className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{b.title}</h3>
                  <p className="text-sm text-slate-600">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Body Content */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto prose prose-lg prose-slate">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Captive Attention for the Full Workout</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            When someone steps onto a treadmill or settles into a bench, they're there for the long haul. The average
            gym session in Dubai lasts between 45 and 90 minutes — and during that entire time, your ad is playing on
            screens positioned directly in their line of sight. Unlike a billboard that flashes by in two seconds, gym
            screens give you sustained, repeated exposure to an audience that is physically stationary and mentally
            engaged.
          </p>
          <p className="text-slate-600 mb-6 leading-relaxed">
            With ads cycling every five minutes, a single gym-goer may see your message up to 18 times in one session.
            That level of repetition is what builds real brand awareness — not a one-time glance, but consistent
            reinforcement over weeks of regular gym visits. And because gym members typically return three to five
            times per week, your ad reaches the same highly engaged audience repeatedly, compounding its effect.
          </p>

          <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-12">Audience Demographics That Convert</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            The gym audience in Dubai is one of the most desirable demographics available to advertisers. These are
            health-conscious individuals, primarily aged 18 to 45, with above-average disposable income and a
            demonstrated willingness to invest in themselves. They're professionals, entrepreneurs, and expats who
            take their fitness seriously — and they apply that same intentionality to their purchasing decisions.
          </p>
          <p className="text-slate-600 mb-6 leading-relaxed">
            This makes gym screen advertising particularly effective for brands in the supplement, wellness, fitness
            apparel, healthy food delivery, health insurance, and lifestyle categories. If your product or service
            aligns with an active, health-conscious lifestyle, there is no better place to reach your target audience
            than on the screens they stare at during every workout.
          </p>

          <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-12">Perfect for Supplement, Wellness & Lifestyle Brands</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            The contextual relevance of gym advertising cannot be overstated. When a protein brand plays on a screen
            next to the weight rack, or a meal-prep service appears during a cardio session, the message lands at the
            exact moment the viewer is most receptive to it. This is the power of contextual DOOH — your ad isn't just
            seen, it's seen in the right frame of mind.
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {[
              "Protein supplements and nutrition brands",
              "Healthy meal delivery and meal-prep services",
              "Fitness apparel and activewear",
              "Health insurance and medical services",
              "Recovery tools: massage, physiotherapy, cryotherapy",
              "Wellness apps and fitness trackers",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-slate-700">{item}</span>
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-12">How to Launch Your Gym Campaign</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Getting started takes less than five minutes. Create your free Beyond Walls account, browse the available
            gym screens across Dubai's top fitness centres, and select the locations that match your target audience.
            Upload your image or video creative, choose your campaign dates, and check out. Your ad goes live within 30
            minutes of approval — no production crews, no physical installation, no waiting.
          </p>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Prices start at just AED 99 per week per screen, with no minimum spend or long-term contract. You can run
            a campaign for a single week to test the waters, or book multiple screens across Dubai for maximum reach.
            <Link to={createPageUrl("Home")} className="text-emerald-600 hover:underline font-semibold"> Learn more about Beyond Walls</Link> or
            <Link to={createPageUrl("Register")} className="text-emerald-600 hover:underline font-semibold"> create your free account</Link> to get started today.
          </p>
        </div>
      </section>

      <FAQSection faqs={faqs} subtitle="Everything you need to know about gym screen advertising in Dubai" />

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Reach Dubai's Fitness Community?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Launch your gym DOOH campaign today — from AED 99/week, no contracts
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-slate-100 h-14 px-8">
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}