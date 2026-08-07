# AI workflow notes

Written during the build, not reconstructed after — this is what actually
happened, including the parts that didn't work first try.

## What I delegated to the agent (Claude Code)

- **All Liquid/CSS/JS authoring** for the five sections, the shared
  snippets, and the color-scheme addition — end to end, not
  autocomplete-assisted.
- **Architecture decisions**, but structured as a forced first step: before
  writing any section, the agent had to write down, per piece of content,
  whether it belonged in a theme setting, section setting, block, product
  field, metafield, or metaobject, and why. That document
  ([Architecture.md](Architecture.md)) is what made five sections
  internally consistent instead of five different ad-hoc styles.
- **Store setup via the Shopify CLI and Admin UI**: pushing the theme,
  creating the Partner-connected dev store's product catalog, metaobject
  definitions, and metaobject entries, using `mcp__claude-in-chrome`
  browser automation rather than me clicking through the admin by hand.
- **Self-review**: after the first pass on hero/reviews-rail, the agent
  re-read its own markup for accessibility correctness (not just "does it
  render") and found two real bugs before I ever looked — see below.

## Where it failed, and what caught it

**The biggest one: building against CSS that never renders.** The first
submission was rejected for not visually matching the prototype. The
cause wasn't sloppiness in any single section — it was that
`reference/purelane-homepage.html` contains *two* `:root{}` blocks, and
the second (commented `VERSION 2 - BRAND COLOURS (light)`) overrides the
first. Reading the file top-down, as a model does, finds the dark palette
first and treats it as the answer. Every downstream decision inherited
that error. What eventually caught it was refusing to read the file at
all: serving it over `python -m http.server` and pulling
`getComputedStyle` off the rendered page. That one change turned a month
of "it still looks different" into a measurable diff — headings were
24px where the reference computes 54px, buttons weren't uppercase, and
the accent and button colours were two different roles I'd collapsed into
one variable. **The rule I'd keep: for any visual-fidelity work, the
source of truth is the rendered page, never the stylesheet.**

**A second instance of the same class of error.** Once colours were
right, the hero's three bottles still collided. I repositioned them three
times before measuring the reference's own geometry and finding it ships
*two* bottle silhouettes — tall/slim (aspect 0.32) for the hero, squat
(0.63) for cards. I'd used the squat one everywhere, so at hero scale
each bottle was ~228px wide instead of ~116px. No amount of repositioning
fixes a shape problem. Measuring first would have found it immediately.

**Bugs that only surfaced under a real checklist.** Working through a
release checklist at the end found three defects that neither visual
review nor `shopify theme check` had caught: a duplicate `<h1>` (Dawn
wraps the logo in one on the index template, and the hero adds another),
a heading-level skip, and a `SyntaxError: Identifier 'HeroStage' has
already been declared` thrown on every page load once two sections both
emitted the same script tag. All three were invisible in the browser.
Static analysis and screenshots don't catch document-structure or console
errors — you have to query the live DOM and read the console.

**A CSV import that silently misaligned columns.** Generating a Shopify
product CSV from memory of the column schema is the kind of task an LLM
is confidently wrong about — I wrote a header/row set that *looked* right,
uploaded it, and Shopify rejected it with `"manual" is not a valid price`,
which is a downstream symptom, not the actual bug. Guessing at the fix
(reordering columns to match what I recalled as Shopify's canonical
template) didn't fix it either — same error, same row. What actually
found it: writing a small Node script to parse the CSV myself and print
each row's field count against the header count. Three rows had an
un-quoted comma inside a `Body (HTML)` field, shifting every column after
it by one. The lesson generalizes: when a structured-file upload fails
with an opaque error, don't keep guessing at the schema — parse the file
locally and check the invariant (field count per row) directly.

**Wrong ARIA pattern, caught on self-review, not by the user.** The hero's
featured-product dots originally used `role="tab"`/`aria-selected` — a
plausible-looking pattern that's actually wrong without matching
`role="tabpanel"` wiring I hadn't written. Caught during a deliberate
"review your own accessibility work" pass, not because anything visibly
broke. Same pass caught `aria-label` on a custom element with no ARIA
role (silently ignored by the accessibility tree) and a reviews section
with no heading in the document outline. None of these would show up in
`shopify theme check` or a visual screenshot — they need someone (human or
model) deliberately reading the accessibility tree, not the render.

**Assumed a metafield namespace existed as advertised.** Planned to use
`reviews.rating` / `reviews.rating_count` to match the official Shopify
Product Reviews app. Turns out that namespace is Shopify-*reserved* — you
can't manually create a definition on it through the Admin UI. Found this
by trying to save the definition and reading the actual error message
("reserved for standard definitions") rather than assuming the plan was
right. Documented as a finding in [Metafields.md](Metafields.md) instead
of silently working around it.

**Browser-automation coordinate drift.** Clicking by fixed (x, y)
coordinates across multiple sequential form fields is fragile the moment
a textarea grows by a line or a toast banner shifts the layout — several
form fields ended up with concatenated garbage text before I switched to
element-reference clicks and keyboard Tab-navigation for multi-field forms,
which don't drift when layout shifts.

**A `theme push` silently overwrote live theme-editor picks.** After
wiring metaobject block selections (combos, testimonials) by hand in the
theme editor, a later `shopify theme push` deploying an unrelated CSS fix
re-uploaded the *local* `templates/index.json`, which had never had those
picks in it — wiping the live selections. The fix was mechanical
(`shopify theme pull` before any push that touches a JSON template file
after editor changes), but the real lesson is upstream: local repo state
and live theme state can silently diverge the moment anyone touches the
theme editor, and nothing warns you when a push is about to overwrite
that. Now treated as a standing rule, not a one-off fix.

**A disabled CTA shipped and wasn't caught until the user clicked it.**
The Bundles section's "Build this box" buttons rendered correctly in every
screenshot I took — but the seeded `cta_link` was blank, which correctly
triggers the component's own "unconfigured" state (`aria-disabled="true"`,
no `href`). Visually indistinguishable from a working button in a
screenshot; only shows up as a not-allowed cursor on actual hover, which I
never did. I verified sections *rendered*, not that every interactive
element was actually *clickable* — a real gap between "looks done" and
"is done" that a visual QA pass doesn't catch.

