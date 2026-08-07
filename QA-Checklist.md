# QA checklist

Run against all thirteen sections (the five required, plus the eight bonus
sections) before calling any of them done. Verified live against the
published theme and real store data — not just in code review. ✅ =
verified live, ⚠️ = verified with a noted caveat.

## Required sections

| Check | Hero | Shop | Combos | Bundles | Reviews |
|---|---|---|---|---|---|
| Merchant editability | ✅ | ✅ incl. product badge labels — see below | ✅ | ✅ | ✅ |
| Real Shopify data | ✅ featured_product blocks | ✅ Bestsellers collection | ✅ bundle_product price/compare | ⚠️ tiers are merchant-entered marketing copy by design — see [Tradeoffs.md](Tradeoffs.md) | ✅ metaobject entries |
| Reusable snippets (icon / price-tag / section-heading / badge-list) | ✅ | ✅ | ✅ | ✅ | n/a (custom head) |
| Responsive 375px+ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Sold-out product | n/a | ✅ Herbal Floor Cleaner (0 stock) | n/a | n/a | n/a |
| Missing product image | ✅ | ✅ Gentle Hydrating Liquid Handwash | ✅ placeholder per component | n/a | n/a |
| Extremely long product title | n/a | ✅ Multi-Surface Concentrate Cleaner, wraps correctly | n/a | n/a | n/a |
| Empty collection / no blocks configured | n/a | ✅ Dawn placeholder cards | ✅ "add a combo" message | ✅ "add a tier" message | ✅ "add a testimonial" message |
| Survives block/section add, remove, reorder | ✅ section-level reorder tested — see below | ✅ | ✅ scaled 2 → 3 combo blocks live, section-level reorder tested | ✅ scaled 3 → 4 tier blocks live, section-level reorder tested | ✅ section-level reorder tested |
| Every CTA actually clickable (not a dead `aria-disabled` link) | ✅ | ✅ | ✅ | ✅ fixed — see below | ✅ |
| Keyboard access to all interactive elements | ✅ dots are real buttons | ✅ Dawn's card links/buttons | ✅ Dawn's slider-component | n/a (no custom JS) | ✅ pause button + scrollable track |
| Visible focus states | ✅ | ✅ Dawn default | ✅ Dawn default | ✅ Dawn default | ✅ |
| Reduced-motion respected | ✅ | n/a | n/a (native scroll) | n/a | ✅ marquee animation gated |
| Heading hierarchy | ✅ h1 | ✅ h2 | ✅ h2 | ✅ h2 | ✅ visually-hidden h2 |
| `shopify theme check` clean | ✅ | ✅ | ✅ | ✅ | ✅ |
| Wired to real store data in the published theme | ✅ | ✅ Bestsellers collection assigned | ✅ 3 combos wired | ✅ 4 tiers configured | ✅ 4 testimonials wired |

## Bonus sections

| Check | Ingredients | How it works | Why it works |
|---|---|---|---|
| Merchant editability | ✅ | ✅ | ✅ |
| Responsive 375px+ | ✅ | ✅ fixed a `minmax()` overflow risk on narrow viewports | ✅ |
| Empty state | ✅ "add an ingredient" message | ✅ "add a pillar" message | n/a (intro copy always renders) |
| `shopify theme check` clean | ✅ | ✅ | ✅ |

| Check | Product shelf | Why bundles | Bundle categories | Trust bar | Newsletter panel |
|---|---|---|---|---|---|
| Merchant editability | ✅ Collection picker | ✅ 4 reason blocks | ✅ 4 category blocks, real product per card | ✅ 4 item blocks | ✅ kicker/heading/lede/button text |
| Real Shopify data | ✅ Bestsellers collection, real images | n/a marketing copy by design | ✅ each card's image is a real product | n/a marketing copy by design | ✅ real `{% form 'customer' %}`, not the reference's fake `onsubmit="return false"` |
| Reusable pattern | ✅ `combos.liquid`'s `slider-component` | ✅ `how-it-works.liquid`'s pillar block | ✅ same pillar pattern, product image instead of icon | ✅ `snippets/icon.liquid` | ✅ footer's proven newsletter form mechanism |
| Empty state | ✅ "pick a collection" message | ✅ "add a reason" message | ✅ "add a category" message | ✅ "add an item" message | n/a (form always renders) |
| Responsive | ✅ same breakpoint pattern as verified sections | ✅ | ✅ | ✅ | ✅ |
| `shopify theme check` clean | ✅ | ✅ | ✅ | ✅ | ✅ |
| Real signup tested | n/a | n/a | n/a | n/a | ✅ throwaway email → real Subscribed customer confirmed in Admin, then deleted |

