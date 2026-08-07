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
- Product artwork is **inline SVG**, not raster images, so the shop grid,
  hero, shelf, category tiles and bundle tier graphics cost zero image
  requests and zero layout shift — the `viewBox` reserves the box before
  paint. This replaced Dawn's `card-product` snippet (see
  [Architecture.md](Architecture.md)); the trade is a slightly larger HTML
  document against 20+ fewer round trips and no `srcset` decode work.
- The SVGs are emitted per instance rather than referenced via `<use>`, so
  the same bottle repeats in the document. It compresses well (the shapes
  are near-identical, which is ideal for gzip/brotli) but a `<symbol>` +
  `<use>` sprite would be the next optimisation if the catalogue grew much
  past the current 11 products — see
  [Future-Improvements.md](Future-Improvements.md).
- Any real merchant photography added later still flows through Dawn's
  responsive `image_tag` helpers, which the combo thumbnails already use.

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

## What was actually measured, and why it's partial

PageSpeed Insights/Lighthouse-as-external-crawler can't reach this store:
it needs an unauthenticated fetch, which the storefront password blocks,
and that password can't be disabled on a development store until it's on
a paid plan (the toggle exists in Admin → Online Store → Preferences but
is greyed out — confirmed, not assumed).

What's available from *inside* an already-authenticated session is the
browser's own Navigation Timing API, which doesn't need external access.
Measured against the published theme's homepage:

| Metric | Value |
|---|---|
| Time to first byte (TTFB) | ~830–855ms |
| DOMContentLoaded | ~2.1–2.4s |
| Full `load` event | ~2.5–3.3s |
| Total requests | 208 |

Two honest caveats on these numbers:

1. **Not a cold-load measurement.** This session reloaded the homepage
   dozens of times, so most requests were served from browser cache by
   the time this was measured — the real first-visit transfer weight is
   higher than what a warm-cache reading shows.
2. **FCP/LCP weren't captured.** The Paint Timing API returned no entries
   in this automated browser context across two attempts — a tooling
   limitation of the automation environment, not something to draw a
   performance conclusion from either way.

TTFB in the 800ms range is mostly Shopify's own platform response time on
a development store, not something theme code controls. The rest (DCL,
load) is consistent with the structural choices below, but isn't a
substitute for a proper first-visit Lighthouse run once the store can be
put on a plan — see [Future-Improvements.md](Future-Improvements.md).

The dev store also currently seeds placeholder images (placehold.co, not
final Shopify-CDN photography), so even a clean Lighthouse run today
wouldn't reflect final asset weight.
