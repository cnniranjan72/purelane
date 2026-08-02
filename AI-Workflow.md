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
