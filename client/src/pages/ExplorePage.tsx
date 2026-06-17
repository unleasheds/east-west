import { useMemo } from 'react';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '../store/useStore';
import { PACKAGES } from '../data/packages';
import { packagesApi } from '../lib/api';
import { Package } from '../types';
import HeroSection from '../components/sections/HeroSection';
import CategoryChips from '../components/ui/CategoryChips';
import PackageCard from '../components/ui/PackageCard';
import TrustSection from '../components/sections/TrustSection';

export default function ExplorePage() {
  const { activeCategory, search } = useStore();
  const query = search.destination.toLowerCase();

  // Fetch from API; fall back to static data while loading or on error
  const { data: apiPackages, isLoading } = useQuery<Package[]>({
    queryKey: ['packages'],
    queryFn: () => packagesApi.getAll(),
    staleTime: 5 * 60_000,
  });

  const allPackages: Package[] = Array.isArray(apiPackages) ? apiPackages : PACKAGES;

  const filtered = useMemo(() => {
    return allPackages.filter((p) => {
      const matchCat = activeCategory === 'All' || p.type === activeCategory || p.destination === activeCategory;
      const matchQuery =
        !query ||
        [p.title, p.destination, p.location, p.type]
          .join(' ')
          .toLowerCase()
          .includes(query);
      return matchCat && matchQuery;
    });
  }, [allPackages, activeCategory, query]);

  return (
    <div className="page-enter">
      <HeroSection />
      <CategoryChips />

      <div id="packages-grid" className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        {/* Results header */}
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="section-label">Ready to book</p>
            <h2 className="mt-1 flex items-center gap-2 text-xl font-black text-ink sm:text-3xl md:text-4xl">
              {activeCategory === 'All' ? 'All halal escapes' : `${activeCategory} packages`}
              <span className="rounded-full bg-soft px-3 py-1 text-sm font-bold text-muted">
                {filtered.length}
              </span>
            </h2>
          </div>
          {(activeCategory !== 'All' || query) && (
            <button
              onClick={() => {
                useStore.getState().clearSearch();
                useStore.getState().setActiveCategory('All');
              }}
              className="btn-secondary text-sm"
            >
              ✕ Clear filters
            </button>
          )}
        </div>

        {/* Package grid — Airbnb listing grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-3xl bg-white shadow-card">
                <div className="h-56 rounded-t-3xl bg-soft" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-soft rounded-full w-3/4" />
                  <div className="h-3 bg-soft rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-white py-20 text-center shadow-card">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-soft">
              <Search className="h-7 w-7 text-muted" />
            </div>
            <h3 className="text-xl font-black text-ink">No packages found</h3>
            <p className="mt-2 text-sm text-muted">Try a different destination or clear the filter.</p>
            <button
              onClick={() => { useStore.getState().clearSearch(); useStore.getState().setActiveCategory('All'); }}
              className="mt-6 btn-primary"
            >
              Show all packages
            </button>
          </div>
        )}
      </div>

      <TrustSection />

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-[68px] left-3 right-3 z-20 overflow-hidden rounded-2xl shadow-modal md:hidden" style={{background:'linear-gradient(135deg,#222 0%,#333 100%)'}}>
        <div className="flex items-center justify-between gap-3 p-4">
          <div>
            <p className="text-sm font-black text-white">Free halal trip plan ✈️</p>
            <p className="mt-0.5 text-[11px] text-white/60">Reply within 2 hrs</p>
          </div>
          <a
            href="/trips"
            className="shrink-0 rounded-full bg-brand px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-dark"
          >
            Plan now →
          </a>
        </div>
      </div>
    </div>
  );
}
