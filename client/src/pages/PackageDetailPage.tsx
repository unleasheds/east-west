import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PACKAGES, WHATSAPP_NUMBER } from '../data/packages';
import { useStore } from '../store/useStore';
import { BookingOrder } from '../types';
import CheckoutModal from '../components/ui/CheckoutModal';

type Tab = 'overview' | 'itinerary' | 'includes';

const REVIEWS = [
  {
    name: 'Fatimah A.',
    flag: '🇬🇧',
    rating: 5,
    text: 'Absolutely flawless. Everything was halal-verified and our family felt completely at ease throughout the whole trip.',
  },
  {
    name: 'Khalid M.',
    flag: '🇦🇪',
    rating: 5,
    text: 'Booked the Maldives package — the guesthouse was amazing and the excursions were perfectly organised. Highly recommend.',
  },
  {
    name: 'Aisha R.',
    flag: '🇺🇸',
    rating: 5,
    text: 'Best decision we made. The prayer-friendly itinerary made the whole experience so much more meaningful.',
  },
];

export default function PackageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSaved, toggleSave, addTrip } = useStore();

  const pkg = PACKAGES.find((p) => p.id === id);

  const [tab, setTab] = useState<Tab>('overview');
  const [openDay, setOpenDay] = useState<number | null>(1);
  const [heroIdx, setHeroIdx] = useState(0);
  const heroTouchX = useRef(0);
  const [travellers, setTravellers] = useState(2);
  const [bookingForm, setBookingForm] = useState({ name: '', email: '', phone: '', requests: '' });
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutOrder, setCheckoutOrder] = useState<BookingOrder | null>(null);

  if (!pkg) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-5xl">😕</p>
        <h2 className="mt-4 text-2xl font-black text-ink">Package not found</h2>
        <button
          onClick={() => navigate('/')}
          className="mt-6 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white"
        >
          Back to explore
        </button>
      </div>
    );
  }

  const saved = isSaved(pkg.id);
  const totalCents = pkg.priceValue > 0 ? pkg.priceValue * travellers * 100 : 0;

  function openCheckout() {
    if (!pkg) return;
    const order: BookingOrder = {
      packageId: pkg.id,
      packageTitle: pkg.title,
      travellers,
      pricePerPerson: pkg.priceValue,
      totalAmount: totalCents,
      name: bookingForm.name,
      email: bookingForm.email,
      phone: bookingForm.phone,
      specialRequests: bookingForm.requests,
    };
    addTrip({
      destination: pkg.title,
      dates: '',
      travellers: String(travellers),
      budget: pkg.price,
      needs: bookingForm.requests,
    });
    setCheckoutOrder(order);
    setShowCheckout(true);
  }

  function handleWhatsApp() {
    if (!pkg) return;
    const msg = encodeURIComponent(
      `Hi EastWest Halal Travel, I want to plan this trip:\n\nPackage: ${pkg.title}\nDestination: ${pkg.destination}\nTravellers: ${travellers}\nPrice: ${pkg.price}\nName: ${bookingForm.name}\nPhone: ${bookingForm.phone}\nSpecial requests: ${bookingForm.requests}`,
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'itinerary', label: 'Itinerary' },
    { key: 'includes', label: 'Includes' },
  ];

  return (
    <div className="page-enter bg-sand pb-16">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 pt-6 md:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-ink"
        >
          ← Back to packages
        </button>
      </div>

      <div className="mx-auto mt-4 max-w-7xl px-4 md:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-start">

          {/* ── Left column ─────────────────────────── */}
          <div className="space-y-5">

            {/* Hero image carousel */}
            <div className="overflow-hidden rounded-3xl bg-white p-2 shadow-card">
              {/* Main image */}
              <div
                className="relative overflow-hidden rounded-2xl"
                onTouchStart={(e) => { heroTouchX.current = e.touches[0].clientX; }}
                onTouchEnd={(e) => {
                  const dx = e.changedTouches[0].clientX - heroTouchX.current;
                  if (dx > 40) setHeroIdx((i) => (i === 0 ? pkg.images.length - 1 : i - 1));
                  else if (dx < -40) setHeroIdx((i) => (i === pkg.images.length - 1 ? 0 : i + 1));
                }}
              >
                {pkg.images.length > 0 ? (
                  <div
                    className="flex transition-transform duration-300 ease-out"
                    style={{ transform: `translateX(-${heroIdx * 100}%)` }}
                  >
                    {pkg.images.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`${pkg.title} ${i + 1}`}
                        className="h-[280px] w-full shrink-0 object-cover md:h-[420px]"
                        draggable={false}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    className="h-[280px] w-full md:h-[420px]"
                    style={{ background: pkg.imageGradient }}
                  />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                {/* Left arrow */}
                {pkg.images.length > 1 && heroIdx > 0 && (
                  <button
                    onClick={() => setHeroIdx((i) => i - 1)}
                    className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition hover:scale-110"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
                {/* Right arrow */}
                {pkg.images.length > 1 && heroIdx < pkg.images.length - 1 && (
                  <button
                    onClick={() => setHeroIdx((i) => i + 1)}
                    className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition hover:scale-110"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}

                {/* Image counter */}
                {pkg.images.length > 1 && (
                  <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
                    {heroIdx + 1} / {pkg.images.length}
                  </div>
                )}

                {/* Badges top-left */}
                <div className="absolute left-4 top-4 flex gap-2">
                  <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold shadow backdrop-blur-sm">
                    {pkg.type}
                  </span>
                  {pkg.isHalalCertified && (
                    <span className="rounded-full bg-halal px-3 py-1.5 text-xs font-bold text-white shadow">
                      ✓ Halal
                    </span>
                  )}
                </div>

                {/* Save button */}
                <button
                  onClick={() => toggleSave(pkg.id)}
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg shadow backdrop-blur-sm transition hover:scale-110"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className={`h-5 w-5 transition-colors ${saved ? 'fill-brand stroke-brand' : 'fill-transparent stroke-ink/70'}`}
                    strokeWidth={2}
                  >
                    <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Bottom meta */}
                <div className="absolute bottom-4 left-4 right-14 flex items-end justify-between">
                  <div>
                    <h1 className="text-xl font-black text-white drop-shadow md:text-2xl">
                      {pkg.title}
                    </h1>
                    <p className="mt-0.5 text-sm font-semibold text-white/80">{pkg.location}</p>
                  </div>
                  <div className="shrink-0 rounded-full bg-black/50 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
                    {pkg.duration}
                  </div>
                </div>
              </div>

              {/* Thumbnail strip */}
              {pkg.images.length > 1 && (
                <div className="mt-2 flex gap-2 overflow-x-auto pb-0.5 hide-scrollbar">
                  {pkg.images.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setHeroIdx(i)}
                      className={`shrink-0 overflow-hidden rounded-xl transition-all ${
                        i === heroIdx
                          ? 'ring-2 ring-brand ring-offset-1'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={src}
                        alt={`Thumbnail ${i + 1}`}
                        className="h-16 w-24 object-cover"
                        draggable={false}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tab switcher */}
            <div className="flex rounded-2xl border border-border bg-white p-1 shadow-card">
              {TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${
                    tab === key
                      ? 'bg-ink text-white shadow-sm'
                      : 'text-muted hover:text-ink'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ── OVERVIEW TAB ── */}
            {tab === 'overview' && (
              <div className="space-y-5">
                {/* Description */}
                <div className="rounded-3xl bg-white p-6 shadow-card md:p-8">
                  <h3 className="text-xl font-black text-ink">About this trip</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{pkg.description}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    All EastWest packages are curated specifically for Muslim families and couples.
                    We pre-verify halal food options, identify prayer spaces, and plan tour timings
                    around salah — so you can travel with complete peace of mind.
                  </p>
                  {pkg.childPrice && (
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-halal-light px-4 py-2 text-xs font-bold text-halal-dark">
                      <span>👶</span>
                      Children: {pkg.childPrice}
                    </div>
                  )}
                </div>

                {/* Highlights */}
                <div className="rounded-3xl bg-white p-6 shadow-card md:p-8">
                  <h3 className="text-xl font-black text-ink">Trip highlights</h3>
                  <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {pkg.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-3 text-sm text-ink">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-halal-light text-halal text-xs font-bold">
                          ✓
                        </span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Reviews */}
                <div className="rounded-3xl bg-white p-6 shadow-card md:p-8">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-black text-ink">Guest reviews</h3>
                    <div className="flex items-center gap-1 rounded-full bg-soft px-3 py-1 text-sm font-bold">
                      ★ {pkg.rating.toFixed(1)}
                      <span className="ml-1 text-xs font-normal text-muted">({pkg.reviewCount})</span>
                    </div>
                  </div>
                  <div className="mt-5 space-y-4">
                    {REVIEWS.map((r) => (
                      <div key={r.name} className="rounded-2xl bg-soft p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-black text-white">
                              {r.name[0]}
                            </div>
                            <p className="text-sm font-black text-ink">
                              {r.name} {r.flag}
                            </p>
                          </div>
                          <div className="text-xs font-bold text-brand">{'★'.repeat(r.rating)}</div>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-muted">{r.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── ITINERARY TAB ── */}
            {tab === 'itinerary' && (
              <div className="rounded-3xl bg-white p-6 shadow-card md:p-8">
                <h3 className="text-xl font-black text-ink">Day-by-Day Itinerary</h3>
                <p className="mt-1 text-xs text-muted">{pkg.duration}</p>
                <div className="mt-5 space-y-2">
                  {pkg.itinerary.map((day) => {
                    const isOpen = openDay === day.day;
                    return (
                      <div key={day.day} className="overflow-hidden rounded-2xl border border-border">
                        <button
                          onClick={() => setOpenDay(isOpen ? null : day.day)}
                          className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-soft"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white">
                              {day.day}
                            </span>
                            <span className="text-sm font-bold text-ink">{day.title}</span>
                          </div>
                          <svg
                            viewBox="0 0 20 20"
                            className={`h-4 w-4 shrink-0 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        {isOpen && (
                          <ul className="border-t border-border bg-soft px-5 py-4 space-y-2">
                            {day.activities.map((act) => (
                              <li key={act} className="flex items-start gap-2.5 text-sm text-ink">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                                {act}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── INCLUDES TAB ── */}
            {tab === 'includes' && (
              <div className="space-y-5">
                <div className="rounded-3xl bg-white p-6 shadow-card md:p-8">
                  <h3 className="flex items-center gap-2 text-xl font-black text-ink">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-halal-light text-halal text-sm">
                      ✓
                    </span>
                    Package Includes
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {pkg.included.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-ink">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-halal-light text-halal text-xs font-bold">
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {pkg.excluded && pkg.excluded.length > 0 && (
                  <div className="rounded-3xl bg-white p-6 shadow-card md:p-8">
                    <h3 className="flex items-center gap-2 text-xl font-black text-ink">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-400 text-sm">
                        ✕
                      </span>
                      Not Included
                    </h3>
                    <ul className="mt-4 space-y-3">
                      {pkg.excluded.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm text-muted">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-400 text-xs font-bold">
                            ✕
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="rounded-3xl border border-brand-light bg-brand-light/40 p-5">
                  <p className="text-sm font-semibold text-ink">
                    💬 Have questions about what's included? Chat with us on WhatsApp and we'll
                    clarify everything before you book.
                  </p>
                  <button
                    onClick={handleWhatsApp}
                    className="mt-3 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-dark"
                  >
                    Chat on WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right column — sticky booking card ── */}
          <div className="lg:sticky lg:top-24">
            <div className="rounded-3xl bg-white p-6 shadow-card md:p-8">
              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-ink">{pkg.price}</span>
                {pkg.priceValue > 0 && <span className="text-sm text-muted">per person</span>}
              </div>
              {pkg.childPrice && (
                <p className="mt-0.5 text-xs text-muted">
                  Children: {pkg.childPrice}
                </p>
              )}
              <div className="mt-1 flex items-center gap-1 text-sm font-semibold">
                <span className="text-brand">★</span>
                <span>{pkg.rating.toFixed(1)}</span>
                <span className="text-muted">· {pkg.reviewCount} reviews</span>
              </div>

              <div className="my-5 h-px bg-border" />

              {/* Traveller selector */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  Number of travellers
                </label>
                <div className="mt-2 flex items-center gap-4">
                  <button
                    onClick={() => setTravellers((n) => Math.max(1, n - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-lg font-bold hover:border-ink"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-lg font-black">{travellers}</span>
                  <button
                    onClick={() => setTravellers((n) => Math.min(20, n + 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-lg font-bold hover:border-ink"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Guest details */}
              <div className="mt-4 space-y-3">
                {(
                  [
                    { key: 'name', placeholder: 'Full name', label: 'Name' },
                    { key: 'email', placeholder: 'Email address', label: 'Email' },
                    { key: 'phone', placeholder: 'WhatsApp number', label: 'Phone' },
                  ] as const
                ).map(({ key, placeholder, label }) => (
                  <label key={key} className="flex flex-col gap-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                      {label}
                    </span>
                    <input
                      value={bookingForm[key]}
                      onChange={(e) => setBookingForm((p) => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="rounded-xl border border-border bg-soft px-4 py-3 text-sm font-semibold text-ink outline-none placeholder:text-muted focus:border-brand focus:ring-1 focus:ring-brand"
                    />
                  </label>
                ))}
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                    Special requests
                  </span>
                  <textarea
                    value={bookingForm.requests}
                    onChange={(e) => setBookingForm((p) => ({ ...p, requests: e.target.value }))}
                    placeholder="Dietary needs, prayer schedule, cot, etc."
                    className="min-h-[80px] resize-none rounded-xl border border-border bg-soft px-4 py-3 text-sm font-semibold text-ink outline-none placeholder:text-muted focus:border-brand focus:ring-1 focus:ring-brand"
                  />
                </label>
              </div>

              <div className="my-5 h-px bg-border" />

              {/* Price breakdown */}
              {pkg.priceValue > 0 && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted">
                    <span>
                      {pkg.price} × {travellers} traveller{travellers > 1 ? 's' : ''}
                    </span>
                    <span className="font-semibold text-ink">
                      ${(pkg.priceValue * travellers).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>Service fee</span>
                    <span className="font-semibold text-ink">$0</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 font-black text-ink">
                    <span>Total</span>
                    <span>${(pkg.priceValue * travellers).toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* CTAs */}
              <div className="mt-5 space-y-3">
                {pkg.priceValue > 0 ? (
                  <button
                    onClick={openCheckout}
                    className="w-full rounded-full bg-brand py-4 text-sm font-bold text-white transition hover:bg-brand-dark"
                  >
                    🔒 Book &amp; Pay — ${(pkg.priceValue * travellers).toLocaleString()}
                  </button>
                ) : (
                  <p className="rounded-2xl bg-soft px-4 py-3 text-center text-sm font-semibold text-muted">
                    Custom price — request a quote below
                  </p>
                )}
                <button
                  onClick={handleWhatsApp}
                  className="w-full rounded-full border border-border bg-white py-4 text-sm font-bold text-ink transition hover:border-halal hover:text-halal"
                >
                  💬 Enquire on WhatsApp
                </button>
              </div>

              <p className="mt-4 text-center text-xs text-muted">
                No charge until confirmed · Free cancellation within 48 h
              </p>

              {/* Quick includes pill strip */}
              <div className="mt-5 border-t border-border pt-4">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted">
                  What's included
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {pkg.included.slice(0, 4).map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-soft px-2.5 py-1 text-[10px] font-semibold text-ink"
                    >
                      ✓ {item.split('(')[0].trim()}
                    </span>
                  ))}
                  {pkg.included.length > 4 && (
                    <button
                      onClick={() => setTab('includes')}
                      className="rounded-full bg-brand-light px-2.5 py-1 text-[10px] font-bold text-brand"
                    >
                      +{pkg.included.length - 4} more
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout modal */}
      {showCheckout && checkoutOrder && (
        <CheckoutModal
          order={checkoutOrder}
          onClose={() => setShowCheckout(false)}
        />
      )}
    </div>
  );
}
