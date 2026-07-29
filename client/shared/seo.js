/**
 * Single source of truth for every piece of SEO metadata on the site.
 *
 * This module is deliberately dependency-free ESM JavaScript so it can be
 * consumed by both sides of the stack:
 *   - the React app (Vite bundles it) for client-side route transitions;
 *   - `client/server.mjs`, the Node edge server, which injects the very same
 *     tags into the HTML shell before it ever reaches a crawler.
 *
 * Keeping one implementation is what guarantees the markup a social crawler
 * sees is identical to the markup a user's browser ends up with.
 */

export const SITE = {
  origin: 'https://eastwesthalaltravel.com',
  name: 'EastWest Halal Travel',
  shortName: 'EastWest',
  tagline: 'Muslim-friendly holidays, private tours and halal travel planning',
  twitter: '@eastwesthalal',
  email: 'info@eastwesthalaltravel.com',
  phones: ['+971569749429', '+9609411751'],
  socials: [
    'https://facebook.com/eastwesthalaltravels',
    'https://www.instagram.com/eastwesthalaltravels/',
  ],
  /** Fallback share image; overridden per package by the first gallery photo. */
  defaultImage: '/eastwest-logo.jpg',
  defaultImageWidth: 1200,
  defaultImageHeight: 630,
};

/** Locales the interface is translated into. `en` is the x-default. */
export const LOCALES = /** @type {const} */ (['en', 'ms', 'ar']);
export const DEFAULT_LOCALE = 'en';

/** BCP-47 tags used for `hreflang` and `og:locale`. */
const OG_LOCALE = { en: 'en_US', ms: 'ms_MY', ar: 'ar_AE' };
const HREFLANG = { en: 'en', ms: 'ms', ar: 'ar' };

// ─────────────────────────────────────────────────────────────────────────────
// URL helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalises any path into the canonical form we publish: absolute, no
 * trailing slash (except the root), no query string, no fragment.
 * @param {string} path
 * @returns {string}
 */
export function canonicalPath(path) {
  const clean = String(path || '/').split('#')[0].split('?')[0];
  const withSlash = clean.startsWith('/') ? clean : `/${clean}`;
  if (withSlash === '/') return '/';
  return withSlash.replace(/\/+$/, '') || '/';
}

/**
 * @param {string} path
 * @param {string} [locale]
 * @returns {string} Fully-qualified URL on the canonical origin.
 */