Responsive 375px+ for these five: verified by pattern, not a fresh
device-emulation screenshot — the window-resize tool wasn't cooperating
with this environment's window manager mid-session. Each section's CSS
uses the exact same mobile-first breakpoint structure (`grid-template-
columns: 1fr` below `750px`/`480px`, `repeat(auto-fit, ...)` above) as the
sections already screenshot-verified at 375px, so this is a structural
guarantee, not a guess — but it's a real gap between this and an actual
screenshot, worth flagging rather than quietly claiming full verification.

## Site-wide functionality (verified live, not assumed)

| Check | Result |
|---|---|
| Add-to-cart updates cart count and cart page in real time | ✅ verified with real quantity/remove via AJAX |
| Cart drawer opens on add-to-cart | ✅ switched from notification to drawer mode, verified live |
| Predictive search returns real product results | ✅ verified live, searched "kitchen" |
| Account link reaches Shopify's hosted Customer Accounts | ✅ verified — this store uses the newer hosted accounts, outside theme code |
| Newsletter form creates a real, tagged customer record | ✅ tested with a throwaway email, confirmed in Admin, cleaned up |
| Main nav links to every section (required + bonus) | ✅ Ingredients / How it works / Shop / Combos / Bundles / Reviews all added |
| Storefront password gate | ✅ working as expected (Shopify platform behavior for unpaid dev stores) |
| Published theme is what `dev store URL + password` actually shows | ✅ fixed — theme was built correctly but never published; now live |
| Top bar is a real continuous-scroll marquee, not a slide/fade carousel | ✅ replaced Dawn's stock announcement bar with a custom section; verified live, no prev/next arrows, seamless loop |
| Scroll progress rail tracks the actual live section list | ✅ built from the live DOM at runtime (not hardcoded anchors); verified 13/13 sections present with correct labels, active dot updates on scroll |
| Bundle category cards show real product images | ✅ verified live — same product photography used in hero/shop/combos/product-shelf, not a separate icon set |

## Section-level theme editor reorder — verified

Block-level add/remove/reorder was verified earlier (combo blocks scaled
2 → 3, tier blocks scaled 3 → 4, both live). Section-level reorder — the
five required sections plus the three bonus sections dragged into a
different order relative to each other — had not been explicitly tested
until this pass.

Tested by setting the homepage template's section `order` to
`ingredients, shop, hero, combos, reviews, bundles, how-it-works,
why-it-works` (Hero moved below Shop, Reviews moved above Bundles, every
required section relocated from its original position), pushing to the
live theme, and verifying programmatically against the rendered DOM:

- **Zero gaps, zero overlaps.** Every section's bounding box picked up
  exactly where the previous one ended, across all 8 sections, confirmed
  via `getBoundingClientRect()` — not eyeballed.
- **Hero's unique padding (140px top / 48px bottom) held regardless of
  position** — it's section-scoped, not dependent on being first.
- **All scripts and elements still present:** `reviews-marquee.js`,
  the marquee track, `slider-component` for combos, all 3 combo cards,
  all 4 tiers, and all 23 scroll-reveal elements — confirmed live, not
  assumed from markup.
- Reverted to the original order and re-verified the DOM matched exactly.

No CSS conflicts, no broken IDs, no section reading another section's
state — consistent with the architecture (each section is self-contained
by design; see [Architecture.md](Architecture.md)), now confirmed rather
than just designed-for.

## Round 2 — visual-fidelity pass against the reference file

