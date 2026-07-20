import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Stethoscope, Clock, Target, Shield, Heart, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";
import FAQSection, { buildFAQSchema } from "@/components/marketing/FAQSection";

export default function ClinicScreenAdvertisingDubai() {
  const faqs = [
    {
      question: "How much does clinic screen advertising cost in Dubai?",
      answer: "Clinic and waiting room screen advertising on Beyond Walls starts from AED 99 per week per screen. There are no minimum spends, no contracts, and no setup fees — you only pay for the screens and weeks you book."
    },
    {
      question: "How long do patients see my ad in a clinic waiting room?",
      answer: "The average clinic wait time in Dubai is 15–45 minutes, giving your ad sustained, repeated exposure to a captive audience. With ads cycling every 5 minutes, a single patient may see your message 3–9 times during their visit."
    },
    {
      question: "What audience does clinic DOOH advertising reach?",
      answer: "Clinic screens reach a broad cross-section of Dubai residents — patients and their families who span all age groups and nationalities. The audience is in a health-focused mindset, making it ideal for healthcare, pharma, wellness, and insurance brands."
    },
    {
      question: "Is clinic screen advertising appropriate for healthcare brands?",
      answer: "Yes. Clinic waiting rooms are a trust environment where health-related messaging is contextually relevant and well-received. Pharmacies, insurance providers, wellness brands, and health-tech products are particularly effective in this venue type."
    },
    {
      question: "Can clinic owners earn from their waiting room screens?",
      answer: "Yes. Clinic and healthcare facility owners can list their waiting room screens on Beyond Walls for free and earn passive income. Venues keep 100% of their screen rate and maintain full control over which ad categories appear."
    }
  ];

  const benefits = [
    { icon: Clock, title: "15–45 Min Wait Time", desc: "The longest captive dwell time of any DOOH format" },
    { icon: Heart, title: "Health-Focused Mindset", desc: "Viewers are already thinking about wellbeing" },
    { icon: Shield, title: "Trust Environment", desc: "Clinics are credible, authoritative spaces" },
    { icon: Target, title: "Broad Demographic", desc: "Reach all age groups and nationalities" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Clinic Waiting Room Advertising Dubai | Healthcare DOOH | Beyond Walls"
        description="Advertise on clinic and waiting-room screens in Dubai — 15–45 minutes of captive attention per viewer. Book healthcare-adjacent DOOH with Beyond Walls."
        keywords="clinic advertising dubai, waiting room screen advertising, healthcare DOOH dubai, medical center digital signage, pharmacy advertising uae, health screen advertising"
        canonical="https://www.beyondwalls.ae/ClinicScreenAdvertisingDubai"
        structuredData={buildFAQSchema(faqs)}
      />
      <PublicNav />

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-sky-600 via-cyan-600 to-blue-700 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-white/20 text-white border-0 mb-4">
                <Stethoscope className="w-4 h-4 mr-1" /> Healthcare DOOH
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Clinic & Waiting Room Screen Advertising in Dubai
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Reach patients during the longest captive dwell time of any advertising format. With 15–45 minutes of
                waiting per visit, clinic screens deliver unmatched sustained attention in a trusted, health-focused
                environment.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to={createPageUrl("Register")}>
                  <Button size="lg" className="bg-white text-sky-600 hover:bg-slate-100 h-14 px-8">
                    Start Advertising
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to={createPageUrl("ScreenLocations")}>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 h-14 px-8">
                    Browse Clinic Screens
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&h=400&fit=crop"
                alt="Digital screen in a modern Dubai clinic waiting room"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><p className="text-4xl font-bold text-sky-400">20+</p><p className="text-slate-400">Clinic Screens</p></div>
          <div><p className="text-4xl font-bold text-sky-400">45 min</p><p className="text-slate-400">Avg. Wait Time</p></div>
          <div><p className="text-4xl font-bold text-sky-400">9x</p><p className="text-slate-400">Ad Views Per Visit</p></div>
          <div><p className="text-4xl font-bold text-sky-400">AED 99</p><p className="text-slate-400">Starting Price/Week</p></div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">The Longest Dwell Time in DOOH</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              No other advertising venue gives you this much uninterrupted time with a captive, receptive audience
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-sky-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <b.icon className="w-7 h-7 text-sky-600" />
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
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Unmatched Captive Attention</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Of every digital out-of-home advertising format available in Dubai, clinic waiting rooms offer the single
            longest captive dwell time per viewer. Patients typically wait 15 to 45 minutes before their appointment —
            and during that entire time, they are seated, stationary, and looking for something to occupy their
            attention. There is no scrolling past, no skipping, and no driving by. Your ad plays on a loop every five
            minutes, meaning a single patient may see your message three to nine times before they're even called in.
          </p>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Compare this to a roadside billboard, which gives you roughly two seconds of a driver's divided attention.
            The difference isn't just incremental — it's orders of magnitude. Clinic waiting room advertising delivers
            the kind of sustained, repeated exposure that builds genuine brand awareness and drives real action,
            whether that's a website visit, an app download, or a purchase decision.
          </p>

          <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-12">A Trust Environment That Enhances Your Message</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Clinics are inherently credible spaces. When someone is sitting in a medical waiting room, they are in a
            mindset focused on health, wellbeing, and trusted information. This contextual environment lends
            authority to the advertising that appears on clinic screens — particularly for healthcare, pharmaceutical,
            wellness, and insurance brands. Your message isn't just seen; it's seen in a setting that reinforces trust
            and credibility.
          </p>
          <p className="text-slate-600 mb-6 leading-relaxed">
            This is especially valuable for brands in regulated industries where consumer trust is paramount. A health
            insurance ad playing in a clinic waiting room carries more weight than the same ad on a random billboard,
            because the context signals relevance and authority. Patients are already thinking about their health —
            your message meets them exactly where they are.
          </p>

          <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-12">Perfect for Healthcare, Pharma & Wellness</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Clinic screen advertising is the most contextually relevant DOOH format available for health-adjacent
            brands. Whether you're promoting a pharmacy delivery app, a health insurance plan, a wellness supplement,
            or a specialist medical service, the clinic waiting room is the single environment where your target
            audience is most receptive to your message.
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {[
              "Pharmacies and medication delivery apps",
              "Health and medical insurance providers",
              "Wellness supplements and vitamins",
              "Specialist clinics and medical services",
              "Mental health and therapy platforms",
              "Fitness and rehabilitation centres",
              "Health-tech and telemedicine apps",
              "Nutrition and healthy food brands",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-sky-500 flex-shrink-0" />
                <span className="text-slate-700">{item}</span>
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-12">Broad Demographic Reach</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Unlike gyms or co-working spaces, which cater to specific demographics, clinics serve the entire community.
            Patients span every age group, nationality, and income level in Dubai — from young parents bringing their
            children for checkups to elderly residents managing chronic conditions. This makes clinic screen
            advertising an excellent choice for brands with broad appeal, or as a complement to more targeted DOOH
            campaigns in other venue types.
          </p>

          <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-12">Book Your Clinic Campaign Today</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Launching a clinic screen advertising campaign on Beyond Walls takes less than five minutes. Create your
            free account, browse available clinic screens across Dubai, select your locations and dates, upload your
            creative, and check out. Your ad goes live within 30 minutes of approval — no production crews, no
            installation delays, no contracts. Starting at just AED 99 per week per screen, it's one of the most
            cost-effective ways to reach a captive, health-focused audience in Dubai.
            <Link to={createPageUrl("Home")} className="text-sky-600 hover:underline font-semibold"> Learn more about Beyond Walls</Link> or
            <Link to={createPageUrl("Register")} className="text-sky-600 hover:underline font-semibold"> create your free account</Link> today.
          </p>
        </div>
      </section>

      <FAQSection faqs={faqs} subtitle="Everything you need to know about clinic screen advertising in Dubai" />

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-sky-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Reach Patients in Dubai's Clinics?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Launch your healthcare DOOH campaign today — from AED 99/week, no contracts
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-sky-600 hover:bg-slate-100 h-14 px-8">
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