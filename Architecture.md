# Architecture

How Purelane's homepage is built on Dawn, and — for every piece of content —
*why* it lives where it lives. Written before implementation, updated as
decisions change.

## Starting point

Dawn 15.5.0, clean install, cloned from `Shopify/dawn` at the `v15.5.0` tag
with its own git history stripped. Nothing removed, nothing forked into a
"custom theme" — we add sections/snippets/assets on top and reuse Dawn's
existing product-card, price, and image-handling primitives instead of
rebuilding them. `reference/purelane-homepage.html` is the original
prototype; it informs copy, tone and layout, not implementation.

## Data model decisions

The brief's instruction is to always ask "who edits this, how often, and
what's the smallest structure that scales" before picking a location. Below
is that reasoning per section.

### Hero

| Content | Location | Why |
|---|---|---|
| Heading, accent word, subheading | Section settings (text / text / richtext) | Edited rarely, always exactly one per page — a global setting would be wrong (only one hero), a metafield would be wrong (not tied to a product/collection). Section setting is the correct granularity. |
| CTA buttons | Blocks (`type: button`) | Prototype hardcodes exactly two buttons. Real campaigns need one, two, or three. Blocks make the count merchant-controlled and let the section survive add/remove without special-casing "button 2 missing." |
| Trust badges (Plant powered / Kids & pet safe / …) | Blocks (`type: badge`) | Same reasoning — the prototype hardcodes exactly 3, but a marketing team will want to swap seasonal claims (e.g. "Diwali offer") without a developer. Icon is a constrained `select` (see [Icon snippet](#reusable-snippets)), not free-text SVG, so merchants can't break markup. |
| Hero visual | Section setting `image` (image_picker), optionally overridden by a `featured_product` block | See [Hero pricing](#hero-pricing-fix) below. |

### Shop / Product grid (`#shop`)

| Content | Location | Why |
|---|---|---|
| Products shown | Real Shopify **collection**, picked via section setting (`collection` picker) | This is the whole point of "real Shopify data, not hardcoded." The section renders whatever is in the collection — sold out, missing image, and long-title products all flow through the exact same Liquid Dawn already ships, with the exact same empty-state handling. |
| Card markup | `snippets/shop-card.liquid` (purpose-built) | Started on Dawn's `card-product.liquid` and reskinned it, which was the right call while the cards showed photography. It stopped being right once the store's seeded art turned out to be flat colour blocks with the product name burnt into the image — Dawn's card renders `featured_media` and has no seam for substituting the drawn bottle the reference uses. The replacement is deliberately small: shot + tag pill, title, rating, price, add-to-cart. It keeps the parts that actually matter — a real `<product-form>` AJAX add-to-cart, the disabled sold-out state, and the empty-collection placeholder — rather than reimplementing Dawn's cart plumbing. |
| "Best seller" / "New" / "Top rated" pill | Product **tags** (`best-seller`, `new`, `top-rated`) | Native field merchants already use for organization and filtering. A metafield would duplicate what tags already do well; tags are also filterable/searchable for free. |
| Star rating + review count | Product **metafield**, `reviews.rating` / `reviews.rating_count` (the same namespace the official Shopify Product Reviews app writes to) | No native product field for this. Using the Product Reviews app's namespace means the section works immediately if the merchant installs that app, with no re-mapping. If absent, the rating block renders nothing — not a broken "★ 0.0". |

### Best-selling combos (`#combos`)

The hardest data-modeling decision on the page. A combo is not a product
attribute and not page copy — it's a merchandising object that bundles
several real products with its own price.

| Content | Location | Why |
|---|---|---|
| Combo (headline, included products, flag, savings copy) | **Metaobject** `combo` — see [Metaobjects.md](Metaobjects.md) | A combo is reused data with real structure (a list of product references + a bundle product reference + a flag), not a one-off block of text. Metaobjects give the marketing team a proper admin form to add a new combo, and the same combo entries could later be surfaced on a `/collections/combos` page without re-authoring content in a section block. |
| Combo price / compare-at / checkout | Real **product** the metaobject references (`bundle_product`) | The prototype hardcodes "₹499, was ₹897, save ₹398" as text. That number goes stale the moment a component price changes, and a marketing team cannot fix it without editing Liquid. In production this must be an actual sellable product (or a Shopify Bundles app bundle) with its own price/compare_at_price — the section reads `bundle_product.price` and computes the saving, it never stores a saving in text. |
| Which combos show, in what order | Section setting: list of `metaobject` references | Lets a merchant pick 5 combos out of a larger catalog and reorder them for the homepage specifically, without that being "all combos everywhere." |

### Bundles (`#bundles`)

| Content | Location | Why |
|---|---|---|
| Tier (label, quantity, price, compare-at, feature list, CTA) | Blocks (`type: tier`) | Unlike combos, these tiers aren't tied to specific products — "any 2 products, flat ₹349" describes a build-your-own flow, not a purchasable SKU. That makes it marketing copy the team tunes often (price changes, new tier), which is exactly what section blocks are for. Flagged in [Tradeoffs.md](Tradeoffs.md): if/when a real bundle-builder app is wired in, this should move to product references so price stays live. |
| "Most popular" highlight | Block setting (`checkbox`) | One flag, toggled per block — simplest correct mechanism, no need for a schema-level enum. |

### Reviews rail (`#reviews`)

| Content | Location | Why |
|---|---|---|
| Testimonial (quote, rating, author, product tag) | **Metaobject** `testimonial` — see [Metaobjects.md](Metaobjects.md) | Testimonials are exactly the kind of structured, reused-across-pages content metaobjects exist for — the same entry could appear on a product page or a future "Reviews" page without retyping it into a different section's blocks. A marketing team adds a new testimonial once, in one admin screen, and it's reusable everywhere. |
| Which testimonials show on the homepage | Section setting: list of `metaobject` references (falls back to "all" if none picked) | Same reasoning as combos — homepage curation without limiting the metaobject to homepage-only use. |

### Theme-wide

| Content | Location | Why |
|---|---|---|
| Brand colors (ink/deep/brand/accent) | Theme setting — new **color scheme** added to `config/settings_data.json` | Dawn's color-scheme system is exactly built for "brand palette, reused as a named scheme across sections." Hardcoding hex in section CSS would fight the theme's own settings UI and break dark/alternate-scheme support other sections rely on. |
| Icons (leaf, shield, sparkle, etc.) | `snippets/icon.liquid`, keyed by name | See below. |
| Top promo ticker | `sections/marquee-bar.liquid` in the header group | Dawn's stock announcement bar is a *slide carousel* — it fades between messages and cannot scroll continuously, which is what the reference does. Rather than fight it, this is a small purpose-built section using the reference's own technique: the message list rendered twice in one flex track with `translateX(-50%)`, which loops seamlessly and needs no JS at all. Messages remain merchant-editable blocks. |
| Footer | `sections/brand-footer.liquid` replacing Dawn's stock footer | Dawn's footer is built around a newsletter block, payment icons and social links; the reference's is a four-column brand/link/contact layout with a legal bar. Rewriting was less code than overriding. Two deliberate calls: link columns point only at destinations that actually resolve on this store (the reference's *Kitchen / Laundry / Skin / Sustainability / FAQs* would all be dead links here), and the legal-bar policy links come from `shop.policies`, so a link can only render once that policy is genuinely published. |
| Section progress rail | `snippets/scroll-rail.liquid` | See below — the one place this build deliberately diverges from the reference's implementation. |

## Reusable snippets

The prototype repeats the same markup blocks 4–10+ times with copy-pasted
SVG. Each repeat becomes one snippet, used by every section that needs it —
this is also the "if another client asked for this tomorrow" test from the
brief: these five are reusable on their own, independent of Purelane's
brand.

- **`snippets/icon.liquid`** — inline SVG by name (`leaf`, `shield`,
  `sparkle`, `check`, `arrow`, `star`), single source per icon instead of
  the prototype's dozens of inlined duplicate `<svg>` blocks.
- **`snippets/price-tag.liquid`** — price, compare-at, and computed
  discount %, used by shop cards, combo cards, and bundle tiers. Discount
  percentage is always computed from real `price` / `compare_at_price`, never
  typed in as text.
- **`snippets/section-heading.liquid`** — kicker + heading + optional rule +
  lede, used by shop, combos, bundles, and reviews. The prototype's
  `panel-head` block, currently pasted 4 times with drifting whitespace.
- **`snippets/badge-list.liquid`** — renders a block-driven row of
  icon+label badges, used by the hero and (optionally) trust-bar content.

Added while matching the reference's artwork and chrome:

- **`snippets/product-icon.liquid`** — the drawn bottle. The reference's
  "product photography" is one parametric SVG recoloured per product, so
  it's reproducible as a snippet rather than an asset. Ships **two**
  profiles because the reference has two: a tall slim bottle for the hero
  (aspect ~0.32) and a squat one for cards (~0.63). Used by the hero,
  shop cards, product shelf, bundle categories, combo thumbnails and the
  bundle tier count graphic.
- **`snippets/ingredient-icon.liquid`** — five two-tone botanical
  illustrations (coconut, orange peel, soap nut, neem, lemongrass). Kept
  separate from `icon.liquid` because these are illustrations with two
  fixed brand colours, not single-stroke `currentColor` UI glyphs.
- **`snippets/shop-card.liquid`** — the product card described above.
- **`snippets/brand-mark.liquid`** — cube chip + wordmark + tagline,
  shared by the header and footer so the lockup can't drift between them.
- **`snippets/scroll-rail.liquid`** (+ `assets/scroll-rail.js`) — the
  fixed dot rail. Builds itself from the live DOM at runtime rather than
  from a hardcoded anchor list, which is the one place this build fixes a
  defect in the reference rather than copying it: the prototype's rail is
  wired to seven fixed IDs, so reordering or removing a section leaves a
  dot pointing nowhere.

**Scroll-reveal:** Dawn already ships a theme-editor-safe reveal-on-scroll
system (`assets/animations.js` + the `.scroll-trigger.animate--slide-in`
class + `data-cascade`/`--animation-order`, gated globally by the
`animations_reveal_on_scroll` theme setting). Every new section reuses that
exact mechanism instead of the prototype's bespoke `.rv`/`.rv-d1..5` CSS —
same visual effect, but it already re-initializes correctly on
`shopify:section:load`/`reorder` in the theme editor, which a hand-rolled
version would have to reimplement to be safe.

## Hero pricing (fix)

The prototype's hero cycles through 3 hardcoded price tags ("Single
bottle ₹200", "Any 2 ₹349", "Any 3 ₹499") typed directly into the HTML.
That's marketing copy masquerading as a price — it will silently drift out
of sync the moment a real price changes, and a merchant has no way to fix
it without editing code.

Production version: an optional `featured_product` block type on the hero,
each pointing at a real product. When present, the hero shows that
product's live image/price/compare-at (computed discount %, not typed
text) instead of the static `image` setting. If the merchant doesn't add
one, the hero just shows the plain image — no broken state either way.
Multiple `featured_product` blocks cross-fade via a small JS enhancement;
without JS, the first one renders statically. Documented in detail in
[Tradeoffs.md](Tradeoffs.md).

## Theme-editor stability

The prototype ties every section together through a single `data-scene`
depth index driven by scroll position and DOM order (`.scenes[data-d="2"]`
etc.), so section 3's background depends on section 2 existing above it.
Hide or reorder one section in the theme editor and the whole visual system
desyncs.

Fix: each section owns its own background independently — no shared
cross-section state, no reliance on DOM order or sibling sections existing.
Every animation (reveal-on-scroll, marquee, cross-fade) is scoped to its own
section and re-initializes correctly whether the section is section #1 or
section #7, whether or not other sections above it are present. This is
the actual requirement ("adding, removing, reordering... should never break
anything, including the animations") driving the rebuild, not a stylistic
preference.

## What's deliberately not carried over

See [Tradeoffs.md](Tradeoffs.md) for the full list with reasoning. Briefly:
the multi-layer animated water/turbulence SVG background, the synchronized
"scene depth" system, and hand-drawn SVG product renders are prototype-only
set dressing — expensive to maintain, not merchant-editable, and (for the
turbulence SVGs) a real Core Web Vitals cost for close to zero merchant
value. Replaced with lighter, section-scoped equivalents or real Shopify
product images.
