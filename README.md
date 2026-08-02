# Purelane — Shopify homepage

Production Shopify build of the Purelane plant-based homecare homepage,
for the Troopod AI Product Engineer assignment. Built on a clean Dawn
15.5.0 install; `reference/purelane-homepage.html` is the original
single-file prototype, kept for comparison — not the spec. See
[Architecture.md](Architecture.md) for what that means in practice.

## What's here

Five required sections, each a real Shopify section with its own schema,
built to survive the theme editor rather than just look right once:

| Section | id | File |
|---|---|---|
| Hero | `#hero-{id}` | `sections/hero.liquid` |
| Shop / product grid | `#shop` | `sections/shop.liquid` |
| Best-selling combos | `#combos` | `sections/combos.liquid` |
| Bundles | `#bundles` | `sections/bundles.liquid` |
| Reviews rail | `#reviews` | `sections/reviews-rail.liquid` |

Reusable pieces shared across them: `snippets/icon.liquid`,
`snippets/price-tag.liquid`, `snippets/section-heading.liquid`,
`snippets/badge-list.liquid`, `assets/purelane-shared.css`.

## Dev store

- URL: `https://purelane-jt05iiqz.myshopify.com`
- Storefront password: *(set one in Online Store → Preferences if the
  store doesn't already have one, and note it here before sending)*
- Theme: "Purelane (dev)" — pushed, unpublished (the store's live theme
  is untouched)

Seeded with 10 products (8 core + 2 combo bundle products), including the
required sold-out (Herbal Floor Cleaner), no-image (Gentle Hydrating
Liquid Handwash), and extremely-long-title (Plant-Based Multi-Surface
Concentrate Cleaner…) cases. A "Bestsellers" collection groups the 8 core
products for the shop grid.

## One-time setup still needed in the theme editor

Everything renders correctly without this (empty states are real, not
placeholders left in by accident) — this is the last wiring step, done
once in the Shopify Admin rather than in code:

1. **Shop section** → Collection setting → pick "Bestsellers".
2. **Combos section** → each "Combo" block → Combo picker → pick
   "Kitchen essentials" / "Complete home bundle".
3. **Reviews section** → each "Testimonial" block → Testimonial picker →
   pick one of the four seeded testimonials (Anita, Priya, Sunita, Rohit S.).

## Local development

```
npm install -g @shopify/cli
shopify theme dev --store=purelane-jt05iiqz.myshopify.com
```

`shopify theme check` should report 0 errors (8 pre-existing Dawn
warnings, none introduced by this build — verified after every change).

## Documentation

- [Architecture.md](Architecture.md) — data model decisions (theme
  setting vs. block vs. metafield vs. metaobject), reusable snippets, why
  the prototype's cross-section background system was replaced
- [Metafields.md](Metafields.md) / [Metaobjects.md](Metaobjects.md) —
  exact field definitions and why each exists
- [Tradeoffs.md](Tradeoffs.md) — what was cut or changed from the
  prototype, and why
- [Future-Improvements.md](Future-Improvements.md) — what's next with
  more time
- [QA-Checklist.md](QA-Checklist.md) — section-by-section verification,
  including sold-out/no-image/long-title/empty-state coverage
- [Accessibility-Report.md](Accessibility-Report.md) — keyboard, focus,
  contrast, reduced motion, and the two real bugs a self-review pass found
- [Performance-Notes.md](Performance-Notes.md) — image loading, CSS/JS
  scope, layout stability
- [AI-Workflow.md](AI-Workflow.md) — what was delegated, where it broke,
  what I'd systematize for twenty more of these

## Git history

Commits are organized by milestone (architecture → snippets → each
section → template wiring → fixes → docs), not squashed — `git log
--oneline` reads as the build order.
