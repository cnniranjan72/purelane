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

Scheme-6 (Purelane's brand scheme, see
[Architecture.md](Architecture.md#theme-wide)) pairs `#ECE6F7` text on
`#17102B` background — roughly 13:1, comfortably AA/AAA for any text
size. The accent color (`#F0A03C`, used for discount badges and the hero
accent word) on that same dark background is roughly 8:1. Button text
(`#17102B` on `#F0A03C`) is roughly 8:1. All checked well above the 4.5:1
AA threshold for normal text.

## Not yet verified

Screen-reader testing (VoiceOver/NVDA) against the live rendered page —
the above is verified by reading the accessibility tree and ARIA
semantics directly, not by listening to actual assistive-tech output. See
[Future-Improvements.md](Future-Improvements.md).
