import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import SEOHead from "@/components/SEOHead";
import PublicNav from "@/components/PublicNav";
import PublicFooter from "@/components/PublicFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Megaphone,
  Building2,
  Briefcase,
  Users,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

const ACCOUNT_TYPES = [
  {
    key: "advertiser",
    label: "Advertiser",
    icon: Megaphone,
    forWho: "For brands, SMBs and anyone buying screen time.",
    youDo: "Browse screens, book slots by the week, upload creative, track campaigns.",
    youPay: "The screen's rate plus a 30% service fee. Nothing to join.",
    example: "A AED 100/week screen costs AED 130 for one week, all in.",
    accent: "#6366F1",
  },
  {
    key: "venue",
    label: "Venue Owner",
    icon: Building2,
    forWho: "For cafés, gyms, clinics, salons, retail with screens already installed.",
    youDo: "List your screens, set your own weekly rate, approve every ad before it runs, get paid.",
    youPay: "Nothing. You keep 100% of your rate — the fee is charged to the advertiser, not deducted from you.",
    example: "Set AED 100/week, receive AED 100/week.",
    accent: "#10B981",
  },
  {
    key: "enterprise",
    label: "Enterprise",
    icon: Briefcase,
    forWho: "For operators running their own screen network across many sites.",
    youDo: "Bulk-onboard screens, group them by site, run your own campaigns, optionally list spare inventory on the marketplace.",
    youPay: "A monthly software fee. No commission on anything you sell yourself.",
    example: "Contact us for pricing.",
    accent: "#3B82F6",
  },
  {
    key: "agency",
    label: "Agency",
    icon: Users,
    forWho: "For media agencies buying on behalf of clients.",
    youDo: "Manage multiple clients in one workspace, book across clients, report per client.",
    youPay: "Nothing to join. Same rates as advertisers.",
    example: "Same advertiser rates, multi-client workspace.",
    accent: "#F59E0B",
  },
];

const COMPARISON_ROWS = [
  { type: "Advertiser", join: "Free", pay: "Screen rate + 30% fee", earn: "Campaign results", bestFor: "Brands & SMBs", accent: "#6366F1" },
  { type: "Venue Owner", join: "Free", pay: "Nothing", earn: "100% of your rate", bestFor: "Cafés, gyms, clinics", accent: "#10B981" },
  { type: "Enterprise", join: "Contact us", pay: "Monthly software fee", earn: "No commission on self-sold", bestFor: "Multi-site operators", accent: "#3B82F6" },
  { type: "Agency", join: "Free", pay: "Same as advertiser", earn: "Your client margin", bestFor: "Media agencies", accent: "#F59E0B" },
];

