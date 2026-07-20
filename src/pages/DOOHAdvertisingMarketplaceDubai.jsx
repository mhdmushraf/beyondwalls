import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Store, Coffee, Dumbbell, Stethoscope, Building2, Hotel, ShoppingBag, CheckCircle2, Zap, DollarSign, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";
import FAQSection, { buildFAQSchema } from "@/components/marketing/FAQSection";

export default function DOOHAdvertisingMarketplaceDubai() {
  const faqs = [
    {
      question: "What is a DOOH advertising marketplace?",
      answer: "A DOOH (Digital Out-of-Home) advertising marketplace is an online platform where advertisers can browse, compare, and book digital screen advertising space across multiple venues in real time. Instead of calling individual media owners for quotes, advertisers use a self-serve interface to select screens, upload creatives, set dates, and launch campaigns instantly — much like booking a hotel room online."
    },
    {
      question: "How is Beyond Walls different from a media agency?",
      answer: "Traditional media agencies require briefs, negotiations, proposals, and minimum spends — a process that can take days or weeks. Beyond Walls replaces all of that with a transparent, self-serve platform. You see every screen's price upfront, book directly without middlemen, and go live in minutes. There are no agency markups, no minimum commitments, and no waiting for a sales rep to get back to you."
    },
    {
      question: "How much does it cost to advertise?",
      answer: "Screen advertising on Beyond Walls starts from AED 99 per week per screen. Pricing is fully transparent — each screen displays its weekly rate before you book. There are no setup fees, no hidden charges, and no minimum spend. You can run a campaign on a single screen for one week or scale across dozens of venues — the platform works for any budget."
    },
    {
      question: "Can venue owners list their screens?",
      answer: "Yes. If you own or operate a venue in the UAE with digital screens — whether it's a café, gym, clinic, co-working space, hotel, or retail store — you can list them on Beyond Walls for free. Venue owners keep 100% of their screen rate and maintain full control over which ads appear on their screens. It's a simple way to turn idle screens into passive income."
    },
    {
      question: "How fast can a campaign go live?",
      answer: "Once you upload your creative and complete checkout, your campaign typically goes live within 30 minutes. There's no need for production crews, physical installation, or printing. Everything is managed digitally — upload an image or video, pick your screens and dates, and your ad starts playing on the same day."
    }
  ];

  const screenTypes = [
    { icon: Coffee, name: "Cafés", desc: "High dwell-time audiences in relaxed, receptive environments" },
    { icon: Dumbbell, name: "Gyms & Fitness", desc: "Health-conscious audiences with repeated daily visits" },
    { icon: Stethoscope, name: "Clinics", desc: "Captive audiences in waiting areas with extended dwell times" },
    { icon: Building2, name: "Co-Working Spaces", desc: "Professionals, freelancers, and startup decision-makers" },
    { icon: Hotel, name: "Hotels", desc: "Affluent guests and business travellers in lobbies and lounges" },
    { icon: ShoppingBag, name: "Retail Stores", desc: "Shoppers in buying mindsets at the point of purchase" },
  ];

  const benefits = [
    { icon: Zap, title: "Self-Serve, Instant Booking", desc: "Browse screens, upload creative, and go live — no calls, no contracts" },
    { icon: DollarSign, title: "Transparent Pricing", desc: "Every screen's weekly rate is visible upfront — no markups or hidden fees" },
    { icon: MapPin, title: "Hyper-Local UAE Coverage", desc: "Target specific Dubai neighbourhoods and venue types with precision" },
    { icon: Store, title: "Two-Sided Marketplace", desc: "Venues list screens, advertisers book them — direct, no middlemen" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="DOOH Advertising Marketplace Dubai & UAE | Book Screens Direct | Beyond Walls"
        description="The UAE's first self-serve DOOH advertising marketplace. Compare venue screens, book instantly, and launch digital out-of-home campaigns across Dubai — no agencies, transparent pricing."
        keywords="dooh marketplace dubai, digital advertising marketplace uae, screen advertising marketplace, book screens direct dubai, self-serve dooh dubai, venue screen marketplace"
        canonical="https://beyondwalls.ae/DOOHAdvertisingMarketplaceDubai"
        structuredData={buildFAQSchema(faqs)}
      />
      <PublicNav />

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-violet-700 via-indigo-700 to-purple-800 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-white/20 text-white border-0 mb-4">
                <Store className="w-4 h-4 mr-1" /> DOOH Marketplace
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                The DOOH Advertising Marketplace for Dubai & the UAE
              </h1>
              <p className="text-xl text-white/80 mb-8">
                The UAE's first self-serve marketplace for digital out-of-home advertising.
                Browse venue screens, compare prices, and launch campaigns in minutes — no agencies,
                no minimum spends, no waiting.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to={createPageUrl("Register")}>
                  <Button size="lg" className="bg-white text-violet-700 hover:bg-slate-100 h-14 px-8">
                    Start Advertising
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to={createPageUrl("ScreenLocations")}>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 h-14 px-8">
                    Browse Screens
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop"
                alt="Digital advertising screens in a Dubai venue marketplace"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><p className="text-4xl font-bold text-violet-400">500+</p><p className="text-slate-400">Venue Screens</p></div>
          <div><p className="text-4xl font-bold text-violet-400">6</p><p className="text-slate-400">Venue Types</p></div>
          <div><p className="text-4xl font-bold text-violet-400">30 min</p><p className="text-slate-400">Avg. Go-Live Time</p></div>
          <div><p className="text-4xl font-bold text-violet-400">AED 99</p><p className="text-slate-400">Starting Price/Week</p></div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">A Marketplace, Not a Media Agency</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Beyond Walls connects advertisers and venue owners directly — the way modern marketplaces connect hosts and guests
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <b.icon className="w-7 h-7 text-violet-600" />
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
          <h2 className="text-3xl font-bold text-slate-900 mb-6">What Is a DOOH Advertising Marketplace?</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            A DOOH advertising marketplace is a digital platform that connects two sides of the out-of-home advertising
            ecosystem: venues with screens, and advertisers who want to reach audiences on those screens. Think of it as
            the Airbnb for digital advertising in Dubai. Venue owners — cafés, gyms, clinics, co-working spaces, hotels,
            and retail stores — list their idle screens on the platform. Advertisers browse those screens, compare prices
            and locations, and book the ones that match their target audience. No agency intermediaries, no negotiation,
            no long sales cycles.
          </p>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Beyond Walls operates as this two-sided marketplace for the UAE. Advertisers get a self-serve interface to
            discover and book screen inventory across Dubai and beyond. Venue owners get a passive revenue stream from
            screens that would otherwise sit idle. The platform handles the matchmaking, scheduling, playback, and
            reporting — so both sides can focus on what they do best.
          </p>

          <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-12">How It Differs from Traditional Media Buying</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            For decades, buying out-of-home advertising in the UAE meant calling a media agency or a billboard owner,
            requesting a quote, negotiating rates, signing a contract, and waiting days or weeks for a campaign to go
            live. Minimum spends often started in the tens of thousands of dirhams, and pricing was opaque — you never
            really knew if you were getting a fair rate.
          </p>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Beyond Walls replaces that entire model with a transparent, self-serve marketplace. Every screen displays its
            weekly price upfront. You can book a single screen for a single week starting at AED 99, or scale across
            dozens of venues — the choice is yours. There are no agency markups, no minimum commitments, and no waiting
            for a sales representative to call you back. The process takes minutes, not weeks, and you see exactly what
            you're paying for before you check out.
          </p>

          <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-12">The Airbnb for Digital Advertising in Dubai</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            The comparison to Airbnb is deliberate. Just as Airbnb turned spare bedrooms into bookable inventory and gave
            travellers a self-serve alternative to hotels, Beyond Walls turns idle venue screens into advertising
            inventory and gives brands a self-serve alternative to media agencies. Venue owners monetise screens they
            already own. Advertisers access premium, hyper-local screen space directly — without the friction of
            traditional media buying. It's a model that works because both sides benefit: venues earn passive income, and
            advertisers get transparent pricing and instant booking.
          </p>

          <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-12">Screen Types Available on the Marketplace</h2>
          <p className="text-slate-600 mb-4 leading-relaxed">
            Beyond Walls covers the full spectrum of indoor venue screens across the UAE. Each venue type offers a
            distinct audience and dwell-time profile:
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mb-8 not-prose">
            {screenTypes.map((s, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <s.icon className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{s.name}</h4>
                  <p className="text-sm text-slate-600">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-slate-600 mb-6 leading-relaxed">
            You can target a single venue type or mix and match — for example, running the same creative across cafés in
            Dubai Marina and gyms in Business Bay to build frequency across different parts of your audience's day.
            Explore our dedicated <Link to={createPageUrl("CafeScreenAdvertisingDubai")} className="text-violet-600 hover:underline font-semibold">café screen advertising</Link>,
            <Link to={createPageUrl("GymScreenAdvertisingDubai")} className="text-violet-600 hover:underline font-semibold"> gym screen advertising</Link>,
            <Link to={createPageUrl("CoworkingSpaceAdvertisingDubai")} className="text-violet-600 hover:underline font-semibold"> co-working space advertising</Link>,
            and <Link to={createPageUrl("ClinicScreenAdvertisingDubai")} className="text-violet-600 hover:underline font-semibold">clinic screen advertising</Link> pages for venue-specific details.
          </p>

          <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-12">How Booking Works, Step by Step</h2>
          <p className="text-slate-600 mb-4 leading-relaxed">
            The marketplace is designed to be as straightforward as booking a hotel room online:
          </p>
          <div className="space-y-3 mb-8">
            {[
              "Create a free Beyond Walls account in under two minutes",
              "Browse available screens and filter by venue type, neighbourhood, and price",
              "Select the screens and weeks that fit your budget and audience",
              "Upload your image or video creative — reviewed within 30 minutes",
              "Complete checkout and your campaign goes live automatically",
              "Track impressions and performance in real time from your dashboard",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">{step}</span>
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-12">Why a UAE-Focused Marketplace Matters</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            You might wonder why a local marketplace matters when global ad platforms exist. The answer is simple: DOOH
            is inherently local. A screen in a DIFC café serves a completely different audience than one in a JBR gym, and
            neither is comparable to a screen in London or Singapore. A UAE-focused marketplace like Beyond Walls
            understands the nuances of Dubai's neighbourhoods, venue types, audience demographics, and pricing dynamics.
            Every screen is physically verified, every venue is a real local business, and every campaign reaches people
            who live, work, or visit the UAE.
          </p>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Global generalist platforms, by contrast, often aggregate inventory without local context — they can't tell
            you whether a screen in "Dubai" is in a busy mall or an empty hallway. Beyond Walls is built in Dubai, for
            Dubai, with on-the-ground knowledge of the city's advertising landscape. That local focus means better
            targeting, fairer pricing, and campaigns that actually reach the people you're trying to influence.
          </p>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Ready to explore the marketplace? <Link to={createPageUrl("Home")} className="text-violet-600 hover:underline font-semibold">Return to the Beyond Walls home page</Link> to
            learn more, <Link to={createPageUrl("MonetizeYourScreensDubai")} className="text-violet-600 hover:underline font-semibold">discover how to monetise your venue screens</Link>,
            or <Link to={createPageUrl("Register")} className="text-violet-600 hover:underline font-semibold">create your free account</Link> to start browsing screens today.
          </p>
        </div>
      </section>

      <FAQSection faqs={faqs} subtitle="Everything you need to know about the Beyond Walls DOOH marketplace" />

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-violet-700 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Book Screens on the UAE's DOOH Marketplace?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Browse venue screens, compare prices, and launch your campaign today — no agencies, no minimums
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-violet-700 hover:bg-slate-100 h-14 px-8">
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