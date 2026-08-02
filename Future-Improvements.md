# Future improvements

What I'd do next with another week, roughly in priority order.

## Content and merchandising

- Real product photography, replacing the placehold.co placeholders used
  to seed the dev store.
- Set the store's currency/market to INR — the dev store defaults to USD,
  so prices currently render as "$349.00" instead of "₹349"; this is a
  store-settings change, not a theme change, but it's the single most
  visible gap between this build and the brand's actual intent.
- A `product_range` bonus section for the "every room, one shelf" strip
  from the prototype (the full 14-product scrolling range) — explicitly
  marked optional in the brief and cut for time.
- Wire the "Add to cart" quick-add buttons on the shop grid through to a
  cart drawer (Dawn ships one; the shop section's `quick_add: standard`
  setting already targets it, just needs a cart icon/drawer section added
  to the header).

## Architecture

- If a real bundle-builder experience gets built, migrate the Bundles
  section's tier blocks to reference actual bundle products (see
  [Tradeoffs.md](Tradeoffs.md)) so price/compare-at stay live instead of
  merchant-typed.
- A shared `snippets/card-shell.liquid` that combos and bundles could both
  build on top of, if a third card-shaped section gets added later — right
  now `price-tag.liquid` is the only piece actually shared three ways;
  the surrounding card markup differs enough between combos/bundles/shop
  that forcing a shared wrapper today would be premature abstraction.
- Automated visual regression coverage (Percy/Chromatic or similar) around
  the theme-editor-stability claims — right now that's verified manually
  (block add/remove/reorder in the editor) rather than in CI.

## Accessibility & performance

- Run an automated audit (axe-core or Lighthouse CI) once the store has
  real product images, to get real Core Web Vitals numbers instead of the
  structural/manual review this build relied on — see
  [Performance-Notes.md](Performance-Notes.md) for what was checked by
  hand.
- Keyboard-test the combos rail and reviews marquee with a screen reader
  (VoiceOver/NVDA), not just the accessibility-tree reasoning used here.

## AI workflow

- The CSV-import column-order failure (see [AI-Workflow.md](AI-Workflow.md))
  is exactly the kind of thing worth automating: a small local script that
  validates a Shopify product CSV's field count against its header before
  ever uploading it, so the mistake gets caught in a second, not after
  three round trips through the browser.
