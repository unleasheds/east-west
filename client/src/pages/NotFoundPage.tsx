import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Seo from '../components/seo/Seo';
import { staticRouteMeta } from '../lib/seo';
import { useLanguage } from '../i18n/LanguageProvider';

/**
 * Genuine 404. The edge server already returned a 404 status for this URL;
 * this only supplies the visible page and its noindex metadata.
 */
export default function NotFoundPage() {
  const { locale } = useLanguage();
  const meta = staticRouteMeta('/__not-found', locale);

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <Seo {...meta} />

      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-soft">
        <Compass className="h-7 w-7 text-muted" strokeWidth={1.8} />
      </div>

      <h1 className="text-3xl font-black text-ink">This page has moved on</h1>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted">
        The page you were looking for is no longer here. Our halal holiday
        packages are all still one tap away.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link to="/" className="btn-primary">
          Browse halal packages
        </Link>
        <Link to="/trips" className="btn-secondary">
          Plan a custom trip
        </Link>
      </div>
    </div>
  );
}
