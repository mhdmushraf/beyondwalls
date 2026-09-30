import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Briefcase, Clock, Target, BarChart3, Users, TrendingUp, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";
import FAQSection, { buildFAQSchema } from "@/components/marketing/FAQSection";

export default function CoworkingSpaceAdvertisingDubai() {
  const faqs = [
    {
      question: "How much does co-working space screen advertising cost in Dubai?",
      answer: "Co-working space screen advertising on Beyond Walls starts from AED 99 per week per screen. There are no minimum spends, no contracts, and no setup fees — you only pay for the screens and weeks you book."
    },
    {
      question: "What audience does co-working DOOH advertising reach?",
      answer: "Co-working screens reach founders, freelancers, remote workers, and business professionals across Dubai. The audience skews toward decision-makers aged 25–45 with purchasing authority, making it ideal for B2B brands, SaaS products, and professional services."
    },
    {
      question: "How long do viewers see my ad in a co-working space?",
      answer: "Co-working members typically spend 4–8 hours per day in the space, with screens cycling ads every 5 minutes. This means your message receives sustained, repeated exposure throughout the full workday — far beyond any other DOOH format."
    },
    {
      question: "How do I book co-working screen advertising in Dubai?",
      answer: "Create a free Beyond Walls account, browse available co-working screens, select your preferred locations and dates, upload your creative, and check out. Your campaign goes live within 30 minutes of creative approval."
    },
    {
      question: "Can co-working space owners earn from their screens?",
      answer: "Yes. Co-working space operators can list their screens on Beyond Walls for free and earn passive income. Venues keep 100% of their screen rate and maintain full control over which ads appear on their screens."
    }
  ];

  const benefits = [
    { icon: Clock, title: "Full Workday Exposure", desc: "Members spend 4–8 hours daily in the space" },
    { icon: Target, title: "B2B Decision-Makers", desc: "Reach founders, executives and professionals" },
    { icon: TrendingUp, title: "High Income Audience", desc: "Professionals with real purchasing power" },
    { icon: Users, title: "Business District Reach", desc: "Screens in DIFC, Business Bay, JLT and more" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Co-Working Space Advertising Dubai | Office DOOH | Beyond Walls"
        description="Reach founders, freelancers and professionals on screens inside Dubai co-working spaces. Targeted B2B DOOH advertising, self-serve, via Beyond Walls."
        keywords="coworking advertising dubai, office screen advertising, coworking DOOH dubai, b2b advertising uae, business center digital signage, professional audience advertising"
        canonical="https://beyondwalls.ae/CoworkingSpaceAdvertisingDubai"
        structuredData={buildFAQSchema(faqs)}
      />
      <PublicNav />

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-white/20 text-white border-0 mb-4">
                <Briefcase className="w-4 h-4 mr-1" /> B2B DOOH Advertising
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Co-Working Space Screen Advertising in Dubai
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Reach founders, freelancers, and decision-makers where they work. Co-working screens deliver
                full-workday exposure to Dubai's most influential professional audience — perfect for B2B brands,
                SaaS products, and premium services.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to={createPageUrl("Register")}>
                  <Button size="lg" className="bg-white text-indigo-600 hover:bg-slate-100 h-14 px-8">
                    Start Advertising
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to={createPageUrl("ScreenLocations")}>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 h-14 px-8">
                    Browse Co-Working Screens
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop"
                alt="Digital screen inside a modern Dubai co-working space"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><p className="text-4xl font-bold text-indigo-400">Now</p><p className="text-slate-400">Onboarding co-working spaces</p></div>
          <div><p className="text-4xl font-bold text-indigo-400">6 hrs</p><p className="text-slate-400">Avg. Daily Dwell Time</p></div>
          <div><p className="text-4xl font-bold text-indigo-400">25–45</p><p className="text-slate-400">Professional Age Range</p></div>
          <div><p className="text-4xl font-bold text-indigo-400">AED 99</p><p className="text-slate-400">Starting Price/Week</p></div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Co-Working Screens Work for B2B</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              No other DOOH format gives you this much time with a professional audience
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <b.icon className="w-7 h-7 text-indigo-600" />
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
          <h2 className="text-3xl font-bold text-slate-900 mb-6">A B2B Audience You Can't Reach Anywhere Else</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Dubai's co-working spaces are home to the city's most dynamic professional community — startup founders,
            freelance consultants, remote teams, and digital nomads who choose flexible workspaces over traditional
            offices. These are decision-makers: people who choose their own tools, select their own service providers,
            and have direct purchasing authority. When you advertise on co-working screens, you're not reaching a
            passive consumer audience — you're reaching the people who sign the checks.
          </p>
          <p className="text-slate-600 mb-6 leading-relaxed">
            The audience skews toward professionals aged 25 to 45 with above-average income and a strong orientation
            toward technology, innovation, and entrepreneurship. They're early adopters who actively seek out new
            products and services that can make their work lives more efficient, productive, or enjoyable.
          </p>

          <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-12">Full Workday Exposure, Not a Glance</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            The defining advantage of co-working screen advertising is time. Unlike a billboard that gives you two
            seconds of a driver's attention, co-working members spend an average of six to eight hours per day in the
            space. Your ad cycles every five minutes on screens positioned in lounges, kitchen areas, and hot-desk
            zones — the places where professionals naturally look up from their laptops throughout the day.
          </p>
          <p className="text-slate-600 mb-6 leading-relaxed">
            This means a single member might see your ad 70 or more times in a single workday. Over a week-long
            campaign, that's hundreds of impressions to the same highly targeted professional audience. No other DOOH
            format in Dubai offers this level of sustained, repeated exposure to a B2B demographic.
          </p>

          <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-12">Ideal for SaaS, Services & Premium Brands</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Co-working screens are the perfect medium for brands that sell to businesses and professionals. If you're
            marketing a SaaS platform, a professional service, a financial product, or a premium lifestyle brand, this
            is where your ideal customers spend their working hours.
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {[
              "SaaS platforms and productivity tools",
              "Accounting, legal and consulting services",
              "Business banking and fintech products",
              "Cloud infrastructure and dev tools",
              "Premium co-living and real estate",
              "Professional networking and events",
              "Health insurance and corporate wellness",
              "Recruitment and HR platforms",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <span className="text-slate-700">{item}</span>
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-12">Business District Reach Across Dubai</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Beyond Walls gives you access to co-working screens in Dubai's major business districts, including DIFC,
            Business Bay, JLT, Dubai Internet City, and Downtown Dubai. Each district has its own professional
            ecosystem — DIFC draws finance and banking professionals, while Dubai Internet City attracts tech and
            media companies. You can select specific locations to match your target industry, ensuring your message
            reaches the right professional community.
          </p>

          <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-12">Launch in Minutes, Not Weeks</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Traditional B2B advertising involves lengthy negotiations, media buys, and production timelines. Beyond
            Walls eliminates all of that. Create a free account, pick your screens, upload your creative, and check
            out — your campaign goes live within 30 minutes. At AED 99 per week per screen with no contracts, you can
            test different co-working spaces and creative messages affordably, then scale what works.
            <Link to={createPageUrl("Home")} className="text-indigo-600 hover:underline font-semibold"> Explore Beyond Walls</Link> or
            <Link to={createPageUrl("Register")} className="text-indigo-600 hover:underline font-semibold"> get started today</Link>.
          </p>
        </div>
      </section>

      <FAQSection faqs={faqs} subtitle="Everything you need to know about co-working screen advertising in Dubai" />

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-indigo-600 to-violet-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Reach Dubai's Professional Elite?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Launch your B2B DOOH campaign today — from AED 99/week, no contracts
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-slate-100 h-14 px-8">
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