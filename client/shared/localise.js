/**
 * Resolves a package's customer-facing text for a locale.
 *
 * Package copy lives in the database in English. The static UI dictionary in
 * LanguageProvider can only translate strings it knows at build time, so it can
 * never touch titles, descriptions, highlights or itineraries — which is why
 * those stayed English when the language was switched.
 *
 * Translations are stored per package under `translations[locale]` and merged
 * over the English source here. Fields merge individually, so a package
 * translated only as far as its title still renders a coherent page instead of
 * an empty one.
 *
 * Dependency-free ESM, like `seo.js`, so the React app and the Node edge server
 * (`server.mjs`) share one implementation — a crawler fetching `?lang=ar` gets
 * the same copy the browser renders.
 */

/**
 * @param {any} pkg
 * @param {string} locale
 * @returns {any}
 */
export function localisePackage(pkg, locale) {
  if (!pkg || locale === 'en' || !pkg.translations) return pkg;

  const t = pkg.translations[locale];
  if (!t) return pkg;

  return {
    ...pkg,
    title: text(t.title) ?? pkg.title,
    location: text(t.location) ?? pkg.location,
    duration: text(t.duration) ?? pkg.duration,
    description: text(t.description) ?? pkg.description,
    highlights: list(t.highlights) ?? pkg.highlights,
    included: list(t.included) ?? pkg.included,
    excluded: list(t.excluded) ?? pkg.excluded,
    itinerary: mergeItinerary(t.itinerary, pkg.itinerary),
  };
}

/** Treats blank or whitespace-only translations as "not translated". */
function text(value) {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed ? trimmed : undefined;
}

function list(value) {
  if (!Array.isArray(value)) return undefined;
  const cleaned = value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
  return cleaned.length > 0 ? cleaned : undefined;
}

/**
 * Itinerary days are matched by day number rather than array position, so a
 * partial translation still lines up with the right English days.
 */
function mergeItinerary(translated, source) {
  if (!Array.isArray(translated) || translated.length === 0) return source;

  const byDay = new Map(translated.map((day) => [day.day, day]));

  return (Array.isArray(source) ? source : []).map((day) => {
    const match = byDay.get(day.day);
    if (!match) return day;
    return {
      ...day,
      title: text(match.title) ?? day.title,
      activities: list(match.activities) ?? day.activities,
    };
  });
}

/** True when a locale has at least one non-empty field — drives the admin badge. */
export function hasTranslation(pkg, locale) {
  const t = pkg?.translations?.[locale];
  if (!t) return false;
  return Boolean(
    text(t.title) ||
      text(t.location) ||
      text(t.duration) ||
      text(t.description) ||
      list(t.highlights) ||
      list(t.included) ||
      list(t.excluded) ||
      (Array.isArray(t.itinerary) && t.itinerary.length > 0),
  );
}
