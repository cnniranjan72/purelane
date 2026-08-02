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

Three bonus sections beyond the required five, built to the same
theme-editor-safe standard and easy to remove without breaking anything:

| Section | id | File |
|---|---|---|
| Ingredients | `#ingredients` | `sections/ingredients.liquid` |
| How it works | `#how-it-works` | `sections/how-it-works.liquid` |
| Why it works | `#why-it-works` | `sections/why-it-works.liquid` |

## Dev store

- URL: `https://purelane-jt05iiqz.myshopify.com`
- Storefront password: `troopod2026`
- Theme: "Purelane (dev)" — pushed, unpublished (the store's live theme
  is untouched)

Seeded with 10 products (8 core + 2 combo bundle products), including the
required sold-out (Herbal Floor Cleaner), no-image (Gentle Hydrating
Liquid Handwash), and extremely-long-title (Plant-Based Multi-Surface
Concentrate Cleaner…) cases. A "Bestsellers" collection groups the 8 core
products for the shop grid.

## Content wiring

The Shop section's Collection setting, both Combo blocks, and all four
Testimonial blocks are picked and saved on the live theme (not hardcoded —
merchants can repoint any of them the same way in the theme editor). None
of this is required for the page to render correctly: every section has a
real, intentional empty state if a picker is ever cleared.

## Cart, checkout and customer accounts

The cart page and cart notification use a new light scheme (`scheme-7`,
`config/settings_data.json`) instead of Dawn's flat white default, and both
are confirmed working end-to-end (add-to-cart updates the header count and
cart page in real time; quantity/remove run over AJAX).

This store uses Shopify's newer hosted **Customer Accounts** (accessed via
`/account`, served from `shopify.com/<id>/account`, not the theme). That
means `templates/customers/*.json` render nothing there — editing them was
a dead end. Branding for that surface, plus checkout, lives in **Settings
→ Customer accounts → Configurations → Edit → branding icon**; it's set
there to the same brand purple, Outfit and Inter fonts, not in theme code.

The footer newsletter form is Dawn's unmodified `{% form 'customer' %}` —
tested live with a throwaway email, confirmed a real `Subscribed` customer
record in Admin, then deleted the test record.

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
