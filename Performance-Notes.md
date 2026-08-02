# Performance notes

Core Web Vitals were treated as a build constraint, not a cleanup pass.
What was done, section by section.

## Images

- Hero's primary image (whichever renders — plain `image` setting or the
  first `featured_product` slide) is the section's likely LCP element: it
  loads eagerly with `fetchpriority: 'high'`, no `loading="lazy"`, and a
  real `sizes`/`widths` set so the browser fetches an appropriately-sized
  file rather than a full-resolution one. Subsequent hero slides (if any)
  load `loading="lazy"`.
- Shop grid reuses Dawn's `card-product` snippet unmodified, which already
  ships responsive `srcset`/`sizes` and lazy-loads every card past the
  first row (`lazy_load: forloop.index > columns_desktop`).
- Combo card thumbnails load `loading="lazy"` — they're below the fold on
  first paint for most viewports.

## CSS/JS

- No JS framework, no bundler-injected runtime. Each new script is a
  small, dependency-free custom element (`hero-stage.js`,
  `reviews-marquee.js`), loaded only by the section that needs it — the
  combos section adds zero new JS at all, reusing Dawn's already-loaded
  `slider-component`.
- `purelane-shared.css` (tokens + snippet styles) and one section-specific
  stylesheet per section are the only new CSS files; nothing is loaded
  globally that isn't used on the page rendering it, matching Shopify's
  own per-template asset loading.
- Reveal-on-scroll reuses Dawn's existing `assets/animations.js` instead
  of adding a second IntersectionObserver implementation.

## Layout stability (no CLS)

- Every custom image tag sets explicit `width`/`height` or relies on
  Dawn's own aspect-ratio-driven card markup, so images reserve their
  layout space before they load.
- Hero's `.hstage`/`.hero__stage` has an explicit `min-height` (via
  `clamp()` in CSS) so the featured-product cross-fade doesn't shift
  surrounding content as slides swap.

## What's unverified

No real Lighthouse/PageSpeed run has been done against the live store yet
— the dev store currently has placeholder images (placehold.co, not
optimized/CDN-native Shopify images at final size) and no traffic to
generate real field data. The structural choices above (lazy loading,
sizing, minimal JS) are the same choices that drive good Core Web Vitals
in production, but the actual numbers should be re-checked once real
product photography is in place. See
[Future-Improvements.md](Future-Improvements.md).
