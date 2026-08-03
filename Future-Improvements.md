# Future improvements

What I'd do next with another week, roughly in priority order.

## Content and merchandising

- Real product photography, replacing the placehold.co placeholders used
  to seed the dev store.
- Currency to INR. Investigated this pass: it's gated behind connecting a
  real Shopify Payments account (Settings → Markets → currency override
  prompts "Complete account setup" for multi-currency) — genuine business/
  financial onboarding, not a settings toggle, so appropriately left
  undone rather than worked around. Everything else about the brand
  (copy, ₹-shaped pricing structure, "Free shipping across India") is
  ready for this the moment a real payments account exists.
- A `product_range` bonus section for the "every room, one shelf" strip
  from the prototype (the full 14-product scrolling range) — explicitly
  marked optional in the brief and cut for time.

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

- A full Lighthouse/PageSpeed Insights run, once the store is on a plan
  that allows lifting the storefront password. External crawlers can't
  authenticate past it, and that gate can't be disabled on an unpaid
  development store (confirmed this pass — the toggle exists in
  Preferences but is disabled). What's available in the meantime — real
  Navigation Timing measurements from an authenticated session — is in
  [Performance-Notes.md](Performance-Notes.md).
- Real product photography would also let LCP get measured meaningfully;
  placehold.co placeholders aren't representative of final asset weight.
- Keyboard-test the combos rail and reviews marquee with a screen reader
  (VoiceOver/NVDA), not just the accessibility-tree reasoning used here.

## AI workflow

- The CSV-import column-order failure (see [AI-Workflow.md](AI-Workflow.md))
  is exactly the kind of thing worth automating: a small local script that
  validates a Shopify product CSV's field count against its header before
  ever uploading it, so the mistake gets caught in a second, not after
  three round trips through the browser.