export function absoluteUrl(path, locale) {
  if (/^https?:\/\//i.test(path)) return path;
  const base = `${SITE.origin}${canonicalPath(path)}`;
  if (!locale || locale === DEFAULT_LOCALE) return base;
  return `${base}?lang=${locale}`;
}

/**
 * Language alternates for a page. Languages are distinct URLs via `?lang=`,
 * which Google accepts for hreflang and which matches how LanguageProvider
 * bootstraps its locale.
 * @param {string} path
 * @returns {{ hreflang: string, href: string }[]}
 */
export function alternateLinks(path) {
  const links = LOCALES.map((locale) => ({
    hreflang: HREFLANG[locale],
    href: absoluteUrl(path, locale),
  }));
  links.push({ hreflang: 'x-default', href: absoluteUrl(path) });
  return links;
}

// ─────────────────────────────────────────────────────────────────────────────
// Static route metadata
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {object} PageMeta
 * @property {string} title            Full <title>, brand suffix included.
 * @property {string} description      Meta description, ~150-160 chars.
 * @property {string} path             Canonical path.
 * @property {string} [image]          Absolute or root-relative share image.
 * @property {number} [imageWidth]
 * @property {number} [imageHeight]
 * @property {string} [imageAlt]
 * @property {boolean} [noindex]       Emits `noindex, nofollow`.
 * @property {'website'|'article'|'product'} [type]
 * @property {string} [locale]
 * @property {object[]} [jsonLd]       Structured-data graph nodes.
 * @property {string} [keywords]
 */

/** Routes that must never enter the index: personal, transactional or admin. */
export const PRIVATE_ROUTES = ['/wishlist', '/trips', '/profile', '/admin'];

/** @type {Record<string, { title: string, description: string, noindex?: boolean }>} */
const STATIC_ROUTES = {
  '/': {
    title: `Halal Travel Packages & Muslim-Friendly Tours | ${SITE.name}`,
    description:
      'Book verified halal holiday packages — Maldives island escapes, Malaysia family tours and private Muslim-friendly trips with prayer-friendly itineraries and halal food throughout.',
  },
  '/wishlist': {
    title: `Your Saved Halal Trips | ${SITE.name}`,
    description: 'Halal holiday packages you have saved for later.',
    noindex: true,
  },
  '/trips': {
    title: `Plan Your Halal Trip | ${SITE.name}`,
    description:
      'Tell us your destination, dates and budget and our team replies on WhatsApp with a free Muslim-friendly trip plan within two hours.',
    noindex: true,
  },
  '/contact': {
    title: `Contact EastWest Halal Travel — WhatsApp, Email & Offices`,
    description:
      'Talk to a halal travel expert. WhatsApp replies within two hours, offices in Malé, Maldives and Sharjah, UAE, and free Muslim-friendly trip planning with no booking fee.',
  },
  '/profile': {
    title: `Your Profile | ${SITE.name}`,
    description: 'Manage your EastWest Halal Travel account and preferences.',
    noindex: true,
  },
  '/admin': {
    title: `Admin | ${SITE.name}`,
    description: 'EastWest Halal Travel administration.',
    noindex: true,
  },
};

/**
 * Metadata for a non-package route.
 * @param {string} path
 * @returns {PageMeta}
 */
export function staticRouteMeta(path) {
  const key = canonicalPath(path);
  const route = STATIC_ROUTES[key];

  if (!route) {
    return {
      title: `Page Not Found | ${SITE.name}`,
      description: 'The page you are looking for is no longer available.',
      path: key,
      noindex: true,
      type: 'website',
      jsonLd: [organizationLd(), websiteLd()],
    };
  }

  const noindex = route.noindex === true || PRIVATE_ROUTES.includes(key);

  /** @type {object[]} */
  let jsonLd = [];
  if (key === '/') {
    jsonLd = [organizationLd(), websiteLd(), homeFaqLd()];
  } else if (key === '/contact') {
    jsonLd = [
      organizationLd(),
      contactPageLd(),
      breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: 'Contact', path: '/contact' },
      ]),
    ];
  } else if (!noindex) {
    jsonLd = [organizationLd(), websiteLd()];
  }

  return {
    title: route.title,
    description: route.description,
    path: key,
    noindex,
    type: 'website',
    image: SITE.defaultImage,
    imageWidth: SITE.defaultImageWidth,
    imageHeight: SITE.defaultImageHeight,
    imageAlt: `${SITE.name} — halal holiday packages`,
    jsonLd,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Package metadata
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {object} SeoPackage
 * @property {string} id
 * @property {string} [slug]
 * @property {string} title
 * @property {string} [type]
 * @property {string} destination
 * @property {string} location
 * @property {string} duration
 * @property {string} [price]
 * @property {number} [priceValue]
 * @property {string} description
 * @property {string[]} [images]
 * @property {string[]} [highlights]
 * @property {{day:number,title:string,activities:string[]}[]} [itinerary]
 * @property {string[]} [included]
 * @property {number} [rating]
 * @property {number} [reviewCount]
 * @property {boolean} [isHalalCertified]
 * @property {string} [updatedAt]
 */

/** Trims to a whole word and appends an ellipsis, so descriptions never cut mid-word. */
function truncate(text, max) {
  const flat = String(text || '').replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\s]+$/, '')}…`;
}

/** @param {SeoPackage} pkg */
export function packagePath(pkg) {
  return `/package/${pkg.slug ?? pkg.id}`;
}

/** Google truncates titles around 60-65 characters, so the brand suffix is
 * only added when it fits — losing the destination to make room for the brand
 * would be the wrong trade. */
function buildPackageTitle(pkg) {
  const base = String(pkg.title ?? '').replace(/\s+/g, ' ').trim();
  const destination = String(pkg.destination ?? '');
  const mentionsDestination =
    !destination || base.toLowerCase().includes(destination.toLowerCase());

  const withDestination = mentionsDestination ? base : `${base} — ${destination}`;
  const suffix = ` | ${SITE.shortName}`;

  if (withDestination.length + suffix.length <= 65) return withDestination + suffix;
  if (withDestination.length <= 65) return withDestination;
  return truncate(withDestination, 65);
}

/**
 * Metadata for a package detail page, including Product/Offer structured data.
 * @param {SeoPackage} pkg
 * @returns {PageMeta}
 */
export function packageMeta(pkg) {
  const path = packagePath(pkg);
  const halal = pkg.isHalalCertified === false ? '' : 'Halal-certified ';

  const title = buildPackageTitle(pkg);

  // Package titles frequently already carry the duration, so the description
  // leads with the facts a searcher scans for — where, how long, how much —
  // and only then the highlights that differentiate it.
  const lead =
    `${halal}${pkg.duration} in ${pkg.location}, ${pkg.destination}` +
    (pkg.price ? ` from ${pkg.price} per person` : '');
  const highlights = (Array.isArray(pkg.highlights) ? pkg.highlights : [])
    .slice(0, 2)
    .join(', ');
  const description = truncate(
    [lead, highlights].filter(Boolean).join('. ') || pkg.description,
    158,
  );

  const images = Array.isArray(pkg.images) ? pkg.images.filter(Boolean) : [];

  return {
    title,
    description,
    path,
    type: 'product',
    image: images[0] ?? SITE.defaultImage,
    imageWidth: images[0] ? undefined : SITE.defaultImageWidth,
    imageHeight: images[0] ? undefined : SITE.defaultImageHeight,
    imageAlt: `${pkg.title} — ${pkg.location}, ${pkg.destination}`,
    keywords: [
      `${pkg.destination} halal package`,
      `${pkg.destination} muslim friendly tour`,
      `halal ${pkg.type ?? 'holiday'} ${pkg.destination}`,
      pkg.location,
    ].join(', '),
    noindex: false,
    jsonLd: [
      organizationLd(),
      packageLd(pkg),
      breadcrumbLd([
        { name: 'Home', path: '/' },
        { name: pkg.destination, path: `/?destination=${encodeURIComponent(pkg.destination)}` },
        { name: pkg.title, path },
      ]),
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Structured data (schema.org JSON-LD)
// ─────────────────────────────────────────────────────────────────────────────

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    '@id': `${SITE.origin}/#organization`,
    name: SITE.name,
    alternateName: SITE.shortName,
    url: SITE.origin,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/icon-512.png'),
      width: 512,
      height: 512,
    },
    image: absoluteUrl(SITE.defaultImage),
    description: `${SITE.name} — ${SITE.tagline}.`,
    email: SITE.email,
    telephone: SITE.phones[0],
    sameAs: SITE.socials,
    areaServed: ['Maldives', 'Malaysia', 'Indonesia', 'United Arab Emirates', 'Turkey', 'Morocco'],
    knowsLanguage: ['en', 'ms', 'ar'],
    contactPoint: SITE.phones.map((telephone) => ({
      '@type': 'ContactPoint',
      telephone,
      contactType: 'customer service',
      availableLanguage: ['English', 'Malay', 'Arabic'],
    })),
  };
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.origin}/#website`,
    url: SITE.origin,
    name: SITE.name,
    description: SITE.tagline,
    publisher: { '@id': `${SITE.origin}/#organization` },
    inLanguage: LOCALES.slice(),
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE.origin}/?destination={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * @param {{ name: string, path: string }[]} trail
 */
export function breadcrumbLd(trail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/**
 * Product + Offer + AggregateRating for a holiday package. Product is used
 * rather than TouristTrip because only Product is eligible for Google's
 * merchant rich results, which is what drives the click-through here.
 * @param {SeoPackage} pkg
 */
export function packageLd(pkg) {
  const url = absoluteUrl(packagePath(pkg));
  const images = (Array.isArray(pkg.images) ? pkg.images : []).filter(Boolean);
  const rating = Number(pkg.rating) || 0;
  const reviewCount = Number(pkg.reviewCount) || 0;
  const price = Number(pkg.priceValue) || 0;

  /** @type {Record<string, unknown>} */
  const node = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: pkg.title,
    description: truncate(pkg.description, 900),
    url,
    sku: pkg.slug ?? pkg.id,
    category: `Halal Travel > ${pkg.destination} > ${pkg.type ?? 'Holiday'}`,
    brand: { '@type': 'Brand', name: SITE.name },
    ...(images.length > 0 ? { image: images.map((src) => absoluteUrl(src)) } : {}),
  };

  const features = [
    { name: 'Duration', value: pkg.duration },
    { name: 'Destination', value: `${pkg.location}, ${pkg.destination}` },
    ...(pkg.isHalalCertified === false
      ? []
      : [{ name: 'Halal certified', value: 'Yes' }]),
    ...(Array.isArray(pkg.included) && pkg.included.length > 0
      ? [{ name: 'Included', value: pkg.included.slice(0, 8).join(', ') }]
      : []),
  ];
  node.additionalProperty = features.map((feature) => ({
    '@type': 'PropertyValue',
    name: feature.name,
    value: feature.value,
  }));

  if (price > 0) {
    node.offers = {
      '@type': 'Offer',
      url,
      price: price.toFixed(2),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${SITE.origin}/#organization` },
    };
  }

  // Only emit a rating when real reviews back it — a fabricated
  // AggregateRating is a structured-data violation, not a ranking win.
  if (reviewCount > 0 && rating > 0) {
    node.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating.toFixed(1),
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return node;
}

/**
 * ItemList describing the packages visible on a listing page. Helps Google
 * understand the collection and can surface a carousel.
 * @param {SeoPackage[]} packages
 * @param {string} [path]
 */
export function itemListLd(packages, path = '/') {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${absoluteUrl(path)}#packages`,
    name: 'Halal holiday packages',
    numberOfItems: packages.length,
    itemListElement: packages.map((pkg, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(packagePath(pkg)),
      name: pkg.title,
    })),
  };
}

