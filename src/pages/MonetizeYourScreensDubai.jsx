import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, DollarSign, MonitorPlay, Shield, Wifi, CheckCircle2, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";
import FAQSection, { buildFAQSchema } from "@/components/marketing/FAQSection";

export default function MonetizeYourScreensDubai() {
  const faqs = [
    {
      question: "How much can I earn from my screen?",
      answer: "Earnings depend on your screen size, venue location, and daily footfall, but venue owners on Beyond Walls typically earn AED 2,000–4,000+ per screen per month. Screens in high-traffic areas like Dubai Marina or Downtown Dubai can earn significantly more. If you have multiple screens, those earnings multiply. All revenue is tracked in real time and paid out weekly to your bank account."
    },
    {
      question: "Does it cost anything to list?",
      answer: "No. Listing your screens on Beyond Walls is completely free. There are no setup fees, no monthly charges, and no hidden costs. You only earn — we make our revenue from a service fee charged to advertisers on top of your screen rate. You keep 100% of every booking, the highest revenue share in the UAE DOOH industry."
    },
    {
      question: "Do I control what plays?",
      answer: "Yes. Venue owners have full control over which ad categories are allowed on their screens. You can set category preferences — for example, a family restaurant might exclude alcohol or gambling ads — and you can approve or reject individual campaigns before they go live. Your screens are your space, and nothing plays without your say-so."
    },
    {
      question: "What venues qualify?",
      answer: "Any venue with a digital screen that customers can see can participate. This includes cafés, restaurants, gyms, co-working spaces, clinics, salons, hotels, and retail stores. If you have a TV or digital display mounted in a customer-visible area, you can earn from it — regardless of venue size or type."
    },
    {
      question: "How do I sign up?",
      answer: "Create a free venue owner account on Beyond Walls in under two minutes, add your screen details (size, location, venue type), set your preferred ad categories, and your screens go live on the marketplace for advertisers to discover. You approve campaigns as they come in, and earnings are paid weekly. Get started at our registration page — it costs nothing to join."
    }
  ];

  const benefits = [
    { icon: DollarSign, title: "100% of Your Rate", desc: "The highest payout in the DOOH industry" },
    { icon: Shield, title: "Full Content Control", desc: "Approve every ad before it appears" },
    { icon: Wifi, title: "Zero Upfront Cost", desc: "Free to join, no equipment needed" },
    { icon: Wallet, title: "Weekly Payouts", desc: "Get paid every week, directly to your bank" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Monetize Venue Screens Dubai | Earn From Idle TVs | Beyond Walls"
        description="Own a café, gym, salon or clinic in Dubai? Earn passive income from your idle screens. List them free on Beyond Walls and get matched with advertisers."
        keywords="monetize screens dubai, earn from venue tv, passive income screens, venue screen revenue, list your screen dubai, earn from digital signage, tv advertising revenue uae"
        canonical="https://www.beyondwalls.ae/MonetizeYourScreensDubai"
        structuredData={buildFAQSchema(faqs)}
      />
      <PublicNav />

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-white/20 text-white border-0 mb-4">
                <Wallet className="w-4 h-4 mr-1" /> For Venue Owners
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Turn Your Venue Screens Into Passive Income
              </h1>
              <p className="text-xl text-white/80 mb-8">
                If you own a café, gym, salon, clinic, or retail space in Dubai, your idle screens are leaving money on
                the table. List them on Beyond Walls for free and start earning from advertisers who want to reach your
                customers — with zero upfront cost and full control over what appears.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to={createPageUrl("Register")}>
                  <Button size="lg" className="bg-white text-violet-600 hover:bg-slate-100 h-14 px-8">
                    List Your Screens Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to={createPageUrl("Home")}>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 h-14 px-8">
                    Learn How It Works
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop"
                alt="Venue owner earning passive income from digital screens"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><p className="text-4xl font-bold text-violet-400">100%</p><p className="text-slate-400">Revenue Share</p></div>
          <div><p className="text-4xl font-bold text-violet-400">AED 4K+</p><p className="text-slate-400">Monthly Potential</p></div>
          <div><p className="text-4xl font-bold text-violet-400">AED 0</p><p className="text-slate-400">Upfront Cost</p></div>
          <div><p className="text-4xl font-bold text-violet-400">Weekly</p><p className="text-slate-400">Payouts</p></div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Venues Choose Beyond Walls</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              The most generous, transparent, and flexible screen monetization platform in the UAE
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
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Your Screens Are Already Earning — Just Not For You</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            If you run a café, gym, salon, clinic, or retail space in Dubai, chances are you have at least one digital
            screen on the wall right now. It might be showing a menu, a welcome message, or just sitting idle between
            uses. That screen is in front of your customers for hours every day — and right now, it's not generating a
            single dirham in revenue. Beyond Walls changes that. By listing your screens on our platform, you connect
            them to a marketplace of advertisers who are actively looking to reach audiences in venues exactly like
            yours. You keep 100% of every booking. We handle the rest.
          </p>

          <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-12">How Venues Earn: Zero Upfront Cost</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            The model is simple: you provide the screen and the audience, advertisers provide the content and the
            budget, and Beyond Walls handles the matching, booking, payment, and scheduling. There is no cost to join,
            no monthly subscription, and no equipment to buy. If you already have a TV or digital display — whether it's
            a 43-inch smart TV in a café or a 65-inch screen in a gym — you can start earning immediately.
          </p>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Advertisers browse available screens on the Beyond Walls platform, select the ones that match their target
            audience, and book them by the week. When a booking is made on your screen, you receive 100% of your screen rate.
            Advertisers pay a service fee on top, which covers platform operations, payment processing, and advertiser support. This is the
            highest revenue share offered by any DOOH platform in the UAE — most traditional networks keep 50% or more.
          </p>

          <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-12">You Stay in Full Control</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            One of the biggest concerns venue owners have is simple: "Will I lose control of what appears on my
            screens?" The answer is no. Beyond Walls gives you complete control over which ads are allowed in your
            venue. You can set category preferences — for example, a family restaurant might exclude alcohol or
            gambling ads — and you can review and approve individual campaigns before they go live. Your screens are
            your space, and nothing plays without your say-so.
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {[
              "Set allowed and blocked ad categories",
              "Review and approve each campaign before launch",
              "Reserve slots for your own promotions",
              "Pause advertising anytime, no penalties",
              "Keep 3 dedicated slots for your own content",
              "Full transparency on earnings and bookings",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-violet-500 flex-shrink-0" />
                <span className="text-slate-700">{item}</span>
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-12">Realistic Earning Drivers: Footfall, Dwell Time, and Location</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Three factors drive how much your screens can earn: footfall, dwell time, and location. Footfall is the
            number of people who walk through your doors each day — a busy mall kiosk sees more viewers than a quiet
            side-street salon. Dwell time is how long those people stay: a gym member on a 90-minute session sees your
            screen far more often than a customer grabbing a coffee to go. And location matters because advertisers pay
            a premium to reach specific Dubai neighbourhoods — a screen in Dubai Marina, DIFC, or Downtown Dubai
            commands higher rates than one in a less central area.
          </p>
          <p className="text-slate-600 mb-6 leading-relaxed">
            On average, venue owners on Beyond Walls earn between AED 2,000 and AED 4,000 per screen per month, with
            high-traffic venues in prime locations earning significantly more. A 55-inch screen in a busy Dubai Marina
            café will earn more than the same screen in a quieter neighbourhood café — but both will earn. If you have
            multiple screens, those earnings multiply.
          </p>
          <p className="text-slate-600 mb-6 leading-relaxed">
            All earnings are tracked in real time through your venue owner dashboard. You can see exactly which ads are
            running, how many impressions they've generated, and how much revenue you've earned — all updated live.
            Payouts are processed weekly, directly to your bank account, with full transaction records for your
            accounting.
          </p>

          <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-12">What Venue Types Qualify?</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            If your venue has a digital screen that customers can see, it qualifies. Beyond Walls works with a wide
            range of venue types across Dubai and the wider UAE:
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mb-8 not-prose">
            {[
              { name: "Cafés", desc: "Coffee shops with dwell times of 20–45 minutes per visit" },
              { name: "Gyms & Fitness", desc: "Members who stay for 60–90 minute sessions, multiple times per week" },
              { name: "Salons", desc: "Clients seated for 30–120 minutes with repeated exposure" },
              { name: "Clinics", desc: "Waiting areas with captive audiences and extended dwell times" },
              { name: "Restaurants", desc: "Diners seated for 45–90 minutes in a relaxed environment" },
              { name: "Co-Working Spaces", desc: "Professionals and freelancers present for full working days" },
            ].map((v, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-200">
                <CheckCircle2 className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{v.name}</h4>
                  <p className="text-sm text-slate-600">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Hotels, retail stores, and other customer-facing venues are welcome too. If you're unsure whether your
            venue qualifies, the simplest test is this: do customers spend time in front of a screen? If yes, you can
            earn from it. Explore the full <Link to={createPageUrl("DOOHAdvertisingMarketplaceDubai")} className="text-violet-600 hover:underline font-semibold">DOOH advertising marketplace</Link> to see
            the range of venues already listed.
          </p>

          <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-12">Step-by-Step: How to List a Screen</h2>
          <div className="space-y-6 mb-8">
            {[
              { step: "1", title: "Create Your Free Account", desc: "Sign up as a venue owner on Beyond Walls — it takes under two minutes and costs nothing." },
              { step: "2", title: "List Your Screens", desc: "Add your screen details — size, location, venue type — and set your preferred ad categories." },
              { step: "3", title: "Start Earning", desc: "Advertisers discover and book your screens. You approve campaigns, ads go live, and earnings are paid weekly." },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-slate-600 mb-6 leading-relaxed">
            Whether you have one screen or twenty, Beyond Walls makes it effortless to turn idle displays into a
            reliable stream of passive income. <Link to={createPageUrl("Home")} className="text-violet-600 hover:underline font-semibold">Learn more about our platform</Link> or
            <Link to={createPageUrl("Register")} className="text-violet-600 hover:underline font-semibold"> list your screens today</Link> — it's free, it takes two minutes, and you could be earning by next week.
          </p>
        </div>
      </section>

      <FAQSection faqs={faqs} subtitle="Everything venue owners need to know about earning with Beyond Walls" />

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-violet-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Your Screens Are Ready to Earn. Are You?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join Dubai's leading DOOH marketplace — free to join, keep 100% of your rate, weekly payouts
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-violet-600 hover:bg-slate-100 h-14 px-8">
              List Your Screens Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}