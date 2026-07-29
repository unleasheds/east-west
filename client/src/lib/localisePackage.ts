/**
 * Typed access to the shared package localiser.
 *
 * The implementation lives in `client/shared/localise.js` so the React app and
 * the Node edge server resolve locale content identically.
 */

import { localisePackage, hasTranslation } from '../../shared/localise.js';
import type { Locale } from '../i18n/LanguageProvider';
import type { Package } from '../types';

const typedLocalisePackage = localisePackage as (pkg: Package, locale: Locale) => Package;
const typedHasTranslation = hasTranslation as (pkg: Package, locale: Locale) => boolean;

export {
  typedLocalisePackage as localisePackage,
  typedHasTranslation as hasTranslation,
};
