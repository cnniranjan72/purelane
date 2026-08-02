# Metafield definitions

## Product: `reviews.rating` / `reviews.rating_count`

Namespace/key match the official **Shopify Product Reviews** app so the
shop card's rating line works immediately if that app is installed later,
with zero re-mapping in Liquid — this is what `snippets/card-product.liquid`
(Dawn's own, unmodified) already reads via `show_rating`.

| Namespace.key | Type | Used by |
|---|---|---|
| `reviews.rating` | Rating (scale 1–5) | `snippets/card-product.liquid` rating line |
| `reviews.rating_count` | Integer | Same, as "· 237 reviews" |

**Implementation note:** `reviews.*` turned out to be a Shopify-*reserved*
namespace — the Admin UI refuses to let a store manually create a
definition on it ("reserved for standard definitions"), confirming it's
provisioned automatically by a reviews app (e.g. Shopify Product Reviews),
not something a theme or merchant defines by hand. On this dev store no
reviews app is installed, so the metafield genuinely doesn't exist yet.

**Empty state (this is exactly that case, working as intended):** with the
metafield absent, `show_rating and card_product.metafields.reviews.rating.value != blank`
is false and the rating line simply doesn't render — never a fake
"★ 0.0 · 0 reviews." The moment a reviews app is installed and populates
real values, the same unmodified card starts showing them with no code
change. Documented as a finding, not left as a TODO — see
[Tradeoffs.md](Tradeoffs.md).

No other product metafields are needed. "Best seller" / "New" / "Top
rated" use product **tags** instead — see
[Architecture.md](Architecture.md#shop--product-grid-shop) for why tags
are the correct native field here rather than a metafield.
