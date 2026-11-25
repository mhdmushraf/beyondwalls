import { Link, useLocation } from "react-router-dom";
import { SitePage } from "./Site";
import { wrap } from "./inner";

const TABS = [
  ["Terms of service", "/Terms"],
  ["Privacy policy", "/Privacy"],
  ["Advertising rules", "/Terms#advertising-rules"],
  ["Venue agreement", "/Terms#venue-agreement"],
  ["Cookies", "/Privacy#cookies"],
];

export default function LegalShell({ title, updated, children }) {
  const { pathname, hash } = useLocation();
  const current = `${pathname}${hash}`.toLowerCase();
  return (
    <SitePage>
      <section className="bg-white">
        <div className={`${wrap} py-12 lg:py-16 flex flex-col lg:flex-row gap-10 lg:gap-16`}>
          <nav className="lg:w-[240px] shrink-0 flex lg:flex-col gap-1 overflow-x-auto lg:sticky lg:top-24 self-start">
            {TABS.map(([l, to]) => {
              const on = current === to.toLowerCase() || (!hash && pathname.toLowerCase() === to.toLowerCase());
              return (
                <Link key={l} to={to} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-[14px] font-semibold ${on ? "bg-[#f1ecff] text-[#5a2ded]" : "text-[#6b6787] hover:bg-[#fbfaff]"}`}>{l}</Link>
              );
            })}
          </nav>
          <article className="flex-1 min-w-0 max-w-[760px]">
            <span className="inline-block rounded-full bg-amber-100 text-amber-800 text-[12px] font-semibold px-3 py-1.5 mb-4">Draft — pending legal review</span>
            <h1 className="font-bold text-[36px] md:text-[44px] tracking-[-1.32px] text-[#111027]">{title}</h1>
            <p className="text-[14px] text-[#6b6787] mt-2 mb-8">Last updated: {updated} · Linkzone Global FZ-LLC, Dubai, UAE</p>
            <div className="prose prose-slate max-w-none prose-headings:text-[#111027] prose-headings:scroll-mt-24 prose-h2:text-[20px] prose-p:text-[#4b4766] prose-li:text-[#4b4766] prose-a:text-[#5a2ded]">
              {children}
            </div>
          </article>
        </div>
      </section>
    </SitePage>
  );
}
