# Accessibility notes

Summary of what was checked and fixed. Full per-section detail is in
[QA-Checklist.md](QA-Checklist.md); this is the reasoning behind the two
real bugs found and fixed during a self-review pass (see
[AI-Workflow.md](AI-Workflow.md) for how they were found).

## Fixed during build

**Hero featured-product dots.** Originally `role="tab"` +
`aria-selected` with no matching `role="tabpanel"` — an incomplete ARIA
tab pattern is worse than no ARIA role at all, since it promises
keyboard/screen-reader behavior it doesn't deliver. Replaced with a plain
`role="group"` of labeled buttons using `aria-current`, and inactive
slides now get `aria-hidden="true"` so a screen reader only ever
encounters the one visible product.

**Reviews rail heading + accessible name.** The custom `<reviews-marquee>`
element had `aria-label="Customer reviews"` on itself — invalid, since
`aria-label` requires the element to carry an ARIA role first, and a
bare custom element has none. Moved the label to the scrollable track
(`role="region"`, the part that actually receives keyboard focus).
Separately, the section had no heading at all, meaning the review card
`<h3>`s appeared with no parent `<h2>` in the document outline — added a
visually-hidden `<h2>Customer reviews</h2>`.

## Reduced motion

Every animated piece is gated:

- Dawn's own `.scroll-trigger.animate--slide-in` reveal system (used by
  all five sections) is wrapped in `@media (prefers-reduced-motion:
  no-preference)` in `base.css` — under reduced motion, content simply
  renders in place, never hidden-then-revealed.
- Hero's `featured_product` auto-rotation checks
  `matchMedia('(prefers-reduced-motion: reduce)')` before starting the
  timer at all (`hero-stage.js`), and always stops on hover/focus
  regardless.
- Reviews rail's CSS `@keyframes` marquee only runs under
  `prefers-reduced-motion: no-preference`; the pause/play button and
  hover/focus pause exist independent of that media query, per WCAG 2.2.2
  ("Pause, Stop, Hide") — a media-query opt-out alone isn't a
  user-facing control.

## Keyboard and focus

- Hero CTAs, badge list, and dots are all real interactive elements
  (`<a>`/`<button>`), not `<div onclick>`.
- Combos rail reuses Dawn's `slider-component`, which is keyboard- and
  touch-scrollable and ships its own tested prev/next button focus
  handling.
- Reviews rail's scrollable track has `tabindex="0"` and a visible focus
  ring (`.reviews-rail__track:focus-visible`), so it's reachable and
  scrollable by keyboard even without the pause button.
- Shop grid, combos, and bundles all inherit Dawn's global
  `:focus-visible` button/link styles.

## Contrast

Computed live against the published theme (WCAG relative-luminance
formula, run against the actual rendered `getComputedStyle` colors, not
hex-math on paper):

| Pair | Ratio | AA (4.5:1) | AAA (7:1) |
|---|---|---|---|
| Body text on scheme-6 background (`#ECE6F7` on `#17102B`) | **17.23:1** | ✅ | ✅ |
| Accent color on scheme-6 background (`#F0A03C` on `#17102B`) | **9.80:1** | ✅ | ✅ |
| Button text on accent background (`#17102B` on `#F0A03C`) | **8.55:1** | ✅ | ✅ |

## Keyboard navigation — verified live

Tab order was walked on the published theme, not just reasoned about
from markup:

- **52 focusable elements** on the homepage, starting with Dawn's
  built-in "Skip to content" link, then logo → main nav (all 9 items,
  including the newly-added section anchors) → search → account → cart →
  hero CTAs → pillar links → shop grid.
- The one `disabled` button on the page (Herbal Floor Cleaner's "Sold
  out") is correctly excluded from the tab sequence — it neither receives
  focus nor sits in a confusing gap in the order.
- Visible focus ring confirmed on-screen after real Tab key presses
  (screenshot-verified), not just present in CSS.

## Not yet verified

Testing with actual assistive-tech software (VoiceOver/NVDA) rather than
programmatic accessibility-tree/keyboard verification — that would
confirm what gets *announced*, which the checks above don't cover. See
[Future-Improvements.md](Future-Improvements.md).
