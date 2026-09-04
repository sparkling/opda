---
status: implemented
date: 2026-09-02
updated: 2026-09-04
tags: [website, search, dialog, accessibility, progressive-enhancement, design-system]
supersedes: []
amends: [ADR-0003, ADR-0073]
depends-on: [ADR-0003, ADR-0073]
implements:
  - src/components/SiteSearchDialog.astro
  - src/components/Header.astro
  - src/pages/search.astro
  - src/scripts/site-search-page.ts
  - src/lib/site-search-model.mjs
  - src/lib/site-search.mjs
  - src/integrations/generate-site-search-index.mjs
  - public/ui/design/search-dialog.css
  - public/ui/design/search-page.css
---

# Add a progressively enhanced site-search dialog

> Update 2026-09-03 — search index schema version 3 records the canonical
> `/development/**` route family. The version change invalidates cached indexes
> containing retired `/spdtf/**` links; development then rebuilds the complete
> generated-page corpus from the resolved Astro routes.
>
> The canonical search page now uses the unreserved shared documentation shell,
> including its standard no-breadcrumb title spacing. Its query is presented
> without a separate promotional introduction or visible helper paragraph; an
> assistive-technology label continues to name the field.
>
> Update 2026-09-04 — the full search page uses the knowledge-base sections as
> its primary tabs: All, Ontology resources, Decisions, Programme, Governance,
> Modelling, Development, Working groups and Resources. Each tab supplies its
> own relevant filter set; sections without an orthogonal refinement do not
> repeat their destination as a page-type filter, while ontology resources and
> decisions retain their specialist filters. The shared
> filters use the page shell's existing collapsible left rail, which sits
> outside the max-width content track. The result register therefore retains
> the full content width and can use three columns on wide screens. Moving the
> filter panel into that rail preserves its established typography and
> disclosure styling; the rail label supplies the
> heading, avoiding a duplicated `Filter results` title inside it. The result
> count shares the tab row; when no
> applied-filter chips exist, their status strip, divider and reserved vertical
> space are omitted. The filter rail retains the shared standard width; its
> duplicate horizontal inset is removed so canonical labels and counts can use
> the available internal measure. Filter options use a clearer vertical rhythm,
> with each checkbox aligned to the first line of its label.
>
> Corpus review on 4 September also retired Page type from current facet selection,
> ranking and card labels. Its inferred route-family values duplicated Section or Collection
> and did not form a consistently authored taxonomy. Schema-3 page-type metadata
> remains accepted so existing templates and cached indexes continue to load;
> existing `pagetype` URLs retain their exact filter as a removable legacy chip.
>
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

The header search link will progressively enhance into a native `<dialog>` whose
accessible name is `Search documentation`. Its deliberately compact visible shell contains:

1. a real GET search form whose action is `/search` and whose field is named `q`;
2. a listbox of ranked destinations; and
3. a link to open the full search page with the current query.

The result count and loading state remain available through a visually hidden live region.
The quick-search surface has no visible heading, help paragraph, keyboard legend or close
icon; the input itself provides the visual purpose of the surface.

The controller will dynamically import the existing `site-search.mjs` and its IA data on
first open, with an optional warm-up on trigger hover or focus. There will be no second
index or ranking implementation. A query typed during loading will run when the module
resolves. If loading fails, the dialog will say `Search couldn't load.` and retain the
working link to `/search`.

The field keeps an accessible label and uses the concise placeholder `Search documentation`.
Empty-state copy reuses the wording already owned by the search page.

Each compact result will show, in order:

- destination and facet; and
- page title.

Summaries, destination filters, work area, authority and maturity remain on `/search`.
This keeps the overlay a quick-jump layer and reserves the richer evidence context for the
full search page.

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

On desktop, the panel will be no wider than the shared 64rem search-dialog token, use the standard dialog elevation,
strong border and small design-system radius, and carry the four-pixel yellow structural
rule used elsewhere by the site. The backdrop uses deep ink at 60 percent opacity. The
result region scrolls independently and active results combine a selected surface with a
three-pixel inline rule, so selection never relies on colour alone.

At the 40rem breakpoint the dialog retains a small viewport inset so the backdrop remains
an obvious pointer-dismissal target. The full-search link remains, and input text stays at
least the base size to avoid mobile focus zoom.

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
- The compact result presentation is quicker to scan than the rich search page.

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

