import { NavLink } from 'react-router-dom';
import { Search, Heart, Plane, MessageCircle, User } from 'lucide-react';

const NAV = [
  { to: '/',         label: 'Explore',  Icon: Search        },
  { to: '/wishlist', label: 'Wishlist', Icon: Heart         },
  { to: '/trips',    label: 'Trips',    Icon: Plane         },
  { to: '/inbox',    label: 'Inbox',    Icon: MessageCircle },
  { to: '/profile',  label: 'Profile',  Icon: User          },
];

export default function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 backdrop-blur-md shadow-bar md:hidden">
      <div className="grid grid-cols-5 px-1 pt-1" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
        {NAV.map(({ to, Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex min-w-0 flex-col items-center gap-0.5 px-0.5 py-1 transition-opacity ${
                isActive ? 'text-brand' : 'text-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`grid h-8 w-full max-w-11 place-items-center rounded-xl transition-all duration-150 ${
                    isActive ? 'bg-brand-light' : ''
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 transition-colors ${
                      isActive
                        ? label === 'Wishlist'
                          ? 'fill-brand stroke-brand'
                          : 'stroke-brand'
                        : 'stroke-current'
                    }`}
                    strokeWidth={1.8}
                  />
                </span>
                <span className={`w-full truncate text-center text-[9px] font-bold leading-tight ${isActive ? 'text-brand' : ''}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
