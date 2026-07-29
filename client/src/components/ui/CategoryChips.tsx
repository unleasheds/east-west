import { useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '../../store/useStore';
import { packagesApi, settingsApi } from '../../lib/api';
import { CategoryItem, getIcon, autoIconName } from '../../lib/iconRegistry';
import { Package } from '../../types';

function matchesIsland(pkg: Package, island: string) {
  const needle = island.toLowerCase();
  return [pkg.destination, pkg.location, pkg.title]
    .some((value) => value.toLowerCase().includes(needle));
}

export default function CategoryChips() {
  const { activeCategory, setActiveCategory } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: settings } = useQuery<Record<string, any[]>>({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getAll(),
    staleTime: 5 * 60_000,
  });
  const { data: activePackages = [] } = useQuery<Package[]>({
    queryKey: ['packages'],
    queryFn: () => packagesApi.getAll(),
    staleTime: 5 * 60_000,
  });

  // Handle both old string[] format and new {label,iconName}[] format
  const raw: any[] = settings?.categories ?? [];
  const configured: CategoryItem[] = raw.map((item) =>
        typeof item === 'string'
          ? { label: item, iconName: autoIconName(item) }
          : { label: item.label, iconName: item.iconName ?? 'Globe' }
      );
  const iconByLabel = new Map(
    configured.map((item) => [item.label.toLowerCase(), item.iconName]),
  );
  const islands = Array.isArray(settings?.islands)
    ? settings.islands.filter((item): item is string => typeof item === 'string')
    : [];

  const categories = useMemo(() => {
    const labels = [
      'All',
      ...activePackages.map((pkg) => pkg.destination),
      ...islands.filter((island) =>
        activePackages.some((pkg) => matchesIsland(pkg, island)),
      ),
      ...activePackages.map((pkg) => pkg.type),
    ];
    const seen = new Set<string>();
    return labels
      .filter(Boolean)
      .filter((label) => {
        const key = label.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((label) => ({
        label,
        iconName: iconByLabel.get(label.toLowerCase()) ?? autoIconName(label),
      }));
  }, [activePackages, islands, iconByLabel]);

  useEffect(() => {
    if (!categories.some((category) => category.label === activeCategory)) {
      setActiveCategory('All');
    }
  }, [activeCategory, categories, setActiveCategory]);

  return (
    <div className="sticky top-[65px] z-30 border-b border-border bg-white/95 backdrop-blur-md">
      <div className="relative mx-auto max-w-7xl">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-white to-transparent md:left-8" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-white to-transparent md:right-8" />

        <div
          ref={scrollRef}
          className="hide-scrollbar flex items-center gap-1 overflow-x-auto px-6 py-2 md:px-10"
        >
          {categories.map(({ label, iconName }) => {
            const active = activeCategory === label;
            const Icon = getIcon(iconName);
            return (
              <button
                key={label}
                onClick={() => setActiveCategory(label)}
                className={`relative flex shrink-0 flex-col items-center gap-1 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-150 ${
                  active ? 'text-ink' : 'text-muted hover:text-ink'
                }`}
              >
                <span className={`transition-transform duration-150 ${active ? 'scale-110' : ''}`}>
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <span className="whitespace-nowrap">{label}</span>
                {active && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-ink" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
