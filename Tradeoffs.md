# Tradeoffs

What the prototype does that this build deliberately does not, and why.
Written for the assignment's "what you'd flag about the original file"
ask — this is the honest accounting, not a highlight reel.

## Dropped or simplified from the prototype

**The synchronized "scene depth" background system.** Every section in
`reference/purelane-homepage.html` shares one global water/gradient
background whose appearance depends on which `data-scene` a section
declares and where it sits in the DOM (`.scenes[data-d="1..4"]`). Hide or
reorder a section in the theme editor and the whole effect desyncs — this
directly contradicts "adding, removing, reordering... should never break
anything." Replaced with independent per-section theming via Dawn's
color-scheme system. Full reasoning in
[Architecture.md](Architecture.md#theme-editor-stability).

**The multi-layer turbulence SVG water animation.** Decorative only, not
merchant-editable, and a real cost: the prototype inlines several large
`<feTurbulence>`/`<feDisplacementMap>` filtered SVGs that are expensive to
paint and repaint on every scroll-driven depth change. Cut entirely in
favor of Dawn's own `image_behavior` (ambient/zoom-in) and color-scheme
gradients, which are cheap, reduced-motion-aware, and already theme-editor
safe.

**Hardcoded hero price tiers.** "Single bottle ₹200", "Any 2 ₹349", "Any 3
₹499" were typed directly into the HTML — text, not data. Replaced with
optional `featured_product` blocks that read real product price/compare-at.
See [Architecture.md](Architecture.md#hero-pricing-fix).

**Hand-drawn SVG product renders.** The prototype draws every bottle as a
bespoke inline SVG illustration (visible in the `#shop` cards in the
reference file). Production uses real Shopify product images — that's the
entire point of "products, prices and content come from the platform."
Placeholder product photography (flat-color squares via placehold.co) was
used to seed the dev store since no real photography exists yet; swap for
real photos before launch.

**Bundle tiers as static marketing copy, not products.** The "Build your
bundle" tiers (2/3/5 products, flat price) describe a pick-your-own flow,
not one purchasable SKU. Modeled as section blocks rather than product
references — see [Architecture.md](Architecture.md#bundles-bundles). If a
real bundle-builder app gets wired in later (e.g. one that assembles a
cart from picked products at a discounted price), this should move to
referencing that app's product/discount objects so price stays live
instead of merchant-maintained text.

**Full-page slider/quick-add complexity from Dawn's `featured-collection`.**
The Shop section is a purpose-built, leaner variant of Dawn's own
collection-grid section — desktop/mobile slider mode and bulk quick-order
were dropped since the brief's grid doesn't call for them, and Dawn's own
`featured-collection` section remains in the theme for anyone who wants
that fuller feature set on another page.

**Star ratings.** Card markup and the metafield namespace
(`reviews.rating` / `reviews.rating_count`) are wired up and ready, but no
reviews app is installed on this dev store, so no rating data exists to
show yet. Confirmed during implementation that `reviews.*` is a
Shopify-reserved namespace (the Admin UI refuses a manual definition on
it) — it's provisioned by a reviews app, not hand-created. This is the
correct, intentional empty state, not an unfinished feature; see
[Metafields.md](Metafields.md).

## What's *not* a tradeoff — real fixes

A few changes aren't compromises, they're corrections to things that would
have been wrong in production regardless of the assignment:

- Fixed hero heading line breaks (`<br>`-forced 3-line stack) that don't
  survive arbitrary heading text or narrow/wide viewports — now wraps
  naturally.
- Fixed an ARIA `role="tab"`/`aria-selected` pattern on the hero dots that
  had no matching tabpanel wiring — replaced with a correct, simpler
  pattern (see the accessibility fix commit).
- Fixed ambiguous heading hierarchy in the reviews section (no `<h2>` in
  that section at all) with a visually-hidden one.

## What I'd do with more time

See [Future-Improvements.md](Future-Improvements.md).