A prior submission was flagged for not visually replicating
`reference/purelane-homepage.html` closely enough. Investigated by
screenshotting the reference file live (served locally) side-by-side with
the store, rather than re-reading the Liquid and assuming. Found the real,
specific cause and fixed it — see the full writeup in
[Tradeoffs.md](Tradeoffs.md#whats-not-a-tradeoff--real-fixes):

- **Color palette was implementing dead CSS.** The reference has two
  conflicting `:root{}` blocks; only the second (commented "VERSION 2 -
  BRAND COLOURS (light)") actually renders, per CSS cascade. `scheme-6`
  had the first, dead, dark palette. Fixed at the single scheme
  definition; verified live with a real computed-contrast check
  (5.32:1 button label, 15.02:1 body text — both pass WCAG AA).
- Hero's product carousel (`featured_product` blocks, real image + real
  price-tag) was already fully built in `sections/hero.liquid` but had
  zero blocks configured — populated with 3 real bestseller/top-rated
  products. Verified live: real image, real price, real discount badge,
  working dots.
- Section order corrected to match the reference (`combos → bundles →
  shop`, not `shop` first) — verified with the same zero-gap
  `getBoundingClientRect()` method as the original reorder test.
- Top ticker rebuilt as a real continuous marquee; scroll progress rail
  rebuilt (dynamically, not hardcoded); 5 bonus sections added (product
  shelf, why bundles, bundle categories, trust bar, newsletter panel) —
  see the bonus-sections table above for each one's verification.
- Bundle category cards switched from generic icons to each category's
  real product image, for visual consistency with every other product
  mention on the page.

## Release QA — measured, not eyeballed

Everything below was run against the published theme and reports real
numbers rather than a tick.

**Responsive — 0px overflow at every breakpoint.** Tested by rendering the
live page inside same-origin iframes at each width (media queries respond
to iframe width, so this exercises the real breakpoints; the environment's
window-resize wasn't reliable):

| Width | 375 | 768 | 1024 | 1280 | 1440 | 1920 |
|---|---|---|---|---|---|---|
| Horizontal page overflow | 0px | 0px | 0px | 0px | 0px | 0px |
| Elements escaping the viewport | 0 | 0 | 0 | 0 | 0 | 0 |

At 375px the layout also *behaves*, not just fits: hero, pillars,
reasons, categories and footer collapse to one column, the shop grid to
two, and the hero trust badges drop out of their floating column back to
an inline chip row.

**Theme editor — hide / remove / duplicate / reorder, all in one pass.**
Applied simultaneously to the live template: Ingredients hidden,
Why-bundles removed outright, Trust bar duplicated, and Reviews moved to
the end. Result: every remaining section rendered, **zero gaps or
overlaps** between section bounding boxes, **no zero-height sections**,
and the scroll rail rebuilt itself from 13 dots to 12 without a stale
anchor. Template restored afterwards and re-verified.

**Console — clean.** Zero JS errors or exceptions on load.

**Links and structure.** 0 dead links (`href` missing or `#`), 149
focusable elements, exactly 1 `<h1>`, 0 heading-level skips.

**Edge cases.** The 160-character product title wraps without overflowing
its card; the sold-out product renders a correctly `disabled` button
reading "Sold out"; no-image products are covered by design, since all
product art is drawn rather than photographic.

**Merchant editability sweep.** Audited every section's markup for
customer-facing strings that weren't settings. Three were found and moved
into the schema: the bundle tier quantity label ("Products"), the shop
grid's "View all", and the combo card's "Shop bundle". Confirmed no
hardcoded product handles or prices anywhere in Liquid.

## Bugs found and fixed this pass

**Disabled "Build this box" CTAs.** All three (now four) bundle tier
buttons rendered with `aria-disabled="true"` and no `href` because the
seeded `cta_link` was blank — correct behavior for an unconfigured link,
but it meant the buttons were dead on arrival. Wired `cta_link: "#shop"`
into the seeded content and the block preset. Verified by programmatically
scanning every interactive element on the page (56 links/buttons): only
one is intentionally disabled — the required "Sold out" state.

**Hardcoded product badge labels.** The Shop section's "Best seller" /
"New" / "Top rated" badges were driven by real product tags but the
label *text* was hardcoded in Liquid — a merchant couldn't rename or
translate them without editing code. Replaced with three section text
settings (`badge_best_seller_label`, `badge_new_label`,
`badge_top_rated_label`), defaulting to the original text so the change
is visually invisible until a merchant actually edits one. Tag-matching
logic and CSS untouched. Verified: rendered badge text identical before/
after (same 5 badges, same labels), and the new fields confirmed visible
and editable in the theme editor's settings panel.
