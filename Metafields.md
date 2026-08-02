# Metafield definitions

## Product: `reviews.rating` / `reviews.rating_count`

Namespace/key match the official **Shopify Product Reviews** app so the
shop card's rating line works immediately if that app is installed later,
with zero re-mapping in Liquid.

| Namespace.key | Type | Used by |
|---|---|---|
| `reviews.rating` | Rating (scale 1–5) | `snippets/card-product.liquid` rating line |
| `reviews.rating_count` | Integer | Same, as "· 237 reviews" |

**Empty state:** if either metafield is missing on a product (no reviews
app installed, or a product with genuinely zero reviews), the rating line
does not render — never a fake "★ 0.0 · 0 reviews." Checked with
`if product.metafields.reviews.rating`.

No other product metafields are needed. "Best seller" / "New" / "Top
rated" use product **tags** instead — see
[Architecture.md](Architecture.md#shop--product-grid-shop) for why tags
are the correct native field here rather than a metafield.
