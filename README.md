# Purelane — Shopify homepage

Production Shopify build of the Purelane plant-based homecare homepage,
for the Troopod AI Product Engineer assignment. Built on a clean Dawn
15.5.0 install; `reference/purelane-homepage.html` is the original
single-file prototype, kept for comparison — not the spec. See
[Architecture.md](Architecture.md) for what that means in practice, and
[Tradeoffs.md](Tradeoffs.md) for exactly what in the prototype didn't
survive contact with production (cart, search, account, add-to-cart were
all decorative there — real here).

**Live now:** `https://purelane-jt05iiqz.myshopify.com` (password
`troopod2026`) — the theme below is the store's actual published theme,
not a preview link.

## Page structure

```mermaid
flowchart TD
    Header["Header — nav to every section below"]
    Hero["① Hero — section.hero"]
    Ing["Ingredients — bonus"]
    How["How it works — bonus"]
    Why["Why it works — bonus"]
    Shop["② Shop grid — #shop"]
    Combos["③ Best-selling combos — #combos"]
    Bundles["④ Bundles — #bundles"]
    Reviews["⑤ Reviews rail — #reviews"]
    Footer["Footer — newsletter, links"]

    Header --> Hero --> Ing --> How --> Why --> Shop --> Combos --> Bundles --> Reviews --> Footer

    classDef required fill:#4B3A8F,color:#fff,stroke:#241A3D
    classDef bonus fill:#F4F0FB,color:#241A3D,stroke:#4B3A8F
    class Hero,Shop,Combos,Bundles,Reviews required
    class Ing,How,Why bonus
```

Every box is its own real Shopify section — independently addable,
removable, and reorderable in the theme editor without breaking the ones
around it. The five required sections (①–⑤) are the assignment's scope;
Ingredients, How it works, and Why it works are additional sections built
to the same standard, easy to delete if you only want the required five.

| # | Section | id | File |
|---|---|---|---|
| ① | Hero | `#hero-{id}` | `sections/hero.liquid` |
| — | Ingredients *(bonus)* | `#ingredients` | `sections/ingredients.liquid` |
| — | How it works *(bonus)* | `#how-it-works` | `sections/how-it-works.liquid` |
| — | Why it works *(bonus)* | `#why-it-works` | `sections/why-it-works.liquid` |
| ② | Shop / product grid | `#shop` | `sections/shop.liquid` |
| ③ | Best-selling combos | `#combos` | `sections/combos.liquid` |
| ④ | Bundles | `#bundles` | `sections/bundles.liquid` |
| ⑤ | Reviews rail | `#reviews` | `sections/reviews-rail.liquid` |

Reusable pieces shared across all eight: `snippets/icon.liquid`,
`snippets/price-tag.liquid`, `snippets/section-heading.liquid`,
`snippets/badge-list.liquid`, `assets/purelane-shared.css` (the `.pl-surface`
glass-card treatment and `.pl-tilt` hover depth every card in the build
shares).

## Content model

Nothing below is typed into Liquid as a string. Prices, images, and copy
that a merchant would want to change all come from real Shopify objects —
products, a collection, or one of two metaobject types.

```mermaid
flowchart LR
    subgraph Store data
        Collection[("Bestsellers\ncollection")]
        Product[("Products")]
        Combo[("combo\nmetaobject ×3")]
        Testimonial[("testimonial\nmetaobject ×4")]
    end

    subgraph Sections
        ShopSec["Shop grid"]
        CombosSec["Best-selling combos"]
        ReviewsSec["Reviews rail"]
    end

    Collection --> ShopSec
    Product -- "featured products" --> ShopSec
    Combo -- "bundle_product\n(price, compare-at)" --> Product
    Combo -- "components\n(thumbnails)" --> Product
    Combo --> CombosSec
    Testimonial -. "optional product ref" .-> Product
    Testimonial --> ReviewsSec
```

See [Metaobjects.md](Metaobjects.md) for exact field definitions and
[Architecture.md](Architecture.md) for the reasoning behind each
theme-setting-vs-block-vs-metafield-vs-metaobject call.

## Dev store

