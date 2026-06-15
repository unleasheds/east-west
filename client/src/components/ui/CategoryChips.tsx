import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '../../store/useStore';
import { settingsApi } from '../../lib/api';
import { CategoryItem, getIcon, autoIconName } from '../../lib/iconRegistry';

const FALLBACK: CategoryItem[] = [
  { label: 'All',      iconName: 'Globe'    },
  { label: 'Maldives', iconName: 'Waves'    },
  { label: 'Malaysia', iconName: 'TreePalm' },
  { label: 'Family',   iconName: 'Users'    },
  { label: 'Island',   iconName: 'Anchor'   },
];

export default function CategoryChips() {
  const { activeCategory, setActiveCategory } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: settings } = useQuery<Record<string, any[]>>({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getAll(),
    staleTime: 5 * 60_000,
  });

  // Handle both old string[] format and new {label,iconName}[] format
  const raw: any[] = settings?.categories ?? [];
  const categories: CategoryItem[] = raw.length > 0
    ? raw.map((item) =>
        typeof item === 'string'
          ? { label: item, iconName: autoIconName(item) }
          : { label: item.label, iconName: item.iconName ?? 'Globe' }
      )
    : FALLBACK;

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