**Assumed theme templates controlled the account pages — they didn't.**
Planned to brand `templates/customers/*.json` to match the rest of the
site. Turns out this store uses Shopify's newer hosted Customer Accounts,
which serves `/account` from `shopify.com/<id>/account` entirely outside
theme code — editing those templates would have been silent, verifiable-
looking, and completely inert. Found by actually visiting `/account/login`
and watching it redirect off-domain, not by reading Dawn's file structure
and assuming. Branding lives in Admin → Settings → Customer accounts →
Configurations instead.

**Core Web Vitals couldn't be measured with the obvious tool.**
PageSpeed Insights/Lighthouse-as-external-crawler needs an unauthenticated
fetch of the page, which the storefront password blocks — and that
password can't be turned off on this store because Shopify gates *all*
development stores behind one until the store is on a paid plan (the
toggle in Preferences is present but disabled). Worth knowing before
promising a Lighthouse score as a deliverable: on an unpaid dev store, you
either measure via an already-authenticated session (Navigation Timing
API from within a real browser tab — got partial numbers this way, TTFB
and load timing, but Paint Timing/LCP didn't fire reliably in the
automated tab) or you wait until the store can go on a plan.

**Built everything correctly and still shipped a broken deliverable.**
The five sections, the metaobjects, the cart, all worked — but the
store's *live* theme was still stock Horizon the whole time, because
`shopify theme push` deploys a theme without publishing it. Anyone using
"Dev store URL and password" as instructed, without also knowing to add
`?preview_theme_id=...`, would have landed on an empty, uncustomized
store. Caught only because the user asked "should I publish this?" —
not because I checked. The artifact being correct and the deliverable
being correct are different claims, and I'd been verifying the first,
not the second.

## What I'd systematize for twenty more of these

- **A CSV validator script**, checked into the repo once, not
  reconstructed per project: parse the file, assert every row's field
  count matches the header, before ever uploading. Turns a three-round-trip
  browser debugging loop into a one-second local check.
- **The architecture-decision-first discipline** is the highest-leverage
  habit here and the one I'd keep non-negotiable: forcing "where does this
  data live and why" onto paper before Liquid gets written is what kept
  five sections coherent instead of five different guesses at Dawn
  conventions.
- **A standing accessibility self-review pass** as an explicit last step
  per section, not a discretionary one — every real bug found in this
  build came from that pass, not from `theme theme-check` (which caught
  zero of them; it validates Liquid syntax, not accessibility semantics).
- **Prefer keyboard navigation (Tab) over coordinate clicks** for any
  multi-field form filled via browser automation — it's immune to layout
  shift in a way pixel coordinates aren't.
- **`theme pull` before any `theme push` that touches a JSON template**,
  once the theme editor has been touched by hand even once. Treat local
  and live as diverged by default, not in sync by default.
- **Click every interactive element during QA, not just render every
  section.** A screenshot proves a button exists and looks right; it
  doesn't prove it has an `href`. This build shipped one disabled CTA that
  a full render-and-look pass never caught.
- **Verify the deliverable, not just the artifact, before calling
  something done.** "The theme is built correctly" and "the URL in the
  handoff doc actually shows it" are different checks — the second one
  is the one that failed here, silently, because nothing about the build
  itself was wrong.
- **Don't assume a platform surface is theme-controlled — check first.**
  Customer accounts, checkout, and increasingly other "core" pages are
  moving to Shopify-hosted UIs outside theme code on newer stores. A
  five-second visit to the actual URL would have caught this before any
  time went into a plan that assumed otherwise.
