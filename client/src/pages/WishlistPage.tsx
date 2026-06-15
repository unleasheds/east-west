import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '../store/useStore';
import { PACKAGES } from '../data/packages';
import { packagesApi } from '../lib/api';
import { Package } from '../types';
import PackageCard from '../components/ui/PackageCard';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { savedIds } = useStore();

  const { data: apiPackages } = useQuery<Package[]>({
    queryKey: ['packages'],
    queryFn: () => packagesApi.getAll(),
    staleTime: 5 * 60_000,
  });

  const allPackages = apiPackages ?? PACKAGES;
  const saved = allPackages.filter((p) => savedIds.includes(p.slug ?? p.id));

  return (
    <div className="page-enter mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="section-label">Your saved trips</p>
          <h1 className="mt-1 flex items-center gap-3 text-4xl font-black text-ink md:text-6xl">
            Wishlist
            {saved.length > 0 && (
              <span className="rounded-full bg-soft px-4 py-1.5 text-xl font-bold text-muted">
                {saved.length}
              </span>
            )}
          </h1>
          <p className="mt-2 text-muted">
            {saved.length > 0
              ? 'Your saved halal escapes — ready to plan.'
              : 'Tap the ♥ on any package to save it here.'}
          </p>
        </div>
        {saved.length > 0 && (
          <a
            href={`/trips`}
            className="btn-halal hidden md:inline-block"
          >
            Plan all on WhatsApp
          </a>
        )}
      </div>

      {saved.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {saved.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>

          {/* Mobile CTA */}
          <div className="mt-6 md:hidden">
            <a href="/trips" className="btn-halal block w-full text-center">
              Plan all on WhatsApp
            </a>
          </div>

          {/* Info strip */}
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-halal-light px-5 py-4 text-sm text-halal">
            <svg className="h-4 w-4 shrink-0 fill-halal" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
            <span>
              <span className="font-bold">Tip:</span> Send your wishlist on WhatsApp and we'll build a combined halal itinerary — for free.
            </span>
          </div>
        </>
      ) : (
        <div className="rounded-3xl bg-white py-20 text-center shadow-card">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-light">
            <svg viewBox="0 0 24 24" className="h-9 w-9 fill-brand/20 stroke-brand" strokeWidth={1.5}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="mt-5 text-xl font-black text-ink">No saved trips yet</h3>
          <p className="mx-auto mt-2 max-w-xs text-sm text-muted">
            Browse our halal packages and tap the heart icon to save them here for quick planning.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 btn-primary"
          >
            Explore packages →
          </button>
        </div>
      )}
    </div>
  );
}
