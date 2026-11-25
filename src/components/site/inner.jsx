import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { GRAD, WHATSAPP } from "./Site";

// Inner-page templates (Figma "Web / 02–10" frames): 120px gutters, #fbfaff hero, white cards.
export const wrap = "max-w-[1440px] mx-auto px-6 lg:px-[120px]";

export function Tag({ children }) {
  return <span className="inline-block rounded-full bg-[#f1ecff] text-[#5a2ded] text-[12px] font-semibold px-3 py-1.5">{children}</span>;
}

export function Btn({ to, href, children, kind = "primary", className = "", ...rest }) {
  const styles = {
    primary: "text-white",
    light: "bg-white border border-[#eceaf3] text-[#111027]",
    ghost: "bg-white/10 border border-white/25 text-white",
  };
  const cls = `inline-flex items-center justify-center rounded-xl px-[22px] py-[14px] text-[15px] font-semibold whitespace-nowrap transition hover:brightness-105 ${styles[kind]} ${className}`;
  const style = kind === "primary" ? { backgroundImage: GRAD } : undefined;
  if (href) return <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className={cls} style={style} {...rest}>{children}</a>;
  if (to) return <Link to={to} className={cls} style={style} {...rest}>{children}</Link>;
  return <button className={cls} style={style} {...rest}>{children}</button>;
}

export function PageHero({ tag, title, sub, actions, img, imgAlt = "", children }) {
  return (
    <section className="bg-[#fbfaff]">
      <div className={`${wrap} py-14 lg:py-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-16`}>
        <div className="flex-1 flex flex-col gap-[22px] items-start">
          {tag && <Tag>{tag}</Tag>}
          <h1 className="font-bold text-[40px] md:text-[56px] leading-[1.1] tracking-[-1.68px] text-[#111027] max-w-[600px]">{title}</h1>
          {sub && <p className="text-[17px] md:text-[19px] text-[#6b6787] max-w-[560px]">{sub}</p>}
          {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
          {children}
        </div>
        {img && <img src={img} alt={imgAlt} className="w-full lg:w-[560px] h-[300px] md:h-[460px] object-cover rounded-[28px] shrink-0" />}
      </div>
    </section>
  );
}

export function Block({ tag, title, sub, children, className = "", tone = "white" }) {
  const bg = { white: "bg-white", grey: "bg-[#f6f5fa]", soft: "bg-[#fbfaff]" }[tone];
  return (
    <section className={`${bg} ${className}`}>
      <div className={`${wrap} py-16 lg:py-24 flex flex-col gap-10`}>
        {(tag || title) && (
          <div className="flex flex-col gap-3.5 items-start">
            {tag && <Tag>{tag}</Tag>}
            {title && <h2 className="font-bold text-[32px] md:text-[44px] leading-[1.1] tracking-[-1.32px] text-[#111027] max-w-[760px]">{title}</h2>}
            {sub && <p className="text-[17px] text-[#6b6787] max-w-[760px]">{sub}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export function FeatureGrid({ items, cols = 3 }) {
  return (
    <div className={`grid sm:grid-cols-2 ${cols === 3 ? "lg:grid-cols-3" : cols === 4 ? "lg:grid-cols-4" : "lg:grid-cols-2"} gap-5`}>
      {items.map(([Icon, t, d]) => (
        <div key={t} className="bg-white border border-[#eceaf3] rounded-[20px] p-6 flex flex-col gap-3">
          {Icon && <span className="bg-[#f1ecff] rounded-xl p-2.5 self-start"><Icon className="w-[22px] h-[22px] text-[#5a2ded]" /></span>}
          <p className="font-bold text-[18px] leading-[1.5] text-[#111027]">{t}</p>
          <p className="text-[15px] leading-[1.5] text-[#6b6787]">{d}</p>
        </div>
      ))}
    </div>
  );
}

export function SplitSteps({ img, imgAlt = "", tag, title, steps }) {
  return (
    <section className="bg-[#f6f5fa]">
      <div className={`${wrap} py-16 lg:py-24 flex flex-col lg:flex-row items-center gap-12 lg:gap-16`}>
        <img src={img} alt={imgAlt} loading="lazy" className="w-full lg:w-[560px] h-[300px] md:h-[420px] object-cover rounded-[28px] shrink-0" />
        <div className="flex-1 flex flex-col gap-[18px] items-start">
          {tag && <Tag>{tag}</Tag>}
          <h2 className="font-bold text-[32px] md:text-[40px] leading-[1.1] tracking-[-1.2px] text-[#111027]">{title}</h2>
          {steps.map((s, i) => (
            <div key={s} className="flex gap-3.5 items-center">
              <span className="rounded-full px-3 py-1.5 text-white font-bold text-[14px] leading-[1.5] shrink-0" style={{ backgroundImage: GRAD }}>{i + 1}</span>
              <p className="font-medium text-[17px] leading-[1.5] text-[#111027] max-w-[440px]">{s}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FAQList({ items, tag = "FAQ", title = "Questions people ask" }) {
  const [open, setOpen] = useState(0);
  return (
    <Block tag={tag} title={title}>
      <div className="flex flex-col gap-3">
        {items.map(([q, a], i) => {
          const on = open === i;
          return (
            <div key={q} className="bg-white border border-[#eceaf3] rounded-2xl">
              <button className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left" onClick={() => setOpen(on ? -1 : i)} aria-expanded={on}>
                <span className="font-semibold text-[17px] text-[#111027]">{q}</span>
                <ChevronDown className={`w-5 h-5 text-[#8f86b8] shrink-0 transition-transform ${on ? "rotate-180" : ""}`} />
              </button>
              {on && <p className="px-6 pb-5 -mt-2 text-[15px] leading-[1.5] text-[#6b6787]">{a}</p>}
            </div>
          );
        })}
      </div>
    </Block>
  );
}

export function faqLd(items) {
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
}

export function CTABox({ title, sub, primary = { label: "Get started", to: "/signup" }, secondary = { label: "WhatsApp us", href: WHATSAPP } }) {
  return (
    <section className="bg-white">
      <div className={`${wrap} pt-10 pb-16 lg:pb-24`}>
        <div className="rounded-[28px] px-6 md:px-12 py-14 flex flex-col items-center gap-4 text-center" style={{ backgroundImage: GRAD }}>
          <h2 className="font-bold text-[32px] md:text-[40px] leading-[1.1] tracking-[-1.2px] text-white max-w-[800px]">{title}</h2>
          {sub && <p className="text-[17px] leading-[1.5] text-[#e4daff] max-w-[640px]">{sub}</p>}
          <div className="flex flex-wrap justify-center gap-3">
            <Btn kind="light" to={primary.to} href={primary.href}>{primary.label}</Btn>
            {secondary && <Btn kind="ghost" to={secondary.to} href={secondary.href}>{secondary.label}</Btn>}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Field({ label, error, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-[#111027]">{label}</span>
      {children}
      {error && <span className="text-[12px] text-red-600">{error}</span>}
    </label>
  );
}

export const inputCls = "w-full h-[50px] bg-white border border-[#eceaf3] rounded-xl px-4 text-[15px] text-[#111027] placeholder:text-[#a39fb8] outline-none focus:border-[#6f3ffd] focus:ring-2 focus:ring-[#6f3ffd]/15";

// Native select styled like the inputs, with our own chevron.
export function Select({ className = "", children, ...props }) {
  return (
    <div className={`relative ${className}`}>
      <select {...props} className={`${inputCls} appearance-none pr-10 cursor-pointer`}>{children}</select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8f86b8]" />
    </div>
  );
}
