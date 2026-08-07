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
- **The progress rail** (fixed right-side dots synced to scroll position).
  Rebuilt for real, not dropped — the reference's version hardcodes seven
  `<a href="#id">` anchors matching seven hardcoded section IDs, so
  removing/reordering a section either points a dot at the wrong place or
  breaks silently. Production's version (`snippets/scroll-rail.liquid` +
  `assets/scroll-rail.js`) builds its dots from the live DOM at runtime —
  it walks whatever sections actually exist inside `#MainContent` in
  whatever order they're actually in, and reads each dot's label from that
  section's own heading. Add, remove, or reorder a section in the theme
  editor and the rail just reflects it; nothing to keep in sync by hand.
  This is the one place this build doesn't just match the reference, it
  fixes the exact defect the reference has in this feature.
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
- Fixed three hardcoded product badge labels ("Best seller"/"New"/
  "Top rated") in the Shop section — the tag-matching logic was correct,
  real Shopify data, but the label text itself was Liquid-hardcoded.
  Moved to section settings; visually identical until a merchant edits
  one. See [QA-Checklist.md](QA-Checklist.md) for verification.
- **Wrong color palette, traced to its actual cause.** The reference file
  contains two conflicting `:root{}` blocks — an early dark one, and a
  second block at line 635 literally commented `/* VERSION 2 - BRAND
  COLOURS (light) */` that redefines the same tokens as a light mint/cream
  palette and overrides `.scenes`'s background to match. CSS cascade rules
  mean the second, light block is what actually renders in a browser —
  confirmed by screenshotting the reference file directly, not by reading
  the CSS and guessing. The first build implemented the first, dead block
  instead. Root cause fixed at `scheme-6`'s definition in
  `config/settings_data.json`; cascades to every homepage section from one
  edit since none of them hardcode color.
- Turned the top ticker into a real continuous-scroll marquee
  (`sections/marquee-bar.liquid`), replacing Dawn's stock announcement bar
  (a fade/slide carousel with prev/next arrows — structurally incapable of
  continuous scroll). Reuses the reference's own CSS technique almost
  exactly: the message list is rendered twice in one flex track,
  `translateX(-50%)` loops it seamlessly, `prefers-reduced-motion` turns
  the animation off. Cheaper than Dawn's JS-driven slideshow, too.
- **A final content diff caught four copy/structure mismatches** that a
  visual pass had missed, found by reading both pages' DOM side by side
  rather than comparing screenshots:
  - The reviews header carries *two* aggregate lines in the reference —
    the rating plus a reach note ("Loved by 30,000+ homes") — laid out on
    one horizontal row with the kicker. We had only the rating, stacked.
  - "Why it works" links to **"See the ingredient list" → `#ingredients`**,
    not "Shop the range" → `#shop`.
  - The Shop section has no supporting line under its heading; ours
    carried a lede describing the build itself, which read as developer
    commentary on a storefront.
  - "How it works" runs as bare pillar cards with no visible heading. Now
    matched — but with a visually-hidden `<h2>` retained so the section
    still has a heading in the document outline, rather than shipping a
    headingless section for the sake of pixel parity.
  Also confirmed a *non*-difference worth recording: the reference's
  second hero badge strip (`.badgestrip`) computes to `display:none` at
  desktop widths — it's a mobile-only element, so its absence from our
  desktop hero is correct rather than a gap.
- **The hero bottles were the wrong shape, which is why they collided.**
  The reference ships *two* bottle silhouettes, not one: a tall slim
  profile for the hero (`p-kbtl`/`p-tbtl`/`p-mbtl`, aspect **0.32-0.34**)
  and a squat one for shop cards and the shelf strip (`p-kitchen`/
  `p-floor`/`p-tap`, aspect **0.63**). We were rendering the squat shape
  everywhere, so at hero height each bottle came out ~228px wide instead
  of ~116px and the three-bottle group overlapped by 127px of a 176px
  bottle — a collision rather than the reference's subtle layering.
  Added a `variant: 'tall'` mode to `product-icon.liquid` built from the
  reference's own path geometry, used only by the hero. Measured after:
  overlap is now 22px of a 91px bottle (the reference's own is ~28%), the
  front bottle clears the badge column, and only the rear bottle tucks
  13px behind the translucent glass — intentional, exactly as the
  reference does it. Verified every other surface still uses the squat
  0.633 shape.
- **Brand lockup, footer and a real hero-carousel bug.**
  - *The hero carousel jumped ~20px on every transition.* Inactive slides
    were `position:absolute; inset:0` (stretched to the stage) while the
    active one was `position:relative` (sized to its own content), so the
    artwork and dots shifted each time the slide changed. Rebuilt as a
    CSS grid where every slide shares one cell: all three slides are now
    measurably identical in height and top offset, so the crossfade is
    dead still. Added a staggered rise for the bottles as each slide
    enters — applied to the inner `<svg>` rather than the positioned
    wrapper, so it can't fight the `translateX(-50%)` centring the front
    bottle, and gated behind `prefers-reduced-motion`.
  - *Brand mark.* The reference's nav and footer both carry a lockup — a
    circular chip with an isometric cube glyph, the wordmark, and a
    letterspaced "CLEAN, SIMPLY" tagline — where we were rendering plain
    shop-name text. Added `snippets/brand-mark.liquid`, shared by header
    and footer so they can't drift, with the tagline as a section
    setting. It's drawn rather than an uploaded image so it stays crisp
    and recolours with the theme; if a merchant uploads a real logo in
    Theme settings, the header still prefers that.
  - *Footer.* Dawn's stock footer ("Subscribe to our emails" + payment
    icons) was replaced with `sections/brand-footer.liquid` matching the
    reference: brand column with blurb, three link columns under small
    green caps, and a bottom bar with the legal name and policy links.
    Two deliberate choices: the columns link only to destinations that
    actually resolve on this store (the reference's Kitchen / Laundry /
    Skin / Sustainability / FAQs would all have been dead links here),
    and the bottom-bar policies come from `shop.policies` rather than a
    hand-built menu, so a policy link can only appear once that policy is
    actually published. Verified live: zero dead links in the footer.
