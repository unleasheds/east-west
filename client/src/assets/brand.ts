/**
 * EastWest Halal Travel — Brand Color Tokens
 * Extracted from https://www.eastwesthalaltravel.com
 *
 * CSS vars on the live site:
 *   --tmp-primary-color:       #316077  (deep teal — nav, buttons, headers)
 *   --tmp-btn-bg-initial-color:#E4A853  (gold amber — CTA buttons, accents)
 *   --tmp-btn-bg-hover-color:  #26252C  (charcoal — button hover, secondary)
 *   --tmp-section-bg-color:    #EDEBE5  (warm sand — section backgrounds)
 *   --tmp-body-font-color:     #555050  (body text)
 *   --tmp-heading-color:       #191919  (headings)
 *   --tmp-background-color:    #FFFFFF  (page background)
 *   --wpte-badge-clr:          #F75D37  (badge / highlight orange)
 *   --wpte-star-clr:           #FFAE34  (star/rating yellow)
 */

export const brand = {
  // Primary palette
  primary:      '#316077',   // Deep teal — main brand colour
  primaryDark:  '#244B5A',   // Hover/active (−15% luminance)
  primaryLight: '#EBF3F6',   // Tinted bg

  // CTA / accent
  gold:         '#E4A853',   // Warm gold — primary CTA, badges
  goldDark:     '#C98C38',   // Gold hover
  goldLight:    '#FBF3E3',   // Gold tinted bg

  // Secondary
  charcoal:     '#26252C',   // Near-black secondary / hover
  badge:        '#F75D37',   // Highlight / offer badge
  star:         '#FFAE34',   // Rating stars

  // Neutrals (from site computed styles)
  bg:           '#FFFFFF',
  section:      '#EDEBE5',   // Warm off-white section bg
  ink:          '#191919',   // Headings
  body:         '#555050',   // Body text
  muted:        '#767676',   // Subtext
  border:       '#E7E8E9',   // Dividers

  // Status
  success:      '#22C55E',   // Halal-certified green (kept from design)
  successDark:  '#16A34A',
  successLight: '#DCFCE7',
} as const;

export type BrandColor = keyof typeof brand;
