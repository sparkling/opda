# ODR 0002 — Ontology Languages and Vocabularies Adopted

- **Status:** Proposed (pending Council Session — see [ODR-0001](./0001-linked-data-council-methodology.md))
- **Date:** 2026-05-20
- **Deciders:** OPDA semantic-modelling lead
- **Consulted:** H&M ontology programme (vocabulary survey of `~/source/hm/semantic-modelling/src/`)
- **Informed:** OPDA Classification & Reference WG, Data Quality WG, Trust Framework WG
- **Related:** ODR-0001 (Council methodology), ADR-0001 (DCAM/DMBOK adoption)

## Context

OPDA's linked-data work needs a declared, bounded set of ontology languages and vocabularies. Without a published list, modellers will reach for whatever they know — leading to redundant terms (multiple "title" properties, multiple ways to record provenance), unprincipled mixing of W3C Recommendations with community drafts, and the slow accumulation of an unreviewable surface area.

The H&M semantic-modelling programme (`~/source/hm/semantic-modelling`) has spent two years pressure-testing this exact question across ~90 ODRs and ~250 Council sessions. A survey of every `@prefix` declaration in its `src/` ontology (~90 `.ttl` files) identifies **18 external standard vocabularies** actually in use, plus internal sub-namespaces (`hm:*`, `pf:*`, `sds:*`) that have no equivalent in OPDA.

This ODR proposes adopting the same baseline catalogue, with explicit per-vocabulary status, so future modelling decisions reference a closed and reviewed set rather than an open field. **The list is not novel** — every vocabulary here is a W3C Recommendation, a maintained community standard, or a research community ontology with broad linked-data uptake. The novelty is the OPDA-specific scoping (which we adopt, with what conditions, in which OPDA layer).

## Decision

Adopt the catalogue below in three tiers — **Core**, **Conditional**, **Defer** — pending Council ratification. Each row records the canonical URI, the role in the OPDA ontology, and the immediate dependency or constraint.

### Core — adopt unconditionally

The RDF stack and the small set of vocabularies that every OPDA linked-data file is expected to use.

| Vocabulary | Prefix | Canonical URI | Role |
|---|---|---|---|
| **RDF 1.1** (target: RDF 1.2 when adopted by tools) | `rdf` | `http://www.w3.org/1999/02/22-rdf-syntax-ns#` | Foundation — triples, types, lists |
| **RDF Schema** | `rdfs` | `http://www.w3.org/2000/01/rdf-schema#` | Basic class/property hierarchy, labels, comments |
| **OWL 2** | `owl` | `http://www.w3.org/2002/07/owl#` | Formal class/property semantics, equivalence, restrictions |
| **XML Schema Datatypes** | `xsd` | `http://www.w3.org/2001/XMLSchema#` | Literal datatypes (string, date, integer, etc.) |
| **SHACL** | `sh` | `http://www.w3.org/ns/shacl#` | Validation shapes — the contract between the ontology and consuming applications |
| **SKOS** | `skos` | `http://www.w3.org/2004/02/skos/core#` | Concept schemes, taxonomies, controlled vocabularies (e.g. property-type lists, classification facets) |
| **Dublin Core Terms** | `dct` | `http://purl.org/dc/terms/` | Administrative metadata (`title`, `creator`, `issued`, `modified`, `identifier`). The hidden lingua franca of every other vocabulary listed below — adoption merely formalises what is already implicit |
| **VANN** | `vann` | `http://purl.org/vocab/vann/` | Vocabulary annotation — `vann:preferredNamespacePrefix`, `vann:preferredNamespaceUri` on `owl:Ontology` headers |

### Conditional — adopt where the use case is present

These are admitted into the OPDA ontology only in the layers/files where the corresponding modelling concern arises. Outside those layers they are not used (SHACL gates will be added to enforce this in due course — see H&M ADR-0147 R12 for the pattern).

