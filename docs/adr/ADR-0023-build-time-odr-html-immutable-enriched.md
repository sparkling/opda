---
status: proposed
date: 2026-05-29
tags: [website, odr, documentation, immutable, mermaid, diagramming, build-pipeline]
supersedes: []
depends-on: [ADR-0015, ADR-0021]
implements: []
---

# Build-time ODR pages: convert markdown to enriched HTML once, freeze, and commit

## Context and Problem Statement

The ODR corpus (18 records at `docs/ontology/odr/ODR-*.md`) is the Linked Data
Council's deliberation audit trail — the *why* behind the ontology. The manual
and the IA-spec pages reference ODRs constantly (via `dct:source` URIs and
"Source ODR" links), but ODRs are **not served on the site**: those references
resolve to `.md` files that 404 (explicitly noted out-of-scope in
[ADR-0021](./ADR-0021-generate-manual-entity-pages-via-fuseki-grlc-sparql-api.md)).

We want ODRs on the site as rich HTML pages — converted from markdown **and
enriched with plenty of Mermaid diagrams** (authored via the `/diagramming`
skill) so each deliberation reads visually (the options considered, the chosen
outcome, the consequence/dependency graph) rather than as a wall of prose.

Two properties shape the decision:

1. **ODRs are immutable.** Per the Council methodology ([ODR-0001](../ontology/odr/ODR-0001-linked-data-council-methodology.md)), an accepted ODR never changes — a later decision *supersedes* it with a **new** ODR; the old record is frozen. There is nothing to regenerate.
2. **The enrichment is curated, not mechanical.** Good illustrative diagrams are *authored* (by the diagramming skill / an agent), not derived by a deterministic transform. Re-running a generator cannot reproduce them and would overwrite them.

So the regenerate-every-build model used for the manual's entity pages (ADR-0021)
and the report generator (ADR-0021 §"Separate tasks") is the wrong fit here:
nothing changes, and the value-add can't be re-derived. This ADR decides how ODR
pages are produced and maintained.

## Decision Drivers

* **Reachability.** ODRs must be live pages so the manual / IA references resolve (closes the ADR-0021 404 gap).
* **Immutability.** ODRs never change; once a page exists it never needs regenerating.
* **Curated enrichment.** The Mermaid diagrams are authored and must be preserved verbatim — never clobbered by a rebuild.
* **Build cost.** Re-converting + re-enriching 18 ODRs on every build is wasteful; freezing avoids it.
* **Provenance.** Committing the enriched HTML makes the artefact reviewable and diffable in git.

## Considered Options

* **A — Regenerate ODR HTML every build** (like ADR-0021 entity pages / the report generator). Rejected: ODRs are immutable (nothing to regenerate) and the authored diagrams are not mechanically reproducible — a regen would lose or overwrite them.
* **B — Convert + enrich once, commit the artefact, serve static, never regenerate (chosen).** For each ODR lacking a committed HTML artefact: convert MD→HTML, author Mermaid diagrams via the `/diagramming` skill, enrich, and **commit** the artefact. The Astro build serves committed artefacts; a presence guard skips any ODR that already has one (immutability ⇒ skip-on-exists).
* **C — Serve raw ODR markdown via a content collection** (like the manual). Rejected: no enrichment (rich diagrams are the whole point), and it couples immutable records to the live render path.
* **D — No ODR pages (status quo).** Rejected: the references 404.

## Decision Outcome

Chosen option: **B — produce once, freeze, commit, serve static.** Because ODRs are
immutable and their value-add is *curated* diagrams, the right model is
produce-once / freeze / commit / serve-static — not regenerate-every-build. A
one-time per-ODR pipeline (MD→HTML + `/diagramming` enrichment) emits an HTML
artefact that is **committed to git**; the Astro site serves it (via `set:html`,
the same serving pattern as the ADR-0021 report generator); a presence guard
ensures an enriched ODR is never regenerated — its committed artefact is
authoritative. This closes the ODR link-target gap and contrasts deliberately
with ADR-0021's regenerate-from-RDF model.

**The distinguishing axis is mutability.** ADR-0021 regenerates entity pages
every build because their source (the RDF) changes. ODR pages are frozen because
their source (an accepted deliberation) does not. Same site, opposite refresh
policy, by design.

### Implementation sketch

*Indicative; the implementing session owns the detail.*

