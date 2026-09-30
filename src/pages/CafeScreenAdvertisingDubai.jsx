import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Clock, Target, BarChart3, Coffee, MapPin, CheckCircle2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import SEOHead from "@/components/SEOHead";
import FAQSection, { buildFAQSchema } from "@/components/marketing/FAQSection";

export default function CafeScreenAdvertisingDubai() {
  const faqs = [
    {
      question: "How much does café screen advertising cost in Dubai?",
      answer: "Café screen advertising on Beyond Walls starts from AED 99 per week per screen. There are no minimum spends, no long-term contracts, and no setup fees — you only pay for the screens and weeks you book."
    },
    {
      question: "How quickly can my café campaign go live?",
      answer: "Once you upload your creative and complete checkout, your ad typically goes live within 30 minutes. There is no need to wait for production crews or physical installation — everything is managed digitally through our self-serve platform."
    },
    {
      question: "What audience does café DOOH advertising reach?",
      answer: "Café screens reach a mix of professionals, students, and residents who typically spend 20–45 minutes per visit. The audience skews toward 18–35 year olds with disposable income, making it ideal for lifestyle, food, tech, and entertainment brands."
    },
    {
      question: "How do I book café screen advertising?",
      answer: "Create a free Beyond Walls account, browse the café screens available in your target Dubai neighbourhoods, select the ones you want, upload your image or video creative, choose your dates, and check out. The entire process takes under five minutes."
    },
    {
      question: "Can café owners earn from their screens?",
      answer: "Yes. If you own or operate a café in Dubai, you can list your screens on Beyond Walls for free and earn passive income. Venue owners keep 100% of their screen rate and maintain full control over which ads appear."
    }
  ];

  const benefits = [
    { icon: Clock, title: "20–45 Min Dwell Time", desc: "Customers sit with your ad in view for the full duration of their visit" },
    { icon: Target, title: "Hyper-Local Targeting", desc: "Reach specific Dubai neighbourhoods like Marina, JBR, or DIFC" },
    { icon: BarChart3, title: "Real-Time Analytics", desc: "Track impressions and performance as they happen" },
    { icon: DollarSign, title: "From AED 99/Week", desc: "Affordable for small brands and local businesses" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Café Screen Advertising Dubai | Reach Customers In-Venue | Beyond Walls"
        description="Advertise on digital screens inside Dubai cafés. High dwell time, targeted local audiences, self-serve booking. Launch a café DOOH campaign with Beyond Walls."
        keywords="cafe advertising dubai, coffee shop screen advertising, cafe DOOH dubai, restaurant digital signage advertising, cafe tv advertising uae"
        canonical="https://beyondwalls.ae/CafeScreenAdvertisingDubai"
        structuredData={buildFAQSchema(faqs)}
      />
      <PublicNav />

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-amber-600 via-orange-600 to-rose-600 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-white/20 text-white border-0 mb-4">
                <Coffee className="w-4 h-4 mr-1" /> Café DOOH Advertising
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Café Screen Advertising in Dubai
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Reach customers during their daily coffee ritual. With 20–45 minutes of dwell time per visit,
                café screens deliver the kind of sustained attention that billboards simply cannot match.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to={createPageUrl("Register")}>
                  <Button size="lg" className="bg-white text-orange-600 hover:bg-slate-100 h-14 px-8">
                    Start Advertising
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to={createPageUrl("ScreenLocations")}>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 h-14 px-8">
                    Browse Café Screens
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=600&h=400&fit=crop"
                alt="Digital screen inside a modern Dubai café"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><p className="text-4xl font-bold text-amber-400">Now</p><p className="text-slate-400">Onboarding cafés</p></div>
          <div><p className="text-4xl font-bold text-amber-400">35 min</p><p className="text-slate-400">Avg. Dwell Time</p></div>
          <div><p className="text-4xl font-bold text-amber-400">144+</p><p className="text-slate-400">Plays Per Day</p></div>
          <div><p className="text-4xl font-bold text-amber-400">AED 99</p><p className="text-slate-400">Starting Price/Week</p></div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Advertise in Dubai Cafés?</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Cafés offer a unique advertising environment that combines captive attention with a relaxed, receptive mindset
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <b.icon className="w-7 h-7 text-amber-600" />
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
          <h2 className="text-3xl font-bold text-slate-900 mb-6">The Dwell-Time Advantage</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Traditional billboard advertising gives you a two-second glance from a passing car. Café screen advertising
            is fundamentally different. When a customer sits down with their latte, they stay for an average of 20 to 45
            minutes — and your ad plays on a loop every few minutes throughout their entire visit. That means a single
            viewer may see your message 8 to 10 times in one session, building the kind of brand repetition that drives
            recall and action.
          </p>
          <p className="text-slate-600 mb-6 leading-relaxed">
            This sustained exposure is why café DOOH consistently outperforms traditional out-of-home advertising on
            engagement metrics. People in cafés are relaxed, receptive, and actively looking around the room. Your ad
            isn't competing with traffic or speed — it's part of the ambient environment they're already enjoying.
          </p>

          <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-12">Hyper-Local Targeting for Every Neighbourhood</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Dubai's café culture is distinctly local. The audience in Dubai Marina is different from the one in DIFC,
            and both differ from the crowd in JBR or Al Quoz. Beyond Walls lets you choose exactly which cafés your ad
            appears in, so you can target by neighbourhood, venue type, and audience demographics. Whether you're a
            Marina-based fitness studio looking to reach nearby residents or a DIFC fintech startup targeting banking
            professionals, you can hand-pick the screens that match your audience.
          </p>
          <div className="flex flex-wrap gap-2 mb-8">
            {["Dubai Marina", "JBR", "DIFC", "Downtown Dubai", "Business Bay", "JLT", "Al Quoz", "Palm Jumeirah"].map((loc, i) => (
              <Badge key={i} variant="secondary" className="px-4 py-2 text-base">
                <MapPin className="w-4 h-4 mr-2" />{loc}
              </Badge>
            ))}
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-12">Ideal for Small Brands and Local Businesses</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            You don't need a massive marketing budget to advertise on café screens. Beyond Walls was built to make
            DOOH accessible to businesses of every size. With prices starting at just AED 99 per week per screen and no
            minimum spend or long-term contract, even a single-location restaurant or a solo entrepreneur can launch a
            professional advertising campaign. Pick one café near your business, run an ad for a week, and see the
            results — then scale up if it works.
          </p>
          <p className="text-slate-600 mb-6 leading-relaxed">
            This is a stark contrast to traditional outdoor advertising, which often requires minimum commitments of
            AED 10,000 or more and contracts lasting weeks or months. Beyond Walls puts the power of premium screen
            advertising in the hands of every business owner in Dubai.
          </p>

          <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-12">How Booking Works</h2>
          <p className="text-slate-600 mb-4 leading-relaxed">
            The process is designed to be as simple as possible:
          </p>
          <div className="space-y-3 mb-8">
            {[
              "Create a free Beyond Walls account in under two minutes",
              "Browse available café screens and filter by Dubai neighbourhood",
              "Select the screens and weeks that fit your budget",
              "Upload your image or video creative — our team reviews it within 30 minutes",
              "Your campaign goes live and you track performance in real time",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">{step}</span>
              </div>
            ))}
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-12">Transparent, Self-Serve Pricing</h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Every café screen on Beyond Walls displays its price upfront — per week, per screen. There are no hidden
            fees, no agency markups, and no negotiation required. You see exactly what you're paying and which screens
            you're getting before you check out. This transparency is core to our mission of democratizing access to
            premium advertising spaces across the UAE. Whether you're spending AED 99 or AED 9,900, the platform
            treats every advertiser the same.
          </p>
          <p className="text-slate-600 mb-6 leading-relaxed">
            Ready to reach customers where they're most receptive? <Link to={createPageUrl("Home")} className="text-amber-600 hover:underline font-semibold">Explore Beyond Walls</Link> to browse available café screens across Dubai,
            or <Link to={createPageUrl("Register")} className="text-amber-600 hover:underline font-semibold">create your free account</Link> to launch your campaign today.
          </p>
        </div>
      </section>

      <FAQSection faqs={faqs} subtitle="Everything you need to know about café screen advertising in Dubai" />

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-amber-600 to-orange-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Reach Customers in Dubai's Best Cafés?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Launch your café DOOH campaign in under 30 minutes — no contracts, no minimums
          </p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-orange-600 hover:bg-slate-100 h-14 px-8">
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