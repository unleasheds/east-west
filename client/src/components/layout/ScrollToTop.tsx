import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Restores scroll position to the top on route change.
 *
 * Without this a visitor arriving on a package page from a listing lands
 * mid-document, which both reads as broken and inflates the measured
 * interaction-to-next-paint on the new route.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return null;
}
