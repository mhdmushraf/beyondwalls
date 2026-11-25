import { useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle, Mail, MapPin, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import SEOHead from "@/components/SEOHead";
import { SitePage, WHATSAPP, submitLead } from "@/components/site/Site";
import { Tag, Btn, Field, inputCls, wrap } from "@/components/site/inner";

const TYPES = [["venue", "I have screens"], ["advertiser", "I want to advertise"], ["agency", "Agency"]];

export default function Contact() {
  const q = new URLSearchParams(useLocation().search);
  const initialType = ["venue", "advertiser", "agency"].includes(q.get("type")) ? q.get("type") : "venue";
  const [f, setF] = useState({ type: initialType, name: "", company: "", phone: "", email: "", screens: initialType === "venue" ? "1–5" : "Under AED 1k", preferred_time: "Weekday mornings", website: "" });
  const [err, setErr] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr({});
    try {
      await submitLead({ kind: q.get("topic") === "investor" ? "investor" : "demo", ...f });
      setDone(true);
    } catch (x) {
      if (x.field) setErr({ [x.field]: x.message }); else toast.error(x.message);
    } finally { setBusy(false); }
  };

  const contacts = [
    [MessageCircle, "WhatsApp", "Fastest reply · 9am–9pm", WHATSAPP],
    [Mail, "Email", "beyondwalls@linkzoneglobal.com", "mailto:beyondwalls@linkzoneglobal.com"],
    [MapPin, "Office", "in5, Dubai Internet City", "https://maps.google.com/?q=in5+Dubai+Internet+City"],
  ];

  return (
    <SitePage>
      <SEOHead title="Book a demo | BeyondWalls" description="See live prices, the ad marketplace and earnings on your own screen in 20 minutes — on a call or at your venue in Dubai." canonical="https://beyondwalls.ae/Contact" />
      <section className="bg-[#fbfaff]">
        <div className={`${wrap} py-14 lg:py-20 flex flex-col lg:flex-row gap-12 lg:gap-16`}>
          <div className="flex-1 flex flex-col gap-[22px] items-start">
            <Tag>Book a demo</Tag>
            <h1 className="font-bold text-[40px] md:text-[56px] leading-[1.1] tracking-[-1.68px] text-[#111027] max-w-[560px]">See it on your own screen in 20 minutes.</h1>
            <p className="text-[17px] md:text-[19px] text-[#6b6787] max-w-[520px]">We'll show live prices, the ad marketplace and earnings — on a call or at your venue in Dubai.</p>
            <div className="flex flex-col gap-3 w-full max-w-[460px]">
              {contacts.map(([Icon, t, d, href]) => (
                <a key={t} href={href} target="_blank" rel="noreferrer" className="bg-white border border-[#eceaf3] rounded-[18px] p-4 flex items-center gap-4 hover:border-[#6f3ffd]">
                  <span className="bg-[#f1ecff] rounded-xl p-2.5"><Icon className="w-5 h-5 text-[#5a2ded]" /></span>
                  <div><p className="font-bold text-[16px] text-[#111027]">{t}</p><p className="text-[14px] text-[#6b6787]">{d}</p></div>
                </a>
              ))}
            </div>
          </div>
          <div className="w-full lg:w-[540px] shrink-0">
            {done ? (
              <div className="bg-white border border-[#eceaf3] rounded-[28px] p-8 flex flex-col items-center gap-4 text-center">
                <CheckCircle2 className="w-12 h-12 text-[#16a34a]" />
                <p className="font-bold text-[24px] text-[#111027]">Request received</p>
                <p className="text-[15px] text-[#6b6787]">We'll WhatsApp you within one working day to set a time.</p>
                <Btn href={WHATSAPP}>WhatsApp us now</Btn>
              </div>
            ) : (
              <form onSubmit={submit} className="bg-white border border-[#eceaf3] rounded-[28px] p-6 md:p-8 flex flex-col gap-4 shadow-[0_10px_30px_rgba(31,20,77,0.06)]">
                <p className="font-bold text-[22px] text-[#111027]">Tell us about you</p>
                <div className="grid grid-cols-3 gap-2 bg-[#f6f5fa] rounded-xl p-1">
                  {TYPES.map(([k, l]) => (
                    <button type="button" key={k} onClick={() => setF({ ...f, type: k, screens: k === "venue" ? "1–5" : "Under AED 1k" })} className={`rounded-lg py-2.5 text-[13px] font-semibold ${f.type === k ? "bg-white text-[#5a2ded] shadow-sm" : "text-[#6b6787]"}`}>{l}</button>
                  ))}
                </div>
                <input type="text" name="website" value={f.website} onChange={set("website")} className="hidden" tabIndex={-1} autoComplete="off" />
                <Field label="Full name" error={err.name}><input className={inputCls} value={f.name} onChange={set("name")} placeholder="Your name" autoComplete="name" /></Field>
                <Field label="Business name"><input className={inputCls} value={f.company} onChange={set("company")} placeholder="e.g. Bean & Co." autoComplete="organization" /></Field>
                <Field label="Mobile (WhatsApp)" error={err.phone}><input className={inputCls} value={f.phone} onChange={set("phone")} placeholder="+971 5X XXX XXXX" inputMode="tel" autoComplete="tel" /></Field>
                <Field label="Email (optional)" error={err.email}><input className={inputCls} value={f.email} onChange={set("email")} placeholder="you@business.ae" type="email" autoComplete="email" /></Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label={f.type === "venue" ? "Number of screens" : "Monthly budget"}>
                    <select className={inputCls} value={f.screens} onChange={set("screens")}>
                      {(f.type === "venue" ? ["1–5", "6–20", "21–50", "50+"] : ["Under AED 1k", "AED 1–5k", "AED 5–20k", "AED 20k+"]).map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </Field>
                  <Field label="Preferred time">
                    <select className={inputCls} value={f.preferred_time} onChange={set("preferred_time")}>
                      {["Weekday mornings", "Weekday afternoons", "Evenings", "Weekend"].map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </Field>
                </div>
                <Btn type="submit" disabled={busy} className="w-full mt-1">{busy ? "Sending…" : "Book my demo"}</Btn>
                <p className="text-[12px] text-[#6b6787] text-center">We'll only use this to arrange your demo.</p>
              </form>
            )}
          </div>
        </div>
      </section>
    </SitePage>
  );
}
