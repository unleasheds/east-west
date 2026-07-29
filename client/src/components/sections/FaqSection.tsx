/**
 * Visible counterpart to the FAQPage structured data emitted for the homepage.
 *
 * Google requires FAQ rich-result markup to describe content that is actually
 * on the page, so these answers are kept verbatim in sync with `homeFaqLd()`
 * in `shared/seo.js`.
 */

const FAQS = [
  {
    q: 'Are EastWest holiday packages fully halal?',
    a: 'Yes. Every package is checked for halal-certified or Muslim-owned dining, prayer-friendly scheduling, alcohol-free accommodation options and family-appropriate activities before it is listed.',
  },
  {
    q: 'Do you arrange private and family-only tours?',
    a: 'We do. Private transfers, women-only or family-only excursions and privacy-conscious island resorts can be arranged for any package on request.',
  },
  {
    q: 'How quickly will I get a trip plan?',
    a: 'Send your destination, dates and budget and our team replies on WhatsApp with a free Muslim-friendly trip plan, usually within two hours.',
  },
  {
    q: 'Which destinations do you cover?',
    a: 'The Maldives, Malaysia, Indonesia, Dubai, Turkey and Morocco, with new halal-verified destinations added regularly.',
  },
  {
    q: 'Can I pay online?',
    a: 'Yes. Packages with published pricing can be booked and paid for securely by card on the site, or you can pay after confirming details on WhatsApp.',
  },
];

export default function FaqSection() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-14 md:px-8 md:py-20">
      <p className="section-label">Good to know</p>
      <h2 className="mt-1 text-2xl font-black text-ink sm:text-3xl md:text-4xl">
        Halal travel questions, answered
      </h2>

      <div className="mt-8 divide-y divide-black/5 overflow-hidden rounded-3xl bg-white shadow-card">
        {FAQS.map((faq) => (
          <details key={faq.q} className="group px-5 py-4 sm:px-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-bold text-ink sm:text-base">
              {faq.q}
              <span
                aria-hidden
                className="shrink-0 text-lg text-muted transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
