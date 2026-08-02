# QA checklist

Run against all five sections (Hero, Shop grid, Combos, Bundles, Reviews
rail) before calling any of them done. Checked manually in the theme
editor and via code review; ✅ = verified, ⚠️ = verified with a caveat
(noted), ⏳ = not yet verified against a live/populated store.

| Check | Hero | Shop | Combos | Bundles | Reviews |
|---|---|---|---|---|---|
| Merchant editability (no hardcoded content a merchant would want to change) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Real Shopify data (not typed-in text pretending to be data) | ✅ featured_product blocks | ✅ collection | ✅ bundle_product price/compare | ⚠️ tiers are marketing copy by design, see Architecture.md | ✅ metaobject entries |
| Reusable snippets (icon / price-tag / section-heading / badge-list) | ✅ | ✅ | ✅ | ✅ | n/a (custom head) |
| Responsive 375px+ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Sold-out product | n/a | ✅ Dawn's card badge, verified against Herbal Floor Cleaner (0 stock) | n/a | n/a | n/a |
| Missing product image | ✅ falls back to plain image/nothing | ✅ Dawn's placeholder SVG, verified against Handwash product | ✅ placeholder SVG per component | n/a | n/a |
| Extremely long product title | n/a | ✅ Dawn's card wraps correctly, verified against Multi-Surface Concentrate Cleaner | n/a (only shows component thumbnails, not titles) | n/a | n/a |
| Empty collection / no blocks configured | n/a | ✅ Dawn placeholder cards | ✅ explicit "add a combo" message (fixed after first review, see AI-Workflow.md) | ✅ explicit "add a tier" message | ✅ explicit "add a testimonial" message |
| Survives block/section add, remove, reorder | ✅ no shared state | ✅ | ✅ | ✅ | ✅ |
| Keyboard access to all interactive elements | ✅ dots are real buttons | ✅ Dawn's card links/buttons | ✅ Dawn's slider-component | n/a (no custom JS) | ✅ pause button + scrollable track |
| Visible focus states | ✅ | ✅ (Dawn default) | ✅ (Dawn default) | ✅ (Dawn default) | ✅ (added, see accessibility fix commit) |
| Reduced-motion respected | ✅ image_behavior + carousel auto-advance | n/a | n/a (native scroll) | n/a | ✅ marquee animation gated, pause button always present regardless |
| Heading hierarchy (no orphaned h3 under a missing h2) | ✅ h1 | ✅ h2 via section-heading | ✅ h2 via section-heading | ✅ h2 via section-heading | ✅ visually-hidden h2 added (was missing) |
| `shopify theme check` clean | ✅ | ✅ | ✅ | ✅ | ✅ |
| Verified live in theme editor against real store data | ✅ | ⏳ collection not yet assigned in theme editor | ⏳ combo blocks not yet pointed at entries | ✅ (block-based, works with presets) | ⏳ testimonial blocks not yet pointed at entries |

## Known open items

The three ⏳ rows are the same open item: the Shop section's collection
setting and the Combos/Reviews sections' metaobject-reference block
settings need to be pointed at the "Bestsellers" collection and the
combo/testimonial entries created in the dev store, via the theme editor's
own pickers. Not a code gap — the sections already render correct empty
states without this — just the last manual wiring step. See
[README.md](README.md) for the exact steps.
