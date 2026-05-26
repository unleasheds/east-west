import { Link } from 'react-router-dom';
import { WHATSAPP_NUMBER } from '../../data/packages';

const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="hidden border-t border-border bg-white md:block">
      {/* Newsletter / CTA strip */}
      <div className="border-b border-border bg-soft">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-8 py-6">
          <div>
            <p className="text-sm font-black text-ink">
              Get halal travel inspiration straight to your inbox
            </p>
            <p className="mt-0.5 text-xs text-muted">Weekly tips, destination guides and exclusive deals.</p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex shrink-0 overflow-hidden rounded-full border border-border bg-white shadow-card"
          >
            <input
              type="email"
              placeholder="Your email address"
              className="w-52 bg-transparent px-4 py-2.5 text-sm text-ink outline-none placeholder:text-muted"
            />
            <button
              type="submit"
              className="gradient-brand px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main columns */}
      <div className="mx-auto max-w-7xl px-8 py-10">
        <div className="grid grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-xs font-black text-white">
                EW
              </div>
              <div>
                <p className="text-[15px] font-black text-ink">EastWest</p>
                <p className="text-[10px] font-semibold text-muted">Halal Travel</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Muslim-friendly holidays with halal food guidance, prayer-friendly planning and
              private family tours.
            </p>

            {/* Trust badges */}
            <div className="mt-4 flex flex-col gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-halal">
                <span className="h-1.5 w-1.5 rounded-full bg-halal" /> Halal-verified hotels
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-muted" /> Licensed in UAE
              </span>
            </div>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-halal px-4 py-2 text-xs font-bold text-white hover:bg-halal-dark transition"
            >
              💬 WhatsApp us
            </a>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="section-label mb-4">Destinations</h4>
            <ul className="space-y-2.5 text-sm">
              {['Maldives', 'Malaysia', 'Indonesia', 'Dubai', 'China', 'Vietnam'].map((d) => (
                <li key={d}>
                  <Link to={`/?destination=${d}`} className="text-muted transition hover:text-ink">
                    {d}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="section-label mb-4">Services</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'Family packages', to: '/' },
                { label: 'Honeymoon stays',  to: '/' },
                { label: 'Private tours',    to: '/' },
                { label: 'Ramadan trips',    to: '/' },
                { label: 'City breaks',      to: '/' },
                { label: 'Free trip planner',to: '/trips' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-muted transition hover:text-ink">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="section-label mb-4">Contact</h4>
            <ul className="space-y-2.5 text-sm text-muted">
              <li className="leading-relaxed">Sharjah Media City<br />Sharjah, UAE</li>
              <li>
                <a href="mailto:info@eastwesthalaltravel.com" className="transition hover:text-ink">
                  info@eastwesthalaltravel.com
                </a>
              </li>
              <li className="pt-2">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-ink"
                >
                  WhatsApp: +{WHATSAPP_NUMBER}
                </a>
              </li>
            </ul>

            <div className="mt-5">
              <h4 className="section-label mb-3">Quick links</h4>
              <div className="flex flex-col gap-2 text-sm">
                {[
                  { label: 'Wishlist',    to: '/wishlist' },
                  { label: 'My trips',    to: '/trips'    },
                  { label: 'My profile',  to: '/profile'  },
                ].map(({ label, to }) => (
                  <Link key={to} to={to} className="text-muted transition hover:text-ink">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex items-center justify-between border-t border-border pt-6 text-xs text-muted">
          <p>© {YEAR} EastWest Halal Travel LLC · Licensed in UAE · All rights reserved</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-ink">Privacy policy</a>
            <a href="#" className="hover:text-ink">Terms of service</a>
            <a href="#" className="hover:text-ink">Cookie settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