/**
 * Contact page with the two real trading locations. Consistent name/address/
 * phone data across the site is what lets Google connect the business to its
 * local listings, so these values must match the footer and contact page.
 */
export function contactPageLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${SITE.origin}/contact#contact`,
    url: absoluteUrl('/contact'),
    name: 'Contact EastWest Halal Travel',
    about: { '@id': `${SITE.origin}/#organization` },
    mainEntity: {
      '@type': 'TravelAgency',
      '@id': `${SITE.origin}/#organization`,
      name: SITE.name,
      email: SITE.email,
      telephone: SITE.phones[0],
      sameAs: SITE.socials,
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '18:00',
        },
      ],
      location: [
        {
          '@type': 'Place',
          name: 'RD Maldives Pvt. Ltd.',
          telephone: '+9609411751',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'M. Shaamy Villa, 3rd Floor',
            addressLocality: 'Malé',
            addressCountry: 'MV',
          },
        },
        {
          '@type': 'Place',
          name: 'EastWest Halal Travel — UAE',
          telephone: '+971569749429',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Sharjah Media City',
            addressLocality: 'Sharjah',
            addressCountry: 'AE',
          },
        },
      ],
    },
  };
}

/** FAQ block shown on the homepage — mirrors the copy rendered in TrustSection. */
export function homeFaqLd() {
  const faqs = [
    {
      q: 'Are EastWest holiday packages fully halal?',
      a: 'Yes. Every package is checked for halal-certified or Muslim-owned dining, prayer-friendly scheduling, alcohol-free accommodation options and family-appropriate activities before it is listed.',
    },
    {
      q: 'Do you arrange private and family-only tours?',
      a: 'We do. Private transfers, women-only or family-only excursions and privacy-conscious island resorts can be arranged for any package on request.',
    },
    {
      q: 'How quickly will I get a trip plan?',
      a: 'Send your destination, dates and budget and our team replies on WhatsApp with a free Muslim-friendly trip plan, usually within two hours.',
    },
    {
      q: 'Which destinations do you cover?',
      a: 'The Maldives, Malaysia, Indonesia, Dubai, Turkey and Morocco, with new halal-verified destinations added regularly.',
    },
    {
      q: 'Can I pay online?',
      a: 'Yes. Packages with published pricing can be booked and paid for securely by card on the site, or you can pay after confirming details on WhatsApp.',
    },
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Serialisation — used by the edge server to stamp tags into the HTML shell
// ─────────────────────────────────────────────────────────────────────────────

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** @param {unknown} value */
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

/**
 * JSON-LD must not be HTML-escaped (it is inside a script element), but it
 * must not be able to close that element either.
 * @param {unknown} value
 */
export function serialiseJsonLd(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

/**
 * Renders the complete `<head>` payload for a page as an HTML string.
 * @param {PageMeta} meta
 * @returns {string}
 */
export function renderHeadTags(meta) {
  const canonical = absoluteUrl(meta.path, meta.locale);
  // A 404 or a private page has no canonical URL to point at. Emitting one
  // would invite a crawler to treat the error page as the real destination.
  const emitCanonical = meta.noindex !== true;
  const image = absoluteUrl(meta.image ?? SITE.defaultImage);
  const robots = meta.noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  const locale = meta.locale ?? DEFAULT_LOCALE;

  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<meta name="googlebot" content="${robots}" />`,
    ...(emitCanonical ? [`<link rel="canonical" href="${escapeHtml(canonical)}" />`] : []),
  ];

  if (meta.keywords) {
    tags.push(`<meta name="keywords" content="${escapeHtml(meta.keywords)}" />`);
  }

  if (!meta.noindex) {
    for (const alternate of alternateLinks(meta.path)) {
      tags.push(
        `<link rel="alternate" hreflang="${escapeHtml(alternate.hreflang)}" href="${escapeHtml(alternate.href)}" />`,
      );
    }
  }

  tags.push(
    `<meta property="og:type" content="${escapeHtml(meta.type ?? 'website')}" />`,
    `<meta property="og:site_name" content="${escapeHtml(SITE.name)}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta property="og:image:alt" content="${escapeHtml(meta.imageAlt ?? meta.title)}" />`,
    `<meta property="og:locale" content="${escapeHtml(OG_LOCALE[locale] ?? OG_LOCALE.en)}" />`,
  );

  for (const other of LOCALES) {
    if (other !== locale) {
      tags.push(`<meta property="og:locale:alternate" content="${escapeHtml(OG_LOCALE[other])}" />`);
    }
  }

  if (meta.imageWidth && meta.imageHeight) {
    tags.push(
      `<meta property="og:image:width" content="${meta.imageWidth}" />`,
      `<meta property="og:image:height" content="${meta.imageHeight}" />`,
    );
  }

  tags.push(
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:site" content="${escapeHtml(SITE.twitter)}" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
    `<meta name="twitter:image:alt" content="${escapeHtml(meta.imageAlt ?? meta.title)}" />`,
  );

  for (const node of meta.jsonLd ?? []) {
    tags.push(
      `<script type="application/ld+json">${serialiseJsonLd(node)}</script>`,
    );
  }

  // Every generated tag is stamped with `data-seo`. On the first load these are
  // the server's tags; when the SPA navigates, the Seo component removes
  // everything carrying this marker before writing the next page's set. Without
  // it the client would append a second title, description and canonical on top
  // of the server-rendered ones.
  return tags.map((tag) => tag.replace(/^<([a-z]+)/i, '<$1 data-seo')).join('\n    ');
}
