---
status: implemented
date: 2026-09-02
tags: [website, search, dialog, accessibility, progressive-enhancement, design-system]
supersedes: []
amends: [ADR-0003, ADR-0073]
depends-on: [ADR-0003, ADR-0073]
implements:
  - src/components/SiteSearchDialog.astro
  - src/components/Header.astro
  - public/ui/design/search-dialog.css
---

# Add a progressively enhanced site-search dialog

## Context and problem statement

The global header currently exposes search as an icon link to `/search`. The search
page is useful for deliberate research because it supports summaries, metadata and
destination filtering, but opening a separate page is unnecessarily slow when a reader
only wants to jump to a known subject or route.

The site needs a fast search layer without creating a second search platform, hiding
authority and maturity information, weakening keyboard access, or turning the header
into an animated application launcher. The existing `/search` route must remain the
canonical rich-results view and the fallback when client-side enhancement is unavailable.

Fable 5.1 MAX produced a read-only interaction and visual specification on 2 September
2026. Fable was asked to work within the accepted OPDA design system and had no authority
to change routes, programme content, publication or deployment.

## Decision drivers

- Let readers jump directly to a known page without leaving their current context.
- Preserve one index, one ranking function and one vocabulary for search results.
- Keep `/search` available as a normal link, form target and shareable rich-results page.
- Provide complete keyboard, screen-reader, reduced-motion and forced-colour behaviour.
- Use the existing semantic tokens, restrained geometry and ink-and-amber visual language.
- Avoid remote search services, query tracking, search-history persistence and AI answers.
- Keep the implementation compatible with Astro client navigation.

## Considered options

### Keep the search page only

This is the simplest implementation and remains the fallback, but it makes quick
navigation slower and removes the reader from the page they are using.

### Replace `/search` with a client-only command palette

Rejected. It would make search dependent on JavaScript, reduce the value of shareable
filtered URLs and encourage application-style commands that are outside the site's
documentation purpose.

### Add a progressively enhanced native dialog

Chosen. The existing link still reaches `/search`; client-side code intercepts it only
after the dialog controller is ready. The dialog uses the same local search module and
offers direct navigation while preserving the full search page for deeper work.

## Decision outcome

The header search link will progressively enhance into a native `<dialog>` labelled
`Search the documentation`. Its visible shell will contain:

1. a real GET search form whose action is `/search` and whose field is named `q`;
2. an accessible live status line;
3. a listbox of ranked destinations;
4. a link to open the complete search page with the current query; and
5. compact keyboard guidance on desktop only.

The controller will dynamically import the existing `site-search.mjs` and its IA data on
first open, with an optional warm-up on trigger hover or focus. There will be no second
index or ranking implementation. A query typed during loading will run when the module
resolves. If loading fails, the dialog will say `Search couldn't load.` and retain the
working link to `/search`.

The initial help text will read `Use one or more words. Results match titles, summaries
and alternative terms.` The field label will remain `Search by task, topic or name`, with
the placeholder `Try governance, mapping or working groups`. Result and empty-state copy
will reuse the wording already owned by the search page.

Each compact result will show, in order:

- destination and facet;
- page title; and
- work area, authority and maturity.

Summaries and destination filters remain on `/search`. This keeps the overlay useful as a
quick-jump layer while retaining the evidence and governance context needed to judge a
result.

### Interaction contract

- The existing search icon remains an ordinary `/search` anchor and keeps its accessible
  name.
- `Command+K`, `Control+K` and `/` outside editable controls open the dialog. On `/search`,
  the shortcut focuses the page search field instead.
- Up and Down Arrow move the active result while DOM focus remains in the search field
  through `aria-activedescendant`.
- Enter follows the active result; Command+Enter or Control+Enter opens it in a new tab.
- Enter without an active result submits the real form to `/search?q=…`.
- Escape and a backdrop action close the dialog and return focus to its trigger.
- Tab order includes the input and the full-search link; result options are controlled
  from the input rather than becoming a long sequence of tab stops.
