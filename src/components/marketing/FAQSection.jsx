import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQSection({ faqs, title = "Frequently Asked Questions", subtitle }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-20 px-6 bg-slate-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">{title}</h2>
          {subtitle && <p className="text-slate-600">{subtitle}</p>}
        </div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
                className="w-full flex items-center justify-between p-5 text-left font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
              >
                {faq.question}
                <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 ml-4 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 text-slate-600 leading-relaxed">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function buildFAQSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": { "@type": "Answer", "text": f.answer }
    }))
  };
}