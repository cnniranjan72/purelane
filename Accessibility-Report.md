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

Re-measured after the palette was corrected to the reference's real
(light) scheme — the earlier table described the dark palette this build
no longer uses. Large text is held to 3:1 and normal text to 4.5:1, per
WCAG's own size thresholds.

| Element | Size | Ratio | Needs | |
|---|---|---|---|---|
| Body copy | 17.5px | **16.28:1** | 4.5 | ✅ |
| Section headings | 54px | **18.33:1** | 3 | ✅ |
| Kickers | 14px | **16.28:1** | 4.5 | ✅ |
| Hero accent word "LASTS" | 112px | **3.91:1** | 3 | ✅ |
| Bundle tier price | 26px | **3.91:1** | 3 | ✅ |
| Hero price label | 10px | **6.04:1** | 4.5 | ✅ |
| Shop discount | 12.5px | **6.04:1** | 4.5 | ✅ |
| Combo discount pill | 10px | **5.01:1** | 4.5 | ✅ |
| Combo "You save" pill | 9.5px | **6.04:1** | 4.5 | ✅ |
| Bundle tier tag | 10px | **5.01:1** | 4.5 | ✅ |
| Primary button label on teal gradient | 12.5px | **5.74:1** worst stop | 4.5 | ✅ |
| Trust bar label | 11px | **16.28:1** | 4.5 | ✅ |
| Footer link | 14.5px | **16.28:1** | 4.5 | ✅ |

**A real failure this measurement caught.** The reference's accent
(`#b8701c`) sits at **3.2–3.9:1** on these light surfaces. That clears the
3:1 bar for the huge hero word and the 26px tier price, but not the 4.5:1
bar for the small discount pills, save labels, price kickers and tier
tags — four small-text elements were failing AA. Rather than shift the
brand colour (and lose the visual match on the most visible element on
the page), a second token `--pl-accent-text` (`#8f5514`) now carries
*small* accent text only; it measures ≥5:1 everywhere it's used. The
large decorative uses keep the reference's exact hue.

The button-label figure is measured against both gradient stops, since a
single `background-color` lookup returns the page background and reports
a meaningless 1.04:1.

## Keyboard navigation — verified live

Tab order was walked on the published theme, not just reasoned about
from markup:

- **149 focusable elements** on the homepage (up from 52 as sections were
  added), starting with Dawn's built-in "Skip to content" link, then the
  brand mark → main nav → search → account → cart → hero CTAs → section
  content in visual order.
- The one `disabled` button on the page (Herbal Floor Cleaner's "Sold
  out") is correctly excluded from the tab sequence — it neither receives
  focus nor sits in a confusing gap in the order.
- Visible focus ring confirmed on-screen after real Tab key presses
  (screenshot-verified), not just present in CSS.
- **Zero dead links** — every `<a>` on the page has a real `href`; none
  are `#` or empty placeholders.

## Document structure — two real defects found and fixed

Both were caught by auditing the live DOM rather than reading markup:

- **Two `<h1>` elements.** Dawn wraps the header logo in `<h1>` on the
  index template, and the hero contributes its own. Two `<h1>`s on one
  page is both an SEO and a screen-reader-navigation problem. The header
  lockup is now a `<div>` — it's a link home, not the page's heading —
  leaving the hero as the single `<h1>`. Safe across templates because
  Dawn's product, collection, page, blog, search and 404 templates each
  supply their own `<h1>`.
- **A heading-level skip (h2 → h4).** The stat labels in "Why it works"
  were `<h4>` directly under the section's `<h2>`. Now `<h3>`.

Verified after: **1 `<h1>`, 0 level skips** across all 54 headings.

Where the reference has no visible heading (the "How it works" pillar
row), the section still carries a visually-hidden `<h2>` rather than
shipping a headingless section — matching the design without leaving a
hole in the document outline.

## Not yet verified

Testing with actual assistive-tech software (VoiceOver/NVDA) rather than
programmatic accessibility-tree/keyboard verification — that would
confirm what gets *announced*, which the checks above don't cover. See
[Future-Improvements.md](Future-Improvements.md).
