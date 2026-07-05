---
status: accepted
date: 2026-07-06
tags: [information-architecture, rml, mapping, ontology, schema, jena, sparql, data-browser]
supersedes: []
depends-on: [ADR-0059, ADR-0057, ADR-0037, ODR-0035]
implements: []
---

# TriplesMap Reference Page — Bidirectional JSON Schema ↔ Ontology Resource Browsing

## Context and Problem Statement

[ADR-0059](./ADR-0059-rml-mapping-section-positioned-between-ontology-and-schema.md)
gave the RML mapping a website presence (`/mapping`), but at the level of
aggregate counts and prose (158 `rr:TriplesMap` rules, a coverage
percentage, the engineering approach). It does not let a reader inspect
the actual rules, nor browse the correspondence in either direction —
"what does this ontology term map to in the schema" or "what does this
schema path map to in the ontology" both require opening
`mapping/opda-pdtf.rml.ttl` directly (3,314 lines) and reading Turtle.

This ADR records the design for a **TriplesMap reference page** that
documents the 158 rules themselves and exposes the bidirectional
correspondence as two browsable indices, plus the concrete data-extraction
approach and a real data-quality finding surfaced while building it.

**A data-quality finding that shapes the design:** the mapping file
contains 526 total `rr:predicateObjectMap` triples, but only 438 of them
belong to subjects actually asserted `a rr:TriplesMap` — the remaining 88
are nested inside 31 `fnml:functionValue` blocks (the FNML function-call
pattern ADR-0057 documents for enum→SKOS slugification and date
truncation). These 88 bind a function's name and parameters, not a
JSON-Schema↔ontology correspondence, and must not be counted as
mapping rules. The live count on the existing `/mapping` overview page
(added under ADR-0059) currently reports a flat "526 predicateObjectMap
entries," which conflates the two — this ADR also corrects that.

## Decision Drivers

* Toolchain purity: RDF parsing must go through Apache Jena
  (`arq`/`riot`), never `rdflib` or `pyshacl`, per
  [ADR-0037](./ADR-0037-apache-jena-sole-rdf-shacl-sparql-toolchain.md) —
  this is binding even though the pre-existing
  `harness/build_provenance_index.py` (which builds the *other* tracked
  index, `provenance-index.json`) itself uses `rdflib` directly, a
  pre-existing inconsistency this ADR does not fix but also must not
  repeat.
