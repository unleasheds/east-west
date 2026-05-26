import { Link } from 'react-router-dom';

const TRUST_ITEMS = [
  {
    icon: '🍽️',
    title: 'Halal food guidance',
    body: 'We tell you exactly what to eat and where — before you even land.',
    stat: '100% halal',
  },
  {
    icon: '🕌',
    title: 'Prayer-friendly planning',
    body: 'Hotels, routes and tour timing chosen with Muslim travellers in mind.',
    stat: 'Qibla ready',
  },
  {
    icon: '🚤',
    title: 'Private family tours',
    body: 'No random groups — comfortable tours tailored to your family.',
    stat: 'Private only',
  },
  {
    icon: '💬',
    title: 'WhatsApp-first support',
    body: 'Fast quotes, easy questions and simple booking confirmation.',
    stat: '< 2 hr reply',
  },
];

export default function TrustSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">

        {/* CTA block */}
        <div className="relative overflow-hidden rounded-3xl bg-ink p-8 text-white md:p-10">
          {/* Background pattern */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-5"
            style={{
              backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #E07B54 0%, transparent 70%)' }}
          />

          <div className="relative">
            <p className="section-label text-white/40">Why choose EastWest</p>
            <h3 className="mt-3 text-3xl font-black leading-[1.1] md:text-5xl">
              Make booking feel
              <br />
              <span className="text-brand">personal.</span>
            </h3>
            <p className="mt-5 leading-relaxed text-white/70">
              We turn browsing into a real trip plan. Share your dates on WhatsApp and
              get a tailored halal travel quote within hours — no forms, no wait.
            </p>

            {/* Mini stats */}
            <div className="mt-7 grid grid-cols-3 gap-3">
              {[
                { n: '5K+',   l: 'Bookings'    },
                { n: '4.9',   l: 'Avg rating'  },
                { n: '15',    l: 'Destinations' },
              ].map(({ n, l }) => (
                <div key={l} className="rounded-2xl bg-white/10 px-3 py-3 text-center">
                  <p className="stat-num text-xl font-black text-white">{n}</p>
                  <p className="mt-0.5 text-[10px] text-white/50">{l}</p>
                </div>
              ))}
            </div>

            <Link
              to="/trips"
              className="mt-8 inline-block rounded-full bg-brand px-6 py-3.5 text-sm font-bold text-white transition hover:bg-brand-dark active:scale-95"
            >
              Start free trip planner →
            </Link>
          </div>
        </div>

        {/* Trust grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {TRUST_ITEMS.map((item) => (
            <div
              key={item.title}
              className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-card transition hover:shadow-card-hover"
            >
              {/* Subtle top accent on hover */}
              <div className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 rounded-full gradient-brand transition-transform duration-300 group-hover:scale-x-100" />

              <div className="flex items-start justify-between">
                <span className="text-3xl">{item.icon}</span>
                <span className="rounded-full bg-soft px-2.5 py-1 text-[10px] font-bold text-muted">
                  {item.stat}
                </span>
              </div>
              <h4 className="mt-4 text-base font-black text-ink">{item.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
