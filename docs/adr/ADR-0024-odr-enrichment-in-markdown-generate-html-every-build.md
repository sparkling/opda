---
status: accepted
date: 2026-05-29
tags: [website, odr, documentation, mermaid, diagramming, build-pipeline]
supersedes: [ADR-0023]
depends-on: [ADR-0015, ADR-0021, ADR-0022]
implements: []
---

# ODR enrichment lives in the markdown; HTML is generated from it every build

> **Mechanism updated 2026-05-29 (see [ADR-0025](./ADR-0025-tailwind-preflight-under-authoritative-design-system.md)).**
> The *decision* below stands — ODR content (incl. its ` ```mermaid ` diagrams) lives
> in the markdown and HTML is generated every build, nothing committed. Only the
> *mechanism* changed: ODRs now render through the Astro **`odr` content collection**
> (`render(entry)` → `<Content/>`, the same path as the manual) rather than the
> bespoke `marked` generator. `generate-odr-html.mjs` and the `set:html` serving are
> **retired**; ` ```mermaid ` fences become `<div class="mermaid">` via the
> `remarkMermaidFence` plugin. The "Implementation sketch" below describes the
> original (now-retired) `marked` approach and is kept for the record.

## Context and Problem Statement

[ADR-0023](./ADR-0023-build-time-odr-html-immutable-enriched.md) chose to freeze
each ODR's markdown, author Mermaid diagrams into a **separate committed HTML
artefact** (`docs/ontology/odr/_html/ODR-NNNN.html`), and serve that frozen file
forever (produce-once / freeze / commit / never-regenerate). Two pilot artefacts
(ODR-0001, ODR-0005) were produced this way.

In practice that model has a structural flaw: **the enrichment is divorced from
the canonical record.** The diagrams live only in the HTML; the ODR markdown —
the artefact people actually read, review, and diff in git — does not contain
them. The HTML and the markdown drift apart by construction, and the "single
source of truth" is split across two files with no mechanical link between them.

The Council's intent in enriching ODRs is to make *the decision record* read
visually. That value belongs in the record (the markdown), not in a derived
presentation layer. This ADR reverses ADR-0023's locus-of-enrichment decision.

## Decision Drivers

* **Single source of truth.** The diagrams should live where the decision lives — in the ODR markdown — so the canonical record is self-contained and the git diff shows the enrichment.
* **No derived-artefact drift.** Committing generated HTML (ADR-0023) is the classic anti-pattern; the markdown and HTML diverge silently.
* **Reuse the existing render path.** `client.js` already renders `<div class="mermaid">` client-side, now with lightbox + clickable nodes ([ADR-0022](./ADR-0022-make-manual-diagram-elements-clickable.md)). ODR pages should inherit it for free.
* **Immutability.** Accepted ODRs are frozen ([ODR-0001](../ontology/odr/ODR-0001-linked-data-council-methodology.md) §Immutability). Any enrichment must not constitute a substantive amendment.
* **Build cost is negligible.** Converting 18 markdown files to HTML on each build is trivial; freezing buys nothing.

## Considered Options

* **A — Render the ODR markdown directly via a content collection** (like the manual). Astro renders MD→HTML natively; no generator. Rejected here only because it gives less control over the curated page header (provenance note, meta pills, heading anchors) than a dedicated generator.
* **B — Generate HTML from the enriched markdown and commit it (frozen).** Keeps ADR-0023's in-git artefact but derives it from the MD. Rejected: reintroduces a committed derived artefact that can drift, for no benefit once the MD is canonical.
* **C — Enrich the markdown; generate HTML from it every build, gitignored (chosen).** Diagrams are authored into the ODR `.md`. A build-time generator converts each `.md` → an HTML fragment in `src/generated/odr/` (gitignored, regenerated every build); the page serves it via `set:html`. Nothing generated is committed.
* **D — Keep ADR-0023 (author + commit + freeze HTML).** Rejected: the enrichment is divorced from the canonical record (the motivating flaw).

## Decision Outcome

Chosen option: **C — enrich the markdown, generate HTML every build, do not commit
the output.** The ODR markdown is the single source of truth and carries its own
Mermaid diagrams. A build-time Astro integration (mirroring the ADR-0021 report
generator) converts each ODR `.md` to an HTML fragment under `src/generated/odr/`
(gitignored); `/modelling/odr/<id>` serves the fragment via `set:html`; the
diagrams render client-side through `client.js` (clickable + lightbox per
ADR-0022). This **supersedes ADR-0023**: the locus of enrichment moves from a
committed HTML artefact to the canonical markdown, and the refresh policy moves
from freeze-forever to regenerate-every-build.

### Immutability reconciliation

Adding diagrams to an accepted ODR's markdown edits a record that ODR-0001 calls
frozen. This is permitted under a narrow, explicit boundary:

* **Illustrative enrichment is non-substantive.** A diagram that *visualises
  content already present in the prose* (the options considered, the chosen
  outcome, a consequence/dependency graph) asserts nothing new and changes no
  decision. It is presentational — comparable to formatting or anchors — not an
  amendment.
* **Substantive change still requires a new ODR.** Any diagram (or text) that
  would assert a claim, relationship, or outcome not already in the record is
  out of scope for enrichment and must go through a superseding ODR. The
  enrichment must be *faithful to* the existing record, never extend it.

This boundary is the authoring contract for the enrichment work (one agent per
ODR): diagrams must derive strictly from the existing decision text.

### Implementation sketch

*Indicative; the implementing session owns the detail.*

* **Authoring** — diagrams are added to `docs/ontology/odr/ODR-NNNN-*.md` as plain
  ` ```mermaid ` fenced blocks (2–4 per ODR), authored via the `/diagramming`
  skill, illustrating the decision faithfully (options → outcome → consequences;
  supersession/dependency graph).
* **Generator** — `src/integrations/generate-odr-html.mjs`, an `astro:config:setup`
  integration. For each ODR: read MD, lift `status`/`date`/`kind` from frontmatter
  + the registry, inject a provenance header + `<h1>ODR-NNNN — Title</h1>` + meta
  pills, render the body with `marked` using a custom code-renderer that emits
  ` ```mermaid ` blocks as `<div class="mermaid">…</div>`, rewrite intra-ODR `.md`
  links via `ODR_LINK_MAP`, and write `src/generated/odr/ODR-NNNN.html`.
* **Serving** — `src/pages/modelling/odr/[id].astro` `getStaticPaths` now covers
  **all** ODRs (every ODR has a generated fragment), read via `set:html`. The
  listing links all ODRs; an "enriched" indicator may flag which carry diagrams.
* **Gitignore** — `src/generated/` is already gitignored; the two committed pilot
  artefacts under `docs/ontology/odr/_html/` are removed from git (their diagrams
  are back-ported into ODR-0001/0005 markdown).

### Consequences

* Good, because the canonical ODR markdown is self-contained and richer — the diagrams are in the record, visible in the git diff and to anyone reading the `.md`.
* Good, because there is no committed derived artefact to drift; the build regenerates HTML from the one source.
* Good, because ODR pages reuse the existing `client.js` Mermaid render path and inherit ADR-0022 clickable + lightbox behaviour with no new machinery.
* Good, because turning the generator on makes all 18 ODRs live pages immediately (rendered from MD); diagram enrichment is then purely additive.
* Bad, because it relaxes strict ODR immutability to admit illustrative diagrams. Mitigation: the narrow non-substantive boundary above; substantive change still needs a superseding ODR.
* Bad, because the enrichment is one-time authoring effort (16 remaining ODRs × 2–4 diagrams). Mitigation: one agent per ODR via the `/diagramming` skill.
* Neutral, because it discards ADR-0023's "frozen committed artefact in git" property — the markdown is now the frozen, diffable record instead.

### Confirmation

1. Each ODR's diagrams live in its `docs/ontology/odr/ODR-NNNN-*.md` (not in HTML); `grep -l mermaid` over the corpus matches the enriched set.
2. No generated ODR HTML is committed (`src/generated/` is gitignored; `docs/ontology/odr/_html/` no longer tracked).
3. `/modelling/odr/<id>` renders for every ODR, with its Mermaid diagrams rendering client-side (clickable + lightbox where ADR-0022 applies).
4. A clean build regenerates every fragment from markdown; no manual step.
5. Enrichment diagrams are faithful to the existing record (no new claims) — the non-substantive boundary holds.

## More Information

* **Supersedes:** [ADR-0023](./ADR-0023-build-time-odr-html-immutable-enriched.md) — moves enrichment from a committed frozen HTML artefact to the canonical markdown, and the refresh policy from freeze-forever to regenerate-every-build.
* **Reuses:** the ADR-0021 report-generator pattern (`marked` + `astro:config:setup` + `set:html`) and the ADR-0022 clickable/lightbox `client.js` render path.
* **Site integration anchor:** [ADR-0015](./ADR-0015-integrate-manual-into-astro-site.md).
* **Immutability basis:** [ODR-0001](../ontology/odr/ODR-0001-linked-data-council-methodology.md) §Immutability — self-amendment is a new ODR; this ADR scopes a non-substantive illustrative-enrichment carve-out.
* **Enrichment tool:** the `/diagramming` skill — Cagle palette, `accTitle`/`accDescr`, validated Mermaid.
