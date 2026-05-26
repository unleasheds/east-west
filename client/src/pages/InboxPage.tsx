import { WHATSAPP_NUMBER } from '../data/packages';

const CHANNELS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8 fill-white" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
    label: 'WhatsApp',
    tag: 'Fastest reply',
    tagColour: 'bg-white/20 text-white',
    cardClass: 'bg-halal text-white',
    body: 'Chat directly with a halal travel expert. Get a personalised quote within 2 hours.',
    href: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi EastWest Halal Travel, I want help planning a halal-friendly trip.')}`,
    cta: 'Open WhatsApp',
    ctaClass: 'bg-white text-halal hover:bg-halal-light',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-ink" strokeWidth={1.5}>
        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: 'Email',
    tag: '24 hr reply',
    tagColour: 'bg-soft text-muted',
    cardClass: 'bg-white text-ink',
    body: 'Send detailed requests, itinerary questions or feedback to our planning team.',
    href: 'mailto:info@eastwesthalaltravel.com',
    cta: 'Send email',
    ctaClass: 'border border-border bg-white text-ink hover:border-ink',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-ink" strokeWidth={1.5}>
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: 'Office',
    tag: 'In person',
    tagColour: 'bg-soft text-muted',
    cardClass: 'bg-white text-ink',
    body: 'Sharjah Media City, Sharjah, United Arab Emirates. Visit us Mon–Fri 9 am – 6 pm GST.',
    href: 'https://maps.google.com/?q=Sharjah+Media+City',
    cta: 'Get directions',
    ctaClass: 'border border-border bg-white text-ink hover:border-ink',
  },
];

const FAQ = [
  {
    q: 'How quickly do you respond on WhatsApp?',
    a: 'Typically within 2 hours during business hours (Mon–Sat, 8 am–10 pm GST).',
  },
  {
    q: 'Are all your hotels halal-certified?',
    a: 'We only partner with hotels that meet halal food and alcohol-free requirements. Every booking comes with a halal food guide.',
  },
  {
    q: 'Can I request a custom itinerary?',
    a: 'Absolutely — most of our clients get fully custom plans. Just send your dates, budget and destination on WhatsApp.',
  },
  {
    q: 'Is there a booking fee?',
    a: 'Trip planning is 100% free. You only pay when you confirm your booking.',
  },
];

export default function InboxPage() {
  return (
    <div className="page-enter mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">

      {/* Page header */}
      <div className="mb-8">
        <p className="section-label">Get in touch</p>
        <h1 className="mt-1 text-4xl font-black text-ink md:text-6xl">Contact us</h1>
        <p className="mt-2 text-muted">
          We're a WhatsApp-first team — fastest replies via the green button below.
        </p>
      </div>

      {/* Channel cards */}
      <div className="grid gap-5 md:grid-cols-3">
        {CHANNELS.map((ch) => (
          <div
            key={ch.label}
            className={`flex flex-col rounded-3xl p-7 shadow-card ${ch.cardClass}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                {ch.icon}
              </div>
              <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${ch.tagColour}`}>
                {ch.tag}
              </span>
            </div>
            <h3 className="mt-5 text-xl font-black">{ch.label}</h3>
            <p className={`mt-2 flex-1 text-sm leading-relaxed ${ch.cardClass.includes('halal') ? 'text-white/75' : 'text-muted'}`}>
              {ch.body}
            </p>
            <a
              href={ch.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-6 block rounded-full py-3.5 text-center text-sm font-bold transition active:scale-95 ${ch.ctaClass}`}
            >
              {ch.cta}
            </a>
          </div>
        ))}
      </div>

      {/* Business hours */}
      <div className="mt-6 rounded-3xl border border-border bg-white p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-ink">Business hours</h3>
            <p className="mt-1 text-sm text-muted">All times are Gulf Standard Time (GST / UTC+4)</p>
          </div>
          <span className="flex items-center gap-2 rounded-full bg-halal-light px-4 py-2 text-xs font-bold text-halal">
            <span className="h-2 w-2 rounded-full bg-halal" />
            Open now
          </span>
        </div>
        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          {[
            { label: 'WhatsApp', hours: 'Mon – Sat · 8 am – 10 pm', note: 'Fastest channel' },
            { label: 'Email',    hours: 'Reply within 24 hours',    note: 'Detailed requests' },
            { label: 'Office',   hours: 'Mon – Fri · 9 am – 6 pm',  note: 'In-person welcome' },
          ].map(({ label, hours, note }) => (
            <div key={label} className="rounded-2xl bg-soft px-4 py-4">
              <p className="font-black text-ink">{label}</p>
              <p className="mt-1 text-muted">{hours}</p>
              <p className="mt-1 text-[11px] text-muted/70">{note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-8">
        <h2 className="mb-5 text-2xl font-black text-ink">Frequently asked questions</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {FAQ.map(({ q, a }) => (
            <div key={q} className="rounded-2xl bg-white p-6 shadow-card">
              <h4 className="font-bold text-ink">{q}</h4>
              <p className="mt-2 text-sm leading-relaxed text-muted">{a}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