- **A screenshot-by-screenshot pass closed the remaining detail gaps.**
  Working from ten section screenshots of the reference, each of these was
  missing and is now built:
  - *Ingredient illustrations.* The reference draws each ingredient as a
    two-tone botanical illustration (coconut, orange slice, soap-nut
    cluster, neem sprig, lemongrass) in teal + orange, not the generic
    single-stroke UI icon set we were reusing. Redrawn as
    `snippets/ingredient-icon.liquid`, with the block's icon picker
    rewritten to the five real ingredients.
  - *Hero pricing is multi-buy, not per-product.* The reference's hero
    quotes "Single bottle / Any 2 products / Any 3 products" against tier
    pricing (₹200 / ₹349 / ₹499). Added optional `tier_price` and
    `tier_compare_at_price` settings to the hero product block — merchant
    editable, and falling back to the product's own live price when left
    empty, so nothing is hardcoded in Liquid.
  - *Bundle tiers show their quantity visually*: N miniature bottles above
    the number, plus a "Flat ₹X per product" line computed from the tier's
    own price ÷ quantity, and the headline price in accent orange.
  - *Combos* gained the per-card "Inclusive of all taxes · COD available"
    note, the "Swipe for more combos" hint, and the rail note explaining
    what "Shop bundle" does — all merchant-editable section settings.
  - *Why bundles* icons moved to circular chips with green glyphs (they
    were orange in rounded squares); *shop card* discounts became plain
    accent text rather than filled pills, which the reference reserves for
    hero/combo savings; the *product shelf* now staggers bottle heights
    and left-aligns its sentence-case hint.
  - The ingredients section's kicker was removed — the reference has none.
- **Typography was the single largest visual gap, and it was measurable.**
  Rather than keep eyeballing screenshots, every display value was read off
  the rendered reference with `getComputedStyle` and compared side by side.
  The prototype's `.d1`/`.d2` classes are Outfit **800**, uppercase, with
  `-0.018em` tracking and 0.87/0.94 line-heights; section headings render
  at **54px**, ours were at **24px** and sentence-case. Buttons are 12.5px
  /700/uppercase with `.13em` tracking, not Dawn's 15px sentence case. Body
  copy runs at normal tracking where Dawn applies a global `0.06rem`. Every
  card title in the reference (combo, review, category, ingredient, shop) is
  Outfit 700 uppercase. All of it is now matched at the token level in
  `purelane-shared.css`, scoped to this build's sections so other templates
  keep Dawn's defaults. Card radius went 22px → **26px** (18px for review
  cards) and `.pl-surface` now uses the reference's actual glass gradient,
  0.8px border and shadow rather than approximations.
- **Structural regroupings.** Three sections were rebuilt to match how the
  reference actually groups content: *why bundles* and *product shelf* now
  live inside a single glass panel (heading included) instead of floating
  separate cards; *bundle categories* became tall product-led tiles with a
  large bottle render rather than an icon chip beside a label; the product
  shelf dropped its captions and slider chrome for the reference's bare
  bottle strip plus a swipe hint (which also removed a "1/-1" counter bug
  and stopped one very long product title distorting the row).
