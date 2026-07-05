---
status: accepted
date: 2026-07-05
tags: [information-architecture, navigation, rml, mapping, ontology, schema, astro]
supersedes: []
depends-on: [ADR-0041, ADR-0057, ODR-0035]
implements: []
---

# RML Mapping Section — Positioned Between Ontology and Schema

## Context and Problem Statement

The RML mapping — adopted as OPDA's independent, bidirectional schema-provenance
verification mechanism by [ODR-0035](../ontology/odr/ODR-0035-rml-schema-provenance-verification.md)
and engineered in [ADR-0057](./ADR-0057-rml-mapping-implementation.md) — is now
substantively complete: 466 of 469 domain-module ontology resources are mapped to
their PDTF v3 JSON Schema origin or removed for cause, and the 3 remaining are
upper-ontology structural connectives exempt by standing rule, not open content
gaps (`source/03-standards/rml/build/final-gap.json`). Despite this maturity, the
mapping has **no reader-facing presence anywhere on the website** — it exists only
as engineering prose in ADR-0057 (a long, still-being-amended changelog) and as
files under `source/03-standards/rml/`. A visitor exploring `/ontology` (the
generated ontology reference, ADR-0041) or `/schema` (the JSON Schema narrative)
has no way to discover that a machine-verified traceability layer connects the two.

Operator direction: add a new global-nav section, `mapping`, positioned between
`ontology` and `schema` in `HEADER_ORDER`, to document the RML mapping and
cross-link it to both neighbours.

A second problem this ADR must resolve: `/modelling/jsonld-mappings` already
exists as a stub page about a **different, unrelated** mapping mechanism —
per-overlay JSON-LD `@context` files for production data interop (BASPI v5
round-tripping). Both mechanisms map JSON to RDF in some sense, so the new
section must disambiguate clearly or readers will conflate a 99.4%-complete
documentation/verification artefact with an unstarted production-tooling stub.

## Decision Drivers

* Follow the established audience/purpose-differentiated section pattern
  ([ADR-0041](./ADR-0041-ontology-reference-document-generation.md) §Hosting:
  `/modelling` = process, `/model` = tiered presentation, `/ontology` = generated
  authoritative reference) rather than merging into an existing section.
* Cross-section redundancy is accepted practice here (ADR-0041 amendment rev-3,
  M1 — "I don't care about creating redundancy... consider standalone") — the
  new section does not need to eliminate all overlap with
  `/modelling/jsonld-mappings`, but MUST disambiguate purpose so readers are not
  confused between the two.
* Match the site's anti-drift convention of computing headline counts at build
  time from committed source-of-truth artefacts (as `/ontology` already does
  from the TTL corpus) rather than hardcoding prose figures that can silently go
  stale — ADR-0057 itself documents two prior mapping-status documents
  (`gap-register.md`, `ONTOLOGY-COVERAGE.md`) going stale as point-in-time
  snapshots.
* Minimise blast radius: a pure nav/content addition; no change to the RML
  mapping's own engineering, files, or validation harness.

## Considered Options

* **Option A (chosen) — New standalone `/mapping` top-level section**,
  positioned between `/ontology` and `/schema` in `HEADER_ORDER`, hosting a
  small hybrid generated+hand-authored reference to the RML mapping, with an
  explicit "see also" disambiguation from `/modelling/jsonld-mappings` and
  reciprocal cross-links to/from `/ontology` and `/schema`.
* **Option B — Fold RML-mapping documentation into the existing
  `/modelling/jsonld-mappings` stub page.** Rejected: conflates two
  structurally different mechanisms under one URL — RML is internal
  documentation/verification, explicitly barred from being treated as
  executable ETL (ODR-0035 §Rules); JSON-LD `@context` authoring is external
  production tooling, still entirely unbuilt ("Stub" status). Nesting a
  99.4%-complete artefact inside a page labelled "Stub" would misrepresent both.
* **Option C — Add RML-mapping content as new subpages under the existing
  `/ontology` section** (e.g. `/ontology/mapping`). Rejected: `/ontology`'s
  scope (ADR-0041) is the ontology reference itself, generated from
  `opda-merged.ttl` — classes, properties, shapes, vocabularies. The RML
  mapping is a distinct artefact (its own file, its own RMLMapper/Jena
  validation harness, a different W3C standard) that traces *between*
  `/ontology` and `/schema`; filing it under one endpoint would misrepresent
  the bidirectional bridging role the requested nav position makes explicit.
* **Option D — Document only in `docs/adr` (ADR-0057), with no website
  presence.** Rejected: ADR-0057 is a dense, still-actively-amended engineering
  changelog, not reader-oriented documentation, and the operator explicitly
  asked for a website section.

## Decision Outcome

Chosen option: "New standalone `/mapping` section" (Option A), because it is
the only option that gives the RML mapping a discoverable, reader-oriented home
matching its actual maturity, without misrepresenting it by nesting it inside
an unrelated stub or inside the ontology's own single-artefact scope.

**Nav position** — `src/lib/site.ts`: insert `'mapping'` into `HEADER_ORDER`
between `'ontology'` and `'schema'`:

```
[..., 'model', 'ontology', 'mapping', 'schema', 'implementation', ...]
```

and add a `mapping` entry to `SECTIONS` with `title: 'Mapping'`.

**Page structure** — four pages, proportionate to the mapping's scope (one RML
file, one validation harness, ~469 tracked resources) rather than the much
larger `/ontology`/`/schema` sections:

