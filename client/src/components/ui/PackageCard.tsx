import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Package } from '../../types';
import { useStore } from '../../store/useStore';
import { WHATSAPP_NUMBER } from '../../data/packages';

interface Props {
  pkg: Package;
}

function StarRating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5 text-xs">
      <Star className="h-3 w-3 fill-gold stroke-gold" />
      <span className="font-bold text-ink">{Number(value).toFixed(1)}</span>
    </span>
  );
}

export default function PackageCard({ pkg }: Props) {
  const navigate = useNavigate();
  const { isSaved, toggleSave } = useStore();
  const pkgKey = pkg.slug ?? pkg.id;   // slug for API data; id for static fallback
  const saved = isSaved(pkgKey);

  // ── Carousel state ─────────────────────────────────────────────────────────
  const [imgIdx, setImgIdx] = useState(0);
  const touchX = useRef(0);
  const images = Array.isArray(pkg.images) && pkg.images.length > 0 ? pkg.images : [];
  const hasMultiple = images.length > 1;

  function prevImg(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setImgIdx((i) => (i === 0 ? images.length - 1 : i - 1));
  }
  function nextImg(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setImgIdx((i) => (i === images.length - 1 ? 0 : i + 1));
  }
  function onTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (dx > 40) setImgIdx((i) => (i === 0 ? images.length - 1 : i - 1));
    else if (dx < -40) setImgIdx((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi EastWest Halal Travel, I want to plan this trip:\n\nPackage: ${pkg.title}\nDestination: ${pkg.destination}\nPrice: ${pkg.price}\nTravellers:\nDates:\nSpecial requirements:`,
  )}`;

  return (
    <article className="group cursor-pointer">
      {/* ── Image / carousel ─────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-2xl"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Image strip */}
        <button
          onClick={() => navigate(`/package/${pkgKey}`)}
          className="block w-full select-none"
          aria-label={`View ${pkg.title}`}
          draggable={false}
        >
          {images.length > 0 ? (
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${imgIdx * 100}%)` }}
            >
              {images.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`${pkg.title} photo ${i + 1}`}
                  className="aspect-[4/3] w-full shrink-0 object-cover"
                  draggable={false}
                />
              ))}
            </div>
          ) : (
            <div
              className="aspect-[4/3] w-full"
              style={{ background: pkg.imageGradient }}
            />
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </button>

        {/* ── Left arrow ── */}
        {hasMultiple && imgIdx > 0 && (
          <button
            onClick={prevImg}
            className="absolute left-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition-opacity opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:scale-110"
            aria-label="Previous image"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {/* ── Right arrow ── */}
        {hasMultiple && imgIdx < images.length - 1 && (
          <button
            onClick={nextImg}
            className="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md transition-opacity opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:scale-110"
            aria-label="Next image"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {/* ── Dot indicators ── */}
        {hasMultiple && (
          <div className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setImgIdx(i); }}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === imgIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/60 hover:bg-white/90'
                }`}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* ── Heart / save button ── */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleSave(pkgKey); }}
          aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow backdrop-blur-sm transition-all duration-150 hover:scale-110 active:scale-95"
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-4 w-4 transition-colors ${saved ? 'fill-brand stroke-brand' : 'fill-transparent stroke-ink/70'}`}
            strokeWidth={2}
          >
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* ── Halal badge ── */}
        {pkg.isHalalCertified && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-halal px-2.5 py-1 text-[10px] font-bold text-white shadow-card">
            <svg className="h-2.5 w-2.5 fill-white" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Halal
          </div>
        )}

        {/* ── Duration badge ── */}
        <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
          {pkg.duration}
        </div>
      </div>

      {/* ── Card info ──────────────────────────────────────────────────────── */}
      <div
        className="mt-3 px-0.5"
        onClick={() => navigate(`/package/${pkgKey}`)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-ink">{pkg.title}</h3>
            <p className="mt-0.5 text-xs text-muted">{pkg.location}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <StarRating value={pkg.rating} />
            <span className="text-[10px] text-muted">({pkg.reviewCount})</span>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between">
          <p className="text-sm font-bold text-ink">
            {pkg.price}
            {pkg.priceValue > 0 && (
              <span className="ml-1 text-xs font-normal text-muted">/ person</span>
            )}
          </p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="rounded-full bg-brand px-3.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-brand-dark active:scale-95"
          >
            Plan →
          </a>
        </div>
      </div>
    </article>
  );
}
