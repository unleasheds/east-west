import type { LucideIcon } from 'lucide-react';
import {
  Globe, Waves, TreePalm, Users, Anchor, Heart, Sun,
  Building2, Moon, Mountain, UtensilsCrossed, Plane,
  Camera, Compass, MapPin, Star, Ship, Umbrella, Sunrise,
  Palmtree,
} from 'lucide-react';

export interface CategoryItem {
  label: string;
  iconName: string;
}

export const ICON_REGISTRY: Record<string, LucideIcon> = {
  Globe, Waves, TreePalm, Users, Anchor, Heart, Sun,
  Building2, Moon, Mountain, UtensilsCrossed, Plane,
  Camera, Compass, MapPin, Star, Ship, Umbrella, Sunrise,
};

export const PICKABLE_ICONS: { name: string; Icon: LucideIcon; label: string }[] = [
  { name: 'Globe',           Icon: Globe,           label: 'Globe'    },
  { name: 'Waves',           Icon: Waves,           label: 'Ocean'    },
  { name: 'TreePalm',        Icon: TreePalm,        label: 'Palm'     },
  { name: 'Users',           Icon: Users,           label: 'Family'   },
  { name: 'Anchor',          Icon: Anchor,          label: 'Island'   },
  { name: 'Heart',           Icon: Heart,           label: 'Romance'  },
  { name: 'Sun',             Icon: Sun,             label: 'Summer'   },
  { name: 'Building2',       Icon: Building2,       label: 'City'     },
  { name: 'Moon',            Icon: Moon,            label: 'Ramadan'  },
  { name: 'Mountain',        Icon: Mountain,        label: 'Nature'   },
  { name: 'UtensilsCrossed', Icon: UtensilsCrossed, label: 'Food'     },
  { name: 'Plane',           Icon: Plane,           label: 'Flight'   },
  { name: 'Camera',          Icon: Camera,          label: 'Photo'    },
  { name: 'Compass',         Icon: Compass,         label: 'Explore'  },
  { name: 'MapPin',          Icon: MapPin,          label: 'Location' },
  { name: 'Star',            Icon: Star,            label: 'Premium'  },
  { name: 'Ship',            Icon: Ship,            label: 'Cruise'   },
  { name: 'Umbrella',        Icon: Umbrella,        label: 'Beach'    },
  { name: 'Sunrise',         Icon: Sunrise,         label: 'Sunrise'  },
];

/** Auto-detect icon name from a label string (backward compat with old string-only DB rows) */
export function autoIconName(label: string): string {
  const map: Record<string, string> = {
    all: 'Globe', maldives: 'Waves', malaysia: 'TreePalm',
    indonesia: 'TreePalm', family: 'Users', island: 'Anchor',
    honeymoon: 'Heart', private: 'Sun', city: 'Building2',
    ramadan: 'Moon', dubai: 'Building2', turkey: 'Mountain',
    morocco: 'Mountain', vietnam: 'TreePalm', china: 'Building2',
    food: 'UtensilsCrossed', adventure: 'Mountain', cruise: 'Ship',
    beach: 'Umbrella', explore: 'Compass',
  };
  return map[label.toLowerCase()] ?? 'Globe';
}

export function getIcon(name: string): LucideIcon {
  return ICON_REGISTRY[name] ?? Globe;
}
