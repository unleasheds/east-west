import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { WHATSAPP_NUMBER } from '../../data/packages';
import { settingsApi } from '../../lib/api';
import { useStore } from '../../store/useStore';
import { PackageType } from '../../types';

const YEAR = new Date().getFullYear();
const FALLBACK_PACKAGE_TYPES: PackageType[] = ['Family', 'Private', 'Honeymoon', 'Ramadan', 'Island', 'City'];

function scrollToPackages() {
  // Scroll past the hero + category chips to the packages grid
  const el = document.getElementById('packages-grid');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSearch, setActiveCategory } = useStore();
  const { data: settings } = useQuery<Record<string, unknown[]>>({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getAll(),
    staleTime: 5 * 60_000,
  });

  const packageTypes = (settings?.package_types?.filter(
    (type): type is string => typeof type === 'string' && type.trim().length > 0,
  ) ?? FALLBACK_PACKAGE_TYPES);

  function goToDestination(dest: string) {
    setSearch({ destination: dest });
    setActiveCategory('All');
    if (location.pathname === '/') {
      scrollToPackages();
    } else {
      navigate('/');
      setTimeout(scrollToPackages, 300);
    }
  }

  function goToType(type: string) {
    setActiveCategory(type);
    setSearch({ destination: '' });
    if (location.pathname === '/') {
      scrollToPackages();
    } else {
      navigate('/');
      setTimeout(scrollToPackages, 300);
    }
  }
  return (
    <>
      {/* ── Mobile footer (shown below md) ─────────────────────────── */}
      <div className="border-t border-border bg-white md:hidden">
        <div className="flex flex-col items-center gap-4 px-5 py-6 text-center">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <img src="/favicon.png" alt="EastWest" className="h-8 w-8 object-contain" />
            <div className="text-left">
              <p className="text-sm font-black text-ink">EastWest</p>
              <p className="text-[10px] font-semibold text-muted">Halal Travel</p>
            </div>
          </div>

          {/* WhatsApp CTA */}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi EastWest Halal Travel, I want help planning a halal-friendly trip.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-halal py-3 text-sm font-bold text-white"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Chat on WhatsApp
          </a>

          {/* Contact */}
          <div className="text-xs text-muted space-y-0.5">
            <a href="tel:+971569749429" className="block font-semibold text-ink">+971 56 974 9429</a>
            <a href="tel:+9609411751" className="block">+960 941 1751 (Maldives)</a>
            <a href="mailto:info@eastwesthalaltravel.com" className="block">info@eastwesthalaltravel.com</a>
          </div>

          {/* Social */}
          <div className="flex gap-3">
            <a href="https://facebook.com/eastwesthalaltravels" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="https://www.instagram.com/eastwesthalaltravels/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
          </div>

          <p className="text-[10px] text-muted">© {YEAR} EastWest Halal Travel · All rights reserved</p>
        </div>
      </div>

      {/* ── Desktop footer ─────────────────────────────────────────── */}
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
            <div className="flex items-center gap-2">
              <img src="/favicon.png" alt="EastWest" className="h-9 w-9 object-contain" />
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

            {/* MIT Badge */}
            <div className="mt-5">
              <img
                src="/mit-badge.png"
                alt="Maldives Islamic Tourism — Est. 2025"
                className="h-32 w-auto object-contain"
              />
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
                  <button
                    onClick={() => goToDestination(d)}
                    className="text-muted transition hover:text-ink"
                  >
                    {d}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Package Types */}
          <div>
            <h4 className="section-label mb-4">Package Types</h4>
            <ul className="space-y-2.5 text-sm">
              {packageTypes.map((type) => (
                <li key={type}>
                  <button
                    onClick={() => goToType(type)}
                    className="text-muted transition hover:text-ink"
                  >
                    {type}
                  </button>
                </li>
              ))}
              <li>
                <Link to="/trips" className="text-muted transition hover:text-ink">
                  Free trip planner
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="section-label mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-muted">
              <li>
                <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-ink/50">Maldives</p>
                <p className="leading-relaxed">RD Maldives Pvt. Ltd.<br />M. Shaamy Villa, 3rd Floor</p>
                <a href="tel:+9609411751" className="mt-0.5 block transition hover:text-ink">+960 941 1751</a>
              </li>
              <li>
                <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-ink/50">International</p>
                <p className="leading-relaxed">Sharjah Media City<br />Sharjah, United Arab Emirates</p>
                <a href="tel:+971569749429" className="mt-0.5 block transition hover:text-ink">+971 56 974 9429</a>
              </li>
              <li>
                <a href="mailto:info@eastwesthalaltravel.com" className="transition hover:text-ink">
                  info@eastwesthalaltravel.com
                </a>
              </li>
            </ul>

            {/* Social */}
            <div className="mt-4 flex gap-3">
              <a
                href="https://facebook.com/eastwesthalaltravels"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted transition hover:border-ink hover:text-ink"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a
                href="https://www.instagram.com/eastwesthalaltravels/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted transition hover:border-ink hover:text-ink"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted transition hover:border-halal hover:text-halal"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
            </div>

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
          <p>© {YEAR} EastWest Halal Travel LLC · RD Maldives Pvt. Ltd. · Licensed in UAE · All rights reserved</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-ink">Privacy policy</a>
            <a href="#" className="hover:text-ink">Terms of service</a>
            <a href="#" className="hover:text-ink">Cookie settings</a>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}