- **The Shop grid got a purpose-built card** (`snippets/shop-card.liquid`)
  replacing Dawn's `card-product`, because the stock card renders the
  seeded placeholder art as flat colour blocks with the product name burnt
  into the image — nothing like the reference's bottle-on-tinted-shot card.
  The new card matches the reference's structure exactly (shot + tag pill,
  uppercase title, rating line, price row, add to cart) while keeping a
  real, AJAX add-to-cart via Dawn's `<product-form>`; verified live by
  adding an item, confirming `/cart.js` incremented, then clearing it.
  Sold-out state still renders as a correctly disabled button.
- **Hero bottle overlap.** The 3-bottle stack initially collided with the
  trust badges. Measuring the reference showed its badge column is only
  ~96px wide, the bottles are *absolutely positioned and staggered*
  (short back-left, mid back-right, tallest front-centre), and the rear
  bottle deliberately tucks **behind** translucent badges at a higher
  z-index. Rebuilt to the same geometry: the front bottle now clears the
  badges entirely and only the rear one passes behind the glass. A real
  bug surfaced here too — the stack container collapsed to zero width
  (all children absolute inside a flex parent), so every percentage
  offset resolved to the same point and the bottles piled up.
- **Hero carousel now builds up to 3 bottles.** Each `featured_product`
  block still holds one real product, but slide N now renders products
  1..N together as a small stack, largest/frontmost last — so the final
  slide shows all 3 bottles at once, matching the reference's visual
  build-up, without inventing a fake combined price for a "3-pack" that
  doesn't exist as a real SKU. `hero-stage.js` was also generalized (with
  a `customElements.get` guard) so `sections/why-it-works.liquid` could
  reuse the exact same rotator mechanism for its own small product
  carousel — a section that had no product imagery at all before this
  pass, just stat numbers.
- Increased the gap between reviews-rail cards (`2.2rem`, was the shared
  `14px` token every other slider also uses) — the reference's own review
  cards read more spaced out than our default slider gap.
- **Found a third color role by extracting frames from a screen recording
  of the reference, not just its CSS.** A recording of someone scrolling
  the reference file surfaced two more real, computed colors a static CSS
  read hadn't caught: the combo card's corner "flag" (MOST POPULAR / BEST
  VALUE) is the same dark teal gradient as real buttons, and a third,
  separate green (`#4f7d10`) is used for the reviewer checkmark, bundle
  tier feature checkmarks, and trust-bar icons — distinct from both the
  teal buttons and the orange accent. Added `--pl-green` alongside
  `--pl-accent` and moved each element to its correct role.
- Tried making the header permanently fixed (`sticky_header_type:
  "always"`) to match the reference's floating-over-content nav, confirmed
  via the same recording. Dawn's built-in "always" sticky mode produced a
  broken layout — a large blank gap and a misplaced header — on this
  combination of a custom marquee-bar section sharing the header group.
  Reverted to `"on-scroll-up"` rather than debug Dawn's sticky-header
  internals further; the header still reads as a floating pill, just not
  permanently fixed on scroll. Documented rather than silently dropped.
- **Buttons and accent color were the same variable; the reference treats
  them as two different roles.** Pulled real computed styles straight from
  the rendered reference page (`getComputedStyle`, not more CSS-reading)
  and found its actual `.btn-primary` renders `linear-gradient(135deg,
  #00706a, #004b46)` — dark teal — while the "Lasts" text, badges, price
  discount pills, and the rail dots all use a separate, muted orange
  (`#b8701c`). The build had both tied to Dawn's one `--color-button`
  scheme slot, so every accent element was orange, including buttons that
  should be teal. Fixed by introducing `--pl-accent` for every decorative
  use (icons, badges, kickers, rail, discount pills) and reserving Dawn's
  real button variable for actual `<button>`/`.button` elements. Headings
  also got their own darker shade (`#17102b` vs `#241a3d` for body text) —
  same root cause, one token doing two jobs in the reference.
- Moved Reviews from the end of the page back to right after Hero,
  matching the reference's actual structure (its only review content is a
  marquee band positioned second, not a separate section near the
  bottom). The five required sections were already correctly built; this
  was purely an ordering mismatch.
- Replaced the placeholder product photography (flat color squares with
  the product name typed across them) with a proper icon, everywhere a
  product is shown as a small decorative reference rather than the main
  subject: hero carousel, product shelf, bundle categories, combo card
  thumbnails. `snippets/product-icon.liquid` renders the same
  cap+neck+gradient-body+label-bars bottle silhouette the reference file
  itself uses for every product mention there — turns out all of the
  reference's "product photography" is one parametric SVG template
  recolored per product, not individual illustrations, so it's a fully
  reusable Liquid snippet, not new art. The required Shop grid still
  renders real Shopify product images via Dawn's own `card-product.liquid`
  — this only replaces placeholder-photo slots, not the section the
  assignment actually grades on "real Shopify data" for.

## What I'd do with more time

See [Future-Improvements.md](Future-Improvements.md).