**Updated 3 September 2026.** The quick-search surface was widened to 64rem and reduced
to its essential controls. The visible heading, close icon, instructional copy, keyboard
legend and verbose result metadata were removed. The accessible dialog name and live
status remain, while Escape and backdrop dismissal continue to return focus to the trigger.

The canonical `/search` page was also revised after a second read-only Fable 5.1 MAX
review. It now separates the visible result count from its debounced live announcement,
debounces shareable URL updates, uses native reset behaviour, gives results a consistent
heading structure, and provides clearer empty-state recovery. Its presentation lives in a
dedicated design-system module; the shared index and ranking function remain unchanged.

The same review exposed that the initial revision had retained the old row-list
composition and allowed article-level `h2` rules to override result titles. The results
are now full-track square register cards built on the shared card primitive, with a
bounded search toolbar and bottom-aligned authority facts. Indexing, ranking, URL state,
result semantics, announcements and recovery behaviour are unchanged.

**Updated 3 September 2026 (corpus-wide search).** A stakeholder review rejected the
five generic dropdowns (area, collection, content type, context, status) that the first
full-corpus revision had added. The search layer was redesigned around one shared data
model and now covers every emitted page, including each generated ontology resource.

- `src/lib/site-search-model.mjs` is the single facet vocabulary: result type
  (ontology resource, decision record, working group, page), collection (Property Pack
  ontology candidate, PDTF schema-derived ontology draft, PDTF JSON Schema input, ADR
  register, ODR register), working group or domain (the six bounded contexts plus the
  Common boundary, DBT Smart Data and Interoperability), ontology resource kind (class,
  object property, datatype property, SHACL node shape, SKOS concept scheme, SKOS
  concept, semantic context, source data point), and decision status. Every
  value is emitted by a current template; no facet implies an SPDTF ontology beyond the
  Property Pack candidate and the PDTF-derived draft.
- Page type is retained only as schema-3 compatibility metadata. The generated-corpus
  audit found that its route-derived values duplicated Section or Collection, while its
  few cross-section values combined unrelated purposes. It is therefore not exposed as
  a facet, included in ranking or shown on cards; existing `opda:search-page-type` tags
  and cached records still normalise safely during migration. Existing `pagetype` URLs
  preserve their exact filter through a removable legacy chip.
- Generated templates declare their facets through Layout's `search` prop, emitted as
  `opda:search-*` meta tags; the build integration reads those tags from every emitted
  page, applies route defaults from the model to everything else, merges the editorial
  aliases by URL, and writes a schema-version-3 index. Page authority and maturity are
  not duplicated into the index; cards read them from the IA status registry.
- `/search` is a native GET form whose section tabs and facet checkboxes form a
  shareable URL state. The tabs are the six canonical horizontal-navigation
  sections plus All, Ontology resources and Decisions; the six section tabs
  align with the global destination registry.
  Each tab exposes only meaningful facet groups, carries live counts computed
  with its own selection excluded, disables empty options, and becomes removable
  chips once applied. Filters use the same left-rail shell, collapse control
  and responsive drawer as section navigation; the rail remains outside the
  max-width content track. Results use three columns on wide screens and share
  one card anatomy with a variant rule
  and facts per result type. Heading, controls and cards use `minmax(0, …)` tracks
  aligned to the header content edge.
- The quick-search dialog now ranks through the same generated index via `searchSite`
  and shows each record's shared eyebrow, so both surfaces cannot disagree about
  ranking or vocabulary. The dialog shows the first twelve matches and links to the
  full count on `/search`.
- Development serves the same corpus without a build. The integration enumerates every
  page route through Astro's resolved-routes hook and each page's own `getStaticPaths`,
  renders the routes through the running dev server, runs the identical HTML extractor,
  and serves the result at `/data/site-search-index.json`. The first request waits for
  that crawl; later dev sessions serve the cached index from Astro's cache directory
  immediately while it refreshes. Verbatim HTML copied from `public/` (third-party tool
  output) is excluded in both environments, so production and development index the
  same Astro-rendered pages. The editorial entries remain only as the failure fallback.

Known metadata limits: PDTF-derived resources carry a DDD module, not a working-group
domain, so the domain facet excludes them by design; decision status is the only
filterable status because ontology and working-group statuses are uniform within their
collections and appear as card labels instead.

## More information

- [ADR-0003: Idiomatic Astro refactor](./ADR-0003-idiomatic-astro-refactor.md)
- [ADR-0073: Adopt the OPDA brand and replace the website design system](./ADR-0073-adopt-opda-brand-and-replace-the-website-design-system.md)
- [`DESIGN.md`](../../DESIGN.md)
