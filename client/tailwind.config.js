/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── EastWest Halal Travel brand palette ────────────────────────
        // Extracted from https://www.eastwesthalaltravel.com
        // CSS vars: --tmp-primary-color / --tmp-btn-bg-initial-color etc.

        // Primary teal (nav, headers, links)
        brand:        '#316077',   // --tmp-primary-color
        'brand-dark': '#244B5A',   // hover (−15% luminance)
        'brand-light':'#EBF3F6',   // tinted background

        // Gold CTA (buttons, badges, accents)
        gold:         '#E4A853',   // --tmp-btn-bg-initial-color
        'gold-dark':  '#C98C38',   // gold hover
        'gold-light': '#FBF3E3',   // gold tinted bg

        // Secondary / dark
        charcoal:     '#26252C',   // --tmp-secondary-color
        badge:        '#F75D37',   // --wpte-badge-clr  (offer / highlight)

        // Halal-certified green (kept)
        halal:        '#22C55E',
        'halal-dark': '#16A34A',
        'halal-light':'#DCFCE7',

        // Neutrals from site
        sand:         '#EDEBE5',   // --tmp-section-bg-color
        soft:         '#F5F4F1',   // secondary surfaces
        ink:          '#191919',   // --tmp-heading-color
        muted:        '#767676',   // --wc-subtext
        body:         '#555050',   // --tmp-body-font-color
        border:       '#E7E8E9',   // --wpte-border-clr
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        card:       '0 2px 8px rgba(0,0,0,.08)',
        'card-hover':'0 6px 20px rgba(0,0,0,.14)',
        modal:      '0 20px 60px rgba(0,0,0,.22)',
        bar:        '0 -2px 12px rgba(0,0,0,.06)',
        topbar:     '0 2px 12px rgba(0,0,0,.06)',
      },
      fontFamily: {
        sans: ['"Inclusive Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      aspectRatio: {
        card: '4 / 3',
      },
    },
  },
  plugins: [],
};