* Never wire a live build-time Astro read to a gitignored path — the
  `source/03-standards/rml/build/` directory is `.gitignore`d harness
  output (established the hard way in ADR-0059's own drafting); any new
  generated artefact this feature needs must be committed to git, not
  left to regenerate silently missing in CI.
* Reuse over reinvent: the site already has a proven, generic client-side
  table component (`OPDA.DataBrowser`, `public/ui/data-browser.js`) doing
  search/facet/sort/paginate at data-dictionary's 8,458-row scale — a new
  bespoke table widget would be unjustified duplication.
* Honesty about what a number counts — the FNML-vs-real-TriplesMap
  distinction above must be visible in the new content, not smoothed over.

## Considered Options

* **Option A (chosen) — One new page, `/mapping/triplesmaps`, with three
  views over one committed, Jena-arq-generated JSON index**: a static,
  M-section-grouped reference of all 158 TriplesMaps (the primary
  "document the triplesmaps" ask), plus two `OPDA.DataBrowser`-powered
  flat indices — by ontology resource and by JSON Schema path — giving
  both directions of lookup.
* **Option B — Three separate pages** (`/mapping/triplesmaps`,
  `/mapping/by-resource`, `/mapping/by-schema-path`). Rejected: the three
  views share one dataset and one sidebar group ("The RML mapping",
  currently 3 items); a 4th nav entry fits that group's shape better than
  6, and the existing `/ontology`/`/schema`/`/modelling` pages already
  establish the convention of one page with multiple `<h2>` sections and
  an "On this page" TOC for related content at this scale.
* **Option C — Parse the raw `.rml.ttl` text directly in Astro
  frontmatter (regex over the file), no generated JSON artefact.**
  Rejected: 158 nested Turtle blocks with bracket/quote-containing
  JSONPath filters (e.g. `[?(@.role=="Buyer")]`) are not reliably
  regex-parseable; a real RDF parse (Jena) is required for correctness,
  and Astro frontmatter is the wrong place to shell out to a JVM on every
  dev-server request — the extraction belongs in a committed, versioned
  artefact regenerated deliberately, matching every other generated
  dataset in this codebase (`ontology-model.json`, `provenance-index.json`,
  the ADR/ODR registries).
* **Option D — Use `rdflib` for the new extractor, matching
  `build_provenance_index.py`'s existing (if non-compliant) precedent.**
  Rejected: that script's `rdflib` usage is itself a pre-existing
  violation of ADR-0037, not a sanctioned pattern to extend. The
  authoritative precedent is the ADR plus the *other* three harness
  scripts (`jena_query.py`, `validate_provenance.py`, `audit_dct_source.py`)
  that already comply — confirmed directly via a live SPARQL probe that
  Jena `arq` extracts every field needed (iterator, subject template,
  asserted class, predicate, reference/template/constant) without
  rdflib.

## Decision Outcome

Chosen option: "One new page, three views, one Jena-arq-generated
committed index" (Option A), because it satisfies both parts of the
request (document the rules; browse both directions) without
fragmenting navigation, reuses proven components/toolchain rather than
inventing new ones, and corrects a real, verified data-conflation issue
found while designing it.

**New generated artefact** — `source/03-standards/rml/harness/build_triplesmap_index.py`:
* Uses the same Jena `arq` subprocess pattern as `harness/jena_query.py`
  (`sparql_select()`), querying `mapping/opda-pdtf.rml.ttl` for every
  `rr:TriplesMap`'s `rml:iterator`, `rr:subjectMap` template and asserted
  `rr:class`(es), and every `rr:predicateObjectMap` whose owning subject
  is itself asserted `a rr:TriplesMap` (excluding the 88 FNML-internal
  ones) — `rr:predicate` plus `rml:reference` / `rr:template` /
  `rr:constant` on the object map.
* A separate, lightweight **text scan** (not an RDF parse — Turtle
  comments are invisible to any RDF parser, so this is necessarily
  string-based) attaches each TriplesMap's nearest preceding `# M<N>`
  section-comment label, verified against the file's actual structure
  (every `<#Name> a rr:TriplesMap` line is preceded by exactly one such
  banner, confirmed by direct inspection of the M1/M2 regions).
* FNML call sites (31, accounting for the 88 excluded predicateObjectMaps)
  are counted and recorded separately, not folded into the main rows.
* Output: `source/03-standards/rml/triplesmap-index.json` — **committed**
  to git (sibling to the already-tracked `provenance-index.json`, not
  under the gitignored `build/`). A new `make triplesmap-index` target
  regenerates it.

**New page** — `src/pages/mapping/triplesmaps.astro`, added as the 2nd
item (after "How it works") in the existing "The RML mapping" sidebar
group in `src/lib/site.ts`:
1. **By TriplesMap** (primary reference, static/server-rendered) — all
   158 rules grouped by M-section, each showing its iterator, asserted
   class(es), and predicate→JSON-path rows. A callout states the
   438-vs-526 distinction and the 31 FNML call sites plainly, rather than
   a bare aggregate count.
2. **By ontology resource** (`OPDA.DataBrowser`) — one row per distinct
   class/property touched, with its kind, the TriplesMap(s) asserting or
   populating it, and the JSON path(s) reached.
3. **By JSON Schema path** (`OPDA.DataBrowser`) — one row per distinct
   JSON path referenced, with the TriplesMap(s) and ontology term(s) it
   feeds.

Both derived indices (2 and 3) are computed from the one committed JSON
in Astro frontmatter at build time (plain array grouping, no new
generator logic needed) — the generated artefact stays minimal and
canonical; the two "views" are pure, deterministic projections.

**Correction to the existing `/mapping` overview** — its stat table's
flat "526 `rr:predicateObjectMap` entries" row is split into the
438-real / 88-FNML breakdown, with a link into the new page.

### Consequences

* Good, because a reader can now inspect any of the 158 rules directly,
  and look up the mapping correspondence starting from either side
  (an ontology term or a schema path) without opening the raw Turtle file.
* Good, because the FNML/real-TriplesMap conflation is caught and
  corrected before it propagates into more pages, rather than being
  silently repeated.
* Good, because the new extractor stays within the binding Jena-only
  toolchain rule, rather than extending the one non-compliant precedent
  already in the codebase.
* Bad, because this adds a second generated, committed JSON artefact
  under `source/03-standards/rml/` (alongside `provenance-index.json`)
  that a future contributor must remember to regenerate
  (`make triplesmap-index`) after editing the mapping file — no
  drift-check CI gate is added for it in this pass (scope-limited to
  documentation, matching `provenance-index.json`'s own un-gated
  precedent).
* Neutral, because the M-section label attachment is a text-scan
  convenience layer, not part of the RDF graph — it is documentary only,
  same status as the mapping file's own inline comments.

### Confirmation

* `make triplesmap-index` regenerates `triplesmap-index.json` from the
  current mapping file; the JSON's own `generated_from.sha256` pins the
  source file's hash, mirroring `provenance-index.json`'s existing
  convention.
* `make build-data` succeeds with the new `/mapping/triplesmaps` route;
  `make test` stays green.
* The rendered page shows all 158 TriplesMaps grouped by M-section, and
  both `OPDA.DataBrowser` instances load, search, and paginate correctly.
* `/mapping`'s stat table shows the 438/88 breakdown, not a bare 526.

## More Information

* [ADR-0059](./ADR-0059-rml-mapping-section-positioned-between-ontology-and-schema.md) —
  the parent decision this page extends (the `/mapping` section itself).
* [ADR-0057](./ADR-0057-rml-mapping-implementation.md) — the RML
  mapping's own engineering record, including the FNML function-value
  pattern this ADR's extractor must exclude from its primary rule count.
* [ADR-0037](./ADR-0037-apache-jena-sole-rdf-shacl-sparql-toolchain.md) —
  the binding Jena-only toolchain rule this ADR's extractor follows (and
  `harness/build_provenance_index.py` does not — a pre-existing gap noted
  here, not remediated by this ADR).
* [ODR-0035](../ontology/odr/ODR-0035-rml-schema-provenance-verification.md) —
  the policy decision establishing RML as the bidirectional trace this
  page makes browsable.
* `public/ui/data-browser.js` — the reused table component, already
  proven at 8,458-row scale on `/modelling/data-dictionary`.
