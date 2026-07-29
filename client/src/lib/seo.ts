/**
 * Typed access to the shared SEO module.
 *
 * The implementation lives in `client/shared/seo.js` so that both this React
 * app and the Node edge server (`client/server.mjs`) run the exact same code.
 * This file only adds the TypeScript surface the app codebase expects.
 */

import {
  SITE,
  LOCALES,
  DEFAULT_LOCALE,
  PRIVATE_ROUTES,
  canonicalPath,
  absoluteUrl,
  alternateLinks,
  staticRouteMeta,
  packageMeta,
  packagePath,
  renderHeadTags,
  organizationLd,
  websiteLd,
  breadcrumbLd,
  packageLd,
  itemListLd,
  homeFaqLd,
} from '../../shared/seo.js';

import type { Package } from '../types';

export interface PageMeta {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  noindex?: boolean;
  type?: 'website' | 'article' | 'product';
  locale?: string;
  keywords?: string;
  jsonLd?: Record<string, unknown>[];
}

export type Locale = (typeof LOCALES)[number];

// The shared module is untyped JavaScript by design; these wrappers pin down
// the signatures the app relies on so misuse is caught at compile time.
const typedStaticRouteMeta = staticRouteMeta as (path: string) => PageMeta;
const typedPackageMeta = packageMeta as (pkg: Package) => PageMeta;
const typedPackagePath = packagePath as (pkg: Package) => string;
const typedRenderHeadTags = renderHeadTags as (meta: PageMeta) => string;
const typedItemListLd = itemListLd as (
  packages: Package[],
  path?: string,
) => Record<string, unknown>;
const typedBreadcrumbLd = breadcrumbLd as (
  trail: { name: string; path: string }[],
) => Record<string, unknown>;
const typedAbsoluteUrl = absoluteUrl as (path: string, locale?: string) => string;
const typedCanonicalPath = canonicalPath as (path: string) => string;
const typedAlternateLinks = alternateLinks as (
  path: string,
) => { hreflang: string; href: string }[];
const typedOrganizationLd = organizationLd as () => Record<string, unknown>;
const typedWebsiteLd = websiteLd as () => Record<string, unknown>;
const typedPackageLd = packageLd as (pkg: Package) => Record<string, unknown>;
const typedHomeFaqLd = homeFaqLd as () => Record<string, unknown>;

export {
  SITE,
  LOCALES,
  DEFAULT_LOCALE,
  PRIVATE_ROUTES,
  typedStaticRouteMeta as staticRouteMeta,
  typedPackageMeta as packageMeta,
  typedPackagePath as packagePath,
  typedRenderHeadTags as renderHeadTags,
  typedItemListLd as itemListLd,
  typedBreadcrumbLd as breadcrumbLd,
  typedAbsoluteUrl as absoluteUrl,
  typedCanonicalPath as canonicalPath,
  typedAlternateLinks as alternateLinks,
  typedOrganizationLd as organizationLd,
  typedWebsiteLd as websiteLd,
  typedPackageLd as packageLd,
  typedHomeFaqLd as homeFaqLd,
};
