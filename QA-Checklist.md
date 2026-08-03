# QA checklist

Run against all eight sections (the five required, plus the three bonus
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
