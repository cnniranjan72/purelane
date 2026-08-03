# Tradeoffs

What the prototype does that this build deliberately does not, and why.
Written for the assignment's "what you'd flag about the original file"
ask — this is the honest accounting, not a highlight reel.

## Chrome that looked functional but wasn't

The prototype's own `<script>` block only wires five things: scroll-reveal,
the scene crossfade, the progress-rail sync, header/parallax on scroll, and
the hero/rotator carousels. Everything else with a `btn` or `href` class is
static markup with no behavior behind it. None of this is a knock on the
prototype — it's a design comp, not a build — but it's worth being precise
about what "taking it live" actually had to add, since these are exactly
the things a merchant's team would hit first:

- **Cart.** The header cart icon shows a hardcoded `<span class="dot">0</span>`
  badge and no `<a href>` at all — clicking it does nothing. Production has
  a real Dawn cart (page + notification), tested end-to-end: add-to-cart
  updates the header count and cart contents live, quantity/remove run over
  AJAX. See the [README](README.md#cart-checkout-and-customer-accounts).
- **Account/profile.** The account icon is an unlinked `<button>`. Production
  wires it to Shopify's real (hosted) Customer Accounts, branded to match.
- **Search.** The search icon is an unlinked `<button>`, no input, no
  results. Production uses Dawn's real predictive search — typing a query
  returns live product matches.
- **Reviews/"voices".** Five reviews, two of them attributed to "Verified
  buyer" as a placeholder, duplicated in markup for the marquee loop, with
  no way to add a sixth without editing HTML. Production reviews are
  metaobject entries a merchant picks from the theme editor.
- **Add-to-cart on product cards.** `<button class="btn btn-ghost btn-sm">Add
  to cart</button>` — no form, no variant ID, no handler bound to it
  anywhere in the script. Clicking is a no-op. Production cards are Dawn's
  real `card-product.liquid`, genuine add-to-cart forms against real
  variants, confirmed live (cart count increments, cart page reflects it).
- **Category filter links.** The footer's "Kitchen / Laundry / Home / Skin"
  links and the "Bundle categories" cards all point at the same `#shop`
  anchor regardless of which category you click — the filtering is implied
  by the labels, not real. Out of scope to fully rebuild (would need
  collection-per-category or tag-based filtering, a bigger content-model
  decision than this assignment calls for), but worth flagging rather than
  quietly leaving the same non-filtering behavior in place.
- **The progress rail** (fixed right-side dots synced to seven hardcoded
  section anchors via `syncRail()`). Structurally the same problem as the
  scene-depth system below: it's wired to fixed anchors, not to whatever
  sections actually exist, so removing/reordering a section either points a
  dot at the wrong place or breaks silently. Not rebuilt.
- **The hero background "suggests scroll but doesn't scroll."** The water
  layers use `translate3d` offset by `-y * depth` in a scroll handler, so
  in principle it's scroll-linked parallax. In practice most visitors never
  see that: it's cross-faded between four static gradient "scenes" rather
  than continuous motion, the second water layer and bubbles are switched
  off below 760px (`.wl-b,.bub{display:none}`), and the mouse-parallax half
  of the effect only runs above 1024px width — so mobile and touch users,
  the majority of traffic on a DTC site, get an almost-static background
  that's coded to look like it should be moving. Dropped in favor of
  Dawn's per-section color-scheme gradients — see the scene-depth
  writeup below for the theme-editor-survival argument, which was the
  primary reason, but this is the second, independent reason it wasn't
  worth rebuilding faithfully.

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