1. `/mapping` (section overview) — what the RML mapping is and why it exists
   (the ODR-0035 framing: a second, independent, bidirectional check that
   `dct:source`'s single-valued citation structurally cannot provide), a
   structural-stats table computed live at build time from the tracked
   `mapping/opda-pdtf.rml.ttl` (`rr:TriplesMap`/`rr:predicateObjectMap` counts —
   mirroring `/ontology`'s "live headline counts" convention, which only works
   because it reads *committed* TTL), plus the 466/469 (99.4%) resource-coverage
   figure cited as a **dated snapshot** from
   `source/03-standards/rml/build/final-gap.json` with its regeneration command
   shown (`make provenance-test` / `python3 build/final_scope2.py`) — that file
   is gitignored harness build output, not part of the Astro build, so it
   cannot safely be read live at site-build time (confirmed: `build/` is
   `.gitignore`d in `source/03-standards/rml/` and nothing in the site's build
   pipeline regenerates it; a live read would silently show zeros in CI). A
   "See also" callout disambiguates from `/modelling/jsonld-mappings`, and a
   card grid leads into the rest of the section.
2. `/mapping/how-it-works` — the engineering: RMLMapper + Jena `arq`/`shacl`
   (toolchain purity per ADR-0037), the two validation gates (`provenance-test`
   primary / `dct-audit` cross-check) plus the secondary
   instance-materialisation harness, and the enum→SKOS-concept-IRI techniques
   (per-value `TriplesMap` + JSONPath filter; FNML function for single-object
   contexts) — with a short "field notes" list of the sharpest engineering
   gotchas from ADR-0057's amendments (RMLMapper's Cartesian-product trap on
   multi-placeholder `TriplesMap`s; the required `[*]` on JSONPath array
   traversal), cited back to ADR-0057 rather than reproduced in full.
3. `/mapping/coverage` — the coverage/gaps register: the live count in detail
   (total/mapped/gap breakdown from `final-gap.json`), the layer-1/layer-2/GAP
   vocabulary (`CONTRACT.md`), and the illustrative "honest non-mapping" cases
   (`priceInformation.price`, broadband `supplier`) that show the discipline of
   not force-binding a plausible-looking predicate.
4. `/mapping/validate` — how to reproduce it locally: the `make` targets
   (`provenance-test`, `dct-audit`, `rml-test`, `rml-pytest`), the file layout
   (`mapping/opda-pdtf.rml.ttl`, `mapping/functions/`, `harness/*`,
   `testdata/*`, `build/*`), with `resource-link`s into the real files
   (matching `/schema`'s existing `resource.html?path=...` convention).

**Cross-links** — `/ontology/index.astro` gains a card in its existing
"OPDA-specific layers" grid; `/schema/index.astro` gains a card in its existing
"Cross-cutting" grid; both point at `/mapping`. `/mapping`'s own overview links
back out to `/ontology` and `/schema` in its opening prose, and its "See also"
callout also links to `/modelling/jsonld-mappings` (which gains one reciprocal
sentence, not a restructure) for disambiguation.

### Consequences

* Good, because readers exploring `/ontology` or `/schema` now have a
  discoverable path to the verification layer connecting them, matching the
  artefact's actual, substantive completion (466/469, 99.4%).
* Good, because structural mapping-file stats (`TriplesMap`/`predicateObjectMap`
  counts) are read live from the tracked `.rml.ttl` at build time, and the
  headline coverage figure is cited with its exact source file and
  regeneration command rather than a bare hardcoded number — a reader can
  verify or refresh it themselves, and it is dated rather than presented as
  silently always-current the way `gap-register.md`/`ONTOLOGY-COVERAGE.md`
  misleadingly were (per ADR-0057, both now carry superseded-notices).
* Good, because the explicit "See also" disambiguation prevents the RML
  mapping being confused with the unrelated, unstarted JSON-LD `@context`
  workstream.
* Bad, because this adds a fourth mapping-adjacent surface alongside
  `/modelling/ontology`, `/modelling/jsonld-mappings`, and
  `/model/physical-ontology` — a small increase in cross-section redundancy,
  accepted per the ADR-0041 M1 precedent.
* Neutral, because the section documents exactly one artefact (the RML
  mapping) narrowly; it is not a general "how everything maps" hub, and does
  not attempt to absorb or redirect the JSON-LD workstream.

### Confirmation

* `make build` succeeds with the new `/mapping` routes; `make test` stays
  green.
* The rendered header shows "Mapping" between "Ontology" and "Schema".
* `/mapping`'s structural stats (TriplesMap/predicateObjectMap counts) are
  computed live from the tracked `mapping/opda-pdtf.rml.ttl` at build time;
  the 466/469 (99.4%) coverage figure is cited as a dated snapshot of
  `source/03-standards/rml/build/final-gap.json` (gitignored harness output,
  not build-time-readable in CI) with its regeneration command shown.
* `/ontology` and `/schema` each carry a working link into `/mapping`;
  `/mapping`'s pages link back to both, plus the disambiguating link to
  `/modelling/jsonld-mappings`.

## More Information

* [ADR-0041](./ADR-0041-ontology-reference-document-generation.md) — the
  parent IA decision (`/modelling`/`/model`/`/ontology` audience-purpose
  split; the "redundancy accepted" precedent this ADR extends to a fourth
  section).
* [ADR-0057](./ADR-0057-rml-mapping-implementation.md) — the RML mapping's own
  engineering record (engine, validation harness, file layout); this ADR's
  `/mapping/how-it-works` and `/mapping/coverage` pages summarise it for a
  reader audience.
* [ODR-0035](../ontology/odr/ODR-0035-rml-schema-provenance-verification.md) —
  the policy decision this ADR gives a website presence to (RML as a second,
  independent, bidirectional provenance check alongside `dct:source`).
* [ADR-0002](./ADR-0002-folder-hierarchy-and-slug-taxonomy.md) — the slug
  taxonomy the new `/mapping/*` routes follow.
