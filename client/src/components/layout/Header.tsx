import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, MessageCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { WHATSAPP_NUMBER } from '../../data/packages';

const QUICK_PICKS = ['Maldives', 'Malaysia', 'Himmafushi', 'Ukulhas', 'Kuala Lumpur'];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { search, setSearch } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState(search);
  const [guests, setGuests] = useState(2);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch({ ...local, travellers: `${guests} guest${guests !== 1 ? 's' : ''}` });
    setOpen(false);
    if (location.pathname !== '/') navigate('/');
  }

  const isHome = location.pathname === '/';
  const showPill = !isHome || scrolled;

  // Summary text for the pill
  const pillDest      = search.destination || 'Anywhere';
  const pillDates     = search.dates       || 'Any week';
  const pillGuests    = search.travellers  || 'Add guests';

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${
          scrolled ? 'shadow-topbar' : 'border-b border-border'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-8 md:py-4">

          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <img src="/ew-icon.svg" alt="EastWest Halal Travel" className="h-9 w-9 rounded-xl" />
            <div className="hidden sm:block leading-tight">
              <p className="text-[15px] font-black text-ink">EastWest</p>
              <p className="text-[10px] font-semibold text-muted">Halal Travel</p>
            </div>
          </Link>

          {/* ── Airbnb pill — desktop ── */}
          {showPill && (
            <div ref={ref} className="relative mx-auto hidden w-full max-w-lg md:block">
              {/* Pill button */}
              <button
                onClick={() => setOpen((v) => !v)}
                className={`flex w-full items-center rounded-full border bg-white px-2 py-1.5 shadow-card transition hover:shadow-card-hover ${
                  open ? 'border-ink' : 'border-border'
                }`}
              >
                <span className="flex-1 pl-3 text-left text-sm font-semibold text-ink truncate">
                  {pillDest}
                </span>
                <span className="mx-2 h-4 w-px shrink-0 bg-border" />
                <span className="w-24 shrink-0 text-center text-xs font-medium text-muted">
                  {pillDates}
                </span>
                <span className="mx-2 h-4 w-px shrink-0 bg-border" />
                <span className="w-20 shrink-0 text-center text-xs font-medium text-muted truncate">
                  {pillGuests}
                </span>
                <span className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-brand text-white shadow">
                  <Search className="h-3.5 w-3.5" />
                </span>
              </button>

              {/* Dropdown panel */}
              {open && (
                <div className="absolute left-1/2 top-[calc(100%+8px)] w-[520px] -translate-x-1/2 overflow-hidden rounded-3xl bg-white shadow-modal">
                  <form onSubmit={handleSearch}>
                    {/* Three columns */}
                    <div className="grid grid-cols-3 divide-x divide-border">
                      {/* Where */}
                      <label className="flex cursor-text flex-col px-5 py-4 hover:bg-soft/50 transition">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-muted" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-ink">Where</span>
                        </div>
                        <input
                          autoFocus
                          value={local.destination}
                          onChange={(e) => setLocal((p) => ({ ...p, destination: e.target.value }))}
                          className="mt-1 w-full bg-transparent text-sm font-semibold text-ink outline-none placeholder:font-normal placeholder:text-muted"
                          placeholder="Destination"
                        />
                      </label>
                      {/* When */}
                      <label className="flex cursor-text flex-col px-5 py-4 hover:bg-soft/50 transition">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-ink">When</span>
                        </div>
                        <input
                          type="date"
                          value={local.dates}
                          onChange={(e) => setLocal((p) => ({ ...p, dates: e.target.value }))}
                          className="mt-1 w-full bg-transparent text-sm font-semibold text-ink outline-none [color-scheme:light]"
                        />
                      </label>
                      {/* Who — stepper */}
                      <div className="flex flex-col px-5 py-4 hover:bg-soft/50 transition">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-muted" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-ink">Who</span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setGuests((g) => Math.max(1, g - 1))}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted transition hover:border-ink hover:text-ink"
                          >
                            <span className="text-base leading-none">−</span>
                          </button>
                          <span className="min-w-[4rem] text-center text-sm font-semibold text-ink">
                            {guests} guest{guests !== 1 ? 's' : ''}
                          </span>
                          <button
                            type="button"
                            onClick={() => setGuests((g) => Math.min(20, g + 1))}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted transition hover:border-ink hover:text-ink"
                          >
                            <span className="text-base leading-none">+</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quick picks + submit */}
                    <div className="flex items-center justify-between border-t border-border px-5 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {QUICK_PICKS.map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setLocal((p) => ({ ...p, destination: d }))}
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition active:scale-95 ${
                              local.destination === d
                                ? 'border-ink bg-ink text-white'
                                : 'border-border text-muted hover:border-ink hover:text-ink'
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                      <button
                        type="submit"
                        className="flex shrink-0 items-center gap-2 rounded-full gradient-brand px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90 active:scale-95"
                      >
                        <Search className="h-3.5 w-3.5" />
                        Search
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Mobile search pill */}
          {showPill && (
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex flex-1 items-center gap-2 rounded-full border border-border bg-white px-4 py-2.5 shadow-card md:hidden"
            >
              <Search className="h-4 w-4 shrink-0 text-muted" />
              <span className="truncate text-sm font-semibold text-ink">
                {search.destination || 'Search destinations'}
              </span>
            </button>
          )}

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi EastWest Halal Travel, I want help planning a halal-friendly trip.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full bg-halal px-4 py-2.5 text-xs font-bold text-white transition hover:bg-halal-dark"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>
      </header>

      {/* Mobile full-screen search modal */}
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute inset-x-4 top-16 rounded-3xl bg-white shadow-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearch}>
              <div className="flex flex-col divide-y divide-border">
                {/* Where */}
                <label className="flex cursor-text flex-col px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-ink">Where</span>
                  </div>
                  <input
                    autoFocus
                    value={local.destination}
                    onChange={(e) => setLocal((p) => ({ ...p, destination: e.target.value }))}
                    className="mt-1 bg-transparent text-base font-semibold text-ink outline-none placeholder:font-normal placeholder:text-muted"
                    placeholder="Destination"
                  />
                </label>
                {/* When */}
                <label className="flex cursor-text flex-col px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-ink">When</span>
                  </div>
                  <input
                    type="date"
                    value={local.dates}
                    onChange={(e) => setLocal((p) => ({ ...p, dates: e.target.value }))}
                    className="mt-1 w-full bg-transparent text-base font-semibold text-ink outline-none [color-scheme:light]"
                  />
                </label>
                {/* Who — stepper */}
                <div className="flex flex-col px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-muted" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-ink">Who</span>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setGuests((g) => Math.max(1, g - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted transition hover:border-ink hover:text-ink"
                    >
                      <span className="text-lg leading-none">−</span>
                    </button>
                    <span className="min-w-[5rem] text-center text-base font-semibold text-ink">
                      {guests} guest{guests !== 1 ? 's' : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => setGuests((g) => Math.min(20, g + 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted transition hover:border-ink hover:text-ink"
                    >
                      <span className="text-lg leading-none">+</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border px-5 py-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-sm font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-full gradient-brand px-6 py-3 text-sm font-bold text-white active:scale-95"
                >
                  <Search className="h-4 w-4" />
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