| Vocabulary | Prefix | Canonical URI | Adopt for | Notes |
|---|---|---|---|---|
| **DASH** | `dash` | `http://datashapes.org/dash#` | UI/display hints on SHACL shapes (`dash:propertyRole`, `dash:viewer`, `dash:labelProperty`) | TopQuadrant-maintained. Required only on shapes that drive form generation |
| **PROV-O** | `prov` | `http://www.w3.org/ns/prov#` | Provenance — who, when, by what process a triple or dataset was produced | Pattern: canonical URIs + local SHACL, no `owl:imports` |
| **DCAT 3** | `dcat` | `http://www.w3.org/ns/dcat#` | Dataset catalogue records (OPDA-published datasets, PDTF reference data) | W3C Rec. Built on `dct:*`, so depends on the Dublin Core core adoption above |
| **OWL-Time** | `time` | `http://www.w3.org/2006/time#` | Temporal modelling — Instant, Interval, durations | W3C Rec 2020. Use only where bitemporal or interval semantics genuinely needed |
| **DPV** (+ `dpv-gdpr`, `dpv-pd`, `dpv-legal`) | `dpv`, `dpv-gdpr`, `dpv-pd`, `dpv-legal` | `https://w3id.org/dpv#`, `https://w3id.org/dpv/legal/eu/gdpr#`, `https://w3id.org/dpv/pd#`, `https://w3id.org/dpv/legal#` | Data-privacy classification — personal-data flags, processing purposes, lawful basis, regulatory tagging | Directly relevant to property data carrying buyer/seller/agent personal data |
| **ODRL** | `odrl` | `http://www.w3.org/ns/odrl/2/` | Machine-readable consent and data-licensing policies | Restrict to layers concerned with access-control / data-rights expression; **not** for governance-process modelling (H&M defers this to Cat 11 — same restriction applies here) |
| **SSSOM** | `sssom` | `https://w3id.org/sssom/` | Mapping metadata (mapping justification, confidence, mapping author) on cross-vocabulary mappings | Pair with `semapv:` for the process side |
| **SEMAPV** | `semapv` | `https://w3id.org/semapv/vocab/` | Mapping-process vocabulary (manual, lexical-match, logical-reasoning, etc.) | Used inside SSSOM mapping records |
| **BBO (BPMN-Based Ontology)** | `bbo` | `https://www.irit.fr/recherches/MELODI/ontologies/BBO#` | Process modelling — if and when OPDA expresses property-transaction workflows as linked data | Defer until a concrete workflow-publishing use case materialises |
| **ArchiMate 3.2 (Motivation + Strategy + Application layers)** | `archimate` | (local OPDA namespace `https://opda.uk/ns/archimate/`) | Capability/intent and service-architecture modelling | Per H&M ONT-0071c/d: local namespace, ArchiMate fidelity preserved. Defer until concrete capability or service-catalogue use case materialises |

### Defer — reviewed and not adopted (yet)

Listed explicitly so that future modellers know the question has been asked and the answer was "not now."

| Vocabulary | Prefix | Why deferred | Revisit when |
|---|---|---|---|
| **schema.org** | `schema` | Overlaps SKOS, Dublin Core, DCAT in confusing ways; no benefit inside the ontology core. H&M Council Session 371 deferred adoption (1-3-5 vote) | A concrete open-web publication use case materialises (e.g. JSON-LD embedding for SEO of OPDA documents). Even then, scope to publication outputs, not the ontology source |
| **DCAT-AP / DCAT-AP EU** | `dcatap` | Adds EU-government catalogue profile constraints that may not match OPDA's UK-property-data scope. H&M S371 deferred (3-3-3 deadlock) | OPDA actually needs to publish to data.europa.eu or a UK government open-data portal that requires it |
| **FIBO** | `fibo` | Financial Industry Business Ontology — large surface area; not used in H&M `src/`. Property-transaction finance touches FIBO but PDTF v2 does not depend on it | A property-transaction-finance modelling task arises that would otherwise require reinventing FIBO concepts |
| **SOSA/SSN, QUDT, GeoSPARQL** | (various) | Sensor, units-of-measurement, and geospatial vocabularies. Not in H&M `src/`. Plausibly relevant to OPDA (energy-performance sensors, EPC ratings with units, property-location geometry) but no current consumer | A pipeline producing the corresponding data starts (e.g. EPC/MEES ingestion, plot-boundary linked data) |
| **FOAF** | `foaf` | Person/Agent modelling — superseded by `prov:Agent` + Dublin Core for our purposes. Not in H&M `src/` | Never, probably — `prov:Agent` covers the need |

