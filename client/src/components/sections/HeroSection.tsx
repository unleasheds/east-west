import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Calendar, Users, Plane, MessageCircle,
  Waves, TreePalm, Anchor, Fish, Building2, Star, CheckCircle,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '../../store/useStore';
import { PACKAGES, WHATSAPP_NUMBER } from '../../data/packages';
import { packagesApi } from '../../lib/api';
import { Package } from '../../types';

const QUICK_PICKS = [
  { label: 'Maldives',     Icon: Waves     },
  { label: 'Malaysia',     Icon: TreePalm  },
  { label: 'Himmafushi',   Icon: Anchor    },
  { label: 'Ukulhas',      Icon: Fish      },
  { label: 'Kuala Lumpur', Icon: Building2 },
];

const STATS = [
  { value: '5,000+', label: 'travellers' },
  { value: '4.9',    label: 'avg rating', star: true },
  { value: '15',     label: 'destinations' },
  { value: '< 2 hr', label: 'quote reply' },
];

export default function HeroSection() {
  const navigate = useNavigate();
  const { setSearch } = useStore();
  const [local, setLocal] = useState({ destination: '', dates: '', travellers: '' });
  const [guests, setGuests] = useState(2);
  const [locationOpen, setLocationOpen] = useState(false);
  const desktopWhereRef = useRef<HTMLDivElement>(null);
  const mobileWhereRef = useRef<HTMLDivElement>(null);

  const { data: apiPackages } = useQuery<Package[]>({
    queryKey: ['packages'],
    queryFn: () => packagesApi.getAll(),
    staleTime: 5 * 60_000,
  });

  const allLocations = useMemo(() => {
    const pkgs = Array.isArray(apiPackages) ? apiPackages : PACKAGES;
    const seen = new Set<string>();
    const items: { destination: string; location: string }[] = [];
    pkgs.forEach((p) => {
      const key = `${p.destination}|${p.location}`;
      if (!seen.has(key)) {
        seen.add(key);
        items.push({ destination: p.destination, location: p.location });
      }
    });
    return items;
  }, [apiPackages]);

  const filteredLocations = local.destination
    ? allLocations.filter(
        (l) =>
          l.destination.toLowerCase().includes(local.destination.toLowerCase()) ||
          l.location.toLowerCase().includes(local.destination.toLowerCase()),
      )
    : allLocations;

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      const t = e.target as Node;
      if (
        (!desktopWhereRef.current || !desktopWhereRef.current.contains(t)) &&
        (!mobileWhereRef.current || !mobileWhereRef.current.contains(t))
      ) {
        setLocationOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const featured = apiPackages?.[0] ?? PACKAGES[0];
  const featuredKey = featured?.slug ?? featured?.id ?? '';

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch({ ...local, travellers: `${guests} guest${guests !== 1 ? 's' : ''}` });
  }

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="h-1 w-full gradient-brand" />

      {/* Subtle dot texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'radial-gradient(circle, #316077 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-12 md:px-8 md:pb-18 md:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_.9fr]">

          {/* ── Left ── */}
          <div>
            {/* Trust badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-halal/30 bg-halal-light px-4 py-2 text-xs font-bold text-halal">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-halal opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-halal" />
              </span>
              Muslim-friendly · Halal-verified · Private tours
            </div>

            {/* Headline */}
            <h1 className="max-w-xl text-[2.25rem] font-black leading-[0.92] tracking-tight text-ink sm:text-5xl md:text-7xl lg:text-[80px]">
              Halal Travel,
              <br />
              <span className="text-brand">Made Simple.</span>
            </h1>

            <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
              Verified halal hotels, private tours and prayer-friendly itineraries —
              planned for you on WhatsApp.
            </p>

            {/* ── Airbnb-style search pill ── */}
            <form onSubmit={handleSearch} className="mt-8">
              {/* Desktop: single pill */}
              <div className="hidden overflow-hidden rounded-full border border-border bg-white shadow-modal md:flex">
                {/* Where */}
                <div ref={desktopWhereRef} className="relative flex flex-1 border-r border-border">
                  <label
                    className="flex flex-1 cursor-text flex-col justify-center px-6 py-4 hover:bg-soft/60 transition"
                    onClick={() => setLocationOpen(true)}
                  >
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-ink">Where</span>
                    </div>
                    <input
                      value={local.destination}
                      onChange={(e) => {
                        setLocal((p) => ({ ...p, destination: e.target.value }));
                        setLocationOpen(true);
                      }}
                      onFocus={() => setLocationOpen(true)}
                      className="mt-0.5 w-full bg-transparent text-sm font-semibold text-ink outline-none placeholder:font-normal placeholder:text-muted"
                      placeholder="Destination"
                    />
                  </label>
                  {locationOpen && (
                    <div className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-border bg-white shadow-modal">
                      {filteredLocations.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-muted">No destinations found</p>
                      ) : (
                        filteredLocations.map((l) => (
                          <button
                            key={l.destination + l.location}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setLocal((p) => ({ ...p, destination: l.destination }));
                              setLocationOpen(false);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-soft/60"
                          >
                            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-soft">
                              <MapPin className="h-4 w-4 text-brand" />
                            </span>
                            <div>
                              <p className="text-sm font-bold text-ink">{l.destination}</p>
                              <p className="text-xs text-muted">{l.location}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {/* When */}
                <label className="flex w-44 cursor-text flex-col justify-center border-r border-border px-6 py-4 hover:bg-soft/60 transition">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-ink">When</span>
                  </div>
                  <input
                    type="date"
                    value={local.dates}
                    onChange={(e) => setLocal((p) => ({ ...p, dates: e.target.value }))}
                    className="mt-0.5 w-full bg-transparent text-sm font-semibold text-ink outline-none placeholder:font-normal placeholder:text-muted [color-scheme:light]"
                  />
                </label>
                {/* Who — guest stepper */}
                <div className="flex w-48 flex-col justify-center border-r border-border px-6 py-4 hover:bg-soft/60 transition">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-muted" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-ink">Who</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setGuests((g) => Math.max(1, g - 1))}
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted transition hover:border-ink hover:text-ink"
                    >
                      <span className="text-base leading-none">−</span>
                    </button>
                    <span className="min-w-[3rem] text-center text-sm font-semibold text-ink">
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
                {/* Search button */}
                <div className="flex items-center p-2">
                  <button
                    type="submit"
                    className="flex h-12 w-12 items-center justify-center rounded-full gradient-brand text-white shadow transition hover:opacity-90 active:scale-95"
                    aria-label="Search"
                  >
                    <Search className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* Mobile: stacked card */}
              <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-card md:hidden">
                <div ref={mobileWhereRef} className="relative border-b border-border">
                  <label
                    className="flex cursor-text flex-col px-5 py-4"
                    onClick={() => setLocationOpen(true)}
                  >
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-ink">Where</span>
                    </div>
                    <input
                      value={local.destination}
                      onChange={(e) => {
                        setLocal((p) => ({ ...p, destination: e.target.value }));
                        setLocationOpen(true);
                      }}
                      onFocus={() => setLocationOpen(true)}
                      className="mt-0.5 w-full bg-transparent text-sm font-semibold text-ink outline-none placeholder:font-normal placeholder:text-muted"
                      placeholder="Destination"
                    />
                  </label>
                  {locationOpen && (
                    <div className="absolute left-0 top-full z-50 w-full overflow-hidden rounded-2xl border border-border bg-white shadow-modal">
                      {filteredLocations.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-muted">No destinations found</p>
                      ) : (
                        filteredLocations.map((l) => (
                          <button
                            key={l.destination + l.location}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setLocal((p) => ({ ...p, destination: l.destination }));
                              setLocationOpen(false);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-soft/60"
                          >
                            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-soft">
                              <MapPin className="h-4 w-4 text-brand" />
                            </span>
                            <div>
                              <p className="text-sm font-bold text-ink">{l.destination}</p>
                              <p className="text-xs text-muted">{l.location}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 border-b border-border">
                  <label className="flex cursor-text flex-col border-r border-border px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-ink">When</span>
                    </div>
                    <input
                      type="date"
                      value={local.dates}
                      onChange={(e) => setLocal((p) => ({ ...p, dates: e.target.value }))}
                      className="mt-0.5 w-full bg-transparent text-sm font-semibold text-ink outline-none [color-scheme:light]"
                    />
                  </label>
                  <div className="flex flex-col px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-muted" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-ink">Who</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setGuests((g) => Math.max(1, g - 1))}
                        className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-xs text-muted"
                      >−</button>
                      <span className="text-sm font-semibold text-ink">{guests}</span>
                      <button
                        type="button"
                        onClick={() => setGuests((g) => Math.min(20, g + 1))}
                        className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-xs text-muted"
                      >+</button>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 gradient-brand px-6 py-4 text-sm font-bold text-white"
                >
                  <Search className="h-4 w-4" />
                  Search halal trips
                </button>
              </div>

              {/* Quick destination picks */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted">Popular:</span>
                {QUICK_PICKS.map(({ label, Icon }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setLocal((p) => ({ ...p, destination: label }))}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
                      local.destination === label
                        ? 'border-ink bg-ink text-white'
                        : 'border-border bg-white text-muted hover:border-ink hover:text-ink'
                    }`}
                  >
                    <Icon className="h-3 w-3" /> {label}
                  </button>
                ))}
              </div>
            </form>

            {/* CTAs */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button onClick={() => navigate('/trips')} className="btn-primary flex items-center gap-2">
                <Plane className="h-4 w-4" /> Free trip plan
              </button>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi EastWest Halal Travel, I want help planning a halal-friendly trip.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-halal flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
              </a>
            </div>

            {/* Stats strip */}
            <div className="mt-7 grid grid-cols-2 divide-x divide-y divide-border rounded-2xl border border-border bg-white sm:grid-cols-4 sm:divide-y-0">
              {STATS.map(({ value, label, star }) => (
                <div key={label} className="px-4 py-3 text-center">
                  <p className="flex items-center justify-center gap-1 text-base font-black text-ink md:text-lg">
                    {value}
                    {star && <Star className="h-3.5 w-3.5 fill-gold stroke-gold" />}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right — featured card ── */}
          <div className="hidden lg:block">
            <div className="relative rounded-3xl bg-white p-2 shadow-modal">
              <div
                className="relative h-[500px] overflow-hidden rounded-2xl"
                style={{ background: featured?.imageGradient ?? 'linear-gradient(135deg,#8fcfce,#65b7bd)' }}
              >
                <div className="absolute left-4 top-4 flex flex-col gap-2">
                  <span className="flex w-fit items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold shadow-card">
                    <TreePalm className="h-3.5 w-3.5 text-brand" /> {featured?.destination ?? 'Maldives'} escape
                  </span>
                  <span className="flex w-fit items-center gap-1.5 rounded-full bg-halal px-3.5 py-1.5 text-xs font-bold text-white shadow-card">
                    <CheckCircle className="h-3.5 w-3.5" /> Halal certified
                  </span>
                </div>
                <div className="absolute right-4 top-4 rounded-full bg-ink/80 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                  Family-safe tours
                </div>

                {/* Show first image if available */}
                {featured?.images?.[0] && (
                  <img
                    src={featured.images[0]}
                    alt={featured.title}
                    className="absolute inset-0 h-full w-full object-cover opacity-30"
                  />
                )}

                <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/95 p-5 shadow-modal backdrop-blur">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="section-label">Featured escape</p>
                      <h3 className="mt-1.5 text-lg font-black text-ink">
                        {featured?.title ?? 'Maldives Family Island Escape'}
                      </h3>
                      <p className="mt-1 text-sm text-muted">{featured?.duration ?? '3 nights'} · {featured?.location ?? 'hotel + transfer + tour'}</p>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-bold">
                      <Star className="h-3.5 w-3.5 fill-gold stroke-gold" /> {featured?.rating ?? 4.9}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-black text-ink">
                      {featured?.price ?? 'From $499'} <span className="text-xs font-normal text-muted">/ person</span>
                    </span>
                    <button
                      onClick={() => navigate(`/package/${featuredKey}`)}
                      className="btn-primary py-2.5 text-xs"
                    >
                      View →
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex -space-x-2">
                  {['#316077','#E4A853','#22C55E','#26252C'].map((c) => (
                    <div key={c} className="h-7 w-7 rounded-full border-2 border-white" style={{ background: c }} />
                  ))}
                </div>
                <p className="text-xs font-semibold text-muted">
                  <span className="font-black text-ink">124 families</span> booked this month
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