const FAQS = [
  {
    question: "Can I change account type later?",
    answer: "Yes. You can switch your account type at any time from your workspace settings. Your existing campaigns, screens, and earnings carry over.",
  },
  {
    question: "Do I need to buy hardware?",
    answer: "No. Beyond Walls runs on any smart TV or digital display with a web browser — Android TV, LG WebOS, Samsung Tizen, or a simple media player. If you already have a screen, you're ready to go.",
  },
  {
    question: "Who decides what runs on my screen?",
    answer: "You do. Every ad campaign is sent to you for approval before it goes live. You can block entire categories and reject individual campaigns — no questions asked.",
  },
  {
    question: "When do I get paid?",
    answer: "Venue earnings are tracked in real time and become available after a campaign runs. You request a payout from your venue dashboard and funds are transferred to your UAE bank account.",
  },
  {
    question: "Is there a minimum spend?",
    answer: "No. Advertisers can book a single screen for a single week. Venue owners can list a single screen. There is no minimum spend or minimum number of screens.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

function FAQItem({ faq, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card
      className="bg-white overflow-hidden"
      style={{
        borderRadius: "16px",
        border: "1px solid #E2E8F0",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 1px 2px rgba(15,23,42,.04), 0 8px 24px -12px rgba(15,23,42,.10)",
      }}
    >
      <CardContent className="p-5">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="font-semibold text-slate-900">{faq.question}</h3>
          <ChevronDown
            className={`w-5 h-5 text-slate-400 flex-shrink-0 ml-2 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open && (
          <p className="text-slate-600 text-sm leading-relaxed mt-3">{faq.answer}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Plans() {
  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Plans & Account Types | Beyond Walls — Advertiser, Venue, Enterprise, Agency"
        description="Compare the four ways to use Beyond Walls: Advertiser, Venue Owner, Enterprise, and Agency. See how pricing works — venues keep 100% of their rate, advertisers pay a 30% service fee on top."
        keywords="beyond walls plans, account types, dooh pricing, advertiser rates, venue owner earnings, enterprise screen management, agency advertising platform"
        canonical="https://beyondwalls.ae/plans"
        structuredData={faqSchema}
      />
      <PublicNav />

      {/* Hero */}
      <section className="pt-28 pb-16 px-6 bg-gradient-to-br from-slate-900 via-violet-900 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-white/20 text-white border-0 mb-4">Account Types</Badge>
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Four ways to use Beyond Walls
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
            Pick the one that matches how you'll use the network — you can change it later.
          </p>
        </div>
      </section>

      {/* Four account type cards */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
          {ACCOUNT_TYPES.map((t) => (
            <Card
              key={t.key}
              className="bg-white overflow-hidden"
              style={{
                borderRadius: "16px",
                border: "1px solid #E2E8F0",
                borderTop: `3px solid ${t.accent}`,
                backgroundColor: "#FFFFFF",
                boxShadow: "0 1px 2px rgba(15,23,42,.04), 0 8px 24px -12px rgba(15,23,42,.10)",
              }}
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${t.accent}1A` }}
                  >
                    <t.icon className="w-6 h-6" style={{ color: t.accent }} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{t.label}</h3>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">Who it's for</p>
                  <p className="text-slate-600">{t.forWho}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">What you do</p>
                  <p className="text-slate-600">{t.youDo}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">What it costs</p>
                  <p className="text-slate-600">{t.youPay}</p>
                </div>
                <div
                  className="rounded-lg p-3"
                  style={{ backgroundColor: `${t.accent}0F` }}
                >
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">Example:</span> {t.example}
                  </p>
                </div>
                <Link to={createPageUrl("Register")} className="block">
                  <Button
                    className="w-full text-white hover:opacity-90"
                    style={{ backgroundColor: t.accent }}
                  >
                    Start as {t.label}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How the money works */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <Badge className="bg-violet-100 text-violet-700 border-0 mb-4">How the money works</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">One worked example, end to end</h2>
          </div>

          {/* Worked example — the signature dark block */}
          <Card
            className="overflow-hidden mb-8"
            style={{
              backgroundColor: "#0F172A",
              borderRadius: "16px",
              border: "none",
            }}
          >
            <CardContent className="p-6 md:p-8">
              <p className="mb-6 leading-relaxed" style={{ color: "#94A3B8" }}>
                An advertiser books <strong className="text-white">2 slots</strong> for{" "}
                <strong className="text-white">2 weeks</strong> on a screen priced at{" "}
                <strong className="text-white">AED 100/week</strong>.
              </p>

              {/* Derivation rows */}
              <div className="space-y-3 font-mono text-sm md:text-base mb-2">
                <div
                  className="flex justify-between items-center py-2"
                  style={{ borderBottom: "1px solid rgba(148,163,184,.2)" }}
                >
                  <span style={{ color: "#94A3B8" }}>Screen rate</span>
                  <span style={{ color: "#E2E8F0" }}>100 × 2 slots × 2 weeks</span>
                  <span className="font-semibold" style={{ color: "#E2E8F0" }}>AED 400</span>
                </div>
                <div
                  className="flex justify-between items-center py-2"
                  style={{ borderBottom: "1px solid rgba(148,163,184,.2)" }}
                >
                  <span style={{ color: "#94A3B8" }}>Service fee (30%)</span>
                  <span></span>
                  <span className="font-semibold" style={{ color: "#E2E8F0" }}>AED 120</span>
                </div>
              </div>

              {/* Split: advertiser pays on top, venue + platform below */}
              <div
                className="py-4"
                style={{ borderTop: "1px solid rgba(148,163,184,.25)", borderBottom: "1px solid rgba(148,163,184,.25)" }}
              >
                <div className="flex justify-between items-center pb-4">
                  <span className="text-base font-semibold text-white">Advertiser pays</span>
                  <span className="text-2xl font-bold text-white">AED 520</span>
                </div>
                <div style={{ borderTop: "1px solid rgba(148,163,184,.15)" }}>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div>
                      <p className="text-sm mb-1" style={{ color: "#94A3B8" }}>
                        Venue receives
                      </p>
                      <p className="text-xl font-bold" style={{ color: "#34D399" }}>
                        AED 400
                      </p>
                    </div>
                    <div>
                      <p className="text-sm mb-1" style={{ color: "#94A3B8" }}>
                        Beyond Walls
                      </p>
                      <p className="text-xl font-bold" style={{ color: "#A78BFA" }}>
                        AED 120
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
              <p className="text-slate-600">The venue is paid after the campaign runs.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
              <p className="text-slate-600">The venue approves every ad before it appears.</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-violet-600 flex-shrink-0 mt-0.5" />
              <p className="text-slate-600">Payouts are requested from the venue dashboard and paid to a UAE bank account.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <Badge className="bg-indigo-100 text-indigo-700 border-0 mb-4">At a glance</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Compare the four types</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">&nbsp;</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Cost to join</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">What you pay</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">What you earn</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Best for</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.type} className="border-b border-slate-100 hover:bg-slate-50">
                    <td
                      className="py-3 px-4 font-semibold text-slate-900"
                      style={{ borderLeft: `3px solid ${row.accent}` }}
                    >
                      {row.type}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{row.join}</td>
                    <td className="py-3 px-4 text-slate-600">{row.pay}</td>
                    <td className="py-3 px-4 text-slate-600">{row.earn}</td>
                    <td className="py-3 px-4 text-slate-600">{row.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <Badge className="bg-violet-100 text-violet-700 border-0 mb-4">FAQ</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Common questions</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <FAQItem key={faq.question} faq={faq} defaultOpen={i === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-gradient-to-r from-violet-600 to-indigo-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-lg text-white/80 mb-8">Create your free account in under two minutes.</p>
          <Link to={createPageUrl("Register")}>
            <Button size="lg" className="bg-white text-violet-600 hover:bg-slate-100 h-14 px-8 text-lg">
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}