## Options rejected

- **"Use whatever vocabulary fits the modeller's preference"** — produces redundant terms and unreviewable surface area within a year.
- **"Adopt every vocabulary in active linked-data community use"** — surface area becomes a multi-person-year mapping problem with no business return.
- **"Reinvent the necessary terms under an `opda:` namespace"** — discards two decades of W3C linked-data work and isolates OPDA outputs from external consumers.

## Rationale

- **Survey-grounded, not aspirational.** Every Core and Conditional entry is in active use in a comparable enterprise ontology programme today.
- **Closed set, by design.** A bounded, listed catalogue is reviewable. New vocabulary admissions require a new ODR, surfacing the addition for Council review rather than letting it accrete silently.
- **Pattern: canonical URIs + local SHACL + no `owl:imports`.** Inherited from H&M ONT-0071c/i/j/ONT-0086. Avoids transitive import burdens (especially DPV's large surface and FIBO's many TTL files) while preserving canonical URIs that external consumers can dereference.
- **Three-tier framing forces honest scoping.** Core / Conditional / Defer makes it unambiguous which vocabularies a given OPDA file may use, and documents the reasoning for the negative cases as durably as for the positive ones.

## Consequences

### Good

- Modellers have a published shortlist to draw from — no debate per file.
- External consumers of OPDA's linked data see standard, dereferenceable URIs throughout.
- The Defer column documents non-adoption, preventing the recurring "why don't we use schema.org?" question.
- The catalogue is small enough (8 Core + 10 Conditional) for newcomers to learn in one sitting.

### Bad

- Conditional-tier gating requires SHACL enforcement to be meaningful — until those gates are written, "conditional" is honour-system.
- Pinning to DPV / DCAT 3 / DASH versions is implicit; semver-style version pinning will need its own follow-up ODR if any of these have breaking changes.
- A vocabulary good for OPDA but absent from H&M (a candidate: a property-data-specific community vocabulary like the PDTF JSON Schema's eventual RDF expression) will trip the "no precedent" reflex unless we keep the catalogue alive.

### Neutral

- The Defer column will need re-review on a schedule (suggest annual, or whenever a triggering use case arises).
- ArchiMate and BBO sit in the Conditional tier *and* the H&M `src/` survey — they are imported here for completeness, not because OPDA has an immediate process- or capability-modelling task. They can be quietly demoted to Defer at the first Council review if no use case has materialised.

## Adoption pattern (applies to every Conditional entry)

1. **Canonical URI** — use the vocabulary's published namespace, not a local re-mint.
2. **Local SHACL enforcement** — write SHACL shapes in the relevant OPDA layer/file that constrain usage (cardinality, datatype, severity).
3. **No `owl:imports`** — reference by URI only; let external consumers fetch the upstream ontology themselves.
4. **`vann:` header on every `owl:Ontology`** — declare the preferred prefix so dereferencers can render snippets consistently.
5. **Recorded provenance** — when an external vocabulary appears in a new layer for the first time, the introducing commit or ODR cites the use case.

## Verification

- [ ] Core tier lists 8 vocabularies with canonical URIs
- [ ] Conditional tier records adoption scope + notes for each entry
- [ ] Defer tier records reason + revisit trigger for each entry
- [ ] Adoption pattern (canonical URI + local SHACL + no `owl:imports`) documented
- [ ] Follow-up: Council session convened to ratify or amend the tiering
- [ ] Follow-up: SHACL gates for Conditional-tier scope (mirroring H&M ADR-0147 R12) tracked in `docs/governance/deferred-work` until written