* **Artefact store** — committed enriched HTML per ODR, e.g.
  `docs/ontology/odr/_html/ODR-NNNN.html` (or `src/content/odr/`), **tracked in
  git** (NOT gitignored — unlike `src/generated/`, these are frozen artefacts).
* **Production step (one-time per ODR; swarm-friendly — one agent per ODR)** — for
  each ODR without a committed artefact, an agent uses the `/diagramming` skill to
  (1) convert the ODR markdown to HTML, (2) author 2–N Mermaid diagrams
  illustrating the decision (options → chosen outcome → consequences; the
  dependency/supersession graph), (3) enrich and **commit** the artefact.
* **Astro route** — `/modelling/odr/<id>` (a new ODR sub-section in `site.ts`);
  `getStaticPaths` over the committed artefacts; serve via `set:html`; diagrams
  render through the existing `client.js` Mermaid loader (clickable per
  [ADR-0022](./ADR-0022-make-manual-diagram-elements-clickable.md) where applicable).
* **Build behaviour** — the build **serves** committed artefacts and does **not**
  convert/enrich; a guard skips ODRs that already have one. Optional CI assertion:
  the build does not modify any committed ODR artefact (a "frozen" / byte-identity
  check) and every ODR has an artefact (or is explicitly listed as pending).
* **Cross-links** — the manual / IA `dct:source` + "Source ODR" references now
  resolve to `/modelling/odr/<id>`.

### Consequences

* Good, because ODRs become reachable, rich, diagram-illustrated pages — closing the ADR-0021 404 gap.
* Good, because the curated enrichment is authored once and preserved (committed); zero rebuild cost and zero diagram loss.
* Good, because the freeze-and-serve model matches ODR immutability exactly.
* Good, because the committed artefacts are reviewable + diffable in git.
* Bad, because committing generated HTML is normally an anti-pattern. Mitigation: justified by immutability + curated-diagram preservation; a CI "frozen" check + clear provenance header in each artefact.
* Bad, because the one-time enrichment is real authoring effort (18 ODRs × several diagrams each). Mitigation: swarm it — one agent per ODR via the `/diagramming` skill.
* Bad, because a hypothetical ODR edit would leave its artefact stale. Mitigation: ODRs are immutable by governance (ODR-0001: amendment = a new ODR, never an edit); a supersession adds a new ODR + a new artefact, leaving the old frozen.
* Neutral, because the enriched HTML reuses the ADR-0021 report-generator serving pattern (`set:html`) and the existing Mermaid loader — no new render machinery.

### Confirmation

1. Each of the 18 ODRs has a committed enriched HTML artefact and a live `/modelling/odr/<id>` page.
2. ODR pages render their authored Mermaid diagrams client-side (and clickable where ADR-0022 applies).
3. The build serves committed artefacts; re-running the build does **not** modify them (frozen — CI byte-identity assertion over the ODR artefacts passes).
4. The production guard skips ODRs that already have an artefact — no regeneration.
5. Manual / IA ODR references (`dct:source`, "Source ODR") resolve with no 404s.

## More Information

* **Closes the gap from:** [ADR-0021](./ADR-0021-generate-manual-entity-pages-via-fuseki-grlc-sparql-api.md) §"Out of scope" (the manual's ODR `.md` links that currently 404) + reuses its report-generator `set:html` serving pattern.
* **Site integration anchor:** [ADR-0015](./ADR-0015-integrate-manual-into-astro-site.md) (navigation + `site.ts`).
* **Clickable diagrams:** [ADR-0022](./ADR-0022-make-manual-diagram-elements-clickable.md) — ODR diagrams inherit the clickable behaviour where nodes map to entity/ODR routes.
* **Enrichment tool:** the `/diagramming` skill (`~/.claude/skills/diagramming/SKILL.md`) — Cagle palette, `accTitle`/`accDescr`, validated Mermaid with `<details>` source preserved.
* **Immutability basis:** [ODR-0001](../ontology/odr/ODR-0001-linked-data-council-methodology.md) — self-amendment is a new ODR, never an edit; the corpus is append-only.
* **Source corpus:** `docs/ontology/odr/` — 18 ODR records.
* **Contrast:** ADR-0021 regenerates entity pages from RDF every build (mutable source); this ADR freezes ODR pages (immutable source). The refresh policy is the deliberate difference.