- The dialog closes before Astro swaps the current page and rebinds once on
  `astro:page-load`.

### Visual contract

On desktop, the panel will be no wider than 40rem, use the standard dialog elevation,
strong border and small design-system radius, and carry the four-pixel yellow structural
rule used elsewhere by the site. The backdrop uses deep ink at 60 percent opacity. The
result region scrolls independently and active results combine a selected surface with a
three-pixel inline rule, so selection never relies on colour alone.

At the 40rem breakpoint the dialog becomes a full-viewport sheet using `100dvh`, safe-area
insets and a labelled `Cancel` action. Keyboard hints disappear, while the full-search
link remains. Input text remains at least the base size to avoid mobile focus zoom.

Motion is limited to a short opacity and vertical entrance using shared duration and
easing tokens. There is no scale, blur, bounce, glass surface or ambient animation.
Reduced-motion users receive effectively immediate state changes.

The light and dark themes will use semantic surface, border, text, action and focus
tokens. Forced-colour mode will add an explicit active-option outline.

## Implementation boundary

The proposed implementation is limited to:

- a shared `SiteSearchDialog.astro` component;
- the existing `Header.astro` search trigger;
- a dedicated design-system search-dialog stylesheet, because the current component
  stylesheet is at its file-size limit;
- the design-system stylesheet manifest;
- focused search-dialog unit and browser coverage; and
- the search section of `DESIGN.md`.

`src/lib/site-search.mjs`, `src/lib/site-ia.mjs` and the `/search` information architecture
remain authoritative and should not be forked.

## Consequences

### Positive

- Common searches take fewer steps while the full search page remains intact.
- The overlay and rich view cannot disagree about ranking because they share one module.
- The search trigger retains a useful destination before enhancement and on failure.
- Native dialog semantics provide focus containment, Escape handling and inert page
  content with less custom code.
- Authority and maturity remain visible in compact results.

### Negative

- The header gains client-side state and Astro navigation lifecycle handling.
- Native dialog behaviour still needs cross-browser and mobile-keyboard verification.
- Compact results cannot carry the full summaries and controls available on `/search`.

### Neutral

- The existing search route and public URLs do not change.
- Search remains local and does not collect or transmit query history.
- This decision authorises repository implementation only, not publication or deployment.

## Confirmation plan

Implementation should confirm:

- ordinary link and GET-form fallbacks;
- first-open loading and import-failure recovery;
- keyboard opening, result navigation, activation, closure and focus return;
- accessible names, live status and listbox state;
- mouse, touch, small-screen and virtual-keyboard behaviour;
- light, dark, reduced-motion and forced-colour presentations;
- operation across Astro client navigation; and
- identical ranking between the dialog and `/search`.

## Implementation status

**Implemented 3 September 2026.** The shared dialog, header trigger, dedicated
design-system module, manifest entry and focused contract coverage are in place. The
controller imports `site-search.mjs` and `site-ia.mjs` only when needed, so the original
index and ranking remain authoritative. The data-backed Astro build completed successfully.

Focused verification covers the ordinary `/search` trigger destination, native dialog
semantics, GET fallback, shared dynamic imports, keyboard shortcut routing, active-result
state, Astro lifecycle rebinding, semantic tokens, mobile/reduced-motion/forced-colour
rules and the versioned stylesheet manifest. Manual visual and assistive-technology checks
remain appropriate release follow-up, particularly for mobile virtual keyboards.

## More information

- [ADR-0003: Idiomatic Astro refactor](./ADR-0003-idiomatic-astro-refactor.md)
- [ADR-0073: Adopt the OPDA brand and replace the website design system](./ADR-0073-adopt-opda-brand-and-replace-the-website-design-system.md)
- [`DESIGN.md`](../../DESIGN.md)