- URL: `https://purelane-jt05iiqz.myshopify.com`
- Storefront password: `troopod2026`
- Theme: **"Purelane (dev)" — published, live.** (It wasn't, initially —
  the build was correct but never made the store's active theme, which
  would have meant the URL above showed stock Horizon instead. Caught and
  fixed; see [AI-Workflow.md](AI-Workflow.md).)

Seeded with 11 products (8 core + 3 combo bundle products), including the
required sold-out (Herbal Floor Cleaner), no-image (Gentle Hydrating
Liquid Handwash), and extremely-long-title (Plant-Based Multi-Surface
Concentrate Cleaner…) cases. A "Bestsellers" collection groups the 8 core
products for the shop grid.

## Content wiring

| What | Wired to |
|---|---|
| Shop section's Collection | Bestsellers |
| Combo blocks (3) | Kitchen essentials, Complete home bundle, Hard water solution kit |
| Testimonial blocks (4) | Anita, Priya, Sunita, Rohit S. |
| Bundle tiers (4) | Starter (2), Most popular (3), Whole home (5), Bulk stock-up (7) |
| Main nav | Home, Catalog, Contact, Ingredients, How it works, Shop, Combos, Bundles, Reviews |

None of this is required for the page to render correctly — every section
has a real, intentional empty state if a picker is ever cleared. It's
wired because a merchant demoing this store shouldn't see empty states by
default.

## Cart, checkout and customer accounts

- **Cart:** drawer mode (`cart_type: "drawer"` in
  `config/settings_data.json`), a new light `scheme-7` on the cart page
  instead of Dawn's flat white default. Verified live end-to-end:
  add-to-cart opens the drawer, updates the header count, and quantity/
  remove run over AJAX on the cart page.
- **Search:** Dawn's real predictive search — verified live, returns
  actual product matches while typing.
- **Account:** this store uses Shopify's newer hosted **Customer
  Accounts** (`/account` redirects to `shopify.com/<id>/account`, entirely
  outside theme code — confirmed by visiting it, not assumed).
  `templates/customers/*.json` render nothing there. Branding for that
  surface, plus checkout, lives in **Settings → Customer accounts →
  Configurations → Edit → branding icon** — set to the same brand purple
  and Outfit/Inter fonts, just not through theme code.
- **Newsletter:** Dawn's unmodified `{% form 'customer' %}` in the footer.
  Tested live with a throwaway email, confirmed a real `Subscribed`
  customer record in Admin, then deleted the test record.

## Local development

```
npm install -g @shopify/cli
shopify theme dev --store=purelane-jt05iiqz.myshopify.com
```

`shopify theme check` reports 0 errors (8 pre-existing Dawn warnings, none
introduced by this build — verified after every change, 181 files
inspected).

## Documentation

| Doc | Covers |
|---|---|
| [Architecture.md](Architecture.md) | Data model decisions (theme setting vs. block vs. metafield vs. metaobject), reusable snippets, why the prototype's cross-section background system was replaced |
| [Metafields.md](Metafields.md) / [Metaobjects.md](Metaobjects.md) | Exact field definitions and why each exists |
| [Tradeoffs.md](Tradeoffs.md) | What was cut or changed from the prototype and why, including every piece of the prototype that looked interactive but wasn't (cart, account, search, reviews, add-to-cart) |
| [Future-Improvements.md](Future-Improvements.md) | What's next with more time, and which items turned out to be quick fixes vs. genuine platform gates (currency needs a real Shopify Payments account) |
| [QA-Checklist.md](QA-Checklist.md) | Section-by-section verification against real store data, plus a site-wide functionality table (cart, search, account, newsletter, nav) |
| [Accessibility-Report.md](Accessibility-Report.md) | Keyboard, focus, contrast, reduced motion, and the real bugs a self-review pass found |
| [Performance-Notes.md](Performance-Notes.md) | Image loading, CSS/JS scope, layout stability, and real (if partial) Navigation Timing measurements |
| [AI-Workflow.md](AI-Workflow.md) | What was delegated, where it broke, what I'd systematize for twenty more of these |

## Git history

Commits are organized by milestone (architecture → snippets → each
section → template wiring → fixes → docs), not squashed — `git log
--oneline` reads as the build order.
